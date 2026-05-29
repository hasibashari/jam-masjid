const { Pool } = require('pg');

async function main() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });
  try {
    const res = await pool.query('SELECT * FROM "Settings" LIMIT 1');
    console.log("Settings row in DB:");
    console.log(JSON.stringify(res.rows[0], null, 2));
  } catch (err) {
    console.error("Error querying DB:", err);
  } finally {
    await pool.end();
  }
}

main();
