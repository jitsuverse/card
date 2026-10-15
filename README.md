# 카드뉴스 부품 키트

학원 홍보용 인스타그램 카드뉴스(1080×1440, 3:4)를 만드는 브라우저 도구입니다. 카드 내용은 HTML(`kit/cards.html`)로 쓰고, 왼쪽 옵션 패널에서 폰트·컬러·도형 모양·카드 배경을 바꾼 뒤 PNG(ZIP)로 내보냅니다.

카드 내용은 **Claude가 디자인 규칙에 맞춰 HTML로 씁니다.** 이 저장소에서 Claude Code를 실행하면 `CLAUDE.md`(디자인 규칙과 작업 순서)를 자동으로 읽습니다. 개발자는 이 문서로 구조와 실행 방법을 확인하면 됩니다.

## 폴더 구조

```
index.html          → kit/ 으로 이동
kit/
  index.html        화면 (왼쪽 옵션 패널 + 카드 미리보기 + 내보내기 버튼)
  main.js           덱 불러오기 · 옵션 적용 · 사진 넣기 · PNG/ZIP 내보내기
  kit.css           카드 부품 스타일 (.kcard · .k-* 이름공간)
  cards.html        작업 중인 덱 (카드 HTML 조각)
  examples/*.html   예시 덱 13벌 — 기준 덱은 english-grammar, 시험분석은 고정 구성 exam-analysis
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
  panel.js          왼쪽 옵션 패널 (내 스타일 저장·폰트·컬러·도형·배경·표지)
  app.css           화면 레이아웃·패널 스타일
scripts/
  serve.py          개발 서버 (캐시 끔)
  kit-check.mjs     디자인 규칙 자동 검사
  kit-shot.mjs      카드 사진 찍기 (확인용)
  kit-lib.mjs       위 두 스크립트 공용 (작은 서버 + Chrome 실행)
docs/
  DESIGN-NOTES.md   디자인 규칙이 생긴 이유·세부 수치
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

- `--quick`: 폰트 1종 (약 5초) · 옵션 없음: 폰트 21종 × 카드 배경 4종 + 사진 스타일 (약 20초) · `--all`: 예시 덱까지 (약 60초)
- 넘침, 글자 크기 5단계, 자간·줄간격, 글자 색·굵기 짝, 제목 폰트 사용 범위, 페이지 오류를 검사합니다.
- Chrome이 기본 경로(Mac `/Applications/Google Chrome.app`, Linux `/usr/bin/google-chrome` 등)에 없으면 `CHROME_PATH` 환경변수로 지정합니다.
- 카드 그림 확인: `node scripts/kit-shot.mjs --ids a,b --scale 0.5 --sheet out.png` (`--photo` 사진 스타일, `--drop g-book` 사진 자리 뺀 모습)

카드나 `kit.css`·`assets/`를 고친 뒤에는 검사를 통과해야 합니다. 디자인 규칙은 이 검사로 지켜집니다.

## 동작 방식 (이식할 때 알아둘 것)

- **덱 불러오기**: `main.js`가 `?deck=` 값의 HTML 파일(`kit/cards.html` 등)을 fetch해 `#deck`에 넣고, 사진·아이콘 자리를 채운 뒤 보정합니다. 덱 하나 = `<div class="kcard">` 카드 조각의 묶음입니다.
- **렌더 후 보정 (`assets/fit.js`, 이 순서로 매번)**: `fitPhotoSets`(사진 묶음을 원본 비율로 배치) → `fitTextGaps`·`fitSplitHead`(폰트별 글자 간격) → `fitPhoto`(사진 스타일: 도식이 작은 카드에만 배경 사진, 도식은 위로) → `fitAir`(콘텐츠 영역에 남는 자리만큼 세로 간격 넓히기). 웹폰트·사진을 불러온 뒤 한 번 더 부릅니다(`main.js` `fit()`). **홈페이지에서 카드를 그릴 때도 같은 순서로 불러야 같은 그림이 나옵니다.**
- **옵션**: 패널 값(`state`) → `themeVars()`가 CSS 변수로 바꿔 `#deck`에 넣고, `kit.css`가 그 변수로 그립니다. 카드마다 `data-shape`·`data-style`·`data-card`(표지는 `data-align`·`data-bg`) 속성이 붙습니다.
- **내 스타일**: 옵션 조합 6칸을 브라우저 localStorage(`cardnews.myStyles.v1`)에 저장합니다. 6번 칸은 기본으로 **'사진' 스타일**(옵션 `photo: true`)이고, 저장하면 덮어씁니다. 로그인 사용자별로 저장하려면 이 부분을 서버 저장으로 바꿔야 합니다.
- **사진**: 미리보기에서 사진 자리를 눌러 넣은 이미지는 메모리에만 있습니다(새로고침하면 사라짐). 강사 사진은 브라우저에서 배경을 지웁니다(`cutout.js`). 사진 자리에 마우스를 올리면 '클릭해서 사진 변경' 안내가 뜨고, 교재·강사·사진 강조 사진은 ×로 자리째 뺄 수 있습니다(카드가 사진 없는 모양으로 바뀜).
- **덱에 미리 넣는 사진 (Unsplash 무료 사진 주소)**: 키트에는 사진 파일이 없습니다. 덱을 만들 때 사진 주소를 적습니다 — 카드 `data-bgimg`(사진 스타일 배경), 사진 자리 `data-src`(사진·교재), 사진 묶음 `data-srcs="주소1 주소2"`. 주소 형식 `https://images.unsplash.com/photo-…?w=1200&q=80&auto=format&fit=crop`. 고르는 기준: 얼굴이 정면으로 드러나지 않는 사진, 건전한 교육 장면만(CLAUDE.md).
  - 홈페이지 AI가 덱을 만들 때 사진을 붙이려면: AI는 검색어(예: "exam paper hands")만 적고, 서버가 [Unsplash API](https://unsplash.com/developers) 검색으로 주소를 받아 넣는 코드가 필요합니다(무료 키는 시간당 50회, 승인 후 늘어남). Unsplash는 주소를 직접 연결해 쓰는 방식을 허용합니다.
- **내보내기**: 카드마다 html-to-image로 1080×1440 PNG를 만들고 JSZip으로 묶어 내려받습니다. 전부 브라우저에서 처리하고 서버가 필요 없습니다.

### 외부에서 불러오는 것 (CSP 허용 필요)

| 무엇 | 주소 |
|---|---|
| 폰트 | `cdn.jsdelivr.net`(Pretendard), `fonts.googleapis.com`·`fonts.gstatic.com`(Noto Sans KR 등) |
| PNG 변환·ZIP | `cdn.jsdelivr.net/npm/html-to-image@1.11.11`, `cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1` |
| 사진 배경 제거 | `cdn.jsdelivr.net/npm/@mediapipe/tasks-vision`, `storage.googleapis.com/mediapipe-models` |
| 덱에 넣은 사진 | `images.unsplash.com` (CORS 허용 — PNG 내보내기에도 들어감) |

html-to-image는 PNG를 만들 때 웹폰트 CSS를 다시 읽으므로, 폰트 CSS 주소가 CORS를 허용해야 합니다(위 CDN들은 허용함).

## 홈페이지에 붙일 때 정할 것

1. **덱을 어떻게 만들지**: 지금은 Claude Code가 `kit/cards.html`을 직접 씁니다. 홈페이지 안에서 만들려면 서버에서 Claude API에 주제·내용을 보내 카드 HTML을 받아 오는 흐름이 필요합니다. 이때 보낼 지침은 `CLAUDE.md`의 '디자인 규칙'·'카드뉴스 만들기'와 `kit/PARTS.md`입니다. 비용을 줄이는 방법은 `docs/PROMPT-CACHING.md`에 있습니다.
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
- 폰트: Pretendard(OFL), Google Fonts(OFL)
