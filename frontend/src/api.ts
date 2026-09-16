import { supabase } from "./supabase";
import { trackEvent } from "./analytics";
import { normalizeGameConfig, normalizeQuizTheme } from "./quizTheme";
import type { Activity, AvatarConfig, AvatarStyle, Difficulty, DraftQuestion, ExperienceMode, ForgeQuestion, GameConfig, GameReaction, GameState, HostGame, ParticipantSession, ProfileTheme, PublicActivity, QuizTheme, Role, SessionResponse, SessionUser, StudentConstellation, TeacherRadar } from "./types";

class ApiError extends Error {
  status: number;
  code?: string;
  constructor(message: string, status = 400, code?: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

const messageFor = (message?: string) => {
  if (!message) return "Não foi possível concluir a ação.";
  const known: Record<string, string> = {
    INVALID_TEACHER_CODE: "O código de professor não é válido.",
    TEACHER_REQUIRED: "Esta ação exige uma conta de professor.",
    GAME_NOT_FOUND: "Sala não encontrada.",
    GAME_ALREADY_STARTED: "Essa partida já começou.",
    GAME_NOT_STARTABLE: "A partida não pode ser iniciada agora.",
    GAME_NOT_RUNNING: "A partida não está em andamento.",
    INVALID_PARTICIPANT: "Sua entrada na sala expirou. Entre novamente.",
    ACTIVITY_NOT_FOUND: "Atividade não encontrada.",
    AUTH_REQUIRED: "Entre na sua conta para continuar.",
    INVALID_AVATAR_STYLE: "Esse estilo de avatar não está disponível.",
    INVALID_PROFILE_TITLE: "Escolha um título de perfil válido.",
    BIO_TOO_LONG: "A bio pode ter até 220 caracteres.",
    INVALID_EXPERIENCE_MODE: "Escolha um formato de atividade válido.",
  };
  return known[message] || message.replace(/^.*?:\s*/, "") || "Não foi possível concluir a ação.";
};

function dbError(error: any): never {
  const raw = String(error?.message || error?.error_description || "");
  const code = Object.keys({
    INVALID_TEACHER_CODE: 1, TEACHER_REQUIRED: 1, GAME_NOT_FOUND: 1, GAME_ALREADY_STARTED: 1,
    GAME_NOT_STARTABLE: 1, GAME_NOT_RUNNING: 1, INVALID_PARTICIPANT: 1, ACTIVITY_NOT_FOUND: 1,
    AUTH_REQUIRED: 1, INVALID_AVATAR_STYLE: 1, INVALID_PROFILE_TITLE: 1, BIO_TOO_LONG: 1, INVALID_EXPERIENCE_MODE: 1,
  }).find((key) => raw.includes(key));
  throw new ApiError(messageFor(code || raw), 400, code);
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    headers: { "content-type": "application/json", ...(init?.headers || {}) },
    ...init,
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new ApiError(body.message || "Não foi possível concluir a ação.", response.status, body.error);
  return body as T;
}

async function profileFor(user: { id: string; email?: string | null }): Promise<SessionUser> {
  const { data, error } = await supabase.from("rede_lua_profiles")
    .select("display_name,role,xp,level,streak_days,bio,profile_title,avatar_style,avatar_seed,avatar_config,profile_theme,profile_visibility,favorite_subjects")
    .eq("user_id", user.id)
    .single();
  if (error) dbError(error);
  return {
    id: user.id,
    email: user.email || "",
    displayName: data.display_name,
    role: data.role as Role,
    xp: Number(data.xp || 0),
    level: Number(data.level || 1),
    streakDays: Number(data.streak_days || 0),
    bio: data.bio || "",
    profileTitle: data.profile_title || "Explorador Lunar",
    avatarStyle: (data.avatar_style || "adventurer") as AvatarStyle,
    avatarSeed: data.avatar_seed || user.id,
    avatarConfig: (data.avatar_config || {}) as AvatarConfig,
    profileTheme: ({ accent: "#ffbd2e", surface: "#0b2d68", background: "#071c45", card: "#ffffff", pattern: "stars", ...(data.profile_theme || {}) }) as ProfileTheme,
    profileVisibility: (data.profile_visibility || "private") as "private" | "classroom",
    favoriteSubjects: Array.isArray(data.favorite_subjects) ? data.favorite_subjects : [],
  };
}

async function claimTeacher(code: string) {
  const { data, error } = await supabase.rpc("rede_lua_claim_teacher", { p_code: code });
  if (error) dbError(error);
  if (!data) throw new ApiError("O código de professor não é válido.", 403, "INVALID_TEACHER_CODE");
}

function mapActivity(value: any): Activity {
  return {
    id: value.id,
    title: value.title,
    subject: value.subject,
    description: value.description || "",
    status: value.status,
    difficulty: (value.difficulty || "medium") as Difficulty,
    tags: Array.isArray(value.tags) ? value.tags : [],
    questionCount: Number(value.questionCount ?? value.question_count ?? 0),
    experienceMode: (value.experienceMode ?? value.experience_mode ?? "classic") as ExperienceMode,
    theme: normalizeQuizTheme(value.theme ?? value.theme_config),
    gameConfig: normalizeGameConfig(value.gameConfig ?? value.game_config),
    createdAt: Number(value.createdAt ?? (value.created_at ? new Date(value.created_at).getTime() : Date.now())),
    updatedAt: Number(value.updatedAt ?? (value.updated_at ? new Date(value.updated_at).getTime() : Date.now())),
  };
}

function mapPublicActivity(value: any): PublicActivity {
  return { ...mapActivity(value), score: value.score == null ? undefined : Number(value.score) };
}

function mapRadar(data: any): TeacherRadar {
  const summary = data?.summary || {};
  return {
    summary: { games: Number(summary.games || 0), participants: Number(summary.participants || 0), answers: Number(summary.answers || 0), accuracy: Number(summary.accuracy || 0) },
    hotspots: (data?.hotspots || []).map((item: any) => ({ questionId: item.question_id, prompt: item.prompt, activityTitle: item.activity_title, subject: item.subject, totalAnswers: Number(item.total_answers || 0), wrongAnswers: Number(item.wrong_answers || 0), errorRate: Number(item.error_rate || 0) })),
    learners: (data?.learners || []).map((item: any) => ({ userId: item.user_id, displayName: item.display_name, subject: item.subject, masteryScore: Number(item.mastery_score || 0), confidence: Number(item.confidence || 0), attempts: Number(item.attempts || 0), signal: item.signal })),
    recentGames: (data?.recentGames || []).map((item: any) => ({ id: item.id, code: item.code, status: item.status, title: item.title, subject: item.subject, createdAt: item.created_at, endedAt: item.ended_at || null })),
  };
}

function mapConstellation(data: any): StudentConstellation {
  const profile = data?.profile || {};
  const today = data?.today || {};
  return {
    profile: { userId: profile.user_id, displayName: profile.display_name, xp: Number(profile.xp || 0), level: Number(profile.level || 1), streakDays: Number(profile.streak_days || 0) },
    mastery: (data?.mastery || []).map((item: any) => ({ subject: item.subject, masteryScore: Number(item.mastery_score || 0), confidence: Number(item.confidence || 0), attempts: Number(item.attempts || 0), correctCount: Number(item.correct_count || 0), lastResult: item.last_result ?? null, updatedAt: item.updated_at })),
    missions: (data?.missions || []).map((item: any) => ({ type: item.type, label: item.label, activityId: item.activity_id, title: item.title, subject: item.subject, description: item.description || "", difficulty: (item.difficulty || "medium") as Difficulty, target: Number(item.target || 0), progress: Number(item.progress || 0), rewardXp: Number(item.reward_xp || 0) })),
    today: { answers: Number(today.answers || 0), correct: Number(today.correct || 0), accuracy: Number(today.accuracy || 0) },
  };
}

export const api = {
  session: async (): Promise<SessionResponse> => {
    const { data, error } = await supabase.auth.getSession();
    if (error || !data.session?.user) return { authenticated: false, user: null };
    const pendingCode = localStorage.getItem("rede-lua-pending-teacher-code");
    if (pendingCode) {
      try { await claimTeacher(pendingCode); localStorage.removeItem("rede-lua-pending-teacher-code"); }
      catch { /* deixa o código salvo para o usuário tentar novamente */ }
    }
    try { return { authenticated: true, user: await profileFor(data.session.user) }; }
    catch { return { authenticated: false, user: null }; }
  },

  login: async (payload: { email: string; password: string; teacherCode?: string }) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email: payload.email.trim(), password: payload.password });
    if (error || !data.user) throw new ApiError(error?.message || "E-mail ou senha incorretos.", 401, "INVALID_CREDENTIALS");
    const pendingCode = payload.teacherCode?.trim() || localStorage.getItem("rede-lua-pending-teacher-code");
    if (pendingCode) {
      await claimTeacher(pendingCode);
      localStorage.removeItem("rede-lua-pending-teacher-code");
    }
    trackEvent("auth", "login");
    return { ok: true as const, user: await profileFor(data.user) };
  },

  activateTeacher: async (code: string) => {
    if (!code.trim()) throw new ApiError("Digite o código de professor.", 400);
    await claimTeacher(code.trim());
    const { data } = await supabase.auth.getUser();
    if (!data.user) throw new ApiError("Entre novamente na sua conta.", 401);
    trackEvent("auth", "activate_teacher");
    return { ok: true as const, user: await profileFor(data.user) };
  },

  register: async (payload: { displayName: string; email: string; password: string; role: Exclude<Role, "admin">; teacherCode?: string }) => {
    if (payload.role === "teacher" && !payload.teacherCode?.trim()) throw new ApiError("Digite o código de professor.", 400);
    const { data, error } = await supabase.auth.signUp({
      email: payload.email.trim(),
      password: payload.password,
      options: { data: { display_name: payload.displayName.trim() } },
    });
    if (error) throw new ApiError(error.message, 400, (error as any).code);
    if (!data.user) throw new ApiError("Não foi possível criar a conta.", 400);

    if (payload.role === "teacher" && payload.teacherCode) {
      if (data.session) await claimTeacher(payload.teacherCode.trim());
      else localStorage.setItem("rede-lua-pending-teacher-code", payload.teacherCode.trim());
    }
    trackEvent("auth", "register", payload.role);
    return {
      ok: true as const,
      user: data.session ? await profileFor(data.user) : null,
      requiresConfirmation: !data.session,
      teacherPending: payload.role === "teacher" && !data.session,
    };
  },

  logout: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw new ApiError(error.message);
    return { ok: true as const };
  },

  updateProfile: async (payload: { displayName: string; bio: string; profileTitle: string; avatarStyle: AvatarStyle; avatarSeed: string; avatarConfig: AvatarConfig; profileTheme: ProfileTheme; visibility: "private" | "classroom"; favoriteSubjects: string[] }) => {
    const { data, error } = await supabase.rpc("rede_lua_update_profile_studio", {
      p_display_name: payload.displayName, p_bio: payload.bio, p_profile_title: payload.profileTitle,
      p_avatar_style: payload.avatarStyle, p_avatar_seed: payload.avatarSeed, p_avatar_config: payload.avatarConfig,
      p_profile_theme: payload.profileTheme, p_visibility: payload.visibility, p_favorite_subjects: payload.favoriteSubjects.slice(0, 8),
    });
    if (error) dbError(error);
    trackEvent("profile", "save", payload.avatarStyle);
    return { ok: true as const, profile: data };
  },

  uploadEducationImage: async (file: File, folder: "themes" | "questions" = "themes") => {
    if (!['image/png','image/jpeg','image/webp'].includes(file.type)) throw new ApiError("Use PNG, JPG ou WebP.");
    if (file.size > 3 * 1024 * 1024) throw new ApiError("A imagem pode ter no máximo 3 MB.");
    const { data: auth } = await supabase.auth.getSession();
    const uid = auth.session?.user.id;
    if (!uid) throw new ApiError("Entre na sua conta para enviar imagens.", 401);
    const ext = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg';
    const path = `${uid}/${folder}/${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from("rede-lua-assets").upload(path, file, { cacheControl: "31536000", upsert: false, contentType: file.type });
    if (error) dbError(error);
    const { data } = supabase.storage.from("rede-lua-assets").getPublicUrl(path);
    return { path, url: data.publicUrl };
  },

  myActivities: async () => {
    const { data, error } = await supabase.rpc("rede_lua_my_activities");
    if (error) dbError(error);
    return { activities: (Array.isArray(data) ? data : []).map(mapActivity) };
  },

  createActivity: async (payload: { title: string; subject: string; description: string; status: "draft" | "published"; difficulty: Difficulty; tags: string[]; questions: DraftQuestion[]; experienceMode: ExperienceMode; theme: QuizTheme; gameConfig: GameConfig }) => {
    const { data, error } = await supabase.rpc("rede_lua_create_activity_v2", {
      p_title: payload.title,
      p_subject: payload.subject,
      p_description: payload.description,
      p_status: payload.status,
      p_difficulty: payload.difficulty,
      p_tags: payload.tags,
      p_questions: payload.questions,
      p_experience_mode: payload.experienceMode,
      p_theme_config: payload.theme,
      p_game_config: payload.gameConfig,
    });
    if (error) dbError(error);
    const activity = mapActivity(data);
    trackEvent("teacher", "create_activity", activity.subject);
    return { ok: true as const, activity };
  },

  deleteActivity: async (id: string) => {
    const { data, error } = await supabase.rpc("rede_lua_remove_activity", { p_activity_id: id });
    if (error) dbError(error);
    return data as { ok: true; archived: boolean; message: string };
  },

  duplicateActivity: async (id: string) => {
    const { data, error } = await supabase.rpc("rede_lua_duplicate_activity", { p_activity_id: id });
    if (error) dbError(error);
    return data as { ok: true; id: string; title: string };
  },

  createGame: async (activityId: string) => {
    const { data, error } = await supabase.rpc("rede_lua_create_game", { p_activity_id: activityId });
    if (error) dbError(error);
    trackEvent("game", "create_room");
    return { ok: true as const, game: data as { id: string; code: string; status: string; activityTitle: string } };
  },
  hostGame: async (code: string) => {
    const { data, error } = await supabase.rpc("rede_lua_host_game_state", { p_code: code });
    if (error) dbError(error);
    return { game: data as HostGame };
  },
  startGame: async (code: string) => {
    const { data, error } = await supabase.rpc("rede_lua_start_game", { p_code: code });
    if (error) dbError(error);
    return data as { ok: true };
  },
  nextQuestion: async (code: string) => {
    const { data, error } = await supabase.rpc("rede_lua_next_question", { p_code: code });
    if (error) dbError(error);
    return data as { ok: true; finished: boolean; currentQuestion?: number };
  },
  joinGame: async (code: string, displayName: string) => {
    const { data, error } = await supabase.rpc("rede_lua_join_game", { p_code: code, p_display_name: displayName });
    if (error) dbError(error);
    trackEvent("game", "join_room");
    return data as { participant: ParticipantSession; game: { code: string; status: string } };
  },
  gameState: async (code: string, participant: ParticipantSession) => {
    const { data, error } = await supabase.rpc("rede_lua_game_state", { p_code: code, p_participant_id: participant.id, p_token: participant.token });
    if (error) dbError(error);
    return { game: data as GameState };
  },
  answer: async (code: string, participant: ParticipantSession, questionId: string, choiceIndex: number) => {
    const { data, error } = await supabase.rpc("rede_lua_answer", { p_code: code, p_participant_id: participant.id, p_token: participant.token, p_question_id: questionId, p_choice_index: choiceIndex });
    if (error) dbError(error);
    return data as { correct: boolean; awardedPoints: number; speedBonus: number; timedOut: boolean; explanation: string };
  },

  sendReaction: async (code: string, participant: ParticipantSession, reactionId: GameReaction["reactionId"]) => {
    const { data, error } = await supabase.rpc("rede_lua_send_reaction", { p_code: code, p_participant_id: participant.id, p_token: participant.token, p_reaction_id: reactionId });
    if (error) dbError(error);
    return data as { ok: true; accepted: boolean; throttled?: boolean; reactionId?: string };
  },
  gameReactions: async (code: string, participant: ParticipantSession) => {
    const { data, error } = await supabase.rpc("rede_lua_recent_reactions", { p_code: code, p_participant_id: participant.id, p_token: participant.token, p_limit: 12 });
    if (error) dbError(error);
    return { reactions: (Array.isArray(data) ? data : []) as GameReaction[] };
  },
  hostReactions: async (code: string) => {
    const { data, error } = await supabase.rpc("rede_lua_host_recent_reactions", { p_code: code, p_limit: 20 });
    if (error) dbError(error);
    return { reactions: (Array.isArray(data) ? data : []) as GameReaction[] };
  },

  searchActivities: async (q: string) => {
    const { data, error } = await supabase.rpc("rede_lua_search_activities", { p_query: q, p_limit: 12 });
    if (error) dbError(error);
    return { q, engine: "luacore" as const, activities: (Array.isArray(data) ? data : []).map(mapPublicActivity) };
  },
  recommendations: async () => {
    const { data: session } = await supabase.auth.getSession();
    const { data, error } = await supabase.rpc("rede_lua_recommend_activities", { p_limit: 8 });
    if (error) dbError(error);
    return { engine: "luacore" as const, personalized: Boolean(session.session?.user), activities: (Array.isArray(data) ? data : []).map(mapPublicActivity) };
  },
  trackActivity: async (activityId: string, eventType: "view" | "start" | "complete" | "like") => {
    const { data } = await supabase.auth.getSession();
    if (data.session) await supabase.rpc("rede_lua_record_activity_event", { p_activity_id: activityId, p_event_type: eventType });
    trackEvent("activity", eventType, undefined, activityId);
  },

  forgeQuestions: async (subject?: string) => {
    const { data, error } = await supabase.rpc("rede_lua_forge_questions", { p_subject: subject || null, p_limit: 40 });
    if (error) dbError(error);
    const questions: ForgeQuestion[] = (Array.isArray(data) ? data : []).map((item: any) => ({
      id: item.id, subject: item.subject, skillKey: item.skill_key, prompt: item.prompt,
      choices: Array.isArray(item.choices) ? item.choices : [], correctIndex: Number(item.correct_index || 0),
      explanation: item.explanation || "", difficulty: item.difficulty as Difficulty, tags: Array.isArray(item.tags) ? item.tags : [],
      timesUsed: Number(item.times_used || 0), updatedAt: new Date(item.updated_at).getTime(),
    }));
    return { questions };
  },
  saveForgeQuestion: async (payload: { subject: string; skillKey: string; question: DraftQuestion; difficulty: Difficulty; tags?: string[] }) => {
    const { data, error } = await supabase.rpc("rede_lua_save_forge_question", {
      p_subject: payload.subject, p_skill_key: payload.skillKey, p_prompt: payload.question.prompt, p_choices: payload.question.choices,
      p_correct_index: payload.question.correctIndex, p_explanation: payload.question.explanation, p_difficulty: payload.difficulty, p_tags: payload.tags || [],
    });
    if (error) dbError(error);
    trackEvent("teacher", "forge_save", payload.subject);
    return { ok: true as const, id: data as string };
  },
  teacherRadar: async (days = 30) => {
    const { data, error } = await supabase.rpc("rede_lua_teacher_radar", { p_days: days });
    if (error) dbError(error);
    return mapRadar(data || {});
  },
  studentConstellation: async () => {
    const { data, error } = await supabase.rpc("rede_lua_student_constellation");
    if (error) dbError(error);
    return mapConstellation(data || {});
  },

  books: (q: string) => request<{ books: Array<{ key: string; title: string; authors: string[]; year: number | null; coverUrl: string | null }> }>(`/api/discover/books?q=${encodeURIComponent(q)}`),
  wiki: (q: string) => request<{ results: Array<{ title: string; extract: string; thumbnail: string | null; url: string | null }> }>(`/api/discover/wiki?q=${encodeURIComponent(q)}`),
  states: () => request<{ states: Array<{ id: number; sigla: string; nome: string; regiao: string }> }>("/api/discover/ibge/states"),
  weather: (city: string) => request<{ place: null | { name: string; admin1: string; country: string; latitude: number; longitude: number }; current: any; daily: Array<{ date: string; max: number; min: number; rainChance: number }> }>(`/api/discover/weather?city=${encodeURIComponent(city)}`),
  world: (country: string, metric: string) => request<{ country: string; metric: { key: string; label: string; unit: string }; points: Array<{ year: string; value: number }> }>(`/api/discover/world?country=${encodeURIComponent(country)}&metric=${encodeURIComponent(metric)}`),
};

export { ApiError };
