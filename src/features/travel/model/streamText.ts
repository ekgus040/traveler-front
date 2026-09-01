/**
 * SSE 스트리밍 중 화면에 노출할 텍스트를 뽑아낸다.
 *
 * 배경(front#2 / mobility_rag #13):
 *   백엔드가 `bot_message` 청크로 JSON 문자열 자체를 흘려보내기 때문에,
 *   청크를 그대로 렌더하면 채팅창에 `{"bot_message": "...` 같은 원시 JSON이 노출된다.
 *
 * 동작:
 *   - 누적 문자열이 JSON처럼 보이면 → `bot_message` 필드 값만 증분 추출해서 반환
 *   - 그렇지 않으면(백엔드 #13 수정 후 순수 텍스트가 오는 경우) → 원문 그대로 반환
 *   즉 백엔드 수정 전후 모두 동작한다.
 */

const FENCE_PREFIX = /^\s*```(?:json)?\s*/;
const BOT_MESSAGE_KEY = '"bot_message"';

function stripFence(raw: string) {
  return raw.replace(FENCE_PREFIX, "");
}

/** 누적 문자열이 (부분적인) JSON 문서인지 판단 */
export function looksLikeJson(raw: string) {
  const trimmed = stripFence(raw).trimStart();
  return trimmed.startsWith("{") || trimmed.startsWith("[");
}

/** 미완성 이스케이프(끝의 홀수 개 백슬래시, 잘린 \uXXXX)를 잘라낸다 */
function trimIncompleteEscape(literal: string) {
  let result = literal.replace(/(?:^|[^\\])(?:\\\\)*\\u[0-9a-fA-F]{0,3}$/, (match) =>
    match.slice(0, match.lastIndexOf("\\u")),
  );
  const trailing = result.match(/\\+$/);
  if (trailing && trailing[0].length % 2 === 1) {
    result = result.slice(0, -1);
  }
  return result;
}

function decodeJsonStringLiteral(literal: string) {
  const safe = trimIncompleteEscape(literal);
  try {
    return JSON.parse(`"${safe}"`) as string;
  } catch {
    return safe
      .replace(/\\n/g, "\n")
      .replace(/\\t/g, "\t")
      .replace(/\\"/g, '"')
      .replace(/\\\\/g, "\\");
  }
}

/**
 * 누적 스트림에서 사용자에게 보여줄 텍스트를 반환한다.
 * JSON이지만 아직 `bot_message` 값이 시작되지 않았다면 빈 문자열(= 로딩 표시)을 반환한다.
 */
export function extractStreamingText(raw: string): string {
  if (!looksLikeJson(raw)) return raw;

  const source = stripFence(raw);
  const keyIndex = source.indexOf(BOT_MESSAGE_KEY);
  if (keyIndex === -1) return "";

  const colonIndex = source.indexOf(":", keyIndex + BOT_MESSAGE_KEY.length);
  if (colonIndex === -1) return "";

  let cursor = colonIndex + 1;
  while (cursor < source.length && /\s/.test(source[cursor])) cursor += 1;
  if (source[cursor] !== '"') return "";
  cursor += 1;

  let literal = "";
  while (cursor < source.length) {
    const character = source[cursor];
    if (character === "\\") {
      literal += source.slice(cursor, cursor + 2);
      cursor += 2;
      continue;
    }
    if (character === '"') break;
    literal += character;
    cursor += 1;
  }

  return decodeJsonStringLiteral(literal);
}
