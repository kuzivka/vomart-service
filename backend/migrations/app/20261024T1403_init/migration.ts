#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/fe2e565f179f4f7309c9a2ae79dff322ad2d0de1cce07a97e473d0b9932a1eb1/contract';
import endContract from '../../snapshots/fe2e565f179f4f7309c9a2ae79dff322ad2d0de1cce07a97e473d0b9932a1eb1/contract.json' with { type: 'json' };
import {
  Migration,
  MigrationCLI,
  col,
  fn,
  lit,
  primaryKey,
  sql,
} from '@prisma/orm-postgres/migration';

export default class M extends Migration<never, End> {
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createSchema({ schema: 'public' }),
      this.createTable({
        schema: 'public',
        table: 'Boiler',
        columns: [
          col('brand', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('clientId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('modelName', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('purchaseDate', 'timestamptz', { codecRef: { codecId: 'pg/timestamptz-string@1' } }),
          col('serialNumber', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('soldPlaceInBooklet', 'bool', {
            notNull: true,
            default: lit(false),
            codecRef: { codecId: 'pg/bool@1' },
          }),
          col('type', 'text', {
            notNull: true,
            default: lit('TURBO'),
            codecRef: { codecId: 'pg/text@1' },
          }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'Client',
        columns: [
          col('address', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('fullName', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('phone', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'Request',
        columns: [
          col('boilerId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('clientId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('clientMessage', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('createdById', 'int4', { codecRef: { codecId: 'pg/int4@1' } }),
          col('hasBooklet', 'bool', {
            notNull: true,
            default: lit(false),
            codecRef: { codecId: 'pg/bool@1' },
          }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('kind', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('launchDate', 'timestamptz', { codecRef: { codecId: 'pg/timestamptz-string@1' } }),
          col('price', 'int4', {
            notNull: true,
            default: lit(0),
            codecRef: { codecId: 'pg/int4@1' },
          }),
          col('status', 'text', {
            notNull: true,
            default: lit('NEW'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('warranty', 'bool', {
            notNull: true,
            default: lit(false),
            codecRef: { codecId: 'pg/bool@1' },
          }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'Setting',
        columns: [
          col('key', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('value', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [primaryKey(['key'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'User',
        columns: [
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('name', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('passwordHash', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('role', 'text', {
            notNull: true,
            default: lit('MASTER'),
            codecRef: { codecId: 'pg/text@1' },
          }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'Work',
        columns: [
          col('date', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('description', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('requestId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.addUnique({
        schema: 'public',
        table: 'User',
        constraint: 'User_name_key',
        columns: ['name'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Boiler',
        index: 'Boiler_clientId_idx_153a9a49',
        columns: ['clientId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Request',
        index: 'Request_boilerId_idx_e7082f12',
        columns: ['boilerId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Request',
        index: 'Request_clientId_idx_153a9a49',
        columns: ['clientId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Request',
        index: 'Request_createdById_idx_8bf640ed',
        columns: ['createdById'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Work',
        index: 'Work_requestId_idx_fd667f92',
        columns: ['requestId'],
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'Boiler',
        foreignKey: {
          name: 'Boiler_clientId_fkey',
          columns: ['clientId'],
          references: { schema: 'public', table: 'Client', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'Request',
        foreignKey: {
          name: 'Request_clientId_fkey',
          columns: ['clientId'],
          references: { schema: 'public', table: 'Client', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'Request',
        foreignKey: {
          name: 'Request_boilerId_fkey',
          columns: ['boilerId'],
          references: { schema: 'public', table: 'Boiler', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'Request',
        foreignKey: {
          name: 'Request_createdById_fkey',
          columns: ['createdById'],
          references: { schema: 'public', table: 'User', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'Work',
        foreignKey: {
          name: 'Work_requestId_fkey',
          columns: ['requestId'],
          references: { schema: 'public', table: 'Request', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
