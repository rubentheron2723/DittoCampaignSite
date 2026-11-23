/**
 * DM Sans with its optical size fixed at the site's 16 (type.css sets opsz with font-variation-settings, which canvas
 * text ignores; drawn large, the variable font would otherwise switch to its tighter display cut). Google Fonts serves
 * an instance pinned at one opsz; it is registered under its own name so it never replaces the page's font.
 *
 * Used by canvas text that should match the HTML: the About stage's flying statements (think-zoom.ts) and the home
 * page's AI cards (ai.ts). Resolves to a CSS font-family list, falling back to the page's DM Sans if it can't load.
 */
let canvasFamily: Promise<string> | null = null;
export function loadCanvasFont() {
  canvasFamily ??= (async () => {
    try {
      const css = await (await fetch('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@16,400;16,500;16,700&display=block')).text();
      const style = document.createElement('style');
      style.textContent = css.replace(/font-family: 'DM Sans'/g, "font-family: 'DM Sans Canvas'");
      document.head.appendChild(style);
      await Promise.all(['400', '500', '700'].map((w) => document.fonts.load(`${w} 40px "DM Sans Canvas"`)));
      return "'DM Sans Canvas', 'DM Sans', sans-serif";
    } catch {
      return "'DM Sans', sans-serif";
    }
  })();
  return canvasFamily;
}
