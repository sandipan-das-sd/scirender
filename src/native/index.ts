/**
 * scirender/native — React Native entry point
 */

// Re-export core utils (useful for RN consumers too)
export { processContent } from '../processContent';
export type { ProcessOptions } from '../processContent';
export { getHtml } from '../getHtml';
export type { GetHtmlOptions } from '../getHtml';

// React Native component
export { default as SciContentNative } from './SciContentNative';
export type { SciContentNativeProps } from './SciContentNative';
