import { useState } from "react";
import { api } from "./api";
import type { User } from "./api";

const NAMES = ["Ангеліна", "Михайло", "Ольга", "Роман", "Гість"];

export default function Login({ onLogin }: { onLogin: (u: User) => void }) {
  const [name, setName] = useState(NAMES[0]);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function submit() {
    try {
      const r = await api("/auth/login", {
        method: "POST",
        body: JSON.stringify({ name, password }),
      });
      localStorage.setItem("token", r.token);
      localStorage.setItem("user", JSON.stringify(r.user));
      onLogin(r.user);
    } catch {
      setError("Невірний пароль");
    }
  }

  return (
    <div className="login">
      <div className="box">
        <h2>🔥 Вхід</h2>
        <label>Користувач</label>
        <select value={name} onChange={(e) => setName(e.target.value)}>
          {NAMES.map((n) => <option key={n}>{n}</option>)}
        </select>
        <label>Пароль</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
        />
        <div className="err">{error}</div>
        <button className="primary" onClick={submit}>Увійти</button>
      </div>
    </div>
  );
}
