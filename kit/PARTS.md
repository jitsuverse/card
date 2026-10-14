# 부품 키트 목록

**지금 기준 덱: `examples/english-grammar.html`** (도감 `gallery/english-grammar.png`). 카드 구성 공식·비율은 CLAUDE.md B 1~4. 아래 덱별 표 중 english-v1 · english · social 의 비유 사물은 예전 기준으로 만든 것이라, 내용이 그 물건으로 바로 떠오를 때만 쓴다.

카드를 새로 설계할 때 `kit.css` 전체 대신 이 목록만 읽는다.
글자 크기·줄간격·자간·색·모서리·그림자는 부품에 이미 정해져 있으니 숫자를 쓰지 않는다. 새 부품의 글자도 기본값(본문 38·본문 컬러, `b`·`strong`·`dt`·`th`는 제목 컬러)이 자동으로 붙는다.

- 예외 1: 데이터 값(`--v`, `--p`, `--a/--b`, `flex:분`)
- 예외 2: 기울기(`--r`)

## 부품 도감 — 먼저 그림으로 고른다

- `gallery/science.png`(과학 실험반 24장), `gallery/writing.png`(글쓰기 논술반 10장), `gallery/math.png`(수학 내신 클리닉 10장), `gallery/coding.png`(코딩·로봇반 10장), `gallery/english.png`(영어 말하기반 10장 — 사물 4 + 일반 형태 5), `gallery/english-v1.png`(같은 내용 1차 — 9장 모두 사물), `gallery/social.png`(중등 사회 내신반 10장 — 사물 4 + 일반 형태 5), `gallery/math-curriculum.png`(중등 수학 커리큘럼 10장 — 시각 3 + 일반 6), `gallery/korean.png`(고등 국어 10장 — 시각 3 + 일반 6), `gallery/korean-text.png`(같은 내용 정보형 — 글 많이), `gallery/korean-formula.png`(같은 내용 **기준 덱 공식** — 주 도식 + 보조 + 한 줄), `gallery/english-grammar.png`(중등 영어 문법 10장 — 기준 공식 + 시각 30 / 정보 70, 글 넉넉히): 카드마다 id 라벨이 붙은 작은 그림. **형태(사물 또는 일반 도식)는 내용에서 먼저 정하고**, 같은 것이 이미 있는지 이 그림으로 확인한다.
- 표의 괄호 `(과학 a)`·`(글쓰기 e)`·`(수학 c)`는 덱과 카드 id다. 쓰는 법이 궁금하면 `examples/` 의 같은 이름 파일에서 그 id 카드만 찾아 읽는다(kit.css 전체를 읽지 않는다).
- 미리보기: `/kit/?deck=examples/science`. 새 덱을 다 만들면 `examples/`에 복사하고 도감을 다시 찍는다:
  `node scripts/kit-shot.mjs --deck examples/이름 --scale 0.25 --cols 6 --out /tmp/x --sheet kit/gallery/이름.png`

## 카드 뼈대

```html
<div class="kcard" id="x">
  <div class="k-head"><h2 class="k-title">제목 1줄<br>제목 2줄</h2><p class="k-sub">부연설명 1줄</p></div>
  <div class="k-body"> …도식… <p class="k-label">※ 참고사항</p> </div>
</div>
```

- 표지는 `class="kcard layout-cover"`로 만든다. 안에 `.cover-tag`, `h1.title`, `.sub`, `<div data-photo="cover" data-icon="아이콘">`을 둔다.
- `.k-body`는 도식을 영역 가운데에 둔다. 넘치면 잘리지 않고 검사(`scripts/kit-check.mjs`)에서 걸린다.

## 글자

| 부품 | 역할 |
|---|---|
| `.k-h` | 항목 제목 (46, 세미볼드) |
| `.k-p` | 본문 (38) |
| `.k-foot` | 도식 아래 한 줄 요약 (38, 세미볼드, 가운데) |
| `.k-label` | ※ 참고사항 (32) |
| `.k-big` | 핵심 숫자 (96, 메인 컬러) |
| `.k-hero` | `.k-big` + `.k-p` 묶음 (도식 위) |
| `.k-excerpt` | 책 발췌문 (46) |
| `.k-hl` | 문장 속 강조 단어 (세미볼드, 색 없음) |
| `.k-mark` | 형광펜 밑줄 |
| `.k-strike` | 회색 취소선 |
| `.k-tip` | 단어 위 말풍선 팁 (`.k-anchor` 안에) |

## 틀·칸

| 부품 | 쓰임 |
|---|---|
| `.k-panel` (`.accent`, `.outline`) | 흰 도형 칸. `.accent`는 메인 컬러로, 강조 한 곳에만 쓴다 |
| `.k-window` > `.k-window-bar` + `.k-window-body` | 가짜 앱·책 화면. 머리에는 점 3개만 둔다 |
| `.k-grid` / `.k-cols-2` / `.k-row` | 격자 / 2열 / 가로 줄 |
| `.k-vs` | 대비 두 칸 (과학 a) |
| `.k-split` | 왼쪽 도식 + 오른쪽 목록 (과학 f) |
| `.k-tiles` | 숫자 타일 2×2 (과학 k). 칸마다 `b` 숫자 + `span` 설명, 강조 칸은 `.hl` |

## 목록

| 부품 | 쓰임 |
|---|---|
| `.k-rows` > `p` | 줄 목록. 위·아래와 줄 사이를 구분선으로 닫는다 |
| `.k-pairs` | `.k-rows`에 `span` 라벨 + `b` 값을 더한 것 (과학 n) |
| `.k-figs` > `p` > `b` + `span` | 큰 값 + 설명 목록 (과학 g) |
| `.k-checkrow` | 체크 + 한 줄 |
| `.k-faq` > `div` > `p`(`b`Q + `span`질문) + `p.k-p`(답) | Q&A. 답을 모두 펼친 상태로 둔다 (과학 i) |
| `.k-ticket-shadow` > `.k-ticket` > `.k-ticket-top` + `dl.k-ticket-body` | 티켓 (과학 j) |

## 흐름·시간

| 부품 | 쓰임 |
|---|---|
| `.k-pill` + `.k-arrow` | 알약 흐름. 화살표는 회색 caret |
| 단계 칸 `.k-panel.step` + `.k-ticks` + `.k-rail` | 3단계 (예전 덱) |
| `.k-sched` > `.k-slot style="flex:분"` > `.k-time` + `.k-panel` | 세로 시간표 (과학 b) |
| `.k-cal` > `div` > `span`주차 + `b`주제 | 3열 달력 칸 (과학 c). 강조 칸은 `.hl` |
| `<div class="k-panel k-month-box">` > `.k-month-head`(`b`월 + `span`연도) + `.k-month data-start data-days data-marks` | 벽걸이 달력 (과학 q). 고리 2개, 격자선 없이 가운데 정렬한 날짜, 행사 날만 메인 컬러 블록 |

## 그래프

| 부품 | 쓰임 |
|---|---|
| `.k-db style="--a;--b"` | 전후 점 막대 (과학 d). 범례는 `.k-legend` |
| `.k-waffle data-parts="30,14,4"` + `.k-key` | 와플 + 범례 (과학 e) |
| `.k-rank` > `p style="--v"` > `b`순위 `span`이름 `i`막대 `em`값 | 순위 막대 (과학 m) |
| `.k-gauge style="--p"` > `strong` + `span` | 반원 게이지 (과학 n) |
| `.k-ring style="--p;--size"` | 원형 게이지 |
| `.k-seg` + `.k-scale` | 구간 막대 |
| `.stack data-n data-v data-l` | 블록 쌓기 |
| `.k-shelf` > `.k-spine` | 책등 높이 |
| `.k-stat` + `.k-track` | 점수 줄 |
| `.k-podium` > `.r1/.r2/.r3` | 시상대 (과학 p). 가운데 1등이 `.hl` |
| `.k-matrix` | 비교표 (과학 l). 첫 줄 머리, 우리 열은 `.hl`, 체크는 `<i data-ph="check-circle">`, 빈 `<i>`는 없음 |

## 사람·사진·아이콘

| 부품 | 쓰임 |
|---|---|
| `.k-chat` > `.k-msg`(`.me`) > `.k-bubble` | 대화. 좌우 위치와 색으로 말한 사람을 구분하고, 아바타는 넣지 않는다 |
| `.k-notes` > `p style="--r:기울기"` + `small` | 포스트잇 (과학 o) |
| `.k-profile` + `<div data-photo="teacher">` | 강사 소개 (과학 g). 상반신은 카드 바로 아래 자식으로 둔다 |
| `<div data-photo="book\|photo\|cover\|teacher" data-slot data-caption>` | 사진·교재 자리. 클릭하면 사진을 넣는다 |
| `<div class="k-photoset" data-set data-count="3" data-captions="a,b,c,d">` | 사진 묶음 1~4장 (과학 h). 미리보기에서 + 추가 / × 빼기, 장수에 따라 1장·나란히·왼쪽 큰 1+2·2×2 |
| `.k-photos` / `.k-photos-side` | 사진 3장 고정 배치 (예전) |
| `<i data-icon2d="이름">` | 2D 아이콘 14종 |
| `<i data-ph="이름">` | Phosphor 아이콘 |
| `.k-tag` | 회색 칩 (`.solid` = 직함 등 강조) |
| `.k-caret` | 회색 caret (정지 이미지이므로 토글에는 쓰지 않는다) |

## 사물 부품 (글쓰기 덱)

| 부품 | 쓰임 |
|---|---|
| `.k-panel` > `.k-ms data-text data-cols data-rows` | 원고지 (글쓰기 a). 글자를 칸에 채우고, 다음 칸에 메인 컬러 커서 |
| `.k-panel.k-proof` > `p` + `.k-memo`(`b` + `span`) | 첨삭지 (글쓰기 b). `.k-del` 메인 취소선, `.k-ins` > `b` 끼워 넣은 말, `.k-memo` 여백 메모 |
| `p.k-h.k-toc-head` + `.k-toc` > `p`(`small`번호 `b`이름 `i`점선 `span`값) | 책 목차 (글쓰기 c). 강조 줄은 `.hl` |
| `.k-stamps-head` + `.k-stamps data-total data-done` | 도장 카드 (글쓰기 d). 찍힌 칸은 메인 테두리 + 기울기 |
| `.k-pencils` > `p style="--v"` > `b` + `span.k-pencil > i` + `em` | 연필 길이 막대 (글쓰기 e). 강조 줄은 `.hl` |
| `.k-letter` > `.k-panel` | 봉투에서 꺼낸 편지·리포트 (글쓰기 f). 안에는 3줄 정도만 |
| `.k-panel.k-cert` > `p.k-h` + `b` + `p` + `span.k-seal` | 상장 + 도장 (글쓰기 g) |
| `.k-coupon` > `div`(`b.k-name` `span.k-big` `span`) + `div > dl` | 오려 쓰는 쿠폰 (글쓰기 i) |

## 사물 부품 (수학 덱)

| 부품 | 쓰임 |
|---|---|
| `.k-panel` > `p.k-h` + `.k-omr data-answers="2,4,1…" data-wrong="3,6"` | OMR 답안지 (수학 a). 2열 × 5줄, 틀린 줄 번호에 메인 채점 빗금 |
| `.k-timer data-parts="이름:분,이름:분:hl,…"` | 타이머 다이얼 + 범례 (수학 c). 가운데 총 시간, 강조 구간만 메인 |
| `.k-panel.k-graph data-values data-labels data-min data-max` | 모눈종이 꺾은선 (수학 f). 마지막 점·값만 메인. 위에 `.k-hero`를 얹으면 좋다 |
| `.k-flash` > `.k-flash-card` > `p.k-h` + `p.k-p` + `.k-flash-checks` > `.k-checkrow`(`.todo`) | 고리에 꿴 오답 카드 (수학 e) |
| `.k-row.k-dday` > `.k-daypad`(`p` + `span.k-big`) + `.k-figs` | 일력 D-day + 주차별 목록 (수학 g) |

## 사물 부품 (코딩 덱)

| 부품 | 쓰임 |
|---|---|
| `.k-code` > `p.hat` + `.loop`(`b`이름 + `div` > `p`…) + `p` | 끼워지는 코딩 블록 (코딩 b). 반복 블록만 메인 C자 |
| `.k-levels` > `p`(`.done`/`.hl`) > `b` + `span` | 게임 레벨 맵 (코딩 c). 한 칸씩 높아지는 번호 동그라미 + 점선 길, 지금 단계만 메인 |
| `.k-hands` > `.k-panel` > `.k-toy` > `.k-pad` 또는 `.k-keys`(`i`×12 + `i.space` + `i.enter`) + `p.k-h` + `.k-rows` | 게임패드 vs 키보드 대비 (코딩 a). Enter 키만 메인 |
| `.k-tablet` > `.k-apps` > `p`(`.hl`) > `b`첫 글자 + `span`이름 | 태블릿 홈 화면 앱 6개 (코딩 d) |
| `.k-panel.k-batt` > `.k-legend` + `p style="--a;--b"` > `b` + `span.k-cell > i` + `em` | 배터리 전후 비교 (코딩 f). 늘어난 칸만 메인 |
| `.k-medals` > `.r1/.r2/.r3` > `span.k-medal > span`순위 + `b`인원 + `em`상 | 리본 메달 3개 (코딩 g). 금메달만 메인 |
| `.k-cart-row` > `.k-cart > div > .k-label-sticker`(`b.k-name` `span.k-big` `span`) + `dl` | 게임 카트리지 + 안내 (코딩 i) |

## 사물 부품 (영어 말하기 덱)

`(영어 a)`처럼 표시한 것은 `examples/english.html`, `(영어1 b)`는 1차 `examples/english-v1.html`에 있다.

| 부품 | 쓰임 |
|---|---|
| `.k-panel.k-report` > `p.k-h` + `p`(`b`과목 `i`점선 `em`점수) | 성적표 (영어 a). 머리 띠, 강조 줄 `.hl`은 빨간 펜 동그라미 |
| `.k-pass` > `.k-pass-main`(`.k-pass-route` 출발 `.k-arrow` 도착 + `dl`) + `.k-pass-stub`(`.k-big`) | 탑승권 (영어1 b). 떼는 조각만 메인 |
| `.k-panel.k-passport` > `p`(`.round`/`.oval`, `--r`) > `b` | 여권 도장 3×2 (영어1 c). 메인 잉크 선 |
| `.k-rec` > `.k-rec-grill` + `.k-rec-screen` > `p`(`b` + `.k-wave` > `i style="--v"`) + `.k-rec-keys`(`.play` `.rec` `.stop`) | 녹음기 파형 비교 (영어 d). 녹음 버튼만 메인 |
| `.k-metro` > `p`(`.hl`) > `b`역 + `span`기간 | 세로 지하철 노선도 (영어1 e). 도착역만 메인 환승역 |
| `.k-receipt` > `p.k-receipt-head` + `p`(`span` `em`) + `p.k-receipt-total`(`b` + `.k-big`) | 톱니 영수증 (영어 f). 합계만 큰 숫자 |
| `.k-panel.k-postcard` > `.k-postcard-msg`(`p.k-p` + `b`보낸 사람) + `.k-postcard-side`(`.k-postcard-stamp` > `i data-icon2d` + `.k-postcard-mark` + `i`×3) | 엽서 후기 (영어 g). 우표만 메인 |
| `.k-panel.k-board` > `p.k-board-head`(`b`×4) + `p`(`.hl`) > `b` + `span`×3 | 출발 안내판 넘김판 (영어1 h). 강조 줄의 마지막 칸만 메인 |
| `.k-luggage` > `div` > `.k-luggage-band`(`p.k-h` + `p.k-p`) + `dl` | 수하물 태그 + 끈 (영어1 i). 위쪽 띠만 메인 |

## 일반 형태 (영어 덱)

사물이 바로 떠오르지 않는 카드는 이런 일반 형태로 — 흰 도형·큰 숫자로 영역을 채우고, 덱 안에서 같은 구성을 반복하지 않는다.

| 부품 | 쓰임 |
|---|---|
| `.k-blocks` > `.k-panel style="flex:N"`(`.accent`) > `b` + `.k-big` + `p.k-p` | 비율 블록 (영어 b). 시간·양만큼 넓은 칸, 강조 칸만 메인 |
| `.k-says` > `p.k-panel` > `b`이름 + `span`문장 | 좌우로 번갈아 놓인 말풍선 (영어 c). 문장은 46 보통 굵기 |
| `.k-climb` > `div style="--v"` > `b`기간 + `.k-panel`(`.accent`) > `p`이름 + `strong`값 | 높아지는 막대 (영어 e). 마지막만 메인 |
| `.k-classes` > `.k-panel` > `b.k-h` + `span` + `strong`큰 시간 + `em`(`.hl`) 칩 | 반·학년 카드 3장 (영어 h). 강조 칩만 메인 |
| `.k-steps3` > `.k-panel`(`i data-ph="number-circle-N"` + `b`) + `.k-arrow` | 번호 단계 3칸 (영어 i) |
| `dl.k-panel.k-info` > `div` > `dt` + `dd` | 흰 도형 안 라벨 · 값 안내 (영어 i) |

## 사회 덱 (사물 4 + 일반 형태 5)

| 부품 | 쓰임 |
|---|---|
| `.k-page-wrap` > `.k-panel.k-page` > `i.head` + `i`(`.m`, `--w`) + `span.k-marker` | 사물: 줄마다 형광펜 칠한 교과서 쪽 + 형광펜 (사회 a) |
| `.k-cmap` > `p.k-cmap-core` > `b.k-h` + `p.k-panel`×4(`b` + `span`) | 개념 지도: 가운데 메인 원 + 네 모서리 칸, 대각선 연결 (사회 b) |
| `.k-panel.k-climate` > `.k-legend`(`.k-lg-line` `.k-lg-bar`) + `.k-climate-plot`(`.k-climate-bars > i --v` + `svg polyline`) + `.k-climate-axis` | 기후 그래프: 회색 막대 + 메인 선 (사회 c) |
| `.k-news-wrap` > `.k-panel.k-news`(`.k-news-top` + `p.k-h` + `.k-news-cols`) + `p.k-news-tag` | 사물: 신문 + 메인 꼬리표 (사회 d) |
| `.k-essay` > `.k-panel`(`.accent`) > `em`번호 + `p`(`b.k-h` + `span`) | 큰 번호 3단 (사회 e). 마지막 단만 메인 |
| `.k-panel.k-rise` > `div style="--v"`(`.hl`) > `strong` + `i` + `span` · `p.k-rise-chip` | 전후 막대 두 개 + 상승 칩 (사회 f) |
| `.k-binder` > `p.k-binder-tabs` > `b`(`.hl`) + `.k-panel`(`.k-binder-big` + `.k-rows`) | 사물: 인덱스 탭 바인더 (사회 g). 펼친 탭만 메인 |
| `.k-week` > 머리 `span` + `b`×6, 줄마다 `b` + `em`(수업)/`i`(빈칸) | 주간 시간표 격자 (사회 h). 특강 칸 `em.hl`만 메인 |
| `.k-cards` > `.k-cards-back`(`b.k-h`) + `.k-panel.k-cards-front`(`p.k-h` + `dl`) | 사물: 명함 두 장 (사회 i). 뒤 장만 메인 |

※ 새 부품 클래스는 엔진 CSS와 부딪히지 않게 항상 `k-` 접두사를 붙인다(원래 개발 폴더에서 사회 c 범례가 엔진의 `.bar`와 부딪혔음).

## 수학 커리큘럼 덱 (시각 3 + 일반 6)

| 부품 | 쓰임 |
|---|---|
| `.k-stair3` > `.k-panel style="--v"`(`.accent`) > `b.k-h` + `p`×4 | 시각: 학년 계단, 칸마다 단원 4개(점선 위 1학기 · 아래 2학기) (커리큘럼 a) |
| `.k-workbook` > `div`×2 > `i.r/.t/.w`(문제 번호) + `.k-rows.k-pairs.k-wb-key` > `p.r/.t/.w` | 시각: 펼친 문제집, 종류별 칸 색 + 색 범례 내역 (커리큘럼 f) |
| `.k-panel.k-month-box.k-exam` + `.k-exam-key` > `p`(`b`날짜 + `span`) | 시각: 시험 달력, 단계 시작일 옅은 메인 · 시험날(마지막 표시)만 진한 메인 + 단계 2×2 (커리큘럼 h) |
| `.k-curri` > 머리(`span` + `b`×2) + 줄마다 `b.k-h` + `p.k-panel`×2 | 학년 × 학기 단원 표 (지금 덱에는 없음 — 정보 위주로 다시 쓸 때) |
| `.k-days` > `.k-panel`(`.accent`) > `em`요일 + `p`(`b.k-h` + `span`) | 요일 배지 줄 (커리큘럼 c). 강조 줄만 메인 |
| `.k-tiers` > `.k-panel`(`.accent`) > `b.k-h` + `strong`큰 숫자 + `span` + `p > i`×2 칩 | 반 카드 3장 (커리큘럼 e). 강조 반만 메인 |
| `.k-panel.k-cycle` > `div` > `b`주기 칩 + `p`×2(`i data-ph="check-circle"` + 글) | 한 칸 안 주기별 체크 목록 (커리큘럼 g) |
| `.k-vtl.center` | 세로 타임라인을 가운데로 |

기존 부품 재사용: `.k-sched`(커리큘럼 b 90분 수업), `.k-steps4`(d 단원 4단계), `.k-steps3` + `.k-info`(i 등록).

## 국어 덱 (시각 3 + 일반 6)

| 부품 | 쓰임 |
|---|---|
| `.k-panel.k-stats3` > `p`×3(`strong` + `span`) + `span.k-down data-ph="caret-down"` + `.k-panel.accent.k-verdict`(`.k-big` + `p.k-p`) | 일반: 숫자 세 칸 → 결론 칸(메인) (국어 a) |
| `.k-panel.k-annot` > `.k-annot-text`(`i.u`/`i.c`/`.brk > i`, `--w`) + `.k-annot-notes > b style="--t:줄번호"` | 시각: 밑줄·동그라미·괄호로 표시한 지문 + 여백 메모 칩 (국어 b) |
| `.k-hero` + `.k-panel.k-scores` > `.k-stat`(`span` + `.k-track > i style="width"` + `b`)×4 | 일반: 큰 숫자 + 점수 막대 칸 (국어 c) |
| `.k-vocab` > `.k-panel.back2` + `.back1` + `.front`(`p.k-vocab-word` > `b` + `.k-tag`, `p.k-p`, `p.k-vocab-ex`) | 시각: 겹친 어휘 카드 (국어 e) |

재사용: `.k-plans`(d), `.k-essay`(f), `.k-tiles`(g), `.k-timer`(h 시각), `.k-checks`(i).

## 정보형(글 많이) 국어 덱 — `examples/korean-text.html`

같은 내용에 설명 문장·항목 설명을 더한 버전. 글이 많아지면 세로 여백부터 줄인다(`.tight`).

| 부품 | 쓰임 |
|---|---|
| `.k-panel.k-reasons` > `p.k-h` + `p`(`b`번호 + `span`) | 머리 + 번호 이유 목록 (국어2 a) |
| `.k-panel.k-areas` > `div`(`.hl`) > `p`(`b.k-h` + `em`점수) + `span`설명 | 영역 · 배점 · 한 줄 설명 (국어2 c) |
| `.k-annot.compact` · `.k-vocab.compact` | 아래에 설명 줄을 붙일 때 작게 (국어2 b·e) |
| `.k-tiles.k-tiles-text` | 숫자 타일 설명 2줄 (국어2 g) |
| `.k-faq.tight` · `.k-pairs.tight` · `.k-checks.tight` · `.k-info.tight` | 글 많은 카드에서 세로 여백 줄이기 |

## 기준 덱 공식 (국어 3차 — `examples/korean-formula.html`, 원형은 `docs/reference/reading-deck-v0.html`)

카드마다 **주 도식 1개 + 보조 1개 + 한 줄 요약(`.k-foot`)**. 보조는 `.k-hero`(큰 숫자) · `.k-pill` + `.k-arrow` 알약 흐름 · `.k-pill.ghost`(취소선 옛 방식) → `.k-pill` 전후 알약 중 하나. 비주얼은 비유 사물 대신 내용 그 자체(실제 문장, 값만큼 쌓인 블록, 레일 위 단계).

| 부품 | 쓰임 |
|---|---|
| `.k-panel.k-passages` > `i`×12(`.miss`) | 지문(문항) 칸 — 못 푼 칸은 점선 (국어3 a) |
| `.k-window` > `.k-window-body.k-read` > `p.k-excerpt`(`.k-anchor.k-circle` + `.k-tip`, `.k-mark`) | 실제 문장 + 낱말 팁 · 동그라미 · 형광펜 (국어3 b) |
| `.k-panel.k-db-short` | 전후 점 막대에서 라벨이 짧을 때 막대 칸 넓게 (국어3 g) |

## 영어 문법 덱 (기준 공식 + 시각 3 / 정보 6) — `examples/english-grammar.html`

| 부품 | 쓰임 |
|---|---|
| `.k-window` > `.k-window-body.k-parse` > `span`(`.hl`) > `b`단어 묶음 + `i`역할 칩 | 시각: 실제 문장 구조 표시, 동사 칩만 메인 (영어문법 b) |
| `.k-panel.k-proof.k-proof-en` | 시각: 영어 서술형 첨삭 (영어문법 e, 첨삭지는 글쓰기 b) |
| `.k-sched.k-sched-text` | 시간표 칸에 활동 + 설명 (영어문법 d) |

재사용: `.k-hero` + `.k-reasons`(a), `.k-curri`(c), `.k-days`(f), `.k-tiles-text`(g), `.k-exam`(h), `.k-steps3` + `.k-info`(i).
