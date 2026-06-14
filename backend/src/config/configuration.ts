export default () => ({
  port: parseInt(process.env.PORT || '3001', 10),
  database: {
    url: process.env.DATABASE_URL,
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'gooli-secret-key-2026',
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  },
  frontend: {
    url: process.env.FRONTEND_URL || 'http://localhost:3000',
    revalidateSecret:
      process.env.REVALIDATE_SECRET || 'gooli-revalidate-secret',
  },
});
