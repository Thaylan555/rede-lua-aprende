import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, BarChart3, Check, Copy, Gamepad2, GraduationCap, ImagePlus, LibraryBig, LoaderCircle, Palette, Play, Plus, Rocket, Save, Sparkles, Timer, Trash2, Upload, Users, WandSparkles } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";
import { api } from "../api";
import { useRegionalVoice } from "../regionalVoice";
import { DEFAULT_GAME_CONFIG, DEFAULT_QUIZ_THEME, THEME_PRESETS } from "../quizTheme";
import type { Difficulty, DraftQuestion, ExperienceMode, GameConfig, QuizTheme, SessionUser } from "../types";

const makeQuestion = (): DraftQuestion => ({ prompt: "", choices: ["", "", "", ""], correctIndex: 0, explanation: "", points: 100, questionType: "single", mediaUrl: "", hint: "", timeLimitSeconds: 20, shuffleChoices: false });

const templates: Array<{ id: ExperienceMode; emoji: string; label: string; note: string; vibe: string; preset: string; game: Partial<GameConfig> }> = [
  { id: "classic", emoji: "⚡", label: "Quiz Relâmpago", note: "Direto ao ponto, com ritmo de sala ao vivo.", vibe: "rápido", preset: "lua", game: { enforceTimer: false, speedBonus: false, showLeaderboard: true } },
  { id: "boss_battle", emoji: "👾", label: "Batalha de Chefão", note: "A turma responde para derrubar a energia do chefão.", vibe: "cooperativo", preset: "neon", game: { enforceTimer: false, speedBonus: false, showProgress: true } },
  { id: "treasure_hunt", emoji: "🗺️", label: "Caça ao Tesouro", note: "Cada etapa abre uma nova pista do mapa.", vibe: "aventura", preset: "papel", game: { enforceTimer: false, showLeaderboard: false, showProgress: true } },
  { id: "space_race", emoji: "🚀", label: "Corrida Espacial", note: "Velocidade e progresso em uma corrida visual.", vibe: "competitivo", preset: "aurora", game: { enforceTimer: true, timerSeconds: 25, speedBonus: true, speedBonusPercent: 20 } },
  { id: "card_duel", emoji: "🃏", label: "Duelo de Cartas", note: "Perguntas aparecem como cartas de desafio em rodadas.", vibe: "estratégico", preset: "natureza", game: { enforceTimer: false, showLeaderboard: true } },
  { id: "focus", emoji: "🧠", label: "Modo Foco", note: "Sem ranking durante a pergunta. Mais calma para pensar.", vibe: "concentração", preset: "papel", game: { enforceTimer: false, speedBonus: false, showLeaderboard: false } },
];

const stepLabels = ["Formato", "Conteúdo", "Visual", "Publicar"];

type StudioForm = {
  title: string; subject: string; description: string; status: "draft" | "published"; difficulty: Difficulty; tags: string;
  questions: DraftQuestion[]; experienceMode: ExperienceMode; theme: QuizTheme; gameConfig: GameConfig;
};

const blankForm = (): StudioForm => ({
  title: "", subject: "Matemática", description: "", status: "published", difficulty: "medium", tags: "",
  questions: [makeQuestion()], experienceMode: "classic", theme: { ...DEFAULT_QUIZ_THEME }, gameConfig: { ...DEFAULT_GAME_CONFIG },
});

export function StudioV8({ user, onLogin }: { user: SessionUser | null; onLogin: () => void }) {
  const canTeach = user?.role === "teacher" || user?.role === "admin";
  const voice = useRegionalVoice();
  const qc = useQueryClient();
  const [tab, setTab] = useState<"create" | "library" | "insights">("create");
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<StudioForm>(blankForm);
  const [activeGameCode, setActiveGameCode] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const activities = useQuery({ queryKey: ["activities-v8", user?.id], queryFn: api.myActivities, enabled: canTeach, staleTime: 15_000 });
  const creator = useQuery({ queryKey: ["creator-v8", user?.id], queryFn: api.creatorProfile, enabled: canTeach, staleTime: 20_000 });
  const radar = useQuery({ queryKey: ["radar-v8", user?.id], queryFn: () => api.teacherRadar(30), enabled: canTeach && tab === "insights", staleTime: 20_000 });
  const host = useQuery({ queryKey: ["host-v8", activeGameCode], queryFn: () => api.hostGame(activeGameCode!), enabled: Boolean(activeGameCode), refetchInterval: activeGameCode ? 1800 : false, retry: 1 });

  const create = useMutation({
    mutationFn: () => api.createActivity({
      title: form.title, subject: form.subject, description: form.description, status: form.status, difficulty: form.difficulty,
      tags: form.tags.split(",").map((v) => v.trim()).filter(Boolean).slice(0, 8), questions: form.questions,
      experienceMode: form.experienceMode, theme: form.theme, gameConfig: form.gameConfig,
    }),
    onSuccess: async () => { toast.success("Pronto! Esse trem virou experiência de verdade 😄"); setForm(blankForm()); setStep(0); setTab("library"); await qc.invalidateQueries({ queryKey: ["activities-v8"] }); await qc.invalidateQueries({ queryKey: ["creator-v8"] }); },
    onError: (error: Error) => toast.error(error.message),
  });

  const room = useMutation({
    mutationFn: (activityId: string) => api.createGame(activityId),
    onSuccess: (data) => { setActiveGameCode(data.game.code); toast.success(`Sala ${data.game.code} criada.`); },
    onError: (error: Error) => toast.error(error.message),
  });
  const duplicate = useMutation({ mutationFn: api.duplicateActivity, onSuccess: async () => { toast.success("Cópia criada."); await qc.invalidateQueries({ queryKey: ["activities-v8"] }); }, onError: (e: Error) => toast.error(e.message) });
  const remove = useMutation({ mutationFn: api.deleteActivity, onSuccess: async (data) => { toast.success(data.message || "Atividade removida."); await qc.invalidateQueries({ queryKey: ["activities-v8"] }); }, onError: (e: Error) => toast.error(e.message) });
  const startGame = useMutation({ mutationFn: () => api.startGame(activeGameCode!), onSuccess: () => host.refetch(), onError: (e: Error) => toast.error(e.message) });
  const next = useMutation({ mutationFn: () => api.nextQuestion(activeGameCode!), onSuccess: () => host.refetch(), onError: (e: Error) => toast.error(e.message) });

  if (!user) return <div className="v8-shell v8-gate"><div className="v8-gate-orb"><GraduationCap /></div><span>STUDIO DO PROFESSOR</span><h1>{voice.say("teacher")}</h1><p>Escolha o formato, escreva as perguntas, ajuste o visual e abra a sala.</p><button className="v8-primary" onClick={onLogin}>Entrar como professor <ArrowRight /></button></div>;
  if (!canTeach) return <div className="v8-shell v8-gate"><div className="v8-gate-orb"><GraduationCap /></div><span>STUDIO DO PROFESSOR</span><h1>Essa conta ainda é de aluno.</h1><p>Use um código de professor na tela de entrada para liberar o Studio.</p><button className="v8-primary" onClick={onLogin}>Ativar acesso de professor <ArrowRight /></button></div>;

  if (activeGameCode && host.data?.game) return <LiveRoom code={activeGameCode} host={host.data.game} onClose={() => setActiveGameCode(null)} onStart={() => startGame.mutate()} onNext={() => next.mutate()} busy={startGame.isPending || next.isPending} />;

  return <div className="v8-shell v8-studio">
    <header className="v8-studio-head">
      <div><span className="v8-kicker"><WandSparkles /> STUDIO DO PROFESSOR</span><h1>{voice.say("teacherHeader")}</h1><p>Você escolhe o tipo de experiência; a Rede Lua cuida do resto da estrutura.</p></div>
      <div className="v8-creator-level"><small>NÍVEL DE CRIADOR</small><strong>{creator.data?.stats.creatorLevel || 1}</strong><span>{creator.data?.stats.creatorXp || 0} XP</span></div>
    </header>

    <nav className="v8-studio-tabs">
      <button className={tab === "create" ? "active" : ""} onClick={() => setTab("create")}><WandSparkles /> Criar</button>
      <button className={tab === "library" ? "active" : ""} onClick={() => setTab("library")}><LibraryBig /> Biblioteca</button>
      <button className={tab === "insights" ? "active" : ""} onClick={() => setTab("insights")}><BarChart3 /> Insights</button>
    </nav>

    {tab === "create" && <section className="v8-builder">
      <div className="v8-builder-steps">{stepLabels.map((label, i) => <button key={label} className={i === step ? "active" : i < step ? "done" : ""} onClick={() => i <= step && setStep(i)}><b>{i < step ? <Check /> : i + 1}</b><span>{label}</span></button>)}</div>

      {step === 0 && <div className="v8-builder-panel"><div className="v8-panel-title"><div><span>COMECE PELO CLIMA DA AULA</span><h2>O que você quer que a turma sinta?</h2></div><Gamepad2 /></div><div className="v8-template-grid">{templates.map((t) => <button key={t.id} className={form.experienceMode === t.id ? "active" : ""} onClick={() => {
        const preset = THEME_PRESETS.find((p) => p.id === t.preset)?.theme || DEFAULT_QUIZ_THEME;
        setForm((f) => ({ ...f, experienceMode: t.id, theme: { ...preset, preset: t.id }, gameConfig: { ...DEFAULT_GAME_CONFIG, ...t.game } }));
      }}><span>{t.emoji}</span><small>{t.vibe}</small><strong>{t.label}</strong><p>{t.note}</p>{form.experienceMode === t.id && <Check />}</button>)}</div><div className="v8-builder-next"><button className="v8-primary" onClick={() => setStep(1)}>Montar conteúdo <ArrowRight /></button></div></div>}

      {step === 1 && <div className="v8-builder-panel"><div className="v8-form-grid"><label>Título da experiência<input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Ex.: Missão Frações" maxLength={120} /></label><label>Matéria<input value={form.subject} onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))} maxLength={50} /></label><label className="wide">Uma frase sobre a missão<textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="O que a turma vai praticar?" maxLength={700} /></label><label>Dificuldade<select value={form.difficulty} onChange={(e) => setForm((f) => ({ ...f, difficulty: e.target.value as Difficulty }))}><option value="easy">Leve</option><option value="medium">Média</option><option value="hard">Desafio</option></select></label><label>Tags<input value={form.tags} onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))} placeholder="frações, 7º ano" /></label></div>
        <div className="v8-question-builder"><div className="v8-panel-title"><div><span>PERGUNTAS</span><h2>Construa as etapas da missão.</h2></div><button onClick={() => setForm((f) => ({ ...f, questions: [...f.questions, makeQuestion()] }))}><Plus /> Adicionar</button></div>{form.questions.map((q, qi) => <QuestionCard key={qi} index={qi} question={q} onChange={(nextQ) => setForm((f) => ({ ...f, questions: f.questions.map((item, i) => i === qi ? nextQ : item) }))} onRemove={() => setForm((f) => ({ ...f, questions: f.questions.filter((_, i) => i !== qi) }))} canRemove={form.questions.length > 1} />)}</div>
        <div className="v8-builder-nav"><button onClick={() => setStep(0)}><ArrowLeft /> Voltar</button><button className="v8-primary" onClick={() => setStep(2)} disabled={!form.title.trim() || form.questions.some((q) => !q.prompt.trim() || q.choices.some((c) => !c.trim()))}>Escolher visual <ArrowRight /></button></div>
      </div>}

      {step === 2 && <div className="v8-builder-panel v8-look-builder"><div><div className="v8-panel-title"><div><span>VISUAL DA EXPERIÊNCIA</span><h2>Deixe com a cara da sua aula.</h2></div><Palette /></div><div className="v8-theme-grid">{THEME_PRESETS.map((preset) => <button key={preset.id} className={form.theme.preset === preset.id ? "active" : ""} onClick={() => setForm((f) => ({ ...f, theme: { ...preset.theme, preset: preset.id } }))}><i style={{ background: `linear-gradient(135deg,${preset.theme.primary},${preset.theme.secondary})` }} /><strong>{preset.label}</strong><small>{preset.note}</small></button>)}</div><div className="v8-rule-grid"><label><Timer /><span><strong>Tempo por pergunta</strong><small>{form.gameConfig.timerSeconds}s</small></span><input type="range" min="10" max="90" value={form.gameConfig.timerSeconds} onChange={(e) => setForm((f) => ({ ...f, gameConfig: { ...f.gameConfig, timerSeconds: Number(e.target.value) } }))} /></label><label className="switch"><input type="checkbox" checked={form.gameConfig.enforceTimer} onChange={(e) => setForm((f) => ({ ...f, gameConfig: { ...f.gameConfig, enforceTimer: e.target.checked } }))} /><span><strong>Tempo encerra resposta</strong><small>se desligado, vira só indicador</small></span></label><label className="switch"><input type="checkbox" checked={form.gameConfig.showLeaderboard} onChange={(e) => setForm((f) => ({ ...f, gameConfig: { ...f.gameConfig, showLeaderboard: e.target.checked } }))} /><span><strong>Mostrar ranking</strong><small>pode esconder em atividades de foco</small></span></label></div></div><MiniPreview form={form} />
        <div className="v8-builder-nav"><button onClick={() => setStep(1)}><ArrowLeft /> Voltar</button><button className="v8-primary" onClick={() => setStep(3)}>Revisar e publicar <ArrowRight /></button></div>
      </div>}

      {step === 3 && <div className="v8-builder-panel v8-publish-step"><div className="v8-publish-summary"><div className="v8-publish-icon">{templates.find((t) => t.id === form.experienceMode)?.emoji || "🎮"}</div><span>{templates.find((t) => t.id === form.experienceMode)?.label}</span><h2>{form.title || "Sua experiência"}</h2><p>{form.subject} • {form.questions.length} pergunta{form.questions.length === 1 ? "" : "s"}</p><div><span>🎨 {THEME_PRESETS.find((p) => p.id === form.theme.preset)?.label || "Tema personalizado"}</span><span>⏱ {form.gameConfig.timerSeconds}s</span><span>{form.gameConfig.showLeaderboard ? "🏆 ranking" : "🧠 sem ranking"}</span></div></div><div className="v8-publish-options"><label><input type="radio" checked={form.status === "published"} onChange={() => setForm((f) => ({ ...f, status: "published" }))} /><span><strong>Publicar agora</strong><small>fica disponível para abrir uma sala</small></span></label><label><input type="radio" checked={form.status === "draft"} onChange={() => setForm((f) => ({ ...f, status: "draft" }))} /><span><strong>Salvar como rascunho</strong><small>você decide quando usar</small></span></label></div><div className="v8-builder-nav"><button onClick={() => setStep(2)}><ArrowLeft /> Voltar</button><button className="v8-primary" disabled={create.isPending} onClick={() => create.mutate()}>{create.isPending ? <LoaderCircle className="spin" /> : <Rocket />} {form.status === "published" ? "Publicar experiência" : "Salvar rascunho"}</button></div></div>}
    </section>}

    {tab === "library" && <section className="v8-studio-library"><div className="v8-panel-title"><div><span>SUA BIBLIOTECA</span><h2>Experiências prontas para reutilizar.</h2></div><LibraryBig /></div>{activities.isLoading ? <div className="v8-loading"><LoaderCircle className="spin" /> Carregando biblioteca…</div> : activities.data?.activities.length ? <div className="v8-library-grid">{activities.data.activities.map((a) => <article key={a.id}><div className="v8-lib-cover" style={{ background: `linear-gradient(135deg,${a.theme.primary},${a.theme.secondary})` }}><span>{modeEmoji(a.experienceMode)}</span><small>{modeName(a.experienceMode)}</small></div><div className="v8-lib-body"><span>{a.subject}</span><h3>{a.title}</h3><p>{a.questionCount} pergunta{a.questionCount === 1 ? "" : "s"} • {a.status === "published" ? "publicado" : "rascunho"}</p><div><button disabled={a.status !== "published" || room.isPending} onClick={() => room.mutate(a.id)}><Play /> Abrir sala</button><button onClick={() => duplicate.mutate(a.id)}><Copy /></button><button onClick={() => remove.mutate(a.id)}><Trash2 /></button></div></div></article>)}</div> : <div className="v8-empty"><Sparkles /><strong>Sua biblioteca está vazia.</strong><p>Crie a primeira experiência no Studio.</p><button onClick={() => setTab("create")}>Criar agora <ArrowRight /></button></div>}</section>}

    {tab === "insights" && <section className="v8-insights"><div className="v8-insight-kpis"><article><strong>{creator.data?.stats.activities || 0}</strong><span>experiências</span></article><article><strong>{creator.data?.stats.games || 0}</strong><span>partidas</span></article><article><strong>{creator.data?.stats.participants || 0}</strong><span>participações</span></article><article><strong>{creator.data?.stats.accuracy || 0}%</strong><span>acerto médio</span></article></div><div className="v8-insight-grid"><article><div className="v8-panel-title"><div><span>ONDE A TURMA TRAVOU</span><h2>Pontos para revisar.</h2></div><BarChart3 /></div>{radar.isLoading ? <div className="v8-loading"><LoaderCircle className="spin" /></div> : radar.data?.hotspots.length ? radar.data.hotspots.slice(0, 6).map((h) => <div className="v8-hotspot" key={h.questionId}><span>{h.subject}</span><strong>{h.prompt}</strong><small>{h.errorRate}% de erro • {h.totalAnswers} respostas</small></div>) : <div className="v8-empty compact"><Sparkles /><strong>Ainda não há dados suficientes.</strong></div>}</article><article><div className="v8-panel-title"><div><span>CONQUISTAS</span><h2>Seu caminho como criador.</h2></div><GraduationCap /></div><div className="v8-badge-list">{creator.data?.badges.length ? creator.data.badges.map((b) => <div key={b.id}><b>{b.icon}</b><span><strong>{b.label}</strong><small>{b.note}</small></span></div>) : <div className="v8-empty compact"><Sparkles /><strong>Crie sua primeira experiência.</strong></div>}</div></article></div></section>}
  </div>;
}

function QuestionCard({ index, question, onChange, onRemove, canRemove }: { index: number; question: DraftQuestion; onChange: (q: DraftQuestion) => void; onRemove: () => void; canRemove: boolean }) {
  return <article className="v8-question-card"><header><span>PERGUNTA {index + 1}</span>{canRemove && <button onClick={onRemove}><Trash2 /></button>}</header><label>Enunciado<textarea value={question.prompt} onChange={(e) => onChange({ ...question, prompt: e.target.value })} placeholder="Escreva a pergunta do jeito que você falaria em sala." /></label><div className="v8-choice-editor">{question.choices.map((choice, ci) => <label key={ci} className={question.correctIndex === ci ? "correct" : ""}><button type="button" onClick={() => onChange({ ...question, correctIndex: ci })}>{question.correctIndex === ci ? <Check /> : String.fromCharCode(65 + ci)}</button><input value={choice} onChange={(e) => onChange({ ...question, choices: question.choices.map((c, i) => i === ci ? e.target.value : c) })} placeholder={`Alternativa ${String.fromCharCode(65 + ci)}`} /></label>)}</div><div className="v8-question-foot"><label>Pista<input value={question.hint} onChange={(e) => onChange({ ...question, hint: e.target.value })} placeholder="Ajude sem entregar." maxLength={300} /></label><label>Explicação após acerto<textarea value={question.explanation} onChange={(e) => onChange({ ...question, explanation: e.target.value })} placeholder="Explique o raciocínio, não só a letra certa." maxLength={900} /></label></div></article>;
}

function MiniPreview({ form }: { form: StudioForm }) {
  const q = form.questions[0];
  return <aside className="v8-mini-preview" style={{ ["--pv-primary" as string]: form.theme.primary, ["--pv-secondary" as string]: form.theme.secondary, ["--pv-bg" as string]: form.theme.background, ["--pv-surface" as string]: form.theme.surface }}><small>PRÉVIA AO VIVO</small><div className="v8-phone"><header><span>{modeEmoji(form.experienceMode)}</span><b>{form.title || "Sua experiência"}</b></header><main><em>1/{form.questions.length}</em><h3>{q?.prompt || "Sua primeira pergunta aparece aqui."}</h3><div>{(q?.choices || ["A","B","C","D"]).map((c, i) => <span key={i}><b>{String.fromCharCode(65 + i)}</b>{c || `Alternativa ${i + 1}`}</span>)}</div></main></div></aside>;
}

function LiveRoom({ code, host, onClose, onStart, onNext, busy }: { code: string; host: any; onClose: () => void; onStart: () => void; onNext: () => void; busy: boolean }) {
  const joinUrl = `${location.origin}${location.pathname}#/play?code=${encodeURIComponent(code)}`;
  return <div className="v8-shell v8-live-room"><button className="v8-back" onClick={onClose}><ArrowLeft /> Voltar ao Studio</button><section className="v8-room-stage"><div className="v8-room-code"><span>SALA AO VIVO</span><h1>{code}</h1><p>{host.activityTitle}</p><div className="v8-qr"><QRCodeSVG value={joinUrl} size={170} /></div><small>aponte a câmera ou digite o código</small></div><div className="v8-room-control"><div className="v8-room-status"><span>{host.status === "lobby" ? "aguardando" : host.status === "running" ? "em jogo" : "finalizada"}</span><strong>{host.participants.length} participante{host.participants.length === 1 ? "" : "s"}</strong></div><div className="v8-room-people">{host.participants.slice(0, 12).map((p: any, i: number) => <span key={p.id}><b>{i + 1}</b>{p.displayName}<em>{p.score}</em></span>)}</div>{host.status === "lobby" ? <button className="v8-primary" disabled={busy || !host.participants.length} onClick={onStart}><Play /> Começar partida</button> : host.status === "running" ? <button className="v8-primary" disabled={busy} onClick={onNext}><ArrowRight /> Próxima pergunta</button> : <button className="v8-secondary" onClick={onClose}>Encerrar painel</button>}</div></section></div>;
}

function modeName(mode: ExperienceMode) { return templates.find((t) => t.id === mode)?.label || "Quiz"; }
function modeEmoji(mode: ExperienceMode) { return templates.find((t) => t.id === mode)?.emoji || "🎮"; }
