/**
 * scirender — SMILES rendering utilities
 *
 * Handles rendering SMILES chemical structures via SmilesDrawer (v2 and v1 fallback).
 * Works in any browser environment where SmilesDrawer is loaded via CDN.
 */

declare global {
  interface Window {
    SmiDrawer?: any;
    SmilesDrawer?: any;
  }
}

/**
 * Wait for SmilesDrawer to be available on window, then render all
 * `[data-smiles]` elements inside the given container.
 */
export async function renderSmilesInContainer(container: HTMLElement): Promise<void> {
  const smilesElements = container.querySelectorAll<HTMLElement>(
    'img[data-smiles], svg[data-smiles]'
  );
  if (smilesElements.length === 0) return;

  // Wait for SmiDrawer global
  let attempts = 0;
  while (!window.SmiDrawer && attempts < 80) {
    await new Promise((resolve) => setTimeout(resolve, 150));
    attempts++;
  }

  const SmiDrawer = window.SmiDrawer;

  if (!SmiDrawer) {
    console.warn('[scirender] SmiDrawer library not loaded after waiting');
    smilesElements.forEach((el) =>
      showSmilesFallback(el, el.getAttribute('data-smiles') || '')
    );
    return;
  }

  // ─── Method 1: SmiDrawer.apply() — recommended v2 approach ───
  try {
    SmiDrawer.apply();
    await new Promise((resolve) => setTimeout(resolve, 300));
    let allRendered = true;
    smilesElements.forEach((el) => {
      if (el.tagName === 'IMG') {
        const img = el as HTMLImageElement;
        if (!img.src || img.src === window.location.href || img.naturalWidth === 0) {
          allRendered = false;
        }
      } else if (el.tagName === 'svg' || el.tagName === 'SVG') {
        if (!el.innerHTML || el.innerHTML.trim() === '') {
          allRendered = false;
        }
      }
    });
    if (allRendered) return;
  } catch {
    // apply() failed or not available
  }

  // ─── Method 2: new SmiDrawer instance + sd.draw() per element ───
  try {
    const moleculeOpts = {
      bondThickness: 1.0,
      bondLength: 15,
      shortBondLength: 0.85,
      fontSizeLarge: 6,
      fontSizeSmall: 4,
      padding: 20,
      explicitHydrogens: false,
      terminalCarbons: false,
      compactDrawing: true,
    };
    const sd = new SmiDrawer(moleculeOpts, {});

    smilesElements.forEach((el) => {
      const smiles = el.getAttribute('data-smiles') || '';
      if (!smiles) return;
      try {
        sd.draw(smiles, `#${el.id}`, 'light');
      } catch (drawErr) {
        console.warn('[scirender] SmiDrawer.draw() failed for', smiles, drawErr);
        showSmilesFallback(el, smiles);
      }
    });
    return;
  } catch {
    // Instance creation failed
  }

  // ─── Method 3: v1 fallback (SmilesDrawer.parse + Drawer) ───
  const SDv1 = window.SmilesDrawer;
  if (SDv1?.parse) {
    smilesElements.forEach((el) => {
      const smiles = el.getAttribute('data-smiles') || '';
      if (!smiles || !el.parentElement) return;
      const canvas = document.createElement('canvas');
      canvas.width = 280;
      canvas.height = 200;
      canvas.style.cssText = 'max-width:100%;border-radius:6px;background:#fff';
      el.parentElement.replaceChild(canvas, el);
      SDv1.parse(
        smiles,
        (tree: any) => {
          new SDv1.Drawer({ width: 280, height: 200, bondThickness: 1 }).draw(
            tree,
            canvas,
            'light',
            false
          );
        },
        () => showSmilesFallback(canvas, smiles)
      );
    });
  } else {
    smilesElements.forEach((el) =>
      showSmilesFallback(el, el.getAttribute('data-smiles') || '')
    );
  }
}

function showSmilesFallback(el: HTMLElement, smiles: string): void {
  const parent = el.parentElement;
  if (parent) {
    parent.innerHTML = `<code style="font-size:0.9em;padding:4px 8px;border:1px dashed currentColor;border-radius:4px;display:inline-block" title="SMILES notation">${smiles}</code>`;
  }
}
