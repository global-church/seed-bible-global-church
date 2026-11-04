// SETTINGS — the old reader's (packages/seed-bible Tabs `Settings` and SettingsPage): the ⚙ at the bottom of the
// sidebar turns the sidebar into the Settings list — seedbible.org's Account, Display & Theme, Extensions, Install
// App, Launch tutorial, About Seed Bible, then this reader's Toolbar and Customize, then Language (with its flag),
// Report a bug and the version — and each row opens its page in the sidebar, with ← back to the list. The pages hold
// the same cards as the Account settings pane.
import { HighlightColorsCard } from "./HighlightColorsCard";
import type { ComponentChildren } from "preact";
import type { ReaderState } from "../../state";
import type { SettingsPage } from "../../state";
import { AVAILABLE_LANGUAGES, setLanguage, useI18n } from "../../i18n";
import { LANG_META } from "../../i18n/languageMeta";
import { APP_VERSION, BUILD_ID } from "../../build";
import { SearchableSelect } from "./SearchableSelect";
import { useState } from "preact/hooks";
import {
  install,
  installPrompt,
  runningAsApp,
} from "../../state/chrome/fullScreen";
import {
  AccountCard,
  ChurchThemeFields,
  ConnectorsCard,
  ExtensionsCard,
  ListeningCard,
  PresenceCard,
  ProfileCard,
  PublishAsCard,
  ReadingFields,
  TextStyleCard,
  ThemeGallery,
  ToolbarCard,
  TutorialsCard,
} from "./AccountPane";

/** Where a bug about this reader goes: the fork's issues (seedbible.org's button opens AO Lab's form). */
const REPORT_A_BUG_URL =
  "https://github.com/global-church/seed-bible-global-church/issues/new";

/** The language's flag beside its name, as seedbible.org's picker draws it. */
function FlagImg({ cc }: { cc: string }) {
  return (
    <img
      src={`https://flagcdn.com/w40/${cc}.png`}
      alt=""
      style={{
        width: "1.25rem",
        height: "1.25rem",
        borderRadius: "50%",
        objectFit: "cover",
        flexShrink: 0,
      }}
    />
  );
}

/** "v0.0.1 · 517285f", copied to the clipboard on a tap (for a bug report). */
function VersionLine() {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);
  const text = t("app-version", {
    version: APP_VERSION,
    commit: BUILD_ID,
    defaultValue: "v{{version}} · {{commit}}",
  });
  return (
    <button
      type="button"
      className="sb-settings-version"
      title={t("copy", { defaultValue: "Copy" })}
      onClick={() => {
        void navigator.clipboard
          ?.writeText(text)
          .then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          })
          .catch(() => undefined);
      }}
    >
      {copied ? t("copied", { defaultValue: "Copied" }) : text}
    </button>
  );
}

interface Row {
  id: Exclude<SettingsPage, "main"> | "about";
  icon: string;
  label: string;
}

export function SettingsView({ state }: { state: ReaderState }) {
  const { t, language } = useI18n();
  const page = state.ui.settingsView.value ?? "main";
  const go = (p: SettingsPage | null) => (state.ui.settingsView.value = p);
  // seedbible.org's six rows in its order, then this reader's own two.
  const rows: Row[] = [
    {
      id: "account",
      icon: "person",
      label: t("account", { defaultValue: "Account" }),
    },
    {
      id: "display",
      icon: "contrast",
      label: t("display-and-theme", { defaultValue: "Display & Theme" }),
    },
    {
      id: "extensions",
      icon: "extension",
      label: t("extensions", { defaultValue: "Extensions" }),
    },
    ...(runningAsApp()
      ? []
      : [
          {
            id: "install" as const,
            icon: "install_desktop",
            label: t("install-app", { defaultValue: "Install App" }),
          },
        ]),
    {
      id: "tutorial",
      icon: "school",
      label: t("launch-tutorial", { defaultValue: "Launch tutorial" }),
    },
    {
      id: "about",
      icon: "info",
      label: t("about-title", { defaultValue: "About Seed Bible" }),
    },
    {
      id: "toolbar",
      icon: "tune",
      label: t("toolbar", { defaultValue: "Toolbar" }),
    },
    {
      id: "customize",
      icon: "palette",
      label: t("customize", { defaultValue: "Customize" }),
    },
  ];
  const title =
    page === "main" ? "" : (rows.find((r) => r.id === page)?.label ?? "");

  const body = (): ComponentChildren => {
    switch (page) {
      case "account":
        return (
          <>
            <div className="sb-account-card">
              <AccountCard state={state} />
            </div>
            {state.session.value && <ProfileCard state={state} />}
            {state.session.value && <PublishAsCard state={state} />}
            <PresenceCard state={state} />
          </>
        );
      case "display":
        return (
          <>
            <ThemeGallery state={state} />
            <HighlightColorsCard state={state} />
            <div className="sb-account-card">
              <ReadingFields state={state} />
            </div>
            <TextStyleCard state={state} />
            <ListeningCard state={state} />
          </>
        );
      case "toolbar":
        return <ToolbarCard state={state} />;
      case "extensions":
        return (
          <>
            <ExtensionsCard state={state} />
            {state.session.value && <ConnectorsCard state={state} />}
          </>
        );
      case "install":
        return (
          <div className="sb-account-card">
            <p className="sb-small">
              {t("onboarding.installBodyPre", {
                defaultValue: "Add Seed Bible to your ",
              })}
              <strong>
                {t("onboarding.installTargetDesktop", {
                  defaultValue: "desktop",
                })}
              </strong>
              {t("install-body-post-settings", {
                defaultValue: " or your phone's home screen to return anytime.",
              })}
            </p>
            {installPrompt.value ? (
              <button
                className="sb-note-button sb-note-button-primary"
                onClick={() => void install()}
              >
                {t("onboarding.installApp", { defaultValue: "Install App" })}
              </button>
            ) : (
              <button
                className="sb-note-button"
                onClick={() => (state.ui.fullScreenHelp.value = true)}
              >
                {t("install-how", { defaultValue: "How to install" })}
              </button>
            )}
          </div>
        );
      case "tutorial":
        return <TutorialsCard state={state} />;
      case "customize":
        return (
          <div className="sb-account-card">
            <ChurchThemeFields state={state} />
            <button
              className="sb-note-button"
              onClick={() => (state.ui.pane.value = "library")}
            >
              {t("customize-make-your-own", {
                defaultValue: "Make your own in Library → Customizations",
              })}
            </button>
          </div>
        );
      default:
        return (
          <div className="sb-settings-page">
            <section className="sb-settings-section">
              <ul className="sb-settings-list">
                {rows.map((r) => (
                  <li key={r.id}>
                    <button
                      className="sb-settings-nav-item"
                      onClick={() =>
                        r.id === "about"
                          ? (state.ui.pane.value = "about")
                          : go(r.id)
                      }
                    >
                      <span className="sb-settings-nav-icon">
                        <span className="material-symbols-outlined">
                          {r.icon}
                        </span>
                      </span>
                      <span className="sb-settings-nav-label">{r.label}</span>
                      <span className="material-symbols-outlined rtl-mirror">
                        chevron_right
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </section>
            <section className="sb-settings-section">
              <label
                className="sb-settings-field-label"
                htmlFor="sb-settings-language"
              >
                {t("language", { defaultValue: "Language" })}
              </label>
              <SearchableSelect
                id="sb-settings-language"
                buttonClassName="sb-settings-language-select"
                value={language}
                options={AVAILABLE_LANGUAGES.map((code) => {
                  const meta = LANG_META[code];
                  return {
                    id: code,
                    label: meta?.display ?? code.toUpperCase(),
                    leading: meta?.cc ? <FlagImg cc={meta.cc} /> : undefined,
                  };
                })}
                onChange={(code) => void setLanguage(code)}
                searchPlaceholder={t("search-languages", {
                  defaultValue: "Search languages...",
                })}
                emptyLabel={t("no-languages-found", {
                  defaultValue: "No languages found",
                })}
              />
              <button
                type="button"
                className="sb-settings-action-button"
                onClick={() =>
                  window.open(REPORT_A_BUG_URL, "_blank", "noopener")
                }
              >
                {t("report-a-bug", { defaultValue: "Report a bug" })}
              </button>
            </section>
            <VersionLine />
          </div>
        );
    }
  };

  return (
    <div className="sb-sidebar-settings-view">
      <div className="sb-sidebar-tabs-header">
        {page !== "main" && (
          <button
            className="sb-settings-breadcrumbs-back"
            aria-label={t("back", { defaultValue: "Back" })}
            title={t("back", { defaultValue: "Back" })}
            onClick={() => go("main")}
          >
            <span className="material-symbols-outlined rtl-mirror">
              arrow_back
            </span>
          </button>
        )}
        <h3 className="sb-sidebar-tabs-title">
          {page === "main"
            ? t("settings", { defaultValue: "Settings" })
            : title}
        </h3>
        <button
          onClick={() => go(null)}
          className="sb-sidebar-settings-close-button"
          aria-label={t("close-settings", { defaultValue: "Close Settings" })}
          title={t("close-settings", { defaultValue: "Close Settings" })}
        >
          <span className="material-symbols-outlined">close</span>
        </button>
      </div>
      <div className="sb-sidebar-settings-content">{body()}</div>
    </div>
  );
}
