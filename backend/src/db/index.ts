import { Pool } from "pg";

// Only use SSL for production databases (e.g., hosted on cloud)
const isProduction = process.env.DATABASE_URL?.includes('amazonaws.com') ||
  process.env.DATABASE_URL?.includes('supabase.co') ||
  process.env.DATABASE_URL?.includes('neon.tech');

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ...(isProduction && {
    ssl: {
      rejectUnauthorized: false,
    },
  }),
});

export async function query<T = any>(
  text: string,
  params?: any[]
): Promise<T[]> {
  const { rows } = await pool.query(text, params);
  return rows;
}
