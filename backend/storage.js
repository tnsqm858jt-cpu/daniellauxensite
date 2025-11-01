import fs from 'fs';
import path from 'path';

const dataDir = path.resolve('./backend/data');

function ensureFile(fileName, defaultValue) {
  const filePath = path.join(dataDir, fileName);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(defaultValue, null, 2));
  }
  return filePath;
}

const files = {
  users: ensureFile('users.json', []),
  focos: ensureFile('focos.json', []),
  metas: ensureFile('metas.json', [])
};

export function readData(key) {
  const filePath = files[key];
  const raw = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(raw);
}

export function writeData(key, value) {
  const filePath = files[key];
  fs.writeFileSync(filePath, JSON.stringify(value, null, 2));
}
