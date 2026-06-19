import { date, pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

export const scaffoldEvents = pgTable("scaffold_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 120 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull()
});

export const patients = pgTable("patients", {
  id: uuid("id").primaryKey().defaultRandom(),
  fullName: varchar("full_name", { length: 200 }).notNull(),
  dateOfBirth: date("date_of_birth"),
  phone: varchar("phone", { length: 40 }),
  email: varchar("email", { length: 320 }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull()
});


export const doctors = pgTable("doctors", {
  id: uuid("id").primaryKey().defaultRandom(),
  fullName: varchar("full_name", { length: 200 }).notNull(),
  specialty: varchar("specialty", { length: 160 }).notNull(),
  phone: varchar("phone", { length: 40 }),
  email: varchar("email", { length: 320 }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull()
});
