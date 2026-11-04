// EVERY WAY OF WRITING A CHAPTER'S ADDRESS LANDS ON SEEDBIBLE.ORG'S: its own links as they are, its three-segment
// form, its query form, this reader's former `/read/{translation}/{BOOK}/{chapter}?v=` (and `?lang=`), a book by
// another name or a close misspelling, and `?v=` for `?verse=`; the canonical address itself, this reader's other
// pages and anything else are left alone.
import { describe, expect, it } from "vitest";
import { legacyTarget } from "../../../apps/reader-web/src/state/reading/legacyRoute";
import {
  parseRoute,
  routeOf,
} from "../../../apps/reader-web/src/state/reading/route";

describe("a chapter's address", () => {
  it("seedbible.org's own form is canonical and stays as it is", () => {
    expect(legacyTarget("/en/BSB/genesis/1", "")).toBeNull();
    expect(legacyTarget("/en/BSB/john/3", "?verse=16-18")).toBeNull();
    expect(legacyTarget("/es/spa_r09/john/3", "?verse=16")).toBeNull();
    expect(legacyTarget("/en/BSB/1-john/2", "?embed=minimal")).toBeNull();
  });

  it("this reader's former /read/ form, with ?v= and ?lang=", () => {
    expect(legacyTarget("/read/BSB/JHN/3", "")).toBe("/en/BSB/john/3");
    expect(legacyTarget("/read/BSB/JHN/3", "?v=16")).toBe(
      "/en/BSB/john/3?verse=16"
    );
    expect(legacyTarget("/read/BSB/JHN/3", "?verse=16-18&embed=minimal")).toBe(
      "/en/BSB/john/3?embed=minimal&verse=16-18"
    );
    expect(legacyTarget("/read/spa_r09/JHN/3", "?lang=es")).toBe(
      "/es/spa_r09/john/3"
    );
    expect(legacyTarget("/read/BSB/1JN/2", "")).toBe("/en/BSB/1-john/2");
  });

  it("the three-segment form, the query form, and ?v= on a canonical path", () => {
    expect(legacyTarget("/BSB/romans/8", "")).toBe("/en/BSB/romans/8");
    expect(
      legacyTarget("/", "?translation=BSB&book=genesis&chapter=12&verse=1")
    ).toBe("/en/BSB/genesis/12?verse=1");
    expect(legacyTarget("/fr", "?translation=BSB&book=genesis")).toBe(
      "/fr/BSB/genesis/1"
    );
    expect(legacyTarget("/en/BSB/john/3", "?v=16")).toBe(
      "/en/BSB/john/3?verse=16"
    );
  });

  it("the book by another of its names or a close misspelling becomes its slug", () => {
    expect(legacyTarget("/en/BSB/1samuel/17", "")).toBe("/en/BSB/1-samuel/17");
    expect(legacyTarget("/en/BSB/song-of-songs/2", "")).toBe(
      "/en/BSB/song-of-solomon/2"
    );
    expect(legacyTarget("/en/BSB/mathew/5", "")).toBe("/en/BSB/matthew/5");
    expect(legacyTarget("/en/BSB/JHN/3", "")).toBe("/en/BSB/john/3");
  });

  it("leaves everything else alone", () => {
    expect(legacyTarget("/", "")).toBeNull();
    expect(legacyTarget("/shared/seedreader.me/playlist/x", "")).toBeNull();
    expect(legacyTarget("/friend/0xabc", "?name=ezra.me")).toBeNull();
    expect(legacyTarget("/en/playlist/abc/12", "")).toBeNull();
    expect(legacyTarget("/en/BSB/notabook/3", "")).toBeNull();
    expect(legacyTarget("/assets/index-abc.js", "")).toBeNull();
    expect(legacyTarget("/en/about", "")).toBeNull();
  });

  it("round-trips both schemes, verse ranges and other languages", () => {
    // The book slug is the English one in every language, as on seedbible.org.
    for (const path of ["/en/BSB/genesis/1", "/es/spa_r09/john/3", "/en/BSB/1-john/2"]) {
      const r = parseRoute(path)!;
      expect(routeOf(r)).toBe(path);
    }
    expect(parseRoute("/read/BSB/jhn/3")).toEqual({
      translationId: "BSB",
      bookId: "JHN",
      chapterNumber: 3,
    });
    expect(parseRoute("/BSB/john/3")).toEqual({
      translationId: "BSB",
      bookId: "JHN",
      chapterNumber: 3,
    });
    expect(routeOf(parseRoute("/read/BSB/JHN/3")!, "fr")).toBe("/fr/BSB/john/3");
    expect(parseRoute("/en/BSB/john/3")?.language).toBe("en");
    expect(parseRoute("/en/playlist/abc/12")).toBeNull();
    expect(parseRoute("/shared/x/y")).toBeNull();
  });
});
