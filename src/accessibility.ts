/**
 * latex-content-renderer — Accessibility utilities
 *
 * Adds ARIA labels, roles, and screen-reader-friendly markup to rendered
 * scientific content. Makes math, chemistry, tables, and figures accessible.
 */

export interface A11yOptions {
  /** Add aria-label to math containers (default: true) */
  labelMath?: boolean;
  /** Add aria-label to chemistry structures (default: true) */
  labelChemistry?: boolean;
  /** Add role and aria attributes to tables (default: true) */
  labelTables?: boolean;
  /** Add alt text to generated images (default: true) */
  labelImages?: boolean;
  /** Language for screen reader hints (default: 'en') */
  lang?: string;
}

/**
 * Enhance processed HTML with accessibility attributes.
 * Call this AFTER processContent() but before inserting into the DOM.
 */
export function addAccessibility(html: string, options: A11yOptions = {}): string {
  const {
    labelMath = true,
    labelChemistry = true,
    labelTables = true,
    labelImages = true,
  } = options;

  let result = html;

  if (labelMath) {
    result = addMathAccessibility(result);
  }

  if (labelChemistry) {
    result = addChemistryAccessibility(result);
  }

  if (labelTables) {
    result = addTableAccessibility(result);
  }

  if (labelImages) {
    result = addImageAccessibility(result);
  }

  return result;
}

function addMathAccessibility(html: string): string {
  let result = html;

  // Add aria-label to display math blocks ($$...$$)
  result = result.replace(
    /\$\$([\s\S]*?)\$\$/g,
    (_match, tex: string) => {
      const label = texToDescription(tex.trim());
      return `<span role="math" aria-label="${escapeAttr(label)}" class="scirender-a11y-math">$$${tex}$$</span>`;
    }
  );

  // Add aria-label to inline math ($...$)
  result = result.replace(
    /\$([^$]+?)\$/g,
    (_match, tex: string) => {
      // Skip currency
      if (/^\d/.test(tex)) return _match;
      const label = texToDescription(tex.trim());
      return `<span role="math" aria-label="${escapeAttr(label)}" class="scirender-a11y-math">$${tex}$</span>`;
    }
  );

  // \(...\) inline
  result = result.replace(
    /\\\(([\s\S]*?)\\\)/g,
    (_match, tex: string) => {
      const label = texToDescription(tex.trim());
      return `<span role="math" aria-label="${escapeAttr(label)}" class="scirender-a11y-math">\\(${tex}\\)</span>`;
    }
  );

  // \[...\] display
  result = result.replace(
    /\\\[([\s\S]*?)\\\]/g,
    (_match, tex: string) => {
      const label = texToDescription(tex.trim());
      return `<span role="math" aria-label="${escapeAttr(label)}" class="scirender-a11y-math">\\[${tex}\\]</span>`;
    }
  );

  return result;
}

function addChemistryAccessibility(html: string): string {
  let result = html;

  // SMILES containers
  result = result.replace(
    /<div class="scirender-smiles([^"]*)">/g,
    '<div class="scirender-smiles$1" role="img" aria-label="Chemical structure diagram">'
  );

  // Chemistry structure placeholders
  result = result.replace(
    /<span class="scirender-chem-struct"/g,
    '<span class="scirender-chem-struct" role="img"'
  );

  return result;
}

function addTableAccessibility(html: string): string {
  let result = html;

  // Add role="table" to tables
  result = result.replace(
    /<table /g,
    '<table role="table" aria-label="Data table" '
  );

  return result;
}

function addImageAccessibility(html: string): string {
  let result = html;

  // Ensure all images without alt get a generic one
  result = result.replace(
    /<img ([^>]*)alt=""([^>]*)>/g,
    '<img $1alt="Scientific content image"$2>'
  );

  return result;
}

/**
 * Convert a TeX string to a rough human-readable description for screen readers.
 * This is a best-effort heuristic — not a full TeX parser.
 */
function texToDescription(tex: string): string {
  let desc = tex;

  // Common math operations
  desc = desc.replace(/\\frac\{([^}]*)\}\{([^}]*)\}/g, '($1) over ($2)');
  desc = desc.replace(/\\sqrt\[([^\]]*)\]\{([^}]*)\}/g, '$1th root of $2');
  desc = desc.replace(/\\sqrt\{([^}]*)\}/g, 'square root of $1');
  desc = desc.replace(/\\int_?\{?([^}]*)\}?\^?\{?([^}]*)\}?/g, 'integral from $1 to $2');
  desc = desc.replace(/\\sum_?\{?([^}]*)\}?\^?\{?([^}]*)\}?/g, 'sum from $1 to $2');
  desc = desc.replace(/\\prod_?\{?([^}]*)\}?\^?\{?([^}]*)\}?/g, 'product from $1 to $2');
  desc = desc.replace(/\\lim_?\{?([^}]*)\}?/g, 'limit as $1');

  // Greek letters
  desc = desc.replace(/\\alpha/g, 'alpha');
  desc = desc.replace(/\\beta/g, 'beta');
  desc = desc.replace(/\\gamma/g, 'gamma');
  desc = desc.replace(/\\delta/g, 'delta');
  desc = desc.replace(/\\epsilon/g, 'epsilon');
  desc = desc.replace(/\\theta/g, 'theta');
  desc = desc.replace(/\\lambda/g, 'lambda');
  desc = desc.replace(/\\mu/g, 'mu');
  desc = desc.replace(/\\pi/g, 'pi');
  desc = desc.replace(/\\sigma/g, 'sigma');
  desc = desc.replace(/\\omega/g, 'omega');
  desc = desc.replace(/\\phi/g, 'phi');
  desc = desc.replace(/\\psi/g, 'psi');
  desc = desc.replace(/\\rho/g, 'rho');
  desc = desc.replace(/\\tau/g, 'tau');
  desc = desc.replace(/\\chi/g, 'chi');
  desc = desc.replace(/\\eta/g, 'eta');
  desc = desc.replace(/\\zeta/g, 'zeta');
  desc = desc.replace(/\\xi/g, 'xi');
  desc = desc.replace(/\\Delta/g, 'Delta');
  desc = desc.replace(/\\Sigma/g, 'Sigma');
  desc = desc.replace(/\\Omega/g, 'Omega');
  desc = desc.replace(/\\Pi/g, 'Pi');
  desc = desc.replace(/\\Phi/g, 'Phi');
  desc = desc.replace(/\\Psi/g, 'Psi');
  desc = desc.replace(/\\Gamma/g, 'Gamma');
  desc = desc.replace(/\\Lambda/g, 'Lambda');
  desc = desc.replace(/\\Theta/g, 'Theta');

  // Operators and relations
  desc = desc.replace(/\\times/g, ' times ');
  desc = desc.replace(/\\cdot/g, ' dot ');
  desc = desc.replace(/\\div/g, ' divided by ');
  desc = desc.replace(/\\pm/g, ' plus or minus ');
  desc = desc.replace(/\\mp/g, ' minus or plus ');
  desc = desc.replace(/\\leq/g, ' less than or equal to ');
  desc = desc.replace(/\\geq/g, ' greater than or equal to ');
  desc = desc.replace(/\\neq/g, ' not equal to ');
  desc = desc.replace(/\\approx/g, ' approximately ');
  desc = desc.replace(/\\equiv/g, ' equivalent to ');
  desc = desc.replace(/\\infty/g, 'infinity');
  desc = desc.replace(/\\partial/g, 'partial');
  desc = desc.replace(/\\nabla/g, 'nabla');
  desc = desc.replace(/\\forall/g, 'for all');
  desc = desc.replace(/\\exists/g, 'there exists');
  desc = desc.replace(/\\in/g, ' in ');
  desc = desc.replace(/\\rightarrow/g, ' arrow ');
  desc = desc.replace(/\\leftarrow/g, ' left arrow ');
  desc = desc.replace(/\\Rightarrow/g, ' implies ');

  // Chemistry
  desc = desc.replace(/\\ce\{([^}]*)\}/g, 'chemical formula $1');

  // Superscript/subscript
  desc = desc.replace(/\^{([^}]*)}/g, ' to the power of $1');
  desc = desc.replace(/\^(\w)/g, ' to the power of $1');
  desc = desc.replace(/_{([^}]*)}/g, ' sub $1');
  desc = desc.replace(/_(\w)/g, ' sub $1');

  // Clean up remaining backslash commands
  desc = desc.replace(/\\[a-zA-Z]+/g, '');
  desc = desc.replace(/[{}]/g, '');
  desc = desc.replace(/\s+/g, ' ');

  return desc.trim() || 'mathematical expression';
}

function escapeAttr(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
