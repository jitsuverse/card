// 아이콘 (100x100 좌표계)
// - 2D: 플랫(ICONS_2D) — 옅은 회색 몸체 + 메인 컬러 + 진한 메인 컬러 면을 겹쳐 그림. 선 없음, 모서리 둥글게

// 둥근 모서리 사각형
const rrect = (x, y, w, h, r) =>
  `M${x + r} ${y}h${w - 2 * r}q${r} 0 ${r} ${r}v${h - 2 * r}q0 ${r} ${-r} ${r}h${-(w - 2 * r)}q${-r} 0 ${-r} ${-r}v${-(h - 2 * r)}q0 ${-r} ${r} ${-r}Z`;

const circle = (cx, cy, r) =>
  `M${cx - r} ${cy} a${r} ${r} 0 1 0 ${r * 2} 0 a${r} ${r} 0 1 0 ${-r * 2} 0Z`;

export const ICONS = {
  bulb: 'M50 6C28 6 14 22 14 40c0 14 8 22 16 30v8h40v-8c8-8 16-16 16-30C86 22 72 6 50 6Z M34 84h32v6q0 4-4 4H38q-4 0-4-4Z',
  chart: 'M10 60h18v32H10Z M40 36h18v56H40Z M70 10h18v82H70Z',
  check: `${circle(50, 50, 44)} M26 50l8-8 10 10 22-22 8 8-30 30Z`,
  heart: 'M50 88C20 66 6 50 6 32 6 18 17 8 30 8c10 0 16 6 20 14 4-8 10-14 20-14 13 0 24 10 24 24 0 18-14 34-44 56Z',
  star: 'M50 6l12 30 32 2-25 20 9 32-28-18-28 18 9-32L6 38l32-2Z',
  chat: 'M14 12h72q8 0 8 8v40q0 8-8 8H44L24 86V68H14q-8 0-8-8V20q0-8 8-8Z',
  target: `${circle(50, 50, 44)} ${circle(50, 50, 30)} ${circle(50, 50, 16)}`,
  doc: 'M20 6h44l20 20v68H20Z M32 40h40v6H32Z M32 54h40v6H32Z M32 68h28v6H32Z',
};

// 2D 플랫: [톤, 패스, 옵션] — 면 위주, 선 없음, 모서리는 모두 둥글게
// 톤: gray(옅은 회색 몸체) · grayDark(회색 그늘) · main(메인 컬러) · deep(진한 메인) · white · ink(메인 조각 위의 흰 조각)
// 옵션: { t: transform, round: 다각형 모서리를 둥글게 만드는 같은 색 테두리 두께, line: 채우지 않고 끝이 둥근 선으로만 그릴 두께 }
export const ICONS_2D = {
  bulb: [
    ['gray', circle(50, 38, 27)],
    ['gray', rrect(37, 48, 26, 18, 5)],
    ['grayDark', 'M50 11a27 27 0 0 1 0 54Z'],
    ['white', rrect(47, 27, 6, 25, 3)],
    ['deep', rrect(35, 66, 30, 9, 4.5)],
    ['main', rrect(40, 79, 20, 8, 4)],
  ],
  chart: [
    ['gray', rrect(12, 12, 76, 76, 14)],
    ['main', rrect(24, 52, 12, 26, 4)],
    ['deep', rrect(44, 36, 12, 42, 4)],
    ['main', rrect(64, 24, 12, 54, 4)],
    ['grayDark', rrect(20, 76, 60, 5, 2.5)],
  ],
  check: [ // 달력 + 체크
    ['gray', rrect(14, 20, 72, 68, 12)],
    ['main', rrect(14, 20, 72, 22, 12)],
    ['gray', 'M14 36h72v6H14Z'],
    ['deep', `${rrect(28, 11, 7, 16, 3.5)} ${rrect(65, 11, 7, 16, 3.5)}`],
    ['deep', 'M32 61l7-7 8 8 15-15 7 7-22 22Z', { round: 6 }],
  ],
  heart: [
    ['gray', rrect(12, 12, 76, 76, 20)],
    ['main', ICONS.heart, { t: 'translate(19 21) scale(0.62)', round: 8 }],
    ['ink', circle(36, 38, 4.5)],
  ],
  star: [ // 리본 배지
    ['gray', 'M37 58L28 90l10-6 6 10 7-34Z', { round: 6 }],
    ['grayDark', 'M63 58l9 32-10-6-6 10-7-34Z', { round: 6 }],
    ['main', circle(50, 40, 28)],
    ['deep', circle(50, 40, 18)],
    ['white', ICONS.star, { t: 'translate(39.5 29.5) scale(0.21)', round: 14 }],
  ],
  chat: [
    ['gray', 'M10 16h54v36H34L22 63V52H10Z', { round: 12 }],
    ['main', 'M38 42h52v34H80v11L67 76H38Z', { round: 12 }],
    ['ink', `${rrect(47, 52, 34, 5, 2.5)} ${rrect(47, 63, 22, 5, 2.5)}`],
  ],
  target: [
    ['gray', circle(50, 50, 42)],
    ['ink', circle(50, 50, 30)],
    ['main', circle(50, 50, 20)],
    ['deep', circle(50, 50, 9)],
  ],
  doc: [
    ['gray', 'M24 10h38l16 16v64H24Z', { round: 12 }],
    ['grayDark', 'M62 10l16 16H64q-2 0-2-2Z', { round: 6 }],
    ['main', rrect(33, 36, 26, 6, 3)],
    ['grayDark', `${rrect(33, 49, 36, 5, 2.5)} ${rrect(33, 59, 36, 5, 2.5)} ${rrect(33, 69, 24, 5, 2.5)}`],
  ],
  book: [ // 펼친 책 + 책갈피
    ['gray', 'M10 24q20-8 40 4v58q-20-10-40-4Z', { round: 6 }],
    ['grayDark', 'M50 28q20-12 40-4v58q-20-6-40 4Z', { round: 6 }],
    ['deep', rrect(47, 26, 6, 62, 3)],
    ['main', 'M68 18h11v28l-5.5-5-5.5 5Z', { round: 4 }],
  ],
  clock: [
    ['gray', circle(50, 50, 42)],
    ['ink', circle(50, 50, 31)],
    ['grayDark', `${rrect(48, 22, 4, 7, 2)} ${rrect(48, 71, 4, 7, 2)} ${rrect(22, 48, 7, 4, 2)} ${rrect(71, 48, 7, 4, 2)}`],
    ['deep', rrect(47, 29, 6, 24, 3)],
    ['main', rrect(47, 47, 22, 6, 3)],
    ['deep', circle(50, 50, 5)],
  ],
  people: [ // 사람들
    ['gray', `${circle(25, 36, 10)} M9 74q0-20 16-20t16 20Z`, { round: 4 }],
    ['gray', `${circle(75, 36, 10)} M59 74q0-20 16-20t16 20Z`, { round: 4 }],
    ['main', `${circle(50, 38, 13)} M27 86q0-28 23-28t23 28Z`, { round: 4 }],
  ],
  cap: [ // 학사모
    ['gray', 'M28 48v18q22 14 44 0V48L50 58Z', { round: 6 }],
    ['main', 'M50 18L92 38L50 58L8 38Z', { round: 6 }],
    ['deep', `${rrect(78, 38, 4, 24, 2)} ${circle(80, 64, 5)}`],
  ],
  rocket: [
    ['main', 'M32 52L18 72h16Z M68 52l14 20H66Z', { round: 6 }],
    ['gray', 'M50 8q20 18 18 54H32Q30 26 50 8Z', { round: 6 }],
    ['ink', circle(50, 36, 9)],
    ['main', circle(50, 36, 5)],
    ['deep', rrect(40, 62, 20, 8, 4)],
    ['main', 'M43 74h14l-7 16Z', { round: 6 }],
  ],
  megaphone: [ // 확성기 (모집·공지)
    ['grayDark', 'M30 58l6 24h10l-4-22Z', { round: 6 }],
    ['main', rrect(12, 38, 16, 24, 6)],
    ['gray', 'M26 40L70 18v64L26 60Z', { round: 8 }],
    ['deep', rrect(68, 14, 10, 72, 5)],
  ],
  // 2026-10-19 사용자 '표지 아이콘 다양화' — 학원 콘텐츠에 자주 맞는 9개 더함(같은 아이콘이 덱마다 반복되던 것)
  pencil: [ // 연필 (글쓰기·필기·서술형)
    ['gray', rrect(37, 22, 26, 50, 5), { t: 'rotate(40 50 50)' }],
    ['main', rrect(37, 6, 26, 18, 8), { t: 'rotate(40 50 50)' }],
    ['deep', rrect(37, 21, 26, 7, 2), { t: 'rotate(40 50 50)' }],
    ['grayDark', 'M37 72h26L50 93Z', { t: 'rotate(40 50 50)', round: 4 }],
    ['deep', 'M45 85h10L50 93Z', { t: 'rotate(40 50 50)', round: 2 }],
  ],
  trophy: [ // 트로피 (성적 우수·수상·합격)
    ['gray', `${rrect(14, 18, 22, 24, 11)} ${rrect(64, 18, 22, 24, 11)}`],
    ['main', 'M28 12h44v24q0 24-22 24T28 36Z', { round: 6 }],
    ['ink', ICONS.star, { t: 'translate(40.5 21) scale(0.19)', round: 12 }],
    ['deep', rrect(44, 58, 12, 14, 3)],
    ['gray', rrect(32, 70, 36, 9, 4.5)],
    ['grayDark', rrect(26, 80, 48, 10, 5)],
  ],
  search: [ // 돋보기 + 막대 (분석·진단)
    ['deep', 'M64 70l6-6 20 20q3 3 0 6t-6 0Z', { round: 6 }],
    ['main', circle(42, 42, 32)],
    ['ink', circle(42, 42, 23)],
    ['main', rrect(30, 44, 6, 12, 3)],
    ['deep', rrect(39, 36, 6, 20, 3)],
    ['main', rrect(48, 30, 6, 26, 3)],
  ],
  flask: [ // 실험 플라스크 (과학·탐구)
    ['gray', 'M40 14h20v24l22 38q4 10-6 12H24q-10-2-6-12l22-38Z', { round: 6 }],
    ['main', 'M31 60h38l11 18q2 6-4 7H24q-6-1-4-7Z', { round: 4 }],
    ['ink', `${circle(44, 72, 4)} ${circle(57, 67, 3)}`],
    ['deep', rrect(35, 8, 30, 9, 4.5)],
  ],
  globe: [ // 지구본 (영어·외국어·해외) — 2026-10-19 다시 그림: 메인 구 + 끝 둥근 받침 고리 + 둥근 받침대(대륙 덩어리 ✗, 각진 선 ✗)
    ['grayDark', 'M54 9.5A37 37 0 0 1 54 82.5', { line: 7 }],
    ['main', circle(46, 46, 30)],
    // 구 안 경위선은 뺌(2026-10-19 사용자 — 미니멀하게): 메인 구 + 받침 고리 + 받침대만
    ['deep', rrect(43, 81, 10, 9, 4)],
    ['gray', rrect(28, 89, 40, 8, 4)],
  ],
  calc: [ // 계산기 (수학·연산)
    ['gray', rrect(20, 8, 60, 84, 14)],
    ['ink', rrect(29, 17, 42, 20, 6)],
    ['main', rrect(46, 24, 18, 6, 3)],
    ['grayDark', `${rrect(29, 45, 11, 10, 4)} ${rrect(44.5, 45, 11, 10, 4)} ${rrect(60, 45, 11, 10, 4)} ${rrect(29, 60, 11, 10, 4)} ${rrect(44.5, 60, 11, 10, 4)} ${rrect(29, 75, 11, 10, 4)} ${rrect(44.5, 75, 11, 10, 4)}`],
    ['main', rrect(60, 60, 11, 25, 4)],
  ],
  gift: [ // 선물 상자 (이벤트·무료 체험·혜택)
    ['gray', rrect(16, 46, 68, 44, 8)],
    ['main', 'M50 34q-24-24-30-10t30 10Z M50 34q24-24 30-10t-30 10Z', { round: 4 }],
    ['main', rrect(10, 32, 80, 16, 7)],
    ['deep', `${rrect(44, 32, 12, 16, 3)} ${rrect(45, 48, 10, 42, 3)}`],
  ],
  compass: [ // 나침반 (진로·방향·로드맵)
    ['gray', circle(50, 50, 42)],
    ['ink', circle(50, 50, 31)],
    ['grayDark', `${rrect(48, 21, 4, 6, 2)} ${rrect(48, 73, 4, 6, 2)} ${rrect(21, 48, 6, 4, 2)} ${rrect(73, 48, 6, 4, 2)}`],
    ['main', 'M50 26l9 24H41Z', { round: 4 }],
    ['deep', 'M50 74l-9-24h18Z', { round: 4 }],
    ['gray', circle(50, 50, 5)],
  ],
  house: [ // 집 (학부모·가정 학습·우리 학원)
    ['gray', rrect(20, 44, 60, 46, 6)],
    ['main', 'M50 12L88 44q2 4-2 4H14q-4 0-2-4Z', { round: 6 }],
    ['deep', rrect(42, 62, 16, 28, 5)],
    ['ink', rrect(27, 55, 11, 11, 3)],
    ['ink', rrect(62, 55, 11, 11, 3)],
  ],
};
export const ICON_NAMES = Object.keys(ICONS_2D);

function shade(hex, amt) {
  const n = parseInt(hex.slice(1), 16);
  const mix = (c) => Math.round(amt < 0 ? c * (1 + amt) : c + (255 - c) * amt);
  const r = mix(n >> 16), g = mix((n >> 8) & 255), b = mix(n & 255);
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
}

// 아이콘은 2D 플랫 한 가지만 쓴다
// 아이콘 회색 몸체는 놓이는 바탕에 따라 고른다(2026-10-16 사용자): 밝은 바탕(흰색·옅은 회색·파스텔)에서는 옅은 회색이 묻혀서 한 단계 짙은 회색,
// 어둡거나 색이 진한 바탕(다크·메인 컬러 표지)에서는 흰색 몸체. bg를 안 주면 예전 색.
const lum = (hex) => { const n = parseInt(String(hex).replace('#', '').slice(0, 6), 16); return Number.isFinite(n) ? (0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255 : 1; };
function grayTones(bg, onMain) {
  // 메인 컬러 표지(bg = 메인 컬러): 몸체는 메인에 흰색을 섞은 불투명 색 — 반투명이면 겹친 조각이 비쳐서(2026-10-17 사용자)
  if (onMain) return { gray: shade(bg, 0.32), grayDark: shade(bg, 0.18) };
  if (!bg) return { gray: '#E8EAED', grayDark: '#D3D6DB' };
  const l = lum(bg);
  if (l > 0.82) return { gray: '#D6DAE0', grayDark: '#BCC2CB' }; // 밝은 바탕: 짙은 회색
  return { gray: '#FFFFFF', grayDark: '#E3E6EB' }; // 어둡거나 진한 바탕: 흰색
}
// onMain이면 bg에 메인 컬러(아이콘이 놓인 바탕)를 넘긴다.
export function renderIcon(name, color, bg, onMain = false) {
  const tones = { ...grayTones(bg, onMain), main: color, deep: onMain ? shade(bg, -0.3) : shade(color, -0.4), white: '#FFFFFF', ink: onMain ? bg : '#FFFFFF' }; // ink = 메인 조각 위에 놓인 흰 조각 — 메인 표지는 메인 조각이 흰색이라 메인 컬러로(2026-10-17) // 메인 표지의 진한 조각 = 메인을 어둡게(흰 강조색을 어둡게 하면 엉뚱한 회색)
  const parts = (ICONS_2D[name] ?? ICONS_2D.star).map(([tone, pd, o = {}]) => {
    const c = tones[tone];
    if (o.line) return `<path d="${pd}" fill="none" stroke="${c}" stroke-width="${o.line}" stroke-linecap="round" stroke-linejoin="round"${o.t ? ` transform="${o.t}"` : ''}/>`; // 선 그리기(끝 둥글게) — 2026-10-19 지구본 곡선
    const round = o.round ? ` stroke="${c}" stroke-width="${o.round}" stroke-linejoin="round"` : '';
    return `<path d="${pd}" fill="${c}"${round}${o.t ? ` transform="${o.t}"` : ''}/>`;
  }).join('');
  return `<svg viewBox="0 0 100 100" class="icon">${parts}</svg>`;
}
