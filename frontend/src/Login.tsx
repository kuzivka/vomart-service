import { useState } from "react";
import { api } from "./api";
import type { User } from "./api";

const Eye = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOff = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M17.9 17.9A10.1 10.1 0 0 1 12 19c-6.5 0-10-7-10-7a17.6 17.6 0 0 1 4.1-5" />
    <path d="M9.9 4.2A9.7 9.7 0 0 1 12 4c6.5 0 10 7 10 7a17.6 17.6 0 0 1-2.2 3.2" />
    <path d="M14.1 14.1a3 3 0 1 1-4.2-4.2" />
    <path d="M2 2l20 20" />
  </svg>
);

const NAMES = ["Ангеліна", "Михайло", "Ольга", "Роман", "Гість"];

export default function Login({ onLogin }: { onLogin: (u: User) => void }) {
  const [name, setName] = useState(NAMES[0]);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [show, setShow] = useState(false);

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
        <img className="login-logo" src="/logo.png" alt="Vomart" />
        <h2>Вхід</h2> <label>Користувач</label>
        <select value={name} onChange={(e) => setName(e.target.value)}>
          {NAMES.map((n) => (
            <option key={n}>{n}</option>
          ))}
        </select>
        <label>Пароль</label>
        <div className="pw">
          <input
            type={show ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            autoComplete="current-password"
          />
          <button
            type="button"
            onClick={() => setShow(!show)}
            aria-label={show ? "Сховати пароль" : "Показати пароль"}
          >
            {show ? <EyeOff /> : <Eye />}{" "}
          </button>
        </div>
        <div className="err">{error}</div>
        <button className="primary" onClick={submit}>
          Увійти
        </button>
      </div>
    </div>
  );
}
