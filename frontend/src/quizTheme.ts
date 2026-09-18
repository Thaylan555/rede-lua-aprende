import type { ExperienceMode, GameConfig, QuizTheme } from "./types";

export const DEFAULT_QUIZ_THEME: QuizTheme = {
  preset: "lua",
  primary: "#0b4aa2",
  secondary: "#ffbd2e",
  background: "#071c45",
  surface: "#ffffff",
  text: "#071c45",
  pattern: "stars",
  buttonShape: "rounded",
  fontStyle: "friendly",
  logoUrl: "",
  showRedeLuaBrand: true,
};

export const DEFAULT_GAME_CONFIG: GameConfig = {
  timerSeconds: 20,
  enforceTimer: false,
  speedBonus: false,
  speedBonusPercent: 25,
  showLeaderboard: true,
  showProgress: true,
};

export const THEME_PRESETS: Array<{ id: string; label: string; note: string; theme: QuizTheme }> = [
  { id: "lua", label: "Lua Clássica", note: "Azul profundo e dourado da Rede Lua.", theme: DEFAULT_QUIZ_THEME },
  { id: "aurora", label: "Aurora", note: "Roxo espacial, ciano e cartões claros.", theme: { ...DEFAULT_QUIZ_THEME, preset: "aurora", primary: "#6d4aff", secondary: "#4de8d4", background: "#160d3b", surface: "#fbfaff", text: "#21184b", pattern: "orbit" } },
  { id: "natureza", label: "Natureza", note: "Verde e creme para ciências e biologia.", theme: { ...DEFAULT_QUIZ_THEME, preset: "natureza", primary: "#1d7a55", secondary: "#f5bd36", background: "#0e3c2d", surface: "#fffdf2", text: "#15382b", pattern: "dots" } },
  { id: "neon", label: "Laboratório Neon", note: "Contraste alto para desafios rápidos.", theme: { ...DEFAULT_QUIZ_THEME, preset: "neon", primary: "#7c3cff", secondary: "#35f2b5", background: "#070815", surface: "#17182d", text: "#f7f6ff", pattern: "grid", buttonShape: "pill", fontStyle: "bold" } },
  { id: "papel", label: "Caderno", note: "Visual claro inspirado em folhas de estudo.", theme: { ...DEFAULT_QUIZ_THEME, preset: "papel", primary: "#2158a8", secondary: "#ffb425", background: "#eef3fb", surface: "#ffffff", text: "#14233d", pattern: "grid", fontStyle: "clean" } },
];

export const EXPERIENCE_MODES: Array<{ id: ExperienceMode; label: string; note: string; recommended: Partial<GameConfig> }> = [
  { id: "classic", label: "Quiz Clássico", note: "Perguntas, pontuação e ranking sem pressão de tempo.", recommended: { enforceTimer: false, speedBonus: false } },
  { id: "lunar_rush", label: "Corrida Lunar", note: "Cronômetro e bônus de velocidade calculados no servidor.", recommended: { enforceTimer: true, speedBonus: true, speedBonusPercent: 30, timerSeconds: 20 } },
  { id: "star_hunt", label: "Caça às Estrelas", note: "Visual de coleta de estrelas com pontuação e progresso em destaque.", recommended: { enforceTimer: false, speedBonus: false, showProgress: true } },
  { id: "focus", label: "Modo Foco", note: "Menos distrações: ranking escondido durante as perguntas.", recommended: { enforceTimer: false, speedBonus: false, showLeaderboard: false } },
  { id: "boss_battle", label: "Batalha de Chefão", note: "A turma derruba a energia de um chefão a cada etapa vencida.", recommended: { enforceTimer: false, speedBonus: false, showProgress: true, showLeaderboard: true } },
  { id: "treasure_hunt", label: "Caça ao Tesouro", note: "Cada acerto revela uma nova pista do mapa.", recommended: { enforceTimer: false, speedBonus: false, showProgress: true, showLeaderboard: false } },
  { id: "space_race", label: "Corrida Espacial", note: "Uma corrida visual de progresso entre os participantes.", recommended: { enforceTimer: true, speedBonus: true, speedBonusPercent: 20, timerSeconds: 25 } },
  { id: "card_duel", label: "Duelo de Cartas", note: "Perguntas aparecem como cartas de desafio em rodadas curtas.", recommended: { enforceTimer: false, speedBonus: false, showProgress: true, showLeaderboard: true } },
];

export function normalizeQuizTheme(value: any): QuizTheme {
  return { ...DEFAULT_QUIZ_THEME, ...(value || {}) };
}

export function normalizeGameConfig(value: any): GameConfig {
  return { ...DEFAULT_GAME_CONFIG, ...(value || {}) };
}
