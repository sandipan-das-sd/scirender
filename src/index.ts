/**
 * latex-content-renderer — Universal LaTeX & Chemistry content renderer
 *
 * Main entry point. Exports the core processor, web components (standard + streaming),
 * standalone HTML generator, styles, SMILES helpers, accessibility, streaming, and export utils.
 */

// Core (no framework dependency)
export { processContent } from './processContent';
export type { ProcessOptions } from './processContent';

// Standalone HTML generator (for Flutter, Android, iOS, iframe, etc.)
export { getHtml } from './getHtml';
export type { GetHtmlOptions } from './getHtml';

// Styles (CSS strings)
export { webStyles, nativeStyles } from './styles';

// SMILES rendering helper (browser only)
export { renderSmilesInContainer } from './smiles';

// Streaming support (for AI/LLM responses — ChatGPT, Claude, Gemini, etc.)
export {
  createStreamingState,
  feedChunk,
  flushStream,
} from './streaming';
export type { StreamingState } from './streaming';

// Accessibility utilities
export { addAccessibility } from './accessibility';
export type { A11yOptions } from './accessibility';

// Export utilities (LaTeX → SVG/HTML/DataURL)
export { latexToSvg, latexToHtmlString, latexToDataUrl } from './export';
export type { ExportOptions } from './export';

// React web component
export { default as SciContent } from './web/SciContent';
export type { SciContentProps } from './web/SciContent';

// React streaming web component (for AI/LLM responses)
export { default as SciContentStreaming } from './web/SciContentStreaming';
export type { SciContentStreamingProps } from './web/SciContentStreaming';
