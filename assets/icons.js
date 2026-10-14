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
// 톤: gray(옅은 회색 몸체) · grayDark(회색 그늘) · main(메인 컬러) · deep(진한 메인) · white
// 옵션: { t: transform, round: 다각형 모서리를 둥글게 만드는 같은 색 테두리 두께 }
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
    ['white', circle(36, 38, 4.5)],
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
    ['white', `${rrect(47, 52, 34, 5, 2.5)} ${rrect(47, 63, 22, 5, 2.5)}`],
  ],
  target: [
    ['gray', circle(50, 50, 42)],
    ['white', circle(50, 50, 30)],
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
    ['white', circle(50, 50, 31)],
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
    ['white', circle(50, 36, 9)],
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
};
export const ICON_NAMES = Object.keys(ICONS_2D);

function shade(hex, amt) {
  const n = parseInt(hex.slice(1), 16);
  const mix = (c) => Math.round(amt < 0 ? c * (1 + amt) : c + (255 - c) * amt);
  const r = mix(n >> 16), g = mix((n >> 8) & 255), b = mix(n & 255);
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
}

// 아이콘은 2D 플랫 한 가지만 쓴다
export function renderIcon(name, color) {
  const tones = { gray: '#E8EAED', grayDark: '#D3D6DB', main: color, deep: shade(color, -0.4), white: '#FFFFFF' };
  const parts = (ICONS_2D[name] ?? ICONS_2D.star).map(([tone, pd, o = {}]) => {
    const c = tones[tone];
    const round = o.round ? ` stroke="${c}" stroke-width="${o.round}" stroke-linejoin="round"` : '';
    return `<path d="${pd}" fill="${c}"${round}${o.t ? ` transform="${o.t}"` : ''}/>`;
  }).join('');
  return `<svg viewBox="0 0 100 100" class="icon">${parts}</svg>`;
}
