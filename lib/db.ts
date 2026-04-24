// Only import/initialize Prisma at runtime, not during build
let cachedPrisma: any = null;

export async function getPrisma() {
  if (cachedPrisma) return cachedPrisma;

  // Dynamic import to prevent initialization during build
  const { PrismaClient } = await import('@prisma/client');
  cachedPrisma = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });
  return cachedPrisma;
}

// Sync version for backward compatibility
export const prisma = (() => {
  let instance: any = null;
  return new Proxy(
    {},
    {
      get(target, prop) {
        if (!instance) {
          if (typeof window === 'undefined') {
            // Server-side: lazy initialize
            const { PrismaClient } = require('@prisma/client');
            instance = new PrismaClient({
              log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
            });
          }
        }
        return instance?.[prop];
      },
    }
  );
})() as any;

export default prisma;
