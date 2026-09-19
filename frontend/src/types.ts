export type Role = "student" | "teacher" | "admin";
export type Difficulty = "easy" | "medium" | "hard";
export type ExperienceMode = "classic" | "lunar_rush" | "star_hunt" | "focus" | "boss_battle" | "treasure_hunt" | "space_race" | "card_duel";
export type QuestionType = "single" | "true_false";
export type AvatarStyle = "lua-mates" | "adventurer" | "avataaars" | "personas" | "lorelei" | "notionists" | "bottts" | "pixel-art" | "big-smile" | "fun-emoji" | "croodles" | "micah";

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
  moonCoins: number;
  accountStatus: "active" | "suspended";
  profileHandle?: string;
  lifeNumber: number;
  lifeXp: number;
  legacyStars: number;
  bestLevel: number;
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
  shared?: boolean;
  updatedAt: number;
};

export type CreatorProfile = {
  stats: { activities: number; games: number; participants: number; answers: number; minutesPlayed: number; accuracy: number; creatorXp: number; creatorLevel: number };
  badges: Array<{ id: string; label: string; note: string; icon: string }>;
  showcase: Array<{ id: string; title: string; subject: string; difficulty: Difficulty; experienceMode: ExperienceMode; theme: QuizTheme; plays: number; questions: number }>;
};

export type SharedForgeQuestion = ForgeQuestion & { creatorName: string };

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

export type PlayerProfile = {
  coins: number;
  gamesCompleted: number;
  answers: number;
  correct: number;
  accuracy: number;
  badges: Array<{ id: string; label: string; note: string; icon: string }>;
  history: Array<{ gameId: string; title: string; subject: string; score: number; endedAt: string | null }>;
};

export type CosmeticsState = { coins: number; unlocks: string[] };

export type GameReaction = {
  id: string;
  reactionId: "heart" | "curious" | "happy" | "cool" | "focus" | "idea" | "popcorn" | "shiba";
  participantId: string;
  displayName: string;
  createdAt: number;
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

export type AdminDashboard = {
  users: number;
  students: number;
  teachers: number;
  admins: number;
  suspended: number;
  activities: number;
  gamesToday: number;
  answersToday: number;
  activeAnnouncements: number;
  recentUsers: Array<{ userId: string; displayName: string; role: Role; level: number; status: "active" | "suspended"; createdAt: string }>;
};

export type AdminUserRow = {
  userId: string;
  displayName: string;
  email: string;
  role: Role;
  level: number;
  xp: number;
  moonCoins: number;
  accountStatus: "active" | "suspended";
  createdAt: string;
};

export type AdminAnnouncement = {
  id: string;
  title: string;
  body: string;
  audience: "all" | "students" | "teachers";
  style: "info" | "success" | "warning" | "event";
  active: boolean;
  startsAt: string;
  endsAt: string | null;
  createdAt: string;
};

export type FeatureFlag = {
  key: string;
  enabled: boolean;
  description: string;
  config: Record<string, unknown>;
  updatedAt?: string;
};

export type TeacherInviteAdmin = {
  id: string;
  label: string;
  active: boolean;
  maxUses: number;
  uses: number;
  expiresAt: string | null;
  createdAt: string;
};

export type AdminAuditEntry = {
  id: number;
  adminId: string;
  adminName: string;
  action: string;
  targetType: string;
  targetId: string;
  details: Record<string, unknown>;
  createdAt: string;
};

export type CosmeticCatalogItem = {
  id: string;
  label: string;
  note: string;
  kind: "head" | "face" | "aura" | "frame" | "theme" | "species" | "outfit" | "companion" | "expression" | "background";
  value: string;
  cost: number;
  level: number;
  emoji: string;
  active?: boolean;
};

export type AdminActivityRow = {
  id: string;
  title: string;
  subject: string;
  status: "draft" | "published" | "archived";
  authorId: string;
  authorName: string;
  games: number;
  questions: number;
  createdAt: string;
};


export type StudyQuestion = {
  id: string;
  prompt: string;
  choices: string[];
  hint: string;
  mediaUrl: string | null;
  questionType: QuestionType;
  points: number;
};

export type StudyState = {
  sessionId: string;
  status: "active" | "completed" | "abandoned";
  activityId: string;
  title: string;
  subject: string;
  currentIndex: number;
  questionCount: number;
  correctCount: number;
  totalAttempts: number;
  attemptsOnQuestion?: number;
  question: StudyQuestion | null;
};

export type StudyAttemptResult = {
  correct: boolean;
  attempts: number;
  earnedXp: number;
  coach: string;
  explanation: string;
  completed: boolean;
  state: StudyState;
};

export type LuaIdManifest = {
  version: string;
  id: string;
  handle: string;
  displayName: string;
  role: Role;
  title: string;
  bio: string;
  level: number;
  xp: number;
  streakDays: number;
  moonCoins: number;
  avatar: { style: AvatarStyle; seed: string; config: AvatarConfig };
  theme: ProfileTheme;
  favoriteSubjects: string[];
  visibility: "private" | "classroom";
  player: PlayerProfile;
  creator: CreatorProfile | null;
  updatedAt: string;
};

export type ContactPayload = {
  name: string;
  email: string;
  topic: "suporte" | "contato" | "escola" | "professor" | "privacidade";
  message: string;
};
export type AdminContactMessage = {
  id: string;
  name: string;
  email: string;
  topic: ContactPayload["topic"];
  message: string;
  status: "new" | "open" | "resolved" | "spam";
  createdAt: string;
};



export type PersonalRecord = {
  key: string;
  label: string;
  value: number;
  meta: Record<string, unknown>;
  achievedAt: string;
};

export type LifeHistoryEntry = {
  id: string;
  lifeNumber: number;
  finalLifeXp: number;
  legacyStarsEarned: number;
  avatarSnapshot: Record<string, unknown>;
  recordSnapshot: Record<string, unknown>;
  endedAt: string;
};

export type RecordsProfile = {
  life: {
    number: number;
    xp: number;
    level: number;
    nextLifeXp: number;
    ready: boolean;
    legacyStars: number;
    lastRebirthAt: string | null;
  };
  summary: {
    gamesCompleted: number;
    answers: number;
    correct: number;
    accuracy: number;
    bestGameScore: number;
    largestRoom: number;
  };
  records: PersonalRecord[];
  history: LifeHistoryEntry[];
};

export type NewLifeResult = {
  ok: true;
  lifeNumber: number;
  legacyStarsEarned: number;
  species: string;
  message: string;
};
