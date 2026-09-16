import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ArrowRight, CheckCircle2, Clock3, Gamepad2, HelpCircle, LoaderCircle, Medal, MoonStar, Star, Trophy, UserRound, XCircle, Zap } from "lucide-react";
import { toast } from "sonner";
import { api } from "../api";
import { reactionAssets } from "../assets";
import type { GameReaction, ParticipantSession } from "../types";

export function GameView({ initialCode = "" }: { initialCode?: string }) {
  const [code, setCode] = useState(initialCode);
  const [name, setName] = useState("");
  const [participant, setParticipant] = useState<ParticipantSession | null>(null);
  const [answeredQuestionId, setAnsweredQuestionId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<null | { correct: boolean; awardedPoints: number; speedBonus: number; timedOut: boolean; explanation: string }>(null);
  const [reaction, setReaction] = useState<string | null>(null);
  const [hintOpen, setHintOpen] = useState(false);
  const [clockNow, setClockNow] = useState(Date.now());

  useEffect(() => { if (initialCode) setCode(initialCode); }, [initialCode]);
  const normalizedCode = useMemo(() => code.trim().toUpperCase(), [code]);

  const join = useMutation({
    mutationFn: () => api.joinGame(normalizedCode, name.trim()),
    onSuccess: (data) => { setParticipant(data.participant); sessionStorage.setItem(`rede-lua-game:${normalizedCode}`, JSON.stringify(data.participant)); toast.success(`Você entrou em ${normalizedCode}.`); },
    onError: (error: Error) => toast.error(error.message),
  });

  useEffect(() => {
    if (!normalizedCode || participant) return;
    try { const saved = sessionStorage.getItem(`rede-lua-game:${normalizedCode}`); if (saved) setParticipant(JSON.parse(saved)); } catch { /* ignore */ }
  }, [normalizedCode, participant]);

  const state = useQuery({
    queryKey: ["game-state", normalizedCode, participant?.id],
    queryFn: () => api.gameState(normalizedCode, participant!),
    enabled: !!participant && /^LUA-\d{4,5}$/.test(normalizedCode),
    refetchInterval: participant ? 1800 : false,
    retry: 1,
  });

  const answer = useMutation({
    mutationFn: ({ questionId, choiceIndex }: { questionId: string; choiceIndex: number }) => api.answer(normalizedCode, participant!, questionId, choiceIndex),
    onSuccess: (data, variables) => { setAnsweredQuestionId(variables.questionId); setFeedback(data); state.refetch(); },
    onError: (error: Error) => toast.error(error.message),
  });

  const reactions = useQuery({
    queryKey: ["game-reactions", normalizedCode, participant?.id],
    queryFn: () => api.gameReactions(normalizedCode, participant!),
    enabled: !!participant && /^LUA-\d{4,5}$/.test(normalizedCode),
    refetchInterval: participant ? 1200 : false,
    retry: 0,
  });

  const sendReaction = useMutation({
    mutationFn: (reactionId: GameReaction["reactionId"]) => api.sendReaction(normalizedCode, participant!, reactionId),
    onSuccess: (data, reactionId) => { if (data.accepted) { setReaction(reactionId); reactions.refetch(); } },
    onError: (error: Error) => toast.error(error.message),
  });

  const questionId = state.data?.game.question?.id || null;
  useEffect(() => {
    if (questionId && answeredQuestionId && questionId !== answeredQuestionId) { setAnsweredQuestionId(null); setFeedback(null); setReaction(null); setHintOpen(false); return; }
    const saved = state.data?.game.answer;
    if (questionId && saved && !feedback) setFeedback({ correct: saved.correct, awardedPoints: saved.awardedPoints, speedBonus: 0, timedOut: false, explanation: saved.explanation });
  }, [questionId, answeredQuestionId, state.data?.game.answer, feedback]);

  useEffect(() => {
    if (state.data?.game.status !== "running" || !state.data?.game.questionStartedAt) return;
    const timer = window.setInterval(() => setClockNow(Date.now()), 250);
    return () => window.clearInterval(timer);
  }, [state.data?.game.status, state.data?.game.questionStartedAt]);

  if (!participant) return <div className="page-width page-pad game-view"><section className="join-game-card"><div className="join-game-art"><MoonStar /><span>ENTRAR EM UMA PARTIDA</span><h1>Um código e seu nome. Só isso.</h1><p>Você não precisa criar conta para participar de uma atividade ao vivo.</p><div className="join-reactions">{reactionAssets.slice(0, 5).map((item) => <img key={item.id} src={item.src} alt="" />)}</div></div><form onSubmit={(e) => { e.preventDefault(); if (!/^LUA-\d{4,5}$/.test(normalizedCode)) return toast.error("Use um código como LUA-4821."); if (name.trim().length < 2) return toast.error("Digite seu nome."); join.mutate(); }}><label>Código da sala<input value={code} onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, "").slice(0, 9))} placeholder="LUA-4821" /></label><label>Seu nome<input value={name} onChange={(e) => setName(e.target.value)} placeholder="Como vai aparecer no ranking" maxLength={28} /></label><button className="button button-primary button-wide" disabled={join.isPending}>{join.isPending ? <LoaderCircle className="spin" /> : <Gamepad2 />} Entrar na sala</button></form></section></div>;

  if (state.isLoading) return <div className="page-width page-pad"><div className="source-status"><LoaderCircle className="spin" /><strong>Entrando na sala…</strong></div></div>;
  if (state.isError || !state.data) return <div className="page-width page-pad"><div className="source-status error"><strong>Não foi possível atualizar a partida.</strong><button className="button button-ghost" onClick={() => { sessionStorage.removeItem(`rede-lua-game:${normalizedCode}`); setParticipant(null); }}>Entrar novamente</button></div></div>;

  const game = state.data.game;
  const theme = game.theme;
  const limit = game.question?.timeLimitSeconds || game.gameConfig.timerSeconds || 20;
  const elapsed = game.questionStartedAt ? Math.max(0, (clockNow - game.questionStartedAt) / 1000) : 0;
  const timeLeft = Math.max(0, limit - elapsed);
  const timePercent = Math.max(0, Math.min(100, (timeLeft / limit) * 100));
  const timeExpired = game.gameConfig.enforceTimer && timeLeft <= 0;
  const stars = Math.max(0, Math.floor(game.participant.score / 100));
  const stageStyle = {
    ["--game-primary" as string]: theme.primary,
    ["--game-secondary" as string]: theme.secondary,
    ["--game-bg" as string]: theme.background,
    ["--game-surface" as string]: theme.surface,
    ["--game-text" as string]: theme.text,
  };

  return <div className={`game-stage themed-game mode-${game.experienceMode} pattern-${theme.pattern} buttons-${theme.buttonShape} font-${theme.fontStyle}`} style={stageStyle}>
    <header className="game-topbar page-width"><div className="game-brand-live">{theme.logoUrl ? <img src={theme.logoUrl} alt="Logo da atividade" /> : theme.showRedeLuaBrand ? <img src="/assets/rede-lua/brand/logo-transparent.webp" alt="Rede Lua" /> : <Gamepad2 />}<div><strong>{game.activityTitle || game.code}</strong><span>{game.code} • {participant.displayName}</span>{theme.showRedeLuaBrand && <small className="rede-lua-live-brand">Rede Lua na Educação</small>}</div></div><div className="game-score"><Trophy /> {game.participant.score} pts</div></header>
    <LiveReactionBubbles items={reactions.data?.reactions || []} />

    {game.status === "lobby" && <main className="page-width game-center"><section className="lobby-card branded-lobby"><div className="pulse-moon">{theme.logoUrl ? <img src={theme.logoUrl} alt="" /> : theme.showRedeLuaBrand ? <img src="/assets/rede-lua/brand/logo-transparent.webp" alt="" /> : <MoonStar />}</div><span>VOCÊ ENTROU • {modeLabel(game.experienceMode).toUpperCase()}</span><h1>Aguardando o professor começar.</h1><p>O visual, o tempo e o formato desta partida foram escolhidos pelo professor.</p><ReactionDock reaction={reaction} onReact={(id) => sendReaction.mutate(id)} sending={sendReaction.isPending} /><div className="leader-mini"><UsersLabel count={game.leaderboard.length} />{game.leaderboard.slice(0, 5).map((p, i) => <span key={p.id}><b>{i + 1}</b>{p.displayName}</span>)}</div></section></main>}

    {game.status === "running" && game.question && <main className="page-width question-stage branded-question-stage">
      <div className="question-meta"><span>{game.gameConfig.showProgress ? `PERGUNTA ${game.currentQuestion + 1} DE ${game.questionCount}` : modeLabel(game.experienceMode).toUpperCase()}</span><div className={timeLeft <= 5 ? "urgent" : ""}><Clock3 /> {game.gameConfig.enforceTimer ? `${Math.ceil(timeLeft)}s` : "ao vivo"}</div></div>
      {game.gameConfig.enforceTimer && <div className="game-timer-track"><i style={{ width: `${timePercent}%` }} /></div>}
      {game.experienceMode === "lunar_rush" && <div className="mode-banner rush"><Zap /><span>Corrida Lunar: responda cedo para ganhar bônus de velocidade.</span></div>}
      {game.experienceMode === "star_hunt" && <div className="mode-banner stars"><Star /><span>{stars} estrela{stars === 1 ? "" : "s"} coletada{stars === 1 ? "" : "s"} nesta partida.</span></div>}
      {game.question.mediaUrl && <div className="question-media"><img src={game.question.mediaUrl} alt="Imagem da pergunta" /></div>}
      <h1>{game.question.prompt}</h1>
      {game.question.hint && !feedback && <div className="hint-zone"><button onClick={() => setHintOpen((value) => !value)}><HelpCircle /> {hintOpen ? "Ocultar dica" : "Abrir dica"}</button>{hintOpen && <p>{game.question.hint}</p>}</div>}
      {!feedback ? <>{timeExpired && <div className="time-expired"><Clock3 /><strong>Tempo encerrado.</strong><span>Aguarde o professor avançar para a próxima pergunta.</span></div>}<div className="answer-grid">{game.question.choices.map((choice, index) => <button key={index} disabled={answer.isPending || timeExpired} onClick={() => answer.mutate({ questionId: game.question!.id, choiceIndex: index })}><span>{String.fromCharCode(65 + index)}</span><strong>{choice}</strong><ArrowRight /></button>)}</div></> : <section className={`feedback-card ${feedback.correct ? "correct" : "incorrect"}`}><div className="feedback-icon">{feedback.correct ? <CheckCircle2 /> : <XCircle />}</div><div><span>{feedback.timedOut ? "TEMPO!" : feedback.correct ? "BOA!" : "QUASE!"}</span><h2>{feedback.correct ? `+${feedback.awardedPoints} pontos` : feedback.timedOut ? "Resposta fora do tempo" : "Essa não era a alternativa"}</h2>{feedback.speedBonus > 0 && <small className="speed-bonus"><Zap /> +{feedback.speedBonus} de bônus de velocidade</small>}<p>{feedback.explanation}</p></div><ReactionDock reaction={reaction} onReact={(id) => sendReaction.mutate(id)} sending={sendReaction.isPending} compact /></section>}
      {game.gameConfig.showLeaderboard && !feedback && game.experienceMode !== "focus" && <div className="question-leader-strip">{game.leaderboard.slice(0, 3).map((p, i) => <span key={p.id}><b>{i + 1}</b>{p.displayName}<em>{p.score}</em></span>)}</div>}
    </main>}

    {game.status === "finished" && <main className="page-width game-center"><section className="result-card branded-result"><Medal /><span>PARTIDA FINALIZADA</span><h1>Missão concluída.</h1><p>Você terminou com <strong>{game.participant.score} pontos</strong>.</p>{game.experienceMode === "star_hunt" && <div className="final-stars"><Star /> {stars} estrelas coletadas</div>}<div className="leaderboard-final">{game.leaderboard.map((p, i) => <div className={p.id === game.participant.id ? "me" : ""} key={p.id}><b>{i + 1}</b><span>{p.displayName}</span><strong>{p.score} pts</strong></div>)}</div><button className="button button-primary" onClick={() => { sessionStorage.removeItem(`rede-lua-game:${normalizedCode}`); setParticipant(null); setCode(""); }}>Entrar em outra partida</button></section></main>}
  </div>;
}

function modeLabel(mode: string) { return mode === "lunar_rush" ? "Corrida Lunar" : mode === "star_hunt" ? "Caça às Estrelas" : mode === "focus" ? "Modo Foco" : "Quiz Clássico"; }
function ReactionDock({ reaction, onReact, sending = false, compact = false }: { reaction: string | null; onReact: (value: GameReaction["reactionId"]) => void; sending?: boolean; compact?: boolean }) { return <div className={`reaction-dock ${compact ? "compact" : ""}`}><span className="reaction-hint">Reaja com a turma</span>{reactionAssets.slice(0, compact ? 5 : 8).map((item) => <button key={item.id} disabled={sending} className={reaction === item.id ? "active" : ""} onClick={() => onReact(item.id as GameReaction["reactionId"])} title={item.label}><img src={item.src} alt={item.label} /></button>)}</div>; }
function LiveReactionBubbles({ items }: { items: GameReaction[] }) { const recent = items.filter((item) => Date.now() - Number(item.createdAt) < 12000).slice(-6); if (!recent.length) return null; return <div className="live-reaction-bubbles page-width" aria-live="polite">{recent.map((item) => { const asset = reactionAssets.find((r) => r.id === item.reactionId); return asset ? <span key={item.id} title={`${item.displayName}: ${asset.label}`}><img src={asset.src} alt={asset.label} /><small>{item.displayName}</small></span> : null; })}</div>; }
function UsersLabel({ count }: { count: number }) { return <strong className="users-label"><UserRound /> {count} na sala</strong>; }
