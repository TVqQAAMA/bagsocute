/* eslint-disable dot-notation */
/* eslint linebreak-style: ["error", "windows"] */
import { exec } from 'child_process';
import fs from 'fs';

fs.writeFile(
  './docs/.gitignore',
  '',
  () => {},
);

const cmdWebp = 'node .\\convert_webp.js';
const cmdUpdateJson = 'node .\\update_json.js';
const cmdAdd = 'git add .\\docs\\';
const cmdCommit = 'git commit -m "[skip ci]"';
const cmdPush = 'git push origin main';

exec(`${cmdWebp} && ${cmdUpdateJson} && ${cmdAdd} && ${cmdCommit} && ${cmdPush}`, (error, stdout, stderr) => {
  if (error) {
    // console.log(`error: ${error.message}`);
    return;
  }
  if (stderr) {
    // console.log(`stderr: ${stderr}`);
    // return;
  }

  // console.log(`Output: ${stdout}`);
});
