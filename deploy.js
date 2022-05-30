/* eslint-disable dot-notation */
/* eslint linebreak-style: ["error", "windows"] */
import { exec } from 'child_process';
import fs from 'fs';

fs.writeFile(
  './docs/.gitignore',
  '*',
  () => {},
);

const cmdBuild = 'call npm run build';
const cmdAdd = 'git add .';
const cmdCommit = 'git commit -m "."';
const cmdPush = 'git push origin main';

exec(`${cmdBuild} && ${cmdAdd} && ${cmdCommit} && ${cmdPush}`, (error, stdout, stderr) => {
  if (error) {
    console.log(`error: ${error.message}`);
    return;
  }
  if (stderr) {
    console.log(`stderr: ${stderr}`);
    return;
  }

  console.log(`Output: ${stdout}`);

  fs.writeFile(
    './docs/.gitignore',
    '',
    () => {},
  );
});
