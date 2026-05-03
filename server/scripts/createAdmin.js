import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { ensureAdminUser } from '../utils/ensureAdminUser.js';
import { ADMIN_EMAIL, ADMIN_PASSWORD } from '../config/adminAccount.js';

dotenv.config();

try {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ai-fashion-ecommerce');
  await ensureAdminUser();
  console.log('Admin login details:');
  console.log(`Email: ${ADMIN_EMAIL}`);
  console.log(`Password: ${ADMIN_PASSWORD}`);
  await mongoose.disconnect();
  process.exit(0);
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
