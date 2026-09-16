import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Eye, EyeOff, GraduationCap, LockKeyhole, Mail, MoonStar, UserRound, X } from "lucide-react";
import { toast } from "sonner";
import { api } from "../api";
import type { Role } from "../types";

export function AuthDialog({ open, onClose, preferredRole = "student" }: { open: boolean; onClose: () => void; preferredRole?: Exclude<Role, "admin"> }) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [role, setRole] = useState<"student" | "teacher">(preferredRole);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ displayName: "", email: "", password: "", teacherCode: "" });
  const queryClient = useQueryClient();

  useEffect(() => setRole(preferredRole), [preferredRole]);
  useEffect(() => {
    if (!open) {
      setForm({ displayName: "", email: "", password: "", teacherCode: "" });
      setShowPassword(false);
    }
  }, [open]);

  const login = useMutation({
    mutationFn: () => api.login({ email: form.email, password: form.password }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["session"] });
      toast.success("Bem-vindo de volta!");
      onClose();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const register = useMutation({
    mutationFn: () => api.register({ displayName: form.displayName, email: form.email, password: form.password, role, teacherCode: role === "teacher" ? form.teacherCode : undefined }),
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: ["session"] });
      toast.success(data.requiresConfirmation ? "Conta criada. Confirme seu e-mail para entrar." : "Conta criada. Bem-vindo à Rede Lua!");
      onClose();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  if (!open) return null;
  const pending = login.isPending || register.isPending;
  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.email || !form.password) return toast.error("Preencha e-mail e senha.");
    if (mode === "register" && form.displayName.trim().length < 2) return toast.error("Digite seu nome.");
    if (mode === "register" && form.password.length < 8) return toast.error("A senha precisa ter pelo menos 8 caracteres.");
    mode === "login" ? login.mutate() : register.mutate();
  };

  return (
    <div className="modal-layer" role="dialog" aria-modal="true" aria-label="Acesso à Rede Lua">
      <button className="modal-backdrop" onClick={onClose} aria-label="Fechar" />
      <section className="auth-dialog">
        <button className="modal-close" onClick={onClose} aria-label="Fechar"><X /></button>
        <div className="auth-art">
          <span className="eyebrow"><MoonStar size={16} /> conta Rede Lua</span>
          <h2>Seu espaço para aprender e criar.</h2>
          <p>Entre com e-mail e senha. Seu acesso fica salvo com segurança e você não precisa usar uma conta Google.</p>
          <div className="auth-moon"><img src="/assets/rede-lua/brand/logo-transparent.webp" alt="" /></div>
          <ul>
            <li><LockKeyhole /> acesso protegido para sua conta</li>
            <li><GraduationCap /> contas de professor usam um código de acesso</li>
          </ul>
        </div>
        <div className="auth-form-wrap">
          <div className="segmented auth-tabs">
            <button className={mode === "login" ? "active" : ""} onClick={() => setMode("login")}>Entrar</button>
            <button className={mode === "register" ? "active" : ""} onClick={() => setMode("register")}>Criar conta</button>
          </div>
          {mode === "register" && (
            <div className="role-picker">
              <button className={role === "student" ? "active" : ""} onClick={() => setRole("student")}><UserRound /> Aluno</button>
              <button className={role === "teacher" ? "active" : ""} onClick={() => setRole("teacher")}><GraduationCap /> Professor</button>
            </div>
          )}
          <form onSubmit={submit}>
            {mode === "register" && <label>Como quer ser chamado?<span className="field"><UserRound /><input value={form.displayName} onChange={(e) => setForm((v) => ({ ...v, displayName: e.target.value }))} placeholder="Seu nome" maxLength={36} autoComplete="name" /></span></label>}
            <label>E-mail<span className="field"><Mail /><input value={form.email} onChange={(e) => setForm((v) => ({ ...v, email: e.target.value }))} placeholder="voce@email.com" type="email" autoComplete="email" /></span></label>
            <label>Senha<span className="field"><LockKeyhole /><input value={form.password} onChange={(e) => setForm((v) => ({ ...v, password: e.target.value }))} placeholder={mode === "register" ? "Mínimo de 8 caracteres" : "Sua senha"} type={showPassword ? "text" : "password"} autoComplete={mode === "login" ? "current-password" : "new-password"} /><button type="button" className="password-toggle" onClick={() => setShowPassword((v) => !v)} aria-label="Mostrar ou ocultar senha">{showPassword ? <EyeOff /> : <Eye />}</button></span></label>
            {mode === "register" && role === "teacher" && <label>Código de professor<span className="field"><GraduationCap /><input value={form.teacherCode} onChange={(e) => setForm((v) => ({ ...v, teacherCode: e.target.value }))} placeholder="Fornecido pela Rede Lua" type="password" autoComplete="off" /></span><small>Impede que qualquer pessoa crie uma conta com permissões de professor.</small></label>}
            <button className="button button-primary button-wide" disabled={pending}>{pending ? "Carregando…" : mode === "login" ? "Entrar na Rede Lua" : "Criar minha conta"}</button>
          </form>
        </div>
      </section>
    </div>
  );
}
