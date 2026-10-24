import { useState } from "react";
import Login from "./Login";
import RequestList from "./RequestList";
import RequestForm from "./RequestForm";
import type { User } from "./api";

export default function App() {
  const [user, setUser] = useState<User | null>(() => {
    try { return JSON.parse(localStorage.getItem("user") ?? "null"); } catch { return null; }
  });
  const [open, setOpen] = useState<number | "new" | null>(null);
  const [ver, setVer] = useState(0);
  if (!user) return <Login onLogin={setUser} />;
  return (
    <>
      <header>
        <b>🔥 Заявки</b>
        <span>
          {user.role !== "GUEST" && <button className="primary" onClick={() => setOpen("new")}>+ Нова</button>}{" "}
          {user.name}{" "}
          <button onClick={() => { localStorage.clear(); setUser(null); }}>Вийти</button>
        </span>
      </header>
      <RequestList onOpen={setOpen} ver={ver} />
      {open !== null && (
        <RequestForm id={open === "new" ? null : open} user={user}
          onClose={(saved) => { setOpen(null); if (saved) setVer(ver + 1); }} />
      )}
    </>
  );
}
