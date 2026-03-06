/**
 * latex-content-renderer — Streaming React component
 *
 * A React component that incrementally renders LaTeX content as it streams
 * in from an LLM/AI API (ChatGPT, Claude, Gemini, etc.).
 *
 * It buffers incomplete math delimiters so partial equations don't break
 * the display, and re-typesets MathJax on each safe update.
 *
 * Usage:
 *   import { SciContentStreaming } from 'latex-content-renderer';
 *   <SciContentStreaming content={streamingText} isStreaming={true} />
 */

import React, { useEffect, useRef, useState } from 'react';
import { processContent, ProcessOptions } from '../processContent';
import { renderSmilesInContainer } from '../smiles';
import { webStyles } from '../styles';
import {
  createStreamingState,
  feedChunk,
  flushStream,
  StreamingState,
} from '../streaming';

export interface SciContentStreamingProps extends ProcessOptions {
  /** The current accumulated content string from the stream */
  content: string;
  /** Whether content is still streaming (default: false) */
  isStreaming?: boolean;
  /** Additional CSS class names */
  className?: string;
  /** Inline styles for the container div */
  style?: React.CSSProperties;
  /** Debounce interval in ms for re-rendering during stream (default: 100) */
  debounceMs?: number;
  /** Show a typing cursor while streaming (default: true) */
  showCursor?: boolean;
}

const SciContentStreaming: React.FC<SciContentStreamingProps> = ({
  content,
  isStreaming = false,
  className = '',
  style,
  debounceMs = 100,
  showCursor = true,
  ...processOptions
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef<StreamingState>(createStreamingState());
  const prevContentRef = useRef('');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    if (!containerRef.current) return;

    const doRender = async (text: string) => {
      const processed = processContent(text, processOptions);
      const cursorHtml = isStreaming && showCursor
        ? '<span class="scirender-cursor" aria-hidden="true">&#9646;</span>'
        : '';

      containerRef.current!.innerHTML = processed + cursorHtml;

      // Wait for MathJax
      let attempts = 0;
      while (!(window as any).MathJax?.typesetPromise && attempts < 50) {
        await new Promise((resolve) => setTimeout(resolve, 100));
        attempts++;
      }

      const MathJax = (window as any).MathJax;
      if (MathJax?.typesetPromise) {
        try {
          // Clear MathJax's internal cache for the container to force re-typeset
          if (MathJax.typesetClear) {
            MathJax.typesetClear([containerRef.current]);
          }
          await MathJax.typesetPromise([containerRef.current]);
        } catch (err) {
          // MathJax error on partial content is expected during streaming
        }
      }

      await renderSmilesInContainer(containerRef.current!);
    };

    // Compute the new chunk
    const newChunk = content.slice(prevContentRef.current.length);
    prevContentRef.current = content;

    let safeContent: string;
    if (isStreaming) {
      if (newChunk) {
        safeContent = feedChunk(stateRef.current, newChunk);
      } else {
        safeContent = stateRef.current.rendered;
      }
    } else {
      // Stream ended — flush everything
      stateRef.current.buffer = content;
      safeContent = flushStream(stateRef.current);
    }

    // Debounce rendering during streaming
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    if (isStreaming && debounceMs > 0) {
      timerRef.current = setTimeout(() => {
        doRender(safeContent);
      }, debounceMs);
    } else {
      doRender(safeContent);
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [content, isStreaming]);

  // Reset streaming state when content is cleared
  useEffect(() => {
    if (!content) {
      stateRef.current = createStreamingState();
      prevContentRef.current = '';
    }
  }, [content]);

  const cursorCss = showCursor
    ? `
    @keyframes scirender-blink {
      0%, 100% { opacity: 1; }
      50% { opacity: 0; }
    }
    .scirender-cursor {
      animation: scirender-blink 1s step-end infinite;
      color: inherit;
      font-size: 0.9em;
      margin-left: 2px;
    }
  `
    : '';

  return (
    <>
      <style>{webStyles}{cursorCss}</style>
      <div
        ref={containerRef}
        className={`scirender scirender-streaming ${className}`.trim()}
        style={{ lineHeight: 1.6, ...style }}
        aria-live={isStreaming ? 'polite' : undefined}
        aria-busy={isStreaming}
      />
    </>
  );
};

export default SciContentStreaming;
