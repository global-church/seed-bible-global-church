// THE PARITY HARNESS — the same screens on seedbible.org and on this reader, at desktop and phone width, as
// screenshots and a diff image per pair (docs/parity/flows.md names the flows). Run:
//
//   pnpm parity                                  ours = http://localhost:5185 (pnpm dev:web --mode faithnet)
//   PARITY_OURS=https://seed-bible.global-church.workers.dev pnpm parity
//   PARITY_ONLY=F01,F02 pnpm parity              some screens
//   PARITY_OURS_CHAPTER=/en/BSB/genesis/1        once this reader serves their addresses
//   PARITY_THEIRS_STATE=.parity-theirs.json      a saved Playwright storage state for the signed-in screens
//
// Output goes to parity/ (git-ignored): <width>-<id>-theirs.png, -ours.png, -diff.png and summary.md / summary.json.
// Masked regions are the ones MEANT to differ (the verse of the day, Discover results, the sign-in card, the version
// string); everything else that differs is work to do. The threshold is for anti-aliasing only — read the diff
// images, not just the percentages.
import { chromium, type Locator, type Page } from "playwright";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { PNG } from "pngjs";
import pixelmatch from "pixelmatch";

type AppId = "theirs" | "ours";
const APPS: Record<AppId, { base: string; chapter: string; state?: string }> = {
  theirs: {
    base: (process.env["PARITY_THEIRS"] ?? "https://seedbible.org").replace(
      /\/$/,
      ""
    ),
    chapter: process.env["PARITY_THEIRS_CHAPTER"] ?? "/en/BSB/genesis/1",
    state: process.env["PARITY_THEIRS_STATE"],
  },
  ours: {
    base: (process.env["PARITY_OURS"] ?? "http://localhost:5185").replace(
      /\/$/,
      ""
    ),
    chapter: process.env["PARITY_OURS_CHAPTER"] ?? "/read/BSB/GEN/1",
    state: process.env["PARITY_OURS_STATE"],
  },
};
const VIEWPORTS = {
  desktop: { width: 1440, height: 900 },
  phone: { width: 390, height: 844 },
} as const;
type Width = keyof typeof VIEWPORTS;

/** A control by accessible name: the first visible candidate wins, so one screen can name both apps' labels. */
type Candidate =
  | { role?: "button" | "link" | "tab" | "menuitem"; name: RegExp }
  | { css: string }
  | { text: string };
type Act = (p: Page, app: AppId) => Promise<void>;

async function settle(page: Page) {
  await page.waitForLoadState("networkidle").catch(() => undefined);
  // First-run prompts on either app: the tour card, the install card.
  for (const name of [/no, thanks/i, /maybe later/i, /^skip$/i]) {
    const b = page.getByRole("button", { name }).first();
    if (await b.isVisible().catch(() => false))
      await b.click({ timeout: 1500 }).catch(() => undefined);
  }
  await page.waitForTimeout(400);
}

async function find(
  page: Page,
  candidates: Candidate[]
): Promise<Locator | null> {
  for (const c of candidates) {
    const l =
      "css" in c
        ? page.locator(c.css).first()
        : "text" in c
          ? page.getByText(c.text).first()
          : page.getByRole(c.role ?? "button", { name: c.name }).first();
    if (await l.isVisible().catch(() => false)) return l;
  }
  return null;
}

/** Click the first visible candidate; a missing control is reported, not fatal (the screen still gets captured). */
const tap =
  (...candidates: Candidate[]): Act =>
  async (p) => {
    const l = await find(p, candidates);
    if (!l)
      throw new Error(`no control: ${candidates.map(describe).join(" | ")}`);
    await l.click({ timeout: 4000 });
    await settle(p);
  };
const describe = (c: Candidate) =>
  "css" in c
    ? c.css
    : "text" in c
      ? `"${c.text}"`
      : `${c.role ?? "button"} ${c.name}`;
const seq =
  (...acts: Act[]): Act =>
  async (p, app) => {
    for (const a of acts) await a(p, app);
  };
const verse = tap({ text: "In the beginning God created" });

interface Screen {
  id: string;
  /** Start at `/` instead of the chapter. */
  first?: boolean;
  /** Only at this width. */
  only?: Width;
  act?: Act;
  /** Regions meant to differ, as CSS selectors per app (masked in magenta before the diff). */
  mask?: Partial<Record<AppId, string[]>>;
}

const VERSE_OF_THE_DAY = [
  ".sb-today-welcome-screen-verse, .sb-today-verse, .sb-today-welcome-verse, .sb-today-votd",
];
const SCREENS: Screen[] = [
  {
    id: "F01-first-visit",
    first: true,
    mask: { theirs: VERSE_OF_THE_DAY, ours: VERSE_OF_THE_DAY },
  },
  { id: "F02-chapter" },
  { id: "F04-books", act: tap({ name: /^books$/i }, { name: /^bible$/i }) },
  { id: "F05-search", act: tap({ name: /^search$/i }) },
  {
    id: "F05b-search-results",
    act: seq(tap({ name: /^search$/i }), async (p) => {
      await p.keyboard.type("light");
      await p.keyboard.press("Enter");
      await p.waitForTimeout(2500);
    }),
    mask: {
      theirs: [".sb-floating-search-result"],
      ours: [".sb-floating-search-result, .sb-search-result"],
    },
  },
  {
    id: "F06-discover",
    only: "desktop",
    act: tap({ name: /^discover$/i }),
    mask: {
      theirs: [".sb-discover-section"],
      ours: [".sb-discover-section, .sb-dcp-body"],
    },
  },
  {
    id: "F07-today",
    act: tap({ name: /^today$/i }),
    mask: { theirs: VERSE_OF_THE_DAY, ours: VERSE_OF_THE_DAY },
  },
  { id: "F08-verse-menu", act: verse },
  { id: "F09-highlight", act: seq(verse, tap({ name: /^highlight/i })) },
  { id: "F11-save-verse", act: seq(verse, tap({ name: /^save$/i })) },
  { id: "F11b-save-chapter", act: tap({ name: /save chapter/i }) },
  {
    id: "F12-compare",
    only: "desktop",
    act: seq(verse, tap({ name: /^compare$/i })),
  },
  { id: "F13-share", act: tap({ name: /^share$/i }) },
  {
    id: "F15-bookmark",
    act: tap({ name: /bookmark this chapter/i }),
    mask: {
      theirs: [".sb-login-card, .sb-login"],
      ours: [".sb-signin, .sb-profile-signin-card"],
    },
  },
  {
    id: "F17-profile",
    act: tap({ name: /open profile/i }, { name: /^you$/i }),
    mask: {
      theirs: [".sb-login-card, .sb-login"],
      ours: [".sb-signin, .sb-profile-signin-card"],
    },
  },
  {
    id: "F18-sidebar",
    only: "desktop",
    act: tap({ name: /expand sidebar/i }, { name: /open sidebar/i }),
  },
  {
    id: "F20-settings",
    act: tap(
      { name: /open settings/i },
      { css: ".sb-bible-reader-mobile-header-settings" }
    ),
    mask: { theirs: [".sb-settings-version"], ours: [".sb-settings-version"] },
  },
  {
    id: "F22-display-theme",
    only: "desktop",
    act: seq(tap({ name: /open settings/i }), tap({ text: "Display & Theme" })),
  },
  {
    id: "F23-extensions",
    only: "desktop",
    act: seq(tap({ name: /open settings/i }), tap({ text: "Extensions" })),
  },
  {
    id: "F26-about",
    only: "desktop",
    act: seq(tap({ name: /open settings/i }), tap({ text: "About" })),
  },
  { id: "P06-more", only: "phone", act: tap({ name: /^more$/i }) },
  {
    id: "P07-text-sheet",
    only: "phone",
    act: tap(
      { css: ".sb-bible-reader-mobile-header-settings" },
      { name: /text settings/i }
    ),
  },
];

const here = fileURLToPath(new URL(".", import.meta.url).href);
const out = `${here}../parity`;
mkdirSync(out, { recursive: true });
const only = (process.env["PARITY_ONLY"] ?? "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);
const widths = (process.env["PARITY_WIDTHS"] ?? "desktop,phone")
  .split(",")
  .map((s) => s.trim())
  .filter((w): w is Width => w in VIEWPORTS);

interface Row {
  width: Width;
  id: string;
  percent: number | null;
  note: string;
}
const rows: Row[] = [];
const browser = await chromium.launch();
for (const width of widths) {
  const viewport = VIEWPORTS[width];
  for (const s of SCREENS) {
    if (only.length && !only.some((o) => s.id.startsWith(o))) continue;
    if (s.only && s.only !== width) continue;
    const notes: string[] = [];
    for (const app of ["theirs", "ours"] as const) {
      const cfg = APPS[app];
      const ctx = await browser.newContext({
        viewport,
        ...(cfg.state ? { storageState: cfg.state } : {}),
        reducedMotion: "reduce",
      });
      const page = await ctx.newPage();
      page.on("dialog", (d) => d.dismiss().catch(() => undefined));
      try {
        await page.goto(cfg.base + (s.first ? "/" : cfg.chapter), {
          waitUntil: "networkidle",
          timeout: 45_000,
        });
        await settle(page);
        if (s.first) {
          // The first-visit screen must be the first screen: no settle() dismissal has run on a chapter before it.
        }
        try {
          await s.act?.(page, app);
        } catch (e) {
          notes.push(`${app}: ${(e as Error).message.split("\n")[0]}`);
        }
        const mask = (s.mask?.[app] ?? []).map((css) => page.locator(css));
        await page.screenshot({
          path: `${out}/${width}-${s.id}-${app}.png`,
          animations: "disabled",
          mask,
          maskColor: "#ff00ff",
        });
      } catch (e) {
        notes.push(`${app}: ${(e as Error).message.split("\n")[0]}`);
      }
      await ctx.close();
    }
    let percent: number | null = null;
    try {
      const a = PNG.sync.read(
        readFileSync(`${out}/${width}-${s.id}-theirs.png`)
      );
      const b = PNG.sync.read(readFileSync(`${out}/${width}-${s.id}-ours.png`));
      if (a.width !== b.width || a.height !== b.height) {
        notes.push(`size ${a.width}x${a.height} vs ${b.width}x${b.height}`);
      } else {
        const diff = new PNG({ width: a.width, height: a.height });
        const n = pixelmatch(a.data, b.data, diff.data, a.width, a.height, {
          threshold: 0.1,
        });
        writeFileSync(`${out}/${width}-${s.id}-diff.png`, PNG.sync.write(diff));
        percent = Math.round((1000 * n) / (a.width * a.height)) / 10;
      }
    } catch (e) {
      notes.push(`diff: ${(e as Error).message.split("\n")[0]}`);
    }
    rows.push({ width, id: s.id, percent, note: notes.join("; ") });
    console.log(
      `${width.padEnd(7)} ${s.id.padEnd(22)} ${percent === null ? "   —  " : `${percent.toFixed(1).padStart(5)}%`}  ${notes.join("; ")}`
    );
  }
}
await browser.close();

const stamp = new Date().toISOString();
const md = [
  `# Parity run ${stamp}`,
  "",
  `theirs: ${APPS.theirs.base}${APPS.theirs.chapter} · ours: ${APPS.ours.base}${APPS.ours.chapter}`,
  "",
  "| width | screen | pixels differing | notes |",
  "|---|---|---|---|",
  ...rows.map(
    (r) =>
      `| ${r.width} | ${r.id} | ${r.percent === null ? "—" : `${r.percent.toFixed(1)}%`} | ${r.note} |`
  ),
  "",
].join("\n");
writeFileSync(`${out}/summary.md`, md);
writeFileSync(
  `${out}/summary.json`,
  JSON.stringify({ stamp, apps: APPS, rows }, null, 2)
);
console.log(`\n${rows.length} screens → ${out}/summary.md`);
