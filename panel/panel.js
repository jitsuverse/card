// 왼쪽 옵션 패널(내 스타일·폰트·컬러·도형 모양·도형 스타일·본문 카드 배경·교재 목업·표지 이미지)
// 부품 키트(kit/)의 왼쪽 옵션 패널. 옵션을 바꾸면 kit/kit.css의 "왼쪽 옵션 연결"도 맞춘다.
import { withBrandColor } from '../assets/render.js';
import { FONTS, TITLE_FONTS, BODY_FONTS, SHAPES, SHAPE_STYLES, CARD_STYLES, COVER_VISUALS, COVER_ALIGNS, COVER_BGS, DEFAULT_OPTIONS, PRESET_STYLES } from '../assets/config.js';

const $ = (s) => document.querySelector(s);

// state: 옵션 객체(바뀌면 그 자리에서 고침), render: 옵션이 바뀔 때마다 부르는 그리기 함수
export function setupPanel(state, render, { brand = () => null } = {}) { // brand: 학원 메인 컬러(없으면 null) — 스타일을 골라도 메인은 이 색
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
      const font = FONTS.find((f) => f.id === id);
      if (!font) continue; // 목록에 없는 폰트(저장된 옛 스타일 등)는 건너뛴다
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = font.css;
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
  // 비어 있는 칸은 관리자 추천 스타일(config PRESET_STYLES) — 저장하면 덮어쓰고, 비우면 다시 추천 스타일로 돌아온다
  const BUILTIN = Object.fromEntries(PRESET_STYLES.map((p, i) => [i, { ...p, builtin: true }]));
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
        const o = st && { ...DEFAULT_OPTIONS, ...st.opts, colors: { ...DEFAULT_OPTIONS.colors, ...st.opts?.colors } };
        const sw = o ? `<i class="sw" style="background:${o.colors.bg};border-color:${o.colors.main}"><b style="background:${o.colors.main}"></b></i>` : '<i class="sw empty"></i>';
        const font = o ? FONTS.find((f) => f.id === o.fontTitle)?.label ?? '' : '';
        return `<div class="slot${i === current ? ' on' : ''}">
          <button class="slot-load" data-i="${i}" ${st ? '' : 'disabled'}>${sw}<span>${st ? st.name : `${i + 1}. 빈 칸`}</span>${o ? `<small>${font}</small>` : ''}</button>
          <button class="slot-save" data-i="${i}" title="지금 스타일을 이 칸에 저장">저장</button>
          ${st && !st.builtin ? `<button class="slot-del" data-i="${i}" title="이 칸 비우기">×</button>` : ''}
        </div>`;
      }).join('');
    };
    // '추천 스타일' 고르기(.preset-picker — 글 설정·카드뉴스 디자인 맨 위): 6칸을 카드 썸네일로, 누르면 그 스타일로.
    // 썸네일 그림은 main.js가 그린다(.style-thumb 자리에 지금 덱의 카드를 그 스타일로 복제) — 그리라고 'stylesdrawn' 이벤트를 보낸다.
    const pickers = [...document.querySelectorAll('.preset-picker')];
    const drawPicker = () => {
      const list = readStyles();
      pickers.forEach((pk) => {
        pk.innerHTML = list.map((st, i) => (st ? `<button type="button" class="style-tile${i === current ? ' on' : ''}" data-i="${i}" title="${st.name} 스타일로">
          <span class="style-thumb" data-i="${i}"></span><span class="style-name">${st.name}</span></button>` : '')).join('');
      });
      document.dispatchEvent(new CustomEvent('stylesdrawn'));
    };
    const load = (i, list) => {
      Object.assign(state, structuredClone(withBrandColor({ ...Object.fromEntries(STYLE_KEYS.map((k) => [k, DEFAULT_OPTIONS[k]])), ...list[i].opts,
        colors: { ...DEFAULT_OPTIONS.colors, ...list[i].opts.colors } }, brand())));
      syncers.forEach((f) => f());
      current = i;
      draw(); drawPicker();
      render();
    };
    pickers.forEach((pk) => pk.addEventListener('click', (e) => {
      const btn = e.target.closest('.style-tile');
      const list = readStyles();
      if (btn && list[btn.dataset.i]) load(Number(btn.dataset.i), list);
    }));
    api.styles = readStyles;
    // 덱이 기본 스타일을 정해 둔 경우(예: 이미지 덱은 사진 스타일): 그 이름의 추천 스타일을 고른다. 다시 그리지는 않는다(부르는 쪽이 그림)
    api.chooseByName = (name) => {
      const list = readStyles(), i = list.findIndex((st) => st?.name === name || (name === '사진' && st?.opts?.photo));
      if (i < 0) return false;
      Object.assign(state, structuredClone(withBrandColor({ ...Object.fromEntries(STYLE_KEYS.map((k) => [k, DEFAULT_OPTIONS[k]])), ...list[i].opts,
        colors: { ...DEFAULT_OPTIONS.colors, ...list[i].opts.colors } }, brand())));
      syncers.forEach((f) => f());
      current = i; draw(); drawPicker();
      return true;
    };
    // 학원 메인 컬러가 바뀌면(데모 설정) 지금 카드 메인도 그 색으로
    api.applyBrand = () => { Object.assign(state, withBrandColor(state, brand())); syncers.forEach((f) => f()); drawPicker(); render(); };
    // 되돌리기: '생성하기' 때의 옵션을 기억해 두고(snapshot), '처음 스타일로 되돌리기'에서 그대로 돌려놓는다(restore)
    let base = null, baseIndex = -1;
    api.hasSnapshot = () => !!base;
    api.snapshot = () => { base = structuredClone(Object.fromEntries(STYLE_KEYS.map((k) => [k, state[k]]))); baseIndex = current; };
    api.restore = () => {
      if (!base) return;
      Object.assign(state, structuredClone(base));
      syncers.forEach((f) => f());
      current = baseIndex;
      draw(); drawPicker();
      render();
    };
    // 관리자: 지금 6칸을 config.js PRESET_STYLES 코드로 복사 (기본값과 다른 옵션만)
    $('#copyPresets')?.addEventListener('click', async () => {
      const diff = (o) => Object.fromEntries(Object.entries(o).filter(([k, v]) => JSON.stringify(v) !== JSON.stringify(DEFAULT_OPTIONS[k])));
      const code = `export const PRESET_STYLES = [\n${readStyles().map((st) => st ? `  { name: ${JSON.stringify(st.name)}, opts: ${JSON.stringify(diff(st.opts))} },` : '  null,').join('\n')}\n];`;
      try { await navigator.clipboard.writeText(code); alert('스타일 코드를 복사했어요. assets/config.js의 PRESET_STYLES에 붙여 넣으면 돼요.'); }
      catch { prompt('아래 코드를 복사하세요', code); }
    });
    box.addEventListener('click', (e) => {
      const btn = e.target.closest('button');
      if (!btn) return;
      const i = Number(btn.dataset.i), list = readStyles();
      if (btn.classList.contains('slot-save')) {
        const name = prompt('이 스타일의 이름', list[i]?.name ?? `스타일 ${i + 1}`);
        if (name == null) return;
        list[i] = { name: name.trim() || `스타일 ${i + 1}`, savedAt: Date.now(), opts: structuredClone(Object.fromEntries(STYLE_KEYS.map((k) => [k, state[k]]))) };
        if (writeStyles(list)) { current = i; draw(); drawPicker(); }
      } else if (btn.classList.contains('slot-del')) {
        if (!confirm(`'${list[i]?.name}' 스타일을 지울까요?`)) return;
        list[i] = null;
        if (writeStyles(list)) { if (current === i) current = -1; draw(); drawPicker(); }
      } else if (btn.classList.contains('slot-load') && list[i]) {
        load(i, list);
      }
    });
    draw(); drawPicker();
  }

  const api = {};
  initMyStyles();

  return Object.assign(api, {
    // 그리기 직전에 부른다: 선택한 폰트 불러오기 + 지금 옵션에 맞게 세부 조절 보이기/숨기기
    update() {
      loadFonts([state.fontTitle, state.fontBody]);
      $('#shapeShadow').hidden = state.shapeStyle !== 'shadow';
      // 선 굵기·선 색은 '선' 스타일일 때만 (그림자·기본에서는 숨김 — 구분선·연결선은 지금 값 그대로 쓴다)
      $('#shapeLine').hidden = state.shapeStyle !== 'line';
      $('#panelLine').hidden = state.cardStyle !== 'outline';
      // 사진 스타일: 표지는 배경 컬러 · 아래 정렬 · 아이콘으로 고정(사진이 표지 그림이라) — 버튼은 잠그고 안내 (2026-10-16 사용자 확정)
      const lock = !!state.photo;
      if (lock) {
        const fixed = { coverBg: 'bg', coverAlign: 'bottom', coverVisual: 'icon' };
        if (Object.entries(fixed).some(([k, v]) => state[k] !== v)) { Object.assign(state, fixed); syncers.forEach((f) => f()); }
      }
      ['#coverBg', '#coverAlign', '#coverVisual'].forEach((s) => $(s)?.classList.toggle('locked', lock));
      if ($('#coverLockNote')) $('#coverLockNote').hidden = !lock;
    },
  });
}
