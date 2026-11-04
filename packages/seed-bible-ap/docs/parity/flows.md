# seedbible.org, screen by screen

What seedbible.org (v1.16.0, read on 2026-11-03) shows and does, as a person sees it. This is the parity spec for the
"familiar first" pass: every screen, pane, menu, dialog, empty state and prompt, with the controls on it by their
accessible names, at desktop (1440×900) and phone (390×844) widths. Signed-out flows were walked with Playwright; the
signed-in ones are listed from the code (`packages/seed-bible/seed-bible/components/`) and marked **not walked**.

Each flow has an id (`F01`…). The harness (`scripts/parity.ts`) captures one screen per flow where it can.

## How the app is addressed

- **Reading address:** `/{lang}/{translation}/{book-slug}/{chapter}`, e.g. `/en/BSB/genesis/1`. The language segment is
  **always present** in the canonical address: the root `/` lands on `/en/AAB/genesis/1?today=open`; a three-segment
  address (`/BSB/genesis/1`) is a redirect entry point, promoted to the four-segment form
  (`managers/ReadingUrlPath.ts`, `buildReadingPath`). This settles the docx question: `/en/BSB/genesis/1`, not
  `/BSB/genesis/1`.
- **Book slug** is the lower-case English name (`genesis`, `1-john`), fuzzy-matched; **translation** is the HelloAO id
  (`BSB`, `AAB`). The default translation with nothing stored is `AAB` (Accessible Ancients Bible).
- **Panes and dialogs are query parameters**, so the back button closes them and a link can open one:
  `?today=open`, `?selector=open` (Books), `?search=open`, `?verse=3` (a selected verse), `?settingsView=main` and
  `?settingsView=display-and-theme`, `?extensions=open`, `?profile=open`, `?terms=open`, `?privacy=open`,
  `?conduct=open`, `?tutorial=introduction&tutorialStep=0`, `?sessionId=`, `?sidebar=open`.
- **Static pages:** `/en/about`. Shared pages: `/{lang}/playlist/{id}/{slug}`, `/{lang}/reading-plan/{id}/{slug}`.
- Next chapter is a real link (`<a href="/en/BSB/genesis/2">`); previous is a button.

## Desktop (1440×900)

### F01 First visit

`/` → `/en/AAB/genesis/1?today=open`. The Today pane covers the reading column: date ("3 NOV"), "Welcome!", a verse of
the day ("JOHN 1:1", quoted, two phrases in orange), buttons **Open Bible**, **Read John 1 →**, **Take a tour**. Left
rail collapsed: **Expand sidebar**, a tab tile **Genesis 1** ("GEN 1"), **Create new tab** (+), **Open Settings**,
**Open profile (Anonymous)**. Bottom bar floating: **Previous Chapter**, **Today**, **Books**, **Search**,
**Discover**, **Next Chapter**. No tour prompt on the first visit (the prompt appears on the _second_ screen, see F03).
Component: `TodayPane/Welcome.tsx`, `TodayPane/TodayPane.tsx`.

### F02 Chapter

`/en/BSB/genesis/1`. One centred reading column (text starts at x=405 of 1440, column 685 wide) on a white card over a
light grey page. Header: serif **Genesis 1** (h2), a grey pill **Change translation (Berean Standard Bible)** showing
"BSB", then right-aligned **Save chapter** (star), **Bookmark this chapter**, **Share**, **Listen** (orange play disc).
A rule under the header. Section headings (h3, bold sans), verse numbers superscript, each verse a `span[role=button]`,
footnote markers **Open footnote n** (ⓘ). Poetry lines indented. Under the text: "Powered by Seed Bible API"
(`BelowReaderToolbar`, one button). No Verified badge, no book icon, no Discover compass in the header.
Components: `BibleReader/`, `BibleReaderToolbar/`, `QuickToolbar/` (Share, Listen), `BelowReaderToolbar/`.

### F03 Tour prompt

On the second screen of a fresh browser (any navigation after the first), a card top-right: "Welcome to Seed Bible.
Would you like a tutorial?", **No, thanks**, **Take the tour →**. Dismissed once, it stays dismissed.
Component: `TutorialPrompt/`.

### F04 Books (chapter and translation picker)

**Books** in the bar, or the translation pill, or **Create new tab** → `?selector=open`. A panel over the column:
search field **Search books...**, a `select` **All books / Old Testament / New Testament**, a translation column on the
left (search **Search translations...**, a list of translations each with **Download for offline use** and a share
button), the book grid, and on a chosen book a chapter grid (**1**…**50**, current one marked). An empty / error
state shows **Try again**. Component: `BibleSelector/`, `TranslationList/`.

### F05 Search

**Search** → `?search=open`. A floating dialog "Search" above the bar with **Search verses**. Typing and Enter expands
the dialog upward with results (`option` rows: reference • translation, open-in-new icon, the verse text) and a
**Clear search** button. Component: `SidebarSearch/`.

### F06 Discover

**Discover** → a right-hand pane docked beside the column (the text shifts left). Header "Discover", **Create**,
**Close**. Signed out with no notes: section "Notes" with "You don't have any notes for this chapter. **Create a note**".
Discovered content (references, locations …) comes from installed extensions; the default install has Audio Reader
and Compare only, so no discovered sections show. Component: `DiscoverPane/`, `DiscoverContentPanel/`.

### F07 Today pane (returning)

**Today** → `?today=open`. Same Welcome card as F01 while nothing has been read; with history it shows Resume
reading, bookmarks, search and the social feed (not walked signed in). Components: `TodayPane/*`.

### F08 Verse menu

Tap a verse → `?verse=1`, the verse underlined dotted, a floating toolbar above it with seven actions:
**Highlight selection**, **Save**, **Note**, **Copy**, **Compare**, **Share**, **Cancel**. Component:
`BibleReader` verse toolbar (`sb-verse-toolbar-*`).

### F09 Highlight colours

Verse menu → **Highlight selection**: a colour sheet with **Back**, twelve colours (**Highlight yellow** … **tan**),
three **Add custom color** slots, **Add custom color**, **Clear highlight**. Signed out, choosing a colour applies
the highlight on the device.

### F10 Note (signed out)

Verse menu → **Note** opens the **Login** card (F17) in the column: a note needs an account. Signed in it opens the
note editor (`CreateAnnotationForm/`, TipTap) — not walked.

### F11 Save (verse or chapter)

**Save** on the verse menu, or **Save chapter** in the header → a save picker dialog: a category list
(**My Saves**, checked), **Add to new**, **Save**. Component: `SavesManager` + the picker in `BibleReader`.

### F12 Compare

Verse menu → **Compare** → a right-hand pane with the verse in each chosen translation, **Compare settings**,
**Close**, **Add translation**. Component: the Compare extension's pane.

### F13 Share (chapter or verse)

**Share** in the header or verse menu → a sheet with three rows: **Share a link — Copy to clipboard**,
**Embed — Add this passage to a website**, **Start and share session — Invite others to read along live**.
Component: `ShareModal/`.

### F14 Listen

**Listen** → audio plays; the bar gains a **Pause** toggle at its left; the tab tile reads "Genesis 1 — playing
audio". Component: `AudioScrubber/`, Audio Reader extension.

### F15 Bookmark chapter (signed out)

**Bookmark this chapter** → the Login card (F17): bookmarks need an account.

### F16 Footnote

**Open footnote n** → selects the verse (`?verse=3`) and shows the verse menu; the footnote text is in the pane.

### F17 Login card

**Open profile (Anonymous)** → `?profile=open`, a pane with **Log in**; then a card "Login to your account", an
email field, checkbox "I agree to the Terms of service" (link), **Log in**, and links **Privacy policy**,
**Code of conduct**, **Terms of service** (each opens a modal via `?…=open`). Email-code sign-in
(`LoginManager`). Components: `ProfilePane/`, `LoginModal/`, `TermsOfServiceModal/`, `PrivacyPolicyModal/`,
`CodeOfConductModal/`.

### F18 Sidebar expanded

**Expand sidebar** → a 300px rail: **Collapse sidebar**, **Select pane layout**, **More**; "Tabs" with
**Bookmarks**, **Saves**, **Create new tab** (a plain + icon, not filled); each tab row **Genesis 1 • BSB** with
**Save chapter** and **Open tab menu**; at the bottom **Open Settings** and **Open profile (Anonymous)** (plain icon,
no badge). No history icon. Components: `Tabs/`, `TabsLayout.tsx`, `Bookmarks/`.

### F19 New tab

**Create new tab** → opens the Books panel (`?selector=open`) for the new tab.

### F20 Settings

**Open Settings** → `?settingsView=main`, the rail becomes Settings: "Settings", **Close Settings**, then in order
**Account**, **Display & Theme**, **Extensions**, **Install App**, **Launch tutorial**, **About Seed Bible** (each
with an icon and chevron); "Language" with a flag button **English** (opens a searchable language list, F24);
**Report a bug**; the version "v1.16.0 • e89b23c" as a **Copy** button. Component: `SettingsPage/`.

### F21 Settings → Account

Signed out: opens the profile pane with **Log in** (`?profile=open`). Signed in: profile, edit profile, sign out
(`ProfilePane/EditProfilePane.tsx`) — not walked.

### F22 Settings → Display & Theme

`?settingsView=display-and-theme`: **Back**, "Display & Theme"; "Themes" cards **Light**, **Dark**, **System**
(selected); "Scripture settings": **Decrease scripture font size**, **Increase scripture font size**,
**Change line spacing**, a width stepper (**Decrease scripture width**, a number, **Increase scripture width**),
"Scripture Font" select (Default, Newsreader, System UI, Roboto, Open Sans, Playfair Display, Cormorant Garamond …);
"Scripture elements" toggles **Show headings**, **Show verse numbers**, (footnotes), **Show highlights**,
**Show red lettering**; "Discovered Content" **Show discovered content**; "Session" **Verse Selection Effects**
(Default / Enabled / Disabled); "Display" **UI size** (S M L XL), **Book order** (Traditional / Tanakh),
**Keep screen awake**, **Offer to switch language with translation**; "Selection UI" **Show selected items**,
**Show highlight colors**, **Show icon text**.

### F23 Settings → Extensions

`?extensions=open`, a full page over the column: **Search extensions**, **Add from a link**; filters **All 16**,
**Installed 2**, **Available 14**, **Seed Bible 16**, **Others, from a link 0**; "Installed": Audio Reader, Compare;
"Available": Apologist, Bible Stack, Bonfire, Seed Bible Default Content, House of the Lord, Locations, MCP Servers,
References, Scripture Map, Example Extension, Theographic Data, AI Transcript, Twitch Host, Twitch User. Each a card
with a two-letter monogram, "Built into Seed Bible", a description, **Install** / **Uninstall** / **Configure**.
Component: `SettingsPage` extensions section, `ExtensionSettingsForm/`.

### F24 Settings → Install App

A card in the column: "Add Seed Bible to your desktop to return anytime…", **Install App**, **Maybe later**.
Component: `Onboarding/`.

### F25 Settings → Launch tutorial

`?tutorial=introduction&tutorialStep=0&selector=open`: the sidebar expands, Books opens, and a coachmark
"Select books and chapters" with **Skip** and **Next →**. Steps continue through the sidebar, tabs, toolbar and
settings. Component: `Tutorial/`, `TutorialManager`.

### F26 Settings → About

`/en/about?settingsView=main`: "About Seed Bible", "Why we're building it", "Read Together", "Playlists",
"Community Reading", "Sessions", "Notes & Highlights"; links **Donate**, **Join Discord**, **Release Notes**;
**Take a tour**; **Open a passage →**. Component: `AboutPage/`.

### F27 Settings → Language

The flag button opens a list with **Search languages...** and ~77 `option` rows in their own script (Afrikaans …),
the current one marked. Choosing one re-renders the UI and may offer to switch the translation.

### F28 Report a bug

A button on the Settings rail (opens the bug-report flow; not walked past the click).

## Phone (390×844)

### P01 First visit

`/` → `/en/AAB/genesis/1?today=open`: the Welcome card full-screen (date, "Welcome!", verse of the day, **Read
John 1 →** (orange, first), **Open Bible**, **Take a tour**). Bottom tab bar: **Today** (active), **You**, **Bible**,
**Search**, **More**. No floating chapter nav on the Today screen.

### P02 Chapter

Top header: translation pill **BSB** (h1 "Genesis 1 BSB", the title itself hidden), **Save chapter**,
**Bookmark this chapter**, **Share**, **Settings** (sliders icon). The column: a tappable serif title "Genesis" over a
large "1" (**Genesis 1**, opens Books), headings and verses as on desktop; the next chapter is rendered beside it
(horizontal paging: "Genesis 2" at x=418). Floating pill above the tab bar: **Listen** (orange disc), **Previous
Chapter**, **Genesis 1** (label, opens Books), **Next Chapter**. Tab bar: Today, You, **Bible** (active), Search,
More. No "Powered by" line in view. No book icon beside the title.

### P03 You

**You** → `?profile=open`: the profile pane with **Close** and **Log in**.

### P04 Bible / Books

**Bible**, the title, or the floating label → `?selector=open`: the picker full-screen with **Close** (top-left) and a
second close (top-right), search, testament select, book list, chapter grid.

### P05 Search

**Search** → `?search=open`: the floating search panel full-width above the tab bar; results list as desktop.

### P06 More

**More** → a menu (`role=menu`) above the bar: **Tabs**, **Bookmarks**, **Saves**, **Discover** (with a compass icon).
Discover is reached only from here on a phone.

### P07 Header Settings (Theme & text sheet)

The sliders icon → a bottom sheet "Theme & text": **Close**, **Decrease scripture font size**, **Increase scripture
font size**, **Change line spacing**, size buttons **S M L XL**, toggle **Keep screen awake**, **Go to all settings →**
(opens the Settings rail as a full screen). Component: `MobileSettingsSheet/`.

### P08 Verse menu, highlight, save, share

As desktop F08, F09, F11, F13; the verse toolbar floats above the verse, the sheets open from the bottom.

### P09 Tour prompt and tour

The same tutorial prompt card (top); **Take the tour →** runs the phone introduction (coachmarks on the title, the
translation pill, the bar, Settings; **Skip**, **Done →**).

### P10 Translation picker

The pill → `?selector=open` with the translation list first.

## Signed-in flows (from the code; not walked — Paul signs in himself for the signed-in pass)

| id  | Flow                                                                                      | Component                                                                                                                                                     |
| --- | ----------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| S01 | Email-code login, terms acceptance, code entry                                            | `LoginModal/`, `LoginManager`                                                                                                                                 |
| S02 | Profile: name, photo (crop), logo, bio; edit                                              | `ProfilePane/`, `EditProfilePane.tsx`, `PhotoChooser/`, `PhotoCropModal/`, `LogoCropModal/`, `ProfilePictureModal/`, `Avatar/`                                |
| S03 | Notes: create (TipTap), edit, delete, conflict                                            | `CreateAnnotationForm/`, `TipTapEditor/`, `ScriptureNote/`, `AnnotationConflictModal/`, `ConfirmDeleteModal/`                                                 |
| S04 | Highlights and saves synced across devices; adopt device content on sign-in               | `AdoptDeviceContentModal/`                                                                                                                                    |
| S05 | Bookmarks list                                                                            | `Bookmarks/`                                                                                                                                                  |
| S06 | Your content pane (notes, highlights, saves, playlists)                                   | `YourContentPane/`                                                                                                                                            |
| S07 | Playlists: create, items (scripture, text, link, hero image), play, history, finished     | `CreatePlaylistForm/`, `PlaylistItem*`, `PlayPlaylistView/`, `PlaylistHistoryPane/`, `PlaylistFinishedModal/`, `PlaylistHtmlContent/`, `PlaylistLinkContent/` |
| S08 | Reading plans: create, follow, section on Today                                           | `ReadingPlansPane/`, `ReadingPlansSection/`                                                                                                                   |
| S09 | Friends: list, person card, invite links, prompts                                         | `FriendsPane/*`                                                                                                                                               |
| S10 | Sessions: start, share QR, participants, chat, follow the leader                          | `SessionParticipants/`, `SessionQRCode/`, `ChatView/`, `SessionsManager`                                                                                      |
| S11 | Shared pages (playlist, reading plan)                                                     | `SharedPageModal/`, `SharedPageLoader`                                                                                                                        |
| S12 | Today signed in: resume reading, bookmarks, search, social feed, reading history timeline | `TodayPane/*`, `ReadingHistoryTimeline/`                                                                                                                      |
| S13 | Customizations (themes a church publishes), variant previews                              | `CustomizationEditPane/`, `CustomizationPreviews.tsx`                                                                                                         |
| S14 | Extension settings forms, sensitive settings                                              | `ExtensionSettingsForm/`, `SensitiveSettingsForm.tsx`                                                                                                         |
| S15 | Offline: download a translation, recovery toast, update prompt                            | `OfflineDownloadPrompt/*`                                                                                                                                     |
| S16 | Floating reader panels (desktop side panels)                                              | `FloatingReaderPanels/`                                                                                                                                       |
| S17 | Toasts, modals host, tooltips, spinners, skeletons                                        | `ToastHost/`, `ModalHost/`, `Tooltip/`, `Spinner/`, `Skeleton/`, `ExpandableText/`                                                                            |

## Components with no reachable screen signed out

`CasualOSApp/` (the app shell), `PortalComponent/` (ao.bot iframes for the 3D patterns), `PaneHeader/`, `PaneLayout/`,
`SearchableSelect/`, `LinkItemInput.tsx`, `TextItemInput/`, `ScriptureItemInput/`, `HeroImageField/`,
`ToolActionElement.tsx`, `icons.tsx`, `index.tsx` — building blocks of the screens above, not screens.

## Differences from seed-reader (the "before" picture, 2026-11-03)

Measured on the same walk against `localhost:5185` (this fork at `6a7993e7`):

| Where                    | seedbible.org                                                                                                   | seed-reader                                                                            |
| ------------------------ | --------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| First visit              | Today / Welcome card                                                                                            | straight to John 1, Discover docked open, a tour prompt                                |
| Address                  | `/en/BSB/genesis/1`, panes as `?…=open`                                                                         | `/read/BSB/GEN/1`, panes not in the address                                            |
| Desktop bar              | Today, Books, Search, Discover                                                                                  | Books, Search, Prayer, Discover, Places map, Study companion, Writings, More           |
| Phone bar                | Today, You, Bible, Search, More                                                                                 | Today, You (badge), Bible, Search, More                                                |
| Chapter header           | title, pill, save, bookmark, share, listen                                                                      | adds **Change book** icon, **Scripture check: Verified** badge, a **Discover** compass |
| Reading column           | one centred column                                                                                              | Discover panel docked right on load, text pushed left                                  |
| Verse menu               | 7 actions                                                                                                       | adds Content and Interpretations                                                       |
| Sidebar header           | Bookmarks, Saves, + (plain)                                                                                     | adds **Tasks**, + is a filled orange button                                            |
| Profile icon             | plain                                                                                                           | a numbered badge                                                                       |
| Settings                 | Account, Display & Theme, Extensions, Install App, Launch tutorial, About; flag language; Report a bug; version | adds Toolbar and Customize; `select` language, no flag; no Report a bug; "vdev"        |
| Footer                   | "Powered by Seed Bible API" (theirs, under the text)                                                            | the same line under the bar                                                            |
| Tours                    | opt-in                                                                                                          | a prompt on the first screen                                                           |
| Extensions on by default | Audio Reader, Compare                                                                                           | all twelve built-ins                                                                   |
