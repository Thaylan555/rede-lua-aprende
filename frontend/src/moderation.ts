const blockedPatterns = [
  /\b(porra|caralho|merda|buceta|cacete|arrombado|fdp)\b/i,
  /\b(puta|puto|vadia|vagabunda|vagabundo)\b/i,
  /\b(nazista|nazismo)\b/i,
];

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[@4]/g, "a")
    .replace(/[3]/g, "e")
    .replace(/[1!|]/g, "i")
    .replace(/[0]/g, "o")
    .replace(/[5$]/g, "s")
    .replace(/[_.*~\-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function profileTextIssue(values: { displayName: string; profileTitle: string; bio: string }) {
  const fields = [
    ["nome", values.displayName],
    ["título", values.profileTitle],
    ["bio", values.bio],
  ] as const;

  for (const [label, value] of fields) {
    const normalized = normalizeText(value);
    if (blockedPatterns.some((pattern) => pattern.test(normalized))) {
      return `Dá uma ajustada no ${label}. Esse texto não combina com um espaço escolar.`;
    }
  }
  return null;
}
