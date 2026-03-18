# Drone Bee Ltd Company - Honey Production & Sales Management System

## Project Overview
A web-based, real-time management system to track honey production, prevent stock loss, manage sales staff, and give the owner (Super Admin) total visibility over the business at all times.

## Technology Stack
- **Frontend**: Next.js 16 (App Router), React 19, Tailwind CSS 4
- **Backend**: Next.js API Routes (App Router)
- **Database**: PostgreSQL (via Prisma ORM using standard adapter-pg)
- **Authentication**: JWT, bcrypt

## Features Implemented
- **Sales Point Of Sale (POS)**: Real-time inventory deduction with printable receipt capabilities.
- **Role-Based Access Control (RBAC)**: Strict segregation between `SUPERADMIN` and `MANAGER` roles using secure server-side JWT verification.
- **Inventory Management**: Full CRUD interface for adding and restocking honey units, tracking origin/batch sizes.
- **Audit Trails**: Non-deletable operational logs capturing all staff events, IP addresses, and User Agents.
- **Anomaly Detection**: Live-alerting triggers mapping low-stock events and large unexpected restocks/deductions via the Admin Dashboard.
- **Daily Reconciliations**: Automated physical inventory stock counting module to compare POS expectations vs. actual on-site counts.

## Setup Instructions

### Prerequisites
- Node.js >= 20
- PostgreSQL >= 13

### Installation
1. Clone the repository to your local machine.
2. Run `npm install` to install dependencies.
3. Configure your database string:
   Create a `.env` file at the root. Include:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/dronebee?schema=public"
   JWT_SECRET="YOUR_SUPER_SECRET_KEY"
   ```
4. Push your schema to the database:
   ```bash
   npx prisma db push
   ```
   *Note: Using Next-Gen `@prisma/adapter-pg` resolves Next.js App Router caching conflicts.*

5. Seed the database with the initial Super Admin:
   ```bash
   npm run prisma:seed
   ```
   *(Default Admin -> Email: admin@dronebee.com | Password: adminpassword)*

### Running the Project
```bash
npm run dev
```
The application will be accessible at `http://localhost:3000` (or `3001` depending on environment availability).

## Production Build
To make a deployable build:
```bash
npm run build
npm start
```
