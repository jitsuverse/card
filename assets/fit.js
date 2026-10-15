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

// ---------- 여백 활용 (2026-10-15 사용자 확정: 공간이 남으면 촘촘히 붙이지 않는다) ----------
// 콘텐츠 영역(.k-body)에 자리가 남으면 카드에 --air(1~max)를 넣어 부품의 '세로 간격'만 넓힌다(kit.css '여백 활용').
// 간격은 --air에 비례하므로 --air 1·2에서 도식 높이를 재서, 도식이 영역의 fill만큼 차는 값을 바로 구한다.
// 촘촘한 모드(.tight·.dense)와 강사 카드(.k-profile)는 건너뛴다.
export const AIR = { fill: 0.9, max: 1.6 };
function contentHeight(body) {
  const kids = [...body.children].filter((el) => el.offsetParent);
  if (!kids.length) return 0;
  const k = body.getBoundingClientRect().height / body.offsetHeight || 1; // 미리보기 축소 배율
  return (kids.at(-1).getBoundingClientRect().bottom - kids[0].getBoundingClientRect().top) / k;
}
export function fitAir(root = document, P = CARD_PARTS) {
  for (const card of root.querySelectorAll(P.card)) {
    card.style.removeProperty('--air');
    const body = card.querySelector(':scope > .k-body');
    if (!body || (body.matches('.k-profile') && !card.matches('.no-teacher')) || card.matches('.with-photo') || body.querySelector('.tight, .dense')) continue; // 강사 사진을 뺀 카드는 일반 카드처럼
    const h1 = contentHeight(body);
    card.style.setProperty('--air', '2');
    const per = contentHeight(body) - h1; // --air 1 늘 때 늘어나는 높이
    const air = per > 0 ? Math.min(AIR.max, Math.max(1, 1 + (body.clientHeight * AIR.fill - h1) / per)) : 1;
    if (air > 1) card.style.setProperty('--air', air.toFixed(3)); else card.style.removeProperty('--air');
  }
}

// ---------- 사진 스타일: 도식이 작은 카드에만 배경 사진 (2026-10-15 사용자) ----------
// 도식을 콘텐츠 영역 위쪽에 붙여 보고(.with-photo), 그 아래 남는 자리가 minRoom 이상일 때만 사진을 켠다(.on).
// 사진은 도식 아래 끝에서 overlap만큼 위부터 깔린다 — 도식과 사진이 많이 겹치지 않게. 표지는 항상 전체 사진.
export const PHOTO = { minRoom: 440, overlap: 90 };
export function fitPhoto(root = document, P = CARD_PARTS) {
  for (const card of root.querySelectorAll(P.card)) {
    const ph = card.querySelector(':scope > .card-photo');
    card.classList.remove('with-photo');
    if (!ph) continue;
    ph.classList.remove('on');
    ph.style.removeProperty('top');
    if (card.matches('.layout-cover')) { card.classList.add('with-photo'); ph.classList.add('on'); continue; }
    const body = card.querySelector(':scope > .k-body');
    const kids = body ? [...body.children].filter((el) => el.offsetParent) : [];
    if (!kids.length || body.matches('.k-profile')) continue;
    card.style.removeProperty('--air');
    card.classList.add('with-photo');
    const k = card.getBoundingClientRect().height / card.offsetHeight || 1;
    const bottom = (kids.at(-1).getBoundingClientRect().bottom - card.getBoundingClientRect().top) / k;
    if (card.offsetHeight - bottom < PHOTO.minRoom) { card.classList.remove('with-photo'); continue; }
    ph.classList.add('on');
    ph.style.top = `${Math.round(bottom - PHOTO.overlap)}px`;
  }
}

// ---------- 사진 묶음 배치: 원본 비율 그대로 (2026-10-15 사용자 확정) ----------
// 사진을 자르지 않는다. 넣은 순서대로 사진을 줄(행)로 나누는 모든 경우를 따져, 줄마다 높이를 같게(폭은 비율만큼) 맞추고
// 묶음 영역(가로 전체 × 높이 740/600) 안에서 사진이 가장 크게 보이는 배치를 고른다. 넘치면 전체를 줄이고 가운데 정렬.
// 사진을 아직 못 불러온 자리는 4:3으로 친다 — 사진이 들어오면 다시 부른다(main.js).
const ratioOf = (fig) => { const i = fig.querySelector('img'); return i?.naturalWidth ? i.naturalWidth / i.naturalHeight : 4 / 3; };
const GAP = 20;
function bestRows(r, W, H) {
  let best = null;
  for (let mask = 0; mask < 1 << (r.length - 1); mask++) { // 사진 사이마다 '여기서 줄 바꿈' 여부
    const rows = [[0]];
    for (let i = 1; i < r.length; i++) (mask >> (i - 1)) & 1 ? rows.push([i]) : rows.at(-1).push(i);
    const hs = rows.map((row) => (W - GAP * (row.length - 1)) / row.reduce((t, i) => t + r[i], 0));
    const total = hs.reduce((a, b) => a + b, 0) + GAP * (rows.length - 1);
    const k = Math.min(1, (H - GAP * (rows.length - 1)) / (total - GAP * (rows.length - 1)));
    const area = rows.reduce((t, row, j) => t + row.reduce((u, i) => u + r[i] * (hs[j] * k) ** 2, 0), 0);
    if (!best || area > best.area + 1) best = { rows, hs: hs.map((h) => h * k), k, area };
  }
  return best;
}
export function fitPhotoSets(root = document) {
  for (const set of root.querySelectorAll('.k-photoset')) {
    const figs = [...set.children];
    set.removeAttribute('style'); set.removeAttribute('data-layout');
    figs.forEach((f) => f.removeAttribute('style'));
    const W = set.clientWidth, H = set.clientHeight, r = figs.map(ratioOf);
    const { rows, hs } = bestRows(r, W, H);
    let y = 0;
    rows.forEach((row, j) => {
      const rowW = row.reduce((t, i) => t + r[i] * hs[j], 0) + GAP * (row.length - 1);
      let x = (W - rowW) / 2;
      row.forEach((i) => {
        const w = r[i] * hs[j];
        Object.assign(figs[i].style, { left: `${Math.round(x)}px`, top: `${Math.round(y)}px`, width: `${Math.round(w)}px`, height: `${Math.round(hs[j])}px` });
        x += w + GAP;
      });
      y += hs[j] + GAP;
    });
    set.dataset.layout = 'rows';
    set.style.height = `${Math.round(y - GAP)}px`;
  }
}
