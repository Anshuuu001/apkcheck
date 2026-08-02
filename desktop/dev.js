const { spawn } = require('child_process');
const path = require('path');
const { createServer } = require('vite');
const esbuild = require('esbuild');

async function startDev() {
  console.log('Starting development environment...');

  // 1. Compile Main and Preload Scripts (initial build)
  try {
    await esbuild.build({
      entryPoints: [path.join(__dirname, 'src/main/main.ts')],
      outfile: path.join(__dirname, 'dist-electron/main.js'),
      bundle: true,
      platform: 'node',
      target: 'node20',
      external: ['electron', 'better-sqlite3'],
      sourcemap: true,
    });

    await esbuild.build({
      entryPoints: [path.join(__dirname, 'src/main/preload.ts')],
      outfile: path.join(__dirname, 'dist-electron/preload.js'),
      bundle: true,
      platform: 'node',
      target: 'node20',
      external: ['electron'],
      sourcemap: true,
    });
    console.log('⚡ Initial main/preload compilation complete.');
  } catch (err) {
    console.error('❌ Failed to compile main/preload:', err);
    process.exit(1);
  }

  // 2. Start Vite Dev Server
  // Watch is restricted to src/ only — dist-electron, projects/, and *.db files
  // are excluded to prevent Vite HMR from triggering spurious full-page reloads
  // whenever SQLite writes or esbuild outputs change files on disk.
  const viteServer = await createServer({
    configFile: path.join(__dirname, 'vite.config.ts'),
    server: {
      port: 5173,
      host: '127.0.0.1',
      watch: {
        ignored: [
          '**/dist-electron/**',
          '**/dist/**',
          '**/projects/**',
          '**/*.db',
          '**/*.db-journal',
          '**/*.db-shm',
          '**/*.db-wal',
        ],
      },
    },
  });
  await viteServer.listen();
  console.log('🚀 Vite renderer dev server running on http://127.0.0.1:5173');

  // 3. Use esbuild native watch contexts (only recompiles when source files actually change)
  //    Previously this was a setInterval that compiled every 2.5s unconditionally —
  //    that caused Vite to detect dist-electron/*.js writes and force full page reloads.
  const mainCtx = await esbuild.context({
    entryPoints: [path.join(__dirname, 'src/main/main.ts')],
    outfile: path.join(__dirname, 'dist-electron/main.js'),
    bundle: true,
    platform: 'node',
    target: 'node20',
    external: ['electron', 'better-sqlite3'],
    sourcemap: true,
    logLevel: 'warning',
  });

  const preloadCtx = await esbuild.context({
    entryPoints: [path.join(__dirname, 'src/main/preload.ts')],
    outfile: path.join(__dirname, 'dist-electron/preload.js'),
    bundle: true,
    platform: 'node',
    target: 'node20',
    external: ['electron'],
    sourcemap: true,
    logLevel: 'warning',
  });

  await mainCtx.watch();
  await preloadCtx.watch();
  console.log('👁️  Watching src/main/ for changes (esbuild native watch)...');

  // 4. Spawn Electron App
  const electronPath = require('electron');
  const electronProcess = spawn(
    electronPath,
    [path.join(__dirname, 'dist-electron/main.js')],
    {
      stdio: 'inherit',
      env: {
        ...process.env,
        NODE_ENV: 'development',
      },
    }
  );

  electronProcess.on('close', (code) => {
    console.log(`Electron process exited with code ${code}. Shutting down...`);
    mainCtx.dispose();
    preloadCtx.dispose();
    viteServer.close();
    process.exit(code || 0);
  });
}

startDev().catch((err) => {
  console.error('Error starting dev server:', err);
  process.exit(1);
});
