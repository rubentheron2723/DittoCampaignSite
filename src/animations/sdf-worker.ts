import { sdfField } from './sdf';

/** Builds distance fields off the main thread (see sdf.ts): the About stage posts each statement's coverage here. */
self.onmessage = (e: MessageEvent<{ id: number; title: Uint8Array; body: Uint8Array; w: number; h: number; spread: number }>) => {
  const { id, title, body, w, h, spread } = e.data;
  const field = sdfField(title, body, w, h, spread);
  (self as unknown as Worker).postMessage({ id, field }, [field.buffer]);
};
