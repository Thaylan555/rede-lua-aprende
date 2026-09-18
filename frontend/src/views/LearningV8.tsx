import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, BrainCircuit, CheckCircle2, HelpCircle, Lightbulb, LoaderCircle, MoonStar, RefreshCcw, SkipForward, Sparkles, Trophy, UserRound, XCircle } from "lucide-react";
import { toast } from "sonner";
import { api } from "../api";
import type { PublicActivity, SessionUser, StudyState } from "../types";

export function LearningV8({ user, onLogin, onLibrary }: { user: SessionUser | null; onLogin: () => void; onLibrary: () => void }) {
  const queryClient = useQueryClient();
  const [study, setStudy] = useState<StudyState | null>(null);
  const [pendingNext, setPendingNext] = useState<StudyState | null>(null);
  const [reflection, setReflection] = useState("");
  const [feedback, setFeedback] = useState<null | { correct: boolean; coach: string; explanation: string; earnedXp: number }>(null);
  const [hintOpen, setHintOpen] = useState(false);

  const constellation = useQuery({ queryKey: ["student-constellation-v8", user?.id], queryFn: api.studentConstellation, enabled: Boolean(user), staleTime: 20_000, retry: 1 });
  const recommendations = useQuery({ queryKey: ["recommendations-v8", user?.id], queryFn: api.recommendations, enabled: Boolean(user), staleTime: 25_000, retry: 1 });

  const start = useMutation({
    mutationFn: (activityId: string) => api.studyStart(activityId),
    onSuccess: (data) => { setStudy(data); setFeedback(null); setPendingNext(null); setReflection(""); setHintOpen(false); window.scrollTo({ top: 0, behavior: "smooth" }); },
    onError: (error: Error) => toast.error(error.message),
  });

  const attempt = useMutation({
    mutationFn: (choiceIndex: number) => api.studyAttempt(study!.sessionId, choiceIndex, reflection),
    onSuccess: async (data) => {
      setFeedback({ correct: data.correct, coach: data.coach, explanation: data.explanation, earnedXp: data.earnedXp });
      setHintOpen(!data.correct);
      if (data.correct) {
        setPendingNext(data.state);
        await queryClient.invalidateQueries({ queryKey: ["session"] });
        await queryClient.invalidateQueries({ queryKey: ["student-constellation-v8"] });
      } else setStudy(data.state);
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const skip = useMutation({
    mutationFn: () => api.studySkip(study!.sessionId),
    onSuccess: (data) => { setStudy(data); setFeedback(null); setReflection(""); setHintOpen(false); },
    onError: (error: Error) => toast.error(error.message),
  });

  const mastery = useMemo(() => [...(constellation.data?.mastery || [])].sort((a, b) => a.masteryScore - b.masteryScore), [constellation.data?.mastery]);
  const recommended = recommendations.data?.activities || [];

  if (!user) return <div className="v8-shell v8-gate"><div className="v8-gate-orb"><UserRound /></div><span>TRILHA LUNAR</span><h1>Seu caminho começa quando você entra.</h1><p>Com conta, a Rede Lua acompanha seu progresso e monta atividades para praticar sem entregar a resposta pronta.</p><button className="v8-primary" onClick={onLogin}>Entrar ou criar conta <ArrowRight /></button></div>;

  if (study) return <StudyPlayer
    study={study}
    feedback={feedback}
    pendingNext={pendingNext}
    reflection={reflection}
    setReflection={setReflection}
    hintOpen={hintOpen}
    setHintOpen={setHintOpen}
    attempting={attempt.isPending}
    skipping={skip.isPending}
    onAnswer={(index) => attempt.mutate(index)}
    onSkip={() => skip.mutate()}
    onContinue={() => {
      if (!pendingNext) return;
      if (pendingNext.status === "completed") {
        setStudy(null); setPendingNext(null); setFeedback(null); setReflection("");
        toast.success("Trilha concluída!");
      } else {
        setStudy(pendingNext); setPendingNext(null); setFeedback(null); setReflection(""); setHintOpen(false);
      }
    }}
    onExit={() => { setStudy(null); setPendingNext(null); setFeedback(null); }}
  />;

  return <div className="v8-shell v8-learn-dashboard">
    <header className="v8-learn-head">
      <div><span className="v8-kicker"><MoonStar /> SUA TRILHA</span><h1>Hoje, o objetivo é <em>entender</em> — não só acertar.</h1><p>Você escolhe uma missão. Se errar, recebe uma pista. A resposta certa não aparece até você chegar nela.</p></div>
      <div className="v8-level-card"><small>NÍVEL</small><strong>{user.level}</strong><span>{user.xp.toLocaleString("pt-BR")} XP</span></div>
    </header>

    <section className="v8-learn-metrics">
      <article><Sparkles /><span><strong>{user.streakDays}</strong><small>dias de sequência</small></span></article>
      <article><BrainCircuit /><span><strong>{constellation.data?.mastery.length || 0}</strong><small>matérias mapeadas</small></span></article>
      <article><Trophy /><span><strong>{constellation.data?.today.accuracy || 0}%</strong><small>acerto hoje</small></span></article>
    </section>

    <section className="v8-learn-layout">
      <div className="v8-mission-board">
        <div className="v8-panel-title"><div><span>MISSÕES PARA AGORA</span><h2>Escolha uma e comece.</h2></div><Lightbulb /></div>
        {recommendations.isLoading ? <div className="v8-loading"><LoaderCircle className="spin" /> Preparando missões…</div> : recommended.length ? <div className="v8-learning-cards">{recommended.slice(0, 6).map((activity, i) => <LearningCard key={activity.id} activity={activity} index={i} onStart={() => start.mutate(activity.id)} loading={start.isPending} />)}</div> : <div className="v8-empty"><Sparkles /><strong>Ainda não tem missão publicada por aqui.</strong><p>Você pode explorar a biblioteca enquanto os professores montam novas atividades.</p><button onClick={onLibrary}>Abrir biblioteca <ArrowRight /></button></div>}
      </div>

      <aside className="v8-skill-radar">
        <div className="v8-panel-title"><div><span>MAPA DE APRENDIZAGEM</span><h2>Onde vale praticar?</h2></div><BrainCircuit /></div>
        {constellation.isLoading ? <div className="v8-loading"><LoaderCircle className="spin" /> Lendo seu progresso…</div> : mastery.length ? <div className="v8-skill-list">{mastery.slice(0, 6).map((item) => {
          const pct = Math.round(item.masteryScore * 100);
          return <div key={item.subject}><div><strong>{item.subject}</strong><span>{pct}%</span></div><i><b style={{ width: `${pct}%` }} /></i><small>{pct < 45 ? "vale revisar" : pct < 70 ? "ganhando força" : "bem firme"}</small></div>;
        })}</div> : <div className="v8-empty compact"><Sparkles /><strong>Seu mapa ainda está vazio.</strong><p>Faça sua primeira missão e ele começa a ganhar estrelas.</p></div>}
      </aside>
    </section>
  </div>;
}

function LearningCard({ activity, index, onStart, loading }: { activity: PublicActivity; index: number; onStart: () => void; loading: boolean }) {
  const icons = ["🧠", "🌙", "🧩", "🚀", "🔭", "✨"];
  return <article className="v8-learning-card">
    <div className="v8-learning-card-top"><span>{icons[index % icons.length]}</span><small>{activity.subject}</small></div>
    <h3>{activity.title}</h3><p>{activity.description || "Uma atividade para praticar pensando passo a passo."}</p>
    <div className="v8-learning-card-meta"><span>{activity.questionCount || "?"} etapas</span><span>{activity.difficulty === "hard" ? "desafio" : activity.difficulty === "easy" ? "leve" : "médio"}</span></div>
    <button disabled={loading} onClick={onStart}>{loading ? <LoaderCircle className="spin" /> : <BrainCircuit />} Estudar sem gabarito <ArrowRight /></button>
  </article>;
}

function StudyPlayer({
  study, feedback, pendingNext, reflection, setReflection, hintOpen, setHintOpen, attempting, skipping, onAnswer, onSkip, onContinue, onExit,
}: {
  study: StudyState;
  feedback: null | { correct: boolean; coach: string; explanation: string; earnedXp: number };
  pendingNext: StudyState | null;
  reflection: string;
  setReflection: (value: string) => void;
  hintOpen: boolean;
  setHintOpen: (value: boolean) => void;
  attempting: boolean;
  skipping: boolean;
  onAnswer: (index: number) => void;
  onSkip: () => void;
  onContinue: () => void;
  onExit: () => void;
}) {
  const q = study.question;
  if (study.status === "completed" || !q) return <div className="v8-shell v8-study-complete"><Trophy /><span>TRILHA CONCLUÍDA</span><h1>Você chegou até o fim.</h1><p>O importante aqui não foi receber o gabarito: foi construir o caminho.</p><button className="v8-primary" onClick={onExit}>Voltar para minha trilha <ArrowRight /></button></div>;
  const progress = Math.round((study.currentIndex / Math.max(1, study.questionCount)) * 100);
  return <div className="v8-study-screen">
    <header className="v8-study-top v8-shell"><button onClick={onExit}><ArrowLeft /> Sair</button><div><strong>{study.title}</strong><span>{study.subject}</span></div><em>{study.currentIndex + 1}/{study.questionCount}</em></header>
    <div className="v8-study-progress"><i style={{ width: `${progress}%` }} /></div>
    <main className="v8-shell v8-study-main">
      <section className="v8-study-question">
        <div className="v8-study-label"><BrainCircuit /> ETAPA {study.currentIndex + 1}</div>
        {q.mediaUrl && <img className="v8-study-media" src={q.mediaUrl} alt="Imagem de apoio" />}
        <h1>{q.prompt}</h1>
        <div className="v8-reflection-box"><label>Antes de responder, anota seu raciocínio em uma frase <span>(opcional)</span></label><textarea value={reflection} onChange={(e) => setReflection(e.target.value)} placeholder="Ex.: eu acho que preciso comparar..." maxLength={500} /></div>
        {!feedback?.correct && <div className="v8-study-options">{q.choices.map((choice, index) => <button key={index} disabled={attempting} onClick={() => onAnswer(index)}><b>{String.fromCharCode(65 + index)}</b><span>{choice}</span><ArrowRight /></button>)}</div>}
        {!feedback?.correct && <div className="v8-study-actions"><button className="hint" onClick={() => setHintOpen(!hintOpen)}><HelpCircle /> {hintOpen ? "Fechar pista" : "Quero uma pista"}</button><button disabled={skipping} onClick={onSkip}><SkipForward /> Pular sem revelar resposta</button></div>}
        {hintOpen && !feedback?.correct && <div className="v8-hint-card"><Lightbulb /><div><strong>Pista</strong><p>{feedback?.coach || q.hint || "Volte ao enunciado e tente descobrir qual informação realmente muda a decisão."}</p></div></div>}
      </section>

      <aside className="v8-study-coach">
        <div className="v8-coach-orb"><MoonStar /></div><span>LUMI • GUIA DE RACIOCÍNIO</span>
        {!feedback ? <><h2>Eu não vou te dar a resposta.</h2><p>Posso te ajudar a organizar o pensamento, eliminar caminhos ruins e tentar de novo.</p><div className="v8-coach-rules"><span>1. leia o pedido</span><span>2. escolha uma estratégia</span><span>3. só então responda</span></div></> : feedback.correct ? <div className="v8-feedback-good"><CheckCircle2 /><h2>Boa — você chegou lá.</h2><p>{feedback.explanation || feedback.coach}</p>{feedback.earnedXp > 0 && <strong>+{feedback.earnedXp} XP</strong>}<button className="v8-primary" onClick={onContinue}>{pendingNext?.status === "completed" ? "Concluir trilha" : "Próxima etapa"} <ArrowRight /></button></div> : <div className="v8-feedback-retry"><XCircle /><h2>Ainda não.</h2><p>{feedback.coach}</p><button onClick={() => setHintOpen(true)}><RefreshCcw /> Tentar olhando a pista</button></div>}
      </aside>
    </main>
  </div>;
}
