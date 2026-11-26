/**
 * Whether the entry cover (the landing intro or the page transition) is still over the page. While it is, the page's
 * own animated backgrounds hold still: drawing them under a cover nobody can see through only took GPU time from the
 * intro itself, which then stuttered. boot.ts lifts it as the cover starts fading away.
 */
let up = true;
const waiting = new Set<() => void>();

/**
 * True while covered; the callback (a render loop's kick) then runs once the cover lifts. `overlay`: the loop draws
 * on the open mobile menu itself, so only the entry cover holds it, not the menu.
 */
export function covered(resume: () => void, overlay = false): boolean {
  if (!up && (overlay || !pageHidden)) return false;
  waiting.add(resume);
  return true;
}

/*
 * The open mobile menu hides the whole page behind an opaque panel: its animated backgrounds hold still underneath
 * (the same hold as under the entry cover) and pick up again as the menu starts to close.
 */
let pageHidden = false;
export function hidePage(on: boolean) {
  if (pageHidden === on) return;
  pageHidden = on;
  if (on || up) return;
  const list = [...waiting];
  waiting.clear();
  list.forEach((fn) => fn());
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

/*
 * Set-up that stalls the GPU the first time it runs (a ScrollTrigger refresh straight after arriving cost a full second
 * on a Mac): done while the page transition's cover is still opaque, before its clouds move, where the stall only
 * lengthens the wait on white. The transition waits for it (up to a limit) before it starts.
 */
let phase: 'still' | 'moving' = 'still';
const prep: Promise<unknown>[] = [];
let bootDone: () => void = () => {};
const booted = new Promise<void>((r) => (bootDone = r));

/** boot.ts: the page's own set-up has run, so every underCover task is registered. */
export function markBooted() {
  bootDone();
}

/**
 * Runs `run` once `ready` resolves: under the still cover if it gets there in time, otherwise once the cover is fully
 * gone (never while it is moving). `hold`: the transition waits for it (up to its limit); without, it only runs under
 * the cover if it happens to be ready before the cover moves.
 */
export function underCover(ready: Promise<unknown>, run: () => void, hold = true) {
  if (gone || phase === 'moving') {
    Promise.all([ready, coverGone()]).then(run);
    return;
  }
  const task = ready.then(() => (phase === 'still' && !gone ? run() : coverGone().then(run)));
  if (hold) prep.push(task);
}

/** The transition, before it moves: waits for underCover tasks (at most `cap` ms), then nothing more joins them. */
export function settleUnderCover(cap: number): Promise<void> {
  const limit = new Promise<void>((r) => window.setTimeout(r, cap));
  return Promise.race([booted.then(() => Promise.all(prep)), limit]).then(() => {
    phase = 'moving';
  });
}

/** The landing intro starts moving at once: nothing waits under it. */
export function coverMoving() {
  phase = 'moving';
}
