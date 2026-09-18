import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Activity, Archive, BellRing, BookOpenCheck, Check, ClipboardCopy, Flag, GraduationCap, KeyRound, LoaderCircle, LockKeyhole, Megaphone, RefreshCcw, Search, ShieldCheck, ShoppingBag, Sparkles, ToggleLeft, ToggleRight, Users, WandSparkles, Mail } from "lucide-react";
import { toast } from "sonner";
import { api } from "../api";
import { LumiMoment } from "../components/LumiMoment";
import type { AdminAnnouncement, SessionUser } from "../types";

type AdminTab = "overview" | "users" | "teachers" | "content" | "shop" | "support" | "announcements" | "features" | "audit";

const tabItems: Array<{ id: AdminTab; label: string; icon: typeof Users }> = [
  { id: "overview", label: "Visão geral", icon: Activity },
  { id: "users", label: "Pessoas", icon: Users },
  { id: "teachers", label: "Professores", icon: GraduationCap },
  { id: "content", label: "Conteúdo", icon: BookOpenCheck },
  { id: "shop", label: "Loja", icon: ShoppingBag },
  { id: "support", label: "Suporte", icon: Mail },
  { id: "announcements", label: "Avisos", icon: Megaphone },
  { id: "features", label: "Experimentos", icon: Flag },
  { id: "audit", label: "Auditoria", icon: ShieldCheck },
];

function makeTeacherCode() {
  const part = crypto.randomUUID().replace(/-/g, "").slice(0, 10).toUpperCase();
  return `LUA-PROF-${part}`;
}

export function AdminView({ user }: { user: SessionUser | null }) {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<AdminTab>("overview");
  const [search, setSearch] = useState("");
  const [inviteLabel, setInviteLabel] = useState("Convite de professor");
  const [inviteCode, setInviteCode] = useState(makeTeacherCode());
  const [inviteUses, setInviteUses] = useState(25);
  const [contentSearch, setContentSearch] = useState("");
  const [announcement, setAnnouncement] = useState<{ title:string; body:string; audience:AdminAnnouncement["audience"]; style:AdminAnnouncement["style"] }>({ title:"", body:"", audience:"all", style:"info" });

  const isAdmin = user?.role === "admin";
  const dashboard = useQuery({ queryKey:["admin-dashboard"], queryFn:api.adminDashboard, enabled:isAdmin, staleTime:15_000 });
  const users = useQuery({ queryKey:["admin-users",search], queryFn:()=>api.adminUsers(search), enabled:isAdmin && tab==="users", staleTime:10_000 });
  const invites = useQuery({ queryKey:["admin-invites"], queryFn:api.adminTeacherInvites, enabled:isAdmin && tab==="teachers", staleTime:10_000 });
  const activities = useQuery({ queryKey:["admin-activities",contentSearch], queryFn:()=>api.adminActivities(contentSearch), enabled:isAdmin && tab==="content", staleTime:10_000 });
  const shop = useQuery({ queryKey:["admin-cosmetics"], queryFn:api.adminCosmetics, enabled:isAdmin && tab==="shop", staleTime:10_000 });
  const supportMessages = useQuery({ queryKey:["admin-support"], queryFn:api.adminContactMessages, enabled:isAdmin && tab==="support", staleTime:10_000 });
  const announcements = useQuery({ queryKey:["admin-announcements"], queryFn:api.adminAnnouncements, enabled:isAdmin && tab==="announcements", staleTime:10_000 });
  const flags = useQuery({ queryKey:["admin-flags"], queryFn:api.adminFlags, enabled:isAdmin && tab==="features", staleTime:10_000 });
  const audit = useQuery({ queryKey:["admin-audit"], queryFn:api.adminAuditLog, enabled:isAdmin && tab==="audit", staleTime:10_000 });

  const refreshAdmin = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey:["admin-dashboard"] }),
      queryClient.invalidateQueries({ queryKey:["admin-users"] }),
      queryClient.invalidateQueries({ queryKey:["admin-invites"] }),
      queryClient.invalidateQueries({ queryKey:["admin-activities"] }),
      queryClient.invalidateQueries({ queryKey:["admin-cosmetics"] }),
      queryClient.invalidateQueries({ queryKey:["cosmetic-catalog"] }),
      queryClient.invalidateQueries({ queryKey:["admin-support"] }),
      queryClient.invalidateQueries({ queryKey:["admin-announcements"] }),
      queryClient.invalidateQueries({ queryKey:["admin-flags"] }),
      queryClient.invalidateQueries({ queryKey:["admin-audit"] }),
      queryClient.invalidateQueries({ queryKey:["public-feature-flags"] }),
      queryClient.invalidateQueries({ queryKey:["active-announcements"] }),
    ]);
  };

  const statusMutation = useMutation({
    mutationFn:({userId,status}:{userId:string;status:"active"|"suspended"})=>api.adminSetUserStatus(userId,status,status==="suspended"?"Suspenso pela gestão Rede Lua":""),
    onSuccess:async()=>{await refreshAdmin();toast.success("Status atualizado.");},
    onError:(error:Error)=>toast.error(error.message),
  });
  const roleMutation = useMutation({
    mutationFn:({userId,role}:{userId:string;role:"student"|"teacher"})=>api.adminSetUserRole(userId,role),
    onSuccess:async()=>{await refreshAdmin();toast.success("Cargo atualizado.");},
    onError:(error:Error)=>toast.error(error.message),
  });
  const inviteMutation = useMutation({
    mutationFn:()=>api.adminCreateTeacherInvite({label:inviteLabel,code:inviteCode,maxUses:inviteUses}),
    onSuccess:async(data)=>{await refreshAdmin();navigator.clipboard?.writeText(data.code);toast.success("Convite criado e copiado.");setInviteCode(makeTeacherCode());},
    onError:(error:Error)=>toast.error(error.message),
  });
  const activityMutation = useMutation({
    mutationFn:({id,archived}:{id:string;archived:boolean})=>api.adminArchiveActivity(id,archived),
    onSuccess:async()=>{await refreshAdmin();toast.success("Conteúdo atualizado.");},
    onError:(error:Error)=>toast.error(error.message),
  });
  const cosmeticMutation = useMutation({
    mutationFn:({id,cost,level,active}:{id:string;cost:number;level:number;active:boolean})=>api.adminUpdateCosmetic({id,cost,level,active}),
    onSuccess:async()=>{await refreshAdmin();toast.success("Item da Loja Lunar atualizado.");},
    onError:(error:Error)=>toast.error(error.message),
  });
  const announcementMutation = useMutation({
    mutationFn:()=>api.adminSaveAnnouncement({title:announcement.title,body:announcement.body,audience:announcement.audience,style:announcement.style,active:true}),
    onSuccess:async()=>{await refreshAdmin();toast.success("Aviso publicado.");setAnnouncement({title:"",body:"",audience:"all",style:"info"});},
    onError:(error:Error)=>toast.error(error.message),
  });
  const flagMutation = useMutation({
    mutationFn:({key,enabled,config}:{key:string;enabled:boolean;config:Record<string,unknown>})=>api.adminSetFlag(key,enabled,config),
    onSuccess:async()=>{await refreshAdmin();toast.success("Experimento atualizado.");},
    onError:(error:Error)=>toast.error(error.message),
  });

  const metrics = useMemo(() => dashboard.data ? [
    ["Pessoas", dashboard.data.users, Users], ["Professores", dashboard.data.teachers, GraduationCap], ["Partidas hoje", dashboard.data.gamesToday, WandSparkles], ["Respostas hoje", dashboard.data.answersToday, BookOpenCheck], ["Atividades", dashboard.data.activities, Sparkles], ["Suspensos", dashboard.data.suspended, LockKeyhole],
  ] as const : [], [dashboard.data]);

  if (!user) return <div className="page-width page-pad"><section className="admin-gate"><LockKeyhole /><h1>Entre na sua conta de gestão.</h1><p>A área administrativa não fica disponível para visitantes.</p></section></div>;
  if (!isAdmin) return <div className="page-width page-pad"><section className="admin-gate"><ShieldCheck /><h1>Área reservada à gestão.</h1><p>Seu perfil continua normal. Esta tela só abre para contas administrativas autorizadas pelo backend.</p></section></div>;

  return <div className="page-width page-pad admin-page">
    <section className="admin-hero">
      <div><span className="eyebrow"><ShieldCheck size={16}/> Rede Lua Control</span><h1>O bastidor da Rede Lua.</h1><p>Cuide das pessoas, dos professores e das experiências sem precisar mexer direto no banco.</p><div className="admin-session"><span className="status-dot running"/> Sessão administrativa protegida</div></div>
      <LumiMoment kind="calm" message="tá tudo sob controle 🌙" />
    </section>

    <nav className="admin-tabs" aria-label="Seções administrativas">{tabItems.map(({id,label,icon:Icon})=><button key={id} className={tab===id?"active":""} onClick={()=>setTab(id)}><Icon/>{label}</button>)}</nav>

    {tab==="overview" && <section className="admin-section">
      <div className="admin-section-head"><div><span>AGORA</span><h2>Visão geral</h2></div><button className="icon-button" onClick={()=>dashboard.refetch()}><RefreshCcw/></button></div>
      {dashboard.isLoading ? <div className="source-status"><LoaderCircle className="spin"/> carregando…</div> : <><div className="admin-metrics">{metrics.map(([label,value,Icon])=><article key={label}><Icon/><span>{label}</span><strong>{Number(value).toLocaleString("pt-BR")}</strong></article>)}</div><div className="admin-recent"><h3>Chegaram recentemente</h3>{dashboard.data?.recentUsers.map((item)=><div key={item.userId}><span className={`admin-role-dot ${item.role}`}/><strong>{item.displayName}</strong><small>{item.role==="teacher"?"Professor":item.role==="admin"?"Gestão":"Aluno"} • nível {item.level}</small><em>{new Date(item.createdAt).toLocaleDateString("pt-BR")}</em></div>)}</div></>}
    </section>}

    {tab==="users" && <section className="admin-section">
      <div className="admin-section-head"><div><span>PESSOAS</span><h2>Contas da plataforma</h2></div><label className="admin-search"><Search/><input value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="Nome ou e-mail"/></label></div>
      <div className="admin-user-list">{users.isLoading?<div className="source-status"><LoaderCircle className="spin"/> buscando…</div>:users.data?.map((item)=><article key={item.userId} className={item.accountStatus==="suspended"?"suspended":""}><div className="admin-user-main"><span className={`admin-role-dot ${item.role}`}/><div><strong>{item.displayName}</strong><small>{item.email}</small></div></div><div className="admin-user-meta"><span>Nv. {item.level}</span><span>{item.moonCoins} Luas</span><span>{item.accountStatus==="suspended"?"Suspenso":"Ativo"}</span></div><div className="admin-user-actions">{item.role!=="admin"&&<select value={item.role} onChange={(e)=>roleMutation.mutate({userId:item.userId,role:e.target.value as "student"|"teacher"})}><option value="student">Aluno</option><option value="teacher">Professor</option></select>}<button className={item.accountStatus==="suspended"?"restore":"danger"} disabled={statusMutation.isPending||item.role==="admin"} onClick={()=>statusMutation.mutate({userId:item.userId,status:item.accountStatus==="suspended"?"active":"suspended"})}>{item.accountStatus==="suspended"?<><Check/>Reativar</>:<><LockKeyhole/>Suspender</>}</button></div></article>)}</div>
    </section>}

    {tab==="teachers" && <section className="admin-section admin-two-col">
      <div className="admin-card"><div className="admin-section-head"><div><span>CONVITES</span><h2>Novo código de professor</h2></div><KeyRound/></div><label>Nome do convite<input value={inviteLabel} onChange={(e)=>setInviteLabel(e.target.value)} maxLength={80}/></label><label>Código<div className="admin-code-field"><input value={inviteCode} onChange={(e)=>setInviteCode(e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g,""))}/><button onClick={()=>setInviteCode(makeTeacherCode())}><RefreshCcw/></button></div></label><label>Quantidade de usos<input type="number" min={1} max={500} value={inviteUses} onChange={(e)=>setInviteUses(Math.max(1,Math.min(500,Number(e.target.value)||1)))}/></label><button className="button button-primary" onClick={()=>inviteMutation.mutate()} disabled={inviteMutation.isPending||inviteCode.length<8}>{inviteMutation.isPending?<LoaderCircle className="spin"/>:<KeyRound/>} Criar e copiar código</button></div>
      <div className="admin-card"><div className="admin-section-head"><div><span>ATIVOS</span><h2>Códigos recentes</h2></div><ClipboardCopy/></div><div className="invite-list">{invites.data?.map((item)=><div key={item.id}><div><strong>{item.label}</strong><small>{item.uses}/{item.maxUses} usos</small></div><span>{item.active?"Ativo":"Desativado"}</span></div>)}</div></div>
    </section>}

    {tab==="content" && <section className="admin-section">
      <div className="admin-section-head"><div><span>CONTEÚDO</span><h2>Atividades publicadas</h2><p>Veja quem criou, quantas perguntas existem e arquive algo quando for necessário.</p></div><label className="admin-search"><Search/><input value={contentSearch} onChange={(e)=>setContentSearch(e.target.value)} placeholder="Quiz, matéria ou professor"/></label></div>
      <div className="admin-content-list">{activities.isLoading?<div className="source-status"><LoaderCircle className="spin"/> carregando…</div>:activities.data?.map((item)=><article key={item.id} className={item.status==="archived"?"archived":""}><div><small>{item.subject} • {item.status}</small><strong>{item.title}</strong><span>por {item.authorName}</span></div><div className="admin-content-kpis"><span>{item.questions} perguntas</span><span>{item.games} partidas</span></div><button disabled={activityMutation.isPending} onClick={()=>activityMutation.mutate({id:item.id,archived:item.status!=="archived"})}><Archive/>{item.status==="archived"?"Restaurar rascunho":"Arquivar"}</button></article>)}</div>
    </section>}

    {tab==="shop" && <section className="admin-section">
      <div className="admin-section-head"><div><span>LOJA LUNAR</span><h2>Economia cosmética</h2><p>Ajuste preço, nível mínimo e disponibilidade sem alterar o código do site.</p></div><ShoppingBag/></div>
      <div className="admin-shop-grid">{shop.data?.map((item)=><article key={item.id} className={item.active===false?"disabled":""}><div className="admin-shop-icon">{item.emoji}</div><div><strong>{item.label}</strong><small>{item.kind} • {item.value}</small><p>{item.note}</p></div><label>Preço<input type="number" min={0} defaultValue={item.cost} onBlur={(e)=>{const cost=Math.max(0,Number(e.target.value)||0);if(cost!==item.cost)cosmeticMutation.mutate({id:item.id,cost,level:item.level,active:item.active!==false});}}/></label><label>Nível<input type="number" min={1} defaultValue={item.level} onBlur={(e)=>{const level=Math.max(1,Number(e.target.value)||1);if(level!==item.level)cosmeticMutation.mutate({id:item.id,cost:item.cost,level,active:item.active!==false});}}/></label><button className={item.active===false?"restore":"danger"} onClick={()=>cosmeticMutation.mutate({id:item.id,cost:item.cost,level:item.level,active:item.active===false})}>{item.active===false?<ToggleLeft/>:<ToggleRight/>}{item.active===false?"Ativar":"Pausar"}</button></article>)}</div>
    </section>}

    {tab==="support" && <section className="admin-section">
      <div className="admin-section-head"><div><span>CAIXA DE ENTRADA</span><h2>Suporte e contato</h2><p>Mensagens enviadas pelo formulário da Rede Lua ficam reunidas aqui quando o backend de contato está configurado.</p></div><Mail/></div>
      <div className="v8-support-inbox">{supportMessages.isLoading?<div className="source-status"><LoaderCircle className="spin"/> carregando…</div>:supportMessages.data?.length? supportMessages.data.map((item)=><article key={item.id}><div><span className={`v8-ticket-status status-${item.status}`}>{item.status}</span><strong>{item.name}</strong><a href={`mailto:${item.email}`}>{item.email}</a></div><small>{item.topic} • {new Date(item.createdAt).toLocaleString("pt-BR")}</small><p>{item.message}</p></article>):<div className="v8-empty-state"><Mail/><strong>Nenhuma mensagem por aqui ainda.</strong><span>Quando alguém usar a página de contato, ela aparece aqui.</span></div>}</div>
    </section>}

    {tab==="announcements" && <section className="admin-section admin-two-col">
      <div className="admin-card"><div className="admin-section-head"><div><span>COMUNICADO</span><h2>Publicar aviso</h2></div><BellRing/></div><label>Título<input value={announcement.title} onChange={(e)=>setAnnouncement({...announcement,title:e.target.value})} maxLength={100} placeholder="Ex.: Semana de Ciências começou!"/></label><label>Mensagem<textarea value={announcement.body} onChange={(e)=>setAnnouncement({...announcement,body:e.target.value})} maxLength={600} rows={5} placeholder="Escreva como gente. Curto e direto."/></label><div className="admin-form-row"><label>Para<select value={announcement.audience} onChange={(e)=>setAnnouncement({...announcement,audience:e.target.value as AdminAnnouncement["audience"]})}><option value="all">Todo mundo</option><option value="students">Alunos</option><option value="teachers">Professores</option></select></label><label>Clima<select value={announcement.style} onChange={(e)=>setAnnouncement({...announcement,style:e.target.value as AdminAnnouncement["style"]})}><option value="info">Informativo</option><option value="success">Boa notícia</option><option value="warning">Atenção</option><option value="event">Evento</option></select></label></div><button className="button button-primary" disabled={announcementMutation.isPending||announcement.title.trim().length<2} onClick={()=>announcementMutation.mutate()}><Megaphone/> Publicar</button></div>
      <div className="admin-card"><div className="admin-section-head"><div><span>HISTÓRICO</span><h2>Avisos</h2></div></div><div className="announcement-admin-list">{announcements.data?.map((item)=><article key={item.id} className={`announcement-${item.style}`}><small>{item.audience==="all"?"Todo mundo":item.audience==="students"?"Alunos":"Professores"}</small><strong>{item.title}</strong><p>{item.body}</p><span>{item.active?"No ar":"Pausado"}</span></article>)}</div></div>
    </section>}

    {tab==="features" && <section className="admin-section"><div className="admin-section-head"><div><span>LABORATÓRIO</span><h2>Experimentos da interface</h2><p>Ligue ou desligue novidades sem precisar fazer outro deploy.</p></div><Flag/></div><div className="flag-grid">{flags.data?.map((item)=><article key={item.key}><div><strong>{item.key.replace(/_/g," ")}</strong><p>{item.description}</p></div><button className={item.enabled?"enabled":""} onClick={()=>flagMutation.mutate({key:item.key,enabled:!item.enabled,config:item.config})}>{item.enabled?<ToggleRight/>:<ToggleLeft/>}<span>{item.enabled?"Ligado":"Desligado"}</span></button></article>)}</div></section>}

    {tab==="audit" && <section className="admin-section"><div className="admin-section-head"><div><span>RASTRO</span><h2>Auditoria</h2><p>Ações sensíveis deixam registro para a equipe saber o que mudou.</p></div><ShieldCheck/></div><div className="audit-list">{audit.data?.map((item)=><article key={item.id}><span>{new Date(item.createdAt).toLocaleString("pt-BR")}</span><strong>{item.adminName}</strong><code>{item.action}</code><small>{item.targetType}{item.targetId?` • ${item.targetId.slice(0,16)}`:""}</small></article>)}</div></section>}
  </div>;
}
