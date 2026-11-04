// LABS: what this reader adds beyond seedbible.org runs only while Settings → Labs is on. A Labs extension in the
// enabled set is not installed while Labs is off (none of its tools, providers, buttons or panes show), is listed
// under Extensions only then, and comes in and out as the switch moves; a plain extension is untouched.
import { describe, expect, it } from "vitest";
import { signal } from "@preact/signals";
import { memoryStores } from "../../../apps/reader-web/src/backend/offline/db";
import {
  createExtensionHost,
  type ExtensionRegistration,
} from "../../../apps/reader-web/src/extensions/host";
import type { ReaderState } from "../../../apps/reader-web/src/state";

const ext = (id: string, labs?: boolean): ExtensionRegistration => ({
  id,
  label: id,
  labs,
  *init(ctx) {
    yield ctx.tools.registerVerseTool({
      id: `${id}-tool`,
      label: id,
      icon: "star",
      onSelect: () => undefined,
    } as never);
    yield ctx.toolbar.add({
      id: `${id}-button`,
      icon: "star",
      label: id,
      onSelect: () => undefined,
    } as never);
  },
});

describe("Labs", () => {
  it("keeps a Labs extension out while off, brings it in when on, and leaves a plain one alone", async () => {
    const labs = signal(false);
    const host = createExtensionHost(memoryStores());
    host.register(ext("plain"));
    host.register(ext("story", true));
    const state = {
      ui: { pane: signal("none") },
      settings: { labs },
    } as unknown as ReaderState;
    await host.bind(state);
    expect([...host.enabled.value].sort()).toEqual(["plain", "story"]);
    expect(host.verseTools.value.map((t) => t.id)).toEqual(["plain-tool"]);
    expect(host.toolbarItems.value.map((t) => t.id)).toEqual(["plain-button"]);
    expect(host.visible.value.map((r) => r.id)).toEqual(["plain"]);

    labs.value = true;
    expect(host.verseTools.value.map((t) => t.id).sort()).toEqual([
      "plain-tool",
      "story-tool",
    ]);
    expect(host.visible.value.map((r) => r.id).sort()).toEqual([
      "plain",
      "story",
    ]);

    labs.value = false;
    expect(host.verseTools.value.map((t) => t.id)).toEqual(["plain-tool"]);
    expect(host.toolbarItems.value.map((t) => t.id)).toEqual(["plain-button"]);
    // Still enabled: turning Labs on again needs no reinstall from Settings.
    expect(host.enabled.value.has("story")).toBe(true);
  });

  it("installing a Labs extension from Settings while off waits for the switch", async () => {
    const labs = signal(false);
    const host = createExtensionHost(memoryStores());
    host.register({ ...ext("scrolls", true), defaultEnabled: false });
    await host.bind({
      ui: { pane: signal("none") },
      settings: { labs },
    } as unknown as ReaderState);
    await host.setEnabled("scrolls", true);
    expect(host.verseTools.value).toHaveLength(0);
    labs.value = true;
    expect(host.verseTools.value.map((t) => t.id)).toEqual(["scrolls-tool"]);
  });
});
