import { cp, readdir, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.dirname(fileURLToPath(import.meta.url)).replace(/[\\/]scripts$/, '');
const buildDir = path.join(projectRoot, 'dist');
const generatedAssetDir = path.join(projectRoot, 'site-assets');
const entries = await readdir(buildDir);

if (!entries.includes('index.html') || !entries.includes('404.html') || !entries.includes('site-assets')) {
  throw new Error('Le build GitHub Pages doit contenir index.html, 404.html et site-assets/. Lancez npm run build avant cette commande.');
}

const expectedAssetDir = path.resolve(projectRoot, 'site-assets');
if (!expectedAssetDir.startsWith(`${path.resolve(projectRoot)}${path.sep}`)) {
  throw new Error('Répertoire de sortie inattendu.');
}

await rm(generatedAssetDir, { recursive: true, force: true });
for (const entry of entries) {
  await cp(path.join(buildDir, entry), path.join(projectRoot, entry), { recursive: true, force: true });
}

console.log(`Site compilé copié à la racine de ${projectRoot} pour GitHub Pages.`);
