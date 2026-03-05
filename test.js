// Generate self-contained test HTML using scirender's getHtml()
const { processContent, getHtml } = require('./dist/index.js');

const testCases = [
  {
    title: '1. Inline Math',
    input: 'The quadratic formula is $x = \\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}$ and Einstein\'s equation $E=mc^2$.'
  },
  {
    title: '2. Display Math (Block Equations)',
    input: '$$\\int_{0}^{\\infty} e^{-x^2} dx = \\frac{\\sqrt{\\pi}}{2}$$\n\n\\[\\sum_{n=1}^{\\infty} \\frac{1}{n^2} = \\frac{\\pi^2}{6}\\]'
  },
  {
    title: '3. Chemistry — mhchem (\\ce)',
    input: 'Combustion: $\\ce{2H2 + O2 -> 2H2O}$\n\nEquilibrium: $\\ce{N2 + 3H2 <=> 2NH3}$\n\nWith states: $\\ce{AgCl(s) <=> Ag+(aq) + Cl-(aq)}$'
  },
  {
    title: '4. SMILES Chemical Structures',
    input: 'Benzene:\n[SMILES]C1=CC=CC=C1[/SMILES]\n\nAcetic Acid:\n[SMILES]CC(=O)O[/SMILES]\n\nCyclohexane:\n[SMILES]C1CCCCC1[/SMILES]'
  },
  {
    title: '5. LaTeX Tables (tabular)',
    input: '\\begin{tabular}{|c|c|c|}\n\\hline\nElement & Symbol & Atomic No. \\\\\n\\hline\nHydrogen & H & 1 \\\\\nCarbon & C & 6 \\\\\nOxygen & O & 8 \\\\\n\\hline\n\\end{tabular}'
  },
  {
    title: '6. Text Formatting',
    input: '\\textbf{Bold text}, \\textit{italic text}, \\underline{underlined text}, \\texttt{monospace text}, and \\emph{emphasized text}.'
  },
  {
    title: '7. LaTeX Lists',
    input: '\\begin{enumerate}\n\\item First item with math: $a^2 + b^2 = c^2$\n\\item Second item\n\\item Third item\n\\end{enumerate}\n\n\\begin{itemize}\n\\item Bullet one\n\\item Bullet two\n\\end{itemize}'
  },
  {
    title: '8. Mixed Content (Math + Chemistry + Text)',
    input: 'In thermodynamics, the Gibbs free energy is given by:\n$$\\Delta G = \\Delta H - T\\Delta S$$\nFor the reaction $\\ce{2H2(g) + O2(g) -> 2H2O(l)}$, we can calculate $\\Delta G$ using \\textbf{standard formation values}.\n\nThe equilibrium constant relates to Gibbs energy: $\\Delta G^\\circ = -RT\\ln K$'
  }
];

// Test processContent first
console.log('\\n=== Testing processContent() ===');
let passed = 0;
testCases.forEach((tc, i) => {
  try {
    const result = processContent(tc.input);
    if (result && result.length > 0) {
      console.log(`  ✓ ${tc.title}`);
      passed++;
    } else {
      console.log(`  ✗ ${tc.title} — empty result`);
    }
  } catch (e) {
    console.log(`  ✗ ${tc.title} — ${e.message}`);
  }
});
console.log(`\\n  Result: ${passed}/${testCases.length} passed\\n`);

// Build combined content for the visual test page
const allContent = testCases.map(tc => {
  return `<div style="background:#1e293b;border:1px solid #334155;border-radius:12px;padding:20px;margin-bottom:20px;">
<h2 style="color:#38bdf8;font-size:16px;margin:0 0 6px 0;">${tc.title}</h2>
<p style="font-size:12px;color:#64748b;margin:0 0 4px 0;">Input:</p>
<pre style="background:#0f172a;border:1px solid #334155;border-radius:8px;padding:10px;font-size:13px;color:#94a3b8;margin:0 0 12px 0;overflow-x:auto;white-space:pre-wrap;">${tc.input.replace(/</g,'&lt;').replace(/>/g,'&gt;')}</pre>
<div style="background:#ffffff;border-radius:8px;padding:16px;color:#1e293b;min-height:40px;">${processContent(tc.input)}</div>
</div>`;
}).join('\n');

const header = `<div style="text-align:center;margin-bottom:30px;">
<h1 style="color:#38bdf8;margin:0 0 10px 0;">scirender Test Page</h1>
<p style="color:#94a3b8;font-size:14px;">Testing <a href="https://www.npmjs.com/package/scirender" style="color:#38bdf8;">scirender@1.0.0</a> — processContent() output rendered in browser</p>
<p style="color:#22c55e;font-size:18px;margin-top:15px;">processContent() — ${passed}/${testCases.length} tests passed ✓</p>
</div>`;

const fullContent = header + allContent;

// Generate self-contained HTML using getHtml
const html = getHtml(fullContent, {
  title: 'scirender Test Page',
  theme: 'dark',
  fontSize: 15,
  customCss: `
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 900px; margin: 0 auto; padding: 20px; }
    table { border-collapse: collapse; margin: 8px 0; }
    td, th { border: 1px solid #cbd5e1; padding: 6px 10px; }
    img { max-width: 100%; }
    canvas { background: #fff; border-radius: 4px; }
    a { color: #38bdf8; }
  `
});

// Write the HTML file
const fs = require('fs');
const path = require('path');
const outPath = path.join(__dirname, 'test-output.html');
fs.writeFileSync(outPath, html, 'utf8');
console.log(`Test page written to: ${outPath}`);
console.log('Open test-output.html in your browser to see the visual results!');
