import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import { getDatabaseUrl } from "./config.js";
import * as schema from "./schema.js";

export function createDb(databaseUrl = getDatabaseUrl()) {
  const pool = new Pool({ connectionString: databaseUrl });

  return drizzle(pool, { schema });
}
