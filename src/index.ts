/**
 * scirender — Universal LaTeX & Chemistry content renderer
 *
 * Main entry point. Exports the core processor, web component,
 * standalone HTML generator, styles, and SMILES helpers.
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

// React web component
export { default as SciContent } from './web/SciContent';
export type { SciContentProps } from './web/SciContent';
