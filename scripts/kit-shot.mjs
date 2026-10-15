// 부품 키트 카드 사진 찍기 — 바뀐 카드만, 작게 찍어서 확인 토큰을 줄인다.
// 사용법: node scripts/kit-shot.mjs [--ids a,f] [--deck cards] [--scale 0.5] [--out 폴더] [--sheet 시트.png] [--cols 5]
//                                  [--dark] [--photo] [--drop g-book,h-teacher] [--cardStyle panel] [--shape rounded] [--shapeStyle shadow] [--font 폰트id] [--coverAlign center] [--coverBg main]
//   --ids    찍을 카드 id (빼면 전부)          --scale  1080×1440 기준 배율 (기본 0.5 → 540×720)
//   --sheet  여러 장을 id 라벨과 함께 한 장으로 모은 시트 (이미지 확인은 시트 한 장만 보면 된다)
//   찍으면서 넘침도 숫자로 알려 준다.
import { mkdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { args, startServer, launch, setOptions } from './kit-lib.mjs';

const a = args();
const deck = a.deck ?? 'cards', scale = +(a.scale ?? 0.5), cols = +(a.cols ?? 5);
const out = resolve(a.out ?? join(tmpdir(), 'kit-shot'));
mkdirSync(out, { recursive: true });
const want = a.ids ? String(a.ids).split(',') : null;

const { server, url } = await startServer();
const browser = await launch();
const page = await browser.newPage();
await page.setViewport({ width: 2600, height: 1600, deviceScaleFactor: scale });
const errs = [];
page.on('pageerror', (e) => errs.push(e.message));
await page.goto(url(deck), { waitUntil: 'networkidle0' });
await setOptions(page, a);
await page.addStyleTag({ content: '.frame>.kcard{transform:none!important}.frame{width:auto!important;height:auto!important}' });
await new Promise((r) => setTimeout(r, 300));

const ids = (await page.evaluate(() => [...document.querySelectorAll('.kcard')].map((c) => c.id))).filter((id) => !want || want.includes(id));
const over = await page.evaluate((ids) => ids.map((id) => { const b = document.getElementById(id).querySelector('.k-body'); const d = b ? b.scrollHeight - b.clientHeight : 0; return d > 1 ? `${id} ${d}px` : ''; }).filter(Boolean), ids);
const shots = [];
for (const id of ids) {
  const path = join(out, `${deck.replace(/\//g, '-')}-${id}.png`);
  const data = await (await page.$('#' + id)).screenshot({ encoding: 'base64' });
  writeFileSync(path, Buffer.from(data, 'base64'));
  shots.push({ id, data, path });
}

if (a.sheet) { // 시트: id 라벨을 붙여 격자로 모은 한 장
  const w = Math.round(1080 * scale), h = Math.round(1440 * scale);
  const sheet = await browser.newPage();
  await sheet.setViewport({ width: Math.min(cols, shots.length) * (w + 12) + 12, height: 400, deviceScaleFactor: 1 });
  await sheet.setContent(`<body style="margin:0;padding:12px;background:#888;display:grid;grid-template-columns:repeat(${Math.min(cols, shots.length)},${w}px);gap:12px;font:600 ${Math.max(14, 40 * scale)}px sans-serif">`
    + shots.map((s) => `<figure style="margin:0;position:relative"><img src="data:image/png;base64,${s.data}" style="width:${w}px;height:${h}px;display:block"><figcaption style="position:absolute;left:0;top:0;background:#111;color:#fff;padding:2px 10px">${s.id}</figcaption></figure>`).join('') + '</body>');
  await sheet.screenshot({ path: resolve(a.sheet), fullPage: true });
}

await browser.close();
server.close();
console.log(`${shots.length}장 → ${a.sheet ? resolve(a.sheet) : out}`);
console.log(`넘침: ${over.length ? over.join(', ') : '없음'}${errs.length ? `\n페이지 오류: ${errs.join(' | ')}` : ''}`);
