export type Role = "student" | "teacher" | "admin";
export type Difficulty = "easy" | "medium" | "hard";
export type ExperienceMode = "classic" | "lunar_rush" | "star_hunt" | "focus";
export type QuestionType = "single" | "true_false";
export type AvatarStyle = "adventurer" | "avataaars" | "personas" | "lorelei" | "notionists" | "bottts" | "pixel-art";

export type AvatarConfig = Record<string, string | number | boolean | string[]>;

export type ProfileTheme = {
  accent: string;
  surface: string;
  background: string;
  card: string;
  pattern: "stars" | "orbit" | "grid" | "plain";
};

export type QuizTheme = {
  preset: string;
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  text: string;
  pattern: "stars" | "orbit" | "grid" | "dots" | "plain";
  buttonShape: "rounded" | "pill" | "square";
  fontStyle: "friendly" | "clean" | "bold";
  logoUrl: string;
  showRedeLuaBrand: boolean;
};

export type GameConfig = {
  timerSeconds: number;
  enforceTimer: boolean;
  speedBonus: boolean;
  speedBonusPercent: number;
  showLeaderboard: boolean;
  showProgress: boolean;
};

export type SessionUser = {
  id: string;
  email: string;
  displayName: string;
  role: Role;
  xp: number;
  level: number;
  streakDays: number;
  bio: string;
  profileTitle: string;
  avatarStyle: AvatarStyle;
  avatarSeed: string;
  avatarConfig: AvatarConfig;
  profileTheme: ProfileTheme;
  profileVisibility: "private" | "classroom";
  favoriteSubjects: string[];
};

export type SessionResponse = {
  authenticated: boolean;
  user: SessionUser | null;
};

export type Activity = {
  id: string;
  title: string;
  subject: string;
  description: string;
  status: "draft" | "published" | "archived";
  difficulty: Difficulty;
  tags: string[];
  questionCount: number;
  experienceMode: ExperienceMode;
  theme: QuizTheme;
  gameConfig: GameConfig;
  createdAt: number;
  updatedAt: number;
};

export type PublicActivity = Pick<Activity, "id" | "title" | "subject" | "description" | "difficulty" | "tags" | "status" | "experienceMode" | "theme" | "gameConfig" | "createdAt" | "updatedAt"> & {
  questionCount?: number;
  score?: number;
};

export type DraftQuestion = {
  prompt: string;
  choices: string[];
  correctIndex: number;
  explanation: string;
  points: number;
  questionType: QuestionType;
  mediaUrl: string;
  hint: string;
  timeLimitSeconds: number;
  shuffleChoices: boolean;
};

export type ForgeQuestion = {
  id: string;
  subject: string;
  skillKey: string;
  prompt: string;
  choices: string[];
  correctIndex: number;
  explanation: string;
  difficulty: Difficulty;
  tags: string[];
  timesUsed: number;
  updatedAt: number;
};

export type TeacherRadar = {
  summary: { games: number; participants: number; answers: number; accuracy: number };
  hotspots: Array<{
    questionId: string;
    prompt: string;
    activityTitle: string;
    subject: string;
    totalAnswers: number;
    wrongAnswers: number;
    errorRate: number;
  }>;
  learners: Array<{
    userId: string;
    displayName: string;
    subject: string;
    masteryScore: number;
    confidence: number;
    attempts: number;
    signal: "intervir" | "acompanhar" | "fluente";
  }>;
  recentGames: Array<{
    id: string;
    code: string;
    status: string;
    title: string;
    subject: string;
    createdAt: string;
    endedAt: string | null;
  }>;
};

export type StudentConstellation = {
  profile: { userId?: string; displayName?: string; xp: number; level: number; streakDays: number };
  mastery: Array<{
    subject: string;
    masteryScore: number;
    confidence: number;
    attempts: number;
    correctCount: number;
    lastResult: boolean | null;
    updatedAt: string;
  }>;
  missions: Array<{
    type: "recuperar" | "explorar" | "desafio";
    label: string;
    activityId: string;
    title: string;
    subject: string;
    description: string;
    difficulty: Difficulty;
    target: number;
    progress: number;
    rewardXp: number;
  }>;
  today: { answers: number; correct: number; accuracy: number };
};

export type HostGame = {
  id: string;
  code: string;
  status: "lobby" | "running" | "finished" | "cancelled";
  currentQuestion: number;
  questionCount: number;
  questionStartedAt: number | null;
  activityTitle: string;
  experienceMode: ExperienceMode;
  theme: QuizTheme;
  gameConfig: GameConfig;
  currentPrompt: string | null;
  currentMediaUrl?: string | null;
  participants: Array<{ id: string; displayName: string; score: number }>;
};

export type ParticipantSession = {
  id: string;
  token: string;
  displayName: string;
};

export type GameState = {
  code: string;
  status: "lobby" | "running" | "finished" | "cancelled";
  currentQuestion: number;
  questionCount: number;
  questionStartedAt: number | null;
  activityTitle: string;
  experienceMode: ExperienceMode;
  theme: QuizTheme;
  gameConfig: GameConfig;
  participant: { id: string; displayName: string; score: number };
  question: null | {
    id: string;
    prompt: string;
    choices: string[];
    points: number;
    orderIndex: number;
    questionType: QuestionType;
    mediaUrl: string | null;
    hint: string;
    timeLimitSeconds: number;
    shuffleChoices: boolean;
  };
  answer: null | { choiceIndex: number; correct: boolean; awardedPoints: number; explanation: string };
  leaderboard: Array<{ id: string; displayName: string; score: number }>;
};
