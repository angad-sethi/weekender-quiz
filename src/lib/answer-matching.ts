export function normaliseAnswer(input: string): string {
  let s = input.trim().toLowerCase();
  s = s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  s = s.replace(/^(a|an|the)\s+/i, "");
  s = s.replace(/[\u2018\u2019]/g, "'");
  s = s.replace(/'s\b/g, "s");
  s = s.replace(/(\d+)'s/g, "$1s");
  s = s.replace(/[.,!?;:]+$/, "");
  s = s.replace(/\s+/g, " ");
  return s;
}

/** Damerau-Levenshtein — counts adjacent transpositions as 1 edit. */
export function levenshteinDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () =>
    Array(n + 1).fill(0)
  );

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost
      );
      if (
        i > 1 &&
        j > 1 &&
        a[i - 1] === b[j - 2] &&
        a[i - 2] === b[j - 1]
      ) {
        dp[i][j] = Math.min(dp[i][j], dp[i - 2][j - 2] + 1);
      }
    }
  }

  return dp[m][n];
}

function getThreshold(referenceLength: number): number {
  if (referenceLength <= 3) return 0;
  if (referenceLength <= 6) return 2;
  return 3;
}

export function fuzzyMatch(user: string, reference: string): boolean {
  const threshold = getThreshold(reference.length);
  return levenshteinDistance(user, reference) <= threshold;
}

function splitTokens(s: string): string[] {
  return s
    .split(/[,.]/)

    .map((t) => normaliseAnswer(t))
    .filter(Boolean);
}

/** Check if one string contains the other (min 4 chars for the shorter). */
function containsMatch(a: string, b: string): boolean {
  const shorter = a.length <= b.length ? a : b;
  const longer = a.length <= b.length ? b : a;
  return shorter.length >= 4 && longer.includes(shorter);
}

function tokenFuzzyMatch(user: string, ref: string): boolean {
  return fuzzyMatch(user, ref) || containsMatch(user, ref);
}

export function tokenMatch(
  userAnswer: string,
  referenceAnswer: string,
  ordered: boolean
): boolean {
  const userTokens = splitTokens(userAnswer);
  const refTokens = splitTokens(referenceAnswer);
  if (userTokens.length !== refTokens.length) return false;

  if (ordered) {
    return refTokens.every((ref, i) => tokenFuzzyMatch(userTokens[i], ref));
  }

  const used = new Set<number>();
  return refTokens.every((ref) =>
    userTokens.some((user, i) => {
      if (used.has(i)) return false;
      if (tokenFuzzyMatch(user, ref)) {
        used.add(i);
        return true;
      }
      return false;
    })
  );
}

export function keywordMatch(
  userAnswer: string,
  keywords: string[]
): boolean {
  const normalised = normaliseAnswer(userAnswer);
  return keywords.every((kw) => {
    const alternatives = kw.split("|").map((a) => a.toLowerCase().trim());
    return alternatives.some((alt) => normalised.includes(alt));
  });
}
