import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import confetti from "canvas-confetti";
import { motion } from "motion/react";
import { ArrowRight, Award, Crown, History, Orbit, RefreshCcw, Sparkles, Star, Trophy, UserRound, X } from "lucide-react";
import { toast } from "sonner";
import { api } from "../api";
import { AvatarVisual } from "../components/AvatarVisual";
import { useRegionalVoice } from "../regionalVoice";
import type { SessionUser } from "../types";

const formatRecord = (key: string, value: number) => {
  if (key === "best_streak") return `${value} dias`;
  if (key === "best_level") return `Nível ${value}`;
  if (key === "lifetime_xp") return `${value.toLocaleString("pt-BR")} XP`;
  if (key === "lives_completed") return `${value} vidas`;
  if (key === "best_game_score") return value.toLocaleString("pt-BR");
  return value.toLocaleString("pt-BR");
};

const recordIcon = (key: string) => key.includes("streak") ? "🔥" : key.includes("level") ? "⭐" : key.includes("xp") ? "✨" : key.includes("life") ? "🪐" : key.includes("score") ? "🏆" : "🌙";

export function RecordsV9({ user, onLogin, onProfile }: { user: SessionUser | null; onLogin: () => void; onProfile: () => void }) {
  const qc = useQueryClient();
  const voice = useRegionalVoice();
  const [confirming, setConfirming] = useState(false);
  const records = useQuery({ queryKey: ["records-v9", user?.id], queryFn: api.recordsProfile, enabled: Boolean(user), staleTime: 20_000 });
  const data = records.data;

  const rebirth = useMutation({
    mutationFn: api.beginNewLife,
    onSuccess: async (result) => {
      setConfirming(false);
      if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) confetti({ particleCount: 140, spread: 88, origin: { y: .58 } });
      toast.success(`Vida ${result.lifeNumber} começou! +${result.legacyStarsEarned} estrela${result.legacyStarsEarned === 1 ? "" : "s"} de legado.`);
      await Promise.all([
        qc.invalidateQueries({ queryKey: ["session"] }),
        qc.invalidateQueries({ queryKey: ["records-v9"] }),
        qc.invalidateQueries({ queryKey: ["luaid-v8"] }),
      ]);
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const progress = useMemo(() => data ? Math.min(100, Math.round(data.life.xp / Math.max(1, data.life.nextLifeXp) * 100)) : 0, [data]);

  if (!user) return <div className="v9-gate v9-page-width"><div className="v9-gate-orb"><Trophy /></div><span>RECORDES & VIDAS</span><h1>Seu livro de recordes começa depois do login.</h1><p>Aqui ficam seus melhores números, as vidas anteriores do avatar e as estrelas de legado.</p><button className="v9-cta primary" onClick={onLogin}><UserRound /> Entrar na Rede Lua</button></div>;

  return <div className="v9-records v9-page-width">
    <header className="v9-records-hero">
      <div className="v9-records-copy"><span className="v9-badge"><Trophy /> RECORD LUA</span><h1>{voice.say("record")}</h1><p>Não é ranking de gente. É você tentando passar de você mesmo. Pontuação, sequência, nível e cada vida do seu LuaMate ficam guardados aqui.</p></div>
      <div className="v9-records-avatar"><div className="v9-records-orbit" /><AvatarVisual style={user.avatarStyle} seed={user.avatarSeed} config={user.avatarConfig} size={150} compact /><b>VIDA {data?.life.number || user.lifeNumber}</b><small>{data?.life.legacyStars ?? user.legacyStars} ★ de legado</small></div>
    </header>

    {records.isLoading ? <div className="v9-skeleton-grid"><i /><i /><i /><i /></div> : data && <>
      <section className={`v9-life-card ${data.life.ready ? "ready" : ""}`}>
        <div className="v9-life-head"><div><span>NOVA VIDA</span><h2>{data.life.ready ? voice.say("rebirthReady") : `Vida ${data.life.number} ainda tá ganhando história.`}</h2><p>O avatar equipado recomeça quando você renasce. Inventário, badges, Recordes, Luas e estrelas de legado continuam com você.</p></div><div className="v9-life-number"><Orbit /><strong>{data.life.number}</strong><small>vida atual</small></div></div>
        <div className="v9-life-progress"><div><span>{data.life.xp.toLocaleString("pt-BR")} XP desta vida</span><b>{data.life.nextLifeXp.toLocaleString("pt-BR")} para renascer</b></div><i><b style={{ width: `${progress}%` }} /></i><small>{progress}% do caminho</small></div>
        <div className="v9-life-actions"><div className="v9-life-legacy"><Star /><span><strong>{data.life.legacyStars}</strong><small>estrelas de legado</small></span></div><button disabled={!data.life.ready || rebirth.isPending} onClick={() => setConfirming(true)}>{data.life.ready ? <><Sparkles /> Começar uma Nova Vida <ArrowRight /></> : <><Orbit /> Continua jogando, uai</>}</button></div>
      </section>

      <section className="v9-record-summary">
        <article><span>🎮</span><strong>{data.summary.gamesCompleted}</strong><small>partidas concluídas</small></article>
        <article><span>✅</span><strong>{data.summary.correct}</strong><small>respostas certas</small></article>
        <article><span>🎯</span><strong>{data.summary.accuracy}%</strong><small>acerto geral</small></article>
        <article><span>🏆</span><strong>{data.summary.bestGameScore.toLocaleString("pt-BR")}</strong><small>melhor pontuação</small></article>
        {(user.role === "teacher" || user.role === "admin") && <article><span>👥</span><strong>{data.summary.largestRoom}</strong><small>maior sala criada</small></article>}
      </section>

      <section className="v9-record-layout">
        <div className="v9-record-board"><div className="v9-section-mini"><div><span>SEUS MELHORES</span><h2>Recordes pessoais</h2></div><Crown /></div>{data.records.length ? <div className="v9-record-grid">{data.records.map((record, index) => <motion.article key={record.key} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(.3, index * .05) }}><span>{recordIcon(record.key)}</span><small>{record.label}</small><strong>{formatRecord(record.key, record.value)}</strong><em>{new Date(record.achievedAt).toLocaleDateString("pt-BR")}</em></motion.article>)}</div> : <div className="v9-empty-box"><Award /><strong>Seu primeiro Record vem já já.</strong><p>Jogue ou estude uma missão para começar.</p></div>}</div>

        <aside className="v9-life-history"><div className="v9-section-mini"><div><span>ÁLBUM DO TEMPO</span><h2>Vidas anteriores</h2></div><History /></div>{data.history.length ? <div className="v9-history-list">{data.history.map((life) => <article key={life.id}><div className="v9-history-dot">{life.lifeNumber}</div><div><strong>Vida {life.lifeNumber}</strong><span>{life.finalLifeXp.toLocaleString("pt-BR")} XP</span><small>+{life.legacyStarsEarned} ★ • terminou em {new Date(life.endedAt).toLocaleDateString("pt-BR")}</small></div></article>)}</div> : <div className="v9-empty-box compact"><Orbit /><strong>Sua primeira vida está rolando.</strong><p>Quando ela terminar, vira parte da história do seu LuaID.</p></div>}</aside>
      </section>

      <section className="v9-record-bottom"><div><Sparkles /><span><strong>Quer trocar o visual sem renascer?</strong><small>O Avatar Studio continua livre para montar seu personagem atual.</small></span></div><button onClick={onProfile}>Abrir LuaID <ArrowRight /></button></section>
    </>}

    {confirming && data && <div className="v9-dialog-layer" role="dialog" aria-modal="true" aria-label="Começar nova vida"><button className="v9-dialog-backdrop" onClick={() => setConfirming(false)} aria-label="Fechar" /><motion.section className="v9-dialog" initial={{ opacity: 0, scale: .94, y: 24 }} animate={{ opacity: 1, scale: 1, y: 0 }}><button className="v9-dialog-x" onClick={() => setConfirming(false)}><X /></button><div className="v9-rebirth-art">🌙 → ✨ → 🐲</div><span>NOVA VIDA</span><h2>Seu LuaMate vai renascer.</h2><p>O personagem equipado volta para uma base nova e aleatória. Você <b>não perde</b> inventário, Luas, badges, Recordes nem estrelas de legado.</p><div className="v9-rebirth-check"><span>Vida atual</span><strong>{data.life.number}</strong><span>Próxima vida</span><strong>{data.life.number + 1}</strong></div><button className="v9-cta primary" disabled={rebirth.isPending} onClick={() => rebirth.mutate()}>{rebirth.isPending ? <><RefreshCcw className="spin" /> Renascer…</> : <><Sparkles /> Pode mandar, quero vida nova</>}</button><button className="v9-text-button" onClick={() => setConfirming(false)}>Ainda não, deixa meu boneco quieto 😅</button></motion.section></div>}
  </div>;
}
