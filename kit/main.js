// 부품 키트: cards.html의 카드를 그대로 띄운다.
// 왼쪽 옵션은 panel/panel.js 패널·assets/render.js의 themeVars 값을 쓰고, kit.css가 그 변수를 받아 그린다.
// 표지 이미지·사진 틀·책 목업·강사 상반신·2D 아이콘·제목 간격 보정은 assets/ 엔진 코드를 쓴다.
import { DEFAULT_OPTIONS, CANVAS, BOOK_MOCKUPS } from '../assets/config.js';
import { themeVars, cardBackground, bookMockup, photoFrame, teacherFigure, contrastText } from '../assets/render.js';
import { renderIcon } from '../assets/icons.js';
import { phIcon } from '../assets/phosphor.js';
import { removeBackground } from '../assets/cutout.js';
import { fitTextGaps, fitSplitHead } from '../assets/fit.js';
import { setupPanel } from '../panel/panel.js';

const $ = (s) => document.querySelector(s);
const deck = $('#deck');
const state = structuredClone(DEFAULT_OPTIONS);
const photos = {}; // 사진 자리(data-slot) → { src, scale }  (이 화면에서만 유지)
const setCounts = {}; // 사진 묶음(data-set) → 지금 장수 (1~4, 처음엔 data-count)
const mockups = {};  // 책 자리(data-slot) → 교재 목업 각도 (미리보기에서 책에 마우스를 올려 고름)
const setCaps = {};   // 사진 묶음 → 자리별 캡션 (사진을 빼면 사진과 함께 당겨진다)
const SET_MAX = 4;
let cardsHTML = null;

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
const bookFigure = (slot, caption) => `<figure class="book-stage${photos[slot]?.src ? ' has-img' : ''}" data-mockup="${mockupOf(slot)}">
  <div class="book-row book-row-1">${bookMockup({ caption, ...photos[slot] }, slot)}</div></figure>`;

function photoHTML(el) {
  const { photo: kind, slot, caption } = el.dataset;
  if (kind === 'book') return bookFigure(slot, caption ?? '교재 표지');
  if (kind === 'teacher') return teacherFigure({ caption: caption ?? '강사 사진', ...photos[slot] }, slot);
  if (kind === 'photo') return photoFrame({ caption: caption ?? '사진', ...photos[slot] }, '', false, slot);
  if (kind === 'cover') {
    if (state.coverVisual === 'teacher') return teacherFigure({ caption: '강사 사진', ...photos['cover-teacher'] }, 'cover-teacher', 'cover-teacher');
    if (state.coverVisual === 'book') {
      return `<div class="cover-book" data-mockup="${mockupOf('cover-book')}">${bookMockup({ caption: '교재 표지', ...photos['cover-book'] }, 'cover-book')}</div>`;
    }
    const accent = state.coverBg === 'main' ? contrastText(state.colors.main) : state.colors.main; // 메인 컬러 배경이면 메인 위에서 보이는 색
    return `<div class="cover-icon">${renderIcon(el.dataset.icon, accent)}</div>`;
  }
  return '';
}

function fillSlots() {
  // 사진 묶음: <div class="k-photoset" data-set="h" data-count="3" data-captions="a,b,c,d"> → 장수만큼 사진 자리
  deck.querySelectorAll('.k-photoset').forEach((el) => {
    const set = el.dataset.set;
    const caps = (setCaps[set] ??= Array.from({ length: SET_MAX }, (_, k) => (el.dataset.captions ?? '').split(',')[k] || '사진'));
    const n = (setCounts[set] ??= Math.min(SET_MAX, Math.max(1, +el.dataset.count || 1)));
    el.classList.add(`n-${n}`);
    el.innerHTML = Array.from({ length: n }, (_, k) => `<div data-photo="photo" data-slot="${set}-${k}" data-caption="${caps[k] || '사진'}"></div>`).join('');
  });
  deck.querySelectorAll('[data-photo]').forEach((el) => { el.insertAdjacentHTML('beforebegin', photoHTML(el)); el.remove(); });
  deck.querySelectorAll('[data-icon2d]').forEach((el) => { el.outerHTML = `<span class="k-icon">${renderIcon(el.dataset.icon2d, state.colors.main)}</span>`; });
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
async function render() {
  panel.update(); // 폰트 불러오기 + 옵션 표시 갱신
  Object.entries(themeVars(state)).forEach(([k, v]) => deck.style.setProperty(k, v));
  cardsHTML ??= await (await fetch(`${DECK}.html`, { cache: 'no-store' })).text();
  deck.innerHTML = cardsHTML;
  deck.querySelectorAll(':scope > .kcard').forEach((c) => {
    const f = document.createElement('div');
    f.className = 'frame';
    c.replaceWith(f);
    f.append(c);
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
    if (k.classList.contains('layout-cover')) { Object.assign(k.dataset, { align: state.coverAlign, bg: state.coverBg }); return; } // 표지는 항상 단색, 정렬 옵션
    k.dataset.card = state.cardStyle;
    k.insertAdjacentHTML('afterbegin', cardBackground(state.cardStyle, i)); // 흰 판·테두리 판
  });
  fit();
  document.fonts.ready.then(fit); // 웹폰트가 늦게 오면 다시 계산
  $('#count').textContent = `${deck.querySelectorAll('.kcard').length}장 · 부품 키트 · ${CANVAS.width}×${CANVAS.height}px`;
}

// 간격 보정: 제목↔부연설명(표지는 태그↔제목↔부제) 간격을 실제 글자 윤곽 기준으로, 위아래 나눔 머리 여백
function fit() {
  fitTextGaps(deck);
  fitSplitHead(deck);
}

// ---------- 사진 넣기 ----------
// 사진 자리 클릭 → 사진 선택 → 그 자리에 넣는다. 강사 사진(상반신)은 배경을 자동으로 지운다(누끼)
function initPhotos() {
  let slot = null, cutout = false;
  // 강사 사진 위치 옮기기: 사진이 들어간 강사 상반신을 끌면 사진만 움직인다 (photos[자리].x·y, 카드 원본 px)
  let drag = null, dragged = false;
  deck.addEventListener('pointerdown', (e) => {
    const fig = e.target.closest(':is(.profile-figure, .book-item).has-img'); // 강사 사진·교재 사진
    if (!fig || e.button !== 0) return;
    const p = photos[fig.dataset.img] ?? {}, k = (c => c.getBoundingClientRect().height / c.offsetHeight)(fig.closest('.kcard')) || 1;
    drag = { fig, slot: fig.dataset.img, sx: e.clientX, sy: e.clientY, x0: p.x ?? 0, y0: p.y ?? 0, x: p.x ?? 0, y: p.y ?? 0, k };
    dragged = false;
    fig.setPointerCapture(e.pointerId);
    e.preventDefault();
  });
  deck.addEventListener('pointermove', (e) => {
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

  // 사진 위에 마우스를 올리면: −/+ 확대·축소(50~200%), 원래대로, × 사진 빼기
  const tools = document.createElement('div');
  tools.className = 'img-tools';
  tools.hidden = true;
  tools.innerHTML = `<span class="zoom"><button data-d="-10" title="축소">−</button><span></span><button data-d="10" title="확대">+</button><button data-d="0" title="100%로">원래대로</button></span>
    <button class="remove" data-act="remove" title="이 사진 빼기">×</button>
    <span class="angles">${BOOK_MOCKUPS.map((m) => `<button data-mockup="${m.id}" title="교재 목업: ${m.label}">${m.label}</button>`).join('')}</span>`; // 책에 올리면 그 책의 목업 각도
  document.body.append(tools);
  let hover = null, hideTimer = null;
  const setOf = (slot) => { const m = /^(.+)-(\d+)$/.exec(slot ?? ''); return m && m[1] in setCounts ? [m[1], +m[2]] : null; };
  const place = () => {
    const frame = hover && deck.querySelector(`[data-img="${hover}"]`);
    const inSet = setOf(hover), hasImg = !!photos[hover]?.src, isBook = !!frame?.matches('.book-item');
    if (!frame || (!hasImg && !inSet && !isBook)) { tools.hidden = true; return; }
    tools.querySelector('.angles').hidden = !isBook;
    tools.querySelectorAll('.angles button').forEach((b) => b.classList.toggle('on', b.dataset.mockup === mockupOf(hover)));
    const r = frame.getBoundingClientRect();
    tools.style.left = `${r.right - 8}px`;
    tools.style.top = `${r.top + 8}px`;
    tools.querySelector('.zoom').hidden = !hasImg;
    tools.querySelector('.zoom span').textContent = `${photos[hover]?.scale ?? 100}%`;
    tools.querySelector('.remove').hidden = inSet ? setCounts[inSet[0]] <= 1 : !hasImg; // 묶음은 한 장까지 남김
    tools.hidden = false;
  };
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
    if (frame) { hover = frame.dataset.img; place(); }
  });
  function hideSoon() { hideTimer = setTimeout(() => { tools.hidden = true; addBtn.hidden = true; }, 300); }
  deck.addEventListener('mouseout', hideSoon);
  tools.addEventListener('mouseenter', () => clearTimeout(hideTimer));
  tools.addEventListener('mouseleave', hideSoon);
  $('.stage').addEventListener('scroll', () => { tools.hidden = true; addBtn.hidden = true; });
  tools.addEventListener('click', async (e) => {
    const btn = e.target.closest('button');
    if (!btn || !hover) return;
    if (btn.dataset.mockup) { mockups[hover] = btn.dataset.mockup; await render(); place(); return; }
    if (btn.dataset.act === 'remove') {
      const inSet = setOf(hover);
      if (inSet) { // 묶음에서 이 자리를 빼고 뒤 사진을 한 칸씩 당긴다
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
      const d = Number(btn.dataset.d), cur = photos[hover].scale ?? 100;
      photos[hover].scale = d === 0 ? 100 : Math.min(200, Math.max(50, cur + d));
      if (d === 0) Object.assign(photos[hover], { x: 0, y: 0 }); // 원래대로 = 크기·위치 모두
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

const panel = setupPanel(state, render); // 왼쪽 옵션(내 스타일·폰트·컬러·도형·배경…)
initPhotos();
$('#export').addEventListener('click', exportZip);
render();
