# 홈페이지 작업 요청서 — 카드뉴스 키트 v1.4 (Claude용)

> 이 문서는 **홈페이지 저장소(celline1234563/edurichbrain)에서 작업할 Claude**에게 주는 요청서다.
> 키트(jitsuverse/card)는 디자인·엔진을 맡고, 아래 일은 홈페이지 코드에서만 할 수 있는 것이다.
> 위치는 2026-10-19 `dev` 브랜치(커밋 794d00df) 기준 — 줄 번호가 달라졌으면 같은 코드를 찾아서 고친다.

## 0. 시작 전에 (필수)

1. **키트 v1.4 동기화부터**: `node scripts/cardkit-sync.mjs`로 jitsuverse/card 최신(v1.4, 커밋 22694f1)을 가져온다.
   - 작업 3·4가 쓰는 함수(`kitRepeatedCards` · `kitAvoidNote` · `measureKitOverflow` · `kitOverflowNote` · `OVERFLOW_TOLERANCE`)가 **v1.4 엔진에만** 있다. 동기화 전 `lib/cardkit/engine/render.js` · `fit.js`에는 없다.
   - 동기화 뒤 `lib/cardkit/cardkit.test.js` 등 기존 테스트가 통과하는지 확인한다.
2. 디자인(색·간격·카드 모양)은 **키트 CSS가 정한다** — 이 작업에서 카드 CSS를 홈페이지 쪽에서 덮어쓰지 않는다.
3. 작업마다 브랜치 · PR을 따로 내면 검토가 쉽다(1·2는 작아서 묶어도 됨).

## 할 일 요약

| # | 할 일 | 크기 | 파일 |
|---|---|---|---|
| 1 | 카드 미리보기 그림자·호버 확대 빼기 | 작음 | `app/blog/components/card-news/layouts/SectionBlock.js` |
| 2 | 스타일 견본 칸 127px 고정 + 자동 줄바꿈 | 작음 | `app/content-studio/components/KitStyleSwatches.js` |
| 3 | 한 덱 안 같은 주 도식 반복 → 겹친 카드만 다시 생성 | 중간 | `lib/cardkit/generateKitCards.js` (`generateKitDeck`) |
| 4 | 넘친 카드 자동으로 재서 한 번 다시 생성 | 중간 | `app/blog/components/card-news/kit/KitCard.js` + 재생성 경로 |
| 5 | 사진 스타일 배경 사진은 **덱마다 한 장만** | 작음 | `lib/cardkit/hydrate.js` (또는 생성 직후 HTML) |
| — | ~~첫 장으로 캐시 데우기~~ | — | **이미 되어 있음**(`generateKitDeck`이 표지 먼저 → 나머지 병렬). 할 일 없음 |
| — | 새 콘텐츠 타입 `study_tip` · `parent_guide` | 보류 | 홈페이지에 그런 콘텐츠 타입이 없다 — 나중에 타입을 새로 만들 때만 `deck-types.json`과 같은 코드로 연결. 지금은 할 일 없음 |

---

## 1. 카드 미리보기 그림자·호버 확대 빼기

**위치**: `app/blog/components/card-news/layouts/SectionBlock.js` 약 90~105줄 — `data-cardnews-card="true"`인 div의 `style`과 `onMouseEnter/Leave`.

```js
boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',   // ← 지운다
transition: 'transform 0.2s ease',               // ← 지운다
cursor: 'pointer'                                // ← 지운다(카드 글자는 더블클릭 편집이라 text 커서가 따로 나온다)
onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}  // ← 지운다
onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}     // ← 지운다
```

**이유**: 카드는 그대로 저장되는 '완성 이미지'다. 그림자·확대가 있으면 실제 이미지와 달라 보이고, 키트의 그림자 스타일 옵션과 섞인다.
**확인**: 결과 화면 카드에 마우스를 올려도 크기·그림자가 변하지 않는다. `data-cardnews-card` 마커와 ZIP 다운로드(캡처)는 그대로 동작한다. 같은 파일 160~170줄 근처의 **편집 모드 `boxShadow`(isEditMode)는 건드리지 않는다**.

## 2. 스타일 견본 칸 127px 고정

**위치**: `app/content-studio/components/KitStyleSwatches.js` 약 93줄.

```js
// 지금
<div className="cardkit" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 8 }}>
// 바꿀 것 — 칸 크기는 127px 고정, 한 줄에 몇 개 들어갈지는 패널 너비에 맞춰 자동
<div className="cardkit" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, 127px)', gap: 8 }}>
```

**이유**: 모니터가 넓으면 견본이 지나치게 커진다(사용자 확정: "무조건 127픽셀, 배열은 자동 반응형").
**확인**: 디자인 패널 '스타일 바꾸기'와 글 설정 '카드뉴스 스타일' 둘 다(같은 컴포넌트를 쓰면 한 번에) 견본이 127px. 창을 줄이면 한 줄 개수만 줄어든다. 견본 안 카드 축소 비율이 칸 크기에 묶여 있으면 127px 기준으로 다시 맞춘다.

## 3. 한 덱 안 같은 주 도식 반복 → 겹친 카드만 다시 생성 (A안, 사용자 확정)

**문제**: `generateKitDeck`이 카드를 병렬로 만들어서, 카드끼리 서로 무슨 도식을 썼는지 모른다. dev에서 2·4번이 같은 `k-areas`, 3·7번이 같은 `k-vs`로 나왔다. 키트 규칙은 "한 덱 안에서 같은 주 도식은 한 번만".

**키트 함수**(v1.4 `lib/cardkit/engine/render.js`, DOM 없이 서버에서 동작):
- `kitMainPart(html)` → 카드의 주 도식 클래스(예: `'k-areas'`), 표지는 `null`
- `kitRepeatedCards(htmls)` → 앞 카드와 주 도식이 겹친 **뒤쪽** 카드 `[{ index, part, avoid }]`
- `kitAvoidNote(avoid)` → 다시 만들 때 요청에 붙일 문구

**위치**: `lib/cardkit/generateKitCards.js`의 `generateKitDeck`, `const raw = [first, ...rest];` 바로 뒤.

```js
import { kitRepeatedCards, kitAvoidNote } from './engine/render.js';

const raw = [first, ...rest];
// 같은 주 도식이 반복된 뒤쪽 카드만 다시 — 다시 만들어도 겹치면 한 번 더까지만
for (let round = 0; round < 2; round++) {
  const rep = kitRepeatedCards(raw.map((h) => h || ''));
  if (!rep.length) break;
  const again = await Promise.all(rep.map((r) => oneWith(r.index, kitAvoidNote(r.avoid))));
  rep.forEach((r, k) => { if (again[k]) raw[r.index] = again[k]; }); // 실패하면 원래 카드 유지
}
```

- `oneWith(index, instruction)`: 지금의 `one(index)`과 같되 `generateKitCard({... , instruction })`로 넘긴다. `buildKitCardRequest`는 이미 `p.instruction`을 `[원장님 요청 — 이번에 꼭 반영]`으로 붙인다(약 131·151줄) — 같은 칸을 쓴다.
- **고정 카드(`buildFixedKitCard`, 시험분석 레이더·적중)는 다시 만들지 않는다** — 겹쳐도 그대로 두거나, `rep`에서 고정 카드 인덱스를 뺀다.
- 진행 표시(`onProgress`)는 다시 만드는 카드 수만큼 total을 늘리거나 '마무리 중'으로 따로 보낸다.

**비용**: 겹친 카드 수만큼만(대개 0~2장, 캐시 읽기).
**확인**: 같은 도식이 두 번 나오도록 일부러 만든 HTML 배열로 단위 테스트 — `kitRepeatedCards`가 뒤쪽 카드만 돌려주는지, 다시 만든 카드로 바뀌는지, 실패 시 원래 카드가 남는지. 키트 저장소 `~/dev/cardkit-test/repro/dev-dupe.html`(사용자 PC)이 실제 dev 반복 사례.

## 4. 넘친 카드 자동으로 재서 한 번 다시 생성

**문제**: 웹앱은 검사(kit-check)로 넘침을 잡지만, 홈페이지는 AI가 만든 카드를 그대로 보여 준다. dev에서 노선도 카드가 115px 넘쳐 부연설명을 덮었다. 넘침은 **브라우저에서 그려 봐야** 알 수 있다(폰트·옵션에 따라 다름).

**키트 함수**(v1.4):
- `measureKitOverflow(card)` (`engine/fit.js`) → `{ body, panel, px }` 카드 1080px 기준 넘친 px. `px > OVERFLOW_TOLERANCE`(2)면 넘침
- `kitOverflowNote(px)` (`engine/render.js`) → 다시 만들 때 요청에 붙일 문구

**흐름**(사용자 확정):
1. 생성 직후 결과 화면에서 카드를 다 그리고, **웹폰트·사진까지 불러온 뒤**(`document.fonts.ready` + 이미지 load, `fitKitCard` 다음) 카드마다 `measureKitOverflow`.
   - 위치: `app/blog/components/card-news/kit/KitCard.js`의 그리기 `useEffect`(약 63~88줄) — `fit()` 뒤에 재고, 결과를 부모로 `onOverflow(cardIndex, px)` 같은 콜백으로 올린다.
2. 넘친 카드만 '이 부분만 다시'와 **같은 경로**(`app/api/blog/regenerate-section/route.js` → `generateKitCard({ instruction })`)로 **자동으로 한 번** 다시 만든다 — `instruction: kitOverflowNote(px)`.
3. 다시 재서 또 넘치면 더 하지 않고, 그 섹션 머리에 **'카드가 넘쳐요 — 이 부분만 다시'** 안내를 띄운다.
4. 원장님이 폰트·스타일을 바꿔서 넘친 경우(생성 직후가 아닐 때)는 **자동으로 다시 만들지 않고** 3번 안내만.
5. 같은 카드를 무한히 다시 만들지 않도록 카드별 자동 재생성 횟수를 저장한다(한 번).

**비용**: 넘친 카드 수만큼만(대개 0장). 3번(반복 도식)과 같이 쓰면 순서는 3 → 4(반복을 먼저 정리한 뒤 그려서 잰다).
**확인**: 일부러 긴 노선도(역 6개 이상)나 긴 목록을 넣은 카드로 — 넘침이 잡히고, 한 번 다시 만들어지고, 그래도 넘치면 안내가 뜨는지.

## 5. 사진 스타일 배경 사진은 덱마다 한 장만 (v1.4 키트 규칙)

**배경**: 키트 v1.4에서 사진 스타일의 본문 배경 사진(`data-bgimg`)은 **덱에서 첫 번째 한 장만** 켜진다(사용자 확정 — 그라데이션 배경은 카드뉴스당 한 번). 키트 웹앱은 덱 전체를 한 번에 `fitPhoto(deck)`해서 첫 장만 켠다. **홈페이지는 `KitCard`가 카드마다 따로 `fitKitCard(scope)`를 부르므로**, 카드마다 "내가 첫 장"이라고 판단해 `data-bgimg`가 있는 카드가 전부 사진을 깐다.

**할 일**(둘 중 하나, A 추천):
- **A. 생성 직후 한 번 정리**: `generateKitDeck`이 `htmls`를 돌려주기 전에, 표지를 뺀 본문 카드 중 **첫 번째 `data-bgimg`만 남기고** 나머지 카드 여는 태그의 `data-bgimg="…"`를 지운다(정규식으로 `<div class="kcard ...">` 여는 태그만). 저장된 HTML 자체가 규칙을 따르므로 이후 화면 어디서 그려도 같다.
- B. 그릴 때 거르기: `hydrate.js bgPhotoHTML`(약 66~70줄)에 덱 단위 정보(이 카드가 덱에서 첫 `data-bgimg` 카드인지)를 넘겨 첫 장이 아니면 배경 사진을 만들지 않는다.

**표지(`layout-cover`)의 `data-bgimg`는 그대로** — 표지는 항상 사진.
**확인**: 사진 스타일로 생성한 덱에서 본문 배경 사진이 한 장만 보인다. 다른 스타일에서는 원래대로 배경 사진이 없다.

---

## 하지 말 것

- 키트 엔진 파일(`lib/cardkit/engine/*`)과 동기화로 들어온 CSS를 손으로 고치지 않는다 — 다음 동기화 때 덮어써진다. 엔진 쪽 수정이 필요하면 키트(jitsuverse/card)에 요청한다.
- '내 스타일'(관리자 전용) 메뉴는 홈페이지에 넣지 않는다. 추천 스타일 6개(`PRESET_STYLES`)는 그대로.
- 메뉴 UI는 키트 `docs/MENU-STRUCTURE.md`의 **구조만** 따르고, 색·글꼴·버튼 모양은 홈페이지 디자인 시스템으로.

## 참고 문서 (키트 저장소)

- `docs/HOMEPAGE-FIXES.md` — 요청 표 원본 + 키트 쪽 수정 기록 K1~K38
- `CHANGELOG.md` v1.4 · `README.md` 맨 위 '이식할 때 꼭 지킬 것'
- `docs/PROMPT-CACHING.md` — 프롬프트 캐시 구조
