import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { lumiAnimations } from "../assets";

type LumiKind = (typeof lumiAnimations)[number]["id"];

export function LumiMoment({ kind = "smile", message, onClose, floating = false }: { kind?: LumiKind; message?: string; onClose?: () => void; floating?: boolean }) {
  const item = lumiAnimations.find((entry) => entry.id === kind) || lumiAnimations[0];
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(media.matches);
    update();
    media.addEventListener?.("change", update);
    return () => media.removeEventListener?.("change", update);
  }, []);

  return <div className={`lumi-moment ${floating ? "lumi-floating" : ""}`}>
    {reducedMotion ? <img src={item.poster} alt={item.label} /> : <video src={item.video} poster={item.poster} autoPlay muted loop playsInline preload="metadata" aria-label={item.label} />}
    {message && <div className="lumi-message"><small>LUMI</small><strong>{message}</strong></div>}
    {onClose && <button className="lumi-close" onClick={onClose} aria-label="Fechar"><X /></button>}
  </div>;
}
