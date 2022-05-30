/* eslint-disable dot-notation */
/* eslint linebreak-style: ["error", "windows"] */
import fs from 'fs';
import { exec } from 'child_process';

async function convertWebp(path) {
  fs.readdir(path, { withFileTypes: true }, (err, items) => {
    items.forEach((file) => {
      if (file.isDirectory()) {
        convertWebp(`${path}/${file.name}`);
      } else {
        const ext = file.name.split('.')[1];

        if (ext === 'jpg' || ext === '.png') {
          const base = file.name.split('.')[0];
          exec(
            `.\\cwebp.exe ${path}/${file.name} -q 75 -o ${path}/${base}.webp`,
            (error, stdout, stderr) => {
              if (error) {
                // console.log(`error: ${error.message}`);
                return;
              }
              if (stderr) {
                // console.log(`stderr: ${stderr}`);
                // return;
              }
              // console.log(`Output: ${stdout}`);
            },
          );
        }
      }
    });
  });
}

convertWebp('./docs/products');
