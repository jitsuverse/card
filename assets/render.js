// 부품 키트(kit/)가 쓰는 엔진: 옵션 → CSS 변수(themeVars), 카드 배경 판, 책 목업·사진 틀·강사 사진
import { CANVAS, TYPOGRAPHY, FONTS, SHAPE_TOKENS, PANEL_TOKENS, COVER_TOKENS } from './config.js';

const esc = (s = '') => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
// 텍스트 출력: 문장 속 굵게 표시(**)는 쓰지 않으므로 표시만 지운다
const plain = (s = '') => esc(s).replace(/\*\*(.+?)\*\*/g, '$1');

const luminance = (hex) => {
  const n = parseInt(hex.slice(1), 16);
  return (0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255;
};
export const contrastText = (hex) => (luminance(hex) > 0.6 ? '#111111' : '#FFFFFF');

// 두 색을 t 비율로 섞는다 (t=0 → a, t=1 → b)
function mix(a, b, t) {
  const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16);
  const ch = (sh) => Math.round(((pa >> sh) & 255) * (1 - t) + ((pb >> sh) & 255) * t);
  return `#${((1 << 24) | (ch(16) << 16) | (ch(8) << 8) | ch(0)).toString(16).slice(1)}`;
}

// 판 배경(흰 판·테두리 판)에서 도형은 카드 배경색으로 채워진다.
// 배경이 어두우면 도형 안 글자를 밝게 바꿔 읽히게 한다.
function shapeTextColors(c) {
  if (luminance(c.bg) >= 0.5) return { title: c.title, body: c.body, accent: c.main };
  return { title: '#FFFFFF', body: mix(c.bg, '#FFFFFF', 0.8), accent: mix(c.main, '#FFFFFF', 0.45) };
}

// 단색·위아래 나눔 배경이 어두우면 흰 도형은 투명도 90%(흰색 10%)의 유리 도형이 되고, 도형 안 글자는 원래 제목·본문 색 그대로
const isDark = (c) => luminance(c.bg) < 0.5;

// 도형 그림자: 아래쪽 고정, 투명도(%)만 조절
function shapeShadow({ opacity = 6 } = {}) {
  return `0 ${SHAPE_TOKENS.shadowDistance}px ${SHAPE_TOKENS.shadowBlur}px rgba(0, 0, 0, ${opacity / 100})`;
}

const findFont = (id) => FONTS.find((f) => f.id === id) ?? FONTS[0];

// 카드 제목 굵기: Bold(700) → 없으면 폰트가 가진 굵기 중 가장 가까운 것
const nearestWeight = (font, target) => font.weights.reduce((a, b) => (Math.abs(b - target) < Math.abs(a - target) ? b : a));

// Semibold(600) → 없으면 Bold(700) → 그것도 없으면 폰트가 가진 굵기 중 가장 가까운 것
function strongWeightFor(font) {
  const w = font.weights;
  if (w.includes(TYPOGRAPHY.titleWeight)) return TYPOGRAPHY.titleWeight;
  if (w.includes(700)) return 700;
  return w.reduce((a, b) => (Math.abs(b - TYPOGRAPHY.titleWeight) < Math.abs(a - TYPOGRAPHY.titleWeight) ? b : a));
}

// 옵션 → 카드에 적용되는 CSS 변수
export function themeVars(opts) {
  const titleFont = findFont(opts.fontTitle);
  const c = opts.colors;
  return {
    '--w': `${CANVAS.width}px`,
    '--h': `${CANVAS.height}px`,
    '--font-title': titleFont.family,
    '--font-body': findFont(opts.fontBody).family,
    '--title-weight': strongWeightFor(findFont(opts.fontBody)), // 항목 제목·라벨 세미볼드 — 이 글자들은 본문 폰트로 쓰므로 본문 폰트 기준
    '--headline-weight': titleFont.headline ?? nearestWeight(titleFont, TYPOGRAPHY.headlineWeight), // 표지·본문 카드 제목 (Bold가 얇은 폰트는 font.headline)
    '--body-head-weight': strongWeightFor(findFont(opts.fontBody)), // 본문 크기 소제목(## ) 굵기
    '--body-weight': TYPOGRAPHY.bodyWeight,
    '--main': c.main,
    '--on-main': contrastText(c.main),
    '--bg': c.bg,
    // 어두운 배경: 메인 컬러를 오른쪽 위에서 은은하게 번지게 한 조명 하나. 밝은 배경은 없음
    '--bg-glow': isDark(c)
      ? 'radial-gradient(80% 55% at 100% 0%, color-mix(in srgb, var(--main) 24%, transparent), transparent 100%)'
      : 'none',
    '--title': c.title,
    '--body': c.body,
    '--r-lg': opts.shape === 'rounded' ? '40px' : '0px',
    '--r-sm': opts.shape === 'rounded' ? '999px' : '0px',
    '--shape-fill': isDark(c) ? SHAPE_TOKENS.darkFill : SHAPE_TOKENS.fill, // 판 배경은 card.css에서 카드 배경색으로 덮어씀
    ...(() => { const t = shapeTextColors(c); return { '--shape-title': t.title, '--shape-body': t.body, '--shape-accent': t.accent }; })(),
    // 반투명 흰 도형(4분면 칸 등)의 불투명도: 밝은 배경 55%, 어두운 배경은 도형 자체가 이미 반투명 유리라 100%
    '--soft-fill': isDark(c) ? '100%' : '55%',
    '--shape-shadow': shapeShadow(opts.shapeShadow),
    '--accent-shadow-alpha': SHAPE_TOKENS.accentShadowAlpha,
    '--line-width': `${opts.shapeLine?.width ?? 3}px`,
    '--line-color': opts.shapeLine?.color ?? '#D9D9DE',
    '--panel-fill': PANEL_TOKENS.fill,
    '--panel-inset': `${PANEL_TOKENS.inset}px`,
    '--content-padding': PANEL_TOKENS.padding,
    '--panel-content-padding': PANEL_TOKENS.panelPadding,
    '--cover-safe-top': `${(CANVAS.height - COVER_TOKENS.safeSize) / 2}px`,
    '--cover-inset': `${COVER_TOKENS.inset}px`, // 1:1 영역 가장자리 → 글자·이미지
    '--cover-padding': `${(CANVAS.height - COVER_TOKENS.safeSize) / 2 + COVER_TOKENS.inset}px ${COVER_TOKENS.inset}px`,
    '--head-gap': `${PANEL_TOKENS.headGap}px`,
    '--split-head-padding': PANEL_TOKENS.split.headPadding,
    '--split-side': PANEL_TOKENS.split.sideGap,
    '--split-gap': PANEL_TOKENS.split.bodyGap,
    '--book-spine': mix(c.main, '#000000', 0.35),
    '--panel-line-width': `${opts.panelLine?.width ?? 3}px`,
    '--panel-line-color': opts.panelLine?.color ?? '#D9D9DE',
    '--ls': TYPOGRAPHY.letterSpacing,
    '--lh-title': TYPOGRAPHY.lineHeightTitle,
    '--lh-body': TYPOGRAPHY.lineHeightBody,
    ...Object.fromEntries(Object.entries(TYPOGRAPHY.size).map(([k, v]) => [`--fs-${k}`, `${v}px`])),
  };
}

const PHOTO_ICON = `<svg viewBox="0 0 48 48" aria-hidden="true"><path fill="currentColor" fill-rule="evenodd" d="M10 8h28a6 6 0 0 1 6 6v20a6 6 0 0 1-6 6H10a6 6 0 0 1-6-6V14a6 6 0 0 1 6-6Zm23 7a4 4 0 1 0 0 8 4 4 0 0 0 0-8ZM8 34l10-12 8 9 5-5 9 8v1a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2Z"/></svg>`;

// 책 목업: 표지(높이 고정, 가로는 원본 비율) + 책등·종이 단면·뒤표지·위아래 면을 CSS 3D로 붙인다
// 면 순서는 뒤 → 옆 → 표지: 3D 깊이 정렬을 하지 않는 내보내기 도구(html-to-image)에서도 표지가 맨 앞에 그려지게
// 사진 배율(%)·위치(px, 카드 원본 기준) → CSS 변수. 사진 틀 안에서 확대·축소·이동된다 (배율 50~200%)
const scaleStyle = (scale, x = 0, y = 0, pos = null) => {
  const v = Math.min(200, Math.max(50, Number(scale) || 100));
  const vars = [v !== 100 && `--img-scale: ${v / 100}`, (x || y) && `--img-x: ${Math.round(x)}px; --img-y: ${Math.round(y)}px`,
    pos && `--img-pos: ${Math.round(pos[0])}% ${Math.round(pos[1])}%`].filter(Boolean); // pos: 잘린 사진에서 보이는 위치(끌어서 정함, %)
  return vars.length ? ` style="${vars.join('; ')}"` : '';
};

export function bookMockup(img = {}, slot = '') { // 부품 키트(kit/)도 같은 목업·사진 틀·강사 사진을 쓴다
  const { caption = '교재 표지', src = '', scale, x = 0, y = 0 } = img;
  const cover = src
    ? `<img class="book-cover" src="${esc(src)}" alt="${esc(caption)}" onload="this.classList.toggle('wide', this.naturalWidth / this.naturalHeight > 0.85)">` // 가로 사진이면 책 비율로 자름
    : `<div class="book-cover book-cover-empty">${PHOTO_ICON}<span>${plain(caption)}</span></div>`;
  return `<div class="book-item${src ? ' has-img' : ''}" data-img="${slot}"${scaleStyle(scale, x, y)}>
    <div class="book-shadow"></div>
    <div class="book"><i class="book-back"></i><i class="book-bottom"></i><i class="book-top"></i><i class="book-spine"></i><i class="book-pages"></i>${cover}<i class="book-gloss"></i></div>
  </div>`;
}

// 사진 틀: 주소가 있으면 사진(cover로 채움), 없으면 자리표시(아이콘 + 캡션)
// withCaption: 사진 위 왼쪽 아래에 캡션 칩 표시
// slot: 사진 자리 이름 — 미리보기에서 사진 자리를 클릭해 이미지를 넣을 때 어느 줄인지 찾는 데 쓴다
// img.pos: 보이는 위치 [x%, y%] (사진을 끌어서 정함) · img.fit === 'contain': 전체 보기(잘리지 않게 칸 안에 다 넣고 남는 곳은 흰 바탕)
export function photoFrame(img = {}, cls = '', withCaption = false, slot = '') {
  const { caption = '사진', src = '' } = img;
  const inner = src
    ? `<img src="${esc(src)}" alt="${esc(caption)}">`
    : `<div class="photo-placeholder">${PHOTO_ICON}<span>${plain(caption)}</span></div>`;
  const chip = withCaption && caption && src ? `<span class="photo-caption">${plain(caption)}</span>` : '';
  return `<figure class="shape photo ${cls}${src ? ' has-img' : ''}${src && img.fit === 'contain' ? ' fit-contain' : ''}"${slot ? ` data-img="${slot}"` : ''}${scaleStyle(img.scale, 0, 0, img.pos)}>${inner}${chip}</figure>`;
}

export function cardBackground(style, i) { // 부품 키트(kit/)도 같은 배경을 쓴다
  if (style === 'panel' || style === 'outline') return '<div class="card-panel"></div>';
  return '';
}

// 강사 상반신(배경 제거) + 뒤쪽 원형 조명 — 강사 프로필 카드와 표지 강사 사진이 같은 코드를 쓴다 (표지는 extra 클래스로 크기만 조정)
export function teacherFigure(img = {}, slot = '', extra = '') {
  const { caption = '강사 사진', src = '', scale, x = 0, y = 0 } = img;
  return `<div class="profile-backdrop${extra ? ` ${extra}-backdrop` : ''}"></div>
    <figure class="profile-figure${extra ? ` ${extra}` : ''}${src ? ' has-img' : ' shape'}" data-img="${slot}" data-caption="강사 사진"${scaleStyle(scale, x, y)}>${src
      ? `<img src="${esc(src)}" alt="${esc(caption)}">`
      : `<div class="photo-placeholder">${PHOTO_ICON}<span>${plain(caption)}<br>(상반신)</span></div>`}</figure>`;
}

