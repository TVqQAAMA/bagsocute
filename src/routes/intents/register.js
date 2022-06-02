/* eslint-disable dot-notation */
import Stripe from 'stripe'
import dotenv from 'dotenv'
import { serialize } from 'cookie'
import bcrypt from 'bcrypt'
import crypto from 'crypto'

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
  const sha1FirstFive = sha1.substring(0, 4)

  const haveibeenpwned = await fetch(`https://api.pwnedpasswords.com/range/${sha1FirstFive}`)
  const pwnedHashes = await haveibeenpwned.text()

  if (pwnedHashes.indexOf(sha1) !== 1) {
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

  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(process.env['SK']), iv)
  let encrypted = cipher.update(customer.id)
  encrypted = Buffer.concat([encrypted, cipher.final()])
  const uuid = `${iv.toString('hex')}-${encrypted.toString('hex')}`

  await stripe.customers.update(customer.id, { metadata: { s: uuid } })

  return {
    status: 201,
    headers: {
      'Set-Cookie': serialize('sessionId', uuid, {
        path: '/',
        httpOnly: true,
        sameSite: 'strict',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 7 // one week
      })
    },
    body: {
      response: customer.id
    }
  }
}
