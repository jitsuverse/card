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

// 학원 메인 컬러 적용 (2026-10-16 사용자 확정): 원장님이 학원 설정에 정해 둔 메인 컬러를 카드 메인 컬러로 쓴다.
// 어떤 스타일을 골라도 메인만 학원 색으로 바뀐다. 너무 밝은 색(흰 도형 위에서 안 보임)이거나 형식이 틀리면 스타일의 메인을 그대로 둔다.
// 홈페이지 lib/cardkit/options.js initialKitOptions(brandColor)와 같은 규칙.
export function withBrandColor(opts, brand) {
  if (!/^#[0-9a-f]{6}$/i.test(String(brand)) || luminance(brand) > 0.8) return opts;
  return { ...opts, colors: { ...opts.colors, main: brand } };
}

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
    '--figure-weight': strongWeightFor(titleFont), // 도식 영역의 큰 숫자·이름 등 제목 폰트 글자: 세미볼드(600, 없으면 700) — 카드 제목만 볼드
    '--body-head-weight': strongWeightFor(findFont(opts.fontBody)), // 본문 크기 소제목(## ) 굵기
    '--body-weight': TYPOGRAPHY.bodyWeight,
    '--main': c.main,
    '--on-main': contrastText(c.main),
    '--bg': c.bg,
    // 어두운 배경: 메인 컬러를 오른쪽 위에서 은은하게 번지게 한 조명 하나. 밝은 배경은 없음
    '--bg-glow': isDark(c)
      ? 'radial-gradient(95% 65% at 100% 0%, color-mix(in srgb, var(--main) 40%, transparent), transparent 100%)' // 2026-10-16 사용자: 더 잘 보이게 (24% → 40%, 범위 조금 넓게)
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
    '--panel-fill': isDark(c) ? SHAPE_TOKENS.darkFill : PANEL_TOKENS.fill, // 판(카드형·테두리형·상단 강조 머리): 어두운 배경이면 유리 도형 색 — 흰 판에 흰 제목이 안 보이던 것(2026-10-19)
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
// img.pos: 보이는 위치 [x%, y%] (사진을 끌어서 정함) · img.fit === 'contain': 원본 비율(잘리지 않게), 없거나 'cover': 칸에 맞춰 채움(기본)
// img.fixed: fit을 정했으면 data-fit으로 남긴다
export function photoFrame(img = {}, cls = '', withCaption = false, slot = '') {
  const { caption = '사진', src = '' } = img;
  const inner = src
    ? `<img src="${esc(src)}" alt="${esc(caption)}"${/^https:\/\/images\.unsplash\.com\//.test(src) ? ' crossorigin="anonymous"' : ''}>` // Unsplash는 CORS 허용 — PNG 내보내기 때 캔버스에 그려도 막히지 않게
    : `<div class="photo-placeholder">${PHOTO_ICON}<span>${plain(caption)}</span></div>`;
  const chip = withCaption && caption && src ? `<span class="photo-caption">${plain(caption)}</span>` : '';
  return `<figure class="shape photo ${cls}${src ? ' has-img' : ''}${src && img.fit === 'contain' ? ' fit-contain' : ''}"${slot ? ` data-img="${slot}"` : ''}${img.fixed && img.fit ? ` data-fit="${img.fit}"` : ''}${scaleStyle(img.scale, 0, 0, img.pos)}>${inner}${chip}</figure>`;
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


// ---------- 한 덱 안에서 같은 주 도식 반복 막기 (2026-10-19 사용자 — dev 서버에서 2·4번, 3·7번이 같은 도식) ----------
// 홈페이지는 카드를 동시에 만들어서 각 카드가 다른 카드의 도식을 모른다 → 다 만든 뒤 겹친 뒤쪽 카드만 다시 만든다(A안).
// DOM 없이(서버 Node에서도) 쓰도록 태그만 훑는다. 주 도식 = .k-body 바로 아래 첫 부품(보조 부품은 건너뜀)의 k- 클래스.
const MAIN_SKIP = new Set(['k-hero', 'k-row', 'k-label', 'k-nophoto-only', 'k-pill', 'k-arrow', 'k-down', 'k-foot', 'k-legend', 'k-key']); // 보조 부품
const NOT_PART = new Set(['k-panel', 'k-h', 'k-p', 'k-big', 'k-tag', 'k-tip', 'k-anchor', 'k-mark', 'k-hl', 'k-rows', 'k-name', 'k-who', 'k-time', 'k-slot']); // 부품 이름이 아닌 공통 클래스
const VOID = new Set(['br', 'img', 'input', 'hr', 'meta', 'link', 'source', 'wbr', 'col', 'area', 'path', 'circle', 'rect', 'polyline', 'line']);
const kClasses = (attrs) => (/class="([^"]*)"/.exec(attrs)?.[1] ?? '').split(/\s+/).filter((c) => c.startsWith('k-'));
export function kitMainPart(cardHtml) {
  const html = String(cardHtml ?? '');
  const start = html.search(/<div[^>]*class="[^"]*\bk-body\b[^"]*"[^>]*>/);
  if (start < 0) return null; // 표지 등
  const own = kClasses(html.slice(start, html.indexOf('>', start))).find((c) => c !== 'k-body' && !NOT_PART.has(c));
  if (own) return own; // 강사 카드처럼 .k-body 자체에 붙은 부품(k-profile)
  const re = /<(\/?)([a-zA-Z][\w-]*)([^>]*?)(\/?)>/g;
  re.lastIndex = html.indexOf('>', start) + 1;
  let depth = 0, inMain = false, mainDepth = 0, m;
  while ((m = re.exec(html))) {
    const [, close, tag, attrs, self] = m;
    const name = tag.toLowerCase();
    if (close) { if (depth === 0) break; depth--; if (inMain && depth < mainDepth) return null; continue; }
    const isVoid = self || VOID.has(name);
    const cls = kClasses(attrs);
    if (!inMain && depth === 0) {
      const helperOnly = cls.some((c) => MAIN_SKIP.has(c)) && cls.every((c) => MAIN_SKIP.has(c) || NOT_PART.has(c)); // k-row k-dday처럼 부품 이름이 같이 있으면 보조가 아니다
      if (helperOnly) { if (!isVoid) { depth++; skipTo(depth); } continue; }
      inMain = true; mainDepth = 1;
    }
    if (inMain) { const part = cls.find((c) => !NOT_PART.has(c) && !MAIN_SKIP.has(c)); if (part) return part; }
    if (!isVoid) depth++;
  }
  return null;
  function skipTo(d) { // 보조 부품의 안쪽은 통째로 건너뛴다
    let n;
    while ((n = re.exec(html))) {
      if (n[1]) { depth--; if (depth < d) return; } else if (!(n[4] || VOID.has(n[2].toLowerCase()))) depth++;
    }
  }
}
/** 덱 카드 HTML 배열 → 앞 카드와 주 도식이 같은 뒤쪽 카드들 [{ index, part, avoid }] — avoid = 그 카드를 다시 만들 때 쓰지 말 도식(덱에서 이미 쓴 것) */
export function kitRepeatedCards(htmls) {
  const parts = htmls.map(kitMainPart), seen = new Set(), out = [];
  parts.forEach((p, i) => { if (!p) return; if (seen.has(p)) out.push({ index: i }); seen.add(p); });
  const used = [...new Set(parts.filter(Boolean))];
  return out.map(({ index }) => ({ index, part: parts[index], avoid: used }));
}
/** 다시 만들 카드 요청 끝에 붙이는 문구 */
export const kitAvoidNote = (avoid) => `[이미 쓴 도식 — 이 카드에서는 쓰지 않는다] ${avoid.join(', ')}\n같은 덱의 다른 카드와 다른 부품으로 이 카드의 주 도식을 고른다.`;
/** 넘친 카드를 다시 만들 때 요청 끝에 붙이는 문구(fit.js measureKitOverflow의 px) */
export const kitOverflowNote = (px) => `[넘침 — 다시 만들기] 지난번 이 카드는 도식이 콘텐츠 영역보다 ${px}px 길어 화면 밖으로 나갔다. 같은 내용을 더 짧게: 항목 수를 줄이거나(예: 6개 → 4개), 설명을 한 줄로 줄이거나, 세로로 덜 긴 부품을 고른다. 제목·부연설명은 그대로.`;
