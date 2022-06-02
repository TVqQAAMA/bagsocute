/* eslint-disable dot-notation */
import Stripe from 'stripe'
import dotenv from 'dotenv'
import bcrypt from 'bcrypt'
import crypto from 'crypto'
import { serialize } from 'cookie'

dotenv.config()

const stripe = new Stripe(process.env['STRIPE_SECRET_KEY'])

export async function post ({ request }) {
  const v = await request.json()

  const customer = await stripe.customers.search({
    query: `email:'${v.u}'`

  })

  if (customer.data.length === 1) {
    if (bcrypt.compareSync(v.p, customer.data[0].metadata.p)) {
      const iv = crypto.randomBytes(16)
      const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(process.env['SK']), iv)
      let encrypted = cipher.update(customer.data[0].id.toString())
      encrypted = Buffer.concat([encrypted, cipher.final()])
      const uuid = `${iv.toString('hex')}-${encrypted.toString('hex')}`

      await stripe.customers.update(customer.data[0].id, {
        metadata: { s: uuid }
      })

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
          res: 'ok'
        }
      }
    }
    return {
      body: {
        res: 'wrong password'
      }
    }
    // prevent 3 times
  }
  return {
    body: {
      res: 'not exist'
    }
  }
}
