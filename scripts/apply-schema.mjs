import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import pg from "pg";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error(`
Missing DATABASE_URL.

Option A (easiest): open Supabase SQL Editor and run supabase/schema.sql
  https://supabase.com/dashboard/project/hixxnmvxlrlayckxgzny/sql/new

Option B (terminal): add to .env.local:
  DATABASE_URL=postgresql://postgres:YOUR_DB_PASSWORD@db.hixxnmvxlrlayckxgzny.supabase.co:5432/postgres
Then run:
  npm run db:migrate
`);
  process.exit(1);
}

const sqlPath = path.join(process.cwd(), "supabase", "schema.sql");
const sql = fs.readFileSync(sqlPath, "utf8");
const client = new pg.Client({
  connectionString: databaseUrl,
  ssl: { rejectUnauthorized: false },
});

await client.connect();
try {
  await client.query(sql);
  console.log("Schema applied successfully.");
} finally {
  await client.end();
}
