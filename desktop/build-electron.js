const esbuild = require('esbuild');
const path = require('path');

const isWatch = process.argv.includes('--watch');

async function build() {
  try {
    // 1. Build Main Process Bundle
    await esbuild.build({
      entryPoints: [path.join(__dirname, 'src/main/main.ts')],
      outfile: path.join(__dirname, 'dist-electron/main.js'),
      bundle: true,
      platform: 'node',
      target: 'node20',
      external: ['electron', 'better-sqlite3'],
      sourcemap: true,
      minify: false,
    });
    console.log('⚡ Main process compiled successfully.');

    // 2. Build Preload Script Bundle
    await esbuild.build({
      entryPoints: [path.join(__dirname, 'src/main/preload.ts')],
      outfile: path.join(__dirname, 'dist-electron/preload.js'),
      bundle: true,
      platform: 'node',
      target: 'node20',
      external: ['electron'],
      sourcemap: true,
      minify: false,
    });
    console.log('⚡ Preload script compiled successfully.');
  } catch (err) {
    console.error('❌ Build failed:', err);
    if (!isWatch) {
      process.exit(1);
    }
  }
}

if (isWatch) {
  console.log('Watching main/preload scripts for changes...');
  // Simple periodic build in watch mode for stability
  setInterval(build, 2000);
} else {
  build();
}
