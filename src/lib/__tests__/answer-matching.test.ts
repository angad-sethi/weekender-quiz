import { describe, it, expect } from "vitest";
import {
  normaliseAnswer,
  levenshteinDistance,
  fuzzyMatch,
  tokenMatch,
  keywordMatch,
} from "../answer-matching";

describe("normaliseAnswer", () => {
  it("trims whitespace", () => {
    expect(normaliseAnswer("  boats  ")).toBe("boats");
  });

  it("lowercases", () => {
    expect(normaliseAnswer("Boats")).toBe("boats");
  });

  it("strips diacritics", () => {
    expect(normaliseAnswer("Škoda")).toBe("skoda");
  });

  it("strips leading 'a'", () => {
    expect(normaliseAnswer("a possum")).toBe("possum");
  });

  it("strips leading 'an'", () => {
    expect(normaliseAnswer("an apple")).toBe("apple");
  });

  it("strips leading 'the'", () => {
    expect(normaliseAnswer("the harmonica")).toBe("harmonica");
  });

  it("normalises smart apostrophes and possessives", () => {
    expect(normaliseAnswer("1980\u2019s")).toBe("1980s");
  });

  it("converts 's possessive", () => {
    expect(normaliseAnswer("person's")).toBe("persons");
  });

  it("strips trailing punctuation", () => {
    expect(normaliseAnswer("Blood.")).toBe("blood");
    expect(normaliseAnswer("hello!")).toBe("hello");
    expect(normaliseAnswer("yes,")).toBe("yes");
  });

  it("collapses multiple spaces", () => {
    expect(normaliseAnswer("hail   mary")).toBe("hail mary");
  });

  it("handles combined normalisation", () => {
    expect(normaliseAnswer("  The 1980's! ")).toBe("1980s");
    expect(normaliseAnswer("  The 1980's ")).toBe("1980s");
  });
});

describe("levenshteinDistance (Damerau-Levenshtein)", () => {
  it("returns 0 for identical strings", () => {
    expect(levenshteinDistance("boats", "boats")).toBe(0);
  });

  it("returns 1 for single char substitution", () => {
    expect(levenshteinDistance("boat", "moat")).toBe(1);
  });

  it("returns 1 for single char insertion", () => {
    expect(levenshteinDistance("boat", "boats")).toBe(1);
  });

  it("returns 1 for single char deletion", () => {
    expect(levenshteinDistance("boats", "boat")).toBe(1);
  });

  it("returns 1 for adjacent transposition", () => {
    expect(levenshteinDistance("baots", "boats")).toBe(1);
    expect(levenshteinDistance("napels", "naples")).toBe(1);
  });

  it("returns length of non-empty for empty vs non-empty", () => {
    expect(levenshteinDistance("", "hello")).toBe(5);
    expect(levenshteinDistance("hello", "")).toBe(5);
  });

  it("returns 0 for two empty strings", () => {
    expect(levenshteinDistance("", "")).toBe(0);
  });
});

describe("fuzzyMatch", () => {
  it("short reference (≤3): only exact matches", () => {
    expect(fuzzyMatch("k", "k")).toBe(true);
    expect(fuzzyMatch("j", "k")).toBe(false);
    expect(fuzzyMatch("wa", "wa")).toBe(true);
    expect(fuzzyMatch("ws", "wa")).toBe(false);
  });

  it("medium reference (4-6): accepts up to 2 edits", () => {
    expect(fuzzyMatch("boats", "boats")).toBe(true);
    expect(fuzzyMatch("baots", "boats")).toBe(true);
    expect(fuzzyMatch("bots", "boats")).toBe(true);
    expect(fuzzyMatch("xxxxx", "boats")).toBe(false);
  });

  it("long reference (7+): accepts up to 3 edits", () => {
    expect(fuzzyMatch("harmonica", "harmonica")).toBe(true);
    expect(fuzzyMatch("harmoncia", "harmonica")).toBe(true);
    expect(fuzzyMatch("harmunica", "harmonica")).toBe(true);
    expect(fuzzyMatch("hrmunica", "harmonica")).toBe(true);
    expect(fuzzyMatch("xxxxxxxxx", "harmonica")).toBe(false);
  });

  it("rejects over-threshold changes", () => {
    expect(fuzzyMatch("xyz", "boats")).toBe(false);
    expect(fuzzyMatch("completely", "harmonica")).toBe(false);
  });
});

describe("tokenMatch", () => {
  it("ordered: correct order passes", () => {
    expect(
      tokenMatch(
        "AFL, rugby union, rugby league",
        "AFL, rugby union, rugby league",
        true
      )
    ).toBe(true);
  });

  it("ordered: wrong order fails", () => {
    expect(
      tokenMatch(
        "rugby league, AFL, rugby union",
        "AFL, rugby union, rugby league",
        true
      )
    ).toBe(false);
  });

  it("unordered: abbreviated tokens match via substring", () => {
    expect(
      tokenMatch(
        "afl, league, union",
        "AFL, rugby union, rugby league",
        false
      )
    ).toBe(true);
  });

  it("unordered: any order passes", () => {
    expect(
      tokenMatch(
        "sedimentary, igneous, metamorphic",
        "igneous, sedimentary, metamorphic",
        false
      )
    ).toBe(true);
  });

  it("unordered: all tokens must be present", () => {
    expect(
      tokenMatch(
        "igneous, sedimentary",
        "igneous, sedimentary, metamorphic",
        false
      )
    ).toBe(false);
  });

  it("different token counts fail", () => {
    expect(tokenMatch("a, b", "a, b, c", false)).toBe(false);
  });

  it("fuzzy matching applies per token", () => {
    expect(
      tokenMatch(
        "igneeus, sedimentary, metamorphic",
        "igneous, sedimentary, metamorphic",
        false
      )
    ).toBe(true);
  });
});

describe("keywordMatch", () => {
  it("all keywords present returns true", () => {
    expect(
      keywordMatch("tongue freezing to a metal post", [
        "tongue",
        "freez|stuck",
        "metal|pole|post|lamp",
      ])
    ).toBe(true);
  });

  it("missing one keyword returns false", () => {
    expect(
      keywordMatch("freezing to a metal post", [
        "tongue",
        "freez|stuck",
        "metal|pole|post|lamp",
      ])
    ).toBe(false);
  });

  it("pipe alternatives work", () => {
    expect(
      keywordMatch("tongue stuck to a lamp post", [
        "tongue",
        "freez|stuck",
        "metal|pole|post|lamp",
      ])
    ).toBe(true);
  });

  it("is case insensitive", () => {
    expect(
      keywordMatch("TONGUE FREEZING to a METAL post", [
        "tongue",
        "freez|stuck",
        "metal|pole|post|lamp",
      ])
    ).toBe(true);
  });

  it("partial word matching works (freez matches freezing)", () => {
    expect(
      keywordMatch("my tongue was freezing on the pole", [
        "tongue",
        "freez|stuck",
        "metal|pole|post|lamp",
      ])
    ).toBe(true);
  });
});
