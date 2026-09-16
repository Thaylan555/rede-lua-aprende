import { supabase } from "./supabase";

let initialized = false;

function fallbackUuid() {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = [...bytes].map((v) => v.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

function sessionId() {
  if (typeof window === "undefined") return "00000000-0000-4000-8000-000000000000";
  const key = "rede-lua-core-session";
  let value = sessionStorage.getItem(key);
  if (!value) {
    value = typeof crypto.randomUUID === "function" ? crypto.randomUUID() : fallbackUuid();
    sessionStorage.setItem(key, value);
  }
  return value;
}

function safeEventName(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9_.:-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 64) || "event.unknown";
}

function send(eventName: string, surface: string, metadata: Record<string, unknown> = {}, activityId?: string | null) {
  void (async () => {
    try {
      await supabase.rpc("rede_lua_track_core_event", {
        p_session_id: sessionId(),
        p_event_name: safeEventName(eventName),
        p_surface: surface.slice(0, 64),
        p_activity_id: activityId || null,
        p_metadata: metadata,
      });
    } catch {
      // Telemetria nunca deve quebrar a experiência do aluno/professor.
    }
  })();
}

export function initCoreAnalytics() {
  if (initialized || typeof window === "undefined") return;
  initialized = true;
  send("session.start", "app", {
    viewport: `${window.innerWidth}x${window.innerHeight}`,
    language: navigator.language,
  });
}

export function trackPage(title: string, path: string) {
  send("page.view", "navigation", { title: title.slice(0, 120), path: path.slice(0, 180) });
}

export function trackEvent(category: string, action: string, name?: string, activityId?: string | null) {
  send(`${category}.${action}`, category || "app", name ? { name: name.slice(0, 160) } : {}, activityId);
}
