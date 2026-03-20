export default {
  datasource: {
    url: process.env.DATABASE_URL,
  },
  client: {
    adapter: true, // Use native PostgreSQL driver
  },
};
