// THE FIRST VISIT, as the old reader has it: the tour offer in the corner over a readable chapter, answered once on a
// device; Take the tour starts the introduction; No, thanks closes it and nothing follows (Install App is a Settings
// row, as on seedbible.org); an embed never shows any of it.
import { afterEach, describe, expect, it } from "vitest";
import { act } from "preact/test-utils";
import { fireEvent, waitFor } from "@testing-library/preact";
import {
  Onboarding,
  ONBOARDING_KEY,
} from "../../apps/reader-web/src/components/chrome/Onboarding";
import {
  installPrompt,
  type InstallPromptEvent,
} from "../../apps/reader-web/src/state/chrome/fullScreen";
import { createTestReaderState } from "../helpers/createTestReaderState";
import { renderInHost } from "../helpers/TestHost";

const OFFER = "Welcome to Seed Bible. Would you like a tutorial?";
const flush = () =>
  act(async () => {
    await new Promise((res) => setTimeout(res, 0));
  });

afterEach(() => {
  document.body.innerHTML = "";
  installPrompt.value = null;
});

describe("the first visit", () => {
  it("offers the tour in the corner, whether signed in or not, and Take the tour starts it", async () => {
    const t = await createTestReaderState({});
    const r = renderInHost(<Onboarding state={t.state} />);
    await waitFor(() => expect(r.queryByText(OFFER)).not.toBeNull());
    expect(r.getByRole("dialog").getAttribute("aria-modal")).toBe("false");

    fireEvent.click(r.getByRole("button", { name: /take the tour/i }));
    await waitFor(() =>
      expect(t.state.tours.active.value?.id).toBe("introduction")
    );
    expect(r.queryByText(OFFER)).toBeNull();
    expect(await t.stores.prefs.get(ONBOARDING_KEY)).toBeTruthy();
  });

  it("No, thanks closes it for good; with nothing to install, nothing follows", async () => {
    const t = await createTestReaderState({ identity: null });
    const r = renderInHost(<Onboarding state={t.state} />);
    await waitFor(() => expect(r.queryByText(OFFER)).not.toBeNull());
    fireEvent.click(r.getByRole("button", { name: /no, thanks/i }));
    await waitFor(() => expect(r.queryByText(OFFER)).toBeNull());
    expect(r.queryByRole("dialog")).toBeNull();
    expect(t.state.tours.active.value).toBeNull();
    expect(await t.stores.prefs.get(ONBOARDING_KEY)).toBeTruthy();

    const again = renderInHost(<Onboarding state={t.state} />);
    await flush();
    expect(again.queryByText(OFFER)).toBeNull();
  });

  it("after No, thanks, nothing follows even where the browser could install (Install App lives in Settings)", async () => {
    installPrompt.value = {
      prompt: async () => undefined,
      userChoice: Promise.resolve({ outcome: "dismissed" as const }),
    } as unknown as InstallPromptEvent;
    const t = await createTestReaderState({ identity: null });
    const r = renderInHost(<Onboarding state={t.state} />);
    await waitFor(() => expect(r.queryByText(OFFER)).not.toBeNull());
    fireEvent.click(r.getByRole("button", { name: /no, thanks/i }));
    await waitFor(() => expect(r.queryByText(OFFER)).toBeNull());
    await flush();
    expect(r.queryByRole("button", { name: /install app/i })).toBeNull();
    expect(r.queryByRole("dialog")).toBeNull();
  });

  it("waits while the Welcome card is up, and comes up once the chapter is on screen", async () => {
    const t = await createTestReaderState({ identity: null });
    t.state.ui.pane.value = "today";
    const r = renderInHost(<Onboarding state={t.state} />);
    await flush();
    expect(r.queryByText(OFFER)).toBeNull();
    await act(async () => {
      t.state.ui.pane.value = "none";
    });
    await waitFor(() => expect(r.queryByText(OFFER)).not.toBeNull());
  });

  it("never comes up in an embed", async () => {
    const t = await createTestReaderState({ identity: null });
    t.state.ui.embed.value = true;
    const r = renderInHost(<Onboarding state={t.state} />);
    await flush();
    expect(r.queryByText(OFFER)).toBeNull();
  });
});
