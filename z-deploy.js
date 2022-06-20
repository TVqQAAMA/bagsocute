/* Script to deploy any code changes. Excludes /docs to use less build time in Netlify */

import { exec } from 'child_process'

const cmdBuild = 'npm run build'
const cmdPull = 'git pull'
const cmdAdd = 'git add .'
const cmdCommit = 'git commit -m "."'
const cmdPush = 'git push origin main'

exec(`${cmdBuild} && ${cmdPull} && ${cmdAdd} && ${cmdCommit} && ${cmdPush}`, (error, stdout, stderr) => {
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
