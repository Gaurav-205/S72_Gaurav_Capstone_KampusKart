const { spawnSync } = require('node:child_process');

function hasLocalHusky() {
  try {
    require.resolve('husky/package.json');
    return true;
  } catch {
    return false;
  }
}

if (!hasLocalHusky()) {
  console.log('Skipping Husky install: local dependency is not available.');
  process.exit(0);
}

const huskyBin = require.resolve('husky/lib/bin.js');
const result = spawnSync(process.execPath, [huskyBin, 'install'], { stdio: 'inherit' });

if (result.error || result.status !== 0) {
  process.exit(result.status ?? 1);
}