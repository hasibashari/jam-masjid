import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Enable automatic schema initialization
const initDb = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS Announcement (
        id TEXT PRIMARY KEY,
        text TEXT NOT NULL,
        active INT NOT NULL DEFAULT 1,
        createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS Settings (
        id TEXT PRIMARY KEY,
        mosqueName TEXT NOT NULL DEFAULT 'Jam Masjid',
        mosqueAddress TEXT NOT NULL DEFAULT '',
        latitude DOUBLE PRECISION NOT NULL DEFAULT 21.4225,
        longitude DOUBLE PRECISION NOT NULL DEFAULT 39.8262,
        calculationMethod INT NOT NULL DEFAULT 4,
        adzanDuration INT NOT NULL DEFAULT 180,
        iqomahDuration INT NOT NULL DEFAULT 600,
        prayerDuration INT NOT NULL DEFAULT 900,
        displayActive INT NOT NULL DEFAULT 1,
        displayStart TEXT NOT NULL DEFAULT '03:00',
        displayEnd TEXT NOT NULL DEFAULT '23:00',
        backgroundImage TEXT,
        backgroundActive INT NOT NULL DEFAULT 0,
        sandboxActive INT NOT NULL DEFAULT 0,
        sandboxTime TEXT,
        sandboxStage TEXT NOT NULL DEFAULT 'AUTO',
        sandboxSpeed DOUBLE PRECISION NOT NULL DEFAULT 1.0,
        iqomahFajr INT NOT NULL DEFAULT 600,
        iqomahDhuhr INT NOT NULL DEFAULT 480,
        iqomahAsr INT NOT NULL DEFAULT 480,
        iqomahMaghrib INT NOT NULL DEFAULT 420,
        iqomahIsha INT NOT NULL DEFAULT 600,
        adzanAudioActive INT NOT NULL DEFAULT 1,
        adzanAudioUrl TEXT NOT NULL DEFAULT 'https://www.islamcan.com/audio/adhan/azan1.mp3',
        adzanAudioVolume DOUBLE PRECISION NOT NULL DEFAULT 0.8
      );

      CREATE TABLE IF NOT EXISTS Banner (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        imageUrl TEXT NOT NULL,
        description TEXT NOT NULL DEFAULT '',
        active INT NOT NULL DEFAULT 1,
        autoHideAfter INT NOT NULL DEFAULT 10,
        createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS PrayerTimesCache (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS "User" (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'admin',
        createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS Quote (
        id TEXT PRIMARY KEY,
        text TEXT NOT NULL,
        source TEXT NOT NULL,
        active INT NOT NULL DEFAULT 1,
        createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Seed default settings row if empty
    const countRow = await pool.query("SELECT COUNT(*) as count FROM Settings");
    if (parseInt(countRow.rows[0].count, 10) === 0) {
      await pool.query(`
        INSERT INTO Settings (
          id, mosqueName, mosqueAddress, latitude, longitude, calculationMethod, 
          adzanDuration, iqomahDuration, prayerDuration, displayActive, 
          displayStart, displayEnd, backgroundActive, sandboxActive, 
          sandboxTime, sandboxStage, sandboxSpeed,
          iqomahFajr, iqomahDhuhr, iqomahAsr, iqomahMaghrib, iqomahIsha,
          adzanAudioActive, adzanAudioUrl, adzanAudioVolume
        ) VALUES (
          'default', 'Jam Masjid Al-Hikmah', 'Jl. Jenderal Sudirman No. 1, Jakarta', -6.2088, 106.8456, 20, 
          180, 600, 900, 1, 
          '03:00', '23:00', 0, 0, 
          NULL, 'AUTO', 1.0,
          600, 480, 480, 420, 600,
          1, 'https://www.islamcan.com/audio/adhan/azan1.mp3', 0.8
        )
      `);
    }

    // Seed default quotes if empty
    const countQuotes = await pool.query("SELECT COUNT(*) as count FROM Quote");
    if (parseInt(countQuotes.rows[0].count, 10) === 0) {
      const defaultQuotes = [
        { text: "Sesungguhnya shalat itu mencegah dari (perbuatan) keji dan mungkar.", source: "QS. Al-Ankabut: 45" },
        { text: "Shalat berjamaah lebih utama daripada shalat sendirian sebanyak dua puluh tujuh derajat.", source: "HR. Bukhari & Muslim" },
        { text: "Jadikanlah sabar dan shalat sebagai penolongmu. Sesungguhnya yang demikian itu sungguh berat, kecuali bagi orang-orang yang khusyu'.", source: "QS. Al-Baqarah: 45" },
        { text: "Siapa yang membangun masjid karena Allah, maka Allah akan membangunkan baginya rumah di surga.", source: "HR. Bukhari & Muslim" },
        { text: "Amalan yang paling dicintai oleh Allah adalah shalat pada waktunya.", source: "HR. Bukhari & Muslim" },
        { text: "Dekatnya seorang hamba dengan Tuhannya adalah ketika dia sedang sujud, maka perbanyaklah doa.", source: "HR. Muslim" },
        { text: "Apabila salah seorang di antara kalian masuk masjid, maka kerjakanlah shalat dua rakaat sebelum ia duduk.", source: "HR. Bukhari & Muslim" },
        { text: "Terangilah rumah-rumah kalian dengan shalat dan pembacaan Al-Qur'an.", source: "HR. Al-Baihaqi" }
      ];

      for (let i = 0; i < defaultQuotes.length; i++) {
        const q = defaultQuotes[i];
        await pool.query("INSERT INTO Quote (id, text, source, active) VALUES ($1, $2, $3, 1)", [
          `quote-${i + 1}`, q.text, q.source
        ]);
      }
    }
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
  if ('displayActive' in copy) copy.displayActive = Boolean(copy.displayActive);
  if ('backgroundActive' in copy) copy.backgroundActive = Boolean(copy.backgroundActive);
  if ('sandboxActive' in copy) copy.sandboxActive = Boolean(copy.sandboxActive);
  if ('adzanAudioActive' in copy) copy.adzanAudioActive = Boolean(copy.adzanAudioActive);
  return copy;
}

// Convert JS data to Postgres representation (e.g. converting true/false to 1/0)
function toDbData(data: any) {
  const copy = { ...data };
  if ('active' in copy && typeof copy.active === 'boolean') copy.active = copy.active ? 1 : 0;
  if ('displayActive' in copy && typeof copy.displayActive === 'boolean') copy.displayActive = copy.displayActive ? 1 : 0;
  if ('backgroundActive' in copy && typeof copy.backgroundActive === 'boolean') copy.backgroundActive = copy.backgroundActive ? 1 : 0;
  if ('sandboxActive' in copy && typeof copy.sandboxActive === 'boolean') copy.sandboxActive = copy.sandboxActive ? 1 : 0;
  if ('adzanAudioActive' in copy && typeof copy.adzanAudioActive === 'boolean') copy.adzanAudioActive = copy.adzanAudioActive ? 1 : 0;
  
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
    const res = await pool.query("SELECT * FROM Settings LIMIT 1");
    return fromDbRow(res.rows[0]);
  },
  create: async ({ data }: { data: any }) => {
    const dbData = toDbData(data);
    const keys = Object.keys(dbData);
    const vals = Object.values(dbData);
    const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
    const query = `INSERT INTO Settings (${keys.join(', ')}) VALUES (${placeholders}) RETURNING *`;
    const res = await pool.query(query, vals);
    return fromDbRow(res.rows[0]);
  },
  update: async ({ where, data }: { where: { id: string }, data: any }) => {
    const dbData = toDbData(data);
    const keys = Object.keys(dbData);
    const vals = Object.values(dbData);
    const setClause = keys.map((k, i) => `"${k}" = $${i + 1}`).join(', ');
    const query = `UPDATE Settings SET ${setClause} WHERE id = $${keys.length + 1} RETURNING *`;
    const res = await pool.query(query, [...vals, where.id]);
    return fromDbRow(res.rows[0]);
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
    const query = `INSERT INTO Announcement (${keys.join(', ')}) VALUES (${placeholders}) RETURNING *`;
    const res = await pool.query(query, vals);
    return fromDbRow(res.rows[0]);
  },
  update: async ({ where, data }: { where: { id: string }, data: any }) => {
    const dbData = toDbData(data);
    const keys = Object.keys(dbData);
    const vals = Object.values(dbData);
    const setClause = keys.map((k, i) => `"${k}" = $${i + 1}`).join(', ');
    const query = `UPDATE Announcement SET ${setClause} WHERE id = $${keys.length + 1} RETURNING *`;
    const res = await pool.query(query, [...vals, where.id]);
    return fromDbRow(res.rows[0]);
  },
  delete: async ({ where }: { where: { id: string } }) => {
    await pool.query("DELETE FROM Announcement WHERE id = $1", [where.id]);
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
    const query = `INSERT INTO Banner (${keys.join(', ')}) VALUES (${placeholders}) RETURNING *`;
    const res = await pool.query(query, vals);
    return fromDbRow(res.rows[0]);
  },
  update: async ({ where, data }: { where: { id: string }, data: any }) => {
    const dbData = toDbData(data);
    const keys = Object.keys(dbData);
    const vals = Object.values(dbData);
    const setClause = keys.map((k, i) => `"${k}" = $${i + 1}`).join(', ');
    const query = `UPDATE Banner SET ${setClause} WHERE id = $${keys.length + 1} RETURNING *`;
    const res = await pool.query(query, [...vals, where.id]);
    return fromDbRow(res.rows[0]);
  },
  delete: async ({ where }: { where: { id: string } }) => {
    await pool.query("DELETE FROM Banner WHERE id = $1", [where.id]);
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
    let query = "SELECT * FROM Quote";
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
    const query = `INSERT INTO Quote (${keys.join(', ')}) VALUES (${placeholders}) RETURNING *`;
    const res = await pool.query(query, vals);
    return fromDbRow(res.rows[0]);
  },
  update: async ({ where, data }: { where: { id: string }, data: any }) => {
    const dbData = toDbData(data);
    const keys = Object.keys(dbData);
    const vals = Object.values(dbData);
    const setClause = keys.map((k, i) => `"${k}" = $${i + 1}`).join(', ');
    const query = `UPDATE Quote SET ${setClause} WHERE id = $${keys.length + 1} RETURNING *`;
    const res = await pool.query(query, [...vals, where.id]);
    return fromDbRow(res.rows[0]);
  },
  delete: async ({ where }: { where: { id: string } }) => {
    await pool.query("DELETE FROM Quote WHERE id = $1", [where.id]);
    return { id: where.id };
  }
};

export const prayerTimesCacheDb = {
  findFirst: async (key: string) => {
    const res = await pool.query("SELECT * FROM PrayerTimesCache WHERE key = $1 LIMIT 1", [key]);
    return res.rows[0];
  },
  upsert: async (key: string, value: string) => {
    const res = await pool.query(
      "INSERT INTO PrayerTimesCache (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value RETURNING *",
      [key, value]
    );
    return res.rows[0];
  }
};
