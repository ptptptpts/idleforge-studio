import assert from 'node:assert/strict';
import {
  BigNum,
  PRESET_SCHEMAS,
  calcGeneratorCost,
  calcGeneratorUnitProd,
  calcMultiResourceFlows,
  evaluateROIList,
  runVarianceSimulation,
  computeStatMappings,
  generateEngineExportCode
} from '../src/core/engine.mjs';

console.log('Running Core Engine v2.0 Unit Tests...');

// 1. BigNum formatting test
const bnSmall = BigNum.fromNumber(15420);
assert.equal(bnSmall.format('StandardDouble'), '15.42K');
const bnHuge = new BigNum(4.25, 42);
assert.equal(bnHuge.format('BigDouble'), '4.25 × 10^42');

// 2. Dynamic Multi-Resource & Consumption Flow Test
const schema = structuredClone(PRESET_SCHEMAS.custom_4h_builder);
assert.equal(schema.targetPlaytimeHours, 4.0);
assert.equal(schema.resources.length, 3);
assert.equal(schema.generators.length, 5);

const flows = calcMultiResourceFlows(
  schema,
  { gen_miner: 5, gen_drill: 4, gen_turbine: 2, gen_smelter: 3, gen_citadel: 0 },
  1.0,
  { res_gold: 100, res_ore: 50, res_power: 50 }
);
assert.ok(flows.res_gold.grossProd > 0, 'Primary resource should have positive gross production');
assert.ok(flows.res_ore.totalCons > 0, 'Secondary resource (Mana Ore) should record per-second consumption');
assert.ok(flows.res_power.totalCons > 0, 'Third resource (Steam Power) should record per-second consumption');

// 3. Target Playtime (4 Hours = 240 min) Goal-Seek Simulation Test
const sim = runVarianceSimulation(schema, 240, 48);
assert.ok(sim.optimal && sim.normal && sim.random && sim.worst, 'All 4 policies must be simulated');
assert.ok(sim.targetRecommendation, 'Target playtime recommendation blueprint must be generated');
assert.equal(sim.targetRecommendation.targetPlaytimeHours, 4.0);
assert.equal(sim.targetRecommendation.checkpoints.length, 4);
assert.ok(sim.targetRecommendation.recommendedClearGoal > 1000, 'Recommended 4-hour clear goal should be computed');
assert.ok(
  sim.optimal.finalLifetime >= sim.normal.finalLifetime,
  `Optimal (${sim.optimal.finalLifetime}) should >= Normal (${sim.normal.finalLifetime})`
);
assert.ok(
  sim.normal.finalLifetime >= sim.worst.finalLifetime,
  `Normal (${sim.normal.finalLifetime}) should >= Worst (${sim.worst.finalLifetime})`
);

// 4. Adding a new upgrade dynamically and re-running simulation
schema.generators.push({
  id: 'gen_custom_6',
  name: 'Void Harvester (공허 수확기)',
  baseCost: 250000,
  costGrowth: 1.24,
  costResId: 'res_gold',
  prodResId: 'res_gold',
  baseProd: 9500,
  consResId: 'res_power',
  consPerSec: 6.0,
  softcapLevel: 40,
  softcapPenalty: 0.55,
  category: 'Custom'
});
const simAfterAdd = runVarianceSimulation(schema, 240, 48);
assert.equal(schema.generators.length, 6);
assert.ok(simAfterAdd.targetRecommendation.recommendedClearGoal > 0);

// 5. Code Exporter Test
const tsCode = generateEngineExportCode(schema, 'typescript');
assert.ok(tsCode.includes('export class HeadlessIdleEngine'));
assert.ok(tsCode.includes('getResourceNetSPS'));

console.log('ALL CORE ENGINE v2.0 TESTS PASSED (100%)!');
