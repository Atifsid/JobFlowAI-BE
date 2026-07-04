import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";

// jsdom does not implement matchMedia. Several shadcn/ui primitives (e.g. the
// sidebar's useIsMobile hook) call it on mount, so tests that render them need
// a stub or they throw "window.matchMedia is not a function".
if (!window.matchMedia) {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  });
}

// jsdom does not implement ResizeObserver. cmdk's CommandList uses it to
// track content height, so any test that mounts a Command/CommandDialog
// needs a stub or it throws "ResizeObserver is not defined".
if (!window.ResizeObserver) {
  window.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}

afterEach(() => {
  cleanup();
});
