import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const sourceDirectory = path.resolve('assets/source');
const outputDirectory = path.resolve('public/images');

async function pngFiles(directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await pngFiles(entryPath));
    else if (entry.isFile() && entry.name.toLowerCase().endsWith('.png')) files.push(entryPath);
  }
  return files;
}

for (const sourcePath of await pngFiles(sourceDirectory)) {
  const relative = path.relative(sourceDirectory, sourcePath);
  const outputPath = path.join(outputDirectory, relative.replace(/\.png$/i, '.webp'));
  const cardPath = outputPath.replace(/\.webp$/i, '-card.webp');
  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  const base = sharp(sourcePath).rotate();
  await base.clone().resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true }).webp({ quality: 84, effort: 6 }).toFile(outputPath);
  await base.clone().resize({ width: 720, height: 720, fit: 'inside', withoutEnlargement: true }).webp({ quality: 82, effort: 6 }).toFile(cardPath);
  const [{ size: imageSize }, { size: cardSize }] = await Promise.all([fs.stat(outputPath), fs.stat(cardPath)]);
  process.stdout.write(`${path.relative(outputDirectory, outputPath).replaceAll('\\', '/')} ${Math.round(imageSize / 1024)} KB; card ${Math.round(cardSize / 1024)} KB\n`);
}
