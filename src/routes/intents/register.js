/* eslint-disable dot-notation */
import Stripe from 'stripe'
import dotenv from 'dotenv'
import bcrypt from 'bcrypt'
import crypto from 'crypto'
import { serialize } from 'cookie'
import { encrypt } from '$lib/functions/crypto.js'

dotenv.config()

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

// eslint-disable-next-line import/prefer-default-export
export async function post ({ request }) {
  const v = await request.json()

  const checkExists = await stripe.customers.search({
    query: `email:'${v.email}'`
  })

  if (checkExists.data.length > 0) {
    return {
      body: {
        response: 'Exists'
      }
    }
  }

  const sha1 = crypto.createHash('sha1').update(v.p).digest('hex')
  const sha1FirstFive = sha1.substring(0, 5)
  const sha1Last = sha1.substring(5, sha1.length)
  const haveibeenpwned = await fetch(`https://api.pwnedpasswords.com/range/${sha1FirstFive}`)
  const pwnedHashes = await haveibeenpwned.text()

  if (pwnedHashes.includes(sha1Last.toUpperCase())) {
    return {
      body: {
        response: 'Compromised'
      }
    }
  }

  const customer = await stripe.customers.create({
    email: v.email,
    name: v.name,
    metadata: {
      p: bcrypt.hashSync(v.p, 10)
    }
  })

  return {
    status: 201,
    headers: {
      'Set-Cookie': serialize('ssUserSession', encrypt(customer.id), {
        path: '/',
        httpOnly: true,
        sameSite: 'strict',
        secure: true,
        maxAge: 60 * 60 * 24 * 7 // one week
      })
    },
    body: {
      response: customer.id
    }
  }
}
