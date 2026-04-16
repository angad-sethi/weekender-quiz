# Quiz Question Authoring Guide

Use this guide when converting question/answer images into `questions.json`.

## Decision Tree

For each question, determine the answer type:

### 1. Multiple Choice → `type: "mcq"`
The question presents fixed options.
- Set `options` to the array of choices
- Set `answer` to the correct option string (must match exactly)
- No `acceptableAnswers`, `matchType`, or `keywords` needed

### 2. Single Word / Short Phrase → `type: "text"` (default matching)
Examples: "Boats", "Naples", "K", "Harmonica"
- Set `answer` to the canonical answer
- `matchType` can be omitted (defaults to `"default"`)
- Fuzzy matching handles typos automatically
- Only add `acceptableAnswers` for:
  - Genuine synonyms ("Napoli" for "Naples")
  - Abbreviations ("WA" for "Western Australia")
  - Alternate names ("Lady" for "Pauline" in the Donkey Kong question)
  - Partial names where you'd accept just surname ("Woolf" for "Virginia Woolf")
- Do NOT add case/article variants — normalisation handles those

### 3. List (Order Matters) → `type: "text"`, `matchType: "ordered"`
The question asks to rank or sequence items.
Example: "Rank by team size: AFL, rugby union, rugby league"
- Set `answer` to the comma-separated canonical order
- Set `matchType` to `"ordered"`
- Tokens are compared position-by-position with fuzzy matching
- `acceptableAnswers` usually empty — only needed for genuine alternate names within tokens

### 4. List (Order Doesn't Matter) → `type: "text"`, `matchType: "set"`
The question asks to name multiple items without ranking.
Example: "What are the three types of rock?"
- Set `answer` to comma-separated items (any order is fine for display)
- Set `matchType` to `"set"`
- All tokens must be present regardless of order, each fuzzy matched
- `acceptableAnswers` usually empty

### 5. Descriptive / Sentence Answer → `type: "text"`, `matchType: "keywords"`
The expected answer is a description or explanation.
Example: "What is tundra tongue?" → "tongue freezing to metal"
- Set `answer` to the full canonical answer (shown on results page)
- Set `matchType` to `"keywords"`
- Set `keywords` to an array of required concepts
- Use `|` (pipe) within a keyword for alternatives:
  `"freez|stuck"` means either "freez" (matches "freeze", "freezing") or "stuck"
- All keyword entries must match (AND logic); alternatives within an entry are OR logic
- `acceptableAnswers` usually empty

## Normalisation (automatic, no action needed)

The following are handled automatically — do NOT create `acceptableAnswers` entries for these:
- Case differences: "boats" vs "Boats"
- Leading articles: "A possum" vs "Possum"
- Trailing punctuation: "Blood." vs "Blood"
- Unicode/diacritics: "Škoda" vs "Skoda"
- Apostrophe variants: "1980's" vs "1980s"
- Extra whitespace

## Fuzzy Matching Thresholds (automatic)

- Answers ≤ 3 characters: exact match only (no typo tolerance)
- Answers 4–6 characters: 2 character tolerance
- Answers 7+ characters: 3 character tolerance

Keep this in mind for short answers — "K" (potassium) won't fuzzy match, which is correct.

## Template

```json
{
  "id": <next_id>,
  "type": "text",
  "question": "<question text>",
  "answer": "<canonical answer shown on results>",
  "acceptableAnswers": ["<only genuine synonyms/abbreviations>"],
  "matchType": "<default|set|ordered|keywords>",
  "keywords": ["<required>", "<concept|alternative>"]
}
```

Omit `matchType` if default. Omit `keywords` if not using keyword matching.
