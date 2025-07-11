import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  decimal,
  boolean,
  date,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Local users table for admin access
export const localUsers = pgTable("local_users", {
  id: serial("id").primaryKey(),
  username: varchar("username").unique().notNull(),
  password: varchar("password").notNull(),
  role: varchar("role").notNull().default("user"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Projects table
export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  identifier: varchar("identifier").notNull().unique(),
  title: text("title").notNull(),
  axis: varchar("axis").notNull(),
  domain: varchar("domain").notNull(),
  region: varchar("region").notNull(),
  province: varchar("province").notNull(),
  commune: varchar("commune").notNull(),
  budget: decimal("budget", { precision: 15, scale: 2 }).notNull(),
  engagements: decimal("engagements", { precision: 15, scale: 2 }).default("0"),
  payments: decimal("payments", { precision: 15, scale: 2 }).default("0"),
  physicalProgress: integer("physical_progress").default(0),
  status: varchar("status").notNull().default("active"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Conventions table
export const conventions = pgTable("conventions", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  dateVisa: date("date_visa"),
  status: varchar("status").notNull(),
  programme: text("programme").notNull(),
  documentUrl: text("document_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Partners table
export const partners = pgTable("partners", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  type: varchar("type").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Project Partners relationship table
export const projectPartners = pgTable("project_partners", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull(),
  partnerId: integer("partner_id").notNull(),
  year: integer("year").notNull(),
  plannedContribution: decimal("planned_contribution", { precision: 15, scale: 2 }).notNull(),
  actualContribution: decimal("actual_contribution", { precision: 15, scale: 2 }).default("0"),
  status: varchar("status").notNull().default("pending"),
});

// Convention Projects relationship table
export const conventionProjects = pgTable("convention_projects", {
  id: serial("id").primaryKey(),
  conventionId: integer("convention_id").notNull(),
  projectId: integer("project_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Financial advances table
export const financialAdvances = pgTable("financial_advances", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull(),
  referenceDate: date("reference_date").notNull(),
  engagement: decimal("engagement", { precision: 15, scale: 2 }).notNull(),
  payment: decimal("payment", { precision: 15, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const projectsRelations = relations(projects, ({ many }) => ({
  partners: many(projectPartners),
  conventions: many(conventionProjects),
  financialAdvances: many(financialAdvances),
}));

export const conventionsRelations = relations(conventions, ({ many }) => ({
  projects: many(conventionProjects),
}));

export const partnersRelations = relations(partners, ({ many }) => ({
  projects: many(projectPartners),
}));

export const projectPartnersRelations = relations(projectPartners, ({ one }) => ({
  project: one(projects, {
    fields: [projectPartners.projectId],
    references: [projects.id],
  }),
  partner: one(partners, {
    fields: [projectPartners.partnerId],
    references: [partners.id],
  }),
}));

export const conventionProjectsRelations = relations(conventionProjects, ({ one }) => ({
  convention: one(conventions, {
    fields: [conventionProjects.conventionId],
    references: [conventions.id],
  }),
  project: one(projects, {
    fields: [conventionProjects.projectId],
    references: [projects.id],
  }),
}));

export const financialAdvancesRelations = relations(financialAdvances, ({ one }) => ({
  project: one(projects, {
    fields: [financialAdvances.projectId],
    references: [projects.id],
  }),
}));

// Insert schemas
export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertConventionSchema = createInsertSchema(conventions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPartnerSchema = createInsertSchema(partners).omit({
  id: true,
  createdAt: true,
});

export const insertProjectPartnerSchema = createInsertSchema(projectPartners).omit({
  id: true,
});

export const insertConventionProjectSchema = createInsertSchema(conventionProjects).omit({
  id: true,
  createdAt: true,
});

export const insertFinancialAdvanceSchema = createInsertSchema(financialAdvances).omit({
  id: true,
  createdAt: true,
});

export const insertLocalUserSchema = createInsertSchema(localUsers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types


export type LocalUser = typeof localUsers.$inferSelect;
export type InsertLocalUser = z.infer<typeof insertLocalUserSchema>;

export type Project = typeof projects.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;

export type Convention = typeof conventions.$inferSelect;
export type InsertConvention = z.infer<typeof insertConventionSchema>;

export type Partner = typeof partners.$inferSelect;
export type InsertPartner = z.infer<typeof insertPartnerSchema>;

export type ProjectPartner = typeof projectPartners.$inferSelect;
export type InsertProjectPartner = z.infer<typeof insertProjectPartnerSchema>;

export type ConventionProject = typeof conventionProjects.$inferSelect;
export type InsertConventionProject = z.infer<typeof insertConventionProjectSchema>;

export type FinancialAdvance = typeof financialAdvances.$inferSelect;
export type InsertFinancialAdvance = z.infer<typeof insertFinancialAdvanceSchema>;
