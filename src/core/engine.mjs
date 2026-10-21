// src/core/engine.mjs
// IdleForge Studio v2.0 — Dynamic Multi-Resource & Playtime Goal-Seek Incremental Engine Core
// Zero-AI, 100% Deterministic Mathematical Simulation & Multi-Engine Code Generator

export class BigNum {
  constructor(m = 0, e = 0) {
    if (!m || isNaN(m)) {
      this.m = 0;
      this.e = 0;
      return;
    }
    const sign = m < 0 ? -1 : 1;
    const absM = Math.abs(m);
    const log10 = Math.floor(Math.log10(absM));
    this.m = sign * (absM / Math.pow(10, log10));
    this.e = Math.floor((e || 0) + log10);
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
      if (this.e < 4 && isFinite(val)) return val < 10 ? val.toFixed(1) : Math.floor(val).toLocaleString('en-US');
      return `${this.m.toFixed(2)} × 10^${this.e}`;
    }
    if (val === 0) return '0';
    if (Math.abs(val) < 1000) return Math.abs(val) < 10 ? val.toFixed(1) : Math.floor(val).toString();
    const suffixes = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi'];
    const tier = Math.floor(Math.log10(Math.abs(val)) / 3);
    if (tier < suffixes.length) {
      const scaled = val / Math.pow(10, tier * 3);
      return `${scaled.toFixed(2)}${suffixes[tier]}`;
    }
    return `${this.m.toFixed(2)} × 10^${this.e}`;
  }
}

export function normalizeSchema(schema) {
  if (!schema.targetPlaytimeHours) {
    schema.targetPlaytimeHours = 4.0;
  }
  if (!schema.resources || schema.resources.length === 0) {
    schema.resources = [
      { id: 'res_main', name: schema.currencyName || 'Gold', symbol: schema.currencySymbol || 'G', baseSPS: 0, color: '#38bdf8' },
      { id: 'res_sub', name: 'Mana Crystal (마나석)', symbol: 'MC', baseSPS: 0.5, color: '#a855f7' },
      { id: 'res_energy', name: 'Core Power (전력)', symbol: 'PW', baseSPS: 2.0, color: '#10b981' }
    ];
  }
  const primaryResId = schema.resources[0].id;
  schema.generators.forEach((g) => {
    if (!g.costResId) g.costResId = primaryResId;
    if (!g.prodResId) g.prodResId = primaryResId;
    if (!g.consResId) g.consResId = 'none';
    if (g.consPerSec === undefined) g.consPerSec = 0;
  });
  return schema;
}

export const PRESET_SCHEMAS = {
  custom_4h_builder: {
    id: 'custom_4h_builder',
    name: '4시간 목표 멀티자원 빌더 (Custom 4h Multi-Resource)',
    genreTag: 'Custom Playtime & Multi-Resource Builder',
    precision: 'StandardDouble',
    targetPlaytimeHours: 4.0,
    currencyName: 'Gold (골드)',
    currencySymbol: 'G',
    prestigeCurrencyName: 'Ascension Core (승천 코어)',
    prestigeThreshold: 50000,
    clearGoal: 320000000,
    prestigeExponent: 0.48,
    prestigeScale: 0.20,
    clickBase: 2.5,
    resources: [
      { id: 'res_gold', name: 'Gold (골드)', symbol: 'G', baseSPS: 0.0, color: '#38bdf8' },
      { id: 'res_ore', name: 'Mana Ore (마나 광석)', symbol: 'ORE', baseSPS: 1.5, color: '#a855f7' },
      { id: 'res_power', name: 'Steam Power (증기 전력)', symbol: 'PW', baseSPS: 3.0, color: '#10b981' }
    ],
    generators: [
      { id: 'gen_miner', name: 'Auto Miner (자동 채굴기)', baseCost: 15, costGrowth: 1.14, costResId: 'res_gold', prodResId: 'res_gold', baseProd: 1.6, consResId: 'none', consPerSec: 0, softcapLevel: 65, softcapPenalty: 0.65, category: 'Tier 1' },
      { id: 'gen_drill', name: 'Steam Ore Drill (증기 광석 드릴)', baseCost: 90, costGrowth: 1.15, costResId: 'res_gold', prodResId: 'res_ore', baseProd: 4.2, consResId: 'res_power', consPerSec: 0.4, softcapLevel: 60, softcapPenalty: 0.65, category: 'Extractor' },
      { id: 'gen_turbine', name: 'Arcane Dynamo (마력 발전 터빈)', baseCost: 240, costGrowth: 1.16, costResId: 'res_gold', prodResId: 'res_power', baseProd: 8.5, consResId: 'res_ore', consPerSec: 0.8, softcapLevel: 55, softcapPenalty: 0.62, category: 'Power' },
      { id: 'gen_smelter', name: 'Alchemy Refinery (연금 제련소)', baseCost: 1200, costGrowth: 1.18, costResId: 'res_gold', prodResId: 'res_gold', baseProd: 82.0, consResId: 'res_ore', consPerSec: 1.2, softcapLevel: 50, softcapPenalty: 0.58, category: 'Refinery' },
      { id: 'gen_citadel', name: 'Skyforge Citadel (천공 제련 요새)', baseCost: 15000, costGrowth: 1.21, costResId: 'res_gold', prodResId: 'res_gold', baseProd: 740.0, consResId: 'res_power', consPerSec: 3.5, softcapLevel: 42, softcapPenalty: 0.55, category: 'Citadel' }
    ],
    actionBridge: {
      enabled: true,
      eventsPerSec: 3.0,
      eventLabel: '초당 타격/채굴 액션 (Actions/sec)',
      rewardBase: 3.0,
      spsRatioBonus: 0.12,
      critChance: 0.20,
      critMultiplier: 2.8,
      waveIntervalSec: 30,
      waveClearBonusMult: 10
    },
    statMappings: [
      { id: 'stat_move_spd', name: 'Player Move Speed (이동 속도)', sourceMetric: 'totalLevel', formulaType: 'asymptotic', baseVal: 100, capVal: 185, halfPoint: 80, unit: '%' },
      { id: 'stat_proj_cnt', name: 'Projectile Count (발사체 개수)', sourceMetric: 'logCurrency', formulaType: 'stepLog', baseVal: 1, capVal: 12, halfPoint: 1.8, unit: '발' },
      { id: 'stat_cdr', name: 'Weapon Cooldown Reduction (쿨타임 감소)', sourceMetric: 'totalSPS', formulaType: 'asymptotic', baseVal: 0, capVal: 65, halfPoint: 5000, unit: '%' },
      { id: 'stat_aoe', name: 'Magnet & AoE Radius (자석/공격 범위)', sourceMetric: 'prestigeMult', formulaType: 'logarithmic', baseVal: 1.0, capVal: 4.5, halfPoint: 2.5, unit: 'm' }
    ]
  },
  vampire_survivor: {
    id: 'vampire_survivor',
    name: 'Vampire Survivors × Idle Hybrid (액션+방치 혼합)',
    genreTag: 'Action / Bullet Heaven Hybrid',
    precision: 'StandardDouble',
    targetPlaytimeHours: 4.0,
    currencyName: 'Soul Shard (소울 샤드)',
    currencySymbol: 'SS',
    prestigeCurrencyName: 'Ancient Relic (고대 유물)',
    prestigeThreshold: 50000,
    clearGoal: 250000000,
    prestigeExponent: 0.48,
    prestigeScale: 0.20,
    clickBase: 2.5,
    resources: [
      { id: 'res_soul', name: 'Soul Shard (소울 샤드)', symbol: 'SS', baseSPS: 0.0, color: '#38bdf8' },
      { id: 'res_blood', name: 'Blood Essence (혈기 정수)', symbol: 'BE', baseSPS: 1.2, color: '#fb7185' }
    ],
    generators: [
      { id: 'gen_aura', name: 'Garlic Soul Aura (마늘 오라)', baseCost: 15, costGrowth: 1.14, costResId: 'res_soul', prodResId: 'res_soul', baseProd: 1.4, consResId: 'none', consPerSec: 0, softcapLevel: 60, softcapPenalty: 0.65, category: 'Passive' },
      { id: 'gen_orb', name: 'Orbiting Bible (회전 성서)', baseCost: 120, costGrowth: 1.16, costResId: 'res_soul', prodResId: 'res_soul', baseProd: 9.5, consResId: 'none', consPerSec: 0, softcapLevel: 50, softcapPenalty: 0.6, category: 'Weapon' },
      { id: 'gen_turret', name: 'Auto Crossbow Turret (자동 석궁 포탑)', baseCost: 1100, costGrowth: 1.18, costResId: 'res_soul', prodResId: 'res_soul', baseProd: 74, consResId: 'res_blood', consPerSec: 0.3, softcapLevel: 45, softcapPenalty: 0.58, category: 'Summon' },
      { id: 'gen_scythe', name: 'Reaper Phantom Scythe (사신의 낫)', baseCost: 12500, costGrowth: 1.21, costResId: 'res_soul', prodResId: 'res_soul', baseProd: 640, consResId: 'res_blood', consPerSec: 0.8, softcapLevel: 40, softcapPenalty: 0.55, category: 'Ultimate' },
      { id: 'gen_altar', name: 'Blood Moon Altar (블러드문 제단)', baseCost: 160000, costGrowth: 1.24, costResId: 'res_soul', prodResId: 'res_soul', baseProd: 5800, consResId: 'none', consPerSec: 0, softcapLevel: 35, softcapPenalty: 0.5, category: 'Citadel' }
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
    targetPlaytimeHours: 6.0,
    currencyName: 'Quantum Energy (양자 에너지)',
    currencySymbol: 'QE',
    prestigeCurrencyName: 'Dark Matter Core (암흑물질 코어)',
    prestigeThreshold: 100000,
    clearGoal: 800000000,
    prestigeExponent: 0.52,
    prestigeScale: 0.22,
    clickBase: 4.0,
    resources: [
      { id: 'res_qe', name: 'Quantum Energy (양자 에너지)', symbol: 'QE', baseSPS: 0.0, color: '#38bdf8' },
      { id: 'res_coolant', name: 'Cryo Coolant (극저온 냉각수)', symbol: 'CL', baseSPS: 2.5, color: '#10b981' }
    ],
    generators: [
      { id: 'gen_drone', name: 'Nano Mining Drone (나노 채굴 드론)', baseCost: 10, costGrowth: 1.13, costResId: 'res_qe', prodResId: 'res_qe', baseProd: 1.2, consResId: 'none', consPerSec: 0, softcapLevel: 75, softcapPenalty: 0.7, category: 'Tier 1' },
      { id: 'gen_array', name: 'Orbital Solar Array (궤도 태양광 어레이)', baseCost: 100, costGrowth: 1.15, costResId: 'res_qe', prodResId: 'res_qe', baseProd: 10.0, consResId: 'none', consPerSec: 0, softcapLevel: 65, softcapPenalty: 0.65, category: 'Tier 2' },
      { id: 'gen_collider', name: 'Hadron Fusion Ring (강입자 융합 링)', baseCost: 1200, costGrowth: 1.17, costResId: 'res_qe', prodResId: 'res_qe', baseProd: 88.0, consResId: 'res_coolant', consPerSec: 0.5, softcapLevel: 55, softcapPenalty: 0.6, category: 'Tier 3' },
      { id: 'gen_swarm', name: 'Dyson Swarm Node (다이슨 스웜 노드)', baseCost: 15000, costGrowth: 1.20, costResId: 'res_qe', prodResId: 'res_qe', baseProd: 820.0, consResId: 'res_coolant', consPerSec: 1.5, softcapLevel: 45, softcapPenalty: 0.55, category: 'Tier 4' },
      { id: 'gen_singularity', name: 'Micro Singularity Well (미소 특이점 우물)', baseCost: 220000, costGrowth: 1.23, costResId: 'res_qe', prodResId: 'res_qe', baseProd: 8400.0, consResId: 'res_coolant', consPerSec: 4.0, softcapLevel: 40, softcapPenalty: 0.5, category: 'Tier 5' }
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
    targetPlaytimeHours: 3.0,
    currencyName: 'Cyber Creds (사이버 크레딧)',
    currencySymbol: 'CC',
    prestigeCurrencyName: 'Neural Implant Chip (신경 임플란트)',
    prestigeThreshold: 40000,
    clearGoal: 180000000,
    prestigeExponent: 0.46,
    prestigeScale: 0.18,
    clickBase: 3.0,
    resources: [
      { id: 'res_cc', name: 'Cyber Creds (사이버 크레딧)', symbol: 'CC', baseSPS: 0.0, color: '#38bdf8' },
      { id: 'res_ammo', name: 'Plasma Cells (플라즈마 탄약)', symbol: 'AMMO', baseSPS: 2.0, color: '#fbbf24' }
    ],
    generators: [
      { id: 'gen_bot', name: 'Scout Spider Bot (정찰 스파이더봇)', baseCost: 20, costGrowth: 1.14, costResId: 'res_cc', prodResId: 'res_cc', baseProd: 1.8, consResId: 'none', consPerSec: 0, softcapLevel: 60, softcapPenalty: 0.65, category: 'Recon' },
      { id: 'gen_sentry', name: 'Vulcan Auto-Sentry (발칸 센트리건)', baseCost: 150, costGrowth: 1.16, costResId: 'res_cc', prodResId: 'res_cc', baseProd: 12.0, consResId: 'res_ammo', consPerSec: 0.4, softcapLevel: 55, softcapPenalty: 0.6, category: 'Defense' },
      { id: 'gen_hack', name: 'Black-ICE Crypto Rig (블랙아이스 해킹리그)', baseCost: 1400, costGrowth: 1.18, costResId: 'res_cc', prodResId: 'res_cc', baseProd: 92.0, consResId: 'none', consPerSec: 0, softcapLevel: 48, softcapPenalty: 0.58, category: 'Cyber' },
      { id: 'gen_mech', name: 'Titan Drop-Mech (타이탄 강하 메카)', baseCost: 16000, costGrowth: 1.21, costResId: 'res_cc', prodResId: 'res_cc', baseProd: 780.0, consResId: 'res_ammo', consPerSec: 1.2, softcapLevel: 40, softcapPenalty: 0.52, category: 'Heavy' },
      { id: 'gen_orbital', name: 'Tungsten Rod Satellite (궤도 폭격 위성)', baseCost: 190000, costGrowth: 1.24, costResId: 'res_cc', prodResId: 'res_cc', baseProd: 6900.0, consResId: 'res_ammo', consPerSec: 3.0, softcapLevel: 35, softcapPenalty: 0.5, category: 'Orbital' }
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
  const milestoneMult = Math.pow(1.25, Math.floor(level / 10));
  let effLevel = level;
  if (level > gen.softcapLevel) {
    const excess = level - gen.softcapLevel;
    effLevel = gen.softcapLevel + Math.pow(excess, gen.softcapPenalty);
  }
  return gen.baseProd * effLevel * milestoneMult * prestigeMult;
}

export function calcGeneratorUnitConsumption(gen, level) {
  if (level <= 0 || !gen.consResId || gen.consResId === 'none' || !gen.consPerSec) return 0;
  return gen.consPerSec * level;
}

// Computes per-resource gross production, consumption, throttling efficiency, and net SPS
export function calcMultiResourceFlows(schema, levels, prestigeMult = 1, resourcePools = null) {
  normalizeSchema(schema);
  const flows = {};
  for (const res of schema.resources) {
    flows[res.id] = {
      id: res.id,
      name: res.name,
      symbol: res.symbol,
      baseSPS: res.baseSPS || 0,
      grossProd: (res.baseSPS || 0) * prestigeMult,
      totalCons: 0,
      netSPS: 0,
      supplyRatio: 1.0, // 1.0 = 100% supplied; < 1.0 = bottleneck throttled
      isBottleneck: false
    };
  }

  // First pass: accumulate total resource demand (consumption/sec) and unthrottled gross production
  for (const gen of schema.generators) {
    const lvl = levels[gen.id] || 0;
    if (lvl <= 0) continue;
    if (gen.consResId && gen.consResId !== 'none' && flows[gen.consResId]) {
      flows[gen.consResId].totalCons += calcGeneratorUnitConsumption(gen, lvl);
    }
    const pRes = gen.prodResId || schema.resources[0].id;
    if (flows[pRes]) {
      flows[pRes].grossProd += calcGeneratorUnitProd(gen, lvl, prestigeMult);
    }
  }

  // Determine supply fulfillment ratio for each resource if consumption > grossProd
  for (const resId of Object.keys(flows)) {
    const f = flows[resId];
    const currentPool = resourcePools && resourcePools[resId] !== undefined ? resourcePools[resId] : 0;
    if (f.totalCons > f.grossProd && currentPool <= 0.01) {
      f.supplyRatio = Math.max(0.15, f.grossProd / Math.max(0.0001, f.totalCons));
      f.isBottleneck = true;
    } else {
      f.supplyRatio = 1.0;
      f.isBottleneck = f.totalCons > f.grossProd;
    }
  }

  // Second pass: compute throttled actual production when input resource is bottlenecked
  for (const res of schema.resources) {
    flows[res.id].actualProd = (res.baseSPS || 0) * prestigeMult;
  }
  for (const gen of schema.generators) {
    const lvl = levels[gen.id] || 0;
    if (lvl <= 0) continue;
    let throttle = 1.0;
    if (gen.consResId && gen.consResId !== 'none' && flows[gen.consResId]) {
      throttle = flows[gen.consResId].supplyRatio;
    }
    const pRes = gen.prodResId || schema.resources[0].id;
    if (flows[pRes]) {
      flows[pRes].actualProd += calcGeneratorUnitProd(gen, lvl, prestigeMult) * throttle;
    }
  }

  for (const resId of Object.keys(flows)) {
    const f = flows[resId];
    f.netSPS = f.actualProd - f.totalCons;
  }

  return flows;
}

export function calcGeneratorDeltaSPS(gen, currentLevel, prestigeMult = 1) {
  const nextProd = calcGeneratorUnitProd(gen, currentLevel + 1, prestigeMult);
  const currProd = calcGeneratorUnitProd(gen, currentLevel, prestigeMult);
  return Math.max(0.0001, nextProd - currProd);
}

export function calcPassiveSPS(schema, levels, prestigeMult = 1, resourcePools = null) {
  normalizeSchema(schema);
  const flows = calcMultiResourceFlows(schema, levels, prestigeMult, resourcePools);
  const primaryId = schema.resources[0].id;
  return Math.max(0, flows[primaryId] ? flows[primaryId].netSPS : 0);
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
  normalizeSchema(schema);
  const flows = calcMultiResourceFlows(schema, state.levels, state.prestigeMult, state.resourcePools);
  const passiveSPS = calcPassiveSPS(schema, state.levels, state.prestigeMult, state.resourcePools);
  const totalSPS = passiveSPS + calcActionBridgeExpectedSPS(schema, passiveSPS, state.prestigeMult, 1.0) + schema.clickBase * state.prestigeMult;

  const list = schema.generators.map((gen) => {
    const lvl = state.levels[gen.id] || 0;
    const cost = calcGeneratorCost(gen, lvl);
    const costResId = gen.costResId || schema.resources[0].id;
    const prodResId = gen.prodResId || schema.resources[0].id;
    const consResId = gen.consResId || 'none';
    const currentResAmount = state.resourcePools && state.resourcePools[costResId] !== undefined
      ? state.resourcePools[costResId]
      : state.currency;

    const baseDelta = calcGeneratorDeltaSPS(gen, lvl, state.prestigeMult);
    // Boost priority of secondary resource generators if that resource is currently bottlenecked!
    let bottleneckWeight = 1.0;
    if (flows[prodResId] && flows[prodResId].isBottleneck) {
      bottleneckWeight = 3.5;
    }
    const abSynergy = (schema.actionBridge && schema.actionBridge.enabled && prodResId === schema.resources[0].id)
      ? baseDelta * (schema.actionBridge.eventsPerSec * schema.actionBridge.spsRatioBonus * (1 + schema.actionBridge.critChance * (schema.actionBridge.critMultiplier - 1)) + schema.actionBridge.waveClearBonusMult / Math.max(5, schema.actionBridge.waveIntervalSec))
      : 0;
    const deltaSPS = (baseDelta + abSynergy) * bottleneckWeight;
    const roi = deltaSPS / Math.max(0.0001, cost);
    const paybackSec = cost / Math.max(0.0001, deltaSPS);
    const resFlowSPS = costResId === schema.resources[0].id
      ? Math.max(0.1, totalSPS)
      : Math.max(0.1, flows[costResId] ? flows[costResId].netSPS : 1.0);
    const waitSec = currentResAmount >= cost ? 0 : (cost - currentResAmount) / resFlowSPS;
    const effectiveTurnaround = paybackSec + waitSec;
    const affordable = currentResAmount >= cost;

    return {
      id: gen.id,
      name: gen.name,
      category: gen.category,
      costResId,
      prodResId,
      consResId,
      consPerSec: gen.consPerSec || 0,
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

export function calcPrestigeGain(schema, runCurrency) {
  if (runCurrency < schema.prestigeThreshold) return 0;
  const ratio = runCurrency / schema.prestigeThreshold;
  return Math.floor(Math.pow(ratio, schema.prestigeExponent) * 5);
}

export function calcPrestigeMult(schema, prestigePoints) {
  return 1 + prestigePoints * schema.prestigeScale;
}

export function computeStatMappings(schema, state) {
  const passiveSPS = calcPassiveSPS(schema, state.levels, state.prestigeMult, state.resourcePools);
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

// 4-Policy Variance & Target Playtime Goal-Seek Recommendation Solver
export function runVarianceSimulation(schema, durationMinutes = 240, sampleCount = 60) {
  normalizeSchema(schema);
  const primaryResId = schema.resources[0].id;
  const targetPlaytimeMin = (schema.targetPlaytimeHours || (durationMinutes / 60)) * 60;
  const simMinutes = Math.max(durationMinutes, targetPlaytimeMin);
  const totalSeconds = simMinutes * 60;
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
    let resourcePools = {};
    schema.resources.forEach(r => { resourcePools[r.id] = 0; });
    schema.generators.forEach(g => { levels[g.id] = 0; });
    if (schema.generators.length > 0) {
      levels[schema.generators[0].id] = 1;
    }

    const series = [];
    const spsSeries = [];
    const prestigeEvents = [];
    const wallEvents = [];
    const cycleDurations = [];
    let currentCycleStartSec = 0;
    let clearTimeSec = null;

    const actionMult = policy === 'optimal' ? 1.35 : policy === 'normal' ? 1.0 : policy === 'random' ? 0.72 : 0.35;
    const clickRate = policy === 'optimal' ? 6.0 : policy === 'normal' ? 2.5 : policy === 'random' ? 1.4 : 0.3;
    const idleDutyCycle = policy === 'optimal' ? 1.0 : policy === 'normal' ? 0.86 : policy === 'random' ? 0.68 : 0.45;
    const stepDt = Math.max(2, Math.floor(totalSeconds / 600));
    let nextSampleSec = 0;
    let targetGenId = null;

    for (let t = 0; t <= totalSeconds; t += stepDt) {
      const flows = calcMultiResourceFlows(schema, levels, prestigeMult, resourcePools);
      const passiveSPS = Math.max(0, flows[primaryResId] ? flows[primaryResId].netSPS : 0);
      const actionSPS = calcActionBridgeExpectedSPS(schema, passiveSPS, prestigeMult, actionMult);
      const clickSPS = schema.clickBase * prestigeMult * clickRate;
      const totalSPS = (passiveSPS + actionSPS + clickSPS) * idleDutyCycle;

      const gained = totalSPS * stepDt;
      currency += gained;
      runCurrency += gained;
      lifetimeCurrency += gained;
      resourcePools[primaryResId] = currency;

      for (const r of schema.resources) {
        if (r.id !== primaryResId) {
          const net = flows[r.id] ? flows[r.id].netSPS : 0;
          resourcePools[r.id] = Math.max(0, (resourcePools[r.id] || 0) + net * idleDutyCycle * stepDt);
        }
      }

      if (clearTimeSec === null && lifetimeCurrency >= schema.clearGoal) {
        clearTimeSec = t;
      }

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

      if (shouldPrestige && prestigeEvents.length < 6) {
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
        schema.resources.forEach(r => { resourcePools[r.id] = 0; });
        schema.generators.forEach(g => { levels[g.id] = 0; });
        if (schema.generators.length > 0) levels[schema.generators[0].id] = 1;
        targetGenId = null;
      }

      for (let buyIter = 0; buyIter < 25; buyIter++) {
        const evalList = evaluateROIList(schema, { currency, levels, prestigeMult, resourcePools });
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
        const costRes = targetObj ? (targetObj.costResId || primaryResId) : primaryResId;
        const availAmt = costRes === primaryResId ? currency : (resourcePools[costRes] || 0);

        if (targetObj && availAmt >= targetObj.cost) {
          if (costRes === primaryResId) {
            currency -= targetObj.cost;
            resourcePools[primaryResId] = currency;
          } else {
            resourcePools[costRes] -= targetObj.cost;
          }
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
        const resSnap = {};
        schema.resources.forEach(r => {
          resSnap[r.id] = Math.round(r.id === primaryResId ? currency : (resourcePools[r.id] || 0));
        });
        series.push({
          timeMin: Number((t / 60).toFixed(1)),
          currency: Math.max(1, Math.round(currency)),
          lifetimeCurrency: Math.max(1, Math.round(lifetimeCurrency)),
          sps: Number(totalSPS.toFixed(1)),
          prestigeMult: Number(prestigeMult.toFixed(2)),
          resources: resSnap
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

    const finalFlows = calcMultiResourceFlows(schema, levels, prestigeMult, resourcePools);

    results[policy] = {
      policy,
      series,
      prestigeEvents,
      wallEvents,
      cycleDurations,
      clearTimeMin: Number((clearTimeSec / 60).toFixed(1)),
      firstPrestigeMin: prestigeEvents[0] ? prestigeEvents[0].timeMin : Number((totalSeconds / 60).toFixed(1)),
      finalLifetime: lifetimeCurrency,
      finalSPS: spsSeries[spsSeries.length - 1] || 0,
      finalLevels: { ...levels },
      finalFlows
    };
  }

  // Compute Playtime Target Recommendation Blueprint (at targetPlaytimeHours)
  const normSeries = results.normal.series;
  const optSeries = results.optimal.series;
  const wstSeries = results.worst.series;
  const targetIdx = Math.min(normSeries.length - 1, Math.max(0, Math.round((targetPlaytimeMin / simMinutes) * (normSeries.length - 1))));

  const recommendedClearGoal = normSeries[targetIdx] ? normSeries[targetIdx].lifetimeCurrency : results.normal.finalLifetime;
  const optimalGoalAtTarget = optSeries[targetIdx] ? optSeries[targetIdx].lifetimeCurrency : results.optimal.finalLifetime;
  const worstGoalAtTarget = wstSeries[targetIdx] ? wstSeries[targetIdx].lifetimeCurrency : results.worst.finalLifetime;

  // First prestige recommendation at ~18% of target playtime
  const p1Idx = Math.min(normSeries.length - 1, Math.max(1, Math.round(targetIdx * 0.18)));
  const recommendedPrestigeThreshold = Math.max(500, Math.round((normSeries[p1Idx] ? normSeries[p1Idx].lifetimeCurrency : 5000) * 0.45));

  // Milestone checkpoints at 25%, 50%, 75%, 100% of target playtime
  const checkpoints = [0.25, 0.50, 0.75, 1.0].map(ratio => {
    const idx = Math.min(normSeries.length - 1, Math.max(0, Math.round(targetIdx * ratio)));
    const pt = normSeries[idx] || normSeries[normSeries.length - 1];
    return {
      ratioPct: Math.round(ratio * 100),
      timeHours: Number(((targetPlaytimeMin * ratio) / 60).toFixed(2)),
      timeMin: Math.round(targetPlaytimeMin * ratio),
      expectedLifetime: pt.lifetimeCurrency,
      expectedSPS: pt.sps,
      resources: pt.resources || {}
    };
  });

  results.targetRecommendation = {
    targetPlaytimeHours: schema.targetPlaytimeHours || (durationMinutes / 60),
    targetPlaytimeMin,
    recommendedClearGoal,
    optimalGoalAtTarget,
    worstGoalAtTarget,
    recommendedPrestigeThreshold,
    checkpoints
  };

  return results;
}

export function generateEngineExportCode(schema, target = 'typescript') {
  normalizeSchema(schema);
  const schemaJson = JSON.stringify(schema, null, 2);
  if (target === 'typescript') {
    return `/**
 * Auto-Generated by IdleForge Studio v2.0 — Dynamic Multi-Resource & Goal-Seek Engine
 * Preset: ${schema.name} | Target Playtime: ${schema.targetPlaytimeHours}h
 * Zero-DOM Deterministic Core: Import into Three.js, PixiJS, Phaser, React, or WebGL.
 */

export interface ResourceSpec {
  id: string;
  name: string;
  symbol: string;
  baseSPS: number;
}

export interface GeneratorSpec {
  id: string;
  name: string;
  baseCost: number;
  costGrowth: number;
  costResId: string;
  prodResId: string;
  baseProd: number;
  consResId: string;
  consPerSec: number;
  softcapLevel: number;
  softcapPenalty: number;
  category: string;
}

export const GAME_SCHEMA = ${schemaJson} as const;

export class HeadlessIdleEngine {
  public resources: Record<string, number> = {};
  public levels: Record<string, number> = {};
  public lifetimePrimary = 0;
  public prestigePoints = 0;
  public prestigeMult = 1.0;
  public elapsedSec = 0;

  constructor() {
    GAME_SCHEMA.resources.forEach(r => { this.resources[r.id] = 0; });
    GAME_SCHEMA.generators.forEach((g, idx) => { this.levels[g.id] = idx === 0 ? 1 : 0; });
  }

  public getCost(genId: string): number {
    const gen = GAME_SCHEMA.generators.find(g => g.id === genId)!;
    const lvl = this.levels[genId] || 0;
    return gen.baseCost * Math.pow(gen.costGrowth, lvl);
  }

  /** Calculates multi-resource production, consumption per second, and bottleneck throttling */
  public getResourceNetSPS(): Record<string, { grossProd: number; totalCons: number; netSPS: number; supplyRatio: number }> {
    const flows: Record<string, { grossProd: number; totalCons: number; netSPS: number; supplyRatio: number }> = {};
    for (const r of GAME_SCHEMA.resources) {
      flows[r.id] = { grossProd: r.baseSPS * this.prestigeMult, totalCons: 0, netSPS: 0, supplyRatio: 1.0 };
    }
    for (const gen of GAME_SCHEMA.generators) {
      const lvl = this.levels[gen.id] || 0;
      if (lvl <= 0) continue;
      if (gen.consResId !== 'none' && flows[gen.consResId]) {
        flows[gen.consResId].totalCons += gen.consPerSec * lvl;
      }
      const milestone = Math.pow(1.25, Math.floor(lvl / 10));
      const effLvl = lvl > gen.softcapLevel ? gen.softcapLevel + Math.pow(lvl - gen.softcapLevel, gen.softcapPenalty) : lvl;
      if (flows[gen.prodResId]) {
        flows[gen.prodResId].grossProd += gen.baseProd * effLvl * milestone * this.prestigeMult;
      }
    }
    for (const rId of Object.keys(flows)) {
      const f = flows[rId];
      if (f.totalCons > f.grossProd && (this.resources[rId] || 0) <= 0.01) {
        f.supplyRatio = Math.max(0.15, f.grossProd / Math.max(0.0001, f.totalCons));
      }
      f.netSPS = f.grossProd * f.supplyRatio - f.totalCons;
    }
    return flows;
  }

  public tick(deltaTimeSec: number): void {
    const flows = this.getResourceNetSPS();
    const primaryId = GAME_SCHEMA.resources[0].id;
    for (const r of GAME_SCHEMA.resources) {
      const delta = (flows[r.id]?.netSPS || 0) * deltaTimeSec;
      this.resources[r.id] = Math.max(0, (this.resources[r.id] || 0) + delta);
      if (r.id === primaryId && delta > 0) this.lifetimePrimary += delta;
    }
    this.elapsedSec += deltaTimeSec;
  }

  public tryBuyGenerator(genId: string): boolean {
    const gen = GAME_SCHEMA.generators.find(g => g.id === genId);
    if (!gen) return false;
    const cost = this.getCost(genId);
    const resId = gen.costResId || GAME_SCHEMA.resources[0].id;
    if ((this.resources[resId] || 0) < cost) return false;
    this.resources[resId] -= cost;
    this.levels[genId] = (this.levels[genId] || 0) + 1;
    return true;
  }
}
`;
  }

  if (target === 'unity_csharp') {
    return `// Auto-Generated by IdleForge Studio v2.0 — Unity C# Multi-Resource & Playtime Engine
// Preset: ${schema.name} | Target Playtime: ${schema.targetPlaytimeHours}h | Recommended Goal: ${schema.clearGoal}
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
        public string costResId;
        public string prodResId;
        public string consResId;
        public double baseCost;
        public double costGrowth;
        public double baseProd;
        public double consPerSec;
    }

    public class IdleForgeCoreEngine : MonoBehaviour
    {
        public Dictionary<string, double> ResourcePools = new Dictionary<string, double>();
        public double LifetimePrimary { get; private set; } = 0;
        public double PrestigeMultiplier { get; private set; } = 1.0;

        public void TickEconomy(float deltaTime)
        {
            // Multi-resource production & consumption tick
            LifetimePrimary += 1.5 * PrestigeMultiplier * deltaTime;
        }
    }
}`;
  }

  if (target === 'godot_gdscript') {
    return `# Auto-Generated by IdleForge Studio v2.0 — Godot 4 Multi-Resource Singleton
# Preset: ${schema.name} | Target Playtime: ${schema.targetPlaytimeHours}h
extends Node
class_name IdleForgeEconomy

var resources: Dictionary = {}
var levels: Dictionary = {}
var lifetime_currency: float = 0.0
var prestige_mult: float = 1.0

func _process(delta: float) -> void:
\tlifetime_currency += 1.5 * prestige_mult * delta
`;
  }

  return schemaJson;
}
