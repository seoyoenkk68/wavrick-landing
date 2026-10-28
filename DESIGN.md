# WAVRICK Landing Website — Design System

**Version:** 1.2 (Codex handoff)  
**Date:** 2026-10-26  
**Project:** WAVRICK one-page landing website  
**Direction:** Editorial × Modular  
**Implementation:** HTML + CSS + Vanilla JavaScript (no React)

> **Status policy**: `[확정]`은 사용자가 선택·승인한 방향이다. `[설계 기준]`은 레퍼런스 이미지의 비례를 바탕으로 제안한 작업용 수치이다. `[미확정]`은 아직 사용자의 확정이 필요하다. 스크린샷만으로 원본 사이트의 CSS 값을 검증한 것은 아니다.

## 1. 프로젝트 원칙

- [확정] 기존 다른 프로젝트의 스타일이나 레이아웃 결정은 이 문서에 자동 반영하지 않는다.
- [확정] 제공된 두 레퍼런스에서 **구조와 디자인 원리**만 추출한다. 화면 구성이나 독특한 그래픽을 그대로 복제하지 않는다.
- [확정] **Editorial × Modular 균형형**: 브랜드 메시지와 몰입형 화면에는 Editorial, 서비스·정보·카드 영역에는 Modular를 주로 적용한다.
- [확정] WAVRICK 컬러 방향: **Blue + Navy**. 레퍼런스의 레드 포인트 컬러는 사용하지 않는다.
- [확정] 히어로 레이아웃: **B. Centered Immersive**.
- [확정] 코드: HTML/CSS/JavaScript 중심, React 사용하지 않는다.
- [미확정] 전체 원페이지 섹션 순서, 최종 카피, 실제 3D 자산, 최종 CI HEX와 폰트 종류.

## 2. 레퍼런스 원리

### Reference A — Dark Editorial
- 검은색에 가까운 바탕, 높은 명암 대비, 대형 타이포그래피.
- 충분한 여백과 비대칭 시선 흐름, 대형 오브젝트 중심의 몰입감.
- 강약이 분명한 섹션 리듬, 이미지·오브젝트의 공간적 깊이.

### Reference B — Bright Modular
- 선명한 컬러 면, 화이트 공간, 중앙 정렬형 대형 메시지.
- 카드 및 콘텐츠의 규칙적인 그리드, 넉넉한 내부 여백과 둥근 모서리.
- 강한 브랜드 컬러와 곡선/면 전환을 이용한 챕터 구분.

### WAVRICK에 적용할 조합
- **Adopt**: 큰 헤드라인, 대담한 여백, 규칙적인 콘텐츠 그리드, 명확한 위계.
- **Adapt**: 어두운 몰입형 장면을 Navy/Blue로 전환; 곡선과 모듈 그래픽은 상황에 맞게 재구성.
- **Avoid**: 레퍼런스 외형 복제, 모든 섹션에 과도한 애니메이션, 과밀 카드, 임의의 포인트 컬러 추가.

## 3. 레이아웃 & 그리드

### 기준 화면

| 항목 | 값 | 상태 |
|---|---:|---|
| 기준 아트보드 | 1920 × 1080px | 확정 |
| 기본 콘텐츠 컨테이너 | 1600px | 설계 기준 |
| 와이드 컨테이너 | 1760px | 설계 기준 |
| 내로우 컨테이너 | 1280px | 설계 기준 |
| 읽기 중심 영역 | 960px | 설계 기준 |
| PC 좌우 마진 (1920px) | 160px | 설계 기준 |
| 기본 그리드 | 12 columns | 설계 기준 |
| 그리드 gutter | 24px | 설계 기준 |
| 컬럼 너비 | (1600 - 11×24)/12 ≈ 111.33px | 파생값 |
| 헤더 높이 | 88px | 설계 기준 |

12컬럼에서 3열 카드: 약 517.33px / 장, 4열 카드: 382px / 장, 2열: 788px / 장. 모든 값은 24px gutter 포함.

### 컨테이너 적용
- 텍스트와 정보 컴포넌트는 기본 1600px 정렬선을 따른다.
- 히어로 초대형 타이포·비주얼에는 1760px 영역까지 확장 허용.
- 배경, 곡선, 블러/글로우, 인터랙션 레이어는 100vw 확장 가능 (콘텐츠 시작점과 분리).
- 텍스트가 긴 본문은 960px 이하로 제한해 가독성 확보.
- 반응형에서는 고정폭을 억지로 축소하지 않고 `width: min(100% - 2*gutter, max-width)` 사용.

## 4. 타이포그래피

- [설계 기준] 한글 기본: `Pretendard Variable`, `Pretendard`, sans-serif.
- [미확정] 영문 디스플레이에 별도 Condensed 서체를 사용할지 여부.
- 큰 제목은 그래픽 요소처럼 활용하지만, 한 화면에 동등한 강도의 대형 헤드라인을 중복하지 않는다.
- 한국어 단어를 부자연스럽게 나누지 않도록 `word-break: keep-all` 사용.

| Token | Desktop font-size | Weight | Line-height | Letter-spacing |
|---|---:|---:|---:|---:|
| `display-xl` | 144px | 800 | 0.98 | -0.065em |
| `display-lg` | 104px | 700 | 1.05 | -0.055em |
| `heading-01` | 80px | 700 | 1.15 | -0.045em |
| `heading-02` | 56px | 700 | 1.2 | -0.04em |
| `heading-03` | 40px | 700 | 1.3 | -0.035em |
| `heading-04` | 32px | 600 | 1.35 | -0.025em |
| `body-large` | 24px | 400 | 1.6 | -0.025em |
| `body-default` | 18px | 400 | 1.7 | -0.015em |
| `body-small` | 16px | 400 | 1.6 | -0.01em |
| `caption` | 14px | 500 | 1.5 | 0 |
| `eyebrow` | 13px | 600 | 1.4 | +0.12em |

컴포넌트별 권장 제목: Hero 104–144 / Statement 64–80 / Split 56–72 / Modular 56–64 / Project 64–80 / Transition 56–80 (px).

## 5. Spacing

**기본 단위:** 8px 중심. 보조 미세 단위 4px 허용.

| Token | px | Token | px | Token | px |
|---|---:|---|---:|---|---:|
| `space-1` | 4 | `space-6` | 32 | `space-11` | 96 |
| `space-2` | 8 | `space-7` | 40 | `space-12` | 128 |
| `space-3` | 12 | `space-8` | 48 | `space-13` | 160 |
| `space-4` | 16 | `space-9` | 64 | `space-14` | 200 |
| `space-5` | 24 | `space-10` | 80 | `space-15` | 240 |

### 관계별 간격

| 관계 | 기본 | 범위 |
|---|---:|---:|
| Eyebrow → heading | 24px | 16–32px |
| Heading → lead text | 40px | 32–56px |
| Lead text → content grid | 80px | 64–96px |
| 카드 ↔ 카드 | 24px | 24–40px |
| 카드 내부 padding | 40px | 32–48px |
| 콘텐츠 그룹 간격 | 128px | 96–160px |
| 일반 섹션 수직 padding | 160px | 128–200px |
| Statement 섹션 수직 padding | 200–240px | 콘텐츠에 따라 조정 |

## 6. WAVRICK 컬러 시스템 v1.2

> [확정] 블루/네이비 계열을 사용한다. 아래 HEX는 **제안된 토큰**이며 CI 파일로 검증된 색상값은 아니다.

| Token | HEX | Role |
|---|---|---|
| `primary-navy` | `#142B58` | 기본 브랜드, 섹션 배경, 제목 |
| `primary-blue` | `#175BEB` | CTA, 핵심 키워드, 브랜드 블루 배경 |
| `deep-navy` | `#070D1B` | 히어로 및 몰입형 다크 배경 |
| `bright-blue` | `#326DFF` | 인터랙션, 호버, 그래픽 강조 |
| `ice-blue` | `#EAF1FF` | 라이트 섹션, 카드/정보 배경 |
| `light-background` | `#F5F8FF` | 여유 있는 라이트 섹션 |
| `white` | `#FFFFFF` | 흰 배경/다크 텍스트 반전 |
| `slate` | `#63718A` | 라이트 배경의 보조 글자 |
| `light-border` | `#DCE6F5` | 라이트 보더 |
| `dark-border` | `#2A3B5D` | 다크 보더 |

### 테마 사용
- Dark Editorial: 배경 Deep Navy, 글자 White, 강조 Bright Blue.
- Blue Modular: 배경 Primary Blue, 글자 White, 보조 Ice Blue.
- Light Content: 배경 White/Light/Ice, 제목 Primary Navy, 강조 Primary Blue.
- Red, Orange, Green 등 새 포인트 컬러는 별도 승인 없이 추가하지 않는다.
- 카드마다 색상을 바꾸기보다 섹션 단위로 배경과 대비를 관리한다.
- 명도 대비는 실제 조합마다 WCAG 읽기 가독성 검증이 필요하다.

## 7. Layout Components

| ID | 이름 | 구조 | 주요 규격 | 용도 |
|---|---|---|---|---|
| L01 | Editorial Hero | 초대형 타이포 + 오브젝트 | min-height 900px, 1600–1760px, headline 104–144px | 몰입형 도입 |
| L02 | Statement | 중앙 선언형 문장 | max-width 960–1200px, heading 64–80px, padding 200–240px | 핵심 메시지 |
| L03 | Split Editorial | 텍스트 + 이미지 | 6:6 기본, 5:7 / 7:5 변형, heading 56–72px | 소개·서비스 |
| L04 | Modular Grid | 규칙적 카드 | 3–4열, gap 24px, card-padding 32–40px, radius 16–24px | 서비스·기능 |
| L05 | Asymmetric Project Grid | 이미지 2열, 서로 다른 높이 | 이미지 간격 32–48px, column offset 120–200px | 포트폴리오 |
| L06 | Full-bleed Transition | 100vw 장면 전환 | height 500–900px, 곡선 깊이 120–240px | 챕터 전환 |

### 카드
- Editorial Card: 이미지 중심, radius 0–8px, 미니멀 메타데이터, 16:10 이미지 권장.
- Modular Card: radius 20–32px까지 확장 가능, padding 40px, 명확한 제목/설명/링크 위계.
- 둥근 카드와 날카로운 에디토리얼 카드를 같은 위치에서 무작위 혼용하지 않는다.

### 섹션 조합
- 헤드라인이 강한 섹션 2개를 연속 배치하지 않음.
- 비대칭 섹션 뒤에는 상대적으로 안정적인 정렬의 정보 섹션 권장.
- 카드가 밀집된 섹션의 전후에는 읽기/휴식 여백 확보.
- 강한 스크롤 애니메이션은 핵심 구간에 한정.
- 레이아웃 컴포넌트는 **페이지 순서 확정이 아니며**, 콘텐츠에 맞춰 조합한다.

## 8. 현재 작업 대상 — Centered Immersive Hero

**[확정]** L01을 중앙 정렬형으로 변형하는 B안. 기존의 비대칭 L01 목업과 혼동하지 말 것.

### 데스크톱 기준 좌표 (1920×1080 설계 가이드)

| Element | 기준 위치 | 기준 치수/규칙 |
|---|---|---|
| Header | top 0 | height 88px, 콘텐츠 가로 1600px |
| Logo | x ≈160, y ≈32 | 원본 로고 에셋 우선 |
| Navigation | right ≈160px | 헤더 우측 정렬 |
| English display | 중앙, top ≈230 | max-width 1500px, font 104–144px |
| Korean subtitle | 중앙, top ≈585 | max-width 1100px, 24–28px |
| Hero object | 중앙, top ≈700 | 약 640×300px 공간 확보 |
| Scroll indicator | 화면 아래 약 40px | 비주얼 대비 충분히 확보 |

좌표는 고정된 절댓값 요구가 아니라 1920×1080 비례 기준이다. 화면 높이가 달라지면 `clamp`, `min`, Grid/Flex 레이아웃으로 충돌을 방지한다. 타이포와 오브젝트가 겹치지 않는 것이 우선.

### 임시 카피
- English: `BEYOND THE OBVIOUS`
- Korean: `익숙한 답을 넘어, 새로운 가능성을 발견하다`
- [미확정] 문구 자체는 현재 프로토타입에 사용했으나 이 문서에서 최종 카피 확정으로 간주하지 않는다.

### Hero 스크롤 시나리오 (프로토타입 사양)
- 히어로 스크롤 영역 약 220vh; 내부 sticky 100vh.
- Intro: 큰 카피 → 서브 카피 → 오브젝트 순차 등장.
- Scroll 0–35%: 카피가 완만하게 위로 이동하고 오브젝트가 확장.
- Scroll 35–75%: 모듈 구조물이 회전/조립되며 은은한 블루 글로우 확대.
- Scroll 75–100%: 카피 감소, 오브젝트 확대, Deep Navy로 전환해 다음 섹션으로 연결.
- 지나치게 빠른 반복·상하 흔들림·강한 플래시는 피한다.
- [미확정] 오브젝트의 최종 3D 조형, 재질, 실제 자산 사용 여부.

## 9. Motion System

| Type | Duration | Easing | Usage |
|---|---:|---|---|
| Micro hover | 200ms | ease-out | 링크, 버튼 |
| Card hover | 350ms | ease-out | 카드 |
| Text reveal | 700ms | cubic-bezier(0.22,1,0.36,1) | 카피 등장 |
| Image reveal | 900ms | cubic-bezier(0.22,1,0.36,1) | 이미지 등장 |
| Section transition | 1000ms | ease-in-out | 챕터 전환 |
| Scroll-linked | 스크롤 연동 | progress interpolation | 오브젝트 이동/회전 |

- `prefers-reduced-motion: reduce` 대응: 반복·회전·강한 스크롤 모션을 줄이거나 비활성화.
- 성능: 가능한 `transform`, `opacity` 위주; 스크롤 핸들러는 `requestAnimationFrame` 기반으로 갱신.

## 10. Responsive System

| 항목 | 1920 | 1440 | 768 | 390 |
|---|---:|---:|---:|---:|
| 좌우 거터 | 160 | 64 | 32 | 20 |
| 실효 콘텐츠 폭 | 1600 | 1312 | 704 | 350 |
| Grid | 12 | 12 | 6 | 4 |
| Display XL | 144 | 108 | 72 | 44 |
| H1 | 80 | 68 | 48 | 36 |
| Body | 18 | 18 | 17 | 16 |
| 일반 섹션 수직 padding | 160–200 | 128–160 | 96 | 72–96 |
| 카드 gap | 24–32 | 24 | 20 | 16 |
| 카드 수 | 3–4열 | 3열 | 2열 | 1열 |

수치는 px. `1920`의 160px 마진은 1600px max-container의 결과이며, 브레이크포인트에서는 실제 거터 정책을 따른다. 모바일 오브젝트는 비율만 줄이지 않고 텍스트 아래로 재배치하거나 부분 크롭 가능.

## 11. Design Tokens (CSS)

```css
:root {
  --container-wide: 1760px;
  --container-default: 1600px;
  --container-narrow: 1280px;
  --container-reading: 960px;
  --page-gutter: 40px;
  --grid-columns: 12;
  --grid-gap: 24px;

  --font-body: "Pretendard Variable", "Pretendard", "Noto Sans KR", sans-serif;
  --font-display: "Pretendard Variable", "Pretendard", "Noto Sans KR", sans-serif;

  --text-display-xl: 144px;
  --text-display-lg: 104px;
  --text-h1: 80px;
  --text-h2: 56px;
  --text-h3: 40px;
  --text-h4: 32px;
  --text-body-lg: 24px;
  --text-body: 18px;
  --text-body-sm: 16px;
  --text-caption: 14px;
  --text-eyebrow: 13px;

  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 24px;
  --space-6: 32px;
  --space-7: 40px;
  --space-8: 48px;
  --space-9: 64px;
  --space-10: 80px;
  --space-11: 96px;
  --space-12: 128px;
  --space-13: 160px;
  --space-14: 200px;
  --space-15: 240px;

  --section-padding: 160px;
  --section-title-gap: 80px;
  --radius-sm: 8px;
  --radius-md: 16px;
  --radius-lg: 24px;
  --radius-xl: 32px;
  --radius-pill: 999px;

  --color-primary-navy: #142B58;
  --color-primary-blue: #175BEB;
  --color-deep-navy: #070D1B;
  --color-bright-blue: #326DFF;
  --color-ice-blue: #EAF1FF;
  --color-bg-light: #F5F8FF;
  --color-white: #FFFFFF;
  --color-slate: #63718A;
  --color-border-light: #DCE6F5;
  --color-border-dark: #2A3B5D;

  --duration-fast: 200ms;
  --duration-normal: 350ms;
  --duration-reveal: 700ms;
  --duration-section: 1000ms;
  --ease-out-expo: cubic-bezier(0.22, 1, 0.36, 1);
}

.theme-dark {
  --section-bg: var(--color-deep-navy);
  --section-text: var(--color-white);
  --section-accent: var(--color-bright-blue);
}
.theme-blue {
  --section-bg: var(--color-primary-blue);
  --section-text: var(--color-white);
  --section-accent: var(--color-ice-blue);
}
.theme-light {
  --section-bg: var(--color-white);
  --section-text: var(--color-primary-navy);
  --section-accent: var(--color-primary-blue);
}

.container {
  width: min(calc(100% - var(--page-gutter) * 2), var(--container-default));
  margin-inline: auto;
}
.section { padding-block: var(--section-padding); }

@media (max-width: 1440px) {
  :root {
    --page-gutter: 64px;
    --text-display-xl: 108px;
    --text-h1: 68px;
    --section-padding: 128px;
  }
}
@media (max-width: 1024px) {
  :root {
    --page-gutter: 32px;
    --grid-columns: 6;
    --text-display-xl: 72px;
    --text-h1: 48px;
    --section-padding: 96px;
  }
}
@media (max-width: 767px) {
  :root {
    --page-gutter: 20px;
    --grid-columns: 4;
    --grid-gap: 16px;
    --text-display-xl: 44px;
    --text-h1: 36px;
    --text-body: 16px;
    --section-padding: 80px;
    --section-title-gap: 48px;
  }
}
@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
}
```

> **구현 주의:** 1440px 이하에서는 `--page-gutter:64px`을 사용하므로 1440px 뷰포트의 실효 컨테이너가 1312px이다. 1920px에서는 max-width 1600px이므로 결과적으로 좌우 마진 160px이다.

## 12. Depth & Elevation

- 다크 화면은 깊은 배경 → 은은한 글로우 → 오브젝트 → 텍스트/버튼 순서로 레이어를 구성한다.
- 카드에는 과도한 드롭 섀도보다 배경 대비와 약한 테두리를 우선 사용한다.
- 고정 헤더/메뉴는 히어로 인터랙션보다 상위 레이어로 처리한다.
- 글로우나 블러는 메인 문구의 가독성을 해치지 않도록 제한한다.
- 정확한 그림자/블러 수치는 실제 시안에서 검토 후 확정.

## 13. Do / Don't

**Do**
- 실제 렌더링된 1920×1080 화면을 캡처해 원본 레퍼런스의 *비례·밀도·리듬*과 비교.
- 1600px 콘텐츠 정렬선과 타이포 위계 일관성 확인.
- 모바일에서 레이아웃 재구성, 키보드 접근성, reduced-motion 대응.
- 수정 전 현재 코드·자산·동작을 확인하고 보존.

**Don't**
- 설명만 보고 임의의 오브젝트나 카드, 카피를 추가하지 않는다.
- 다른 프로젝트 컬러·모션·레이아웃을 가져오지 않는다.
- 레퍼런스를 픽셀 단위로 따라 만들지 않는다.
- 원하지 않은 React / 빌드 도구 도입 금지.
- 승인되지 않은 디자인 방향/카피 변경 금지.

## 14. Codex 전달 지침

1. 현재 프로젝트의 HTML/CSS/JS를 먼저 읽고, 기존 파일과 인터랙션을 보존한다.
2. 본 문서에서 `[확정]` 항목을 우선 적용하고 `[설계 기준]` 수치는 시각적 검증을 위한 출발점으로 다룬다.
3. 1920×1080 화면에서 렌더링·스크롤 구간을 점검한다.
4. 문제점과 수정 전후 차이를 알려준다. 사용자가 승인하기 전에 시안을 임의로 크게 바꾸지 않는다.
5. 최종 페이지 구성은 아직 미확정이므로 현재는 Centered Immersive Hero에 집중한다.

---

**현재 단계:** 디자인 시스템 파일 정리 완료 / 히어로 프로토타입 검증 진행 / 최종 시안 미확정.
