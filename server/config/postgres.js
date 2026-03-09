import pkg from "pg";
const { Pool } = pkg;
import dotenv from "dotenv";

dotenv.config();

const pool = new Pool({
  user: process.env.PGUSER || process.env.USER,
  host: process.env.PGHOST || process.env.HOST,
  database: process.env.PGDATABASE || process.env.DATABASE,
  password: process.env.PGPASSWORD || process.env.PASSWORD,
  port: Number(process.env.PGPORT || process.env.DBPORT),
});

pool.connect()
  .then(() => console.log("PostgreSQL Connected"))
  .catch((err) => console.error("PostgreSQL connection error:", err.message));

export default pool;
