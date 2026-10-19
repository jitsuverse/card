# 카드뉴스 부품 키트

학원 홍보용 인스타그램 카드뉴스(1080×1440, 3:4)를 만드는 브라우저 도구입니다. 카드 내용은 HTML(`kit/cards.html`)로 쓰고, 왼쪽 옵션 패널에서 폰트·컬러·도형 모양·카드 배경을 바꾼 뒤 PNG(ZIP)로 내보냅니다.

카드 내용은 **Claude가 디자인 규칙에 맞춰 HTML로 씁니다.** 이 저장소에서 Claude Code를 실행하면 `CLAUDE.md`(디자인 규칙과 작업 순서)를 자동으로 읽습니다. 개발자는 이 문서로 구조와 실행 방법을 확인하면 됩니다.

## ⚠️ 홈페이지에 이식할 때 꼭 지킬 것 (v1.4)

1. **추천 스타일 6개를 그대로 넣는다** — `assets/config.js`의 `PRESET_STYLES`(미니멀 · 기본 · 라인 · 상단 · 다크 · 사진 스타일). 관리자가 정한 값이라 홈페이지에서 고치지 않는다. 홈페이지 `lib/cardkit/defaultStyles.js`(지금 5칸·빈 배열)를 **6칸**으로 늘려 이 값을 쓰고, 원장님이 스타일을 고를 때도 **학원 메인 컬러를 덮어쓴다**(`render.js withBrandColor` — 너무 밝은 색이면 스타일 색 유지).
2. **'내 스타일'(관리자 전용) 메뉴는 넣지 않는다.** 웹앱에서 추천 스타일을 만들 때만 쓰는 메뉴다(칸에 저장 → '스타일 코드 복사' → `PRESET_STYLES`에 붙여 넣기). 원장님 화면에는 추천 스타일 6개 고르기만 있다.
3. **메뉴는 구조만 따르고, 디자인은 홈페이지 것으로.** → 자세한 명세와 바꿀 곳 체크리스트: **[`docs/MENU-STRUCTURE.md`](docs/MENU-STRUCTURE.md)** (지금 데브 서버와 다른 곳 표 · 화면 캡처 · 동작 규칙). 웹앱 화면(`kit/index.html` + `panel/studio.css`)은 데브 서버를 흉내 낸 시안이다. 가져갈 것은 **구조**뿐이다:
   - 글 설정 → '생성하기' → 만드는 중 표시 → 카드뉴스 디자인 패널이 열림
   - 디자인 패널 맨 위 '스타일 바꾸기'(추천 스타일 6개를 정사각 견본 카드로, `main.js drawStyleThumbs`) + '처음 스타일로 되돌리기'
   - 그 아래 세부 옵션: 1 폰트 · 2 컬러 · 3 도형 · 4 표지 ('카드 배경' 메뉴는 숨김 — 추천 스타일 값을 씀)
   - 결과 화면: 카드마다 섹션(카드 + 이미지 저장 + 블로그 본문)
   색·글꼴·간격·버튼 모양은 **홈페이지 디자인 시스템**을 따른다. `studio.css`를 옮기지 않는다.
4. **비용: 예시 덱을 전부 넣지 말고 `kit/examples/deck-types.json`대로 고른다.** 지금 홈페이지(`buildKitSystem`)는 `kit/examples/*.html`을 전부 프롬프트에 넣는다. 예시 덱이 12벌 → 19벌로 늘어서, 그대로 동기화하면 덱 하나 만드는 비용이 약 $0.62 → $0.95로 오른다. 표대로 기준 덱 + 그 콘텐츠 타입 덱만 넣으면 약 $0.55(방법·캐시 순서는 `docs/PROMPT-CACHING.md` '콘텐츠 타입별 예시 덱').
5. **`kit/main.js`에만 있는 처리는 홈페이지 렌더 코드에도 필요하다**(동기화 스크립트는 `assets/` 엔진과 CSS만 가져간다):
   - 사진 모음: 덱의 `pool:주제`(`data-bgimg`·`data-src`·`data-srcs`)를 `config.js PHOTO_POOL` 사진으로 바꾸기(`resolvePools` — 덱마다 다르게, 덱 안에서 겹치지 않게) + 사진 도구 '다른 사진' 버튼
   - 사진 유형 5가지: 교재 목업 · 강사 누끼 · 사진 묶음(1~4장)은 모든 스타일, **사진 강조(사진 1장 + 도식)와 배경 사진은 사진 스타일에서만**(배경 사진은 덱마다 첫 한 장 — `fit.js fitPhoto`) — 다른 스타일이면 사진 강조의 사진만 빼고 카드에 `.no-photo`(`stripPhotos`), 배경 사진은 사진 스타일에서만 깔기(`bgPhoto`)
   - 메인 컬러 표지의 아이콘: `renderIcon(이름, 강조색, 메인 컬러, true)` — 세 번째 값이 **메인 컬러**(배경색 ✗)
6. **v1.4 홈페이지 코드 요청 6건은 [`docs/HOMEPAGE-FIXES.md`](docs/HOMEPAGE-FIXES.md) 위쪽 표** — 그림자·호버 · 스타일 칸 127px · 반복 도식 다시 만들기 · 넘침 자동 재생성 · 첫 장으로 캐시 데우기(비용) · 새 콘텐츠 타입 `study_tip` · `parent_guide`.

## 폴더 구조

```
index.html          → kit/ 으로 이동
kit/
  index.html        화면 (데브 서버 콘텐츠 스튜디오를 흉내 낸 시안: 글 설정 ↔ 카드뉴스 디자인 · 결과)
  main.js           덱 불러오기 · 옵션 적용 · 사진 넣기 · PNG/ZIP 내보내기
  kit.css           카드 부품 스타일 (.kcard · .k-* 이름공간)
  cards.html        작업 중인 덱 (카드 HTML 조각)
  examples/*.html   예시 덱 19벌 — 기준 덱은 english-grammar, 시험분석은 고정 구성 exam-analysis
  examples/deck-types.json  홈페이지 콘텐츠 타입 → 프롬프트에 넣을 예시 덱 (비용)
  gallery/*.png     예시 덱 미리보기 (부품 도감)
  PARTS.md          부품 목록 (Claude가 카드를 만들 때 참고)
assets/
  config.js         디자인 토큰 (글자 5단계·자간·줄간격·도형·여백), 폰트 목록, 옵션 목록, 기본값
  render.js         옵션 → CSS 변수(themeVars), 카드 배경 판, 책 목업·사진 틀·강사 사진 HTML
  card.css          표지·사진 틀·책 목업·강사 사진 스타일
  fit.js            렌더 후 보정: 글자 간격 · 여백 활용 · 사진 묶음 배치 · 사진 스타일
  icons.js          2D 아이콘 세트 · phosphor.js 번호/체크 동그라미 아이콘
  cutout.js         강사 사진 배경 제거 (MediaPipe)
panel/
  panel.js          옵션 패널 (추천 스타일 고르기 · 폰트 · 컬러 · 도형 · 표지 · 관리자용 '내 스타일')
  app.css           패널 기본 스타일
  studio.css        웹앱 겉모습(어두운 테마) — 홈페이지에는 옮기지 않는다
scripts/
  serve.py          개발 서버 (캐시 끔)
  kit-check.mjs     디자인 규칙 자동 검사
  kit-shot.mjs      카드 사진 찍기 (확인용)
  kit-lib.mjs       위 두 스크립트 공용 (작은 서버 + Chrome 실행)
docs/
  DESIGN-NOTES.md   디자인 규칙이 생긴 이유·세부 수치
  MENU-STRUCTURE.md 데브 서버에 옮길 메뉴 구조 (바꿀 곳 체크리스트 · 캡처는 menu/)
  PROMPT-CACHING.md 홈페이지에서 Claude API로 덱을 만들 때 비용 줄이는 법
  reference/        기준 덱의 원형(초기 영어 리딩 덱)
CLAUDE.md           Claude용 작업 지침 (디자인 규칙 · 카드 만드는 순서 · 검사)
```

## 실행

빌드 과정이 없는 순수 ES 모듈입니다. `file://`로는 열리지 않으니 정적 서버로 띄웁니다.

```bash
python3 scripts/serve.py 5173
```

- http://localhost:5173/kit/ → 작업 덱(`kit/cards.html`)
- http://localhost:5173/kit/?deck=examples/english-grammar → 예시 덱(기준 덱)

폴더 구조(`kit/`·`assets/`·`panel/`가 나란히 있는 것)는 그대로 유지해야 합니다. 서로 `../assets/...`처럼 상대 경로로 불러옵니다.

## 검사 (Node 18 이상 + Chrome)

```bash
npm install
```

```bash
node scripts/kit-check.mjs --quick
```

- `--quick`: 폰트 1종 (약 8초) · `--rep`: 넘침이 잘 나는 대표 폰트 8종 (약 9초) · 옵션 없음: 폰트 40종 × 카드 배경 4종 + 사진 스타일 (약 30초) · `--uses k-flash,k-report`: 그 부품을 쓰는 덱만 · `--all`: 예시 덱 전부 (10분 넘게, `--rep --all`은 약 3분)
- 넘침(도형 밖으로 나간 글자 포함), 글자 크기 5단계, 자간·줄간격, 글자 색·굵기 짝, 제목 폰트 사용 범위, 모든 카드에 메인 컬러 한 곳 이상, 도식 영역 세미볼드, 페이지 오류를 검사합니다.
- Chrome이 기본 경로(Mac `/Applications/Google Chrome.app`, Linux `/usr/bin/google-chrome` 등)에 없으면 `CHROME_PATH` 환경변수로 지정합니다.
- 카드 그림 확인: `node scripts/kit-shot.mjs --ids a,b --scale 0.5 --sheet out.png` (`--photo` 사진 스타일, `--drop g-book` 사진 자리 뺀 모습)

카드나 `kit.css`·`assets/`를 고친 뒤에는 검사를 통과해야 합니다. 디자인 규칙은 이 검사로 지켜집니다.

## 동작 방식 (이식할 때 알아둘 것)

- **덱 불러오기**: `main.js`가 `?deck=` 값의 HTML 파일(`kit/cards.html` 등)을 fetch해 `#deck`에 넣고, 사진·아이콘 자리를 채운 뒤 보정합니다. 덱 하나 = `<div class="kcard">` 카드 조각의 묶음입니다.
- **렌더 후 보정 (`assets/fit.js`, 이 순서로 매번)**: `fitPhotoSets`(사진 묶음을 원본 비율로 배치) → `fitTextGaps`·`fitSplitHead`(폰트별 글자 간격) → `fitPhoto`(사진 스타일: 도식이 작은 카드에만 배경 사진, 도식은 위로) → `fitAir`(콘텐츠 영역에 남는 자리만큼 세로 간격 넓히기). 웹폰트·사진을 불러온 뒤 한 번 더 부릅니다(`main.js` `fit()`). **홈페이지에서 카드를 그릴 때도 같은 순서로 불러야 같은 그림이 나옵니다.**
- **옵션**: 패널 값(`state`) → `themeVars()`가 CSS 변수로 바꿔 `#deck`에 넣고, `kit.css`가 그 변수로 그립니다. 카드마다 `data-shape`·`data-style`·`data-card`(표지는 `data-align`·`data-bg`) 속성이 붙습니다.
- **추천 스타일 / 내 스타일**: 원장님은 `config.js PRESET_STYLES` 6개 중 하나를 고릅니다. '내 스타일'은 관리자가 추천 스타일을 만드는 도구(브라우저 localStorage `cardnews.myStyles.v1`, 빈 칸 = 추천 스타일)라 홈페이지에는 넣지 않습니다(위 ⚠️ 2). 학원 메인 컬러는 `withBrandColor`로 어떤 스타일에든 덮어씁니다(웹앱 데모: 왼쪽 메뉴 아래 '학원 설정' 또는 `?brand=%23RRGGBB`).
- **사진**: 미리보기에서 사진 자리를 눌러 넣은 이미지는 메모리에만 있습니다(새로고침하면 사라짐). 강사 사진은 브라우저에서 배경을 지웁니다(`cutout.js`). 사진 자리에 마우스를 올리면 '클릭해서 사진 변경' 안내가 뜨고, 교재·강사·사진 강조 사진은 ×로 자리째 뺄 수 있습니다(카드가 사진 없는 모양으로 바뀜).
- **덱에 미리 넣는 사진 (Unsplash 무료 사진)**: 키트에는 사진 파일이 없습니다. 덱에는 보통 **주제만** 적고(`pool:classroom` · `exam` · `writing` · `books` · `desk` · `help` · `school`), `config.js PHOTO_POOL`의 눈으로 확인한 사진 중에서 고릅니다(위 ⚠️ 5). 특정 사진은 주소를 직접 적습니다 — 카드 `data-bgimg`(사진 스타일 배경), 사진 자리 `data-src`(사진·교재), 사진 묶음 `data-srcs="주소1 주소2"`. 주소 형식 `https://images.unsplash.com/photo-…?w=1200&q=80&auto=format&fit=crop`. 고르는 기준: 얼굴이 정면으로 드러나지 않는 사진, 건전한 교육 장면만(CLAUDE.md).
  - 홈페이지 AI가 덱을 만들 때 사진을 붙이려면: AI는 검색어(예: "exam paper hands")만 적고, 서버가 [Unsplash API](https://unsplash.com/developers) 검색으로 주소를 받아 넣는 코드가 필요합니다(무료 키는 시간당 50회, 승인 후 늘어남). Unsplash는 주소를 직접 연결해 쓰는 방식을 허용합니다.
- **내보내기**: 카드마다 html-to-image로 1080×1440 PNG를 만들고 JSZip으로 묶어 내려받습니다. 전부 브라우저에서 처리하고 서버가 필요 없습니다.

### 외부에서 불러오는 것 (CSP 허용 필요)

| 무엇 | 주소 |
|---|---|
| 폰트 (40종) | `cdn.jsdelivr.net`(Pretendard·fonts-archive 등), `fonts.googleapis.com`·`fonts.gstatic.com` — 목록은 `config.js FONTS` |
| PNG 변환·ZIP | `cdn.jsdelivr.net/npm/html-to-image@1.11.11`, `cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1` |
| 사진 배경 제거 | `cdn.jsdelivr.net/npm/@mediapipe/tasks-vision`, `storage.googleapis.com/mediapipe-models` |
| 덱에 넣은 사진 | `images.unsplash.com` (CORS 허용 — PNG 내보내기에도 들어감) |

html-to-image는 PNG를 만들 때 웹폰트 CSS를 다시 읽으므로, 폰트 CSS 주소가 CORS를 허용해야 합니다(위 CDN들은 허용함).

## 홈페이지에 붙일 때 정할 것

1. **덱을 어떻게 만들지**: 지금은 Claude Code가 `kit/cards.html`을 직접 씁니다(작업 덱 = 학원 철학 11장). 홈페이지 안에서 만들려면 서버에서 Claude API에 주제·내용을 보내 카드 HTML을 받아 오는 흐름이 필요합니다. 이때 보낼 지침은 `CLAUDE.md`의 '디자인 규칙'·'카드뉴스 만들기'와 `kit/PARTS.md`입니다. 비용을 줄이는 방법은 `docs/PROMPT-CACHING.md`에 있습니다.
2. **덱을 어디에 저장할지**: 지금은 파일입니다(`?deck=` → `kit/<이름>.html`). DB에 저장한다면 `main.js`의 덱 불러오기(`fetch(\`${DECK}.html\`)`) 한 곳만 바꾸면 됩니다.
3. **받은 HTML을 검사할지**: Claude가 만든 덱도 `kit-check`를 통과해야 디자인 규칙이 지켜집니다. 서버에서 돌리려면 Node + Chrome(headless)이 필요합니다.
4. **사진·내 스타일 저장**: 지금은 브라우저에만 남습니다(위 '동작 방식' 참고).
5. **시험분석 카드 조립 (개발자용)**: 시험분석은 고정 구성 10장(`kit/examples/exam-analysis.html`, 순서·부품 표는 `kit/PARTS.md` '시험분석 덱')이라 AI 없이 데이터로 HTML을 조립할 수 있습니다. 적중 문항 카드는 문항 수에 따라 부품이 바뀝니다:
   - 1~5문항: `.k-panel.k-hits` 표 줄(`p.k-hits-head` + 문항마다 `p` > `b`번호 · `span`개념 · `em`난이도, 상은 `em.up`)
   - 6~10문항: `.k-hero`(`.k-big` N문항) + `.k-hitgrid` 번호 + 난이도 타일(상은 `p.up`)
   - 11문항 이상: `.k-hero` + `.k-hitgrid.nums` 번호만 타일(상은 `p.up`) + `p.k-hitkey` 범례 — 20문항까지
   예시는 `kit/cards.html`의 g(3) · g5 · g10 · g15 카드입니다.

## 라이선스 메모

- Phosphor Icons (MIT) — `assets/phosphor.js`에 경로만 넣어 씀
- MediaPipe (Apache 2.0) — CDN에서 불러옴
- 폰트: Pretendard(OFL), Google Fonts(OFL), 기관 무료 폰트(상업적 사용 가능 — 각 약관), 카페24 써라운드(카페24 무료 폰트 약관)
