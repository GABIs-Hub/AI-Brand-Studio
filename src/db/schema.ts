import { pgTable, varchar, timestamp, jsonb, index } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: varchar("id", { length: 255 }).primaryKey(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 255 }).unique().notNull(),
  passwordHash: varchar("password_hash", { length: 255 }),
});

export const brands = pgTable("brands", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  data: jsonb("data").notNull(),
  brandName: varchar("brand_name", { length: 255 }),
  industry: varchar("industry", { length: 255 }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
}, (table) => {
  return [
    index("idx_brands_user_id").on(table.userId),
    index("idx_brands_created_at").on(table.createdAt),
  ];
});
