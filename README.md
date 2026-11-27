# WAVRICK Landing

WAVRICK 브랜드 소개를 위한 정적 랜딩 페이지입니다. HTML, CSS, 바닐라 JavaScript와 Three.js로 동작하며, React 런타임이나 서버 API는 필요하지 않습니다.

## 개발

```bash
npm ci
npm run dev
```

## 배포

```bash
npm ci
npm run build
```

`dist/` 폴더를 정적 호스팅에 배포하면 됩니다. GitHub Pages는 `main`에 푸시하면 Actions가 `/wavrick-landing/` 경로를 기준으로 빌드하고 배포합니다.

## 주요 파일

- `index.html`: 페이지 구조
- `styles/style.css`: 전체 페이지 스타일
- `scripts/script.js`: 메뉴, 섹션 인터랙션
- `scripts/hero-scene.js`: Three.js 큐브 및 배경 씬
- `scripts/glass-fold.js`: 마지막 섹션 물결 셰이더
- `assets/brand`, `assets/images`, `assets/fonts`: 로고, 이미지, Pretendard 폰트
- `.github/workflows/deploy-pages.yml`: GitHub Pages 배포 작업
