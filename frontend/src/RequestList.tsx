import { useEffect, useState } from "react";
import { api } from "./api";

type Req = {
  id: number;
  createdAt: string;
  status: string;
  kind: string;
  price: number;
  client?: { fullName: string; phone: string; address: string };
  boiler?: { brand: string; modelName: string; serialNumber: string | null };
};

const iso = (d: Date) =>
  new Date(d.getTime() - d.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 10);

function span(range: string, d1: string, d2: string): [string, string] {
  const t = new Date();
  if (range === "today") return [iso(t), iso(t)];
  if (range === "week") {
    const s = new Date(t);
    s.setDate(t.getDate() - ((t.getDay() + 6) % 7));
    const e = new Date(s);
    e.setDate(s.getDate() + 6);
    return [iso(s), iso(e)];
  }
  if (range === "month")
    return [
      iso(new Date(t.getFullYear(), t.getMonth(), 1)),
      iso(new Date(t.getFullYear(), t.getMonth() + 1, 0)),
    ];
  return [d1, d2];
}

const KIND: Record<string, string> = {
  LAUNCH: "Запуск",
  REPAIR: "Ремонт",
  SERVICE: "ТО",
};
const STATUS: Record<string, string> = {
  NEW: "Нова",
  IN_PROGRESS: "В роботі",
  DONE: "Виконано",
};
const COLOR: Record<string, string> = {
  NEW: "s0",
  IN_PROGRESS: "s1",
  DONE: "s2",
};

export default function RequestList({
  onOpen,
  ver,
}: {
  onOpen: (id: number) => void;
  ver: number;
}) {
  const [range, setRange] = useState("today");
  const [d1, setD1] = useState("");
  const [d2, setD2] = useState("");
  const [f, setF] = useState({ serial: "", address: "", name: "", phone: "" });
  const [items, setItems] = useState<Req[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const [from, to] = span(range, d1, d2);
    const p = new URLSearchParams();
    if (from) p.set("from", from);
    if (to) p.set("to", to);
    Object.entries(f).forEach(([k, v]) => v && p.set(k, v));
    api("/requests?" + p.toString())
      .then((r) => {
        setItems(r);
        setError("");
      })
      .catch(() => setError("Не вдалося завантажити заявки"));
  }, [range, d1, d2, f, ver]);
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setF({ ...f, [k]: e.target.value });

  return (
    <main>
      <div className="row seg">
        {[
          ["today", "Сьогодні"],
          ["week", "Тиждень"],
          ["month", "Місяць"],
          ["custom", "Період"],
        ].map(([k, l]) => (
          <button
            key={k}
            className={range === k ? "on" : ""}
            onClick={() => setRange(k)}
          >
            {l}
          </button>
        ))}
      </div>
      {range === "custom" && (
        <div className="row">
          <input
            type="date"
            value={d1}
            onChange={(e) => setD1(e.target.value)}
          />
          <input
            type="date"
            value={d2}
            onChange={(e) => setD2(e.target.value)}
          />
        </div>
      )}
      <div className="row">
        <input
          placeholder="С/н котла"
          value={f.serial}
          onChange={set("serial")}
        />
        <input
          placeholder="Адреса"
          value={f.address}
          onChange={set("address")}
        />
        <input placeholder="ПІБ" value={f.name} onChange={set("name")} />
        <input placeholder="Телефон" value={f.phone} onChange={set("phone")} />
      </div>
      {error && <p className="muted">{error}</p>}
      {items.length === 0 && !error && (
        <p className="muted">Заявок за цей період немає</p>
      )}
      {items.map((r) => (
  <div key={r.id} onClick={() => onOpen(r.id)} className={`card ${COLOR[r.status] ?? "s0"}`}>          <b>№{r.id}</b>
          <div>
            <b>{r.client?.fullName}</b>
            <div className="muted">{r.client?.phone}</div>
          </div>
          <div>
            {r.client?.address}
            <div className="muted">
              {r.boiler?.brand} {r.boiler?.modelName}
              {r.boiler?.serialNumber ? " · " + r.boiler.serialNumber : ""}
            </div>
          </div>
          <div>
            <span className="tag">{KIND[r.kind] ?? r.kind}</span>
            <span className="tag">{STATUS[r.status] ?? r.status}</span>
            <div className="muted">
              {String(r.createdAt).slice(0, 10)} · {r.price} грн
            </div>
          </div>
        </div>
      ))}
    </main>
  );
}
