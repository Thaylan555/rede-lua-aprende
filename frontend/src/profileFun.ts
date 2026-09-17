export const PROFILE_WIDGET_IDS = ["stats", "streak", "subjects", "signature"] as const;
export type ProfileWidgetId = (typeof PROFILE_WIDGET_IDS)[number];

export const PROFILE_WIDGET_META: Record<ProfileWidgetId, { label: string; note: string }> = {
  stats: { label: "Nível e XP", note: "Mostra seu progresso na Rede Lua." },
  streak: { label: "Sequência", note: "Quantos dias você vem aprendendo." },
  subjects: { label: "Matérias favoritas", note: "As matérias que mais combinam com você." },
  signature: { label: "Selo orbital", note: "Um desenho abstrato único feito a partir do seu perfil." },
};

export function normalizeWidgetOrder(value: unknown): ProfileWidgetId[] {
  if (!Array.isArray(value)) return [...PROFILE_WIDGET_IDS];
  const safe = value.filter((item): item is ProfileWidgetId => typeof item === "string" && PROFILE_WIDGET_IDS.includes(item as ProfileWidgetId));
  const unique = [...new Set(safe)];
  for (const id of PROFILE_WIDGET_IDS) if (!unique.includes(id)) unique.push(id);
  return unique;
}

const studentStarts = ["Explorador", "Piloto", "Capitão", "Guardião", "Inventor", "Navegante", "Caçador", "Mestre", "Viajante", "Comandante"];
const teacherStarts = ["Mentor", "Guia", "Comandante", "Professor", "Mestre", "Cartógrafo", "Navegante", "Guardião"];
const endings = ["Lunar", "de Órion", "da Nebulosa", "do Eclipse", "Estelar", "do Quasar", "da Aurora", "Cósmico", "da Constelação", "do Horizonte"];

export function makeProfileCodename(role: "student" | "teacher" | "admin") {
  const starts = role === "student" ? studentStarts : teacherStarts;
  const a = starts[Math.floor(Math.random() * starts.length)];
  const b = endings[Math.floor(Math.random() * endings.length)];
  return `${a} ${b}`;
}
