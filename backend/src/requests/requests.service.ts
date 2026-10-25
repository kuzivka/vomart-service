import { Injectable, NotFoundException } from '@nestjs/common';
import { db } from '../prisma/db.js';

const day = (v: any) => new Date(v).toISOString().slice(0, 10);
const defaultPrice = (kind: string, type: string) =>
  kind === 'LAUNCH'
    ? type === 'CONDENSING'
      ? 2000
      : 1500
    : kind === 'REPAIR'
      ? 1000
      : 0;

@Injectable()
export class RequestsService {
  async list(q: Record<string, string>) {
    const digits = (v: any) => String(v ?? '').replace(/\D/g, '');
    const [reqs, clients, boilers, users] = await Promise.all([
      db.orm.public.Request.all(),
      db.orm.public.Client.all(),
      db.orm.public.Boiler.all(),
      db.orm.public.User.all(),
    ]);
    const has = (v: any, s?: string) =>
      !s ||
      String(v ?? '')
        .toLowerCase()
        .includes(s.toLowerCase());
    return reqs
      .map((r: any) => {
        const c: any = clients.find((x: any) => x.id === r.clientId);
        const b: any = boilers.find((x: any) => x.id === r.boilerId);
        const u: any = users.find((x: any) => x.id === r.createdById);
        return { ...r, client: c, boiler: b, creator: u?.name ?? null };
      })
      .filter(
        (r: any) =>
          (!q.from || day(r.createdAt) >= q.from) &&
          (!q.to || day(r.createdAt) <= q.to) &&
          has(r.boiler?.serialNumber, q.serial) &&
          has(r.client?.address, q.address) &&
          has(r.client?.fullName, q.name) &&
          digits(r.client?.phone).includes(digits(q.phone)),
      )
      .sort((a: any, b: any) => b.id - a.id);
  }

  async get(id: number) {
    const r: any = await db.orm.public.Request.where({ id }).first();
    if (!r) throw new NotFoundException();
    const client = await db.orm.public.Client.where({ id: r.clientId }).first();
    const boiler = await db.orm.public.Boiler.where({ id: r.boilerId }).first();
    const works = await db.orm.public.Work.where({ requestId: id }).all();
    const u: any = r.createdById
      ? await db.orm.public.User.where({ id: r.createdById }).first()
      : null;
    return { ...r, client, boiler, works, creator: u?.name ?? null };
  }

  async create(b: any, userId: number) {
    const type = b.type ?? 'TURBO';
    const client: any = await db.orm.public.Client.create({
      fullName: b.fullName,
      phone: b.phone,
      address: b.address,
    });
    const boiler: any = await db.orm.public.Boiler.create({
      clientId: client.id,
      brand: b.brand,
      modelName: b.modelName,
      serialNumber: b.serialNumber ?? null,
      type,
      soldPlaceInBooklet: !!b.soldPlaceInBooklet,
      purchaseDate: b.purchaseDate ?? null,
    });
    return db.orm.public.Request.create({
      kind: b.kind,
      clientId: client.id,
      boilerId: boiler.id,
      warranty: !!b.warranty,
      hasBooklet: !!b.hasBooklet,
      launchDate: b.launchDate ?? null,
      clientMessage: b.clientMessage ?? null,
      price: b.price ?? defaultPrice(b.kind, type),
      createdById: userId,
    });
  }

  async update(id: number, b: any) {
    const r: any = await db.orm.public.Request.where({ id }).first();
    if (!r) throw new NotFoundException();
    const pick = (keys: string[]) => {
      const o: any = {};
      for (const k of keys) if (b[k] !== undefined) o[k] = b[k];
      return o;
    };
    const client = pick(['fullName', 'phone', 'address']);
    const boiler = pick([
      'brand',
      'modelName',
      'serialNumber',
      'type',
      'soldPlaceInBooklet',
      'purchaseDate',
    ]);
    const request = pick([
      'status',
      'kind',
      'warranty',
      'hasBooklet',
      'launchDate',
      'clientMessage',
      'price',
    ]);
    if (Object.keys(client).length)
      await db.orm.public.Client.where({ id: r.clientId }).update(client);
    if (Object.keys(boiler).length)
      await db.orm.public.Boiler.where({ id: r.boilerId }).update(boiler);
    return db.orm.public.Request.where({ id }).update(request);
  }

  addWork(requestId: number, b: { date: string; description: string }) {
    return db.orm.public.Work.create({
      requestId,
      date: b.date,
      description: b.description,
    });
  }
}
