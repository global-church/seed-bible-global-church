// FIRST VISIT — the old reader's (packages/seed-bible TutorialPrompt): the chapter is readable at once, with a small
// card in the top-right corner offering the guided tour. Answered once on a device (the flag is a device preference).
// Installing the reader is offered from Settings → Install App, as on seedbible.org, never from here. Signing in is
// not asked for here: it is in the sidebar, the phone's account button and More.
import { useEffect, useState } from "preact/hooks";
import type { ReaderState } from "../../state";
import { useI18n } from "../../i18n";

export const ONBOARDING_KEY = "onboarding:done";

export function Onboarding({ state }: { state: ReaderState }) {
  const { t } = useI18n();
  const [stage, setStage] = useState<"none" | "tour">("none");
  const { prefs } = state.stores;

  useEffect(() => {
    if (state.ui.embed.value) return;
    void prefs.get(ONBOARDING_KEY).then((v) => {
      if (!v) setStage("tour");
    });
  }, []);

  const answered = () => prefs.set(ONBOARDING_KEY, new Date().toISOString());

  // Someone arriving from an invitation answers that first; the offer waits until it's closed. Over the Welcome card
  // it would compete with Take a tour, so it waits for the chapter, as seedbible.org's does.
  if (
    stage === "tour" &&
    !state.friendship.invite.value &&
    state.ui.pane.value !== "today"
  )
    return (
      <div
        className="sb-tutorial-prompt"
        role="dialog"
        aria-modal="false"
        aria-labelledby="sb-tutorial-prompt-title"
      >
        <h3 className="sb-tutorial-prompt-title" id="sb-tutorial-prompt-title">
          {t("tutorial.promptTitle", {
            defaultValue: "Welcome to Seed Bible. Would you like a tutorial?",
          })}
        </h3>
        <p className="sb-tutorial-prompt-body">
          {t("tutorial.promptBody", {
            defaultValue:
              "A guided tour is available to help you learn the ins and outs of Seed Bible.",
          })}
        </p>
        <div className="sb-tutorial-prompt-actions">
          <button
            type="button"
            className="sb-tutorial-prompt-btn sb-tutorial-prompt-btn-secondary"
            onClick={() => {
              setStage("none");
              void answered();
            }}
          >
            {t("tutorial.promptDecline", { defaultValue: "No, thanks" })}
          </button>
          <button
            type="button"
            className="sb-tutorial-prompt-btn sb-tutorial-prompt-btn-primary"
            onClick={() => {
              setStage("none");
              void answered().then(() => state.tours.start("introduction"));
            }}
          >
            {t("tutorial.promptAccept", { defaultValue: "Take the tour" })}
            <span className="sb-tutorial-prompt-arrow" aria-hidden="true">
              →
            </span>
          </button>
        </div>
      </div>
    );

  return null;
}
