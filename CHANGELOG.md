# 변경 기록

## v1.1 — 2026-10-14 카드 설계 기준 확정

- **카드 설계 기준 확정**(CLAUDE.md '카드뉴스 만들기'): 카드마다 주 도식 1개 + 보조 1개 + 한 줄 요약, 시각 30% · 정보 70%, 정보 카드는 항목마다 설명 한 줄. 기준 덱 `kit/examples/english-grammar.html`, 원형 `docs/reference/reading-deck-v0.html`.
- **예시 덱 8벌 추가**(총 12벌): english-v1 · english · social · math-curriculum · korean · korean-text · korean-formula · english-grammar. 기준을 정하는 동안 만든 덱이라 서로 비교해 볼 수 있다(경과는 DESIGN-NOTES '설계 순서').
- **부품 추가**(kit.css 맨 아래, PARTS.md 덱별 표): 문장 구조 표시 · 영어 첨삭 · 시험 달력 · 학년 계단 · 펼친 문제집 · 지문 칸 · 실제 문장 읽기 창 · 이유 목록 · 영역 설명 칸 · 학년 × 학기 표 · 요일 줄 · 반 카드 · 관리 주기 · 숫자 세 칸 · 비율 블록 · 말풍선 · 높아지는 막대 · 번호 단계 등. 글이 많을 때 여백을 줄이는 `.tight`.
- 글자 색 짝 보정: 단계 번호(`.k-num`)는 메인 강조, 취소선 알약(`.k-pill.ghost`)은 보통 굵기.
- 남아 있던 '템플릿·스킬' 주석 정리.
- 작업 덱 `kit/cards.html` = 기준 덱(중등 영어 문법).

## v1.0 — 2026-10-14 이식

- 원래 개발 폴더(card 스킬)에서 **부품 키트(B 방식)**만 떼어 옮겼다. 템플릿 방식(A, 34종 자동 레이아웃) 코드와 문서는 뺐다.
  - `assets/render.js`: 옵션 → CSS 변수(`themeVars`), 카드 배경 판, 책 목업·사진 틀·강사 사진만 남김
  - `assets/card.css`: 표지·사진 틀·책 목업·강사 사진·도형 스타일 규칙만 남김
  - `assets/fit.js`: 글자 간격 보정(`fitTextGaps`·`fitSplitHead`)만 남김, 기본 선택자를 `.kcard`로
  - `assets/config.js`: 레이아웃 목록(`LAYOUTS`) 삭제
- 포함 덱: 작업 덱 `kit/cards.html`(초등 코딩·로봇반 10장), 예시 덱 4벌(과학 24장 · 글쓰기 · 수학 · 코딩 각 10장)
- 이식 전후로 예시 덱 5벌 × 옵션 15조합의 카드 그림이 같음을 확인했다(960장 픽셀 비교, 그림자 경계 1/255 오차 1장).
- 왼쪽 옵션 패널 폴더 이름을 `webapp/` → `panel/`로 바꿨다.
- 이 버전부터 이 저장소가 원본이다.
