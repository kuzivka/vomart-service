import { useEffect, useState } from "react";
import { api, fmt } from "./api";
import type { User } from "./api";

const blank = {
  fullName: "",
  phone: "",
  address: "",
  brand: "",
  modelName: "",
  serialNumber: "",
  type: "TURBO",
  warranty: false,
  hasBooklet: false,
  purchaseDate: "",
  soldPlaceInBooklet: false,
  launched: true,
  kind: "REPAIR",
  launchDate: "",
  clientMessage: "",
  status: "NEW",
  price: "" as string | number,
};
const BRANDS = [
  "Immergas",
  "Vaillant",
  "Bosch",
  "Airfel",
  "Ariston",
  "Italtherm",
  "ATON",
  "Atmos",
  "Baxi",
  "Beretta",
  "Buderus",
  "Ferroli",
  "Kospel",
  "Protherm",
  "Viessmann",
  "Baymak",
  "Demrad",
  "ECA",
  "Інше (вказати марку і модель в ʼмодельʼ)",
];
const day = (v: any) => (v ? String(v).slice(0, 10) : "");

export default function RequestForm({
  id,
  user,
  onClose,
}: {
  id: number | null;
  user: User;
  onClose: (saved: boolean) => void;
}) {
  const isNew = id === null;
  const readOnly = user.role === "GUEST";
  const [f, setF] = useState<any>(blank);
  const [creator, setCreator] = useState("");
  const [works, setWorks] = useState<any[]>([]);
  const [w, setW] = useState({
    date: new Date().toISOString().slice(0, 10),
    description: "",
  });
  const [touched, setTouched] = useState(false);
  const [error, setError] = useState("");
  const set = (k: string, v: any) => setF((p: any) => ({ ...p, [k]: v }));

  useEffect(() => {
    if (isNew) return;
    api("/requests/" + id)
      .then((r) => {
        setF({
          ...blank,
          ...r.client,
          ...r.boiler,
          launched: r.kind === "LAUNCH",
          kind: r.kind === "LAUNCH" ? "REPAIR" : r.kind,
          warranty: r.warranty,
          hasBooklet: r.hasBooklet,
          launchDate: day(r.launchDate),
          purchaseDate: day(r.boiler?.purchaseDate),
          clientMessage: r.clientMessage ?? "",
          serialNumber: r.boiler?.serialNumber ?? "",
          status: r.status,
          price: r.price,
        });
        setWorks(r.works ?? []);
        setTouched(true);
        setCreator(r.creator ?? "");
      })
      .catch(() => setError("Не вдалося завантажити заявку"));
  }, [id]);

  useEffect(() => {
    if (!isNew || touched) return;
    const p = f.launched
      ? f.type === "CONDENSING"
        ? 2000
        : 1500
      : f.kind === "REPAIR"
        ? 1000
        : "";
    set("price", p);
  }, [f.launched, f.kind, f.type]);

  const kind = f.launched ? "LAUNCH" : f.kind;
  const opt = (v: any) => (v === "" ? undefined : v);

  async function save() {
    try {
      if (isNew) {
        await api("/requests", {
          method: "POST",
          body: JSON.stringify({
            fullName: f.fullName,
            phone: f.phone,
            address: f.address,
            brand: f.brand,
            modelName: f.modelName,
            serialNumber: opt(f.serialNumber),
            type: f.type,
            soldPlaceInBooklet: f.soldPlaceInBooklet,
            purchaseDate: opt(f.purchaseDate),
            kind,
            warranty: f.warranty,
            hasBooklet: f.hasBooklet,
            launchDate: opt(f.launchDate),
            clientMessage: opt(f.clientMessage),
            price: f.price === "" ? undefined : Number(f.price),
          }),
        });
      } else {
        await api("/requests/" + id, {
          method: "PATCH",
          body: JSON.stringify({
            status: f.status,
            kind,
            warranty: f.warranty,
            hasBooklet: f.hasBooklet,
            launchDate: opt(f.launchDate),
            clientMessage: f.clientMessage,
            price: Number(f.price) || 0,
          }),
        });
      }
      onClose(true);
    } catch (e: any) {
      setError("Не вдалося зберегти: " + (e.message ?? ""));
    }
  }

  async function addWork() {
    if (!w.description.trim() || id === null) return;
    try {
      await api(`/requests/${id}/works`, {
        method: "POST",
        body: JSON.stringify(w),
      });
      setWorks([...works, w]);
      setW({ ...w, description: "" });
    } catch {
      setError("Не вдалося додати роботу");
    }
  }

  const ro = readOnly || !isNew; // client and boiler fields are fixed after creation
  const Txt = (label: string, k: string, o: any = {}) => (
    <div>
      <label>{label}</label>
      <input
        value={f[k]}
        disabled={o.ro ?? readOnly}
        type={o.type ?? "text"}
        onChange={(e) => set(k, e.target.value)}
      />
    </div>
  );
  const Chk = (label: string, k: string) => (
    <label className="ck">
      <input
        type="checkbox"
        checked={f[k]}
        disabled={readOnly}
        onChange={(e) => set(k, e.target.checked)}
      />{" "}
      {label}
    </label>
  );

  return (
    <div className="overlay">
      <div className="form">
        <div className="bar">
          <button onClick={() => onClose(false)}>← Назад</button>
          <button>Згенерувати угоду</button>
          {!readOnly && (
            <button className="primary" onClick={save}>
              Зберегти
            </button>
          )}
        </div>
        <h2>{isNew ? "Нова заявка" : "Заявка №" + id}</h2>
        {!isNew && (
          <p className="muted">
            Створив(ла): {creator || "—"} · {fmt(f.createdAt)}
          </p>
        )}
        {error && <p className="err">{error}</p>}

        {!isNew && (
          <section className="sc">
            <label>Статус</label>
            <select
              value={f.status}
              disabled={readOnly}
              onChange={(e) => set("status", e.target.value)}
            >
              <option value="NEW">Нова</option>
              <option value="IN_PROGRESS">В роботі</option>
              <option value="DONE">Виконано</option>
              <option value="CANCELLED">Скасовано</option>
            </select>
          </section>
        )}

        <section className="sc">
          <h3>Клієнт</h3>
          <div className="g">
            {Txt("ПІБ", "fullName", { ro })}
            {Txt("Телефон", "phone", { ro })}
          </div>
          {Txt("Адреса", "address", { ro })}
        </section>

        <section className="sc">
          <h3>Котел</h3>
          <div className="g">
            <div>
              <label>Марка</label>
              <select
                value={f.brand}
                disabled={ro}
                onChange={(e) => set("brand", e.target.value)}
              >
                <option value="">— обрати —</option>
                {(BRANDS.includes(f.brand) || !f.brand
                  ? BRANDS
                  : [f.brand, ...BRANDS]
                ).map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>
            {Txt("Серійний номер", "serialNumber", { ro })}
            <div>
              <label>Тип</label>
              <select
                value={f.type}
                disabled={ro}
                onChange={(e) => set("type", e.target.value)}
              >
                <option value="TURBO">Турбо</option>
                <option value="CONDENSING">Конденсаційний</option>
                <option value="OTHER">Інше</option>
                <option value="HEATING_PUMP">Тепловий насос</option>
              </select>
            </div>
          </div>
        </section>

        <section className="sc">
          <h3>Гарантія</h3>
          {Chk("Беремо на гарантію як СЦ", "warranty")}
          {Chk("Є книжка", "hasBooklet")}
          {Txt("Дата покупки", "purchaseDate", { type: "date", ro })}
          <label className="ck">
            <input
              type="checkbox"
              checked={f.soldPlaceInBooklet}
              disabled={ro}
              onChange={(e) => set("soldPlaceInBooklet", e.target.checked)}
            />{" "}
            Місце продажу вказане в книжці
          </label>
        </section>

        <section className="sc">
          <h3>Запуск</h3>
          <label>Запуск?</label>
          <select
            value={f.launched ? "1" : ""}
            disabled={readOnly}
            onChange={(e) => set("launched", !!e.target.value)}
          >
            <option value="1">Так</option>
            <option value="">Ні</option>
          </select>
          {f.launched ? (
            Txt("Дата запуску", "launchDate", { type: "date" })
          ) : (
            <div>
              <label>Якщо не запуск</label>
              <select
                value={f.kind}
                disabled={readOnly}
                onChange={(e) => set("kind", e.target.value)}
              >
                <option value="REPAIR">Ремонт</option>
                <option value="SERVICE">ТО</option>
              </select>
            </div>
          )}
        </section>

        <section className="sc">
          <h3>Повідомлення від клієнта</h3>
          <textarea
            rows={3}
            value={f.clientMessage}
            disabled={readOnly}
            onChange={(e) => set("clientMessage", e.target.value)}
          />
        </section>

        {!isNew && (
          <section className="sc">
            <h3>Виконані роботи</h3>
            {works.map((x, i) => (
              <div key={i} className="muted">
                {fmt(x.date)} — {x.description}
              </div>
            ))}
            {!readOnly && (
              <div className="w">
                <input
                  type="date"
                  value={w.date}
                  onChange={(e) => setW({ ...w, date: e.target.value })}
                />
                <input
                  placeholder="Опис"
                  value={w.description}
                  onChange={(e) => setW({ ...w, description: e.target.value })}
                />
                <button onClick={addWork}>+</button>
              </div>
            )}
          </section>
        )}

        <section className="sc">
          <h3>Ціна, грн</h3>
          <input
            type="number"
            value={f.price}
            disabled={readOnly}
            onChange={(e) => {
              setTouched(true);
              set("price", e.target.value);
            }}
          />
        </section>
      </div>
    </div>
  );
}
