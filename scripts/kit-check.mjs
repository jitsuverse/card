// 부품 키트(kit/) 자동 검사 — 카드를 고치거나 부품을 추가한 뒤 실행한다.
//   1. cards.html에 글자 크기를 직접 쓰지 않았는지
//   2. 폰트 전부(제목·본문 전용 폰트는 다른 쪽을 Pretendard로) × 본문 카드 배경 4종(단색·흰 판·위아래 나눔·테두리 판)에서
//      - 도식이 영역을 넘치지 않는지
//      - 모든 글자가 5단계 크기(assets/config.js TYPOGRAPHY.size) 중 하나인지
//      - 자간이 -3%(TYPOGRAPHY.letterSpacing), 줄간격이 130%·150%(큰 숫자만 110%)인지
//      - 페이지 오류가 없는지
//   3. 둥근 사각형(기본 도형 모양)에서 칠한 도형이 각진 채로 남지 않았는지
//   4. 글자 색이 굵기와 짝인지 — 세미볼드 이상 = 제목 컬러, 보통 = 본문 컬러 (메인 컬러·메인 위 흰 글자는 제외)
//   5. 제목 폰트는 카드 제목과 큰 숫자(항목 제목 크기 이상 숫자)에만 쓰였는지
// 사용법: node scripts/kit-check.mjs [--quick] [--deck examples/science] [--all]
//   --jobs N 동시에 여는 브라우저 탭 수 (기본 8 — 전체 검사 약 15초)
//   --quick  Pretendard 한 가지 폰트만 (약 5초 — 만드는 중에는 이것만, 전체 검사는 마지막에 한 번)
//   --deck   검사할 카드 묶음 (기본 cards = kit/cards.html)     --all  cards + kit/examples/*.html 전부
//   실패하면 카드별로 묶어서 '어떻게 고치면 되는지'를 같이 알려 준다.
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { FONTS, TITLE_FONTS, BODY_FONTS, TYPOGRAPHY } from '../assets/config.js';
import { ROOT, args, startServer, launch } from './kit-lib.mjs';

const opt = args();
const quick = !!opt.quick;
const problems = [];

const DECKS = opt.all ? ['cards', ...readdirSync(join(ROOT, 'kit/examples')).filter((f) => f.endsWith('.html')).map((f) => `examples/${f.slice(0, -5)}`)] : [opt.deck ?? 'cards'];
// 1. 카드에 글자 크기 직접 쓰기 금지 — 부품 역할(kit.css 맨 아래 '글자 크기' 목록)로만 정한다
for (const deck of DECKS) for (const m of readFileSync(join(ROOT, `kit/${deck}.html`), 'utf8').matchAll(/font-size\s*:[^;"]*/g)) problems.push(`[${deck}] ${deck}.html에 글자 크기 직접 지정: ${m[0]}`);

const { server, url } = await startServer();
const browser = await launch();
// 브라우저 탭 여러 개로 나눠 동시에 검사한다 (--jobs, 기본 4) — 덱마다 폰트를 탭 수만큼 나누고, 덱 전체 검사(모서리·색·폰트 쓰임)는 첫 몫이 맡는다
const JOBS = Math.max(1, +(opt.jobs ?? 8));
async function newPage() {
  const page = await browser.newPage();
  await page.setViewport({ width: 1600, height: 1000 });
  page.on('pageerror', (e) => problems.push(`페이지 오류: ${e.message}`));
  return page;
}

const SIZES = Object.values(TYPOGRAPHY.size).map((v) => `${v}px`);
const LS = parseFloat(TYPOGRAPHY.letterSpacing); // em 단위 (-0.03)
const LHS = [TYPOGRAPHY.lineHeightTitle, TYPOGRAPHY.lineHeightBody, 1.1].map((v) => v.toFixed(2));
const fonts = quick ? FONTS.slice(0, 1) : FONTS;
let count = 0;
async function checkDeck(page, deck, fonts, deckWide) {
  await page.goto(url(deck), { waitUntil: 'networkidle0' });
  for (const font of fonts) {
    for (const card of ['solid', 'panel', 'split', 'outline']) {
      const canTitle = TITLE_FONTS.some((f) => f.id === font.id), canBody = BODY_FONTS.some((f) => f.id === font.id);
      const found = await page.evaluate(async (font, card, SIZES, LS, LHS, canTitle, canBody) => {
        for (const [id, ok] of [['fontTitle', canTitle], ['fontBody', canBody]]) { const s = document.getElementById(id); s.value = ok ? font : 'pretendard'; s.dispatchEvent(new Event('change')); } // 제목·본문 전용 폰트는 다른 쪽을 기본 폰트로
        document.querySelector(`#cardStyle button[data-v="${card}"]`).click();
        await new Promise((r) => setTimeout(r, 600)); await document.fonts.ready; await new Promise((r) => setTimeout(r, 200));
        const out = [];
        for (const c of document.querySelectorAll('.kcard')) {
          const body = c.querySelector('.k-body');
          const over = body ? body.scrollHeight - body.clientHeight : 0;
          if (over > 1) out.push(`${c.id} 카드 ${over}px 넘침`);
          for (const e of c.querySelectorAll('*')) {
            if (![...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())) continue; // 글자를 직접 가진 요소만
            const fs = getComputedStyle(e).fontSize;
            if (!SIZES.includes(fs)) out.push(`${c.id} 카드 "${e.textContent.trim().slice(0, 10)}" 글자 크기 ${fs} (5단계 밖)`);
            const cs = getComputedStyle(e), px = parseFloat(fs), name = `${c.id} 카드 "${e.textContent.trim().slice(0, 10)}"`;
            const ls = cs.letterSpacing === 'normal' ? 0 : parseFloat(cs.letterSpacing) / px;
            if (Math.abs(ls - LS) > 0.002) out.push(`${name} 자간 ${(ls * 100).toFixed(1)}% (기준 ${(LS * 100).toFixed(0)}%)`);
            const lh = cs.lineHeight === 'normal' ? 'normal' : (parseFloat(cs.lineHeight) / px).toFixed(2);
            if (!LHS.includes(lh)) out.push(`${name} 줄간격 ${lh} (130%·150%, 큰 숫자 110%만)`);
          }
        }
        return out;
      }, font.id, card, SIZES, LS, LHS, canTitle, canBody);
      found.forEach((f) => problems.push(`[${deck}] ${font.label}/${card}: ${f}`));
      count++;
    }
  }
  if (!deckWide) return;
  // 3. 둥근 사각형: 바탕색·그림자가 있는 도형은 모서리가 둥글어야 한다
  //    (둥근 틀이 잘라 주는 안쪽 칸, 이어진 띠로 쓰는 비교표 강조 열 가운데 칸, 책·사진·SVG 내부는 제외)
  await page.evaluate(async () => {
    for (const id of ['fontTitle', 'fontBody']) { const s = document.getElementById(id); s.value = 'pretendard'; s.dispatchEvent(new Event('change')); } // 굵기가 다 있는 기본 폰트로
    document.querySelector('#shape button[data-v="rounded"]').click();
    document.querySelector('#cardStyle button[data-v="solid"]').click();
    await new Promise((r) => setTimeout(r, 600));
  });
  const square = await page.evaluate(() => {
    const out = new Set();
    const clipped = (e) => { for (let a = e.parentElement; a && !a.matches('.kcard'); a = a.parentElement) { const cs = getComputedStyle(a); if (cs.overflow === 'hidden' && parseFloat(cs.borderTopLeftRadius) > 0) return true; } return false; };
    document.querySelectorAll('.kcard *').forEach((e) => {
      const cs = getComputedStyle(e), r = e.getBoundingClientRect();
      if (cs.backgroundColor === 'rgba(0, 0, 0, 0)' && cs.boxShadow === 'none') return;
      if (r.width < 20 || r.height < 20 || e.closest('.card-paper, .book-item, svg, .k-matrix') || clipped(e)) return;
      if (parseFloat(cs.borderTopLeftRadius) === 0 && parseFloat(cs.borderBottomRightRadius) === 0) out.add(`${e.closest('.kcard').id} 카드 .${[...e.classList].join('.') || e.tagName.toLowerCase()} 모서리가 각짐 (둥근 사각형 옵션)`);
    });
    return [...out];
  });
  square.forEach((f) => problems.push(`[${deck}] ${f}`));
  const colorBad = await page.evaluate(() => {
    const probe = (v) => { const d = document.createElement('i'); d.style.color = `var(${v})`; document.querySelector('.kcard').append(d); const c = getComputedStyle(d).color; d.remove(); return c; };
    const T = probe('--title'), B = probe('--body'), M = probe('--main'), W = probe('--on-main');
    const out = new Set();
    document.querySelectorAll('.kcard *').forEach((e) => {
      if (![...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())) return;
      if (e.closest('.cover-icon, .k-tip, .book-item, .photo, .profile-figure, .ov')) return; // 아이콘·팁·사진 자리 안내·사진 위 글자 제외
      const cs = getComputedStyle(e), w = +cs.fontWeight, c = cs.color;
      if (c === M || c === W) return;
      if ((w >= 600 && c !== T) || (w < 600 && c !== B)) out.add(`${e.closest('.kcard').id} 카드 "${e.textContent.trim().slice(0, 10)}" ${w >= 600 ? '굵은 글자인데 제목 컬러 아님' : '보통 글자인데 본문 컬러 아님'}`);
    });
    return [...out];
  });
  colorBad.forEach((f) => problems.push(`[${deck}] ${f}`));
  // 5. 제목 폰트 쓰임: 제목을 나눔명조, 본문을 Pretendard로 두고 명조로 나온 글자를 확인
  await page.evaluate(async () => {
    const t = document.getElementById('fontTitle'); t.value = 'nanum-myeongjo'; t.dispatchEvent(new Event('change'));
    await new Promise((r) => setTimeout(r, 800));
  });
  const fontBad = await page.evaluate(() => {
    const out = new Set();
    document.querySelectorAll('.kcard *').forEach((e) => {
      if (![...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())) return;
      if (!getComputedStyle(e).fontFamily.includes('Nanum Myeongjo')) return;
      const text = e.textContent.trim(), big = parseFloat(getComputedStyle(e).fontSize) >= 46 && /\d/.test(text);
      if (!e.matches('.title, .k-title') && !big) out.add(`${e.closest('.kcard').id} 카드 "${text.slice(0, 10)}" 제목 폰트인데 카드 제목·큰 숫자가 아님`);
    });
    return [...out];
  });
  fontBad.forEach((f) => problems.push(`[${deck}] ${f}`));
}
const tasks = [];
for (const deck of DECKS) { const k = Math.min(JOBS, fonts.length); for (let j = 0; j < k; j++) tasks.push([deck, fonts.filter((_, i) => i % k === j), j === 0]); }
const pages = await Promise.all(Array.from({ length: Math.min(JOBS, tasks.length) }, newPage));
let next = 0;
await Promise.all(pages.map(async (page) => { while (next < tasks.length) await checkDeck(page, ...tasks[next++]); }));
await browser.close();
server.close();

// 결과 정리: 같은 문제는 조합마다 반복되므로 카드별로 묶고, 고치는 방법을 붙인다
const HINTS = [
  [/넘침/, '넘침 → 그 카드의 줄·항목 수를 줄이거나, 부품의 세로 여백(padding·gap·height)을 "최대"값 이상 줄인다. 글자 높이가 큰 폰트(해바라기·에스코어 드림)에서 먼저 넘친다.'],
  [/5단계 밖/, '글자 크기 → kit.css 맨 아래 "글자 크기" 목록에 그 부품 선택자를 역할(heading·body·caption)에 맞게 넣는다. px 직접 지정 금지.'],
  [/글자 크기 직접/, '직접 지정 → cards.html의 font-size를 지우고 부품 역할(kit.css "글자 크기" 목록)로 정한다.'],
  [/자간/, '자간 → 그 부품의 letter-spacing을 지운다(.kcard *가 var(--ls)를 준다).'],
  [/줄간격/, '줄간격 → kit.css 맨 아래 "줄간격" 목록에 넣는다(제목·라벨 --lh-title, 본문 --lh-body, 큰 숫자 1.1).'],
  [/각짐/, '모서리 → 큰 도형은 border-radius: var(--r-lg), 알약·칩은 var(--r-sm). 동그라미 표식은 50%.'],
  [/제목 컬러 아님/, '굵은 글자 색 → color: var(--title) (강조 한 곳이면 var(--main)). 선택자가 :not()으로 빠졌는지 확인.'],
  [/본문 컬러 아님/, '보통 글자 색 → color: var(--body), 라벨 역할이면 굵기를 var(--title-weight)로.'],
  [/제목 폰트인데/, '제목 폰트 → kit.css의 font-family: var(--font-title) 목록에서 그 요소를 뺀다(카드 제목·46 이상 큰 숫자만).'],
  [/페이지 오류/, '페이지 오류 → main.js 빌더가 읽는 data-* 속성 값을 확인한다.'],
];
if (problems.length) {
  const over = new Map(), other = new Map();
  for (const p of new Set(problems)) {
    const m = p.match(/^\[(.+?)\] (.+?): (\S+) 카드 (\d+)px 넘침$/);
    if (m) { const k = `[${m[1]}] ${m[3]} 카드`; (over.get(k) ?? over.set(k, []).get(k)).push([m[2], +m[4]]); continue; }
    const n = p.match(/^\[(.+?)\] (.+?\/\w+): (.+)$/); // [덱] 폰트/배경: 내용 → 내용별로 묶기
    const k = n ? `[${n[1]}] ${n[3]}` : p;
    other.set(k, (other.get(k) ?? 0) + 1);
  }
  const lines = [
    ...[...over].map(([k, v]) => { v.sort((x, y) => y[1] - x[1]); return `${k} 넘침 — 최대 ${v[0][1]}px, ${v.length}개 조합 (${v.slice(0, 3).map(([c, px]) => `${c} ${px}px`).join(', ')}${v.length > 3 ? ' …' : ''})`; }),
    ...[...other].map(([k, n]) => (n > 1 ? `${k} (${n}개 조합)` : k)),
  ];
  const hints = HINTS.filter(([re]) => lines.some((l) => re.test(l))).map(([, h]) => h);
  console.error(`부품 키트 검사 실패 (${lines.length}건)\n- ${lines.join('\n- ')}\n\n고치는 방법\n- ${hints.join('\n- ')}`);
  process.exit(1);
}
console.log(`부품 키트 검사 통과 [${DECKS.join(', ')}]: ${count}가지 조합(폰트 ${fonts.length} × 배경 4${DECKS.length > 1 ? ` × 덱 ${DECKS.length}` : ''}) — 넘침 없음, 글자 크기 5단계, 자간·줄간격 기준, 도형 모서리, 글자 색, 제목 폰트 쓰임, 오류 없음`);
