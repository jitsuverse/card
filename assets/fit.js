// 렌더 후 글자 간격 보정 (브라우저 DOM에서 실행 — 다른 모듈을 import하지 않는다)

// ---------- 글자 간격 자동 보정 (폰트마다 글자가 줄 상자 안에서 차지하는 높이가 달라 생기는 여백 차이를 없앤다) ----------
// 줄 상자가 아니라 '실제 글자 윤곽' 사이 거리를 재서, 기준(프리텐다드에서 다듬은 간격)과 같아지도록 여백을 조정한다.
export const INK_GAPS = { titleToSub: 36, tagToTitle: 44, coverTitleToSub: 44 }; // 프리텐다드에서 다듬은 실제 글자 간격(px) — 모든 폰트가 이 거리로 보이게
let ctx2d = null;
// 요소의 첫 줄 글자 위 끝 / 마지막 줄 글자 아래 끝 (요소 위쪽 기준 px, 축소 미리보기와 무관)
function inkBox(el) {
  const cs = getComputedStyle(el);
  ctx2d ??= document.createElement('canvas').getContext('2d');
  ctx2d.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
  const lh = parseFloat(cs.lineHeight);
  const lines = el.innerText.split('\n').filter((t) => t.trim());
  const pt = parseFloat(cs.paddingTop) || 0;
  const one = (t, i) => {
    const m = ctx2d.measureText(t);
    const fa = m.fontBoundingBoxAscent, fd = m.fontBoundingBoxDescent;
    const base = pt + i * lh + (lh - (fa + fd)) / 2 + fa; // 줄 상자 안 기준선 위치 (CSS 반-행간 모델)
    return [base - m.actualBoundingBoxAscent, base + m.actualBoundingBoxDescent];
  };
  if (!lines.length) return null;
  return { top: one(lines[0], 0)[0], bottom: one(lines[lines.length - 1], lines.length - 1)[1] };
}
// a 아래 b가 올 때 실제 글자 사이 거리
function inkGap(a, b) {
  const A = inkBox(a), B = inkBox(b);
  if (!A || !B) return null;
  return (b.offsetTop + B.top) - (a.offsetTop + A.bottom);
}
// b의 위 여백을 조정해 a↔b 글자 거리를 target으로
function setGap(a, b, target, prop = 'marginTop', el = b) {
  el.style[prop] = '';
  const g = inkGap(a, b);
  if (g == null || !target) return;
  const cur = parseFloat(getComputedStyle(el)[prop]) || 0;
  el.style[prop] = `${Math.round(cur + target - g)}px`;
}
// 카드 선택자 (부품 키트 .kcard 기준)
export const CARD_PARTS = { card: '.kcard', title: '.title, .k-title', head: '.k-head', sub: '.k-sub' };
export function fitTextGaps(root = document, P = CARD_PARTS) {
  for (const card of root.querySelectorAll(P.card)) {
    const title = card.querySelector(P.title);
    if (!title) continue;
    if (card.classList.contains('layout-cover')) {
      const tag = card.querySelector('.cover-tag'), sub = card.querySelector('.sub');
      if (tag) setGap(tag, title, INK_GAPS.tagToTitle, 'marginBottom', tag);
      if (sub) setGap(title, sub, INK_GAPS.coverTitleToSub);
    } else {
      const sub = card.querySelector(`${P.head} ${P.sub}`);
      if (sub) setGap(title, sub, INK_GAPS.titleToSub);
    }
  }
}
// 위아래 나눔: 흰 제목 영역에서 '제목 글자 위 여백' = '부연설명 글자 아래 여백'이 되도록 아래 여백을 맞춘다 (위 여백·제목 위치는 그대로)
export function fitSplitHead(root = document, P = CARD_PARTS) {
  for (const card of root.querySelectorAll(`${P.card}[data-card=split]`)) {
    const head = card.querySelector(P.head), title = head?.querySelector(P.title);
    if (!title) continue;
    head.style.paddingBottom = '';
    const last = head.querySelector(P.sub) ?? title;
    const k = card.getBoundingClientRect().height / card.offsetHeight || 1; // 미리보기 축소 배율
    const H = head.getBoundingClientRect(), T = inkBox(title), L = inkBox(last);
    if (!T || !L) continue;
    const topGap = (title.getBoundingClientRect().top - H.top) / k + T.top;
    const bottomGap = (H.bottom - last.getBoundingClientRect().top) / k - L.bottom;
    const cur = parseFloat(getComputedStyle(head).paddingBottom) || 0;
    head.style.paddingBottom = `${Math.round(cur + topGap - bottomGap)}px`;
  }
}
