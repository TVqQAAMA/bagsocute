/* Script to update images.
- Converts all images to webp
- Updates all json files in /docs based on stripe backend, including the new images in /docs/products
- Commits /docs to github, with [skip ci] to avoid Netlify build
*/

import { exec } from 'child_process'
import fs from 'fs'

fs.writeFile(
  './docs/.gitignore',
  '',
  () => {}
)

const cmdWebp = 'node .\\z-convert-webp.js'
const cmdPull = 'git pull'
const cmdUpdateJson = 'node .\\z-update-json.js'
const cmdAdd = 'git add .\\docs'
const cmdCommit = 'git commit -m "[skip ci]"'
const cmdPush = 'git push origin main'

exec(`${cmdWebp} && ${cmdPull} && ${cmdUpdateJson} && ${cmdAdd} && ${cmdCommit} && ${cmdPush}`, (error, stdout, stderr) => {
  if (error) {
    console.log(`error: ${error.message}`)
    return
  }
  if (stderr) {
    console.log(`stderr: ${stderr}`)
    return
  }

  console.log(`Output: ${stdout}`)
})
