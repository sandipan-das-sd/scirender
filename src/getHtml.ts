/**
 * scirender — Standalone HTML generator
 *
 * Generates a complete, self-contained HTML document that renders LaTeX (via MathJax CDN),
 * SMILES chemistry (via SmilesDrawer CDN), tables, figures, and all supported formats.
 *
 * Use this for: Flutter WebView, Android WebView, iOS WKWebView, Electron, iframe —
 * any platform that can render an HTML string.
 */

import { processContent, ProcessOptions } from './processContent';
import { nativeStyles } from './styles';

export interface GetHtmlOptions extends ProcessOptions {
  /** Page title (default: '') */
  title?: string;
  /** Text color (default: '#ffffff') */
  textColor?: string;
  /** Background color (default: 'transparent') */
  backgroundColor?: string;
  /** Font size in px (default: 16) */
  fontSize?: number;
  /** Custom CSS to inject */
  customCss?: string;
  /** MathJax CDN URL (default: official CDN) */
  mathjaxUrl?: string;
  /** SmilesDrawer CDN URL (default: unpkg v2.0.1) */
  smilesDrawerUrl?: string;
  /**
   * Theme: 'light' | 'dark' (default: 'dark')
   * - light: black text on white/transparent background
   * - dark: white text on transparent background
   */
  theme?: 'light' | 'dark';
}

export function getHtml(content: string, options: GetHtmlOptions = {}): string {
  const {
    title = '',
    textColor,
    backgroundColor = 'transparent',
    fontSize = 16,
    customCss = '',
    mathjaxUrl = 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js',
    smilesDrawerUrl = 'https://unpkg.com/smiles-drawer@2.0.1/dist/smiles-drawer.min.js',
    theme = 'dark',
    ...processOptions
  } = options;

  const resolvedTextColor = textColor || (theme === 'dark' ? '#ffffff' : '#1a1a1a');
  const processed = processContent(content, processOptions);

  // Sanitize LaTeX to prevent MathJax stack overflow
  const sanitizedContent = sanitizeLatex(processed);

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0" />
  ${title ? `<title>${escapeHtml(title)}</title>` : ''}
  <script>
    window.MathJax = {
      loader: {
        load: ['[tex]/ams', '[tex]/boldsymbol', '[tex]/html', '[tex]/mhchem']
      },
      tex: {
        packages: {'[+]': ['ams', 'boldsymbol', 'html', 'mhchem']},
        inlineMath: [['$', '$'], ['\\\\(', '\\\\)']],
        displayMath: [['$$', '$$'], ['\\\\[', '\\\\]']],
        processEscapes: true,
        processEnvironments: true,
        macros: {
          boldsymbol: ['\\\\boldsymbol{#1}', 1]
        }
      },
      options: {
        skipHtmlTags: ['script', 'noscript', 'style', 'textarea', 'pre']
      },
      startup: {
        pageReady: () => {
          return MathJax.startup.defaultPageReady().then(() => {
            const images = document.querySelectorAll('img');
            const imagePromises = Array.from(images).map(img => {
              if (img.complete) return Promise.resolve();
              return new Promise((resolve) => {
                img.onload = resolve;
                img.onerror = resolve;
                setTimeout(resolve, 3000);
              });
            });
            Promise.all(imagePromises).then(() => {
              setTimeout(() => {
                const height = document.body.scrollHeight;
                if (window.ReactNativeWebView) {
                  window.ReactNativeWebView.postMessage(JSON.stringify({ height }));
                }
                // For Flutter & other WebView bridges
                if (window.FlutterChannel) {
                  window.FlutterChannel.postMessage(JSON.stringify({ height }));
                }
              }, 300);
            });
          }).catch((err) => {
            console.error('MathJax error:', err);
            setTimeout(() => {
              const height = document.body.scrollHeight;
              if (window.ReactNativeWebView) {
                window.ReactNativeWebView.postMessage(JSON.stringify({ height }));
              }
            }, 300);
          });
        }
      }
    };

    // Catch MathJax stack overflow errors
    window.addEventListener('error', function(event) {
      if (event.message && (
        event.message.includes('Maximum call stack') ||
        event.message.includes('tex-svg') ||
        event.message.includes('MathJax')
      )) {
        event.preventDefault();
        return false;
      }
    });
  </script>
  <script src="${escapeHtml(mathjaxUrl)}" id="MathJax-script" async></script>
  <script src="${escapeHtml(smilesDrawerUrl)}"></script>
  <script>
    // Render SMILES after library loads
    window.addEventListener('load', function() {
      setTimeout(() => {
        if (typeof SmilesDrawer === 'undefined' && typeof SmiDrawer === 'undefined') return;

        // Try v2 SmiDrawer.apply() first
        if (typeof SmiDrawer !== 'undefined') {
          try { SmiDrawer.apply(); return; } catch(e) {}
        }

        // Fallback: v1 canvas-based
        var canvases = document.querySelectorAll('canvas[data-smiles]');
        if (typeof SmilesDrawer !== 'undefined' && SmilesDrawer.parse) {
          canvases.forEach(function(canvas) {
            var smiles = canvas.getAttribute('data-smiles');
            SmilesDrawer.parse(smiles, function(tree) {
              new SmilesDrawer.Drawer({ width: 300, height: 200, bondThickness: 1.5 })
                .draw(tree, canvas, '${theme}', false);
            }, function() {});
          });
        }

        // Also handle img/svg data-smiles elements
        var elements = document.querySelectorAll('img[data-smiles], svg[data-smiles]');
        if (typeof SmiDrawer !== 'undefined' && elements.length) {
          try { SmiDrawer.apply(); } catch(e) {}
        }
      }, 800);
    });
  </script>
  <style>
    ${nativeStyles}
    body {
      color: ${resolvedTextColor};
      background: ${backgroundColor};
      font-size: ${fontSize}px;
    }
    ${theme === 'light' ? `
    mjx-container { color: #1a1a1a !important; }
    mjx-container * { color: #1a1a1a !important; }
    strong { color: #1a1a1a; }
    ` : ''}
    ${customCss}
  </style>
</head>
<body>
  <div class="scirender-content">${sanitizedContent}</div>
</body>
</html>`;
}

// ─── Helpers ───

function sanitizeLatex(text: string): string {
  let sanitized = text;
  sanitized = sanitized.replace(/\$\\und$/g, '$');
  sanitized = sanitized.replace(/\$\\underl$/g, '$');
  sanitized = sanitized.replace(/\$\\underli$/g, '$');
  sanitized = sanitized.replace(/\$\\underlin$/g, '$');
  sanitized = sanitized.replace(/\\$/g, '');
  return sanitized;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
