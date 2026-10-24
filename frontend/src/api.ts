const API = import.meta.env.VITE_API ?? "http://localhost:3002";

export type User = { id: number; name: string; role: string };

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
