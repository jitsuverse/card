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
    placeFaintPhoto(card);
  }
}

// ---------- 사진 스타일: 배경 사진은 덱마다 한 장만 (2026-10-15 사용자, 2026-10-19 B안) ----------
// 표지는 항상 전체 사진. 본문 카드는 data-bgimg가 있는 카드 중 **덱에서 첫 번째 한 장만** 켠다(2026-10-19 사용자 — 그라데이션 배경은 카드뉴스당 한 번).
// 그 카드의 도식 아래 남는 자리가 minRoom 이상이면 도식을 위로 올리고 도식 아래 끝(overlap만큼 위)부터 사진,
// 모자라면(B안) 도식 위치는 그대로 두고 도식 영역의 세로 가운데부터 사진을 깔아 아래로 갈수록 보이게(.photo-faint).
// 옅은 배경 사진(.photo-faint)의 위 끝 = 도식 영역 세로 가운데. fitAir·fitLift가 도식 간격·위치를 바꾼 뒤에도 다시 맞춘다
function placeFaintPhoto(card) {
  const ph = card.matches('.photo-faint') && card.querySelector(':scope > .card-photo.on');
  const body = card.querySelector(':scope > .k-body');
  if (!ph || !body) return;
  const kids = [...body.children].filter((el) => el.offsetParent);
  if (!kids.length) return;
  const k = card.getBoundingClientRect().height / card.offsetHeight || 1, top0 = card.getBoundingClientRect().top;
  const t = (kids[0].getBoundingClientRect().top - top0) / k, b = (kids.at(-1).getBoundingClientRect().bottom - top0) / k;
  ph.style.top = `${Math.round((t + b) / 2)}px`;
}
export const PHOTO = { minRoom: 440, overlap: 90, rise: 0.25 }; // rise: 사진 카드에서 도식 위 여백 = 남는 자리 × 0.25
export function fitPhoto(root = document, P = CARD_PARTS) {
  let used = false; // 본문 카드 배경 사진은 덱마다 한 장
  for (const card of root.querySelectorAll(P.card)) {
    const ph = card.querySelector(':scope > .card-photo');
    card.classList.remove('with-photo', 'photo-faint');
    if (!ph) continue;
    ph.classList.remove('on');
    ph.style.removeProperty('top');
    if (card.matches('.layout-cover')) { card.classList.add('with-photo'); ph.classList.add('on'); continue; }
    if (used) continue;
    const body = card.querySelector(':scope > .k-body');
    const kids = body ? [...body.children].filter((el) => el.offsetParent) : [];
    if (!kids.length || body.matches('.k-profile')) continue;
    card.style.removeProperty('--air');
    body.style.removeProperty('padding-top');
    const free = body.clientHeight - contentHeight(body); // 가운데일 때 남는 자리
    card.classList.add('with-photo');
    // 도식은 위로 '적당히만' — 남는 자리의 PHOTO.rise 비율만큼 위 여백을 남긴다(맨 위에 붙이면 부연설명과 너무 가깝다, 사용자 2026-10-16)
    body.style.paddingTop = `${Math.round(Math.max(0, free) * PHOTO.rise)}px`;
    const k = card.getBoundingClientRect().height / card.offsetHeight || 1;
    const top0 = card.getBoundingClientRect().top;
    const bottom = (kids.at(-1).getBoundingClientRect().bottom - top0) / k;
    used = true;
    if (card.offsetHeight - bottom < PHOTO.minRoom) {
      // B안(2026-10-19 사용자): 자리가 모자라면 도식은 제자리, 사진은 도식 영역 가운데부터
      card.classList.remove('with-photo'); body.style.removeProperty('padding-top');
      card.classList.add('photo-faint'); ph.classList.add('on');
      placeFaintPhoto(card);
      continue;
    }
    ph.classList.add('on');
    ph.style.top = `${Math.round(bottom - PHOTO.overlap)}px`;
  }
}

// ---------- 사진 묶음 배치: 학습자료가 있으면 원본 비율 그대로 (2026-10-15 · 10-16 사용자 확정) ----------
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
    set.style.removeProperty('height'); set.removeAttribute('data-layout');
    figs.forEach((f) => ['left', 'top', 'width', 'height'].forEach((p) => f.style.removeProperty(p))); // 크기·보이는 위치(--img-*)는 남긴다
    // 학습자료(.fit-contain — 교재·시험지)가 하나라도 있으면 원본 비율 그대로 줄 배치, 일반 사진만이면 칸을 고르게 나눈 격자에 채운다(kit.css n-1~n-4)
    if (!figs.some((f) => f.matches('.fit-contain'))) continue;
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

// ---------- 사진 강조(.k-photo-hero)의 '원본 비율' 사진: 틀 = 사진 (2026-10-16 사용자) ----------
// 원본 비율(.fit-contain)이면 흰 틀 안에 사진을 맞춰 넣지 않고, 틀 자체를 사진 비율로 영역(가로 전체 × 410) 안에서 가장 크게 잡는다.
// 줄이기(--img-scale < 1)는 틀째 — 채우기·원본 비율 모두 사진이 틀과 함께 작아진다(빈 틀이 남지 않게). 채우기에서 키우기는 칸 안 확대. 사진을 불러온 뒤 다시 부른다(main.js).
export const HERO_MAX_H = 560; // 원본 비율 사진 강조를 키울 때 세로 한도(카드 넘침 방지)
export function fitContainPhotos(root = document) {
  for (const f of root.querySelectorAll('.k-photo-hero > .photo')) {
    ['width', 'height', 'min-height', 'align-self'].forEach((p) => f.style.removeProperty(p));
    f.classList.remove('shrunk');
    const img = f.querySelector('img');
    if (!img?.naturalWidth) continue;
    const W = f.clientWidth, H = f.clientHeight, r = img.naturalWidth / img.naturalHeight;
    const scale = parseFloat(getComputedStyle(f).getPropertyValue('--img-scale')) || 1;
    const contain = f.matches('.fit-contain');
    if (!contain && scale >= 1) continue; // 채우기 + 100% 이상: 틀은 그대로, 칸 안에서 사진만 확대(card.css)
    let w = W, h = contain ? W / r : H; // 채우기는 틀 비율 그대로, 원본 비율은 사진 비율
    if (contain && h > H) { h = H; w = H * r; }
    // 줄이면 틀째 작아진다. 원본 비율은 키우기도 틀째 — 가로는 영역 폭, 세로는 HERO_MAX_H까지
    const s = contain ? Math.min(scale, W / w, HERO_MAX_H / h) : Math.min(1, scale);
    if (!contain) f.classList.add('shrunk');
    Object.assign(f.style, { width: `${Math.round(w * s)}px`, height: `${Math.round(h * s)}px`, minHeight: '0', alignSelf: 'center' });
  }
}

// ---------- 시각 보정은 남는 자리만큼만 (2026-10-16) ----------
// 도식을 --optical-lift(24px)만큼 위로 올리는데, 콘텐츠가 영역을 꽉 채운 카드에서 그대로 올리면 부연설명과 도식 사이가 최소 여백(88px)보다 좁아진다.
// 위아래 남는 자리(free/2)보다 많이 올리지 않는다.
export const LIFT = 24;
export function fitLift(root = document, P = CARD_PARTS) {
  for (const card of root.querySelectorAll(P.card)) {
    card.style.removeProperty('--optical-lift');
    const body = card.querySelector(':scope > .k-body');
    if (!body || body.matches('.k-profile')) continue;
    const free = body.clientHeight - contentHeight(body);
    if (free / 2 < LIFT) card.style.setProperty('--optical-lift', `${Math.max(0, Math.floor(free / 2))}px`);
    placeFaintPhoto(card);
  }
}

// ---------- 넘침 재기 (2026-10-19 사용자 — dev 서버에서 AI가 만든 노선도 카드가 115px 넘쳐 부연설명을 덮음) ----------
// 홈페이지는 AI가 만든 카드를 검사 없이 보여 준다 → 결과 화면에 그린 뒤(fit 보정까지 끝난 다음) 이 함수로 재서,
// 넘친 카드만 '이 부분만 다시'처럼 다시 만든다(render.js kitOverflowNote). kit-check의 넘침 검사와 같은 기준.
export const OVERFLOW_TOLERANCE = 2; // px — 이보다 작으면 넘침으로 안 본다
/** 카드 하나의 넘침(카드 1080px 기준 px). { body: 도식이 콘텐츠 영역보다 긴 만큼, panel: 흰 도형 밖으로 나간 글자, px: 둘 중 큰 값 } */
export function measureKitOverflow(card, P = CARD_PARTS) {
  const body = card.querySelector('.k-body');
  const scale = card.getBoundingClientRect().width / card.offsetWidth || 1; // 미리보기에서 줄여 그려도 카드 원래 크기로
  const bodyOver = body ? Math.max(0, body.scrollHeight - body.clientHeight) : 0;
  let panelOver = 0;
  card.querySelectorAll('.k-panel').forEach((pan) => {
    if (getComputedStyle(pan).overflow === 'hidden') return;
    const pr = pan.getBoundingClientRect();
    pan.querySelectorAll('*').forEach((e) => {
      if (e.closest('.k-tip, .card-photo') || ![...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())) return;
      const r = e.getBoundingClientRect();
      panelOver = Math.max(panelOver, Math.round(Math.max(r.bottom - pr.bottom, r.right - pr.right, pr.top - r.top, pr.left - r.left) / scale));
    });
  });
  const px = Math.max(bodyOver, panelOver);
  return { body: bodyOver, panel: panelOver, px: px > OVERFLOW_TOLERANCE ? px : 0 };
}
