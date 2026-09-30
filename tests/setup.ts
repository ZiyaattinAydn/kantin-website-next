import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";

afterEach(() => {
  globalThis.document?.body?.replaceChildren();
});

// jsdom has no top-layer dialog implementation. Native behavior is also checked in browser QA.
if (typeof HTMLDialogElement !== "undefined") {
  HTMLDialogElement.prototype.showModal = function () {
    this.setAttribute("open", "");
  };
  HTMLDialogElement.prototype.close = function () {
    this.removeAttribute("open");
  };
  window.scrollTo = () => {};
}
