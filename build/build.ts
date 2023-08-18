import * as fs from 'fs';
import { PACKAGES, exec } from './util';

const mainPkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const distDir = 'dist/@rosoftlab';

// cleanup
fs.rmSync(distDir, { recursive: true, force: true });
fs.mkdirSync(distDir, { recursive: true });

PACKAGES.map((name) => {
  // build package
  exec(
    name === 'schematics'
      ? `ts-node --dir build schematics.ts`
      : `ng build --configuration production @rosoftlab/${name}`,
  );

  const pkgDir = `${distDir}/${name}`;
  fs.copyFile('README.md', `${pkgDir}/README.md`, (err) => {
    if (err) throw err;
  });

  // update `FORMLY-VERSION` in package.json for all sub-packages
  const pkgPath = `${pkgDir}/package.json`;
  const pkgJson = {
    ...JSON.parse(fs.readFileSync(pkgPath, 'utf8')),
    version: mainPkg.version,
    homepage: mainPkg.homepage,
    description: mainPkg.description,
    repository: mainPkg.repository,
    bugs: mainPkg.bugs
  };

  if (pkgJson.peerDependencies && pkgJson.peerDependencies['@rosoftlab/core']) {
    pkgJson.peerDependencies['@rosoftlab/core'] = mainPkg.version;
  }

  if (pkgJson.peerDependencies && pkgJson.peerDependencies['@rosoftlab/formly']) {
    pkgJson.peerDependencies['@rosoftlab/formly'] = mainPkg.version;
  }

  fs.writeFileSync(pkgPath, JSON.stringify(pkgJson, null, 2));
});
