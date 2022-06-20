/* eslint-disable dot-notation */
import { decrypt } from '$lib/functions/crypto.js'
import dotenv from 'dotenv'

dotenv.config()

export async function post ({ request }) {
  const v = await request.json()
  const decrypted = decrypt(v.slug)
  if (decrypted) {
    const stripeId = decrypted.split('-')[0]
    const expires = decrypted.split('-')[1]
    if (stripeId === process.env['STRIPE_ID']) {
      if (Date.now() > parseInt(expires, 10)) {
        return {
          status: 201,
          body: {
            response: 'expired'
          }
        }
      } else {
        return {
          status: 201,
          body: {
            response: 'verified'
          }
        }
      }
    } else {
      return {
        status: 201,
        body: {
          response: 'magic link invalid'
        }
      }
    }
  } else {
    return {
      status: 201,
      body: {
        response: 'decryption error'
      }
    }
  }
}
