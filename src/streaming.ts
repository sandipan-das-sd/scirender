/**
 * latex-content-renderer — Streaming support for AI/LLM responses
 *
 * Handles incremental rendering of LaTeX content as it streams in from
 * ChatGPT, Claude, Gemini, or any LLM API. Buffers incomplete math
 * delimiters and only renders complete expressions.
 */

export interface StreamingState {
  /** Accumulated raw text so far */
  buffer: string;
  /** Last rendered (safe) content */
  rendered: string;
  /** Whether we're inside an incomplete math delimiter */
  pendingMath: boolean;
}

/**
 * Create a new streaming state for tracking incremental content.
 */
export function createStreamingState(): StreamingState {
  return {
    buffer: '',
    rendered: '',
    pendingMath: false,
  };
}

/**
 * Feed a new chunk of text from a streaming LLM response.
 * Returns the safe-to-render content (complete math expressions only).
 *
 * Usage with ChatGPT/Claude streaming:
 * ```ts
 * const state = createStreamingState();
 * for await (const chunk of stream) {
 *   const safeContent = feedChunk(state, chunk);
 *   // Render safeContent with SciContent or processContent
 * }
 * const final = flushStream(state);
 * ```
 */
export function feedChunk(state: StreamingState, chunk: string): string {
  state.buffer += chunk;
  state.rendered = extractSafeContent(state.buffer);
  state.pendingMath = hasIncompleteMath(state.buffer);
  return state.rendered;
}

/**
 * Flush the stream — return all remaining content (call when stream ends).
 */
export function flushStream(state: StreamingState): string {
  state.rendered = state.buffer;
  state.pendingMath = false;
  return state.rendered;
}

/**
 * Extract safe-to-render content by trimming incomplete math delimiters
 * from the end of the buffer.
 */
function extractSafeContent(text: string): string {
  let safe = text;

  // Check for unclosed display math $$
  const dollars = countUnescaped(safe, '$$');
  if (dollars % 2 !== 0) {
    const lastIdx = safe.lastIndexOf('$$');
    safe = safe.substring(0, lastIdx);
  }

  // Check for unclosed inline math $
  // (after removing all $$)
  const withoutDisplay = safe.replace(/\$\$/g, '__DD__');
  const singles = countUnescaped(withoutDisplay, '$');
  if (singles % 2 !== 0) {
    const lastIdx = findLastUnpairedDollar(safe);
    if (lastIdx >= 0) {
      safe = safe.substring(0, lastIdx);
    }
  }

  // Check for unclosed \( ... \)
  const openParen = (safe.match(/\\\(/g) || []).length;
  const closeParen = (safe.match(/\\\)/g) || []).length;
  if (openParen > closeParen) {
    const lastIdx = safe.lastIndexOf('\\(');
    safe = safe.substring(0, lastIdx);
  }

  // Check for unclosed \[ ... \]
  const openBracket = (safe.match(/\\\[/g) || []).length;
  const closeBracket = (safe.match(/\\\]/g) || []).length;
  if (openBracket > closeBracket) {
    const lastIdx = safe.lastIndexOf('\\[');
    safe = safe.substring(0, lastIdx);
  }

  // Check for unclosed \begin{...} without matching \end{...}
  const begins = safe.match(/\\begin\{([^}]+)\}/g) || [];
  const ends = safe.match(/\\end\{([^}]+)\}/g) || [];
  if (begins.length > ends.length) {
    const lastBegin = safe.lastIndexOf('\\begin{');
    safe = safe.substring(0, lastBegin);
  }

  return safe;
}

function hasIncompleteMath(text: string): boolean {
  return extractSafeContent(text) !== text;
}

function countUnescaped(text: string, delimiter: string): number {
  let count = 0;
  let idx = 0;
  while ((idx = text.indexOf(delimiter, idx)) !== -1) {
    if (idx === 0 || text[idx - 1] !== '\\') {
      count++;
    }
    idx += delimiter.length;
  }
  return count;
}

function findLastUnpairedDollar(text: string): number {
  // Skip $$ pairs, find the last unpaired single $
  let i = text.length - 1;
  while (i >= 0) {
    if (text[i] === '$') {
      if (i > 0 && text[i - 1] === '$') {
        i -= 2; // skip $$
        continue;
      }
      if (i > 0 && text[i - 1] === '\\') {
        i--;
        continue;
      }
      // Check if this $ is preceded by a digit (currency like $100)
      if (i + 1 < text.length && /\d/.test(text[i + 1])) {
        i--;
        continue;
      }
      return i;
    }
    i--;
  }
  return -1;
}
