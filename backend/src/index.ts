import express from 'express';
import cors from 'cors';
import { config } from './config';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { languageDetect } from './middleware/language';

import authRoutes from './routes/auth';
import professionalRoutes from './routes/professionals';
import categoryRoutes from './routes/categories';
import bookingRoutes from './routes/bookings';
import reviewRoutes from './routes/reviews';
import paymentRoutes from './routes/payments';
import disputeRoutes from './routes/disputes';
import premiumRoutes from './routes/premium';
import waitlistRoutes from './routes/waitlist';
import adminRoutes from './routes/admin';

const app = express();

app.use(cors());
app.use(express.json());
app.use(languageDetect);

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    platform: 'NearSkill',
    version: '1.0.0',
    storage: 'in-memory (Maps + indexed collections)',
    seedData: '10 professionals, 8 categories, demo users loaded',
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/professionals', professionalRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/disputes', disputeRoutes);
app.use('/api/premium', premiumRoutes);
app.use('/api/waitlist', waitlistRoutes);
app.use('/api/admin', adminRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`\n  🏪 NearSkill API running on http://localhost:${config.port}`);
  console.log(`  📋 Health check: http://localhost:${config.port}/api/health`);
  console.log(`  🗄️  Storage: In-memory DSA (Maps, indexed collections, O(1) lookups)`);
  console.log(`  👤 Demo users: Customer (9000000000), Professionals (9111111111-9111111120)`);
  console.log(`  🔑 Password: "password123" for all demo accounts\n`);
});

export default app;
