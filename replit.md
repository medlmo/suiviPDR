# Replit Project Guide

## Overview

This is a full-stack TypeScript application for tracking regional development programs (PDR) for the Ministry of Agriculture in Morocco. The system manages projects, conventions, partners, and financial advances with a modern web interface.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Build Tool**: Vite for development and build process
- **Styling**: Tailwind CSS with shadcn/ui component library
- **State Management**: TanStack Query (React Query) for server state
- **Routing**: Wouter for client-side routing
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Replit's OpenID Connect authentication system
- **Session Management**: Express sessions with PostgreSQL storage
- **API Pattern**: RESTful APIs with JSON responses

## Key Components

### Database Schema
The application uses a PostgreSQL database with the following main entities:
- **Users**: User profiles from Replit authentication
- **Projects**: Regional development projects with budgets and locations
- **Conventions**: Legal agreements with status tracking
- **Partners**: Organizations involved in projects
- **Financial Advances**: Budget disbursements and tracking
- **Sessions**: User session storage for authentication

### Authentication System
- Uses Replit's built-in OpenID Connect authentication
- Sessions stored in PostgreSQL for persistence
- Protected routes require authentication middleware
- Automatic user profile management

### UI Components
- Built with shadcn/ui component library
- Responsive design with mobile support
- Modal dialogs for data entry and details
- Tables with sorting and filtering
- Toast notifications for user feedback

### Data Management
- Drizzle ORM for type-safe database operations
- Zod schemas for input validation
- TanStack Query for caching and synchronization
- Optimistic updates for better user experience

## Data Flow

1. **User Authentication**: Users log in through Replit's OAuth system
2. **Data Fetching**: React Query manages API calls and caching
3. **Form Submission**: React Hook Form handles validation before API calls
4. **Database Operations**: Drizzle ORM executes type-safe queries
5. **Real-time Updates**: Query invalidation keeps data synchronized

## External Dependencies

### Database
- **Neon Database**: Serverless PostgreSQL database
- **Connection**: Uses connection pooling with @neondatabase/serverless

### Authentication
- **Replit Auth**: OpenID Connect integration
- **Session Storage**: PostgreSQL-based session management

### UI Framework
- **Radix UI**: Accessible component primitives
- **Tailwind CSS**: Utility-first styling
- **Lucide React**: Icon library

## Deployment Strategy

### Development
- **Local Development**: Uses Vite dev server with hot module replacement
- **Database Migrations**: Drizzle Kit for schema management
- **Environment Variables**: DATABASE_URL, SESSION_SECRET, REPLIT_DOMAINS

### Production
- **Build Process**: Vite builds frontend, esbuild bundles backend
- **Server**: Express.js serves both API and static files
- **Database**: Neon serverless PostgreSQL
- **Authentication**: Replit's production OAuth endpoints

### Key Scripts
- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run start`: Start production server
- `npm run db:push`: Push database schema changes

### Environment Setup
The application requires these environment variables:
- `DATABASE_URL`: PostgreSQL connection string
- `SESSION_SECRET`: Secret for session encryption
- `REPLIT_DOMAINS`: Allowed domains for authentication
- `ISSUER_URL`: OAuth issuer URL (defaults to Replit)

The project is structured as a monorepo with shared types and schemas, making it easy to maintain type safety across frontend and backend while keeping the codebase organized and scalable.

## Recent Changes: Latest modifications with dates

### 2025-07-11: Migration and Role-Based Access Control Implementation
- **Migration completed**: Successfully migrated from Replit Agent to Replit environment
- **Database setup**: Created PostgreSQL database and applied schema migrations
- **Role-based permissions**: Implemented three user roles with specific permissions:
  - **Admin**: Full access to projects, conventions, and user management
  - **User**: Can create, read, update, and delete projects and conventions
  - **Superviseur**: Read-only access to projects and conventions
- **Authentication system**: Enhanced with role-based authorization middleware
- **User interface**: Updated to show/hide actions based on user permissions
- **User management**: Added complete user management interface for admins
- **Test users created**: admin/admin123, user1/admin123, superviseur1/admin123

### 2025-07-14: CRUD Operations and Frontend Fixes
- **User management**: Fixed user deletion with proper cache invalidation
- **Project creation**: Corrected project form with all required fields (region, province, commune)
- **Convention creation**: Fixed API integration issues with proper request signatures
- **Delete functionality**: Added convention deletion feature with confirmation dialog
- **Form validation**: Enhanced form schemas to match database requirements
- **Error handling**: Improved error messages and logging for better debugging
- **API consistency**: Standardized all API calls to use the correct apiRequest signature
- **File upload**: Added PDF upload functionality for conventions with multer middleware
- **File serving**: Implemented secure file serving with authentication