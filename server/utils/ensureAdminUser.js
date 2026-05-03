import User from '../models/User.js';
import { ADMIN_EMAIL, ADMIN_NAME, ADMIN_PASSWORD } from '../config/adminAccount.js';

export const ensureAdminUser = async () => {
  await User.updateMany(
    { email: { $ne: ADMIN_EMAIL }, isAdmin: true },
    { $set: { isAdmin: false } }
  );

  const adminUser = await User.findOne({ email: ADMIN_EMAIL });

  if (adminUser) {
    adminUser.name = ADMIN_NAME;
    adminUser.password = ADMIN_PASSWORD;
    adminUser.isAdmin = true;
    await adminUser.save();
    return;
  }

  await User.create({
    name: ADMIN_NAME,
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    isAdmin: true,
  });

  console.log(`Admin account created: ${ADMIN_EMAIL}`);
};
