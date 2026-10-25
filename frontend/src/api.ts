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
