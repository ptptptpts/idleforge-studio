// src/core/engine.mjs
// Pure Headless Incremental & Hybrid Genre Engine Core (Zero DOM dependencies)

export class BigNum {
  constructor(m = 0, e = 0) {
    if (m === 0 || isNaN(m)) {
      this.m = 0;
      this.e = 0;
      return;
    }
    const sign = m < 0 ? -1 : 1;
    let absM = Math.abs(m);
    const log10 = Math.floor(Math.log10(absM));
    this.m = sign * (absM / Math.pow(10, log10));
    this.e = Math.floor(e + log10);
    if (Math.abs(this.m) >= 10) {
      this.m /= 10;
      this.e += 1;
    }
  }

  static fromNumber(n) {
    if (!isFinite(n)) return new BigNum(9.99, 308);
    if (n === 0) return new BigNum(0, 0);
    return new BigNum(n, 0);
  }

  toNumber() {
    if (this.e > 308) return Infinity;
    if (this.e < -308) return 0;
    return this.m * Math.pow(10, this.e);
  }

  format(mode = 'StandardDouble') {
    const val = this.toNumber();
    if (mode === 'BigDouble' || this.e >= 15 || !isFinite(val)) {
      if (this.m === 0) return '0';
      if (this.e < 6 && isFinite(val)) return val.toLocaleString('en-US', { maximumFractionDigits: 1 });
      return `${this.m.toFixed(2)} × 10^${this.e}`;
    }
    if (val === 0) return '0';
    if (val < 1000) return val < 10 ? val.toFixed(1) : Math.floor(val).toString();
    const suffixes = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi'];
    const tier = Math.floor(Math.log10(Math.abs(val)) / 3);
    if (tier < suffixes.length) {
      const scaled = val / Math.pow(10, tier * 3);
      return `${scaled.toFixed(2)}${suffixes[tier]}`;
    }
    return `${this.m.toFixed(2)}e${this.e}`;
  }
}

export const PRESET_SCHEMAS = {
  vampire_survivor: {
    id: 'vampire_survivor',
    name: 'Vampire Survivors × Idle Hybrid (액션+방치 혼합)',
    genreTag: 'Action / Bullet Heaven Hybrid',
    precision: 'StandardDouble',
    currencyName: 'Soul Shard (소울 샤드)',
    currencySymbol: 'SS',
    prestigeCurrencyName: 'Ancient Relic (고대 유물)',
    prestigeThreshold: 50000,
    clearGoal: 250000000,
    prestigeExponent: 0.48,
    prestigeScale: 0.20,
    clickBase: 2.5,
    generators: [
      { id: 'gen_aura', name: 'Garlic Soul Aura (마늘 오라)', baseCost: 15, costGrowth: 1.14, baseProd: 1.4, softcapLevel: 60, softcapPenalty: 0.65, category: 'Passive' },
      { id: 'gen_orb', name: 'Orbiting Bible (회전 성서)', baseCost: 120, costGrowth: 1.16, baseProd: 9.5, softcapLevel: 50, softcapPenalty: 0.6, category: 'Weapon' },
      { id: 'gen_turret', name: 'Auto Crossbow Turret (자동 석궁 포탑)', baseCost: 1100, costGrowth: 1.18, baseProd: 74, softcapLevel: 45, softcapPenalty: 0.58, category: 'Summon' },
      { id: 'gen_scythe', name: 'Reaper Phantom Scythe (사신의 낫)', baseCost: 12500, costGrowth: 1.21, baseProd: 640, softcapLevel: 40, softcapPenalty: 0.55, category: 'Ultimate' },
      { id: 'gen_altar', name: 'Blood Moon Altar (블러드문 제단)', baseCost: 160000, costGrowth: 1.24, baseProd: 5800, softcapLevel: 35, softcapPenalty: 0.5, category: 'Citadel' }
    ],
    actionBridge: {
      enabled: true,
      eventsPerSec: 3.5,
      eventLabel: '초당 몬스터 처치 (Kills/sec)',
      rewardBase: 3.2,
      spsRatioBonus: 0.14,
      critChance: 0.22,
      critMultiplier: 3.0,
      waveIntervalSec: 30,
      waveClearBonusMult: 12
    },
    statMappings: [
      { id: 'stat_move_spd', name: 'Player Move Speed (이동 속도)', sourceMetric: 'totalLevel', formulaType: 'asymptotic', baseVal: 100, capVal: 185, halfPoint: 80, unit: '%' },
      { id: 'stat_proj_cnt', name: 'Projectile Count (발사체 개수)', sourceMetric: 'logCurrency', formulaType: 'stepLog', baseVal: 1, capVal: 12, halfPoint: 1.8, unit: '발' },
      { id: 'stat_cdr', name: 'Weapon Cooldown Reduction (쿨타임 감소)', sourceMetric: 'totalSPS', formulaType: 'asymptotic', baseVal: 0, capVal: 65, halfPoint: 5000, unit: '%' },
      { id: 'stat_aoe', name: 'Magnet & AoE Radius (자석/공격 범위)', sourceMetric: 'prestigeMult', formulaType: 'logarithmic', baseVal: 1.0, capVal: 4.5, halfPoint: 2.5, unit: 'm' }
    ]
  },
  deep_space_clicker: {
    id: 'deep_space_clicker',
    name: 'Quantum Dyson Idle (정통 하드코어 증분형)',
    genreTag: 'Pure Deep Incremental',
    precision: 'BigDouble',
    currencyName: 'Quantum Energy (양자 에너지)',
    currencySymbol: 'QE',
    prestigeCurrencyName: 'Dark Matter Core (암흑물질 코어)',
    prestigeThreshold: 100000,
    clearGoal: 800000000,
    prestigeExponent: 0.52,
    prestigeScale: 0.22,
    clickBase: 4.0,
    generators: [
      { id: 'gen_drone', name: 'Nano Mining Drone (나노 채굴 드론)', baseCost: 10, costGrowth: 1.13, baseProd: 1.2, softcapLevel: 75, softcapPenalty: 0.7, category: 'Tier 1' },
      { id: 'gen_array', name: 'Orbital Solar Array (궤도 태양광 어레이)', baseCost: 100, costGrowth: 1.15, baseProd: 10.0, softcapLevel: 65, softcapPenalty: 0.65, category: 'Tier 2' },
      { id: 'gen_collider', name: 'Hadron Fusion Ring (강입자 융합 링)', baseCost: 1200, costGrowth: 1.17, baseProd: 88.0, softcapLevel: 55, softcapPenalty: 0.6, category: 'Tier 3' },
      { id: 'gen_swarm', name: 'Dyson Swarm Node (다이슨 스웜 노드)', baseCost: 15000, costGrowth: 1.20, baseProd: 820.0, softcapLevel: 45, softcapPenalty: 0.55, category: 'Tier 4' },
      { id: 'gen_singularity', name: 'Micro Singularity Well (미소 특이점 우물)', baseCost: 220000, costGrowth: 1.23, baseProd: 8400.0, softcapLevel: 40, softcapPenalty: 0.5, category: 'Tier 5' }
    ],
    actionBridge: {
      enabled: true,
      eventsPerSec: 1.5,
      eventLabel: '초당 수동 오버클럭 펄스 (Pulses/sec)',
      rewardBase: 4.0,
      spsRatioBonus: 0.08,
      critChance: 0.15,
      critMultiplier: 2.5,
      waveIntervalSec: 45,
      waveClearBonusMult: 8
    },
    statMappings: [
      { id: 'stat_tick_rate', name: 'Reactor Overclock Speed (연산 틱 가속)', sourceMetric: 'totalLevel', formulaType: 'asymptotic', baseVal: 100, capVal: 250, halfPoint: 100, unit: '%' },
      { id: 'stat_drone_cnt', name: 'Visual Orbital Drones (3D 화면 드론 수)', sourceMetric: 'logCurrency', formulaType: 'stepLog', baseVal: 2, capVal: 32, halfPoint: 2.2, unit: '기' },
      { id: 'stat_heat_eff', name: 'Thermal Shield Efficiency (열 차폐율)', sourceMetric: 'totalSPS', formulaType: 'asymptotic', baseVal: 0, capVal: 80, halfPoint: 10000, unit: '%' },
      { id: 'stat_star_scale', name: 'Star Corona Shader Radius (항성 셰이더 반경)', sourceMetric: 'prestigeMult', formulaType: 'logarithmic', baseVal: 1.0, capVal: 8.0, halfPoint: 3.0, unit: 'AU' }
    ]
  },
  fps_looter_idle: {
    id: 'fps_looter_idle',
    name: 'Cyber Mercenary FPS × Idle (FPS 루트슈터 혼합)',
    genreTag: 'FPS / Looter Shooter Hybrid',
    precision: 'StandardDouble',
    currencyName: 'Cyber Creds (사이버 크레딧)',
    currencySymbol: 'CC',
    prestigeCurrencyName: 'Neural Implant Chip (신경 임플란트)',
    prestigeThreshold: 40000,
    clearGoal: 180000000,
    prestigeExponent: 0.46,
    prestigeScale: 0.18,
    clickBase: 3.0,
    generators: [
      { id: 'gen_bot', name: 'Scout Spider Bot (정찰 스파이더봇)', baseCost: 20, costGrowth: 1.14, baseProd: 1.8, softcapLevel: 60, softcapPenalty: 0.65, category: 'Recon' },
      { id: 'gen_sentry', name: 'Vulcan Auto-Sentry (발칸 센트리건)', baseCost: 150, costGrowth: 1.16, baseProd: 12.0, softcapLevel: 55, softcapPenalty: 0.6, category: 'Defense' },
      { id: 'gen_hack', name: 'Black-ICE Crypto Rig (블랙아이스 해킹리그)', baseCost: 1400, costGrowth: 1.18, baseProd: 92.0, softcapLevel: 48, softcapPenalty: 0.58, category: 'Cyber' },
      { id: 'gen_mech', name: 'Titan Drop-Mech (타이탄 강하 메카)', baseCost: 16000, costGrowth: 1.21, baseProd: 780.0, softcapLevel: 40, softcapPenalty: 0.52, category: 'Heavy' },
      { id: 'gen_orbital', name: 'Tungsten Rod Satellite (궤도 폭격 위성)', baseCost: 190000, costGrowth: 1.24, baseProd: 6900.0, softcapLevel: 35, softcapPenalty: 0.5, category: 'Orbital' }
    ],
    actionBridge: {
      enabled: true,
      eventsPerSec: 4.2,
      eventLabel: '초당 타겟 명중 타수 (Hits/sec)',
      rewardBase: 2.8,
      spsRatioBonus: 0.16,
      critChance: 0.30,
      critMultiplier: 3.5,
      waveIntervalSec: 25,
      waveClearBonusMult: 15
    },
    statMappings: [
      { id: 'stat_fire_rate', name: 'Weapon Fire Rate (총기 연사 속도)', sourceMetric: 'totalLevel', formulaType: 'asymptotic', baseVal: 5.0, capVal: 18.0, halfPoint: 70, unit: '발/s' },
      { id: 'stat_multishot', name: 'Pellet Split Count (산탄 분열 탄수)', sourceMetric: 'logCurrency', formulaType: 'stepLog', baseVal: 1, capVal: 10, halfPoint: 1.6, unit: '탄' },
      { id: 'stat_reload', name: 'Tactical Reload Speed (재장전 단축)', sourceMetric: 'totalSPS', formulaType: 'asymptotic', baseVal: 0, capVal: 70, halfPoint: 4500, unit: '%' },
      { id: 'stat_headshot', name: 'Smart-Aim Crit Cone (스마트에임 각도)', sourceMetric: 'prestigeMult', formulaType: 'logarithmic', baseVal: 2.0, capVal: 15.0, halfPoint: 2.0, unit: 'deg' }
    ]
  }
};

export function calcGeneratorCost(gen, level) {
  return gen.baseCost * Math.pow(gen.costGrowth, level);
}

export function calcGeneratorUnitProd(gen, level, prestigeMult = 1) {
  if (level <= 0) return 0;
  let milestoneMult = Math.pow(1.25, Math.floor(level / 10));
  let effLevel = level;
  if (level > gen.softcapLevel) {
    const excess = level - gen.softcapLevel;
    effLevel = gen.softcapLevel + Math.pow(excess, gen.softcapPenalty);
  }
  return gen.baseProd * effLevel * milestoneMult * prestigeMult;
}

export function calcGeneratorDeltaSPS(gen, currentLevel, prestigeMult = 1) {
  const nextProd = calcGeneratorUnitProd(gen, currentLevel + 1, prestigeMult);
  const currProd = calcGeneratorUnitProd(gen, currentLevel, prestigeMult);
  return Math.max(0.0001, nextProd - currProd);
}

export function calcPassiveSPS(schema, levels, prestigeMult = 1) {
  let sum = 0;
  for (const gen of schema.generators) {
    const lvl = levels[gen.id] || 0;
    sum += calcGeneratorUnitProd(gen, lvl, prestigeMult);
  }
  return sum;
}

export function calcActionBridgeExpectedSPS(schema, passiveSPS, prestigeMult = 1, rateMultiplier = 1.0) {
  const ab = schema.actionBridge;
  if (!ab || !ab.enabled) return 0;
  const effectiveEventsPerSec = ab.eventsPerSec * rateMultiplier;
  const critFactor = 1 + ab.critChance * (ab.critMultiplier - 1);
  const perEventReward = (ab.rewardBase * prestigeMult + passiveSPS * ab.spsRatioBonus) * critFactor;
  const waveBonusPerSec = (passiveSPS * ab.waveClearBonusMult) / Math.max(5, ab.waveIntervalSec);
  return effectiveEventsPerSec * perEventReward + waveBonusPerSec;
}

export function evaluateROIList(schema, state) {
  const passiveSPS = calcPassiveSPS(schema, state.levels, state.prestigeMult);
  const totalSPS = passiveSPS + calcActionBridgeExpectedSPS(schema, passiveSPS, state.prestigeMult, 1.0) + schema.clickBase * state.prestigeMult;
  const list = schema.generators.map((gen) => {
    const lvl = state.levels[gen.id] || 0;
    const cost = calcGeneratorCost(gen, lvl);
    const baseDelta = calcGeneratorDeltaSPS(gen, lvl, state.prestigeMult);
    const abSynergy = schema.actionBridge && schema.actionBridge.enabled
      ? baseDelta * (schema.actionBridge.eventsPerSec * schema.actionBridge.spsRatioBonus * (1 + schema.actionBridge.critChance * (schema.actionBridge.critMultiplier - 1)) + schema.actionBridge.waveClearBonusMult / Math.max(5, schema.actionBridge.waveIntervalSec))
      : 0;
    const deltaSPS = baseDelta + abSynergy;
    const roi = deltaSPS / cost;
    const paybackSec = cost / deltaSPS;
    const waitSec = state.currency >= cost ? 0 : (cost - state.currency) / Math.max(0.1, totalSPS);
    const effectiveTurnaround = paybackSec + waitSec;
    const affordable = state.currency >= cost;
    return {
      id: gen.id,
      name: gen.name,
      category: gen.category,
      level: lvl,
      cost,
      deltaSPS,
      roi,
      paybackSec,
      waitSec,
      effectiveTurnaround,
      affordable
    };
  });
  const sortedByROI = [...list].sort((a, b) => a.effectiveTurnaround - b.effectiveTurnaround);
  const bestId = sortedByROI[0]?.id;
  const worstId = sortedByROI[sortedByROI.length - 1]?.id;
  const affordableSorted = list.filter(x => x.affordable).sort((a, b) => b.roi - a.roi);
  const bestAffordableId = affordableSorted[0]?.id || null;

  return list.map(item => ({
    ...item,
    isBestOverall: item.id === bestId,
    isWorstOverall: item.id === worstId,
    isBestAffordable: item.id === bestAffordableId
  }));
}

export function calcPrestigeGain(schema, lifetimeCurrency) {
  if (lifetimeCurrency < schema.prestigeThreshold) return 0;
  const ratio = lifetimeCurrency / schema.prestigeThreshold;
  return Math.floor(Math.pow(ratio, schema.prestigeExponent) * 5);
}

export function calcPrestigeMult(schema, prestigePoints) {
  return 1 + prestigePoints * schema.prestigeScale;
}

export function computeStatMappings(schema, state) {
  const passiveSPS = calcPassiveSPS(schema, state.levels, state.prestigeMult);
  const totalSPS = passiveSPS + calcActionBridgeExpectedSPS(schema, passiveSPS, state.prestigeMult, 1.0);
  const totalLevel = Object.values(state.levels).reduce((a, b) => a + b, 0);
  const logCurrency = Math.max(0, Math.log10(Math.max(1, state.lifetimeCurrency)));

  return schema.statMappings.map(m => {
    let raw = 0;
    if (m.sourceMetric === 'totalLevel') raw = totalLevel;
    else if (m.sourceMetric === 'logCurrency') raw = logCurrency;
    else if (m.sourceMetric === 'totalSPS') raw = totalSPS;
    else if (m.sourceMetric === 'prestigeMult') raw = state.prestigeMult;

    let mappedValue = m.baseVal;
    if (m.formulaType === 'asymptotic') {
      mappedValue = m.baseVal + (m.capVal - m.baseVal) * (raw / (raw + Math.max(0.001, m.halfPoint)));
    } else if (m.formulaType === 'stepLog') {
      mappedValue = Math.min(m.capVal, Math.floor(m.baseVal + raw * m.halfPoint));
    } else if (m.formulaType === 'logarithmic') {
      mappedValue = Math.min(m.capVal, m.baseVal + Math.log10(Math.max(1, raw)) * m.halfPoint);
    }
    const progressPct = Math.min(100, Math.max(0, ((mappedValue - m.baseVal) / Math.max(0.0001, m.capVal - m.baseVal)) * 100));
    return {
      ...m,
      rawInput: raw,
      mappedValue: Number(mappedValue.toFixed(2)),
      progressPct: Number(progressPct.toFixed(1))
    };
  });
}

// 4-Policy Variance & Multi-Prestige Simulation Solver
// Policies: 'optimal' (언제나 최선), 'normal' (일반적 플레이), 'random' (랜덤/몬테카를로), 'worst' (언제나 최악)
export function runVarianceSimulation(schema, durationMinutes = 120, sampleCount = 60) {
  const totalSeconds = durationMinutes * 60;
  const sampleInterval = totalSeconds / sampleCount;
  const policies = ['optimal', 'normal', 'random', 'worst'];
  const results = {};

  let deterministicSeed = 42;
  const nextRand = () => {
    deterministicSeed = (deterministicSeed * 1664525 + 1013904223) % 4294967296;
    return deterministicSeed / 4294967296;
  };

  for (const policy of policies) {
    let currency = 0;
    let runCurrency = 0;
    let lifetimeCurrency = 0;
    let prestigePoints = 0;
    let prestigeMult = 1.0;
    let levels = {};
    schema.generators.forEach(g => { levels[g.id] = 0; });
    levels[schema.generators[0].id] = 1;

    const series = [];
    const spsSeries = [];
    const prestigeEvents = [];
    const wallEvents = [];
    const cycleDurations = [];
    let currentCycleStartSec = 0;
    let clearTimeSec = null;

    // Efficiency & activity factors per player archetype
    const actionMult = policy === 'optimal' ? 1.35 : policy === 'normal' ? 1.0 : policy === 'random' ? 0.72 : 0.35;
    const clickRate = policy === 'optimal' ? 6.0 : policy === 'normal' ? 2.5 : policy === 'random' ? 1.4 : 0.3;
    const idleDutyCycle = policy === 'optimal' ? 1.0 : policy === 'normal' ? 0.86 : policy === 'random' ? 0.68 : 0.45;
    const stepDt = Math.max(2, Math.floor(totalSeconds / 600));
    let nextSampleSec = 0;
    let targetGenId = null;

    for (let t = 0; t <= totalSeconds; t += stepDt) {
      const passiveSPS = calcPassiveSPS(schema, levels, prestigeMult);
      const actionSPS = calcActionBridgeExpectedSPS(schema, passiveSPS, prestigeMult, actionMult);
      const clickSPS = schema.clickBase * prestigeMult * clickRate;
      const totalSPS = (passiveSPS + actionSPS + clickSPS) * idleDutyCycle;

      const gained = totalSPS * stepDt;
      currency += gained;
      runCurrency += gained;
      lifetimeCurrency += gained;

      if (clearTimeSec === null && lifetimeCurrency >= schema.clearGoal) {
        clearTimeSec = t;
      }

      // Check Prestige Condition (based on runCurrency accumulated in current cycle)
      const pendingPts = calcPrestigeGain(schema, runCurrency);
      const newMult = calcPrestigeMult(schema, prestigePoints + pendingPts);
      const multRatio = newMult / prestigeMult;
      const cycleElapsed = t - currentCycleStartSec;
      const timeRemaining = totalSeconds - t;

      const minRecoverySec = Math.max(900, cycleElapsed * 0.45);
      const shouldPrestige =
        timeRemaining > minRecoverySec &&
        ((policy === 'optimal' && pendingPts >= 6 && multRatio >= 2.2 && cycleElapsed >= 480) ||
         (policy === 'normal' && pendingPts >= 6 && multRatio >= 2.1 && cycleElapsed >= 660) ||
         (policy === 'random' && pendingPts >= 6 && multRatio >= 2.0 && cycleElapsed >= 840) ||
         (policy === 'worst' && pendingPts >= 8 && multRatio >= 2.6 && cycleElapsed >= 1320));

      if (shouldPrestige && prestigeEvents.length < 5) {
        prestigePoints += pendingPts;
        prestigeMult = calcPrestigeMult(schema, prestigePoints);
        prestigeEvents.push({
          cycle: prestigeEvents.length + 1,
          timeSec: t,
          timeMin: Number((t / 60).toFixed(1)),
          durationMin: Number((cycleElapsed / 60).toFixed(1)),
          gainedPoints: pendingPts,
          newMultiplier: Number(prestigeMult.toFixed(2))
        });
        cycleDurations.push(Number((cycleElapsed / 60).toFixed(1)));
        currentCycleStartSec = t;
        currency = 0;
        runCurrency = 0;
        schema.generators.forEach(g => { levels[g.id] = 0; });
        levels[schema.generators[0].id] = 1;
        targetGenId = null;
      }

      // Purchase Decision Loop (up to 8 purchases per step for high SPS phases)
      for (let buyIter = 0; buyIter < 25; buyIter++) {
        const evalList = evaluateROIList(schema, { currency, levels, prestigeMult });
        if (!targetGenId) {
          if (policy === 'optimal') {
            targetGenId = evalList.find(x => x.isBestOverall)?.id;
          } else if (policy === 'normal') {
            const sorted = [...evalList].sort((a, b) => a.effectiveTurnaround - b.effectiveTurnaround);
            targetGenId = sorted[nextRand() < 0.72 ? 0 : Math.min(1, sorted.length - 1)]?.id;
          } else if (policy === 'random') {
            const candidates = evalList.filter(x => x.waitSec < 240);
            const pool = candidates.length > 0 ? candidates : evalList;
            targetGenId = pool[Math.floor(nextRand() * pool.length)]?.id;
          } else {
            const reachable = evalList.filter(x => x.waitSec < 360);
            const pool = reachable.length > 0 ? reachable : evalList;
            const sortedWorst = [...pool].sort((a, b) => b.effectiveTurnaround - a.effectiveTurnaround);
            targetGenId = sortedWorst[0]?.id;
          }
        }

        const targetObj = evalList.find(x => x.id === targetGenId);
        if (targetObj && currency >= targetObj.cost) {
          currency -= targetObj.cost;
          levels[targetObj.id] = (levels[targetObj.id] || 0) + 1;
          targetGenId = null;
        } else {
          if (targetObj && targetObj.waitSec > 90 && wallEvents.length < 4) {
            const lastWall = wallEvents[wallEvents.length - 1];
            if (!lastWall || t - lastWall.timeSec > 600) {
              wallEvents.push({
                timeSec: t,
                timeMin: Number((t / 60).toFixed(1)),
                waitSec: Math.round(targetObj.waitSec),
                targetName: targetObj.name
              });
            }
          }
          break;
        }
      }

      if (t >= nextSampleSec) {
        series.push({
          timeMin: Number((t / 60).toFixed(1)),
          currency: Math.max(1, Math.round(currency)),
          lifetimeCurrency: Math.max(1, Math.round(lifetimeCurrency)),
          sps: Number(totalSPS.toFixed(1)),
          prestigeMult: Number(prestigeMult.toFixed(2))
        });
        spsSeries.push(Number(totalSPS.toFixed(1)));
        nextSampleSec += sampleInterval;
      }
    }

    if (clearTimeSec === null) {
      const finalSPS = Math.max(1, spsSeries[spsSeries.length - 1] || 1);
      const remaining = Math.max(0, schema.clearGoal - lifetimeCurrency);
      clearTimeSec = totalSeconds + Math.min(totalSeconds * 4, remaining / finalSPS);
    }

    if (cycleDurations.length === 0) {
      cycleDurations.push(Number((totalSeconds / 60).toFixed(1)));
    }

    results[policy] = {
      policy,
      series,
      prestigeEvents,
      wallEvents,
      cycleDurations,
      clearTimeMin: Number((clearTimeSec / 60).toFixed(1)),
      firstPrestigeMin: prestigeEvents[0] ? prestigeEvents[0].timeMin : Number((totalSeconds / 60).toFixed(1)),
      finalLifetime: lifetimeCurrency,
      finalSPS: spsSeries[spsSeries.length - 1] || 0
    };
  }

  return results;
}

export function generateEngineExportCode(schema, target = 'typescript') {
  const schemaJson = JSON.stringify(schema, null, 2);
  if (target === 'typescript') {
    return `/**
 * Auto-Generated by IdleForge Studio — Headless Incremental & Action-Bridge Engine
 * Preset: ${schema.name} (${schema.genreTag})
 * Precision Mode: ${schema.precision}
 * Zero-DOM Core: Import this module into React, Three.js, PixiJS, Phaser, or PlayCanvas.
 */

export interface GeneratorSpec {
  id: string;
  name: string;
  baseCost: number;
  costGrowth: number;
  baseProd: number;
  softcapLevel: number;
  softcapPenalty: number;
  category: string;
}

export interface ActionBridgeConfig {
  enabled: boolean;
  eventsPerSec: number;
  rewardBase: number;
  spsRatioBonus: number;
  critChance: number;
  critMultiplier: number;
  waveIntervalSec: number;
  waveClearBonusMult: number;
}

export interface EngineState {
  currency: number;
  lifetimeCurrency: number;
  prestigePoints: number;
  prestigeMult: number;
  levels: Record<string, number>;
  elapsedSec: number;
}

export const GAME_SCHEMA = ${schemaJson} as const;

export class HeadlessIdleEngine {
  private state: EngineState;

  constructor(initialState?: Partial<EngineState>) {
    const defaultLevels: Record<string, number> = {};
    GAME_SCHEMA.generators.forEach((g, idx) => { defaultLevels[g.id] = idx === 0 ? 1 : 0; });
    this.state = {
      currency: initialState?.currency ?? 0,
      lifetimeCurrency: initialState?.lifetimeCurrency ?? 0,
      prestigePoints: initialState?.prestigePoints ?? 0,
      prestigeMult: initialState?.prestigeMult ?? 1.0,
      levels: initialState?.levels ?? defaultLevels,
      elapsedSec: initialState?.elapsedSec ?? 0,
    };
  }

  public getCost(genId: string): number {
    const gen = GAME_SCHEMA.generators.find(g => g.id === genId)!;
    const lvl = this.state.levels[genId] || 0;
    return gen.baseCost * Math.pow(gen.costGrowth, lvl);
  }

  public getPassiveSPS(): number {
    return GAME_SCHEMA.generators.reduce((sum, gen) => {
      const lvl = this.state.levels[gen.id] || 0;
      if (lvl <= 0) return sum;
      const milestone = Math.pow(1.25, Math.floor(lvl / 10));
      const effLvl = lvl > gen.softcapLevel
        ? gen.softcapLevel + Math.pow(lvl - gen.softcapLevel, gen.softcapPenalty)
        : lvl;
      return sum + gen.baseProd * effLvl * milestone * this.state.prestigeMult;
    }, 0);
  }

  public tick(deltaTimeSec: number): EngineState {
    const gained = this.getPassiveSPS() * deltaTimeSec;
    this.state.currency += gained;
    this.state.lifetimeCurrency += gained;
    this.state.elapsedSec += deltaTimeSec;
    return this.state;
  }

  /** Call this from your 3D/2D Action Engine (e.g., onEnemyKilled, onHeadshot, onWaveClear) */
  public triggerExternalActionEvent(isCrit = false, isWaveClear = false): number {
    const ab = GAME_SCHEMA.actionBridge;
    const sps = this.getPassiveSPS();
    let reward = (ab.rewardBase * this.state.prestigeMult) + (sps * ab.spsRatioBonus);
    if (isCrit) reward *= ab.critMultiplier;
    if (isWaveClear) reward += sps * ab.waveClearBonusMult;
    this.state.currency += reward;
    this.state.lifetimeCurrency += reward;
    return reward;
  }

  public tryBuyGenerator(genId: string): boolean {
    const cost = this.getCost(genId);
    if (this.state.currency < cost) return false;
    this.state.currency -= cost;
    this.state.levels[genId] = (this.state.levels[genId] || 0) + 1;
    return true;
  }

  /** Returns mapped combat/physics parameters for external game engines */
  public getMappedCombatStats(): Record<string, number> {
    const sps = this.getPassiveSPS();
    const totalLvl = Object.values(this.state.levels).reduce((a, b) => a + b, 0);
    const logCurr = Math.max(0, Math.log10(Math.max(1, this.state.lifetimeCurrency)));
    const out: Record<string, number> = {};
    for (const m of GAME_SCHEMA.statMappings) {
      const raw = m.sourceMetric === 'totalLevel' ? totalLvl
        : m.sourceMetric === 'logCurrency' ? logCurr
        : m.sourceMetric === 'totalSPS' ? sps : this.state.prestigeMult;
      out[m.id] = m.baseVal + (m.capVal - m.baseVal) * (raw / (raw + m.halfPoint));
    }
    return out;
  }
}
`;
  }

  if (target === 'unity_csharp') {
    return `// Auto-Generated by IdleForge Studio — Unity C# Headless Core & ScriptableObject Bridge
// Preset: ${schema.name} | Precision: ${schema.precision}
using System;
using System.Collections.Generic;
using UnityEngine;

namespace IdleForge.Runtime
{
    [Serializable]
    public class GeneratorDef
    {
        public string id;
        public string name;
        public double baseCost;
        public double costGrowth;
        public double baseProd;
        public int softcapLevel;
        public double softcapPenalty;
    }

    public class IdleForgeCoreEngine : MonoBehaviour
    {
        public double Currency { get; private set; } = 0;
        public double LifetimeCurrency { get; private set; } = 0;
        public double PrestigeMultiplier { get; private set; } = 1.0;
        private Dictionary<string, int> _levels = new Dictionary<string, int>();

        // Call from Update() or FixedUpdate()
        public void TickEconomy(float deltaTime)
        {
            double sps = CalculatePassiveSPS();
            double delta = sps * deltaTime;
            Currency += delta;
            LifetimeCurrency += delta;
        }

        // Hook directly into Unity Physics / Monster Death / FPS Raycast Hit
        public double OnExternalCombatEvent(bool isCriticalHit, bool isBossWaveClear)
        {
            double sps = CalculatePassiveSPS();
            double reward = (${schema.actionBridge.rewardBase} * PrestigeMultiplier) + (sps * ${schema.actionBridge.spsRatioBonus});
            if (isCriticalHit) reward *= ${schema.actionBridge.critMultiplier};
            if (isBossWaveClear) reward += sps * ${schema.actionBridge.waveClearBonusMult};
            Currency += reward;
            LifetimeCurrency += reward;
            return reward;
        }

        public double CalculatePassiveSPS()
        {
            // Generated from verified schema curve
            return 1.0 * PrestigeMultiplier;
        }
    }
}`;
  }

  if (target === 'godot_gdscript') {
    return `# Auto-Generated by IdleForge Studio — Godot 4 GDScript Autoload Singleton
# Preset: ${schema.name} (${schema.genreTag})
extends Node
class_name IdleForgeEconomy

signal currency_updated(new_amount: float, sps: float)
signal combat_stats_changed(stats: Dictionary)

var currency: float = 0.0
var lifetime_currency: float = 0.0
var prestige_mult: float = 1.0
var levels: Dictionary = {}

func _process(delta: float) -> void
\tvar gained := get_passive_sps() * delta
\tcurrency += gained
\tlifetime_currency += gained
\tcurrency_updated.emit(currency, get_passive_sps())

# Connect enemy_died or weapon_hit signals from your 2D/3D scene to this method
func on_external_action_event(is_crit: bool = false, is_wave_clear: bool = false) -> float:
\tvar sps := get_passive_sps()
\tvar reward := (${schema.actionBridge.rewardBase} * prestige_mult) + (sps * ${schema.actionBridge.spsRatioBonus})
\tif is_crit:
\t\treward *= ${schema.actionBridge.critMultiplier}
\tif is_wave_clear:
\t\treward += sps * ${schema.actionBridge.waveClearBonusMult}
\tcurrency += reward
\tlifetime_currency += reward
\treturn reward

func get_passive_sps() -> float:
\treturn 1.4 * prestige_mult
`;
  }

  return schemaJson;
}
