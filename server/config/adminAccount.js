export const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || 'admin@aura.com').toLowerCase();
export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
export const ADMIN_NAME = process.env.ADMIN_NAME || 'Aura Admin';

export const isConfiguredAdminEmail = (email = '') => (
  email.toLowerCase() === ADMIN_EMAIL
);
