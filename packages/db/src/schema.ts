import { pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

export const scaffoldEvents = pgTable("scaffold_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 120 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull()
});
