import { describe, it, expect } from "vitest";
import { scoreAnswers } from "../scoring";
import type { Question } from "../questions";

function score(questions: Question[], answers: Record<string, string>) {
  return scoreAnswers(questions, answers);
}

const mcq: Question = {
  id: 7,
  type: "mcq",
  question: "Pick the desert",
  options: ["Great Sandy Desert", "Great Victoria Desert", "Tanami Desert"],
  answer: "Great Victoria Desert",
};

const textDefault: Question = {
  id: 1,
  type: "text",
  question: "A rising tide lifts all...?",
  answer: "Boats",
  acceptableAnswers: [],
};

const textWithSynonym: Question = {
  id: 2,
  type: "text",
  question: "Which Italian city?",
  answer: "Naples",
  acceptableAnswers: ["Napoli"],
};

const textSet: Question = {
  id: 22,
  type: "text",
  question: "Three types of rock?",
  answer: "Igneous, sedimentary, metamorphic",
  acceptableAnswers: [],
  matchType: "set",
};

const textOrdered: Question = {
  id: 4,
  type: "text",
  question: "Rank by team size",
  answer: "AFL, rugby union, rugby league",
  acceptableAnswers: [],
  matchType: "set",
};

const textKeywords: Question = {
  id: 13,
  type: "text",
  question: "What is tundra tongue?",
  answer: "The freezing of a person's tongue to a cold metal object",
  acceptableAnswers: [],
  matchType: "keywords",
  keywords: ["tongue", "freez|stuck", "metal|pole|post|lamp"],
};

describe("scoreAnswers — MCQ", () => {
  it("exact match scores correct", () => {
    const { score: s, results } = score([mcq], { "7": "Great Victoria Desert" });
    expect(s).toBe(1);
    expect(results[0].isCorrect).toBe(true);
  });

  it("wrong option scores incorrect", () => {
    const { score: s } = score([mcq], { "7": "Tanami Desert" });
    expect(s).toBe(0);
  });

  it("missing answer scores incorrect", () => {
    const { score: s, results } = score([mcq], {});
    expect(s).toBe(0);
    expect(results[0].userAnswer).toBe("(no answer)");
  });
});

describe("scoreAnswers — text (default)", () => {
  it("exact match is correct", () => {
    const { score: s } = score([textDefault], { "1": "Boats" });
    expect(s).toBe(1);
  });

  it("case difference is correct", () => {
    const { score: s } = score([textDefault], { "1": "boats" });
    expect(s).toBe(1);
  });

  it("typo within threshold is correct", () => {
    const { score: s } = score([textDefault], { "1": "baots" });
    expect(s).toBe(1);
  });

  it("leading article is stripped", () => {
    const { score: s } = score([textDefault], { "1": "The boats" });
    expect(s).toBe(1);
  });

  it("acceptable answer synonym is correct", () => {
    const { score: s } = score([textWithSynonym], { "2": "Napoli" });
    expect(s).toBe(1);
  });

  it("wrong answer is incorrect", () => {
    const { score: s } = score([textDefault], { "1": "Ships" });
    expect(s).toBe(0);
  });
});

describe("scoreAnswers — text (set)", () => {
  it("correct items, correct order is correct", () => {
    const { score: s } = score([textSet], {
      "22": "Igneous, sedimentary, metamorphic",
    });
    expect(s).toBe(1);
  });

  it("correct items, different order is correct", () => {
    const { score: s } = score([textSet], {
      "22": "Metamorphic, igneous, sedimentary",
    });
    expect(s).toBe(1);
  });

  it("missing item is incorrect", () => {
    const { score: s } = score([textSet], { "22": "Igneous, sedimentary" });
    expect(s).toBe(0);
  });
});

describe("scoreAnswers — text (set, was ordered)", () => {
  it("correct items, correct order is correct", () => {
    const { score: s } = score([textOrdered], {
      "4": "AFL, rugby union, rugby league",
    });
    expect(s).toBe(1);
  });

  it("correct items, different order is correct", () => {
    const { score: s } = score([textOrdered], {
      "4": "rugby league, AFL, rugby union",
    });
    expect(s).toBe(1);
  });

  it("abbreviated tokens match via substring", () => {
    const { score: s } = score([textOrdered], {
      "4": "afl, league, union",
    });
    expect(s).toBe(1);
  });
});

describe("scoreAnswers — text (exact)", () => {
  const stipplingQ: Question = {
    id: 15,
    type: "text",
    question: "Art technique with dots?",
    answer: "Stippling",
    acceptableAnswers: [],
    matchType: "exact",
  };

  it("exact spelling is correct", () => {
    const { score: s } = score([stipplingQ], { "15": "Stippling" });
    expect(s).toBe(1);
  });

  it("case-insensitive match after normalisation is correct", () => {
    const { score: s } = score([stipplingQ], { "15": "stippling" });
    expect(s).toBe(1);
  });

  it("typo is incorrect (no fuzzy match)", () => {
    const { score: s } = score([stipplingQ], { "15": "Stipeling" });
    expect(s).toBe(0);
  });
});

describe("scoreAnswers — text (keywords)", () => {
  it("all keywords present in varied phrasing is correct", () => {
    const { score: s } = score([textKeywords], {
      "13": "when your tongue gets stuck to a metal pole",
    });
    expect(s).toBe(1);
  });

  it("missing a keyword is incorrect", () => {
    const { score: s } = score([textKeywords], {
      "13": "freezing to a metal post",
    });
    expect(s).toBe(0);
  });
});

describe("scoreAnswers — edge cases", () => {
  it("empty answer is incorrect and displayed as '(no answer)'", () => {
    const { results } = score([textDefault], { "1": "" });
    expect(results[0].isCorrect).toBe(false);
    expect(results[0].userAnswer).toBe("(no answer)");
  });

  it("extra whitespace is handled", () => {
    const { score: s } = score([textDefault], { "1": "  Boats  " });
    expect(s).toBe(1);
  });

  it("unicode input is handled", () => {
    const skodaQ: Question = {
      id: 99,
      type: "text",
      question: "Car brand?",
      answer: "Škoda",
      acceptableAnswers: [],
    };
    const { score: s } = score([skodaQ], { "99": "Skoda" });
    expect(s).toBe(1);
  });
});
