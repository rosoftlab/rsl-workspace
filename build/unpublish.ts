import * as fs from 'fs';
import { PACKAGES, exec } from './util';
const mainPkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
PACKAGES.forEach((name) => {
  const pkgPath = `${__dirname}/../dist/@rosoftlab/${name}`;

  exec(`cd ${pkgPath} && npm unpublish  @rosoftlab/${name}@${mainPkg.version}`);
});
