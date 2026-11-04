# Feature gaps behind the screens

What this reader cannot do the way seedbible.org does **because of missing data or a missing service**, found by
walking seedbible.org (`flows.md`, 2026-11-03) and reading both code bases. A difference in markup, layout or copy is
not listed here: that is parity work, tracked by `scripts/parity.ts`. Nothing here is built in this package: the
reader's back end (reader-a2a, reader-mcp, seed-bible-a2a, seed-bible-mcp) stays as it is, and each row is for the
service's owner.

**Status of the walk.** The signed-out flows (F01–F28, P01–P10) were walked on both apps. The signed-in flows
(S01–S17) are listed from the code and still need the signed-in walk, so their rows below are marked *to verify*.

## Gaps

| # | Flow | seedbible.org | This reader | What is missing | Reproduce | Screens |
|---|---|---|---|---|---|---|
| G1 | S09 Friends-only sharing of a note, plan or playlist | `publicRead` records shared to friends, `ReadingPlansPaneFriends` | A note is either private on the device and in the vault, or published to the world through the registry | An audience on `library.file.visibility`, or circle shelves and a `seed:ShareGrant` (hard-problems §4) | Sign in on both; make a note; share it with one friend only; the friend looks for it | *to verify* |
| G2 | S10 Session chat that outlives the room | `ChatsManager` records on CasualOS | Chat lives in the room's SQLite and is gone if the room is wiped | An InteractionsDO discussion topic for the session (hard-problems §9, §11) | Start a session, chat, wipe the Durable Object, reopen | *to verify* |
| G3 | S03 A team's shared notes (`?annotationRecordKey=`) | Notes kept in a shared record, with a banner | A church publishes notes as offerings; no shared team record | A church writing as itself (an ask-as-org wire, `seed.workspace.ask.org`) | Open a `?annotationRecordKey=` link on both | *to verify* |
| G4 | F23 Apologist, Bonfire | Extensions in the catalogue (Available) | Not present | A partner's `seed:Offering` for Apologist; an org Bonfire persona and a discussion turn on the companion | Settings → Extensions → Available on both | F23 pair in `parity/` |
| G5 | F23 MCP Servers (acts) | Connected servers are called | Connectors are listed; nothing is invoked | Outbound-host allowlist and `seed.workspace.proxy` for keyed partner APIs (hard-problems §10) | Add a server on both; ask it something | F23 pair |
| G6 | F23 Extension settings with secrets | `SensitiveSettingsForm` keeps keys in a record proxy | Per-extension settings exist; no secret storage | `seed.secret.put` on the vault | Configure Twitch on both | F23 pair |
| G7 | F23 Bible Stack, House of the Lord, Scripture Map (3D) | CasualOS `.aux` patterns in `ao.bot` iframes | Scripture Map is here as a pane; the 3D patterns are not | The CasualOS portal substrate (deferred by the architecture) | Install each on seedbible.org | F23 pair |

Seven rows. Four (G1–G3, G5–G6) are the substrate asks already written up in `docs/architecture/hard-problems.md`;
one (G4) is partner content; one (G7) is deferred 3D. **No gap was found in the signed-out reading flows**: chapters,
translations, the picker, search (Typesense through the scripture service on both), audio, highlights, saves,
bookmarks, share links, embed, offline, install, tours, the language picker and the About page all do on this reader
what they do on seedbible.org.

## Cross-check against the gap analysis of 2026-10-22

`docs/architecture/gap-analysis.md` lists what was thin, missing, deferred or dropped on 2026-10-22. Each row, as it
stands after this pass:

| Gap-analysis row | Verdict | Evidence |
|---|---|---|
| RTL/LTR swipe (thin) | not a gap from a user's view | `readerViewport.ts` swipes; `reader-viewport.test.tsx` proves it |
| Feature flags / PostHog (dropped) | not a gap | nothing on seedbible.org's screens depends on it |
| YouVersion sign-in (deferred) | not a gap for this pass | the Home is the sign-in; AO Lab named it as what they keep |
| Note conflict UI (thin) | not a gap (data and service exist) | the merge keeps both; only the choice buttons are thinner |
| Adopt device content (thin) | not a gap | the sign-in flush adopts the device's marks without a modal |
| `?annotationRecordKey=` team notes (thin) | **still a gap** | G3 |
| Audio extension settings (thin) | not a gap from a user's view | Listen plays on both; no setting on seedbible.org's Listen |
| Audio reader as a package (dropped) | not a gap | the capability is in the chrome |
| Invitations as session registry (missing) | not a gap from a user's view | sessions are joined by link and code on both |
| Today feed pager (thin) | *to verify* signed in | depends on a long friends feed |
| Friend content freshness (thin) | not a gap | a 15-minute crawl is the contract |
| Partner Discover contributors (missing) | **still a gap** | G4 |
| Friends-only share (missing) | **still a gap** | G1 |
| Session chat on SQLite (thin) | **still a gap** | G2 |
| Voice without a relay (thin) | not a gap | seedbible.org has no voice |
| Shared tab strip (thin) | not a gap from a user's view | follow-the-leader covers reading together |
| Playlist editor lighter (thin) | *to verify* signed in | S07 |
| Friends' plans (missing) | **still a gap** | G1 |
| Org publishes as church (thin) | **still a gap** | G3 |
| Bonfire persona (thin) | **still a gap** | G4 |
| Twitch host (dropped) | not a gap for this pass | by rule, no write outside the estate |
| External MCP acts (missing) | **still a gap** | G5 |
| Apologist (missing) | **still a gap** | G4 |
| Example extension (missing) | not a gap | not a product feature |
| Extension settings + secrets (thin) | **still a gap** for secrets | G6; the settings schema exists |
| Customization-forced prefs (thin) | *to verify* signed in | S13 |
| Settings page (thin UX) | closed by this pass | Settings now has seedbible.org's rows, picker, bug report and version |
| Hydration decline cases (thin) | not a gap | internal |
| Bible Stack, House of the Lord, patterns, portals (deferred) | **deferred** | G7 |
| i18n lint of 76 locales, size-diff comment (thin, test rig) | not a gap | tooling |

**Count by kind:** 7 gaps (4 substrate, 1 partner content, 1 secrets, 1 deferred 3D); 3 rows to verify in the
signed-in walk; everything else on the 2026-10-22 list is either closed or not a gap from a person's point of view.
