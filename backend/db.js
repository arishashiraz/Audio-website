import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

pool.on("connect", (client) => {
  console.log("✅ Connected to PostgreSQL");
  client.query("SELECT current_database()", (err, res) => {
    if (!err) {
      console.log("📌 Database name:", res.rows[0].current_database);
    }
  });
});

export default pool;