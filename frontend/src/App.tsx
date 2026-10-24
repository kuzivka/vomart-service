import { useState } from "react";
import Login from "./Login";
import RequestList from "./RequestList";
import type { User } from "./api";

export default function App() {
  const [user, setUser] = useState<User | null>(() => {
    try { return JSON.parse(localStorage.getItem("user") ?? "null"); } catch { return null; }
  });
  if (!user) return <Login onLogin={setUser} />;
  return (
    <>
      <header>
        <b>🔥 Заявки</b>
        <span>
          {user.name}{" "}
          <button onClick={() => { localStorage.clear(); setUser(null); }}>Вийти</button>
        </span>
      </header>
      <RequestList />
    </>
  );
}
