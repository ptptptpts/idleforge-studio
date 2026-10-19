# IdleForge Studio (`v1.0.0`)

**100% 결정론적(Deterministic) 수학 공식 기반 증분형·아이들러·하이브리드 게임 엔진 스튜디오**  
(AI 추론 0% · 순수 수학/미적분/고정 시드 알고리즘 · 타 게임 엔진용 Headless Core 코드 익스포터)

## 라이브 웹 스튜디오 바로가기 (GitHub Pages)
- **Live URL**: [https://ptptptpts.github.io/idleforge-studio/](https://ptptptpts.github.io/idleforge-studio/)

## 핵심 모듈 구성
1. **TypeScript 수치·수식 스키마 에디터 (`src/core/engine.mjs`)**
   - 재화, 생산기(`Cost = Base × Growth^Lv`), 마일스톤 배수, 소프트캡 감쇠 지수, 환생 수식을 코드와 분리하여 조작.
   - 기본 탑재 장르 프리셋 3종:
     1. `Vampire Survivors × Idle Hybrid` (액션/탄막 + 방치 혼합)
     2. `Quantum Dyson Idle` (정통 하드코어 증분형, `BigDouble` 정밀도)
     3. `Cyber Mercenary FPS × Idle` (FPS 루트슈터 + 방치 혼합)
2. **4대 플레이 편차(Variance) & 환생 사이클 시뮬레이터**
   - **언제나 최선 (`Optimal`)**: 매 순간 `Turnaround = WaitTime + (Cost ÷ ΔSPS)`가 최소인 항목만 구매.
   - **일반적 플레이 (`Normal`)**: 상위 효율 1~2순위 가중 선택 및 현실적 가동률 반영.
   - **랜덤 플레이 (`Random`)**: 고정 시드(`LCG seed=42`) 기반 몬테카를로 확률 대역.
   - **언제나 최악 (`Worst`)**: 최저 가성비 선택 시의 클리어 상한선 및 정체 벽(`Wall > 90s`) 진단.
3. **액션·장르 브릿지 (`Action Bridge`) & 스탯 변환 매퍼 (`Stat Mapper`)**
   - 초당 처치 수(`Kills/sec`), 크리티컬/헤드샷 배율, 웨이브 클리어 보상을 방치형 SPS와 결합.
   - 거대 경제 수치(`10^15` 등)를 타 게임 엔진의 물리/전투 파라미터(`이동속도 %`, `발사체 개수`, `쿨타임 감소 %`)로 점근선(`Asymptotic`) 수렴 매핑.
4. **웹 기반 라이브 프로토타이퍼 & 실시간 ROI 하이라이터**
   - `1×` ~ `600×` 배속 테스트, 실시간 구매 가능 최고 가성비(`ΔSPS ÷ Cost` 1위) 에메랄드 하이라이트.
5. **멀티엔진 Headless 코드 익스포터**
   - `TypeScript (Core SDK)`, `Unity (C# MonoBehaviour)`, `Godot 4 (GDScript)`, `Raw JSON Schema` 즉시 변환 및 복사.

## 로컬 유닛 테스트 실행
```bash
npm test
# 또는
node tests/core.test.mjs
```
