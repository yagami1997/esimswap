import esbuild from 'esbuild';
import { copyFileSync, mkdirSync } from 'fs';

const isWatch = process.argv.includes('--watch');

mkdirSync('dist', { recursive: true });
mkdirSync('tests', { recursive: true });

const buildOptions = {
  entryPoints: ['src/app.js'],
  bundle: true,
  outfile: 'dist/app.js',
  target: ['es2020'],
  format: 'iife',
  minify: !isWatch,
  sourcemap: isWatch ? 'inline' : false,
};

if (isWatch) {
  const ctx = await esbuild.context(buildOptions);
  await ctx.watch();
  console.log('Watching for changes...');
} else {
  await esbuild.build(buildOptions);
  console.log('Build complete.');
}

// Copy static assets to dist/
for (const file of ['index.html', 'style.css', 'manifest.json', '_headers']) {
  copyFileSync(file, `dist/${file}`);
}
console.log('Static assets copied.');
