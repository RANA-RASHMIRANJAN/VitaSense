const path = require('path');
const fs = require('fs');

const { Low } = require('lowdb');
const { JSONFile } = require('lowdb/node');

const DB_PATH =
  process.env.AUTH_DB_PATH ||
  path.join(__dirname, '..', 'data', 'auth-db.json');

function ensureDbFile() {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify({ users: [] }, null, 2), 'utf8');
  }
}

async function getDb() {
  ensureDbFile();
  const adapter = new JSONFile(DB_PATH);
  const db = new Low(adapter, { users: [] });
  await db.read();
  db.data ||= { users: [] };
  db.data.users ||= [];
  return db;
}

module.exports = {
  getDb,
  DB_PATH,
};

