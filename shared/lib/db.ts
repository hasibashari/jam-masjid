import Database from 'better-sqlite3';
import { join } from 'path';

const dbPath = join(process.cwd(), 'sqlite.db');

// Instantiate global connection to avoid opening too many connections in Next.js HMR dev mode
const globalForSqlite = globalThis as unknown as {
  db: Database.Database | undefined;
};

export const db = globalForSqlite.db ?? new Database(dbPath);

if (process.env.NODE_ENV !== 'production') globalForSqlite.db = db;

// Enable SQLite performance optimizations
db.pragma('journal_mode = WAL');
db.pragma('synchronous = NORMAL');
db.pragma('temp_store = MEMORY');
db.pragma('busy_timeout = 5000');

// Initialize tables and seed default settings if they do not exist
db.exec(`
  CREATE TABLE IF NOT EXISTS Announcement (
    id TEXT PRIMARY KEY,
    text TEXT NOT NULL,
    active INTEGER NOT NULL DEFAULT 1,
    createdAt TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS Settings (
    id TEXT PRIMARY KEY,
    mosqueName TEXT NOT NULL DEFAULT 'Jam Masjid',
    mosqueAddress TEXT NOT NULL DEFAULT '',
    latitude REAL NOT NULL DEFAULT 21.4225,
    longitude REAL NOT NULL DEFAULT 39.8262,
    calculationMethod INTEGER NOT NULL DEFAULT 4,
    adzanDuration INTEGER NOT NULL DEFAULT 180,
    iqomahDuration INTEGER NOT NULL DEFAULT 600,
    prayerDuration INTEGER NOT NULL DEFAULT 900,
    displayActive INTEGER NOT NULL DEFAULT 1,
    displayStart TEXT NOT NULL DEFAULT '03:00',
    displayEnd TEXT NOT NULL DEFAULT '23:00',
    backgroundImage TEXT,
    backgroundActive INTEGER NOT NULL DEFAULT 0,
    sandboxActive INTEGER NOT NULL DEFAULT 0,
    sandboxTime TEXT,
    sandboxStage TEXT NOT NULL DEFAULT 'AUTO',
    sandboxSpeed REAL NOT NULL DEFAULT 1.0
  );

  CREATE TABLE IF NOT EXISTS Banner (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    imageUrl TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    active INTEGER NOT NULL DEFAULT 1,
    autoHideAfter INTEGER NOT NULL DEFAULT 10,
    createdAt TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS PrayerTimesCache (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    createdAt TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

// Safe Migration: Add column dynamically for existing SQLite files
try {
  db.exec("ALTER TABLE Settings ADD COLUMN mosqueAddress TEXT NOT NULL DEFAULT ''");
} catch (e) {
  // Column already exists, safe to ignore
}

// Seed default settings row if empty
const countRow = db.prepare("SELECT COUNT(*) as count FROM Settings").get() as { count: number };
if (countRow.count === 0) {
  db.prepare(`
    INSERT INTO Settings (
      id, mosqueName, mosqueAddress, latitude, longitude, calculationMethod, 
      adzanDuration, iqomahDuration, prayerDuration, displayActive, 
      displayStart, displayEnd, backgroundActive, sandboxActive, 
      sandboxTime, sandboxStage, sandboxSpeed
    ) VALUES (
      'default', 'Jam Masjid Al-Hikmah', 'Jl. Jenderal Sudirman No. 1, Jakarta', -6.2088, 106.8456, 20, 
      180, 600, 900, 1, 
      '03:00', '23:00', 0, 0, 
      NULL, 'AUTO', 1.0
    )
  `).run();
}

// Convert row data from SQLite representation to JS types (e.g. converting 1/0 to true/false)
function fromDbRow(row: any) {
  if (!row) return row;
  const copy = { ...row };
  if ('active' in copy) copy.active = Boolean(copy.active);
  if ('displayActive' in copy) copy.displayActive = Boolean(copy.displayActive);
  if ('backgroundActive' in copy) copy.backgroundActive = Boolean(copy.backgroundActive);
  if ('sandboxActive' in copy) copy.sandboxActive = Boolean(copy.sandboxActive);
  return copy;
}

// Convert JS data to SQLite representation (e.g. converting true/false to 1/0)
function toDbData(data: any) {
  const copy = { ...data };
  if ('active' in copy && typeof copy.active === 'boolean') copy.active = copy.active ? 1 : 0;
  if ('displayActive' in copy && typeof copy.displayActive === 'boolean') copy.displayActive = copy.displayActive ? 1 : 0;
  if ('backgroundActive' in copy && typeof copy.backgroundActive === 'boolean') copy.backgroundActive = copy.backgroundActive ? 1 : 0;
  if ('sandboxActive' in copy && typeof copy.sandboxActive === 'boolean') copy.sandboxActive = copy.sandboxActive ? 1 : 0;
  
  // Strip out undefined values to support partial updates correctly without setting them to NULL
  for (const key of Object.keys(copy)) {
    if (copy[key] === undefined) {
      delete copy[key];
    }
  }
  return copy;
}

// Transparent SQLite CRUD Helper Modules replacing the old Prisma mock adapter
export const settingsDb = {
  findFirst: async () => {
    const row = db.prepare("SELECT * FROM Settings LIMIT 1").get();
    return fromDbRow(row);
  },
  create: async ({ data }: { data: any }) => {
    const dbData = toDbData(data);
    const keys = Object.keys(dbData);
    const vals = Object.values(dbData);
    const query = `INSERT INTO Settings (${keys.join(', ')}) VALUES (${keys.map(() => '?').join(', ')})`;
    db.prepare(query).run(...vals);
    const row = db.prepare("SELECT * FROM Settings ORDER BY rowid DESC LIMIT 1").get();
    return fromDbRow(row);
  },
  update: async ({ where, data }: { where: { id: string }, data: any }) => {
    const dbData = toDbData(data);
    const keys = Object.keys(dbData);
    const vals = Object.values(dbData);
    const setClause = keys.map(k => `${k} = ?`).join(', ');
    const query = `UPDATE Settings SET ${setClause} WHERE id = ?`;
    db.prepare(query).run(...vals, where.id);
    const row = db.prepare("SELECT * FROM Settings WHERE id = ?").get(where.id);
    return fromDbRow(row);
  }
};

export const announcementsDb = {
  findMany: async (args?: any) => {
    let query = "SELECT * FROM Announcement";
    const params: any[] = [];
    if (args?.where) {
      const clauses: string[] = [];
      for (const [k, v] of Object.entries(args.where)) {
        if (v !== undefined) {
          clauses.push(`${k} = ?`);
          params.push(typeof v === 'boolean' ? (v ? 1 : 0) : v);
        }
      }
      if (clauses.length > 0) {
        query += ` WHERE ${clauses.join(' AND ')}`;
      }
    }
    if (args?.orderBy) {
      const orderKeys = Object.keys(args.orderBy);
      if (orderKeys.length > 0) {
        query += ` ORDER BY ${orderKeys.map(k => `${k} ${args.orderBy[k].toUpperCase()}`).join(', ')}`;
      }
    }
    const rows = db.prepare(query).all(...params);
    return rows.map(fromDbRow);
  },
  create: async ({ data }: { data: any }) => {
    const dbData = toDbData(data);
    if (!dbData.id) dbData.id = `ann-${Math.random().toString(36).substr(2, 9)}`;
    const keys = Object.keys(dbData);
    const vals = Object.values(dbData);
    const query = `INSERT INTO Announcement (${keys.join(', ')}) VALUES (${keys.map(() => '?').join(', ')})`;
    db.prepare(query).run(...vals);
    const row = db.prepare("SELECT * FROM Announcement WHERE id = ?").get(dbData.id);
    return fromDbRow(row);
  },
  update: async ({ where, data }: { where: { id: string }, data: any }) => {
    const dbData = toDbData(data);
    const keys = Object.keys(dbData);
    const vals = Object.values(dbData);
    const setClause = keys.map(k => `${k} = ?`).join(', ');
    const query = `UPDATE Announcement SET ${setClause} WHERE id = ?`;
    db.prepare(query).run(...vals, where.id);
    const row = db.prepare("SELECT * FROM Announcement WHERE id = ?").get(where.id);
    return fromDbRow(row);
  },
  delete: async ({ where }: { where: { id: string } }) => {
    db.prepare("DELETE FROM Announcement WHERE id = ?").run(where.id);
    return { id: where.id };
  }
};

export const bannersDb = {
  findMany: async (args?: any) => {
    let query = "SELECT * FROM Banner";
    const params: any[] = [];
    if (args?.where) {
      const clauses: string[] = [];
      for (const [k, v] of Object.entries(args.where)) {
        if (v !== undefined) {
          clauses.push(`${k} = ?`);
          params.push(typeof v === 'boolean' ? (v ? 1 : 0) : v);
        }
      }
      if (clauses.length > 0) {
        query += ` WHERE ${clauses.join(' AND ')}`;
      }
    }
    if (args?.orderBy) {
      const orderKeys = Object.keys(args.orderBy);
      if (orderKeys.length > 0) {
        query += ` ORDER BY ${orderKeys.map(k => `${k} ${args.orderBy[k].toUpperCase()}`).join(', ')}`;
      }
    }
    const rows = db.prepare(query).all(...params);
    return rows.map(fromDbRow);
  },
  create: async ({ data }: { data: any }) => {
    const dbData = toDbData(data);
    if (!dbData.id) dbData.id = `ban-${Math.random().toString(36).substr(2, 9)}`;
    const keys = Object.keys(dbData);
    const vals = Object.values(dbData);
    const query = `INSERT INTO Banner (${keys.join(', ')}) VALUES (${keys.map(() => '?').join(', ')})`;
    db.prepare(query).run(...vals);
    const row = db.prepare("SELECT * FROM Banner WHERE id = ?").get(dbData.id);
    return fromDbRow(row);
  },
  update: async ({ where, data }: { where: { id: string }, data: any }) => {
    const dbData = toDbData(data);
    const keys = Object.keys(dbData);
    const vals = Object.values(dbData);
    const setClause = keys.map(k => `${k} = ?`).join(', ');
    const query = `UPDATE Banner SET ${setClause} WHERE id = ?`;
    db.prepare(query).run(...vals, where.id);
    const row = db.prepare("SELECT * FROM Banner WHERE id = ?").get(where.id);
    return fromDbRow(row);
  },
  delete: async ({ where }: { where: { id: string } }) => {
    db.prepare("DELETE FROM Banner WHERE id = ?").run(where.id);
    return { id: where.id };
  }
};
