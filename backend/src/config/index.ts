import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3000'),
  jwtSecret: process.env.JWT_SECRET || 'fallback-secret',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  platformCommissionRate: parseFloat(process.env.PLATFORM_COMMISSION_RATE || '0.12'),
  premium: {
    featured: parseInt(process.env.PREMIUM_FEATURED_FEE || '999'),
    pro: parseInt(process.env.PREMIUM_PRO_FEE || '499'),
  },
  db: {
    url: process.env.DATABASE_URL || '',
  },
};
