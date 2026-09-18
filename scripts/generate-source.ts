import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { assetId, backdrop, createProject } from './project.ts';
const root = new URL('../', import.meta.url);
const config = JSON.parse(
  await readFile(new URL('config/app.json', root), 'utf8'),
) as { title: string };
const files = new Map([
  [
    'apps/main/source/project.source.json',
    JSON.stringify(createProject(config.title), null, 2) + '\n',
  ],
  [
    'apps/main/source/embedded-extensions.json',
    JSON.stringify({ formatVersion: 1, extensions: [] }, null, 2) + '\n',
  ],
  [
    'apps/main/source/sb3-source.json',
    JSON.stringify(
      {
        formatVersion: 1,
        project: 'project.source.json',
        embeddedExtensions: 'embedded-extensions.json',
        assetsDirectory: 'assets',
        archiveEntries: ['project.json', `${assetId}.svg`],
      },
      null,
      2,
    ) + '\n',
  ],
  [`apps/main/source/assets/${assetId}.svg`, backdrop],
]);
// The directory is build output, not source: everything in it comes from the
// scripts above. Starting from an empty directory means a file an earlier build
// wrote -- an asset under a hash nothing references any more -- cannot survive
// into the SB3.
await rm(new URL('apps/main/source/', root), { recursive: true, force: true });
for (const [path, contents] of files) {
  const url = new URL(path, root);
  await mkdir(new URL('.', url), { recursive: true });
  await writeFile(url, contents);
}
await mkdir(new URL('apps/main/source/extensions/', root), { recursive: true });
console.log('Generated apps/main/source from the authored project.');
