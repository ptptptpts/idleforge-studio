import assert from 'node:assert/strict';
import {
  BigNum,
  PRESET_SCHEMAS,
  calcGeneratorCost,
  calcGeneratorUnitProd,
  calcPassiveSPS,
  calcActionBridgeExpectedSPS,
  evaluateROIList,
  runVarianceSimulation,
  computeStatMappings,
  generateEngineExportCode
} from '../src/core/engine.mjs';

console.log('Running Core Engine Unit Tests...');

// 1. BigNum formatting test
const bnSmall = BigNum.fromNumber(15420);
assert.equal(bnSmall.format('StandardDouble'), '15.42K');
assert.equal(bnSmall.format('BigDouble'), '15,420');
const bnHuge = new BigNum(4.25, 42);
assert.equal(bnHuge.format('BigDouble'), '4.25 × 10^42');

// 2. Generator cost & softcap formula test
const schema = structuredClone(PRESET_SCHEMAS.vampire_survivor);
const gen0 = schema.generators[0];
const cost0 = calcGeneratorCost(gen0, 0);
const cost10 = calcGeneratorCost(gen0, 10);
assert.equal(cost0, 15);
assert.ok(cost10 > cost0);

const prodBeforeCap = calcGeneratorUnitProd(gen0, 50, 1);
const prodAfterCap = calcGeneratorUnitProd(gen0, 80, 1);
assert.ok(prodAfterCap > prodBeforeCap, 'Production should still increase past softcap, but sub-linearly');

// 3. ROI & Payback calculation test
const roiList = evaluateROIList(schema, {
  currency: 500,
  levels: { gen_aura: 2, gen_orb: 1, gen_turret: 0, gen_scythe: 0, gen_altar: 0 },
  prestigeMult: 1.0
});
assert.equal(roiList.length, 5);
assert.ok(roiList.some(x => x.isBestAffordable), 'At least one affordable item should be flagged as best ROI');

// 4. 4-Policy Variance Simulation Ordering Test
const sim = runVarianceSimulation(schema, 120, 40);
assert.ok(sim.optimal && sim.normal && sim.random && sim.worst, 'All 4 policies must be simulated');
assert.ok(
  sim.optimal.finalLifetime >= sim.normal.finalLifetime,
  `Optimal (${sim.optimal.finalLifetime}) should >= Normal (${sim.normal.finalLifetime})`
);
assert.ok(
  sim.normal.finalLifetime >= sim.worst.finalLifetime,
  `Normal (${sim.normal.finalLifetime}) should >= Worst (${sim.worst.finalLifetime})`
);
assert.ok(
  sim.optimal.clearTimeMin <= sim.worst.clearTimeMin,
  `Optimal clear time (${sim.optimal.clearTimeMin}m) should be <= Worst clear time (${sim.worst.clearTimeMin}m)`
);

// 5. Stat Mapper & Code Exporter Test
const mappedStats = computeStatMappings(schema, {
  currency: 10000,
  lifetimeCurrency: 250000,
  levels: { gen_aura: 25, gen_orb: 15, gen_turret: 5, gen_scythe: 1, gen_altar: 0 },
  prestigeMult: 2.4
});
assert.equal(mappedStats.length, 4);
assert.ok(mappedStats[0].mappedValue > mappedStats[0].baseVal && mappedStats[0].mappedValue <= mappedStats[0].capVal);

const tsCode = generateEngineExportCode(schema, 'typescript');
assert.ok(tsCode.includes('export class HeadlessIdleEngine'));
assert.ok(tsCode.includes('triggerExternalActionEvent'));

console.log('ALL CORE ENGINE TESTS PASSED (100%)!');
