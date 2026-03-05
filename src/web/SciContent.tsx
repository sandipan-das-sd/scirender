/**
 * scirender — React web component
 *
 * Drop-in React component that renders LaTeX, math, SMILES chemistry,
 * tables, and all supported content formats. Uses MathJax (CDN) for
 * math typesetting and SmilesDrawer for chemical structures.
 *
 * Prerequisites: Include MathJax and (optionally) SmilesDrawer CDN scripts in your HTML:
 *   <script src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js" async></script>
 *   <script src="https://unpkg.com/smiles-drawer@2.0.1/dist/smiles-drawer.min.js"></script>
 *
 * Usage:
 *   import { SciContent } from 'scirender';
 *   <SciContent content="Solve $x^2 + 3x = 0$" />
 */

import React, { useEffect, useRef } from 'react';
import { processContent, ProcessOptions } from '../processContent';
import { renderSmilesInContainer } from '../smiles';
import { webStyles } from '../styles';

export interface SciContentProps extends ProcessOptions {
  /** The content string containing LaTeX, SMILES, etc. */
  content: string;
  /** Additional CSS class names */
  className?: string;
  /** Inline styles for the container div */
  style?: React.CSSProperties;
}

const SciContent: React.FC<SciContentProps> = ({
  content,
  className = '',
  style,
  ...processOptions
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const updateMath = async () => {
      const processed = processContent(content, processOptions);

      // Set content
      containerRef.current!.innerHTML = processed;

      // Wait for MathJax
      let attempts = 0;
      while (!(window as any).MathJax?.typesetPromise && attempts < 50) {
        await new Promise((resolve) => setTimeout(resolve, 100));
        attempts++;
      }

      const MathJax = (window as any).MathJax;

      if (MathJax?.typesetPromise) {
        try {
          await MathJax.typesetPromise([containerRef.current]);
        } catch (err) {
          console.error('[scirender] MathJax error:', err);
        }
      }

      // Render SMILES structures
      await renderSmilesInContainer(containerRef.current!);
    };

    updateMath();
  }, [content]);

  return (
    <>
      <style>{webStyles}</style>
      <div
        ref={containerRef}
        className={`scirender ${className}`.trim()}
        style={{ lineHeight: 1.6, ...style }}
      />
    </>
  );
};

export default SciContent;
