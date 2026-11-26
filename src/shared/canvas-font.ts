/**
 * DM Sans with its optical size fixed at the site's 16 (type.css sets opsz with font-variation-settings, which canvas
 * text ignores; drawn large, the variable font would otherwise switch to its tighter display cut). Google Fonts' instance
 * pinned at opsz 16 (weights 100 to 1000), served from the site (public/fonts), is registered under its own name so it
 * never replaces the page's font.
 *
 * Used by canvas text that should match the HTML: the About stage's flying statements (think-zoom.ts) and the home
 * page's AI cards (ai.ts). Resolves to a CSS font-family list, falling back to the page's DM Sans if it can't load.
 */
let canvasFamily: Promise<string> | null = null;
export function loadCanvasFont() {
  canvasFamily ??= (async () => {
    try {
      const ranges = {
        'latin': 'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
        'latin-ext': 'U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C4, U+2113, U+2C60-2C7F, U+A720-A7FF',
      };
      for (const [subset, unicodeRange] of Object.entries(ranges)) {
        const face = new FontFace('DM Sans Canvas', `url(/fonts/dm-sans-16-${subset}.woff2) format('woff2')`, {
          weight: '100 1000',
          unicodeRange,
        });
        document.fonts.add(face);
      }
      await Promise.all(['400', '500', '700'].map((w) => document.fonts.load(`${w} 40px "DM Sans Canvas"`)));
      return "'DM Sans Canvas', 'DM Sans', sans-serif";
    } catch {
      return "'DM Sans', sans-serif";
    }
  })();
  return canvasFamily;
}
