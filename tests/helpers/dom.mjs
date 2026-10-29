import { JSDOM } from 'jsdom';

export function createDom(t, html) {
  const dom = new JSDOM(html, { url: 'https://example.org/', pretendToBeVisual: true });
  const descriptors = new Map();
  for (const name of ['window', 'document', 'Element', 'HTMLDialogElement', 'CSS']) {
    descriptors.set(name, Object.getOwnPropertyDescriptor(globalThis, name));
    Object.defineProperty(globalThis, name, {
      configurable: true,
      value: name === 'CSS' ? { escape: (id) => id.replace(/[^a-zA-Z0-9_-]/g, '\\$&') } : dom.window[name],
    });
  }
  t.after(() => {
    dom.window.close();
    for (const [name, descriptor] of descriptors) {
      if (descriptor) Object.defineProperty(globalThis, name, descriptor);
      else delete globalThis[name];
    }
  });
  return dom.window;
}
