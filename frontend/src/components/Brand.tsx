export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`brand ${compact ? "brand-compact" : ""}`}>
      <img src="/assets/rede-lua/brand/logo-transparent.webp" alt="Rede Lua na Educação" />
      <div>
        <strong>Rede Lua</strong>
        <span>na educação</span>
      </div>
    </div>
  );
}
