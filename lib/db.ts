import { Pool } from "pg";

// Global connection pool to PostgreSQL (katamereka_db)
const globalForPg = global as unknown as { pgPool?: Pool };

export const pool =
  globalForPg.pgPool ||
  new Pool({
    host: process.env.DATABASE_HOST || "43.133.133.58",
    port: parseInt(process.env.DATABASE_PORT || "5432", 10),
    user: process.env.DATABASE_USER || "postgres",
    password: process.env.DATABASE_PASSWORD || "bismillah_transgo_emas",
    database: process.env.DATABASE_NAME || "katamereka_db",
    max: 10,
    idleTimeoutMillis: 30000,
  });

if (process.env.NODE_ENV !== "production") {
  globalForPg.pgPool = pool;
}
