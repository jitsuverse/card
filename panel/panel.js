// 왼쪽 옵션 패널(내 스타일·폰트·컬러·도형 모양·도형 스타일·본문 카드 배경·교재 목업·표지 이미지)
// 부품 키트(kit/)의 왼쪽 옵션 패널. 옵션을 바꾸면 kit/kit.css의 "왼쪽 옵션 연결"도 맞춘다.
import { FONTS, TITLE_FONTS, BODY_FONTS, SHAPES, SHAPE_STYLES, CARD_STYLES, COVER_VISUALS, COVER_ALIGNS, COVER_BGS, DEFAULT_OPTIONS } from '../assets/config.js';

const $ = (s) => document.querySelector(s);

// state: 옵션 객체(바뀌면 그 자리에서 고침), render: 옵션이 바뀔 때마다 부르는 그리기 함수
export function setupPanel(state, render) {
  const syncers = []; // 옵션 화면 동기화 함수들 — 저장한 스타일을 불러올 때 한 번에 갱신

  // ---------- HEX 입력칸 ----------
  // 컬러칩 옆 입력칸: #RRGGBB(또는 #RGB, # 생략 가능)를 직접 입력 → 맞는 값이면 바로 반영, 칸을 벗어나면 현재 값으로 정리
  const normHex = (v) => {
    let h = v.trim().replace(/^#/, '');
    if (/^[0-9a-f]{3}$/i.test(h)) h = [...h].map((c) => c + c).join('');
    return /^[0-9a-f]{6}$/i.test(h) ? `#${h.toUpperCase()}` : null;
  };
  function hexField(colorInput, get, set) {
    const field = colorInput.nextElementSibling;
    field.addEventListener('input', () => {
      const v = normHex(field.value);
      field.classList.toggle('bad', !v && field.value.trim() !== '');
      if (v && v !== get().toUpperCase()) { set(v.toLowerCase()); colorInput.value = v.toLowerCase(); render(); }
    });
    field.addEventListener('blur', () => { field.classList.remove('bad'); field.value = get().toUpperCase(); });
    field.addEventListener('keydown', (e) => { if (e.key === 'Enter') field.blur(); });
  }
  const showHex = (colorInput, v) => { const f = colorInput.nextElementSibling; if (document.activeElement !== f) f.value = v.toUpperCase(); };

  // ---------- 폰트 로딩 ----------
  // 선택된 폰트(제목·본문)의 stylesheet만 유지 — 내보내기 시 사용하지 않는 폰트까지 임베드되지 않도록
  function loadFonts(ids) {
    const wanted = new Set(ids);
    document.querySelectorAll('link[data-font]').forEach((l) => {
      if (wanted.has(l.dataset.font)) wanted.delete(l.dataset.font);
      else l.remove();
    });
    for (const id of wanted) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = FONTS.find((f) => f.id === id).css;
      link.crossOrigin = 'anonymous'; // PNG 내보내기 시 폰트 임베드에 필요
      link.dataset.font = id;
      document.head.appendChild(link);
    }
  }

  // ---------- 컨트롤 생성 ----------
  function segmented(el, items, key) {
    el.innerHTML = items.map((it) => `<button data-v="${it.id}">${it.label}</button>`).join('');
    const sync = () => {
      if (!items.some((it) => it.id === state[key])) state[key] = DEFAULT_OPTIONS[key]; // 저장한 스타일에 없어진 값(예: 수첩 종이)이 있으면 기본값
      el.querySelectorAll('button').forEach((b) => b.classList.toggle('on', b.dataset.v === state[key]));
    };
    syncers.push(sync);
    el.addEventListener('click', (e) => {
      const v = e.target.closest('button')?.dataset.v;
      if (!v) return;
      state[key] = v;
      sync();
      render();
    });
    sync();
  }

  function lineControls(el, key) {
    const width = el.querySelector('[data-line=width]'), color = el.querySelector('[data-line=color]');
    const sync = () => {
      width.value = state[key].width;
      color.value = state[key].color;
      width.nextElementSibling.textContent = `${state[key].width}px`;
      showHex(color, state[key].color);
    };
    syncers.push(sync);
    width.addEventListener('input', () => { state[key].width = Number(width.value); sync(); render(); });
    color.addEventListener('input', () => { state[key].color = color.value; sync(); render(); });
    hexField(color, () => state[key].color, (v) => { state[key].color = v; });
    sync();
  }

  // 도형 그림자: 투명도 슬라이더 (방향은 아래 고정)
  function shadowControls() {
    const op = $('[data-shadow=opacity]');
    const sync = () => {
      op.value = state.shapeShadow.opacity;
      op.nextElementSibling.textContent = `${state.shapeShadow.opacity}%`;
    };
    syncers.push(sync);
    op.addEventListener('input', () => { state.shapeShadow.opacity = Number(op.value); sync(); render(); });
    sync();
  }

  // ---------- 옵션 연결 ----------
  for (const key of ['fontTitle', 'fontBody']) {
    const sel = document.getElementById(key);
    const list = key === 'fontTitle' ? TITLE_FONTS : BODY_FONTS; // 제목에는 얇은 폰트·손글씨 ✗, 본문에는 굵은 장식체 ✗
    sel.innerHTML = list.map((f) => `<option value="${f.id}">${f.label}</option>`).join('');
    const fit = () => { if (!list.some((f) => f.id === state[key])) state[key] = DEFAULT_OPTIONS[key]; }; // 저장한 스타일에 이제 없는 폰트가 있으면 기본값
    fit();
    sel.value = state[key];
    syncers.push(() => { fit(); sel.value = state[key]; });
    sel.addEventListener('change', () => { state[key] = sel.value; render(); });
  }

  const colorInputs = document.querySelectorAll('[data-color]');
  const syncColors = () => colorInputs.forEach((inp) => {
    inp.value = state.colors[inp.dataset.color];
    showHex(inp, inp.value);
  });
  colorInputs.forEach((inp) => inp.addEventListener('input', () => {
    state.colors[inp.dataset.color] = inp.value;
    syncColors();
    render();
  }));
  colorInputs.forEach((inp) => hexField(inp, () => state.colors[inp.dataset.color], (v) => { state.colors[inp.dataset.color] = v; }));

  syncColors();
  syncers.push(syncColors);

  segmented($('#shape'), SHAPES, 'shape');
  segmented($('#shapeStyle'), SHAPE_STYLES, 'shapeStyle');
  segmented($('#cardStyle'), CARD_STYLES, 'cardStyle');
  segmented($('#coverVisual'), COVER_VISUALS, 'coverVisual');
  segmented($('#coverAlign'), COVER_ALIGNS, 'coverAlign');
  segmented($('#coverBg'), COVER_BGS, 'coverBg');

  // 선 굵기·색: 도형 스타일 '선'(#shapeLine), 테두리 판(#panelLine)
  shadowControls();
  lineControls($('#shapeLine'), 'shapeLine');
  lineControls($('#panelLine'), 'panelLine');

  // ---------- 내 스타일: 현재 스타일 옵션을 5칸에 저장·불러오기 (브라우저 localStorage) ----------
  const STYLE_KEYS = ['fontTitle', 'fontBody', 'colors', 'shape', 'shapeStyle', 'shapeShadow', 'shapeLine', 'cardStyle', 'panelLine', 'coverVisual', 'coverAlign', 'coverBg', 'photo'];
  const STYLE_SLOTS = 6;
  // 6번 칸은 기본으로 '사진' 스타일(기본 옵션 + 사진 켜기) — 저장하면 덮어쓰고, 비우면 다시 '사진'으로 돌아온다
  const BUILTIN = { 5: { name: '사진', builtin: true, opts: { photo: true } } };
  const STORE_KEY = 'cardnews.myStyles.v1';
  function readStyles() {
    try { const v = JSON.parse(localStorage.getItem(STORE_KEY) || '[]'); return Array.from({ length: STYLE_SLOTS }, (_, i) => v[i] ?? BUILTIN[i] ?? null); }
    catch { return Array.from({ length: STYLE_SLOTS }, (_, i) => BUILTIN[i] ?? null); }
  }
  function writeStyles(list) {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(list.map((st) => (st?.builtin ? null : st)))); return true; }
    catch { alert('이 브라우저에서는 스타일을 저장할 수 없어요 (저장소 사용 불가).'); return false; }
  }
  function initMyStyles() {
    const box = $('#myStyles');
    let current = -1;
    const draw = () => {
      const list = readStyles();
      box.innerHTML = list.map((st, i) => {
        const o = st && { ...DEFAULT_OPTIONS, ...st.opts };
        const sw = o ? `<i class="sw" style="background:${o.colors.bg};border-color:${o.colors.main}"><b style="background:${o.colors.main}"></b></i>` : '<i class="sw empty"></i>';
        const font = o ? FONTS.find((f) => f.id === o.fontTitle)?.label ?? '' : '';
        return `<div class="slot${i === current ? ' on' : ''}">
          <button class="slot-load" data-i="${i}" ${st ? '' : 'disabled'}>${sw}<span>${st ? st.name : `${i + 1}. 빈 칸`}</span>${o ? `<small>${font}</small>` : ''}</button>
          <button class="slot-save" data-i="${i}" title="지금 스타일을 이 칸에 저장">저장</button>
          ${st && !st.builtin ? `<button class="slot-del" data-i="${i}" title="이 칸 비우기">×</button>` : ''}
        </div>`;
      }).join('');
    };
    box.addEventListener('click', (e) => {
      const btn = e.target.closest('button');
      if (!btn) return;
      const i = Number(btn.dataset.i), list = readStyles();
      if (btn.classList.contains('slot-save')) {
        const name = prompt('이 스타일의 이름', list[i]?.name ?? `스타일 ${i + 1}`);
        if (name == null) return;
        list[i] = { name: name.trim() || `스타일 ${i + 1}`, savedAt: Date.now(), opts: structuredClone(Object.fromEntries(STYLE_KEYS.map((k) => [k, state[k]]))) };
        if (writeStyles(list)) { current = i; draw(); }
      } else if (btn.classList.contains('slot-del')) {
        if (!confirm(`'${list[i]?.name}' 스타일을 지울까요?`)) return;
        list[i] = null;
        if (writeStyles(list)) { if (current === i) current = -1; draw(); }
      } else if (btn.classList.contains('slot-load') && list[i]) {
        Object.assign(state, structuredClone({ ...Object.fromEntries(STYLE_KEYS.map((k) => [k, DEFAULT_OPTIONS[k]])), ...list[i].opts }));
        syncers.forEach((f) => f());
        current = i;
        draw();
        render();
      }
    });
    draw();
  }

  initMyStyles();

  return {
    // 그리기 직전에 부른다: 선택한 폰트 불러오기 + 지금 옵션에 맞게 세부 조절 보이기/숨기기
    update() {
      loadFonts([state.fontTitle, state.fontBody]);
      $('#shapeShadow').hidden = state.shapeStyle !== 'shadow';
      // 선 굵기·선 색은 '선' 스타일일 때만 (그림자·기본에서는 숨김 — 구분선·연결선은 지금 값 그대로 쓴다)
      $('#shapeLine').hidden = state.shapeStyle !== 'line';
      $('#panelLine').hidden = state.cardStyle !== 'outline';
    },
  };
}
