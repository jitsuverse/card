# 부품 키트 목록

카드를 새로 설계할 때 `kit.css` 전체 대신 이 목록만 읽는다.
글자 크기·줄간격·자간·색·모서리·그림자는 부품에 이미 정해져 있으니 숫자를 쓰지 않는다. 새 부품의 글자도 기본값(본문 38·본문 컬러, `b`·`strong`·`dt`·`th`는 제목 컬러)이 자동으로 붙는다.

- 예외 1: 데이터 값(`--v`, `--p`, `--a/--b`, `flex:분`)
- 예외 2: 기울기(`--r`)

## 부품 도감 — 먼저 그림으로 고른다

- `gallery/science.png`(과학 실험반 24장), `gallery/writing.png`(글쓰기 논술반 10장), `gallery/math.png`(수학 내신 클리닉 10장), `gallery/coding.png`(코딩·로봇반 10장): 카드마다 id 라벨이 붙은 작은 그림. **사물은 내용에서 먼저 정하고**, 같은 사물이 이미 있는지 이 그림으로 확인한다(도감에서 고르는 게 아니다 — 범용 도표 위주로 채우면 품질이 떨어진다).
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
