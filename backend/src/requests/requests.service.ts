import { Injectable, NotFoundException } from "@nestjs/common";
import { db } from "../prisma/db.js";

const day = (v: any) => new Date(v).toISOString().slice(0, 10);
const defaultPrice = (kind: string, type: string) =>
  kind === "LAUNCH" ? (type === "CONDENSING" ? 2000 : 1500) : kind === "REPAIR" ? 1000 : 0;

@Injectable()
export class RequestsService {
  async list(q: Record<string, string>) {
    const [reqs, clients, boilers] = await Promise.all([
      db.orm.public.Request.all(),
      db.orm.public.Client.all(),
      db.orm.public.Boiler.all(),
    ]);
    const has = (v: any, s?: string) => !s || String(v ?? "").toLowerCase().includes(s.toLowerCase());
    return reqs
      .map((r: any) => {
        const c: any = clients.find((x: any) => x.id === r.clientId);
        const b: any = boilers.find((x: any) => x.id === r.boilerId);
        return { ...r, client: c, boiler: b };
      })
      .filter((r: any) =>
        (!q.from || day(r.createdAt) >= q.from) &&
        (!q.to || day(r.createdAt) <= q.to) &&
        has(r.boiler?.serialNumber, q.serial) &&
        has(r.client?.address, q.address) &&
        has(r.client?.fullName, q.name) &&
        has(r.client?.phone, q.phone))
      .sort((a: any, b: any) => b.id - a.id);
  }

  async get(id: number) {
    const r: any = await db.orm.public.Request.where({ id }).first();
    if (!r) throw new NotFoundException();
    const client = await db.orm.public.Client.where({ id: r.clientId }).first();
    const boiler = await db.orm.public.Boiler.where({ id: r.boilerId }).first();
    const works = await db.orm.public.Work.where({ requestId: id }).all();
    return { ...r, client, boiler, works };
  }

  async create(b: any, userId: number) {
    const type = b.type ?? "TURBO";
    const client: any = await db.orm.public.Client.create({
      fullName: b.fullName, phone: b.phone, address: b.address,
    });
    const boiler: any = await db.orm.public.Boiler.create({
      clientId: client.id, brand: b.brand, modelName: b.modelName,
      serialNumber: b.serialNumber ?? null, type,
      soldPlaceInBooklet: !!b.soldPlaceInBooklet,
      purchaseDate: b.purchaseDate ?? null,
    });
    return db.orm.public.Request.create({
      kind: b.kind, clientId: client.id, boilerId: boiler.id,
      warranty: !!b.warranty, hasBooklet: !!b.hasBooklet,
      launchDate: b.launchDate ?? null, clientMessage: b.clientMessage ?? null,
      price: b.price ?? defaultPrice(b.kind, type), createdById: userId,
    });
  }

  async update(id: number, b: any) {
    const allowed = ["status", "kind", "warranty", "hasBooklet", "launchDate", "clientMessage", "price"];
    const patch: any = {};
    for (const k of allowed) if (b[k] !== undefined) patch[k] = b[k];
    return db.orm.public.Request.where({ id }).update(patch);
  }

  addWork(requestId: number, b: { date: string; description: string }) {
    return db.orm.public.Work.create({ requestId, date: b.date, description: b.description });
  }
}
