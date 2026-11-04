// EVERY OTHER WAY OF WRITING A CHAPTER'S ADDRESS LANDS ON THE CANONICAL ONE (`/{lang}/{translation}/{book-slug}/
// {chapter}?verse=`, route.ts): seedbible.org's three-segment form and its query form (`?translation=&book=&chapter=`,
// from TabsManager), this reader's former `/read/{translation}/{BOOK}/{chapter}?v=` (and its `?lang=`), a book
// written as one of its names or a close misspelling, and `?v=` for `?verse=`. The edge answers 308 (worker/index.ts);
// the page turns such an address into its own as it starts (state/index.ts). The canonical address itself, this
// reader's other pages and anything else come back null.
import {
  DEFAULT_UI_LANGUAGE,
  OWN_SEGMENTS,
  SHARED_PAGE_SEGMENTS,
  bookOfSegment,
  parseRoute,
  routeOf,
  verseParam,
  versesOf,
} from "./route";

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

/** The canonical address for a chapter link written another way, or null when it already is one (or is not one). */
export function legacyTarget(pathname: string, search: string): string | null {
  const q = new URLSearchParams(search);
  const segs = pathname.split("/").filter(Boolean).map(decode);
  const verses = versesOf(search);

  let lang: string | null = null;
  let translationId: string | null = null;
  let book: string | null = null;
  let chapter: string | null = null;

  if (segs.length <= 1 && (q.get("book") || q.get("chapter"))) {
    // The old query form, with or without a language segment.
    if (segs.length === 1 && !LANG.test(segs[0]!)) return null;
    lang = segs[0] ?? null;
    translationId = q.get("translation") ?? q.get("translationId");
    book = q.get("book");
    chapter = q.get("chapter") ?? "1";
  } else {
    const r = parseRoute(pathname);
    if (!r) return null;
    const four = segs.length === 4 && segs[0] !== "read";
    if (four && SHARED_PAGE_SEGMENTS.has(segs[1]!.toLowerCase())) return null;
    if (!four && segs[0] !== "read" && OWN_SEGMENTS.has(segs[0]!.toLowerCase()))
      return null;
    lang = r.language ?? q.get("lang");
    translationId = r.translationId;
    book = r.bookId;
    chapter = String(r.chapterNumber);
  }

  const bookId = book ? bookOfSegment(book) : null;
  if (!bookId || !chapter || !CHAPTER.test(chapter)) return null;
  if (translationId && !TRANSLATION.test(translationId)) return null;
  const path = routeOf(
    { translationId: translationId || "BSB", bookId, chapterNumber: Number(chapter) },
    lang && LANG.test(lang) ? lang : DEFAULT_UI_LANGUAGE
  );

  const keep = new URLSearchParams(q);
  for (const k of ["verse", "v", "lang", "translation", "translationId", "book", "chapter"])
    keep.delete(k);
  if (verses) keep.set("verse", verseParam(verses[0], verses[1]));
  const rest = keep.toString();
  const target = `${path}${rest ? `?${rest}` : ""}`;
  const here = `${pathname}${search}`;
  return target === here ? null : target;
}
