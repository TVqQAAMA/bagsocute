/* Script to update CSS
*/

import { exec } from 'child_process'

const cmdUpdate = 'npm --prefix .\\bulma\\ run css-build'

exec(`${cmdUpdate}`, (error, stdout, stderr) => {
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
