# 부품 키트 목록

**지금 기준 덱: `examples/english-grammar.html`** (도감 `gallery/english-grammar.png`). 카드 구성 공식·비율은 CLAUDE.md B 1~4. 아래 덱별 표 중 english-v1 · english · social 의 비유 사물은 예전 기준으로 만든 것이라, 내용이 그 물건으로 바로 떠오를 때만 쓴다.

카드를 새로 설계할 때 `kit.css` 전체 대신 이 목록만 읽는다.

**덱의 기본 스타일**: 덱 파일 맨 위에 `<!-- default-style: 사진 -->`(추천 스타일 이름)을 쓰면 처음 열 때 그 스타일로 열린다 — 사진이 주인공인 덱(사진은 사진 스타일에서만 보이므로)에 쓴다(예: examples/image-cards).

**여백 활용(`--air`)**: 콘텐츠 영역에 자리가 남으면 `fitAir`가 세로 간격을 자동으로 넓힌다. 새 부품의 줄·항목 사이 세로 간격은 `calc(값 * var(--air, 1))`로 쓰고 kit.css 맨 아래 '여백 활용'에 한 줄 넣는다(도형 안쪽 위아래 여백·차트는 넣지 않는다 — 도형을 키우지 않게).
글자 크기·줄간격·자간·색·모서리·그림자는 부품에 이미 정해져 있으니 숫자를 쓰지 않는다. 새 부품의 글자도 기본값(본문 38·본문 컬러, `b`·`strong`·`dt`·`th`는 제목 컬러)이 자동으로 붙는다.

- 예외 1: 데이터 값(`--v`, `--p`, `--a/--b`, `flex:분`)
- 예외 2: 기울기(`--r`)

## 부품 도감 — 먼저 그림으로 고른다

- `gallery/science.png`(과학 실험반 24장), `gallery/writing.png`(글쓰기 논술반 10장), `gallery/math.png`(수학 내신 클리닉 10장), `gallery/coding.png`(코딩·로봇반 10장), `gallery/english.png`(영어 말하기반 10장 — 사물 4 + 일반 형태 5), `gallery/english-v1.png`(같은 내용 1차 — 9장 모두 사물), `gallery/social.png`(중등 사회 내신반 10장 — 사물 4 + 일반 형태 5), `gallery/math-curriculum.png`(중등 수학 커리큘럼 10장 — 시각 3 + 일반 6), `gallery/korean.png`(고등 국어 10장 — 시각 3 + 일반 6), `gallery/korean-text.png`(같은 내용 정보형 — 글 많이), `gallery/korean-formula.png`(같은 내용 **기준 덱 공식** — 주 도식 + 보조 + 한 줄), `gallery/exam-analysis.png`(시험분석 10장 고정 구성 — 홈페이지 '시험분석' 카드 글자로 다시 짬), `gallery/exam-analysis-photo.png`(같은 덱을 사진 스타일로), `gallery/admission-column.png`(입시칼럼 10장 — 2028 대입 개편), `gallery/level-test.png`(레벨테스트 안내 10장 — 영업형), `gallery/top-students.png`(성적 우수자 명단 10장 — 홍보형), `gallery/school-analysis.png`(학교분석 10장 — 한빛중 수학, 정보형), `gallery/top-students-review.png`(성적 우수자 후기 10장 — 학생 한 명 이야기 + 학생·학부모 후기), `gallery/academy-philosophy.png`(학원 철학 10장 — 영업형, 풀이 첨삭·타이머·도장 카드), `gallery/class-intro.png`(수업 소개 10장 — 중2 영어 리딩반, 새 부품 화이트보드), `gallery/info-session.png`(설명회 안내 10장 — 영업형, 초대권·90분 시간표·공부 시간 블록), `gallery/management-program.png`(관리 프로그램 10장 — 홍보형, 등하원 문자·오답 카드·주간 리포트), `gallery/english-grammar.png`(중등 영어 문법 12장 — 기준 공식 + 시각 30 / 정보 70, 글 넉넉히): 카드마다 id 라벨이 붙은 작은 그림. **형태(사물 또는 일반 도식)는 내용에서 먼저 정하고**, 같은 것이 이미 있는지 이 그림으로 확인한다.
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
| `.k-h` | 항목 제목 (46, 세미볼드). 도식 영역의 굵은 글자는 모두 세미볼드 |
| `.k-p` | 본문 (38) |
| `.k-foot` | (쓰지 않음 — 2026-10-15부터 결론은 카드 제목·부연설명에. 예전 덱에만 남아 있다) |
| `.k-label` | ※ 참고사항 (32) |
| `.k-big` | 핵심 숫자 (96, 메인 컬러, 세미볼드 — 볼드는 카드 제목에만) |
| `.k-hero` | `.k-big` + `.k-p` 묶음 (도식 위). 큰 숫자는 옆 두 줄 글의 세로 가운데(보이는 글자 기준) |
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
| `<div data-photo="book\|photo\|cover\|teacher" data-slot data-caption [data-src]>` | 사진·교재 자리. 클릭하면 사진을 넣는다. photo·book은 `data-src`로 처음 사진을 줄 수 있다 |
| `<div class="k-photoset" data-set data-count="3" data-captions="a,b,c,d" [data-srcs="주소1 주소2 …"]>` | 사진 묶음 1~4장 (과학 h). 묶음만 있는 카드는 높이 740, 아래 글이 있으면 600에서 줄어듦. **기본은 칸에 맞춰 채움, 원본 비율은 버튼**(사용자 확정 2026-10-16): 사진 도구의 '원본 비율로/칸에 맞춰 채우기' 버튼(강사·교재 목업 제외 모든 사진) 또는 덱의 `data-fits="contain …"`(시험지·교재 사진은 덱을 만들 때 contain으로). 원본 비율 사진이 하나라도 있으면 fit.js `fitPhotoSets`가 원본 비율 줄 배치(잘림 없음), 모두 채움이면 격자. `.k-photo-hero`의 사진도 `data-fit`으로 정할 수 있다. 미리보기에서 + 추가 / × 빼기, 장수에 따라 1장·나란히·왼쪽 큰 1+2·2×2 |
| `.k-photos` / `.k-photos-side` | 사진 3장 고정 배치 (예전) |
| `.k-photo-hero` > `div data-photo="photo" data-src="사진 주소"` + `.k-panel`(`.k-reasons`·`.k-quote` 등) | (사진 스타일에서만 사진이 보임 — 다른 스타일은 흰 도형만) 사진 강조: 큰 사진(시험지·학생·학부모) 아래에 흰 도형이 겹친다. 글이 길면 사진이 줄어든다(최소 300) (시험분석 a·i) |
| 카드에 `data-bgimg="pool:주제"`(또는 사진 주소) | **사진 스타일**(내 스타일 6번)에서만 보이는 배경 사진: 도식이 작은 카드에만 자동으로 켜지고(도식은 위로, 사진은 아래 50% 투명), 표지는 전체 + 어두운 막·흰 글자. 후보 카드엔 다 달아 두면 된다. `.k-photo-hero` 카드에는 넣지 않는다 |
| `<i data-icon2d="이름">` | 2D 아이콘 14종 |
| `<i data-ph="이름">` | Phosphor 아이콘 |
| `.k-tag` | 회색 칩 (`.solid` = 직함 등 강조) |
| `.k-caret` | 회색 caret (정지 이미지이므로 토글에는 쓰지 않는다) |

사진 모음 주제(`assets/config.js PHOTO_POOL`): `classroom` 교실 · `school` 학교 건물 · `writing` 필기하는 손 · `exam` 시험지·학습지 · `books` 책·도서관 · `desk` 공부 책상 · `help` 공부 돕기·상담. `data-bgimg`·`data-src`·`data-srcs`에 `pool:주제`로 쓴다.

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
| `.k-coupon` > `div`(`b.k-name` `span.k-big` `span`) + `div > dl` | 쿠폰 (글쓰기 i, 2026-10-16 다듬음): 왼쪽 떼는 쪽 = 메인 면 + `--on-main` 글자, 가운데 점선 절취선 + 위아래 반원 홈, 양 끝 물결 테두리. 모서리는 고정 20px 이하(둥근 스타일의 `--r-sm` 999px 피함) |

## 사물 부품 (수학 덱)

| 부품 | 쓰임 |
|---|---|
| `.k-panel` > `p.k-h` + `.k-omr data-answers="2,4,1…" data-wrong="3,6"` | OMR 답안지 (수학 a). 2열 × 5줄, 틀린 줄 번호에 메인 채점 빗금 |
| `.k-timer data-parts="이름:분,이름:분:hl,…"` | 타이머 다이얼 + 범례 (수학 c). 가운데 총 시간, 강조 구간만 메인 |
| `.k-panel.k-graph data-values data-labels data-min data-max` | 모눈종이 꺾은선 (수학 f). 마지막 점·값만 메인. 위에 `.k-hero`를 얹으면 좋다 |
| `.k-flash` > `.k-flash-card` > `p.k-h` + `p.k-p` + `.k-flash-checks` > `.k-checkrow`(`.todo`) | 왼쪽에 펀치 구멍이 줄지어 뚫린 오답 카드 (수학 e, 2026-10-16 사용자: 클립 고리 ✗). 폭 800(영역 폭 가까이, 2026-10-16 사용자 — 640은 작음), 안도 맞춰 키움: `.k-h` 머리 = 38 메인 라벨, `.k-p` 오답 내용 = 46 세미볼드(12자 안팎 — 넓은 폰트·카드형 배경에서 두 줄이면 넘침), 체크 52 |
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
| `.k-says` > `p.k-panel`(`.accent`) > `b`이름 + `span`문장 | 좌우로 번갈아 놓인 말풍선 (영어 c). 문장은 46 보통 굵기, 한 개만 `.accent`(메인) |
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

※ 새 부품 클래스는 엔진 CSS와 부딪히지 않게 항상 `k-` 접두사를 붙인다(예전 엔진에 남아 있던 템플릿용 `.bar`와 사회 c 범례가 부딪혔음).

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
| `.k-split.k-book-split` > `div data-photo="book"` + `.k-figs` | 교재 강조: 책 목업 + 구성 숫자 3줄 (영어문법 j). 미리보기에서 책에 × → 자리째 빠지고(.no-book) 숫자 3줄이 전체 폭 흰 도형 + 큰 숫자(68)로 |
| `.k-body.k-profile`(`p.k-h` + `.k-tag.solid` + `.k-figs`) + 카드 바로 아래 `div data-photo="teacher"` | 강사 강조: 상반신 + 이름·직함·경력 숫자 (영어문법 k). 상반신에 × → .no-teacher, 이름·직함 + 숫자 흰 도형 3개가 세로 가운데로. 사진 강조(.k-photo-hero)도 × → 흰 도형만 |

재사용: `.k-hero` + `.k-reasons`(a), `.k-curri`(c), `.k-days`(f), `.k-tiles-text`(g), `.k-exam`(h), `.k-steps3` + `.k-info`(i).

## 시험분석 덱 — `examples/exam-analysis.html` (홈페이지 콘텐츠 스튜디오 '시험분석' 카드 글자를 우리 기준으로)

**시험분석은 고정 구성(2026-10-15 사용자 확정)**: 새 시험분석 덱은 `examples/exam-analysis.html`(2026-10-16 데브 서버 순서로 다시 짬)을 복사해 **글자·숫자·강조 위치·사진만** 바꾼다. 카드 순서와 부품은 그대로, 바꿀 수 있는 건 약간의 변형뿐 — 막대·항목 수(3 기본, 2~5), 강조할 칸(난이도 단계·막대·마지막 전략), 적중 카드는 문항 수 규칙(아래 g·g5·g10·g15), 내용이 없는 카드는 뺀다(예: 학부모 이야기가 없으면 i). **예상 등급컷 카드(`.k-cutline`)는 쓰지 않는다.**

| 순서 | id | 카드 (데브 서버 시험분석 섹션 순서, 2026-10-16) | 부품 |
|---|---|---|---|
| 1 | cover | 표지: 시험분석 · 학교 과목 시험 · 학년·학원 | 표지 |
| 2 | a | 시험 구성: 총 문항 · 배점 · 범위 | `.k-hero` 총 문항 + `.k-tiles` 2×2 (고난도 칸 `.hl`) |
| 3 | b | 난이도: 전체 + 문항 구간별 | `.k-level5`(해당 단계 `.hl`) + `.k-pairs` 구간 3줄 |
| 4 | c | 출제 DNA: 5영역 점수 | `.k-hero` 큰 숫자 + `.k-scores` 영역 막대(강조 1줄) |
| 5 | d | 등급을 가른 포인트(고난도 문항 번호는 제목) | `.k-days.k-days-num` 01~03 |
| 6 | e | 다음 시험 전략 3 | `.k-essay` 큰 번호 3단, 마지막만 `.accent` |
| 7 | g5 | 학원 적중 문항 | 문항 수 규칙: 1~5 `.k-hits` · 6~10 `.k-hitgrid` · 11~ `.k-hitgrid.nums` |
| 8 | h | 수준별 공부법 | `.k-areas` 상위권·중위권·모두 |
| 9 | i | 학부모 가이드: 집에서 나눌 대화 | `.k-chat` 3줄(`.k-who` 학부모·아이, 아이는 `.me`) + 알약 흐름 |
| 10 | j | 총평 | `.k-duo` 두 힘(결정적인 쪽 `.accent`) + `.k-pairs` 2줄 |

| 부품 | 쓰임 |
|---|---|
| `.k-panel.k-level5` > `p`×5(`.hl`) > `i` + `span` | 시각: 하~상 난이도 5단계, 해당 단계만 메인 (시험분석 b) |
| `.k-panel.k-cutline` > `.k-cutline-axis` > `p style="--v"`(`.hl`) > `b`등급 + `em`점수 · `.k-cutline-scale` | 시각: 점수 눈금 위 등급컷(위아래 번갈아), 1등급만 메인. `--v` = (점수-50)×2 (시험분석 f) |
| `.k-panel.k-hits` > `p.k-hits-head` + `p`(`b`번호 `span`개념 `em`(`.up`)난이도 `i data-ph="check-circle"`) | 문항 줄: 번호 · 개념 · 난이도 칩 · 적중 체크 (시험분석 g) |
| ↳ 적중 문항 수에 따라 (홈페이지에서 원장님이 고른 개수대로 바뀜) | **1~5개**: `.k-hits` 표 줄(번호 메인 · 개념 · 난이도 칩, 체크 칸 없음 — 모든 줄이 적중) + 아래 `.k-foot`, 줄 간격 넉넉히 · **6~10개**: `.k-hitgrid` 번호 + 난이도 칩 타일(아래 줄) · **11개 이상**: `.k-hitgrid.nums` 번호만 있는 타일 + 상 난이도는 메인 테두리 + `.k-hitkey` 범례(5칸 × 4줄 = 20문항까지 넉넉) · 난이도가 비면 `<em></em>`(칩 숨김). `.dense`·`.more`는 쓰지 않는다(사용자: "다닥다닥"). 2026-10-15 3·5·10·15개 × 84조합 통과 |
| `.k-hero`(`.k-big` N문항) + `.k-hitgrid` > `p`(`.up`) > `b`번호 + `em`난이도 | 적중 6~10문항: 번호 타일 5칸 격자(10개 = 2줄), 상 난이도 타일만 메인 톤, 개념은 `.k-foot`로 블로그 본문 안내 (시험분석 g10) |
| `.k-hero` + `.k-hitgrid.nums` > `p`(`.up`) > `b`번호 + `p.k-hitkey` > `i` + `span` | 적중 11문항 이상: 번호만 있는 타일, 상 난이도는 흰 타일 + 메인 테두리, 범례 "상 난이도 문항" (시험분석 g15) |
| `.k-scores .k-stat.hl` | 점수 막대 칸에서 강조 줄만 메인 (시험분석 c) |
| `.k-duo` > `.k-panel`(`.accent`)×2 > `b.k-h` + `span` (+ 아래 `.k-rows.k-pairs`) | 두 힘 나란히: 이름 + 설명 2줄, 결정적인 쪽만 메인 — 총평 (작업 덱 시험분석 j, 2026-10-16) |

재사용: `.k-reasons`(a), `.k-pairs`(b), `.k-days`(d), `.k-essay`(e), `.k-areas`(h), `.k-quote`(i), `.k-checks`(j).

## 입시칼럼 덱 — `examples/admission-column.html` (2028 대입 개편, 2026-10-16)

| 부품 | 쓰임 |
|---|---|
| `.k-panel.k-gradebar` > `div`(`.hl`) > `p`(`b.k-h` + `em`) + `.k-gb` > `i style="flex:비율"`×등급 수 | 시각: 등급 막대 비교(칸 폭 = 등급 비율), 1등급 칸만 진하게 · 강조 줄의 1등급만 메인 (입시칼럼 a) |

재사용: `.k-hero`(a), `.k-areas`(b), `.k-stats3` + `.k-verdict`(c), `.k-window` + `.k-read`(d 실제 세특 문장), `.k-stair3`(e), `.k-vs`(f), `.k-faq`(g), `.k-days`(h), `.k-duo`(i).

## 레벨테스트 덱 — `examples/level-test.html` (영업형, 2026-10-16)

새 부품 없음. 재사용: `.k-vs`(a), `.k-timer`(b 시간 배분), `.k-steps3` + `.k-info`(c), `.k-report`(d 실제 결과지), `.k-areas`(e), `.k-tiers`(f 반 카드), `.k-photo-hero` + `.k-reasons`(g 준비물, 사진 스타일에서만 사진 — 다른 스타일은 `.k-hero.k-nophoto-only` 큰 숫자로 빈자리 채움), `.k-faq`(h), `.k-hero` + `.k-info`(i 신청).

**`.k-nophoto-only`**: 사진 강조 카드에서 사진이 빠지는 스타일(사진 스타일이 아닐 때, `.no-photo`)에만 보이는 보충 요소 — 사진 대신 큰 숫자(`.k-hero`) 등으로 빈자리를 채운다.

## 성적 우수자 명단 덱 — `examples/top-students.html` (홍보형, 2026-10-16)

| 부품 | 쓰임 |
|---|---|
| `.k-panel.k-roster` > `p.k-roster-head`(`b`제목 + `span`시험 이름) + `p` 줄(`b`이름 · `span`학교 학년 · `em`과목 칩 · `strong`점수) | 명단표: 메인 머리 띠 + 게시판 명단처럼 줄 5개(성적 우수자 c). 이름은 늘 가린 예시(김○○) + `.k-label` "※ 외 N명 · 동의 안내". 6줄 이상이면 넘친다 |
| `.k-tiles.k-tiles-text.k-names` > `div`(`.hl`) > `b`이름 + `span`학교·과목 2줄 | 이름 타일: 이름은 숫자가 아니라 본문 폰트 46 (예전 c — 지금은 `.k-roster`). 이름은 늘 가린 예시(김○○) + `.k-label` 동의 안내 |

재사용: `.k-tiles-text`(a), `.k-rank`(b 학교별), `.k-podium`(d 상승 1~3위), `.k-hero` + `.k-db`(e 전후 점수), `.k-photo-hero` + `.k-quote`(f 학생 한마디), `.k-essay`(g), `.k-days`(h 학년별), `.k-hero` + `.k-info`(i 상담).


## 학교분석 덱 — `examples/school-analysis.html` (정보형, 2026-10-16)

한 학교의 시험 특징: 시험 한눈에(타일) · 평균 추이(꺾은선) · 출제 출처(와플) · 문항 종류(`.k-areas`) · 반영 비율(블록) · 자주 틀린 단원(사진 강조 + `.k-nophoto-only` 큰 숫자) · 4주 대비(`.k-days`, 배지에 '4주') · Q&A · 대비반 안내. 학교 이름은 가상(한빛중).

| 클래스 | 설명 |
|---|---|
| `.k-blocks.k-blocks-short` + `.k-rows.k-pairs` | 비율 블록 높이 420px — 아래에 보조 줄 목록을 붙일 때 (학교분석 e) |

## 성적 우수자 후기 덱 — `examples/top-students-review.html` (홍보형, 2026-10-16)

새 부품 없이 기존 부품으로: 전후 막대(`.k-rise`) · 사진 강조 + 인용문(`.k-quote`) · 시기 배지(`.k-days`, 3개까지 — 4개면 분할 배경에서 넘침) · 포스트잇 한마디(`.k-notes`, 학생 후기) · 말풍선(`.k-says`, 학부모 후기 — `b`에 "중2 어머니") · 전후 점 막대(`.k-db`) · 큰 숫자 + 번호 이유(`.k-reasons`) · 숫자 타일 · 상담 안내. 이름은 늘 가린 예시(김○○).

## 메인 컬러 한 곳 이상 · 공책 줄 인용 (2026-10-16)

| 클래스 | 설명 |
|---|---|
| `.k-rows > p.hl` · `.k-pairs > p.hl` · `.k-figs > p.hl` | 목록의 강조 줄: 글자(값)가 메인 컬러. 교재 강조 카드(`.k-book-split`)의 첫 숫자에 쓴다 |
| `.k-notes .hl` | 포스트잇 강조 장: 메인 바탕 + `--on-main` 글자(사용자 2026-10-16, 한 장만) |
| `.k-curri > .k-panel.accent` | 학년 × 학기 표의 강조 칸 |
| `.k-quote blockquote` | 공책 줄: 줄간격 190% + 글자 줄마다 밑줄 + 빈 줄 하나(선 간격 = 1lh, 사진 강조 안에서는 빈 줄 ✗) — 인용문 전부 |

## 관리 프로그램 덱 — `examples/management-program.html` (홍보형, 2026-10-16)

새 부품 없이: 숫자 타일(`.k-tiles-text`, a) · 등하원 문자(`.k-chat`, `.k-who` 학원·학부모, b 시각) · 시기 배지(`.k-days`, c — 배지 글자는 2자 안팎, "수업 전"은 두 줄로 꺾임) · 오답 카드(`.k-flash`, d 시각) · 주간 리포트(`.k-report`, e 시각 — 빨간 펜 동그라미 값은 2자 안팎) · 상담 주기(`.k-cycle`, f) · 숫자 세 칸 → 결론(`.k-stats3` + `.k-verdict`, g) · 담임(사진 강조 + `.k-reasons` + `.k-nophoto-only`, h) · 체험 안내(`.k-hero` + `.k-info`, i).

## 설명회 안내 덱 — `examples/info-session.html` (영업형, 2026-10-16)

새 부품 없이: 초대권(`.k-ticket`, a 시각) · 90분 시간표(`.k-sched-text`, 시각 b) · 중3 vs 고1(`.k-vs`, c) · 알려 드릴 세 가지(`.k-essay`, d) · 공부 시간 비율(`.k-blocks` 2칸, e 시각 — 칸이 3개면 큰 숫자가 좁은 칸을 넘침) · 참석 혜택(`.k-checks`, f) · 지난 설명회 후기(사진 강조 + `.k-quote` + `.k-nophoto-only` 96%, g) · Q&A(`.k-faq`, h) · 신청(`.k-hero` + `.k-info`, i).

## 수업 소개 덱 — `examples/class-intro.html` (홍보형, 2026-10-16 — '새 시각 부품 1개' 시험 덱)

| 부품 | 쓰임 |
|---|---|
| `.k-wb` > `.k-wb-board`(`p.k-h` + `.k-wb-list` > `p`(`.hl`) > `b`시간 + `span`할 일 · `p.k-wb-note` > `b` + `span`) + `.k-wb-tray` > `i`×3 | 시각: 화이트보드 '오늘의 수업' — 회색 틀 + 마커 받침(가운데 마커만 메인), 강조 줄은 할 일에 메인 마커 동그라미 (수업 소개 b). 줄은 4개 안팎 |

재사용: `.k-cmap`(a 첫 카드), `.k-window` + `.k-read`(c 실제 영어 문장 — 영어는 46px에서 길면 두 줄, 짧게), `.k-classes`(d), `.k-climb`(e 지문 길이), `.k-week`(f 클리닉 줄), `.k-hero` + `.k-scores`(g), 사진 강조 + `.k-reasons`(h), `.k-coupon` + 알약(i 마지막 카드).
※ 큰 도형 모서리는 `--r-lg` — `--r-sm`은 둥근 스타일에서 999px(알약)이라 큰 판이 동그랗게 된다.

## 학원 철학 덱 — `examples/academy-philosophy.html` (영업형, 2026-10-16)

새 부품 없이: 대비(`.k-vs`, a 첫 카드) · 실제 수학 풀이 첨삭(`.k-proof.k-proof-math` — 수식 줄 46, 끼워 넣기 글자 자리는 `.k-ins`가 있는 줄에만, 글자 높이만큼 고정(`--air` ✗ — 도형 위가 휑해짐). 빠진 줄을 `.k-ins`로 첫 줄 끝에 끼워 넣기, 시각 b. `.k-ins`만 있는 줄은 표시가 칸 밖으로 나감) · 세 원칙(`.k-areas`, c) · 90분 타이머(`.k-timer`, 시각 d) · 학생 질문 말풍선(`.k-says`, e) · 자습 도장 카드(`.k-stamps`, 시각 f) · 설문 게이지(`.k-gauge` + `.k-pairs`, g) · 선생님 질문(사진 강조 + `.k-reasons` + `.k-nophoto-only`, h) · 상담 단계(`.k-steps3` + `.k-info`, i 마지막 카드).
