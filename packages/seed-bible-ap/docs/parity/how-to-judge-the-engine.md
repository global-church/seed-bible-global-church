# How to judge the engine

One page for AO Lab. The screens are yours, so what is left to look at is what runs underneath. Each point below is
something you can see on your own screens, on this reader, in a minute.

## 1. It works offline and signed out

Open a chapter, turn the network off, reload: the chapter is there. Highlight a verse, save it, write a note, make a
bookmark, all signed out: they are there after a reload and after a restart. Nothing was sent anywhere. The device's
own store (IndexedDB) is what the reader reads and writes first; a sync to anywhere else is a copy of it, never the
other way round (`docs/adr/0008-device-read-model-outbox-and-supersedes.md`).

Where to look: Genesis 1 → tap verse 1 → Highlight → pick a colour → reload offline.

## 2. Signing in copies your marks to your own vault

Sign in with the Home (the one button on Profile). What you marked on the device goes into your own Library, in your
own vault, as a file you can read and take elsewhere. Sign in on a second device: the same marks are there. Sign out:
the device keeps its own copy. The app never holds a key to your vault; your own agent writes it for you, under a
delegation you can see and revoke at the Home (Connected assistants).

Where to look: Profile → Sign in with Faithnet → the Home shows the wire → make a note → open the Home's Library.

## 3. One sign-in across ministries

The same sign-in opens this reader, the other apps on the same rail, and anything a ministry builds on it. No account
is created here; the Home is the account. A person's identity is the same `sub` everywhere, and an app that wants to
know who someone is asks the Home, not a database of its own.

Where to look: sign in here, then open another app on the rail without signing in again.

## 4. An MCP that outside agents can call

The reader's data and tools are reachable by an agent, not only by this page: reader-mcp carries the workspace tools,
seed-bible-mcp the serving plane's. An agent that a person authorises can read their marks and act for them through
the same delegation as the page. Nothing in the browser talks to the MCP directly; the page talks to one origin
(reader-a2a), and that origin plans the acts.

Where to look: `apps/reader-mcp`, `apps/seed-bible-mcp`; the smoke scripts under `scripts/smoke/`.

## 5. Everything else is yours

The screens, the bottom bar, the verse menu, Books, Search, Discover, the sidebar, Settings and the addresses are
seedbible.org's (`docs/parity/flows.md`, `scripts/parity.ts`). What this reader adds beyond them sits behind one
switch, Settings → Labs, off by default, so each addition can be judged on its own: story cards, the Dead Sea Scrolls,
writings, the study companion, Prayer, the Scripture check, the toolbar and theme editors.

What is still missing underneath is listed, with how to reproduce each, in `docs/parity/backend-gaps.md`.
