import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { ArrowRight, Building2, CheckCircle2, LifeBuoy, LoaderCircle, Mail, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { api } from "../api";
import type { ContactPayload, SessionUser } from "../types";

export function SupportV8({ user }: { user: SessionUser | null }) {
  const [form, setForm] = useState<ContactPayload>({ name: user?.displayName || "", email: user?.email || "", topic: "suporte", message: "" });
  const send = useMutation({
    mutationFn: () => api.contact(form),
    onSuccess: () => { toast.success("Mensagem enviada para a Rede Lua."); setForm((f) => ({ ...f, message: "" })); },
    onError: (error: Error) => toast.error(error.message),
  });

  return <div className="v8-shell v8-support">
    <header className="v8-support-head"><div><span className="v8-kicker"><LifeBuoy /> FALE COM A REDE LUA</span><h1>Suporte de verdade, sem esconder o contato.</h1><p>Problema na conta, escola interessada, professor com dúvida ou uma ideia boa? Escolha o assunto e manda.</p></div><div className="v8-support-orbit"><Mail /></div></header>

    <section className="v8-support-grid">
      <div className="v8-contact-cards">
        <article><LifeBuoy /><div><span>SUPORTE</span><strong>support@redelua.xyz</strong><p>Conta, acesso, bugs e ajuda com a plataforma.</p></div></article>
        <article><MessageCircle /><div><span>CONTATO</span><strong>contato@redelua.xyz</strong><p>Parcerias, ideias, imprensa e contato geral.</p></div></article>
        <article><Building2 /><div><span>ESCOLAS</span><strong>escolas@redelua.xyz</strong><p>Apresentação, implantação e uso em sala.</p></div></article>
      </div>

      <form className="v8-support-form" onSubmit={(e) => { e.preventDefault(); send.mutate(); }}>
        <span>MANDAR UMA MENSAGEM</span><h2>Conta pra gente o que aconteceu.</h2>
        <div className="v8-form-grid"><label>Seu nome<input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} maxLength={80} required /></label><label>Seu e-mail<input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} maxLength={180} required /></label><label className="wide">Assunto<select value={form.topic} onChange={(e) => setForm((f) => ({ ...f, topic: e.target.value as ContactPayload["topic"] }))}><option value="suporte">Preciso de suporte</option><option value="contato">Contato geral</option><option value="escola">Sou de uma escola</option><option value="professor">Sou professor</option><option value="privacidade">Privacidade e dados</option></select></label><label className="wide">Mensagem<textarea value={form.message} onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))} minLength={10} maxLength={3000} required placeholder="Pode escrever do seu jeito. Quanto mais contexto, mais fácil ajudar." /></label></div>
        <button className="v8-primary" disabled={send.isPending}>{send.isPending ? <LoaderCircle className="spin" /> : <Mail />} Enviar mensagem <ArrowRight /></button>
        {send.isSuccess && <div className="v8-contact-success"><CheckCircle2 /> Recebemos sua mensagem.</div>}
      </form>
    </section>
  </div>;
}
