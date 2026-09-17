import { useQuery } from "@tanstack/react-query";
import { ArrowRight, BrainCircuit, LoaderCircle, MoonStar, Sparkles, Trophy, UserRound, Coins, Medal, History, CheckCircle2 } from "lucide-react";
import { api } from "../api";
import type { SessionUser } from "../types";

export function StudentView({ user, onLogin, onExplore }: { user: SessionUser | null; onLogin: () => void; onExplore: () => void }) {
  const constellation = useQuery({ queryKey: ["student-constellation", user?.id], queryFn: api.studentConstellation, enabled: Boolean(user), staleTime: 20_000, retry: 1 });
  const player = useQuery({ queryKey: ["player-profile", user?.id], queryFn: api.playerProfile, enabled: Boolean(user), staleTime: 20_000, retry: 1 });

  if (!user) return <div className="page-width page-pad"><section className="student-gate"><div className="gate-icon"><UserRound /></div><span>CONSTELAÇÃO DO ALUNO</span><h1>Entre para montar sua trilha.</h1><p>Seu mapa usa apenas as atividades que você realmente joga para calcular domínio, sequência e missões do dia.</p><button className="button button-primary" onClick={onLogin}>Entrar ou criar conta <ArrowRight /></button></section></div>;

  if (constellation.isLoading) return <div className="page-width page-pad"><div className="constellation-loading"><LoaderCircle className="spin" /><strong>Montando sua constelação…</strong></div></div>;
  if (constellation.isError || !constellation.data) return <div className="page-width page-pad"><div className="source-status error"><strong>Não foi possível carregar sua constelação agora.</strong></div></div>;

  const data = constellation.data;
  const masterySorted = [...data.mastery].sort((a, b) => b.masteryScore - a.masteryScore);

  return <div className="page-width page-pad student-view">
    <header className="constellation-head">
      <div><span className="eyebrow"><MoonStar size={16} /> Constelação do Aluno</span><h1>Seu céu muda conforme você aprende.</h1><p>Suas respostas ajudam a montar um mapa do seu aprendizado. Aqui você vê o que já está forte, o que precisa de reforço e três caminhos para hoje.</p></div>
      <div className="student-level-orb"><small>NÍVEL</small><strong>{data.profile.level}</strong><span>{data.profile.xp.toLocaleString("pt-BR")} XP</span></div>
    </header>

    <section className="student-summary-grid">
      <article><Coins /><span>Luas</span><strong>{(player.data?.coins ?? user.moonCoins).toLocaleString("pt-BR")}</strong><small>ganhas ao participar e acertar atividades</small></article>
      <article><Sparkles /><span>Sequência</span><strong>{data.profile.streakDays} dia{data.profile.streakDays === 1 ? "" : "s"}</strong><small>aprendendo sem quebrar o ritmo</small></article>
      <article><BrainCircuit /><span>Hoje</span><strong>{data.today.answers} resposta{data.today.answers === 1 ? "" : "s"}</strong><small>{data.today.accuracy}% de acerto</small></article>
      <article><Trophy /><span>Matérias mapeadas</span><strong>{data.mastery.length}</strong><small>o mapa cresce ao jogar logado</small></article>
    </section>

    <section className="constellation-board">
      <div className="constellation-map">
        <div className="panel-heading"><div><span>MAPA DE DOMÍNIO</span><h2>As estrelas mais fortes do seu aprendizado</h2></div><BrainCircuit /></div>
        {masterySorted.length ? <div className="mastery-list">{masterySorted.map((item, index) => {
          const percent = Math.round(item.masteryScore * 100);
          return <article key={item.subject} className={`mastery-row mastery-${index % 4}`}><div className="mastery-orb"><span>{percent}</span><small>%</small></div><div className="mastery-copy"><div><strong>{item.subject}</strong><span>{item.attempts} tentativa{item.attempts === 1 ? "" : "s"}</span></div><div className="mastery-track"><i style={{ width: `${percent}%` }} /></div><small>{percent < 42 ? "precisa de reforço" : percent < 68 ? "em construção" : "domínio consistente"} • confiança {Math.round(item.confidence * 100)}%</small></div></article>;
        })}</div> : <div className="constellation-empty"><Sparkles /><strong>Seu mapa ainda está escuro.</strong><p>Jogue uma partida logado e as primeiras estrelas aparecem aqui.</p></div>}
      </div>

      <aside className="daily-missions">
        <div className="panel-heading"><div><span>TRÊS ROTAS PARA HOJE</span><h2>Missões adaptativas</h2></div><MoonStar /></div>
        {data.missions.length ? <div className="mission-stack">{data.missions.map((mission) => {
          const pct = mission.target ? Math.min(100, Math.round((mission.progress / mission.target) * 100)) : 0;
          return <article key={`${mission.type}-${mission.activityId}`} className={`mission-card mission-${mission.type}`}>
            <div className="mission-label"><span>{mission.type}</span><em>+{mission.rewardXp} XP</em></div>
            <strong>{mission.label}</strong><h3>{mission.title}</h3><p>{mission.subject} • {mission.difficulty === "easy" ? "leve" : mission.difficulty === "hard" ? "desafio" : "médio"}</p>
            <div className="mission-progress"><i style={{ width: `${pct}%` }} /></div><small>{mission.progress}/{mission.target} respostas hoje</small>
            <button onClick={() => { api.trackActivity(mission.activityId, "view"); onExplore(); }}>Encontrar atividade <ArrowRight /></button>
          </article>;
        })}</div> : <div className="constellation-empty"><Sparkles /><strong>Publique atividades para nascerem missões.</strong><p>As rotas aparecem quando há conteúdo disponível na Rede Lua.</p></div>}
      </aside>
    </section>

    <section className="student-player-profile">
      <div className="student-player-head">
        <div><span className="eyebrow"><Medal size={16} /> Meu histórico</span><h2>O que você já conquistou por aqui</h2><p>Sem currículo chato: suas partidas, medalhas e evolução aparecem conforme você joga.</p></div>
        <div className="student-player-kpis">
          <span><strong>{player.data?.gamesCompleted ?? 0}</strong> missões</span>
          <span><strong>{player.data?.accuracy ?? 0}%</strong> acerto</span>
          <span><strong>{player.data?.answers ?? 0}</strong> respostas</span>
        </div>
      </div>

      <div className="student-player-grid">
        <article className="student-badge-panel">
          <div className="panel-heading"><div><span>CONQUISTAS</span><h3>Medalhas que contam sua história</h3></div><Trophy /></div>
          {player.isLoading ? <div className="source-status"><LoaderCircle className="spin" /> carregando conquistas…</div> : player.data?.badges.length ? <div className="student-badge-list">{player.data.badges.map((badge) => <div key={badge.id}><b>{badge.icon}</b><span><strong>{badge.label}</strong><small>{badge.note}</small></span></div>)}</div> : <div className="player-empty"><Medal /><strong>A primeira medalha ainda está a caminho.</strong><span>Conclua uma partida para começar sua coleção.</span></div>}
        </article>

        <article className="student-history-panel">
          <div className="panel-heading"><div><span>MISSÕES CONCLUÍDAS</span><h3>Suas últimas partidas</h3></div><History /></div>
          {player.data?.history.length ? <div className="student-history-list">{player.data.history.map((item) => <div key={item.gameId}><span className="history-check"><CheckCircle2 /></span><div><strong>{item.title}</strong><small>{item.subject}{item.endedAt ? ` • ${new Date(item.endedAt).toLocaleDateString("pt-BR")}` : ""}</small></div><b>{item.score} pts</b></div>)}</div> : <div className="player-empty"><Sparkles /><strong>Nenhuma missão finalizada ainda.</strong><span>Quando você terminar uma partida, ela aparece aqui.</span></div>}
        </article>
      </div>
    </section>
  </div>;
}
