import esbuild from 'esbuild';
import { copyFileSync, existsSync, mkdirSync } from 'fs';

const isWatch = process.argv.includes('--watch');

mkdirSync('dist', { recursive: true });

const buildOptions = {
  entryPoints: ['src/app.js'],
  bundle: true,
  outfile: 'dist/app.js',
  target: ['es2020'],
  format: 'iife',
  minify: !isWatch,
  sourcemap: isWatch ? 'inline' : false,
};

try {
  if (isWatch) {
    const ctx = await esbuild.context(buildOptions);
    await ctx.watch();
    console.log('Watching for changes... (Ctrl+C to stop)');
    copyStaticAssets(); // copy once at start for dev server
  } else {
    await esbuild.build(buildOptions);
    console.log('Build complete.');
    copyStaticAssets();
  }
} catch (err) {
  console.error('Build failed:', err.message);
  process.exit(1);
}

function copyStaticAssets() {
  const required = ['index.html', 'style.css', 'manifest.json'];
  const optional = ['_headers'];

  for (const file of required) {
    copyFileSync(file, `dist/${file}`);
  }
  for (const file of optional) {
    if (existsSync(file)) {
      copyFileSync(file, `dist/${file}`);
    } else {
      console.warn(`Warning: optional asset "${file}" not found, skipping.`);
    }
  }
  console.log('Static assets copied.');
}
