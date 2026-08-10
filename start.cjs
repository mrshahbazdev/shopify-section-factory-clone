// CommonJS entry for cPanel / LiteSpeed (Passenger) Node.js selector.
// Passenger loads the startup file with require(), which cannot load the
// ESM server.js directly. Set the "Application startup file" to start.cjs.
const path = require('node:path');
const fs = require('node:fs');
const { pathToFileURL } = require('node:url');

const serverPath = path.resolve(__dirname, 'server.js');

import(pathToFileURL(serverPath).href).catch((err) => {
  const line = `${new Date().toISOString()} start.cjs failed to load server.js\n${err && (err.stack || err)}\n`;
  try {
    fs.appendFileSync(path.resolve(__dirname, 'app-error.log'), line);
  } catch {
    // ignore
  }
  console.error(line);
  process.exit(1);
});
