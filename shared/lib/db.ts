import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Enable automatic schema initialization
const initDb = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "Announcement" (
        id TEXT PRIMARY KEY,
        text TEXT NOT NULL,
        active INT NOT NULL DEFAULT 1,
        "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS "Settings" (
        id TEXT PRIMARY KEY,
        "mosqueName" TEXT NOT NULL DEFAULT 'Jam Masjid',
        "mosqueAddress" TEXT NOT NULL DEFAULT '',
        latitude DOUBLE PRECISION NOT NULL DEFAULT 21.4225,
        longitude DOUBLE PRECISION NOT NULL DEFAULT 39.8262,
        "calculationMethod" INT NOT NULL DEFAULT 4,
        "adzanDuration" INT NOT NULL DEFAULT 180,
        "iqomahDuration" INT NOT NULL DEFAULT 600,
        "prayerDuration" INT NOT NULL DEFAULT 900,
        "backgroundImage" TEXT,
        "backgroundActive" INT NOT NULL DEFAULT 0,
        "iqomahFajr" INT NOT NULL DEFAULT 600,
        "iqomahDhuhr" INT NOT NULL DEFAULT 480,
        "iqomahAsr" INT NOT NULL DEFAULT 480,
        "iqomahMaghrib" INT NOT NULL DEFAULT 420,
        "iqomahIsha" INT NOT NULL DEFAULT 600,
        "adzanAudioActive" INT NOT NULL DEFAULT 0,
        "adzanAudioUrl" TEXT NOT NULL DEFAULT 'https://www.islamcan.com/audio/adhan/azan1.mp3',
        "adzanAudioVolume" DOUBLE PRECISION NOT NULL DEFAULT 0.8,
        "adjustImsak" INT NOT NULL DEFAULT 0,
        "adjustFajr" INT NOT NULL DEFAULT 0,
        "adjustSunrise" INT NOT NULL DEFAULT 0,
        "adjustDhuhr" INT NOT NULL DEFAULT 0,
        "adjustAsr" INT NOT NULL DEFAULT 0,
        "adjustMaghrib" INT NOT NULL DEFAULT 0,
        "adjustIsha" INT NOT NULL DEFAULT 0,
        "tahrimAudioActive" INT NOT NULL DEFAULT 0,
        "tahrimAudioUrl" TEXT NOT NULL DEFAULT 'https://archive.org/download/tarhim-subuh/tarhim-subuh.mp3',
        "tahrimDuration" INT NOT NULL DEFAULT 10
      );

      ALTER TABLE "Settings" ADD COLUMN IF NOT EXISTS "adjustImsak" INT NOT NULL DEFAULT 0;
      ALTER TABLE "Settings" ADD COLUMN IF NOT EXISTS "adjustFajr" INT NOT NULL DEFAULT 0;
      ALTER TABLE "Settings" ADD COLUMN IF NOT EXISTS "adjustSunrise" INT NOT NULL DEFAULT 0;
      ALTER TABLE "Settings" ADD COLUMN IF NOT EXISTS "adjustDhuhr" INT NOT NULL DEFAULT 0;
      ALTER TABLE "Settings" ADD COLUMN IF NOT EXISTS "adjustAsr" INT NOT NULL DEFAULT 0;
      ALTER TABLE "Settings" ADD COLUMN IF NOT EXISTS "adjustMaghrib" INT NOT NULL DEFAULT 0;
      ALTER TABLE "Settings" ADD COLUMN IF NOT EXISTS "adjustIsha" INT NOT NULL DEFAULT 0;
      ALTER TABLE "Settings" ADD COLUMN IF NOT EXISTS "tahrimAudioActive" INT NOT NULL DEFAULT 0;
      ALTER TABLE "Settings" ADD COLUMN IF NOT EXISTS "tahrimAudioUrl" TEXT NOT NULL DEFAULT 'https://archive.org/download/tarhim-subuh/tarhim-subuh.mp3';
      ALTER TABLE "Settings" ADD COLUMN IF NOT EXISTS "tahrimDuration" INT NOT NULL DEFAULT 10;

      CREATE TABLE IF NOT EXISTS "Banner" (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        "imageUrl" TEXT NOT NULL,
        description TEXT NOT NULL DEFAULT '',
        active INT NOT NULL DEFAULT 1,
        "autoHideAfter" INT NOT NULL DEFAULT 10,
        "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS "PrayerTimesCache" (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS "User" (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'admin',
        "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS "Quote" (
        id TEXT PRIMARY KEY,
        text TEXT NOT NULL,
        source TEXT NOT NULL,
        active INT NOT NULL DEFAULT 1,
        "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Seed default settings row if empty
    const countRow = await pool.query('SELECT COUNT(*) as count FROM "Settings"');
    if (parseInt(countRow.rows[0].count, 10) === 0) {
      await pool.query(`
        INSERT INTO "Settings" (
          id, "mosqueName", "mosqueAddress", latitude, longitude, "calculationMethod", 
          "adzanDuration", "iqomahDuration", "prayerDuration", "backgroundActive",
          "iqomahFajr", "iqomahDhuhr", "iqomahAsr", "iqomahMaghrib", "iqomahIsha",
          "adzanAudioActive", "adzanAudioUrl", "adzanAudioVolume",
          "adjustImsak", "adjustFajr", "adjustSunrise", "adjustDhuhr", "adjustAsr", "adjustMaghrib", "adjustIsha",
          "tahrimAudioActive", "tahrimAudioUrl", "tahrimDuration"
        ) VALUES (
          'default', 'Jam Masjid Al-Hikmah', 'Jl. Jenderal Sudirman No. 1, Jakarta', -6.2088, 106.8456, 20, 
          180, 600, 900, 0,
          600, 480, 480, 420, 600,
          0, 'https://www.islamcan.com/audio/adhan/azan1.mp3', 0.8,
          0, 0, 0, 0, 0, 0, 0,
          0, 'https://archive.org/download/tarhim-subuh/tarhim-subuh.mp3', 10
        )
      `);
    }

    // Seeds for Quotes removed as requested
  } catch (err) {
    console.error("Failed to initialize database schema", err);
  }
};

// Fire and forget init, so we don't block exports but it will run.
initDb();

// Convert row data from Postgres representation to JS types
function fromDbRow(row: any) {
  if (!row) return row;
  const copy = { ...row };
  if ('active' in copy) copy.active = Boolean(copy.active);
  if ('backgroundActive' in copy) copy.backgroundActive = Boolean(copy.backgroundActive);
  if ('adzanAudioActive' in copy) copy.adzanAudioActive = Boolean(copy.adzanAudioActive);
  if ('tahrimAudioActive' in copy) copy.tahrimAudioActive = Boolean(copy.tahrimAudioActive);
  return copy;
}

// Convert JS data to Postgres representation (e.g. converting true/false to 1/0)
function toDbData(data: any) {
  const copy = { ...data };
  if ('active' in copy && typeof copy.active === 'boolean') copy.active = copy.active ? 1 : 0;
  if ('backgroundActive' in copy && typeof copy.backgroundActive === 'boolean') copy.backgroundActive = copy.backgroundActive ? 1 : 0;
  if ('adzanAudioActive' in copy && typeof copy.adzanAudioActive === 'boolean') copy.adzanAudioActive = copy.adzanAudioActive ? 1 : 0;
  if ('tahrimAudioActive' in copy && typeof copy.tahrimAudioActive === 'boolean') copy.tahrimAudioActive = copy.tahrimAudioActive ? 1 : 0;
  
  // Strip out undefined values to support partial updates correctly
  for (const key of Object.keys(copy)) {
    if (copy[key] === undefined) {
      delete copy[key];
    }
  }
  return copy;
}

export const settingsDb = {
  findFirst: async () => {
    const res = await pool.query('SELECT * FROM "Settings" LIMIT 1');
    return fromDbRow(res.rows[0]);
  },
  create: async ({ data }: { data: any }) => {
    const dbData = toDbData(data);
    const keys = Object.keys(dbData);
    const vals = Object.values(dbData);
    const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
    const query = `INSERT INTO "Settings" (${keys.map(k => `"${k}"`).join(', ')}) VALUES (${placeholders}) RETURNING *`;
    const res = await pool.query(query, vals);
    return fromDbRow(res.rows[0]);
  },
  update: async ({ where, data }: { where: { id: string }, data: any }) => {
    const dbData = toDbData(data);
    const keys = Object.keys(dbData);
    const vals = Object.values(dbData);
    const setClause = keys.map((k, i) => `"${k}" = $${i + 1}`).join(', ');
    const query = `UPDATE "Settings" SET ${setClause} WHERE id = $${keys.length + 1} RETURNING *`;
    const res = await pool.query(query, [...vals, where.id]);
    return fromDbRow(res.rows[0]);
  }
};

export const announcementsDb = {
  findMany: async (args?: any) => {
    let query = 'SELECT * FROM "Announcement"';
    const params: any[] = [];
    if (args?.where) {
      const clauses: string[] = [];
      for (const [k, v] of Object.entries(args.where)) {
        if (v !== undefined) {
          clauses.push(`"${k}" = $${clauses.length + 1}`);
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
        query += ` ORDER BY ${orderKeys.map(k => `"${k}" ${args.orderBy[k].toUpperCase() === 'DESC' ? 'DESC' : 'ASC'}`).join(', ')}`;
      }
    }
    const res = await pool.query(query, params);
    return res.rows.map(fromDbRow);
  },
  create: async ({ data }: { data: any }) => {
    const dbData = toDbData(data);
    if (!dbData.id) dbData.id = `ann-${Math.random().toString(36).substr(2, 9)}`;
    const keys = Object.keys(dbData);
    const vals = Object.values(dbData);
    const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
    const query = `INSERT INTO "Announcement" (${keys.map(k => `"${k}"`).join(', ')}) VALUES (${placeholders}) RETURNING *`;
    const res = await pool.query(query, vals);
    return fromDbRow(res.rows[0]);
  },
  update: async ({ where, data }: { where: { id: string }, data: any }) => {
    const dbData = toDbData(data);
    const keys = Object.keys(dbData);
    const vals = Object.values(dbData);
    const setClause = keys.map((k, i) => `"${k}" = $${i + 1}`).join(', ');
    const query = `UPDATE "Announcement" SET ${setClause} WHERE id = $${keys.length + 1} RETURNING *`;
    const res = await pool.query(query, [...vals, where.id]);
    return fromDbRow(res.rows[0]);
  },
  delete: async ({ where }: { where: { id: string } }) => {
    await pool.query('DELETE FROM "Announcement" WHERE id = $1', [where.id]);
    return { id: where.id };
  }
};

export const bannersDb = {
  findMany: async (args?: any) => {
    let query = 'SELECT * FROM "Banner"';
    const params: any[] = [];
    if (args?.where) {
      const clauses: string[] = [];
      for (const [k, v] of Object.entries(args.where)) {
        if (v !== undefined) {
          clauses.push(`"${k}" = $${clauses.length + 1}`);
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
        query += ` ORDER BY ${orderKeys.map(k => `"${k}" ${args.orderBy[k].toUpperCase() === 'DESC' ? 'DESC' : 'ASC'}`).join(', ')}`;
      }
    }
    const res = await pool.query(query, params);
    return res.rows.map(fromDbRow);
  },
  create: async ({ data }: { data: any }) => {
    const dbData = toDbData(data);
    if (!dbData.id) dbData.id = `ban-${Math.random().toString(36).substr(2, 9)}`;
    const keys = Object.keys(dbData);
    const vals = Object.values(dbData);
    const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
    const query = `INSERT INTO "Banner" (${keys.map(k => `"${k}"`).join(', ')}) VALUES (${placeholders}) RETURNING *`;
    const res = await pool.query(query, vals);
    return fromDbRow(res.rows[0]);
  },
  update: async ({ where, data }: { where: { id: string }, data: any }) => {
    const dbData = toDbData(data);
    const keys = Object.keys(dbData);
    const vals = Object.values(dbData);
    const setClause = keys.map((k, i) => `"${k}" = $${i + 1}`).join(', ');
    const query = `UPDATE "Banner" SET ${setClause} WHERE id = $${keys.length + 1} RETURNING *`;
    const res = await pool.query(query, [...vals, where.id]);
    return fromDbRow(res.rows[0]);
  },
  delete: async ({ where }: { where: { id: string } }) => {
    await pool.query('DELETE FROM "Banner" WHERE id = $1', [where.id]);
    return { id: where.id };
  }
};

export const userDb = {
  findFirst: async () => {
    const res = await pool.query('SELECT * FROM "User" LIMIT 1');
    return res.rows[0];
  },
  findByEmail: async (email: string) => {
    const res = await pool.query('SELECT * FROM "User" WHERE email = $1', [email]);
    return res.rows[0];
  },
  count: async () => {
    const res = await pool.query('SELECT COUNT(*) as count FROM "User"');
    return parseInt(res.rows[0].count, 10);
  },
  create: async ({ data }: { data: any }) => {
    const dbData = { ...data };
    if (!dbData.id) dbData.id = `usr-${Math.random().toString(36).substr(2, 9)}`;
    const keys = Object.keys(dbData);
    const vals = Object.values(dbData);
    const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
    const query = `INSERT INTO "User" (${keys.map(k => `"${k}"`).join(', ')}) VALUES (${placeholders}) RETURNING *`;
    const res = await pool.query(query, vals);
    return res.rows[0];
  }
};

export const quotesDb = {
  findMany: async (args?: any) => {
    let query = 'SELECT * FROM "Quote"';
    const params: any[] = [];
    if (args?.where) {
      const clauses: string[] = [];
      for (const [k, v] of Object.entries(args.where)) {
        if (v !== undefined) {
          clauses.push(`"${k}" = $${clauses.length + 1}`);
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
        query += ` ORDER BY ${orderKeys.map(k => `"${k}" ${args.orderBy[k].toUpperCase() === 'DESC' ? 'DESC' : 'ASC'}`).join(', ')}`;
      }
    }
    const res = await pool.query(query, params);
    return res.rows.map(fromDbRow);
  },
  create: async ({ data }: { data: any }) => {
    const dbData = toDbData(data);
    if (!dbData.id) dbData.id = `qot-${Math.random().toString(36).substr(2, 9)}`;
    const keys = Object.keys(dbData);
    const vals = Object.values(dbData);
    const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
    const query = `INSERT INTO "Quote" (${keys.map(k => `"${k}"`).join(', ')}) VALUES (${placeholders}) RETURNING *`;
    const res = await pool.query(query, vals);
    return fromDbRow(res.rows[0]);
  },
  update: async ({ where, data }: { where: { id: string }, data: any }) => {
    const dbData = toDbData(data);
    const keys = Object.keys(dbData);
    const vals = Object.values(dbData);
    const setClause = keys.map((k, i) => `"${k}" = $${i + 1}`).join(', ');
    const query = `UPDATE "Quote" SET ${setClause} WHERE id = $${keys.length + 1} RETURNING *`;
    const res = await pool.query(query, [...vals, where.id]);
    return fromDbRow(res.rows[0]);
  },
  delete: async ({ where }: { where: { id: string } }) => {
    await pool.query('DELETE FROM "Quote" WHERE id = $1', [where.id]);
    return { id: where.id };
  }
};

export const prayerTimesCacheDb = {
  findFirst: async (key: string) => {
    const res = await pool.query('SELECT * FROM "PrayerTimesCache" WHERE key = $1 LIMIT 1', [key]);
    return res.rows[0];
  },
  upsert: async (key: string, value: string) => {
    const res = await pool.query(
      'INSERT INTO "PrayerTimesCache" (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value RETURNING *',
      [key, value]
    );
    return res.rows[0];
  }
};
