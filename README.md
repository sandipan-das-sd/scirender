# scirender

Universal **LaTeX**, **math**, and **chemistry** (SMILES / mhchem) content renderer for any platform.

Works with **React**, **React Native (Expo)**, **Flutter**, **Android WebView**, **iOS WKWebView**, and any environment that can render HTML.

Powered by [MathJax 3](https://www.mathjax.org/) and [SmilesDrawer](https://github.com/reymond-group/smilesDrawer).

---

## Features

- **LaTeX math** — inline (`$...$`, `\(...\)`) and display (`$$...$$`, `\[...\]`)
- **Chemistry** — SMILES molecular structures (7 input formats), `\ce{}` (mhchem), `\chemfig{}`, `\lewis{}{}`, `\bond{}`, `\ch{}`
- **Tables** — `\begin{tabular}` → HTML tables with border support
- **Figures** — `\includegraphics`, `\begin{figure}` with captions
- **Lists** — `\begin{enumerate}`, `\begin{itemize}`
- **Text formatting** — `\textbf`, `\textit`, `\underline`, `\textcolor`, `\colorbox`, `\textsc`, etc.
- **Spacing** — `\quad`, `\hspace`, `\vspace`, `\newline`, `\par`
- **Markdown images** — `![alt](url)` syntax
- **Currency protection** — `$100` won't be treated as math
- **Self-sizing** — Native WebView auto-resizes to content height

---

## Installation

```bash
npm install scirender
```

---

## Usage

### 1. React (Next.js / Vite / CRA)

Add MathJax CDN to your HTML head (or Next.js `_document` / `layout.tsx`):

```html
<script src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js" async></script>
<!-- Optional: for chemistry SMILES structures -->
<script src="https://unpkg.com/smiles-drawer@2.0.1/dist/smiles-drawer.min.js"></script>
```

Then use the component:

```tsx
import { SciContent } from 'scirender';

function MyPage() {
  return (
    <SciContent
      content="Find the roots of $x^2 - 5x + 6 = 0$"
      className="my-content"
    />
  );
}
```

### 2. React Native (Expo / bare RN)

Install the peer dependency:

```bash
npm install react-native-webview
```

```tsx
import { SciContentNative } from 'scirender/native';

function MyScreen() {
  return (
    <SciContentNative
      content="The structure of ethanol: <smiles>CCO</smiles>"
      theme="dark"
      fontSize={16}
    />
  );
}
```

### 3. Flutter / Android / iOS / iframe

Use `getHtml()` to generate a self-contained HTML string:

```ts
import { getHtml } from 'scirender';

const html = getHtml('Evaluate $$\\int_0^1 x^2 \\, dx$$', {
  theme: 'light',
  fontSize: 18,
});

// Load this HTML string in any WebView:
// Flutter: WebView(html: html)
// Android: webView.loadDataWithBaseURL(null, html, "text/html", "utf-8", null)
// iOS: webView.loadHTMLString(html, baseURL: nil)
```

### 4. Core processor only (no React)

```ts
import { processContent } from 'scirender';

const html = processContent('Solve $\\frac{d}{dx} x^n = nx^{n-1}$');
// Returns processed HTML string (still needs MathJax to typeset)
```

---

## Supported SMILES Formats

All 7 formats are supported for chemical structure input:

| Format | Example |
|--------|---------|
| `<smiles>CCO</smiles>` | XML-style |
| `[smiles]CCO[/smiles]` | BBCode-style |
| `<mol>CCO</mol>` | Molecule tag |
| `<molecule>CCO</molecule>` | Full molecule tag |
| `<chem>CCO</chem>` | Chemistry tag |
| `<reaction>CC>>CO</reaction>` | Reaction tag |
| `SMILES: CCO` | Labeled (own line) |

---

## Supported Chemistry Commands

| Command | Output |
|---------|--------|
| `\ce{H2O}` | Chemical formula (mhchem) |
| `\ch{H2SO4}` | chemformula → mhchem |
| `\chemfig{...}` | Structure placeholder |
| `\lewis{dots}{atom}` | Lewis dot notation |
| `\bond{single\|double\|triple}` | Bond symbols |
| `\arrow` | Reaction arrow → |
| `\begin{reaction}...\end{reaction}` | Reaction environment |
| `\begin{scheme}...\end{scheme}` | Scheme environment |

---

## API Reference

### `SciContent` (React web component)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `content` | `string` | required | Content with LaTeX/SMILES/etc |
| `className` | `string` | `''` | CSS class names |
| `style` | `CSSProperties` | — | Inline styles |
| `enableSmiles` | `boolean` | `true` | Enable SMILES rendering |
| `enableImages` | `boolean` | `true` | Enable image conversion |
| `enableTables` | `boolean` | `true` | Enable table conversion |

### `SciContentNative` (React Native component)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `content` | `string` | required | Content with LaTeX/SMILES/etc |
| `theme` | `'light' \| 'dark'` | `'dark'` | Color theme |
| `fontSize` | `number` | `16` | Base font size |
| `minHeight` | `number` | `100` | Minimum WebView height |
| `scrollEnabled` | `boolean` | `false` | Enable scroll inside WebView |
| `customCss` | `string` | — | Extra CSS to inject |

### `getHtml(content, options?)` → `string`

Returns a complete HTML document string. Options same as `SciContentNative` plus `title`, `mathjaxUrl`, `smilesDrawerUrl`.

### `processContent(text, options?)` → `string`

Pure function. Converts LaTeX markup to HTML. Does NOT typeset math — you still need MathJax in the browser.

---

## License

MIT
