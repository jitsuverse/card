// 부품 키트 스크립트 공용 — 작은 서버, Chrome 실행, 왼쪽 옵션 바꾸기 (kit-check.mjs, kit-shot.mjs가 같이 쓴다)
import puppeteer from 'puppeteer-core';
import { createServer } from 'node:http';
import { readFileSync, existsSync } from 'node:fs';
import { join, extname, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

// --이름 값 / --플래그 형태의 인자 읽기
export function args(argv = process.argv.slice(2)) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    if (!argv[i].startsWith('--')) continue;
    const k = argv[i].slice(2), v = argv[i + 1];
    out[k] = v === undefined || v.startsWith('--') ? true : (i++, v);
  }
  return out;
}

// ES 모듈이라 file://로는 안 열려서, 실행하는 동안만 저장소 폴더를 작은 서버로 연다
export async function startServer() {
  const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png' };
  const server = createServer((req, res) => {
    const path = join(ROOT, decodeURIComponent(new URL(req.url, 'http://x').pathname).replace(/\/$/, '/index.html'));
    if (!path.startsWith(ROOT) || !existsSync(path)) { res.writeHead(404).end(); return; }
    res.writeHead(200, { 'Content-Type': TYPES[extname(path)] ?? 'application/octet-stream' }).end(readFileSync(path));
  });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  return { server, url: (deck = 'cards') => `http://127.0.0.1:${server.address().port}/kit/?deck=${deck}` };
}

export async function launch() {
  const chrome = [process.env.CHROME_PATH, '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/Applications/Chromium.app/Contents/MacOS/Chromium',
    '/usr/bin/google-chrome', '/usr/bin/google-chrome-stable', '/usr/bin/chromium', '/usr/bin/chromium-browser'].filter(Boolean).find((p) => existsSync(p));
  if (!chrome) { console.error('Chrome/Chromium 을 찾지 못했습니다. CHROME_PATH 환경변수로 경로를 지정하세요.'); process.exit(1); }
  // 탭 여러 개를 동시에 돌리므로 뒤쪽 탭의 타이머·렌더링을 늦추지 않게 한다
  return puppeteer.launch({ executablePath: chrome, headless: true, args: ['--disable-background-timer-throttling', '--disable-renderer-backgrounding', '--disable-backgrounding-occluded-windows'] });
}

// 왼쪽 옵션 패널을 실제로 눌러 바꾼다: { shape, shapeStyle, cardStyle, bookMockup, coverVisual, coverAlign, coverBg, font, dark, photo }
export async function setOptions(page, o) {
  await page.evaluate(async (o) => {
    const click = (id, v) => document.querySelector(`#${id} button[data-v="${v}"]`)?.click();
    if (o.photo) window.kitState.photo = true; // 사진 스타일 (패널에선 내 스타일 6번) — 아래 클릭으로 다시 그려진다
    for (const k of ['shape', 'shapeStyle', 'cardStyle', 'bookMockup', 'coverVisual', 'coverAlign', 'coverBg']) if (o[k]) click(k, o[k]);
    if (o.photo && !o.cardStyle) click('cardStyle', window.kitState.cardStyle); // 다시 그리기
    if (o.drop) await window.kitDrop(String(o.drop).split(',')); // 사진 자리 빼기 (교재·강사·사진 강조)
    if (o.font) for (const id of ['fontTitle', 'fontBody']) { const s = document.getElementById(id); if ([...s.options].some((x) => x.value === o.font)) { s.value = o.font; s.dispatchEvent(new Event('change')); } }
    if (o.dark) for (const [k, v] of [['bg', '#111318'], ['title', '#ffffff'], ['body', '#a7a9b2']]) { const i = document.querySelector(`input[data-color=${k}]`); i.value = v; i.dispatchEvent(new Event('input')); }
    await new Promise((r) => setTimeout(r, 600)); await document.fonts.ready; await new Promise((r) => setTimeout(r, 200));
  }, o);
}
