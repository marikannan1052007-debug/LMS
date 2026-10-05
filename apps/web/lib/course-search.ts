export type SearchableCourse = Record<string, unknown>;

// Dynamic field weights (can be customized or passed as arguments)
const FIELD_WEIGHTS: Record<string, number> = {
  title: 100,
  name: 100,
  category: 70,
  tags: 60,
  level: 30,
  description: 20,
};

function normalize(value: unknown): string {
  if (value === null || value === undefined) return "";

  // Handle arrays (e.g., tags: ["react", "nextjs"])
  if (Array.isArray(value)) {
    return value.map(normalize).join(" ");
  }

  // Handle nested objects
  if (typeof value === "object") {
    return Object.values(value).map(normalize).join(" ");
  }

  return String(value)
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function levenshtein(a: string, b: string): number {
  const matrix: number[][] = [];

  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b[i - 1] === a[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1,
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

function similarWord(queryWord: string, textWord: string): boolean {
  if (!queryWord || !textWord) return false;
  if (textWord.includes(queryWord) || queryWord.includes(textWord)) return true;

  if (queryWord.length < 4 || textWord.length < 4) return false;

  const maxDistance = Math.floor(queryWord.length / 4);
  return levenshtein(queryWord, textWord) <= maxDistance;
}

function wordMatches(queryWord: string, text: string): boolean {
  const words = normalize(text).split(" ");
  return words.some((textWord) => similarWord(queryWord, textWord));
}

function extractFields(
  obj: Record<string, unknown>,
  prefix = "",
): { key: string; value: string }[] {
  const fields: { key: string; value: string }[] = [];

  for (const [key, val] of Object.entries(obj)) {
    if (val === null || val === undefined) continue;

    const fullKey = prefix ? `${prefix}.${key}` : key;

    if (typeof val === "object" && !Array.isArray(val)) {
      fields.push(...extractFields(val as Record<string, unknown>, fullKey));
    } else {
      const normalizedValue = normalize(val);
      if (normalizedValue) {
        fields.push({ key, value: normalizedValue });
      }
    }
  }

  return fields;
}

export function searchCourses<T extends SearchableCourse>(
  courses: T[],
  query: string,
  customFieldWeights: Record<string, number> = {},
): T[] {
  const normalizedQuery = normalize(query);

  if (!normalizedQuery) {
    return courses;
  }

  const queryWords = normalizedQuery.split(" ");
  const mergedWeights = { ...FIELD_WEIGHTS, ...customFieldWeights };

  return courses
    .map((course) => {
      const fields = extractFields(course);
      let score = 0;

      for (const { key, value } of fields) {
        // Fallback weight for unrecognized fields is 10
        const weight = mergedWeights[key.toLowerCase()] ?? 10;

        for (const queryWord of queryWords) {
          // Direct substring match
          if (value.includes(queryWord)) {
            score += weight;
          }

          // Fuzzy word match (handles typos)
          if (wordMatches(queryWord, value)) {
            score += weight * 0.5;
          }
        }
      }

      return { course, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((item) => item.course);
}