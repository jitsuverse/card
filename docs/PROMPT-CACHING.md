# 홈페이지 이식 후: 프롬프트 캐싱으로 토큰 비용 줄이기

홈페이지에서 Claude API로 카드뉴스를 만들 때 쓴다. 디자인 결과는 바뀌지 않는다 — Claude가 읽는 내용은 똑같고, **매번 똑같이 보내는 앞부분을 다시 계산하지 않을 뿐**이다.

## 무엇을 캐시하나

요청마다 똑같은 것 = 캐시, 요청마다 다른 것 = 캐시 뒤에 둔다.

| 순서 | 내용 | 캐시 |
|---|---|---|
| 1 | 디자인 규칙 (`CLAUDE.md`의 '디자인 규칙'·'B. 부품 키트로 만들기') | ✅ |
| 2 | 부품 목록 `kit/PARTS.md`  | ✅ ← 여기에 캐시 표시 |
| 3 | 부품 도감 그림 `kit/gallery/*.png` (첫 사용자 메시지 맨 앞) | ✅ ← 여기에 캐시 표시 |
| 4 | 이번 요청: 학원 이름·주제·내용·옵션 | ✗ |

- 캐시는 **앞에서부터 글자 하나까지 똑같아야** 맞는다. 날짜·사용자 이름·요청 내용처럼 바뀌는 것을 1~3 앞이나 사이에 넣으면 캐시가 매번 깨진다.
- 규칙 문서를 고치면 그다음 요청 한 번은 캐시를 새로 만든다(정상).

## 비용 감각 (기본 입력 단가 대비)

- 캐시 읽기: **약 0.1배** — 반복해서 읽는 규칙·부품 목록 비용이 약 90% 줄어든다.
- 캐시 만들기: 5분 캐시 약 1.25배, 1시간 캐시 약 2배 (처음 한 번).
- 5분 안에 다음 요청이 오면 캐시가 이어진다. 사용자가 카드를 보고 고치는 데 5분 넘게 걸리는 화면이면 `ttl: '1h'`가 낫다.
- 모델마다 캐시되는 최소 길이(대략 1천~4천 토큰)가 있다 — 규칙 + 부품 목록 + 도감이면 넉넉히 넘는다.
- 정확한 단가·최소 길이는 Anthropic 문서 'Prompt caching'에서 확인한다.

## 코드 예시 (Node, `@anthropic-ai/sdk`)

```js
import Anthropic from '@anthropic-ai/sdk';
import { readFileSync } from 'node:fs';

const client = new Anthropic();
const RULES = readFileSync('card/CLAUDE.md', 'utf8');   // 이식할 때는 디자인 규칙 부분만 잘라 둔 파일
const PARTS = readFileSync('card/kit/PARTS.md', 'utf8');
const gallery = ['science', 'writing'].map((n) => ({
  type: 'image',
  source: { type: 'base64', media_type: 'image/png', data: readFileSync(`card/kit/gallery/${n}.png`).toString('base64') },
}));

export async function makeDeck(request) {
  const res = await client.messages.create({
    model: 'claude-opus-5-5',
    max_tokens: 16000,
    system: [
      { type: 'text', text: RULES },
      { type: 'text', text: PARTS, cache_control: { type: 'ephemeral', ttl: '1h' } },  // 1·2 캐시
    ],
    messages: [{
      role: 'user',
      content: [
        ...gallery,
        { type: 'text', text: '위 그림은 부품 도감이다.', cache_control: { type: 'ephemeral', ttl: '1h' } },  // 3 캐시
        { type: 'text', text: request },  // 4 이번 요청 — 캐시 뒤
      ],
    }],
  });
  // 캐시가 맞았는지: cache_read_input_tokens가 0보다 크면 캐시에서 읽은 것
  console.log(res.usage.cache_creation_input_tokens, res.usage.cache_read_input_tokens, res.usage.input_tokens);
  return res;
}
```

## 확인 방법

- 첫 요청: `cache_creation_input_tokens`가 크고 `cache_read_input_tokens`는 0.
- 두 번째 요청부터: `cache_read_input_tokens`가 크고 `input_tokens`는 이번 요청 내용만큼 작다.
- 두 번째에도 read가 0이면, 1~3 사이에 매번 바뀌는 내용이 끼어 있지 않은지 본다.

## 콘텐츠 타입별 예시 덱 (2026-10-16 — 예시 덱이 늘어도 비용이 그대로이게)

예시 덱을 **전부** 프롬프트에 넣으면 덱이 늘 때마다 모든 생성 비용이 같이 오른다(예시 21벌 ≈ 6만~7만 토큰). 대신 `kit/examples/deck-types.json`의 표대로 **기준 덱 + 그 콘텐츠 타입 덱 1~2벌만** 넣는다(타입마다 예시 약 1만 2천 토큰 이하).

- 키: 홈페이지 DB `content_type` 코드(`exam_analysis` · `seminar_promo` 등). 표에 없는 타입은 `fallback`.
- `notForPrompt`: 비교용·점검용 덱 — 프롬프트에 넣지 않는다(깃허브 사본에서도 뺀다).
- 새 덱을 만들면 이 표에 한 줄 더한다. 부품 목록(PARTS.md)은 지금처럼 전부 넣는다 — 다른 덱의 부품도 설명을 보고 쓸 수 있다.

**캐시 순서** — 모든 타입이 같은 앞부분을 같이 쓰게, 캐시 표시를 두 곳에:

| 순서 | 내용 | 캐시 |
|---|---|---|
| 1 | 디자인 규칙 · 앱 규칙 · 부품 목록 (모든 타입 같음) | ✅ 표시 1 — 모든 학원·타입이 같이 씀 |
| 2 | 예시 덱: always + 그 타입 덱 (타입마다 다름) | ✅ 표시 2 — 같은 타입끼리 같이 씀 |
| 3 | 이번 카드 요청(학원 이름·섹션 내용) | ✗ |

```js
import TYPES from '…/examples/deck-types.json';
const pick = (type) => [...new Set([...TYPES.always, ...(TYPES.types[type] ?? TYPES.fallback)])];
// system = [규칙, 앱 규칙, { 부품 목록, cache_control: 1h }, { pick(type) 예시 덱들, cache_control: 1h }]
```

**어림 비용** (Sonnet 5.5, 덱 10장 = 10번 호출, 1달러 1,400원 — 실제 값은 홈페이지 `logAiUsage` 기록으로 확인):

| | 예시 전부 (지금 키트 21벌) | 타입별 (이 표) |
|---|---|---|
| 매번 보내는 앞부분 | 약 9만~10만 토큰 | 약 3만 토큰 |
| 덱 하나 | 약 $0.95 (1,300원) | 약 $0.55 (770원) |

캐시 읽기·저장 단가는 위 '비용 감각'. 카드 내용 입력·출력(약 $0.36)은 어느 쪽이든 같다.
