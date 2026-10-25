const API = import.meta.env.VITE_API ?? "http://localhost:3000";

export type User = { id: number; name: string; role: string };

export function fmt(v: unknown): string {
  const s = String(v ?? "").slice(0, 10);
  const [y, m, d] = s.split("-");
  return y && m && d ? `${d}.${m}.${y}` : "";
}

export async function api(path: string, opts: RequestInit = {}) {
  const token = localStorage.getItem("token");
  const res = await fetch(API + path, {
    ...opts,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...opts.headers,
    },
  });
  if (res.status === 401 && token) {
    localStorage.clear();
    location.reload();
  }
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export function fmtPhone(v: string): string {
  const raw = v.replace(/\D/g, "");
  if (raw.length <= 3 && "380".startsWith(raw)) return "";
  let d = raw;
  if (d.startsWith("380")) d = d.slice(3);
  else if (d.startsWith("80")) d = d.slice(2);
  else if (d.startsWith("0")) d = d.slice(1);
  d = d.slice(0, 9);
  let r = "+380";
  if (d.length) r += " " + d.slice(0, 2);
  if (d.length >= 2) r += " ";
  if (d.length > 2) r += " " + d.slice(2, 5);
  if (d.length > 5) r += " " + d.slice(5, 7);
  if (d.length > 7) r += " " + d.slice(7, 9);
  return r;
}
