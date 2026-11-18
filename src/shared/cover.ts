/**
 * Whether the entry cover (the landing intro or the page transition) is still over the page. While it is, the page's
 * own animated backgrounds hold still: drawing them under a cover nobody can see through only took GPU time from the
 * intro itself, which then stuttered. boot.ts lifts it as the cover starts fading away.
 */
let up = true;
const waiting = new Set<() => void>();

/** True while covered; the callback (a render loop's kick) then runs once the cover lifts. */
export function covered(resume: () => void): boolean {
  if (!up) return false;
  waiting.add(resume);
  return true;
}

/** Resolves once the cover has lifted (at once if it already has). */
export function uncovered(): Promise<void> {
  return up ? new Promise((r) => waiting.add(r)) : Promise.resolve();
}

export function liftCover() {
  if (!up) return;
  up = false;
  const list = [...waiting];
  waiting.clear();
  list.forEach((fn) => fn());
}

/*
 * The cover fully gone (its animation finished, not just lifting): for set-up work heavy enough to stall a frame,
 * which would otherwise land mid-way through the transition and make its clouds jump. The intro and the page
 * transition mark it as they finish; boot.ts marks it anyway a little after the reveal, should they not.
 */
let gone = false;
const goneWaiting = new Set<() => void>();

export function coverGone(): Promise<void> {
  return gone ? Promise.resolve() : new Promise((r) => goneWaiting.add(r));
}

export function markCoverGone() {
  if (gone) return;
  gone = true;
  const list = [...goneWaiting];
  goneWaiting.clear();
  list.forEach((fn) => fn());
}
