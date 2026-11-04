// THE URL ↔ READING POSITION, in seedbible.org's scheme (packages/seed-bible managers/ReadingUrlPath.ts, ported
// verbatim): `/{lang}/{translation}/{book-slug}/{chapter}` — `/en/BSB/genesis/1`, `/es/spa_r09/juan/3` — with the
// language segment always present in the canonical address, the book as its slug ("1-john"), and `?verse=16` or
// `?verse=16-18` for a verse or range. A three-segment address (no language) and this reader's former
// `/read/{translation}/{BOOK}/{chapter}?v=` are redirect entry points (legacyRoute.ts), never a second canonical
// shape. Back and forward move the reader; the reader moving pushes history.
import {
  findClosestBookId,
  getBookId,
  getBookSlug,
} from "@seed/scripture/books";
import type { BookId } from "@seed/scripture/books";
import { language } from "../../i18n/language";
import type { Reading } from "./reading";

export interface ChapterRoute {
  translationId: string;
  bookId: string;
  chapterNumber: number;
  /** The language segment of the address it was read from; absent for a three-segment or `/read/` address. */
  language?: string;
}

/** The one language for which seedbible.org's old links omitted the segment; every canonical address has one. */
export const DEFAULT_UI_LANGUAGE = "en";
/** Second segments of the old reader's shared pages (`/{lang}/playlist/…`), never a translation. */
export const SHARED_PAGE_SEGMENTS = new Set(["playlist", "reading-plan"]);
/** First segments that are this reader's own pages, never a three-segment reading address. */
export const OWN_SEGMENTS = new Set([
  "read",
  "shared",
  "friend",
  "api",
  "assets",
  "bible",
]);
const LANG = /^[a-z]{2,3}(-[A-Za-z0-9]{2,8})?$/;
const CHAPTER = /^[1-9]\d{0,2}$/;
const TRANSLATION = /^[A-Za-z0-9_-]{1,64}$/;

function decode(s: string): string {
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
}

/** The book a path segment names: its slug, any of its names, or a close misspelling (as the old reader allowed). */
export const bookOfSegment = (segment: string): BookId | null =>
  getBookId(segment) ?? findClosestBookId(segment);

/** The reading position an address names, or null: the canonical four-segment form, the three-segment form, or
 *  this reader's former `/read/…` (each a redirect entry point except the first; see legacyTarget). */
export function parseRoute(pathname: string): ChapterRoute | null {
  const segs = pathname.split("/").filter(Boolean).map(decode);
  if (segs[0] === "read") {
    if (segs.length !== 4 || !CHAPTER.test(segs[3]!)) return null;
    return {
      translationId: segs[1]!,
      bookId: segs[2]!.toUpperCase(),
      chapterNumber: Number(segs[3]),
    };
  }
  if (segs.length !== 3 && segs.length !== 4) return null;
  const four = segs.length === 4;
  if (
    four &&
    (!LANG.test(segs[0]!) || SHARED_PAGE_SEGMENTS.has(segs[1]!.toLowerCase()))
  )
    return null;
  if (!four && OWN_SEGMENTS.has(segs[0]!.toLowerCase())) return null;
  const translationId = segs[four ? 1 : 0]!;
  const bookId = bookOfSegment(segs[four ? 2 : 1]!);
  const chapter = segs[segs.length - 1]!;
  if (!bookId || !CHAPTER.test(chapter) || !TRANSLATION.test(translationId))
    return null;
  return {
    translationId,
    bookId,
    chapterNumber: Number(chapter),
    ...(four ? { language: segs[0]! } : {}),
  };
}

/** The canonical address: always `/{lang}/{translation}/{book-slug}/{chapter}`, in the address's own language, else
 *  the interface language. */
export const routeOf = (r: ChapterRoute, lang = r.language ?? language.value) =>
  `/${encodeURIComponent(lang)}/${encodeURIComponent(r.translationId)}/${getBookSlug(r.bookId as BookId)}/${r.chapterNumber}`;

/** The verses a link names: `?verse=16` or `?verse=16-18` (this reader's former `?v=` too) → [16, 18]; null for none
 *  or nonsense. */
export function versesOf(search: string): [number, number] | null {
  const q = new URLSearchParams(search);
  const m = /^(\d+)(?:-(\d+))?$/.exec(q.get("verse") ?? q.get("v") ?? "");
  if (!m) return null;
  const a = Number(m[1]);
  const b = Number(m[2] ?? m[1]);
  return a >= 1 && b >= a ? [a, b] : null;
}

/** `16` or `16-18`, as `?verse=` carries it. */
export const verseParam = (start: number, end = start) =>
  start === end ? `${start}` : `${start}-${end}`;

/** A link to a verse or range of the chapter, on this origin. */
export function shareUrl(
  origin: string,
  r: ChapterRoute,
  start: number,
  end = start
): string {
  return `${origin}${routeOf(r)}?verse=${verseParam(start, end)}`;
}

/** Wire the browser history to the reading state; returns the cleanup. */
export function bindRoute(reading: () => Reading): () => void {
  if (typeof window === "undefined") return () => {};
  const onPop = () => {
    const r = parseRoute(location.pathname);
    if (r) void reading().goTo(r.translationId, r.bookId, r.chapterNumber);
  };
  window.addEventListener("popstate", onPop);
  return () => window.removeEventListener("popstate", onPop);
}

export function pushRoute(r: ChapterRoute) {
  if (typeof window === "undefined") return;
  const path = routeOf(r);
  // A shared page keeps its own address while it is open; closing it moves the URL to the chapter.
  if (location.pathname === path || location.pathname.startsWith("/shared/"))
    return;
  // A share link's verses belong to the chapter it named, not the next one.
  const q = new URLSearchParams(location.search);
  q.delete("verse");
  q.delete("v");
  const search = q.toString();
  history.pushState(null, "", path + (search ? `?${search}` : ""));
}
