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
