// 부품 키트: cards.html의 카드를 그대로 띄운다.
// 왼쪽 옵션은 panel/panel.js 패널·assets/render.js의 themeVars 값을 쓰고, kit.css가 그 변수를 받아 그린다.
// 표지 이미지·사진 틀·책 목업·강사 상반신·2D 아이콘·제목 간격 보정은 assets/ 엔진 코드를 쓴다.
import { DEFAULT_OPTIONS, CANVAS, BOOK_MOCKUPS, PHOTO_POOL, poolURL } from '../assets/config.js';
import { themeVars, cardBackground, bookMockup, photoFrame, teacherFigure, contrastText, withBrandColor } from '../assets/render.js';
import { renderIcon } from '../assets/icons.js';
import { phIcon } from '../assets/phosphor.js';
import { removeBackground } from '../assets/cutout.js';
import { fitTextGaps, fitSplitHead, fitAir, fitPhoto, fitPhotoSets, fitContainPhotos, fitLift } from '../assets/fit.js';
import { setupPanel } from '../panel/panel.js';

const $ = (s) => document.querySelector(s);
const deck = $('#deck');
const state = structuredClone(DEFAULT_OPTIONS);
window.kitState = state; // 검사·사진 스크립트가 패널에 없는 옵션(photo)을 바꿀 때만 쓴다
// 학원 메인 컬러 (실제 서버는 원장님 학원 설정값) — 이 웹앱은 왼쪽 메뉴 아래 '학원 설정(데모)' 또는 ?brand=%23RRGGBB 로 흉내낸다
const BRAND_KEY = 'studio.brandColor';
const getBrand = () => {
  const q = new URLSearchParams(location.search).get('brand');
  if (q) return q;
  try { return localStorage.getItem(BRAND_KEY); } catch { return null; }
};
Object.assign(state, withBrandColor(state, getBrand())); // 페이지를 열면 카드 메인 컬러 = 학원 메인 컬러
window.kitDrop = async (slots) => { // 사진 스크립트(kit-shot --drop g-book,h-teacher)용: 사진 자리 빼기
  for (const s of slots) { const f = deck.querySelector(`[data-img="${s}"]`); if (f) dropped.set(s, { card: f.closest('.kcard').id, label: '사진' }); }
  await render();
};
const photos = {}; // 사진 자리(data-slot) → { src, scale }  (이 화면에서만 유지)
const setCounts = {}; // 사진 묶음(data-set) → 지금 장수 (1~4, 처음엔 data-count)
const mockups = {};  // 책 자리(data-slot) → 교재 목업 각도 (미리보기에서 책에 마우스를 올려 고름)
const setCaps = {};   // 사진 묶음 → 자리별 캡션 (사진을 빼면 사진과 함께 당겨진다)
const SET_MAX = 4;
// 뺀 사진 자리(교재·강사·사진 강조): 자리 이름 → { card, label } — 카드는 사진 없이 그려진다(.no-book / .no-teacher / .no-photo)
const dropped = new Map();
const DROP_LABEL = { book: '교재 사진', teacher: '강사 사진', photo: '사진' };
let cardsHTML = null;
let panel = null; // 왼쪽 옵션 패널 (맨 아래에서 만든다)

// 배경 밝기가 0.5 미만이면 어두운 테마 (흰 도형 → 유리 도형)
const isDark = (hex) => {
  const n = parseInt(hex.slice(1), 16);
  return (0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255 < 0.5;
};

// ---------- 사진·아이콘 자리 채우기 ----------
// cards.html에는 자리만 둔다: <div data-photo="종류" data-slot="이름" data-caption="캡션">
//   cover   : 표지 오른쪽 아래 — '7. 표지 이미지' 옵션에 따라 아이콘(data-icon) / 강사 사진 / 교재 사진
//   book    : 책 목업 1권 ('6. 교재 목업 각도')
//   teacher : 강사 상반신 (사진을 넣으면 배경 자동 제거) — 카드 바로 아래 자식으로 둔다
//   photo   : 사진 틀 (사진이 들어가면 위에 캡션)
// <i data-icon2d="이름"> : 2D 아이콘
const mockupOf = (slot) => mockups[slot] ?? state.bookMockup ?? 'front';
const bookFigure = (slot, caption, src) => { const img = { caption, ...(src && { src }), ...photos[slot] };
  return `<figure class="book-stage${img.src ? ' has-img' : ''}" data-mockup="${mockupOf(slot)}">
  <div class="book-row book-row-1">${bookMockup(img, slot)}</div></figure>`; };

// ---------- 사진은 '사진 스타일'에서만 (2026-10-16 사용자 확정) ----------
// 다른 스타일에서는 사진 자리(data-photo="photo" · 사진 묶음 · 사진 강조의 사진)를 빼고 그린다 — 교재 목업(book)·강사 누끼(teacher)·표지 이미지는 그대로.
// 사진 묶음만 있던 카드는 카드째 빠지고, 사진 강조는 흰 도형만 남는다(.no-photo). 같은 덱이 스타일에 따라 바뀐다.
// 사진 유형 5가지(2026-10-17 사용자): ① 교재 목업 ② 강사 누끼 ③ 일반 사진 1~4장(사진 묶음)은 어느 스타일이든,
// ④ 사진 1장 + 도식(사진 강조 .k-photo-hero) ⑤ 배경 사진(data-bgimg — bgPhoto)은 사진 스타일에서만.
function stripPhotos(root) {
  root.querySelectorAll(':scope > .kcard .k-photo-hero > [data-photo="photo"]').forEach((el) => {
    el.closest('.kcard').classList.add('no-photo'); // 흰 도형만 남고 .k-nophoto-only(큰 숫자 등)가 빈자리를 채운다
    el.remove();
  });
}

// ---------- 사진 모음: 덱에는 주제만(pool:classroom), 사진은 덱마다 다르게 (2026-10-16 사용자) ----------
// 같은 덱은 열 때마다 같은 사진(표지 제목으로 시작 위치를 정함), 덱이 다르면 다른 사진, 한 덱 안에서는 겹치지 않게.
// 사진 도구 '다른 사진'은 그 자리만 같은 주제의 다음 사진으로 넘긴다(poolShift). 주소를 직접 쓴 사진은 그대로.
const poolShift = {}, poolSlots = new Map(); // 자리 → 넘긴 횟수 · 자리 → 주제(도구 막대에 '다른 사진' 버튼)
function resolvePools(root) {
  poolSlots.clear();
  const title = root.querySelector('.kcard .title, .kcard .k-title')?.textContent ?? '';
  let seed = 2166136261; // FNV-1a + 마무리 섞기 — 사진 수(6~10장)로 나눠도 덱끼리 고르게 갈리게
  for (const ch of title) seed = Math.imul(seed ^ ch.codePointAt(0), 16777619);
  seed ^= seed >>> 15; seed = Math.imul(seed, 2246822507); seed ^= seed >>> 13; seed >>>= 0;
  const used = {}, order = {};
  const pick = (ref, slot) => {
    const topic = ref.slice(5), list = PHOTO_POOL[topic];
    if (!list?.length) return '';
    const u = (used[topic] ??= new Set()), n = (order[topic] = (order[topic] ?? -1) + 1);
    let i = (seed + n * 7 + (poolShift[slot] ?? 0)) % list.length; // 7칸씩 건너 고르게 퍼지게
    for (let t = 0; t < list.length && u.has(i); t++) i = (i + 1) % list.length;
    u.add(i);
    poolSlots.set(slot, topic);
    return poolURL(list[i]);
  };
  root.querySelectorAll('[data-bgimg^="pool:"], [data-photo][data-src^="pool:"], .k-photoset[data-srcs*="pool:"]').forEach((el) => {
    if (el.dataset.bgimg?.startsWith('pool:')) el.dataset.bgimg = pick(el.dataset.bgimg, `bg-${el.id}`);
    if (el.dataset.src?.startsWith('pool:')) el.dataset.src = pick(el.dataset.src, el.dataset.slot);
    if (el.dataset.srcs) el.dataset.srcs = el.dataset.srcs.split(/\s+/).map((s, k) => (s.startsWith('pool:') ? pick(s, `${el.dataset.set}-${k}`) : s)).join(' ');
  });
}

function photoHTML(el) {
  const { photo: kind, slot, caption } = el.dataset;
  if (kind === 'book') return bookFigure(slot, caption ?? '교재 표지', el.dataset.src);
  if (kind === 'teacher') return teacherFigure({ caption: caption ?? '강사 사진', ...photos[slot] }, slot);
  if (kind === 'photo') { // data-src: 덱을 만들 때 찾은 무료 사진 주소 · data-fit: 덱에서 정한 종류(contain 학습자료 / cover 일반)
    const img = { caption: caption ?? '사진', ...(el.dataset.src && { src: el.dataset.src }), ...photos[slot] };
    const fit = photos[slot]?.fit ?? el.dataset.fit; // 기본은 칸에 맞춰 채우기 — '원본 비율로' 버튼이나 덱의 data-fit="contain"이면 원본 비율
    return photoFrame({ ...img, fit, fixed: !!fit }, '', false, slot);
  }
  if (kind === 'cover') {
    if (state.coverVisual === 'teacher') return teacherFigure({ caption: '강사 사진', ...photos['cover-teacher'] }, 'cover-teacher', 'cover-teacher');
    if (state.coverVisual === 'book') {
      return `<div class="cover-book" data-mockup="${mockupOf('cover-book')}">${bookMockup({ caption: '교재 표지', ...photos['cover-book'] }, 'cover-book')}</div>`;
    }
    const accent = state.coverBg === 'main' ? contrastText(state.colors.main) : state.colors.main; // 메인 컬러 배경이면 메인 위에서 보이는 색
    return `<div class="cover-icon">${renderIcon(el.dataset.icon, accent, state.coverBg === 'main' ? state.colors.main : state.colors.bg, state.coverBg === 'main')}</div>`; // 바탕에 맞춰 회색 몸체
  }
  return '';
}

// 사진 스타일 배경: 카드의 data-bgimg(덱을 만들 때 찾은 무료 사진 주소) — 클릭해서 바꾼 사진(photos['bg-카드id'])이 먼저.
// 사진을 못 불러오면(주소 바뀜·막힘) 사진만 빠지고 기본 배경으로 보인다.
function bgPhoto(k) {
  const slot = `bg-${k.id}`, p = photos[slot] ?? {}, src = p.src ?? k.dataset.bgimg;
  if (!src) return '';
  const vars = [p.scale && p.scale !== 100 && `--img-scale:${p.scale / 100}`, p.pos && `--img-pos:${p.pos[0]}% ${p.pos[1]}%`].filter(Boolean);
  const scale = vars.length ? ` style="${vars.join(';')}"` : '';
  return `<figure class="card-photo photo has-img${p.fit === 'contain' ? ' fit-contain' : ''}" data-img="${slot}"${scale}><img src="${src}" alt="" onerror="this.closest('.kcard').classList.remove('with-photo');this.parentNode.remove()"></figure>`;
}

function fillSlots() {
  // 사진 묶음: <div class="k-photoset" data-set="h" data-count="3" data-captions="a,b,c,d"> → 장수만큼 사진 자리
  deck.querySelectorAll('.k-photoset').forEach((el) => {
    const set = el.dataset.set;
    const caps = (setCaps[set] ??= Array.from({ length: SET_MAX }, (_, k) => (el.dataset.captions ?? '').split(',')[k] || '사진'));
    const n = (setCounts[set] ??= Math.min(SET_MAX, Math.max(1, +el.dataset.count || 1)));
    el.classList.add(`n-${n}`);
    const srcs = (el.dataset.srcs ?? '').split(/\s+/), fits = (el.dataset.fits ?? '').split(/\s+/); // data-srcs="주소1 주소2 …"(자리 순서대로) · data-fits="contain cover …"(덱에서 정한 종류, 비우면 자동 판별)
    el.innerHTML = Array.from({ length: n }, (_, k) => `<div data-photo="photo" data-slot="${set}-${k}" data-caption="${caps[k] || '사진'}"${srcs[k] ? ` data-src="${srcs[k]}"` : ''}${fits[k] ? ` data-fit="${fits[k]}"` : ''}></div>`).join('');
  });
  deck.querySelectorAll('[data-photo]').forEach((el) => {
    if (dropped.has(el.dataset.slot)) { el.closest('.kcard')?.classList.add(`no-${el.dataset.photo}`); el.remove(); return; } // 뺀 자리
    el.insertAdjacentHTML('beforebegin', photoHTML(el)); el.remove();
  });
  deck.querySelectorAll('[data-icon2d]').forEach((el) => { el.outerHTML = `<span class="k-icon">${renderIcon(el.dataset.icon2d, state.colors.main, state.colors.bg)}</span>`; });
}

// 원형 게이지 <div class="k-ring" style="--p:40;--size:340px">: 회색 원 위에 메인 컬러 호(12시부터 시계 방향)
// 둥근 사각형 도형이면 호 끝도 둥글게 — 둥근 끝(두께의 절반씩)만큼 줄여 그려 비율이 늘어나 보이지 않게
function drawRings() {
  deck.querySelectorAll('.k-ring').forEach((el) => {
    const p = parseFloat(el.style.getPropertyValue('--p')) || 0, size = parseFloat(el.style.getPropertyValue('--size')) || 300;
    const w = 34, r = (size - w) / 2, C = 2 * Math.PI * r, cap = state.shape === 'rounded' ? w : 0;
    const len = Math.max(0.1, (p / 100) * C - cap);
    el.insertAdjacentHTML('afterbegin', `<svg viewBox="0 0 ${size} ${size}"><g transform="rotate(-90 ${size / 2} ${size / 2})" stroke-width="${w}">
      <circle class="k-ring-track" cx="${size / 2}" cy="${size / 2}" r="${r}"/>
      <circle class="k-ring-arc" cx="${size / 2}" cy="${size / 2}" r="${r}" stroke-linecap="${cap ? 'round' : 'butt'}" stroke-dasharray="${len.toFixed(1)} ${C.toFixed(1)}" stroke-dashoffset="${(-cap / 2).toFixed(1)}"/>
    </g></svg>`);
  });
}

// 반원 게이지 <div class="k-gauge" style="--p:96">: 회색 반원 위에 메인 컬러 호 (왼쪽 → 오른쪽). 둥근 사각형이면 끝도 둥글게
function drawGauges() {
  deck.querySelectorAll('.k-gauge').forEach((el) => {
    const p = parseFloat(el.style.getPropertyValue('--p')) || 0;
    const W = 560, w = 40, r = (W - w) / 2, cy = 300 - 4, L = Math.PI * r, cap = state.shape === 'rounded' ? w : 0;
    const d = `M ${w / 2} ${cy} A ${r} ${r} 0 0 1 ${W - w / 2} ${cy}`;
    const len = Math.max(0.1, (p / 100) * L - cap);
    el.insertAdjacentHTML('afterbegin', `<svg viewBox="0 0 ${W} 300" stroke-width="${w}">
      <path class="k-gauge-track" d="${d}" stroke-linecap="${cap ? 'round' : 'butt'}"/>
      <path class="k-gauge-arc" d="${d}" stroke-linecap="${cap ? 'round' : 'butt'}" stroke-dasharray="${len.toFixed(1)} ${L.toFixed(1)}" stroke-dashoffset="${(-cap / 2).toFixed(1)}"/>
    </svg>`);
  });
}

// 띄울 카드 묶음: 기본은 작업 중인 cards.html, ?deck=examples/science 처럼 예시 덱도 볼 수 있다
const DECK = ((d) => (/^[\w/-]+$/.test(d ?? '') ? d : 'cards'))(new URLSearchParams(location.search).get('deck'));

// ---------- 그리기 ----------
// ---------- 결과 화면 섹션 (데브 서버 SectionBlock과 같은 겉모습) ----------
// 카드마다: 'N. 섹션 제목'(카드 제목 글자) + [카드 문구 수정][이 부분만 다시] / 왼쪽 카드 + 이미지 저장, 오른쪽 블로그 본문 칸(더미 글).
// 이 웹앱엔 글을 만드는 로직이 없어서 본문은 더미. '내용 편집하기'를 누르면 초록 테두리 편집 모드(데브 서버와 같음).
const DUMMY_TEXT = '이 칸에는 카드 내용을 풀어 쓴 블로그 본문이 들어가요. 실제 서비스에서는 AI가 카드 문구에 맞춰 학부모님이 읽기 좋은 글을 써 주고, 원장님은 편집 모드에서 문장을 다듬을 수 있어요. 지금 웹앱에서는 화면 배치를 확인하기 위한 예시 글이에요.';
const sectionTitle = (c) => (c.querySelector('.k-title, .title')?.innerText ?? '').replace(/\s*\n\s*/g, ' ').trim() || '카드';
let editMode = false;
const PEN = '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>';
const REDO = '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 0 1 15.5-6.2L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-15.5 6.2L3 16"/><path d="M3 21v-5h5"/></svg>';
const SAVE = '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M7 10l5 5 5-5"/><path d="M12 15V3"/></svg>';
const COPY = '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>';
function wrapSection(frame, card, i) {
  if (!$('.res-blog')) return; // 결과 화면 틀이 없는 페이지(옛 화면)는 그대로
  const sec = document.createElement('section');
  sec.className = 'res-sec';
  const t = sectionTitle(card).replace(/"/g, '&quot;');
  sec.innerHTML = `<div class="res-sec-head"><span class="res-num">${i + 1}.</span>
      <input class="res-sec-title" value="${t}" readonly><h3>${t}</h3>
      <span class="res-acts"><button type="button">${PEN}카드 문구 수정</button><button type="button">${REDO}이 부분만 다시</button></span></div>
    <div class="res-grid"><div class="res-card"><button type="button" class="res-save">${SAVE}이미지 저장</button></div>
      <div class="res-text"><div class="res-text-head"><b class="mode"></b><button type="button">${COPY}텍스트 복사</button></div><textarea readonly>${DUMMY_TEXT}</textarea></div></div>`;
  frame.replaceWith(sec);
  sec.querySelector('.res-card').prepend(frame);
}

async function render() {
  panel.update(); // 폰트 불러오기 + 옵션 표시 갱신
  Object.entries(themeVars(state)).forEach(([k, v]) => deck.style.setProperty(k, v));
  if (cardsHTML == null) {
    cardsHTML = await (await fetch(`${DECK}.html`, { cache: 'no-store' })).text();
    // 덱 맨 위 <!-- default-style: 사진 --> → 처음 열 때 그 추천 스타일로 (규칙: 사진은 사진 스타일에서만이라, 이미지 덱은 사진 스타일로 열린다)
    const def = /<!--\s*default-style:\s*([^>]+?)\s*-->/.exec(cardsHTML)?.[1];
    if (def && panel?.chooseByName(def)) { panel.update(); Object.entries(themeVars(state)).forEach(([k, v]) => deck.style.setProperty(k, v)); }
  }
  deck.innerHTML = cardsHTML;
  resolvePools(deck); // pool:주제 → 덱마다 다른 사진 주소
  if (!state.photo) stripPhotos(deck); // 사진 강조(④)는 사진 스타일에서만 — 교재 목업·강사 누끼·사진 묶음은 어느 스타일이든
  deck.querySelectorAll(':scope > .kcard').forEach((c, i) => {
    const f = document.createElement('div');
    f.className = 'frame';
    c.replaceWith(f);
    f.append(c);
    wrapSection(f, c, i); // 결과 화면: 카드마다 섹션(제목 · 카드 + 이미지 저장 · 블로그 본문 칸)
  });
  // 블록 쌓기: data-n개의 블록 + 값·라벨
  deck.querySelectorAll('.stack').forEach((s) => {
    s.innerHTML = `<em>${s.dataset.l}</em>` + '<i></i>'.repeat(+s.dataset.n) + `<b>${s.dataset.v}</b>`;
  });
  fillSlots();
  drawRings();
  drawGauges();
  // Phosphor 아이콘 자리: <i data-ph="check-circle"> → 같은 요소 안에 SVG
  deck.querySelectorAll('[data-ph]').forEach((el) => { el.innerHTML = phIcon(el.dataset.ph, 'k-ph'); });
  // 월간 달력: 요일 머리 + 빈칸(1일 앞) + 날짜, 행사 날은 동그라미
  deck.querySelectorAll('.k-month').forEach((m) => {
    const marks = new Set((m.dataset.marks ?? '').split(',').map(Number));
    const start = +m.dataset.start, days = +m.dataset.days, tail = (7 - ((start + days) % 7)) % 7; // 마지막 줄을 빈칸으로 채워 격자를 닫는다
    m.innerHTML = [...'일월화수목금토'].map((d) => `<b>${d}</b>`).join('')
      + '<i></i>'.repeat(start)
      + Array.from({ length: days }, (_, k) => `<p class="${marks.has(k + 1) ? 'mark' : ''}"><span>${k + 1}</span></p>`).join('')
      + '<i></i>'.repeat(tail);
  });
  // 원고지: data-text의 글자를 칸마다, 그 뒤 칸에 커서
  deck.querySelectorAll('.k-ms').forEach((m) => {
    const cols = +m.dataset.cols || 10, rows = +m.dataset.rows || 5, chars = [...(m.dataset.text ?? '')];
    m.style.setProperty('--cols', cols);
    m.innerHTML = Array.from({ length: cols * rows }, (_, k) => k < chars.length ? `<i>${chars[k] === ' ' ? '' : chars[k]}</i>` : `<i${k === chars.length ? ' class="caret"' : ''}></i>`).join('');
  });
  // 독서 도장 카드: data-total 칸 중 data-done 칸에 도장
  deck.querySelectorAll('.k-stamps').forEach((m) => {
    m.innerHTML = Array.from({ length: +m.dataset.total }, (_, k) => `<i class="${k < +m.dataset.done ? 'done' : ''}">${k < +m.dataset.done ? '완독' : k + 1}</i>`).join('');
  });
  // OMR 답안지: data-answers 순서대로 줄마다 번호 + 칸 5개(고른 칸 칠함), data-wrong 줄은 채점 빗금
  deck.querySelectorAll('.k-omr').forEach((m) => {
    const wrong = new Set((m.dataset.wrong ?? '').split(',').map(Number));
    m.innerHTML = m.dataset.answers.split(',').map((a, k) => `<p class="${wrong.has(k + 1) ? 'x' : ''}"><b>${k + 1}</b>${[1, 2, 3, 4, 5].map((c) => `<i class="${c === +a ? 'on' : ''}"></i>`).join('')}</p>`).join('');
  });
  // 타이머: data-parts="이름:분[:hl],…" → 다이얼(구간 색) + 가운데 총 시간 + 옆 범례
  deck.querySelectorAll('.k-timer').forEach((m) => {
    const parts = m.dataset.parts.split(',').map((x) => x.split(':')), total = parts.reduce((t, [, v]) => t + +v, 0);
    let a = 0, g = 0;
    const stops = parts.map(([, v, hl]) => { const c = hl ? 'var(--main)' : `var(--seg${g++})`; const s = `${c} ${a}deg ${(a += (+v / total) * 360)}deg`; return s; }).join(', ');
    g = 0;
    m.innerHTML = `<div class="k-dial"><div style="background: conic-gradient(${stops})"><strong>${total}분</strong></div></div>`
      + `<div class="k-timer-key">${parts.map(([n, v, hl]) => `<p class="${hl ? 'hl' : ''}"><i style="background:${hl ? 'var(--main)' : `var(--seg${g++})`}"></i><b>${n}</b><span>${v}분</span></p>`).join('')}</div>`;
  });
  // 모눈종이 꺾은선: data-values · data-labels · data-min · data-max → 선 + 점 + 값, 마지막 점만 메인
  deck.querySelectorAll('.k-graph').forEach((m) => {
    const v = m.dataset.values.split(',').map(Number), l = m.dataset.labels.split(','), lo = +m.dataset.min, hi = +m.dataset.max;
    const x = (k) => 10 + (80 * k) / (v.length - 1), y = (n) => 100 - ((n - lo) / (hi - lo)) * 100;
    m.innerHTML = `<div class="k-plot"><svg viewBox="0 0 100 100" preserveAspectRatio="none"><polyline points="${v.map((n, k) => `${x(k)},${y(n)}`).join(' ')}" vector-effect="non-scaling-stroke"/></svg>`
      + v.map((n, k) => `<i class="${k === v.length - 1 ? 'hl' : ''}" style="left:${x(k)}%;top:${y(n)}%"></i><span class="${k === v.length - 1 ? 'hl' : ''}" style="left:${x(k)}%;top:${y(n)}%">${n}점</span>`).join('')
      + `</div><div class="k-graph-x">${l.map((t, k) => `<span style="left:${x(k)}%">${t}</span>`).join('')}</div>`;
  });
  // 게임 레벨 맵: 칸마다 한 단계씩 높아지는 번호 동그라미 + 점선 길 (.done 지난 단계, .hl 지금 단계)
  deck.querySelectorAll('.k-levels').forEach((m) => {
    const n = m.children.length, step = 116, top = (k) => (n - 1 - k) * step + 60;
    [...m.children].forEach((p, k) => { p.style.setProperty('--y', `${(n - 1 - k) * step}px`); p.insertAdjacentHTML('afterbegin', phIcon(`number-circle-${k + 1}`, 'k-ph')); });
    m.style.setProperty('--h', `${(n - 1) * step + 120}px`);
    m.insertAdjacentHTML('afterbegin', `<svg viewBox="0 0 100 ${(n - 1) * step + 120}" preserveAspectRatio="none"><polyline vector-effect="non-scaling-stroke" points="${[...Array(n)].map((_, k) => `${((k + 0.5) / n) * 100},${top(k)}`).join(' ')}"/></svg>`);
  });
  // 와플: data-parts="30,14,4" → 칸 48개 (c0·c1·c2 순서대로)
  deck.querySelectorAll('.k-waffle').forEach((w) => {
    w.innerHTML = w.dataset.parts.split(',').map((n, k) => `<i class="c${k}"></i>`.repeat(+n)).join('');
  });
  const dark = isDark(state.colors.bg);
  deck.querySelectorAll('.kcard').forEach((k, i) => {
    k.classList.toggle('dark', dark);
    Object.assign(k.dataset, { shape: state.shape, style: state.shapeStyle });
    const photo = state.photo ? bgPhoto(k) : '';
    if (k.classList.contains('layout-cover')) { // 표지는 단색(정렬 옵션) — 사진 스타일이면 전체 사진
      Object.assign(k.dataset, { align: state.coverAlign, bg: state.coverBg });
      delete k.dataset.card;
      if (photo) k.insertAdjacentHTML('afterbegin', photo);
      return;
    }
    k.dataset.card = state.cardStyle;
    k.insertAdjacentHTML('afterbegin', cardBackground(state.cardStyle, i) + photo); // 흰 판·테두리 판 + 배경 사진(쓸지는 fitPhoto가 도식 크기로 정한다)
  });
  fit();
  document.fonts.ready.then(fit); // 웹폰트가 늦게 오면 다시 계산
  drawStyleThumbs(); // 추천 스타일 썸네일도 지금 덱으로
  deck.querySelectorAll('.k-photoset img, .k-photo-hero img').forEach((i) => { if (!i.complete) i.addEventListener('load', fit, { once: true }); }); // 사진 비율을 안 뒤 배치
  $('#count').textContent = `${deck.querySelectorAll('.kcard').length}장 · 부품 키트 · ${CANVAS.width}×${CANVAS.height}px`;
}

// 간격 보정: 제목↔부연설명(표지는 태그↔제목↔부제) 간격을 실제 글자 윤곽 기준으로, 위아래 나눔 머리 여백
function fit() {
  fitPhotoSets(deck); // 사진 묶음: 사진 비율에 맞는 배치 (사진을 불러온 뒤 다시)
  fitContainPhotos(deck); // 사진 강조의 원본 비율 사진: 틀 = 사진 크기
  fitTextGaps(deck);
  fitSplitHead(deck);
  fitPhoto(deck); // 사진 스타일: 도식이 작은 카드에만 사진, 도식은 위로
  fitAir(deck); // 남는 자리만큼 세로 간격 넓히기 (사진 카드는 빼고)
  fitLift(deck); // 꽉 찬 카드는 시각 보정을 덜 해 최소 여백 유지
}

// ---------- 사진 넣기 ----------
// 사진 자리 클릭 → 사진 선택 → 그 자리에 넣는다. 강사 사진(상반신)은 배경을 자동으로 지운다(누끼)
function initPhotos() {
  let slot = null, cutout = false;
  // 강사 사진 위치 옮기기: 사진이 들어간 강사 상반신을 끌면 사진만 움직인다 (photos[자리].x·y, 카드 원본 px)
  let drag = null, dragged = false;
  deck.addEventListener('pointerdown', (e) => {
    if (e.button !== 0) return;
    const pan = e.target.closest('.photo.has-img:not(.fit-contain)'); // 칸에 맞춰 잘린 사진: 끌어서 보이는 위치 고르기 (원본 비율 사진은 제외)
    if (pan) { startPan(e, pan); return; }
    const fig = e.target.closest(':is(.profile-figure, .book-item).has-img'); // 강사 사진·교재 사진
    if (!fig) return;
    const p = photos[fig.dataset.img] ?? {}, k = (c => c.getBoundingClientRect().height / c.offsetHeight)(fig.closest('.kcard')) || 1;
    drag = { fig, slot: fig.dataset.img, sx: e.clientX, sy: e.clientY, x0: p.x ?? 0, y0: p.y ?? 0, x: p.x ?? 0, y: p.y ?? 0, k };
    dragged = false;
    fig.setPointerCapture(e.pointerId);
    e.preventDefault();
  });
  // 사진 끌기: 사진이 칸보다 넘치는 만큼만 움직인다 → object-position %(photos[자리].pos)
  function startPan(e, fig) {
    const img = fig.querySelector('img'), r = fig.getBoundingClientRect();
    if (!img?.naturalWidth) return;
    const s = Math.max(r.width / img.naturalWidth, r.height / img.naturalHeight) * (photos[fig.dataset.img]?.scale ?? 100) / 100;
    const [px, py] = photos[fig.dataset.img]?.pos ?? (getComputedStyle(img).objectPosition.match(/[\d.]+(?=%)/g) ?? [50, 50]).map(Number);
    drag = { pan: true, fig, img, slot: fig.dataset.img, sx: e.clientX, sy: e.clientY, px, py, x: px, y: py,
      ox: img.naturalWidth * s - r.width, oy: img.naturalHeight * s - r.height }; // 넘치는 양(화면 px)
    dragged = false;
    fig.setPointerCapture(e.pointerId);
    e.preventDefault();
  }
  deck.addEventListener('pointermove', (e) => {
    if (drag?.pan) {
      const dx = e.clientX - drag.sx, dy = e.clientY - drag.sy;
      if (Math.abs(dx) + Math.abs(dy) > 3) dragged = true;
      const clamp = (v) => Math.min(100, Math.max(0, v));
      drag.x = drag.ox > 1 ? clamp(drag.px - (dx / drag.ox) * 100) : drag.px;
      drag.y = drag.oy > 1 ? clamp(drag.py - (dy / drag.oy) * 100) : drag.py;
      drag.fig.style.setProperty('--img-pos', `${drag.x}% ${drag.y}%`);
      return;
    }
    if (!drag) return;
    const dx = (e.clientX - drag.sx) / drag.k, dy = (e.clientY - drag.sy) / drag.k;
    if (Math.abs(dx) + Math.abs(dy) > 3 / drag.k) dragged = true;
    drag.x = drag.x0 + dx; drag.y = drag.y0 + dy;
    drag.fig.style.setProperty('--img-x', `${Math.round(drag.x)}px`);
    drag.fig.style.setProperty('--img-y', `${Math.round(drag.y)}px`);
  });
  deck.addEventListener('pointerup', () => {
    if (!drag) return;
    const d = drag; drag = null;
    if (!dragged) return;
    if (d.pan) { photos[d.slot] = { ...photos[d.slot], pos: [Math.round(d.x), Math.round(d.y)] }; render(); return; }
    photos[d.slot] = { ...photos[d.slot], x: Math.round(d.x), y: Math.round(d.y) };
    render();
  });

  deck.addEventListener('click', (e) => {
    const frame = e.target.closest('[data-img]');
    if (!frame) return;
    if (dragged) { dragged = false; return; } // 끌어서 옮긴 직후의 클릭은 무시
    slot = frame.dataset.img;
    cutout = frame.matches('.profile-figure');
    $('#imageFile').click();
  });
  $('#imageFile').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    e.target.value = '';
    if (!file || !slot) return;
    let url = URL.createObjectURL(file);
    if (cutout) {
      const status = $('#count'), prev = status.textContent;
      status.textContent = '강사 사진 배경 제거 중… (처음 한 번은 모델을 받느라 조금 걸려요)';
      try {
        url = URL.createObjectURL(await (await fetch(await removeBackground(url))).blob());
      } catch (err) {
        console.error(err);
        alert('배경 제거에 실패해 원본 사진을 넣었어요: ' + err.message);
      }
      status.textContent = prev;
    }
    photos[slot] = { ...photos[slot], src: url };
    render();
  });

  // 사진 위에 마우스를 올리면: 사진 안 오른쪽 위 아이콘 막대 하나 (2026-10-16 정리)
  //   ↻ 사진 변경 · ⤢ 전체 보기/채워 보기(잘리는 사진만) · − + 크기(50~200%, 바꾸면 % 표시, 사진 묶음 제외) · ✕ 빼기 · 책이면 목업 각도 ('원래대로'는 사용자 요청으로 뺌)
  const ICON = { fit: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h6v6"/><path d="M9 21H3v-6"/><path d="M21 3l-7 7"/><path d="M3 21l7-7"/></svg>', fill: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 14h6v6"/><path d="M20 10h-6V4"/><path d="M14 10l7-7"/><path d="M3 21l7-7"/></svg>' };
  const tools = document.createElement('div');
  tools.className = 'img-tools';
  tools.hidden = true;
  tools.innerHTML = `<button data-act="replace" title="사진 변경"><svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 0 1 15.5-6.2L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-15.5 6.2L3 16"/><path d="M3 21v-5h5"/></svg></button>
    <button class="next" data-act="next" title="다른 사진"><svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 18h1.4c1.3 0 2.5-.6 3.3-1.7l6.1-8.6c.7-1.1 2-1.7 3.3-1.7H22"/><path d="m18 2 4 4-4 4"/><path d="M2 6h1.9c1.5 0 2.9.9 3.6 2.2"/><path d="M22 18h-5.9c-1.3 0-2.6-.7-3.3-1.8l-.5-.8"/><path d="m18 14 4 4-4 4"/></svg></button>
    <button class="fit" data-act="fit"></button>
    <span class="zoom"><button data-d="-10" title="작게"><svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/></svg></button><span class="pct"></span><button data-d="10" title="크게"><svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14"/><path d="M5 12h14"/></svg></button></span>
    <button class="remove" data-act="remove" title="이 사진 빼기"><svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg></button>
    <button class="angle" data-act="angle"><svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 4 7v10l8 4 8-4V7z"/><path d="m4 7 8 4 8-4"/><path d="M12 11v10"/></svg></button>`; // 책에 올리면: 목업 각도 버튼 하나 — 누를 때마다 정면 → 책등 → 옆면
  document.body.append(tools);
  // 사진 자리에 마우스를 올리면 가운데(배경 사진은 아래쪽)에 '클릭해서 사진 변경/넣기' 안내 — 클릭은 그대로 사진 자리로 간다
  const hint = document.createElement('div');
  hint.className = 'img-hint';
  hint.hidden = true;
  document.body.append(hint);
  // 안내 문구는 띄우지 않는다(사용자 2026-10-16) — 빈 자리는 사진 아이콘·캡션, 채운 자리는 도구 막대로 충분. 부르는 곳은 그대로 둔다
  const showHint = () => { hint.hidden = true; };
  let hover = null, hideTimer = null;
  const setOf = (slot) => { const m = /^(.+)-(\d+)$/.exec(slot ?? ''); return m && m[1] in setCounts ? [m[1], +m[2]] : null; };
  const place = () => {
    const frame = hover && deck.querySelector(`[data-img="${hover}"]`);
    const inSet = setOf(hover), hasImg = !!photos[hover]?.src || frame?.matches('.has-img'), isBook = !!frame?.matches('.book-item'), canDrop = canDropOf(frame);
    if (!frame || (!hasImg && !inSet && !isBook && !canDrop)) { tools.hidden = true; return; }
    const angleBtn = tools.querySelector('.angle'), cur = BOOK_MOCKUPS.find((m) => m.id === mockupOf(hover)) ?? BOOK_MOCKUPS[0];
    angleBtn.hidden = !isBook;
    angleBtn.title = `책 각도: ${cur.label} → 누르면 ${BOOK_MOCKUPS[(BOOK_MOCKUPS.indexOf(cur) + 1) % BOOK_MOCKUPS.length].label}`;
    const p = photos[hover] ?? {};
    tools.querySelector('[data-act=replace]').hidden = !hasImg;
    tools.querySelector('.next').hidden = !poolSlots.has(hover) || !!photos[hover]?.src; // 사진 모음에서 온 사진만 (직접 올린 사진은 ✗)
    tools.querySelector('.zoom').hidden = !hasImg || (!!frame.closest('.k-photoset') && frame.matches('.fit-contain')); // 원본 비율로 놓인 묶음 사진은 확대·축소가 의미 없음
    tools.querySelector('.pct').textContent = p.scale && p.scale !== 100 ? `${p.scale}%` : ''; // 크기를 바꿨을 때만 % 표시
    const fitBtn = tools.querySelector('.fit'), isPhoto = !!frame.matches('.photo.has-img'); // 원본 비율 ↔ 채우기: 모든 사진(강사 상반신·교재 목업은 .photo가 아니라 제외)
    const contain = frame.matches('.fit-contain');
    fitBtn.hidden = !isPhoto;
    fitBtn.innerHTML = contain ? ICON.fill : ICON.fit;
    fitBtn.title = contain ? '채우기' : '맞추기'; // 채우기 = 칸에 맞춰 잘라 채움, 맞추기 = 원본 비율로 다 보이게
    const rm = tools.querySelector('.remove');
    rm.hidden = inSet ? setCounts[inSet[0]] <= 1 : !(hasImg || canDrop); // 묶음은 한 장까지 남김
    rm.title = canDrop ? '이 사진 자리 빼기 — 카드가 사진 없이 바뀌어요' : '이 사진 빼기';
    // 사진 안 오른쪽 위에 붙인다
    const r = frame.getBoundingClientRect();
    tools.classList.remove('compact');
    tools.hidden = false;
    const cr = frame.closest('.kcard').getBoundingClientRect();
    if (tools.offsetWidth > cr.width - 16) tools.classList.add('compact'); // 막대가 카드보다 넓을 때만 크기 버튼을 숨긴다 (사진보다 넓은 건 괜찮음)
    tools.style.left = `${r.right - 8}px`;
    tools.style.top = `${Math.max(r.top, 0) + 8}px`;
  };
  // 교재 목업·강사 상반신·사진 강조 사진은 자리째 뺄 수 있다(× → 카드가 사진 없는 모양으로)
  function canDropOf(frame) { return !!frame && !setOf(frame.dataset.img) && (frame.matches('.book-item, .profile-figure') || !!frame.closest('.k-photo-hero')); }
  // 뺀 자리가 있는 카드에 마우스를 올리면 오른쪽 아래 '+ ○○ 자리 다시 넣기'
  const restoreBtn = document.createElement('button');
  restoreBtn.className = 'gallery-add slot-restore';
  restoreBtn.hidden = true;
  document.body.append(restoreBtn);
  let restoreSlot = null;
  const placeRestore = (card) => {
    restoreSlot = card && [...dropped].find(([, d]) => d.card === card.id)?.[0];
    if (!restoreSlot) { restoreBtn.hidden = true; return; }
    const r = card.getBoundingClientRect();
    restoreBtn.style.left = `${r.right - 12}px`;
    restoreBtn.style.top = `${r.bottom - 52}px`;
    restoreBtn.textContent = `+ ${dropped.get(restoreSlot).label} 자리 다시 넣기`;
    restoreBtn.hidden = false;
  };
  restoreBtn.addEventListener('mouseenter', () => clearTimeout(hideTimer));
  restoreBtn.addEventListener('mouseleave', () => hideSoon());
  restoreBtn.addEventListener('click', async () => {
    if (!restoreSlot) return;
    dropped.delete(restoreSlot);
    restoreBtn.hidden = true;
    await render();
  });
  // 사진 묶음 아래 '+ 사진 추가 (n/4)'
  const addBtn = document.createElement('button');
  addBtn.className = 'gallery-add';
  addBtn.hidden = true;
  document.body.append(addBtn);
  let addSet = null;
  const placeAdd = () => {
    const box = addSet && deck.querySelector(`.k-photoset[data-set="${addSet}"]`);
    if (!box || setCounts[addSet] >= SET_MAX) { addBtn.hidden = true; return; }
    const r = box.getBoundingClientRect();
    addBtn.style.left = `${r.right}px`;
    addBtn.style.top = `${r.bottom + 6}px`;
    addBtn.textContent = `+ 사진 추가 (${setCounts[addSet]}/${SET_MAX})`;
    addBtn.hidden = false;
  };
  addBtn.addEventListener('mouseenter', () => clearTimeout(hideTimer));
  addBtn.addEventListener('mouseleave', () => hideSoon());
  addBtn.addEventListener('click', async () => {
    if (!addSet || setCounts[addSet] >= SET_MAX) return;
    setCounts[addSet]++;
    await render();
    placeAdd();
  });
  deck.addEventListener('mouseover', (e) => {
    const frame = e.target.closest('[data-img]');
    clearTimeout(hideTimer);
    addSet = e.target.closest('.kcard')?.querySelector('.k-photoset')?.dataset.set ?? null;
    placeAdd();
    placeRestore(e.target.closest('.kcard'));
    if (frame) { hover = frame.dataset.img; place(); showHint(frame); } else hint.hidden = true;
  });
  function hideSoon() { hideTimer = setTimeout(() => { tools.hidden = true; addBtn.hidden = true; restoreBtn.hidden = true; }, 300); }
  deck.addEventListener('mouseout', (e) => { if (!e.relatedTarget?.closest?.('[data-img]')) hint.hidden = true; hideSoon(); });
  tools.addEventListener('mouseenter', () => clearTimeout(hideTimer));
  tools.addEventListener('mouseleave', hideSoon);
  $('.stage').addEventListener('scroll', () => { tools.hidden = true; addBtn.hidden = true; hint.hidden = true; restoreBtn.hidden = true; });
  tools.addEventListener('click', async (e) => {
    const btn = e.target.closest('button');
    if (!btn || !hover) return;
    if (btn.dataset.act === 'angle') { // 목업 각도 다음 것으로
      const i = BOOK_MOCKUPS.findIndex((m) => m.id === mockupOf(hover));
      mockups[hover] = BOOK_MOCKUPS[(i + 1) % BOOK_MOCKUPS.length].id; await render(); place(); return;
    }
    if (btn.dataset.act === 'next') { poolShift[hover] = (poolShift[hover] ?? 0) + 1; await render(); place(); return; } // 같은 주제의 다음 사진
    if (btn.dataset.act === 'replace') { // 사진 변경 = 사진 자리 클릭과 같다
      const frame = deck.querySelector(`[data-img="${hover}"]`);
      slot = hover; cutout = !!frame?.matches('.profile-figure');
      $('#imageFile').click(); return;
    }
    if (btn.dataset.act === 'fit') { // 원본 비율 ↔ 칸에 맞춰 채우기
      photos[hover] ??= {};
      photos[hover].fit = deck.querySelector(`[data-img="${hover}"]`)?.matches('.fit-contain') ? 'cover' : 'contain';
      await render(); place(); return;
    }
    if (btn.dataset.act === 'remove') {
      const inSet = setOf(hover), frame = deck.querySelector(`[data-img="${hover}"]`);
      if (canDropOf(frame)) { // 교재·강사·사진 강조: 자리째 빼고 카드를 사진 없이
        const kind = frame.matches('.book-item') ? 'book' : frame.matches('.profile-figure') ? 'teacher' : 'photo';
        dropped.set(hover, { card: frame.closest('.kcard').id, label: DROP_LABEL[kind] });
        delete photos[hover];
        hint.hidden = true;
      } else if (inSet) { // 묶음에서 이 자리를 빼고 뒤 사진을 한 칸씩 당긴다
        const [set, k] = inSet;
        for (let j = k; j < setCounts[set] - 1; j++) {
          if (photos[`${set}-${j + 1}`]) photos[`${set}-${j}`] = photos[`${set}-${j + 1}`]; else delete photos[`${set}-${j}`];
        }
        delete photos[`${set}-${setCounts[set] - 1}`];
        setCounts[set]--;
        setCaps[set].push(...setCaps[set].splice(k, 1)); // 캡션도 함께 당기고, 뺀 캡션은 다음 추가 때 다시 쓴다
      } else delete photos[hover];
      tools.hidden = true;
    } else {
      photos[hover] ??= {}; // 덱에 주소로 들어간 사진(data-src·data-bgimg)도 확대·축소
      const d = Number(btn.dataset.d), cur = photos[hover].scale ?? 100;
      photos[hover].scale = d === 0 ? 100 : Math.min(200, Math.max(50, cur + d));
      if (d === 0) { Object.assign(photos[hover], { x: 0, y: 0 }); delete photos[hover].pos; } // 원래대로 = 크기·위치 모두
    }
    await render();
    place();
  });
}

// ---------- PNG 내보내기 ----------
async function exportZip() {
  const btn = $('#export');
  btn.disabled = true;
  btn.textContent = '이미지 생성 중…';
  try {
    await document.fonts.ready;
    const cards = [...deck.querySelectorAll('.kcard')];
    const fontEmbedCSS = await htmlToImage.getFontEmbedCSS(cards[0]);
    const zip = new JSZip();
    for (const [i, card] of cards.entries()) {
      const blob = await htmlToImage.toBlob(card, {
        width: CANVAS.width, height: CANVAS.height, pixelRatio: 1, fontEmbedCSS,
        style: { transform: 'none' }, // 미리보기용 0.3배 축소 제거
      });
      zip.file(`card_${String(i + 1).padStart(2, '0')}.png`, blob);
    }
    const out = await zip.generateAsync({ type: 'blob' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(out);
    a.download = 'cardnews-kit.zip';
    a.click();
    URL.revokeObjectURL(a.href);
  } catch (err) {
    console.error(err);
    alert('내보내기에 실패했어요: ' + err.message);
  } finally {
    btn.disabled = false;
    btn.textContent = 'PNG로 내보내기 (ZIP)';
  }
}

// ---------- 추천 스타일 썸네일 (정사각 견본 카드) ----------
// 스타일마다 1080×1080 견본 카드를 그 스타일 옵션 그대로(kit.css) 그려 작게 보여 준다 — 실제 카드를 줄이면 특징이 안 보여서,
// 특징이 크게 드러나는 요소만: 큰 'Aa 가나다'(제목 폰트·제목 컬러) + 큰 흰 도형 1개(모서리·그림자/테두리, 하나는 메인 컬러) + 카드 배경 판.
// 사진 스타일은 아래쪽에 덱의 사진(표지 data-bgimg)을 깐다. 원장님이 이름이 아니라 모양을 보고 고르게.
const THUMB_HTML = `<div class="k-head"><h2 class="k-title">Aa 가나다</h2></div>
  <div class="k-body thumb-body"><div class="k-panel"><i></i><i></i><i></i></div></div>`;
function drawStyleThumbs() {
  const boxes = document.querySelectorAll('.style-thumb[data-i]');
  if (!panel || !boxes.length) return;
  const styles = panel.styles();
  const photoSrc = deck.querySelector('[data-bgimg]')?.dataset.bgimg;
  boxes.forEach((box) => {
    const st = styles[box.dataset.i];
    if (!st) return;
    const o = withBrandColor({ ...DEFAULT_OPTIONS, ...st.opts, colors: { ...DEFAULT_OPTIONS.colors, ...st.opts.colors } }, getBrand()); // 견본도 학원 메인 컬러로
    const k = document.createElement('div');
    k.className = 'kcard thumb-card';
    k.innerHTML = THUMB_HTML;
    k.classList.toggle('dark', isDark(o.colors.bg));
    Object.assign(k.dataset, { shape: o.shape, style: o.shapeStyle, card: o.cardStyle });
    k.insertAdjacentHTML('afterbegin', cardBackground(o.cardStyle, 1));
    if (o.photo && photoSrc) {
      k.insertAdjacentHTML('afterbegin', `<figure class="card-photo photo has-img on" style="top:560px"><img src="${photoSrc}" alt=""></figure>`);
      k.classList.add('with-photo', 'thumb-photo');
    }
    Object.entries(themeVars(o)).forEach(([p, v]) => k.style.setProperty(p, v));
    // 밝은 배경은 견본에서만 조금 짙게 — 작게 보면 흰 도형과 배경이 구분되지 않아서 (실제 카드 색은 그대로)
    if (!isDark(o.colors.bg)) k.style.setProperty('--bg', `color-mix(in srgb, ${o.colors.bg} 78%, #64748b)`);
    // 견본에서는 스타일 차이를 과장한다(작게 줄이면 사라지는 값들) — 그림자 3배 진하게 · 테두리·판 테두리 3배 굵게 · 둥근 모서리 크게
    const grey = (c) => `color-mix(in srgb, ${c} 45%, #475569)`;
    k.style.setProperty('--shape-shadow', o.shapeStyle === 'shadow' ? '0 30px 70px rgb(15 23 42 / .32)' : 'none');
    k.style.setProperty('--line-width', `${Math.max(12, (o.shapeLine?.width ?? 3) * 3)}px`);
    k.style.setProperty('--line-color', grey(o.shapeLine?.color ?? '#D9D9DE'));
    k.style.setProperty('--panel-line-width', `${Math.max(14, (o.panelLine?.width ?? 3) * 3)}px`);
    k.style.setProperty('--panel-line-color', grey(o.panelLine?.color ?? '#D9D9DE'));
    k.style.setProperty('--r-lg', o.shape === 'rounded' ? '96px' : '0px');
    if (!isDark(o.colors.bg)) { k.style.setProperty('--surface', '#FFFFFF'); k.style.setProperty('--shape-fill', '#FFFFFF'); } // 판 배경(카드형·테두리형)이어도 견본 도형은 흰색
    k.style.setProperty('--fs-title', '180px'); k.style.setProperty('--fs-heading', '90px'); // 견본은 작게 줄여 보므로 글자를 크게
    k.style.setProperty('--thumb-scale', box.getBoundingClientRect().width / CANVAS.width);
    box.replaceChildren(k);
  });
}
document.addEventListener('stylesdrawn', drawStyleThumbs);
window.addEventListener('resize', () => requestAnimationFrame(drawStyleThumbs)); // 패널 폭이 바뀌면 견본 배율도 다시

// ---------- 콘텐츠 스튜디오 흐름 (겉모습만 — 데브 서버와 같은 순서) ----------
// '생성하기' → 오른쪽에 만드는 중 표시 → 만들어졌다고 치고 카드를 보여 주며 왼쪽을 '카드뉴스 디자인'으로 연다.
// 이 웹앱은 카드를 실제로 만들지 않는다(덱은 cards.html · ?deck=). 페이지를 열면 항상 생성 전 화면 → '생성하기'를 눌러야 카드가 보인다.
// 검사·사진 스크립트(webdriver)만 처음부터 만들어진 상태.
function initStudio() {
  const right = $('.studio-right'), setup = $('#setupView'), design = $('#designView');
  if (!right) return;
  const showDesign = (on) => { setup.hidden = on; design.hidden = !on; $('.studio-left').scrollTo({ top: 0 }); drawStyleThumbs(); };
  if (navigator.webdriver) { right.dataset.state = 'done'; panel.snapshot(); } // 검사·사진 스크립트만 처음부터 만든 상태 — 사람이 열면 항상 생성 전 화면부터(데브 서버와 같게, 2026-10-16)
  else right.dataset.state = 'empty';
  $('.generate').addEventListener('click', () => {
    right.dataset.state = 'loading';
    panel.snapshot(); // 되돌리기 기준 = 생성할 때 고른 스타일
    setTimeout(() => { right.dataset.state = 'done'; showDesign(true); }, 1600);
  });
  $('#designClose').addEventListener('click', () => showDesign(false));
  $('#resetStyle').addEventListener('click', () => panel.restore());
  // 결과 화면: 내용 편집하기 ↔ 편집 완료 (겉모습만 — 섹션 제목·본문 칸이 초록 테두리 편집 칸으로)
  const setEdit = (on) => {
    editMode = on;
    right.classList.toggle('editing', on);
    const b = $('#editToggle'); b.textContent = on ? '편집 완료' : '내용 편집하기'; b.classList.toggle('on', on);
    deck.querySelectorAll('.res-sec-title, .res-text textarea').forEach((e) => { e.readOnly = !on; });
  };
  $('#editToggle')?.addEventListener('click', () => setEdit(!editMode));
  new MutationObserver(() => { if (editMode) setEdit(true); }).observe(deck, { childList: true }); // 다시 그려도 편집 모드 유지
  // 카드 '이미지 저장': 그 카드 한 장을 PNG로
  deck.addEventListener('click', async (e) => {
    const b = e.target.closest('.res-save');
    if (!b) return;
    const card = b.closest('.res-card').querySelector('.kcard'), n = [...deck.querySelectorAll('.kcard')].indexOf(card) + 1;
    b.disabled = true;
    try {
      await document.fonts.ready;
      const blob = await htmlToImage.toBlob(card, { width: CANVAS.width, height: CANVAS.height, pixelRatio: 1, style: { transform: 'none' } });
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `card_${String(n).padStart(2, '0')}.png`; a.click(); URL.revokeObjectURL(a.href);
    } catch (err) { console.error(err); alert('이미지 저장에 실패했어요: ' + err.message); }
    finally { b.disabled = false; }
  });
  // 학원 설정(데모): 학원 메인 컬러를 바꾸면 저장하고 지금 카드·견본에 바로 반영 (실제 서버에선 학원 설정 화면 몫)
  const brandInput = $('#brandColor'), brandLabel = $('#brandHex');
  const showBrand = () => { const b = getBrand(); brandInput.value = b || '#3b5bfd'; brandLabel.textContent = b ? b.toUpperCase() : '없음 (스타일 색)'; };
  brandInput?.addEventListener('input', () => { try { localStorage.setItem(BRAND_KEY, brandInput.value); } catch { /* 저장 못 하면 이번만 */ } showBrand(); panel.applyBrand(); });
  $('#brandClear')?.addEventListener('click', () => { try { localStorage.removeItem(BRAND_KEY); } catch { /* 무시 */ } showBrand(); drawStyleThumbs(); });
  if (brandInput) showBrand();
}

panel = setupPanel(state, render, { brand: getBrand }); // 왼쪽 옵션(내 스타일·폰트·컬러·도형·배경…) — 스타일을 골라도 메인은 학원 색
initPhotos();
initStudio();
$('#export').addEventListener('click', exportZip);
render().then(drawStyleThumbs);
