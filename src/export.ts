/**
 * latex-content-renderer — Export utilities
 *
 * Convert LaTeX content to standalone SVG or HTML image strings.
 * Works in Node.js (via mathjax-full) or browser (via MathJax CDN).
 *
 * Browser: uses the already-loaded MathJax on the page.
 * Node.js: users must install `mathjax-full` as an optional peer dep.
 */

export interface ExportOptions {
  /** Output format (default: 'svg') */
  format?: 'svg' | 'html';
  /** Display mode — true for block equations, false for inline (default: true) */
  displayMode?: boolean;
  /** Font size in px for the output (default: 16) */
  fontSize?: number;
  /** Text color (default: '#000000') */
  color?: string;
}

/**
 * Convert a LaTeX math string to an SVG string (browser only).
 * Requires MathJax 3 to be loaded on the page.
 *
 * ```ts
 * const svg = await latexToSvg('E = mc^2');
 * document.getElementById('output').innerHTML = svg;
 * ```
 */
export async function latexToSvg(
  tex: string,
  options: ExportOptions = {}
): Promise<string> {
  const { displayMode = true, fontSize = 16, color = '#000000' } = options;

  const MathJax = (globalThis as any).MathJax;

  if (!MathJax?.tex2svg) {
    throw new Error(
      '[latex-content-renderer] MathJax with SVG output is required for latexToSvg(). ' +
      'Load https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-svg.js on your page.'
    );
  }

  const node = MathJax.tex2svg(tex, { display: displayMode });
  const svg = node.querySelector('svg');

  if (!svg) {
    throw new Error('[latex-content-renderer] MathJax did not produce SVG output.');
  }

  svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  svg.removeAttribute('aria-hidden');
  svg.setAttribute('role', 'img');
  svg.style.fontSize = `${fontSize}px`;
  svg.style.color = color;

  return svg.outerHTML;
}

/**
 * Convert a LaTeX math string to an HTML string (browser only).
 * Requires MathJax 3 with CHTML output.
 *
 * ```ts
 * const html = await latexToHtmlString('\\frac{a}{b}');
 * ```
 */
export async function latexToHtmlString(
  tex: string,
  options: ExportOptions = {}
): Promise<string> {
  const { displayMode = true, fontSize = 16, color = '#000000' } = options;

  const MathJax = (globalThis as any).MathJax;

  if (!MathJax?.tex2chtml) {
    throw new Error(
      '[latex-content-renderer] MathJax with CHTML output is required for latexToHtmlString(). ' +
      'Load https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js on your page.'
    );
  }

  const node = MathJax.tex2chtml(tex, { display: displayMode });
  node.style.fontSize = `${fontSize}px`;
  node.style.color = color;

  return node.outerHTML;
}

/**
 * Generate a standalone SVG data URL from LaTeX (browser only).
 * Useful for embedding in <img> tags or downloading.
 *
 * ```ts
 * const dataUrl = await latexToDataUrl('x^2 + y^2 = r^2');
 * // "data:image/svg+xml;base64,..."
 * ```
 */
export async function latexToDataUrl(
  tex: string,
  options: ExportOptions = {}
): Promise<string> {
  const svg = await latexToSvg(tex, options);
  const base64 = btoa(unescape(encodeURIComponent(svg)));
  return `data:image/svg+xml;base64,${base64}`;
}
