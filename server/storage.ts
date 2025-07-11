import {
  localUsers,
  projects,
  conventions,
  partners,
  projectPartners,
  conventionProjects,
  financialAdvances,
  type LocalUser,
  type InsertLocalUser,
  type Project,
  type InsertProject,
  type Convention,
  type InsertConvention,
  type Partner,
  type InsertPartner,
  type ProjectPartner,
  type InsertProjectPartner,
  type ConventionProject,
  type InsertConventionProject,
  type FinancialAdvance,
  type InsertFinancialAdvance,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, asc, like, and } from "drizzle-orm";
import bcrypt from 'bcrypt';

export interface IStorage {
  // Local User operations
  getLocalUser(username: string): Promise<LocalUser | undefined>;
  createLocalUser(user: InsertLocalUser): Promise<LocalUser>;
  validateLocalUser(username: string, password: string): Promise<LocalUser | undefined>;

  // Project operations
  getProjects(search?: string, sortBy?: string, sortOrder?: "asc" | "desc"): Promise<Project[]>;
  getProject(id: number): Promise<Project | undefined>;
  getProjectByIdentifier(identifier: string): Promise<Project | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: number, project: Partial<InsertProject>): Promise<Project>;
  deleteProject(id: number): Promise<void>;

  // Convention operations
  getConventions(): Promise<Convention[]>;
  getConvention(id: number): Promise<Convention | undefined>;
  createConvention(convention: InsertConvention): Promise<Convention>;
  updateConvention(id: number, convention: Partial<InsertConvention>): Promise<Convention>;
  deleteConvention(id: number): Promise<void>;

  // Partner operations
  getPartners(): Promise<Partner[]>;
  getPartner(id: number): Promise<Partner | undefined>;
  createPartner(partner: InsertPartner): Promise<Partner>;
  updatePartner(id: number, partner: Partial<InsertPartner>): Promise<Partner>;

  // Project Partner operations
  getProjectPartners(projectId: number): Promise<(ProjectPartner & { partner: Partner })[]>;
  createProjectPartner(projectPartner: InsertProjectPartner): Promise<ProjectPartner>;
  updateProjectPartner(id: number, projectPartner: Partial<InsertProjectPartner>): Promise<ProjectPartner>;
  deleteProjectPartner(id: number): Promise<void>;

  // Convention Project operations
  getConventionProjects(conventionId: number): Promise<(ConventionProject & { project: Project })[]>;
  getProjectConventions(projectId: number): Promise<(ConventionProject & { convention: Convention })[]>;
  createConventionProject(conventionProject: InsertConventionProject): Promise<ConventionProject>;
  deleteConventionProject(id: number): Promise<void>;

  // Financial Advance operations
  getFinancialAdvances(projectId: number): Promise<FinancialAdvance[]>;
  createFinancialAdvance(financialAdvance: InsertFinancialAdvance): Promise<FinancialAdvance>;
  updateFinancialAdvance(id: number, financialAdvance: Partial<InsertFinancialAdvance>): Promise<FinancialAdvance>;
  deleteFinancialAdvance(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {

  // Project operations
  async getProjects(search?: string, sortBy?: string, sortOrder: "asc" | "desc" = "asc"): Promise<Project[]> {
    let query = db.select().from(projects);
    
    if (search) {
      query = query.where(
        like(projects.title, `%${search}%`)
      ) as any;
    }

    const orderFunc = sortOrder === "desc" ? desc : asc;
    if (sortBy) {
      switch (sortBy) {
        case "identifier":
          return await query.orderBy(orderFunc(projects.identifier));
        case "title":
          return await query.orderBy(orderFunc(projects.title));
        case "axis":
          return await query.orderBy(orderFunc(projects.axis));
        case "domain":
          return await query.orderBy(orderFunc(projects.domain));
        case "budget":
          return await query.orderBy(orderFunc(projects.budget));
        default:
          return await query.orderBy(orderFunc(projects.createdAt));
      }
    } else {
      return await query.orderBy(orderFunc(projects.createdAt));
    }
  }

  async getProject(id: number): Promise<Project | undefined> {
    const [project] = await db.select().from(projects).where(eq(projects.id, id));
    return project;
  }

  async getProjectByIdentifier(identifier: string): Promise<Project | undefined> {
    const [project] = await db.select().from(projects).where(eq(projects.identifier, identifier));
    return project;
  }

  async createProject(project: InsertProject): Promise<Project> {
    const [newProject] = await db
      .insert(projects)
      .values(project)
      .returning();
    return newProject;
  }

  async updateProject(id: number, project: Partial<InsertProject>): Promise<Project> {
    const [updatedProject] = await db
      .update(projects)
      .set({ ...project, updatedAt: new Date() })
      .where(eq(projects.id, id))
      .returning();
    return updatedProject;
  }

  async deleteProject(id: number): Promise<void> {
    await db.delete(projects).where(eq(projects.id, id));
  }

  // Convention operations
  async getConventions(): Promise<Convention[]> {
    return await db.select().from(conventions).orderBy(desc(conventions.createdAt));
  }

  async getConvention(id: number): Promise<Convention | undefined> {
    const [convention] = await db.select().from(conventions).where(eq(conventions.id, id));
    return convention;
  }

  async createConvention(convention: InsertConvention): Promise<Convention> {
    const [newConvention] = await db
      .insert(conventions)
      .values(convention)
      .returning();
    return newConvention;
  }

  async updateConvention(id: number, convention: Partial<InsertConvention>): Promise<Convention> {
    const [updatedConvention] = await db
      .update(conventions)
      .set({ ...convention, updatedAt: new Date() })
      .where(eq(conventions.id, id))
      .returning();
    return updatedConvention;
  }

  async deleteConvention(id: number): Promise<void> {
    await db.delete(conventions).where(eq(conventions.id, id));
  }

  // Partner operations
  async getPartners(): Promise<Partner[]> {
    return await db.select().from(partners).orderBy(asc(partners.name));
  }

  async getPartner(id: number): Promise<Partner | undefined> {
    const [partner] = await db.select().from(partners).where(eq(partners.id, id));
    return partner;
  }

  async createPartner(partner: InsertPartner): Promise<Partner> {
    const [newPartner] = await db
      .insert(partners)
      .values(partner)
      .returning();
    return newPartner;
  }

  async updatePartner(id: number, partner: Partial<InsertPartner>): Promise<Partner> {
    const [updatedPartner] = await db
      .update(partners)
      .set(partner)
      .where(eq(partners.id, id))
      .returning();
    return updatedPartner;
  }

  // Project Partner operations
  async getProjectPartners(projectId: number): Promise<(ProjectPartner & { partner: Partner })[]> {
    return await db
      .select()
      .from(projectPartners)
      .leftJoin(partners, eq(projectPartners.partnerId, partners.id))
      .where(eq(projectPartners.projectId, projectId))
      .then(rows => rows.map(row => ({ ...row.project_partners, partner: row.partners! })));
  }

  async createProjectPartner(projectPartner: InsertProjectPartner): Promise<ProjectPartner> {
    const [newProjectPartner] = await db
      .insert(projectPartners)
      .values(projectPartner)
      .returning();
    return newProjectPartner;
  }

  async updateProjectPartner(id: number, projectPartner: Partial<InsertProjectPartner>): Promise<ProjectPartner> {
    const [updatedProjectPartner] = await db
      .update(projectPartners)
      .set(projectPartner)
      .where(eq(projectPartners.id, id))
      .returning();
    return updatedProjectPartner;
  }

  async deleteProjectPartner(id: number): Promise<void> {
    await db.delete(projectPartners).where(eq(projectPartners.id, id));
  }

  // Convention Project operations
  async getConventionProjects(conventionId: number): Promise<(ConventionProject & { project: Project })[]> {
    return await db
      .select()
      .from(conventionProjects)
      .leftJoin(projects, eq(conventionProjects.projectId, projects.id))
      .where(eq(conventionProjects.conventionId, conventionId))
      .then(rows => rows.map(row => ({ ...row.convention_projects, project: row.projects! })));
  }

  async getProjectConventions(projectId: number): Promise<(ConventionProject & { convention: Convention })[]> {
    return await db
      .select()
      .from(conventionProjects)
      .leftJoin(conventions, eq(conventionProjects.conventionId, conventions.id))
      .where(eq(conventionProjects.projectId, projectId))
      .then(rows => rows.map(row => ({ ...row.convention_projects, convention: row.conventions! })));
  }

  async createConventionProject(conventionProject: InsertConventionProject): Promise<ConventionProject> {
    const [newConventionProject] = await db
      .insert(conventionProjects)
      .values(conventionProject)
      .returning();
    return newConventionProject;
  }

  async deleteConventionProject(id: number): Promise<void> {
    await db.delete(conventionProjects).where(eq(conventionProjects.id, id));
  }

  // Financial Advance operations
  async getFinancialAdvances(projectId: number): Promise<FinancialAdvance[]> {
    return await db
      .select()
      .from(financialAdvances)
      .where(eq(financialAdvances.projectId, projectId))
      .orderBy(desc(financialAdvances.referenceDate));
  }

  async createFinancialAdvance(financialAdvance: InsertFinancialAdvance): Promise<FinancialAdvance> {
    const [newFinancialAdvance] = await db
      .insert(financialAdvances)
      .values(financialAdvance)
      .returning();
    return newFinancialAdvance;
  }

  async updateFinancialAdvance(id: number, financialAdvance: Partial<InsertFinancialAdvance>): Promise<FinancialAdvance> {
    const [updatedFinancialAdvance] = await db
      .update(financialAdvances)
      .set(financialAdvance)
      .where(eq(financialAdvances.id, id))
      .returning();
    return updatedFinancialAdvance;
  }

  async deleteFinancialAdvance(id: number): Promise<void> {
    await db.delete(financialAdvances).where(eq(financialAdvances.id, id));
  }

  // Local User operations
  async getLocalUser(username: string): Promise<LocalUser | undefined> {
    const [user] = await db.select().from(localUsers).where(eq(localUsers.username, username));
    return user;
  }

  async createLocalUser(user: InsertLocalUser): Promise<LocalUser> {
    const hashedPassword = await bcrypt.hash(user.password, 10);
    const [newUser] = await db
      .insert(localUsers)
      .values({ ...user, password: hashedPassword })
      .returning();
    return newUser;
  }

  async validateLocalUser(username: string, password: string): Promise<LocalUser | undefined> {
    const [user] = await db
      .select()
      .from(localUsers)
      .where(eq(localUsers.username, username));
    if (!user) return undefined;
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return undefined;
    return user;
  }
}

export const storage = new DatabaseStorage();
