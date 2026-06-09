function buildMongoUri() {
  if (process.env.MONGODB_URI) {
    return process.env.MONGODB_URI;
  }

  const host = process.env.MONGODB_HOST || '127.0.0.1';
  const port = process.env.MONGODB_PORT || '27017';
  const database = process.env.MONGODB_DATABASE || 'freelance-tracker';
  const username = process.env.MONGODB_ADMIN_USERNAME;
  const password = process.env.MONGODB_ADMIN_PASSWORD;
  const authSource = process.env.MONGODB_AUTH_SOURCE || 'admin';

  if (username && password) {
    const encodedUser = encodeURIComponent(username);
    const encodedPass = encodeURIComponent(password);
    return `mongodb://${encodedUser}:${encodedPass}@${host}:${port}/${database}?authSource=${authSource}`;
  }

  return `mongodb://${host}:${port}/${database}`;
}

module.exports = { buildMongoUri };
