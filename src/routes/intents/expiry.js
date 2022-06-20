/* eslint-disable dot-notation */
import { decrypt } from '$lib/functions/crypto.js'

export async function post ({ request }) {
  const v = await request.json()
  const decrypted = decrypt(v.session)
  const valid = parseInt(decrypted.split('-')[1], 10) > Date.now()

  return {
    status: 201,
    body: {
      response: valid
    }
  }
}
