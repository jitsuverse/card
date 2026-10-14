// 강사 사진 배경 제거(누끼): Google MediaPipe 사람 분할 모델(Apache 2.0)로 사람만 남기고 배경을 투명하게 만든다.
// 브라우저에서 실행한다. 모델·라이브러리는 첫 사용 때 CDN에서 받는다.

const VERSION = '0.10.14';
const BASE = `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${VERSION}`;
// selfie_multiclass: 배경 / 머리카락 / 몸 피부 / 얼굴 피부 / 옷 / 기타 — 0번(배경) 확률만 쓴다
const MODEL = 'https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_multiclass_256x256/float32/latest/selfie_multiclass_256x256.tflite';

let segmenterPromise = null;

function getSegmenter() {
  segmenterPromise ??= (async () => {
    const { FilesetResolver, ImageSegmenter } = await import(`${BASE}/vision_bundle.mjs`);
    const fileset = await FilesetResolver.forVisionTasks(`${BASE}/wasm`);
    return ImageSegmenter.createFromOptions(fileset, {
      baseOptions: { modelAssetPath: MODEL, delegate: 'CPU' },
      runningMode: 'IMAGE',
      outputConfidenceMasks: true,
      outputCategoryMask: false,
    });
  })();
  return segmenterPromise;
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('이미지를 불러오지 못했습니다'));
    img.src = src;
  });
}

const smoothstep = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

// src(이미지 주소) → 배경이 투명한 PNG data URL. 사람 영역에 맞춰 잘라 여백을 정리한다.
export async function removeBackground(src) {
  const img = await loadImage(src);
  const segmenter = await getSegmenter();
  const result = segmenter.segment(img);
  const bgMask = result.confidenceMasks[0];
  const mask = bgMask.getAsFloat32Array();
  const mw = bgMask.width, mh = bgMask.height;

  const w = img.naturalWidth, h = img.naturalHeight;
  const canvas = document.createElement('canvas');
  canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0);
  const data = ctx.getImageData(0, 0, w, h);
  let minX = w, minY = h, maxX = -1, maxY = -1;
  for (let y = 0; y < h; y++) {
    const my = Math.min(mh - 1, Math.floor((y * mh) / h));
    for (let x = 0; x < w; x++) {
      const mx = Math.min(mw - 1, Math.floor((x * mw) / w));
      const person = 1 - mask[my * mw + mx];
      const alpha = smoothstep(0.35, 0.65, person); // 경계를 부드럽게
      data.data[(y * w + x) * 4 + 3] = Math.round(alpha * 255);
      if (alpha > 0.2) { if (x < minX) minX = x; if (x > maxX) maxX = x; if (y < minY) minY = y; if (y > maxY) maxY = y; }
    }
  }
  result.close();
  if (maxX < 0) throw new Error('사진에서 사람을 찾지 못했습니다');
  ctx.putImageData(data, 0, 0);

  // 사람 영역 + 약간의 여백으로 잘라내기
  const pad = Math.round(Math.max(w, h) * 0.02);
  const cx = Math.max(0, minX - pad), cy = Math.max(0, minY - pad);
  const cw = Math.min(w, maxX + pad) - cx, ch = Math.min(h, maxY + pad) - cy;
  const out = document.createElement('canvas');
  out.width = cw; out.height = ch;
  out.getContext('2d').drawImage(canvas, cx, cy, cw, ch, 0, 0, cw, ch);
  return out.toDataURL('image/png');
}
