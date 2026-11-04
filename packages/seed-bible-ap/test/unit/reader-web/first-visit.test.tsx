// THE FIRST SCREEN, as seedbible.org has it (under jsdom, so the address moves as it does in a browser): the root address opens on Today (the Welcome card, for a new device);
// a chapter link opens its chapter with no pane over it.
import { describe, expect, it } from "vitest";
import { createTestReaderState } from "../../helpers/createTestReaderState";

describe("the first screen", () => {
  it("the root address opens on Today", async () => {
    const t = await createTestReaderState({ url: "/", identity: null });
    const stop = await t.state.start();
    // Opening the first tab moved the address to its chapter (a browser history, so this file runs under jsdom);
    // Today must still be what opened.
    expect(location.pathname).not.toBe("/");
    expect(t.state.tabs.tabs.value.length).toBeGreaterThan(0);
    expect(t.state.ui.pane.value).toBe("today");
    stop();
  });

  it("a chapter link opens its chapter, nothing over it", async () => {
    const t = await createTestReaderState({
      url: "/read/BSB/GEN/1",
      identity: null,
    });
    const stop = await t.state.start();
    expect(t.state.ui.pane.value).toBe("none");
    expect(t.state.reading.bookId.value).toBe("GEN");
    stop();
  });
});
