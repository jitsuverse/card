// 캔버스 사이즈 (고정, 3:4)
export const CANVAS = { width: 1080, height: 1440 };

// 공통 타이포그래피 — 자간/줄간격은 여기 한 곳에서만 조정하면 전체 카드에 반영됩니다.
export const TYPOGRAPHY = {
  letterSpacing: '-0.03em', // 자간 -3%
  lineHeightTitle: 1.3,     // 제목 줄간격 130% (카드 제목, 항목 제목, ## 소제목 등 제목 역할)
  lineHeightBody: 1.5,      // 본문·주석 줄간격 150% (부연설명, 문단, 설명, 표, 후기, ※ 참고사항 등)
  headlineWeight: 700,      // 카드 제목(표지 제목·본문 카드 제목): Bold (없으면 폰트가 가진 가장 가까운 굵기)
  titleWeight: 600,         // 그 밖의 제목 역할(항목 제목·표 머리행·단계 라벨 등): Semibold (없으면 Bold → 그것도 없으면 폰트의 유일한 굵기) — 이 글자들은 본문 폰트
  // 제목 폰트는 카드 제목과 강조해 보여주는 큰 숫자(항목 제목 크기 이상)에만 쓴다. 나머지는 모두 본문 폰트
  bodyWeight: 400,          // 본문: Regular
  // 글자 크기 5단계 (px) — 모든 텍스트는 이 중 하나를 쓴다
  size: {
    display: 96, // 표지 제목
    title: 68,   // 본문 카드 제목, 강조 숫자
    heading: 46, // 항목 제목, 표지 부제, 본문 카드 부연설명, 강조 값
    body: 38,    // 본문 — 일반 텍스트는 모두 이 크기 (설명, 라벨, 태그, 번호, 표, 작성자 등)
    caption: 32, // 보조 — '※' 참고사항에만 사용
  },
};

// 도형 스타일 공통 값 — 기본/선 스타일의 도형 채움, 그림자 세기, 선 색상
export const SHAPE_TOKENS = {
  fill: '#FFFFFF',
  darkFill: 'rgba(255, 255, 255, 0.10)', // 어두운 배경(단색·위아래 나눔)의 흰 도형: 투명도 90% 유리 도형 — 글자는 원래 제목·본문 색
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
];
// 제목·본문 선택 목록: use가 없으면 둘 다, 'title'이면 제목 전용, 'body'면 본문 전용
export const TITLE_FONTS = FONTS.filter((f) => f.use !== 'body');
export const BODY_FONTS = FONTS.filter((f) => f.use !== 'title');

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
  { id: 'pages-wide', label: '옆면 넓게' }, // 더 많이 돌려 세워 종이 단면이 넓게 보임
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
