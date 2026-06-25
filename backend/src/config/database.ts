/*
 * =============================================================================
 * DATA LAYER — In-Memory DSA Store
 * =============================================================================
 * Uses Maps, indexed collections, and category-based indexes for O(1) lookups
 * and efficient filtered queries. No database setup required.
 *
 * === PRODUCTION UPGRADE PATH (PostgreSQL + Prisma) ===
 *
 * When you're ready to migrate, follow these steps:
 *
 * 1. Install:   npm install @prisma/client prisma
 * 2. Set DB:    DATABASE_URL="postgresql://user:pass@localhost:5432/nearskill" in .env
 * 3. Uncomment the schema in prisma/schema.prisma
 * 4. Migrate:   npx prisma migrate dev --name init
 * 5. Seed:      npx prisma db seed
 * 6. Replace this file with:
 *
 *    import { PrismaClient } from '@prisma/client';
 *    const prisma = new PrismaClient();
 *    export default prisma;
 *
 * 7. Replace all store.xxx() calls in routes/ with prisma.xxx() equivalents
 *    (see prisma/schema.prisma for the full relational schema)
 * =============================================================================
 */

export { default } from '../store';
