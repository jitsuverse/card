// 캔버스 사이즈 (고정, 3:4)
export const CANVAS = { width: 1080, height: 1440 };

// 공통 타이포그래피 — 자간/줄간격은 여기 한 곳에서만 조정하면 전체 카드에 반영됩니다.
export const TYPOGRAPHY = {
  letterSpacing: '-0.03em', // 자간 -3%
  lineHeightTitle: 1.3,     // 제목 줄간격 130% (카드 제목, 항목 제목, ## 소제목 등 제목 역할)
  lineHeightBody: 1.5,      // 본문·주석 줄간격 150% (부연설명, 문단, 설명, 표, 후기, ※ 참고사항 등)
  headlineWeight: 700,      // 카드 제목(표지 제목·본문 카드 제목)에만: Bold (없으면 폰트가 가진 가장 가까운 굵기). 도식 영역의 큰 숫자 등은 세미볼드(--figure-weight, 2026-10-16)
  titleWeight: 600,         // 그 밖의 제목 역할(항목 제목·표 머리행·단계 라벨 등): Semibold (없으면 Bold → 그것도 없으면 폰트의 유일한 굵기) — 이 글자들은 본문 폰트
  // 제목 폰트는 카드 제목과 강조해 보여주는 큰 숫자(항목 제목 크기 이상)에만 쓴다. 나머지는 모두 본문 폰트
  bodyWeight: 400,          // 본문: Regular
  // 글자 크기 5단계 (px) — 모든 텍스트는 이 중 하나를 쓴다
  size: {
    display: 96, // 표지 제목, 핵심 큰 숫자(.k-big)
    title: 68,   // 본문 카드 제목, 도식 안 숫자(타일·점수 등)
    heading: 46, // 항목 제목, 표지 부제, 본문 카드 부연설명, 강조 값
    body: 38,    // 본문 — 일반 텍스트는 모두 이 크기 (설명, 라벨, 태그, 번호, 표, 작성자 등)
    caption: 32, // 보조 — '※' 참고사항에만 사용
  },
};

// 도형 스타일 공통 값 — 기본/선 스타일의 도형 채움, 그림자 세기, 선 색상
export const SHAPE_TOKENS = {
  fill: '#FFFFFF',
  darkFill: 'color-mix(in srgb, #FFFFFF 10%, var(--bg))', // 어두운 배경(단색·위아래 나눔)의 흰 도형: 유리색(흰색 10%)을 바탕에 섞은 불투명 색 — 반투명이면 꼬리·손잡이·선이 겹친 자리가 비쳐서(2026-10-16 사용자). 글자는 원래 제목·본문 색
  shadowDistance: 14, // 그림자 거리(px) — 항상 아래쪽
  shadowBlur: 36,     // 그림자 번짐(px)
  accentShadowAlpha: '22%', // 태그·배지 그림자 (메인 컬러 기준)
};

// 표지: 인스타 프로필 격자에서 1:1로 잘려 보여도 글자가 다 보이도록, 글자는 가운데 1:1 영역 안에만 둔다
// (이미지·아이콘은 영역 밖으로 나가도 됨). 글자는 1:1 영역 가장자리에서 inset만큼 안쪽에서 시작
export const COVER_TOKENS = { safeSize: 1080, inset: 96 };

// 본문 카드 배경 — 판(흰 사각형·종이)이 카드 가장자리에서 떨어진 거리와 판 위 여백
export const PANEL_TOKENS = {
  fill: '#FFFFFF',
  inset: 64,          // 카드 가장자리 → 판 가장자리 (px)
  headGap: 88, // 본문 카드: 제목·부연설명 영역과 아래 도식 사이 여백(px)
  padding: '180px 128px', // 본문 카드 콘텐츠 여백(위=아래, 왼쪽=오른쪽) — 단색·위아래 나눔
  panelPadding: '180px 168px', // 판 배경(흰 판·테두리 판): 판 안에서도 좌우 여백이 넉넉하도록 양옆을 더 크게 (판 가장자리 → 글자 104px)
  split: { headPadding: '100px 128px', bodyGap: '100px', sideGap: '128px' }, // 위아래 나눔: 흰 제목 영역 여백(위=아래), 본문 영역 위·아래 여백, 좌우 여백
};

// 1. 폰트 (제목/본문 각각 선택) — weights: 불러오는 굵기 (제목 굵기 결정에 사용), headline: 카드 제목 굵기를 따로 정할 때(Bold가 얇은 폰트)
export const FONTS = [
  { id: 'pretendard', label: 'Pretendard', family: "'Pretendard', sans-serif", weights: [400, 600, 700],
    css: 'https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css' },
  { id: 'noto-sans', label: 'Noto Sans KR', family: "'Noto Sans KR', sans-serif", weights: [400, 600, 700],
    css: 'https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;600;700&display=swap' },
  { id: 'nanum-gothic', label: '나눔고딕', family: "'Nanum Gothic', sans-serif", weights: [400, 700],
    css: 'https://fonts.googleapis.com/css2?family=Nanum+Gothic:wght@400;700&display=swap' },
  { id: 'nanum-myeongjo', label: '나눔명조', family: "'Nanum Myeongjo', serif", weights: [400, 700],
    css: 'https://fonts.googleapis.com/css2?family=Nanum+Myeongjo:wght@400;700&display=swap' },
  { id: 'gowun-dodum', label: '고운돋움', family: "'Gowun Dodum', sans-serif", weights: [400], use: 'body', // 얇은 굵기 하나뿐 → 제목 ✗
    css: 'https://fonts.googleapis.com/css2?family=Gowun+Dodum&display=swap' },
  { id: 'jua', label: '주아', family: "'Jua', sans-serif", weights: [400], use: 'title', // 굵은 장식체 → 본문 ✗
    css: 'https://fonts.googleapis.com/css2?family=Jua&display=swap' },
  { id: 'do-hyeon', label: '도현', family: "'Do Hyeon', sans-serif", weights: [400], use: 'title', // 굵은 장식체 → 본문 ✗
    css: 'https://fonts.googleapis.com/css2?family=Do+Hyeon&display=swap' },
  // ---- 추가 무료 폰트 (모두 SIL OFL — 상업적 사용 가능, CORS 허용 CDN) ----
  { id: 'suit', label: 'SUIT', family: "'SUIT', sans-serif", weights: [400, 600, 700],
    css: 'https://cdn.jsdelivr.net/gh/sunn-us/SUIT@2.0.5/fonts/static/woff2/SUIT.css' },
  { id: 'wanted-sans', label: '원티드 산스', family: "'Wanted Sans', sans-serif", weights: [400, 600, 700],
    css: 'https://cdn.jsdelivr.net/gh/wanteddev/wanted-sans@v1.0.3/packages/wanted-sans/fonts/webfonts/static/split/WantedSans.min.css' },
  { id: 'spoqa', label: '스포카 한 산스 Neo', family: "'Spoqa Han Sans Neo', sans-serif", weights: [400, 700],
    css: 'https://spoqa.github.io/spoqa-han-sans/css/SpoqaHanSansNeo.css' },
  { id: 'gothic-a1', label: '고딕 A1', family: "'Gothic A1', sans-serif", weights: [400, 600, 700],
    css: 'https://fonts.googleapis.com/css2?family=Gothic+A1:wght@400;600;700&display=swap' },
  { id: 'ibm-plex', label: 'IBM Plex Sans KR', family: "'IBM Plex Sans KR', sans-serif", weights: [400, 600, 700],
    css: 'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+KR:wght@400;600;700&display=swap' },
  { id: 'noto-serif', label: '노토 세리프', family: "'Noto Serif KR', serif", weights: [400, 600, 700],
    css: 'https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@400;600;700&display=swap' },
  { id: 'gowun-batang', label: '고운바탕', family: "'Gowun Batang', serif", weights: [400, 700],
    css: 'https://fonts.googleapis.com/css2?family=Gowun+Batang:wght@400;700&display=swap' },
  { id: 'hahmlet', label: '함렛', family: "'Hahmlet', serif", weights: [400, 600, 700],
    css: 'https://fonts.googleapis.com/css2?family=Hahmlet:wght@400;600;700&display=swap' },
  // ---- 제목용으로 추가 (굵은 굵기가 있는 무료 폰트) ----
  { id: 'gmarket', label: 'G마켓 산스', family: "'Gmarket Sans', sans-serif", weights: [300, 500, 700],
    css: 'https://cdn.jsdelivr.net/gh/fonts-archive/GmarketSans/GmarketSans.css' },
  { id: 'nanum-square-neo', label: '나눔스퀘어 네오', family: "'Nanum Square Neo', sans-serif", weights: [300, 400, 700, 800, 900], headline: 800, // Bold가 얇게 디자인돼 카드 제목은 ExtraBold
    css: 'https://cdn.jsdelivr.net/gh/fonts-archive/NanumSquareNeo/NanumSquareNeo.css' },
  { id: 'nanum-square', label: '나눔스퀘어', family: "'Nanum Square', sans-serif", weights: [300, 400, 700, 800], headline: 800, // Bold가 얇게 디자인돼 카드 제목은 ExtraBold
    css: 'https://cdn.jsdelivr.net/gh/fonts-archive/NanumSquare/NanumSquare.css' },
  { id: 'paperlogy', label: '페이퍼로지', family: "'Paperlogy', sans-serif", weights: [400, 500, 600, 700, 800, 900],
    css: 'https://cdn.jsdelivr.net/gh/fonts-archive/Paperlogy/Paperlogy.css' },
  { id: 's-core-dream', label: '에스코어 드림', family: "'S-Core Dream', sans-serif", weights: [400, 500, 600, 700, 800, 900],
    css: 'https://cdn.jsdelivr.net/gh/fonts-archive/S-CoreDream/S-CoreDream.css' },
  { id: 'sunflower', label: '해바라기', family: "'Sunflower', sans-serif", weights: [300, 500, 700],
    css: 'https://fonts.googleapis.com/css2?family=Sunflower:wght@300;500;700&display=swap' },
  // ---- 2026-10-16 추가 (무료 · 상업적 사용 가능. 카페24 써라운드만 카페24 무료 폰트 약관, 나머지 SIL OFL) ----
  { id: 'line-seed', label: 'LINE Seed', family: "'LINE Seed KR', sans-serif", weights: [400, 700],
    css: 'https://cdn.jsdelivr.net/gh/fonts-archive/LINESeedKR/LINESeedKR.css' },
  { id: 'suite', label: 'SUITE', family: "'SUITE', sans-serif", weights: [400, 600, 700, 800],
    css: 'https://cdn.jsdelivr.net/gh/sunn-us/SUITE/fonts/static/woff2/SUITE.css' },
  { id: 'nanum-barun', label: '나눔바른고딕', family: "'Nanum Barun Gothic', sans-serif", weights: [400, 700],
    css: 'https://cdn.jsdelivr.net/gh/fonts-archive/NanumBarunGothic/NanumBarunGothic.css' },
  { id: 'freesentation', label: '프리젠테이션', family: "'Freesentation', sans-serif", weights: [400, 500, 600, 700, 800, 900],
    css: 'https://cdn.jsdelivr.net/gh/fonts-archive/Freesentation/Freesentation.css' },
  { id: 'koddi-ongothic', label: 'KoddiUD 온고딕', family: "'KoddiUD OnGothic', sans-serif", weights: [400, 700, 800],
    css: 'https://cdn.jsdelivr.net/gh/fonts-archive/KoddiUDOnGothic/KoddiUDOnGothic.css' },
  { id: 'maru-buri', label: '마루부리', family: "'Maru Buri', serif", weights: [400, 600, 700],
    css: 'https://cdn.jsdelivr.net/gh/fonts-archive/MaruBuri/MaruBuri.css' },
  { id: 'orbit', label: '오르빗', family: "'Orbit', sans-serif", weights: [400], use: 'body', // 굵기 하나뿐 → 제목 ✗
    css: 'https://fonts.googleapis.com/css2?family=Orbit&display=swap' },
  { id: 'black-han-sans', label: '검은고딕', family: "'Black Han Sans', sans-serif", weights: [400], use: 'title', // 아주 굵은 제목체 → 본문 ✗
    css: 'https://fonts.googleapis.com/css2?family=Black+Han+Sans&display=swap' },
  { id: 'song-myung', label: '송명', family: "'Song Myung', serif", weights: [400], use: 'title', // 붓 느낌 명조 → 본문 ✗
    css: 'https://fonts.googleapis.com/css2?family=Song+Myung&display=swap' },
  { id: 'cafe24-ssurround', label: '카페24 써라운드', family: "'Cafe24 Ssurround', sans-serif", weights: [400], use: 'title', // 굵은 둥근 제목체 → 본문 ✗
    css: 'https://cdn.jsdelivr.net/gh/fonts-archive/Cafe24Ssurround/Cafe24Ssurround.css' },
  // ---- 2026-10-16 두 번째 추가 (모두 무료 · 상업적 사용 가능: 넥슨·KoPub·경기·서울·티머니·학교안심·잘난체는 각 기관 무료 약관, 가석 원은 사용자 요청으로 뺌) ----
  { id: 'nexon-lv1', label: '넥슨 Lv1 고딕', family: "'NEXON Lv1 Gothic', sans-serif", weights: [300, 400, 700],
    css: 'https://cdn.jsdelivr.net/gh/fonts-archive/NEXONLv1Gothic/NEXONLv1Gothic.css' },
  { id: 'kopub-dotum', label: 'KoPub 돋움', family: "'KoPub Dotum', sans-serif", weights: [300, 500, 700],
    css: 'https://cdn.jsdelivr.net/gh/fonts-archive/KoPubDotum/KoPubDotum.css' },
  { id: 'hakgyoansim-bareon', label: '학교안심 바른돋움', family: "'Hakgyoansim Bareondotum', sans-serif", weights: [400, 700],
    css: 'https://cdn.jsdelivr.net/gh/fonts-archive/HakgyoansimBareondotum/HakgyoansimBareondotum.css' },
  { id: 'hakgyoansim-miso', label: '학교안심 둥근미소', family: "'Hakgyoansim Dunggeunmiso', sans-serif", weights: [400, 700],
    css: 'https://cdn.jsdelivr.net/gh/fonts-archive/HakgyoansimDunggeunmiso/HakgyoansimDunggeunmiso.css' },
  { id: 'seoul-namsan', label: '서울남산체', family: "'Seoul Namsan', sans-serif", weights: [300, 500, 700, 800], headline: 800, // Bold가 얇은 편이라 카드 제목은 ExtraBold
    css: 'https://cdn.jsdelivr.net/gh/fonts-archive/SeoulNamsan/SeoulNamsan.css' },
  { id: 'tmoney-round', label: '티머니 둥근바람', family: "'Tmoney Round Wind', sans-serif", weights: [400, 800], headline: 800, use: 'title', // 본문으로 쓰면 줄 높이가 커서 몇 덱이 3~6px 넘침 → 제목 전용
    css: 'https://cdn.jsdelivr.net/gh/fonts-archive/TmoneyRoundWind/TmoneyRoundWind.css' },
  { id: 'gyeonggi-batang', label: '경기천년바탕', family: "'Gyeonggi Batang', serif", weights: [400, 700],
    css: 'https://cdn.jsdelivr.net/gh/fonts-archive/GyeonggiBatang/GyeonggiBatang.css' },
  { id: 'gyeonggi-title', label: '경기천년제목', family: "'Gyeonggi Title', sans-serif", weights: [300, 500, 700], use: 'title', // 제목 전용 디자인 → 본문 ✗
    css: 'https://cdn.jsdelivr.net/gh/fonts-archive/GyeonggiTitle/GyeonggiTitle.css' },
  { id: 'jalnan-gothic', label: '잘난고딕', family: "'Jalnan Gothic', sans-serif", weights: [400], use: 'title', // 굵은 제목체 하나 → 본문 ✗
    css: 'https://cdn.jsdelivr.net/gh/fonts-archive/JalnanGothic/JalnanGothic.css' },
];
// 제목·본문 선택 목록: use가 없으면 둘 다, 'title'이면 제목 전용, 'body'면 본문 전용
// 메뉴는 가나다 순(한글 먼저, 영문 이름은 뒤 — 2026-10-16 사용자). FONTS 배열 순서는 그대로(FONTS[0] Pretendard = 기본·대체 폰트)
const byLabel = (a, b) => a.label.localeCompare(b.label, 'ko');
export const TITLE_FONTS = FONTS.filter((f) => f.use !== 'body').sort(byLabel);
export const BODY_FONTS = FONTS.filter((f) => f.use !== 'title').sort(byLabel);

// 3~5. 도형 모양 / 도형 스타일 / 아이콘
export const SHAPES = [
  { id: 'square', label: '각진형' },
  { id: 'rounded', label: '둥근형' },
];
export const SHAPE_STYLES = [
  { id: 'basic', label: '기본' },
  { id: 'shadow', label: '그림자' },
  { id: 'line', label: '테두리' },
];
// 책 목업 각도 — 표지 이미지 비율은 그대로 두고 입체 책으로 보여준다
export const BOOK_MOCKUPS = [
  { id: 'front', label: '정면' },
  { id: 'spine', label: '책등' },
  { id: 'pages', label: '옆면' },
];

// 표지 오른쪽 아래 이미지 — 아이콘 / 강사 사진(배경 제거 상반신) / 교재 사진(책 목업, 각도는 bookMockup)
export const COVER_VISUALS = [
  { id: 'icon', label: '아이콘' },
  { id: 'teacher', label: '강사 사진' },
  { id: 'book', label: '교재 사진' },
];

// 표지 정렬 — 왼쪽: 글자 왼쪽 위 + 이미지 오른쪽 아래 / 가운데: 글자·이미지를 한 묶음으로 1:1 영역 한가운데에 쌓는다
export const COVER_ALIGNS = [
  { id: 'left', label: '왼쪽' },
  { id: 'center', label: '가운데' },
  { id: 'bottom', label: '아래' }, // 글자를 1:1 영역 아래쪽에 왼쪽 정렬, 이미지는 오른쪽 위
];

// 표지 배경 — 배경 컬러(본문 카드와 같은 배경) / 메인 컬러(글자는 메인 위에서 잘 보이는 색으로 자동)
export const COVER_BGS = [
  { id: 'bg', label: '배경 컬러' },
  { id: 'main', label: '메인 컬러' },
];


// 6. 본문 카드 배경 (표지는 항상 단색)
export const CARD_STYLES = [
  { id: 'solid', label: '기본' },
  { id: 'panel', label: '카드형' },
  { id: 'outline', label: '테두리형' },
  { id: 'split', label: '상단 강조' },
];

// 번호·체크 동그라미는 Phosphor Icons(assets/phosphor.js), 그 밖의 그림 아이콘은 2D 아이콘 세트(icons.js)를 쓴다.

// 2. 컬러 프리셋 (main / bg / title / body) — 도형이 흰색이므로 배경은 밝은 톤 위주
export const COLOR_PRESETS = [
  { label: '블루', colors: { main: '#3B5BFD', bg: '#F1F3F8', title: '#111111', body: '#45464D' } },
  { label: '코랄', colors: { main: '#FF6B4A', bg: '#FFF4EC', title: '#2A1A14', body: '#5E4A42' } },
  { label: '그린', colors: { main: '#1F9D6B', bg: '#ECF5F0', title: '#0F2A1F', body: '#3F5A4E' } },
  { label: '네이비', colors: { main: '#22336B', bg: '#FFF8E7', title: '#14183A', body: '#4A4F66' } },
];

// 관리자(디자이너)가 정한 추천 스타일 6개 — 원장님은 이 중 하나를 골라 카드를 만들고, 만든 뒤 세부 옵션만 바꾼다(2026-10-16 사용자 확정).
// 칸 순서대로 { name, opts } — opts는 DEFAULT_OPTIONS에서 바꾼 값만(내 스타일 저장값과 같은 모양). 홈페이지는 lib/cardkit/defaultStyles로 가져간다.
// 바꾸는 법: 웹앱에서 옵션을 맞춰 '내 스타일' 칸에 저장 → '스타일 코드 복사' → 여기에 붙여 넣기.
export const PRESET_STYLES = [
  { name: "미니멀 스타일", opts: {"colors":{"main":"#3B5BFD","bg":"#f2f2f2","title":"#111111","body":"#45464D"},"shapeStyle":"basic"} },
  { name: "기본 스타일", opts: {"colors":{"main":"#3B5BFD","bg":"#f2f2f2","title":"#111111","body":"#45464D"},"shapeStyle":"basic","cardStyle":"panel","coverAlign":"center"} },
  { name: "라인 스타일", opts: {"fontTitle":"paperlogy","fontBody":"paperlogy","colors":{"main":"#3B5BFD","bg":"#f2f2f2","title":"#111111","body":"#45464D"},"shape":"square","shapeStyle":"line","shapeLine":{"width":3,"color":"#000000"},"cardStyle":"outline","panelLine":{"width":3,"color":"#000000"}} },
  { name: "상단 스타일", opts: {"fontTitle":"tmoney-round","colors":{"main":"#3B5BFD","bg":"#f2f2f2","title":"#111111","body":"#45464D"},"cardStyle":"split","coverAlign":"center"} },
  { name: "다크 스타일", opts: {"colors":{"main":"#3B5BFD","bg":"#000000","title":"#ffffff","body":"#c2c2c2"},"coverAlign":"center"} },
  { name: "사진 스타일", opts: {"shape":"square","coverAlign":"bottom","photo":true} },
];

export const DEFAULT_OPTIONS = {
  fontTitle: 'pretendard',
  fontBody: 'pretendard',
  colors: { ...COLOR_PRESETS[0].colors },
  shape: 'rounded',
  shapeStyle: 'shadow',
  cardStyle: 'solid',
  bookMockup: 'front', // 책 목업 각도
  coverVisual: 'icon', // 표지 오른쪽 아래 이미지: icon / teacher / book
  coverAlign: 'left', // 표지 정렬: left / center / bottom
  coverBg: 'bg', // 표지 배경: bg(배경 컬러) / main(메인 컬러)
  photo: false, // 사진 스타일: 카드의 data-bgimg 사진을 도식이 작은 카드에만 깐다(표지는 전체 사진) — 내 스타일 6번 '사진'으로 켠다
  shapeShadow: { opacity: 6 }, // 도형 스타일 '그림자'의 투명도(%) — 방향은 아래 고정
  shapeLine: { width: 3, color: '#D9D9DE' }, // 도형 스타일 '선'의 굵기(px)·색
  panelLine: { width: 3, color: '#D9D9DE' }, // 테두리 판의 선 굵기(px)·색
};

// 사진 스타일 사진 모음 (2026-10-16 사용자 확정) — Unsplash 무료 사진 주소의 id만 둔다(파일 ✗, 가볍다). 하나씩 눈으로 확인: 얼굴 정면·문신·로고·술담배 ✗.
// 덱에는 주소 대신 data-bgimg="pool:classroom" · data-src="pool:exam" · data-srcs="pool:books pool:desk"처럼 주제만 쓴다.
// main.js resolvePools가 덱마다(표지 제목 기준) 다른 사진을 고르고, 한 덱 안에서는 겹치지 않게 한다. 사진 도구 '다른 사진'은 같은 주제의 다음 사진.
// 사진을 더할 때도 같은 기준으로 확인한 뒤 해당 주제 배열 끝에 id만 붙인다.
export const PHOTO_POOL = {
  classroom: [ // 교실
    '1580582932707-520aed937b7b',
    '1740635341299-3b8e3490f546',
    '1604134967494-8a9ed3adea0d',
    '1635424239131-32dc44986b56',
    '1617721926586-4eecce739745',
    '1777259759623-b39589cfff9b',
    '1541829070764-84a7d30dd3f3',
    '1630705605873-5d7776c38d78',
    '1602145095452-aba06946ed05',
    '1631885661110-aa12f8b42b25',
  ],
  writing: [ // 필기하는 손
    '1517971071642-34a2d3ecc9cd',
    '1550592704-6c76defa9985',
    '1579017308347-e53e0d2fc5e9',
    '1616740793717-0aca29b92221',
    '1654022963276-ef761eac346e',
    '1522881451255-f59ad836fdfb',
    '1488722796624-0aa6f1bb6399',
    '1633442495686-e8b67cffab53',
    '1612414982193-a59247a2f974',
    '1434030216411-0b793f4b4173',
  ],
  exam: [ // 시험지·학습지
    '1606326608606-aa0b62935f2b',
    '1769794370964-78412732f1cd',
    '1516409590654-e8d51fc2d25c',
    '1771173479042-810085465e49',
    '1518133910546-b6c2fb7d79e3',
    '1649252504109-686f70fa38af',
  ],
  books: [ // 책·도서관
    '1550399105-c4db5fb85c18',
    '1783945733752-53c02b16434a',
    '1614849963640-9cc74b2a826f',
    '1568667256531-7d5ac92eaa7a',
    '1758801305053-97e7e20fee3e',
    '1585521747230-516376e5a85d',
    '1550399105-05c4a7641b02',
    '1577985051167-0d49eec21977',
    '1594312915251-48db9280c8f1',
    '1695774165691-8a01a6045952',
  ],
  school: [ // 학교 건물
    '1591123120675-6f7f1aae0e5b',
    '1784758359789-09dd90ea9dab',
    '1613896527026-f195d5c818ed',
    '1584750153892-38414eb8e76a',
    '1780817612650-4b4569f0a00b',
    '1599725427295-6ed79ff8dbef',
    '1592280771190-3e2e4d571952',
    '1610962381137-50ef93055125',
    '1620003048292-c4db88559488',
    '1611941671018-6c3907cb7a76',
  ],
  desk: [ // 공부 책상
    '1616400619175-5beda3a17896',
    '1488190211105-8b0e65b80b4e',
    '1761323612470-b8de857169e1',
    '1533090161767-e6ffed986c88',
    '1611269154421-4e27233ac5c7',
    '1585832770485-e68a5dbfad52',
    '1591382696684-38c427c7547a',
    '1531668720450-39cf1563fab9',
    '1486946255434-2466348c2166',
    '1654356709115-3f68998bead4',
  ],
  help: [ // 공부 돕기·상담
    '1560785496-3c9d27877182',
    '1560785496-284e257f0bf7',
    '1560785477-d43d2b34e0df',
    '1707246719682-6841358980c0',
    '1585432959315-d9342fd58eb6',
    '1454165804606-c3d57bc86b40',
    '1653276071161-379c70560951',
    '1562564055-71e051d33c19',
  ],
};
export const poolURL = (id) => `https://images.unsplash.com/photo-${id}?w=1200&q=80&auto=format&fit=crop`;
