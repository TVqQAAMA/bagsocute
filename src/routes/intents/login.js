/* eslint-disable dot-notation */
import Stripe from 'stripe'
import dotenv from 'dotenv'
import bcrypt from 'bcrypt'
import { serialize } from 'cookie'
import { encrypt } from '$lib/functions/crypto.js'

dotenv.config()

const stripe = new Stripe(process.env['STRIPE_SECRET_KEY'])

export async function post ({ request }) {
  const v = await request.json()

  const customer = await stripe.customers.search({
    query: `email:'${v.u}'`
  })

  if (customer.data.length === 1) { // customer exists
    if (bcrypt.compareSync(v.p, customer.data[0].metadata.p)) { // password is correct
      const uuid = encrypt(customer.data[0].id.toString())
      return {
        status: 201,
        headers: {
          'Set-Cookie': serialize('ssUserSession', uuid, {
            path: '/',
            httpOnly: true,
            sameSite: 'strict',
            secure: true,
            maxAge: 60 * 60 * 24 * 7 // one week
          })
        },
        body: {
          response: 'ok'
        }
      }
    } else {
      return {
        body: {
          response: 'wrong password'
        }
      }
      // prevent 3 times
    }
  }
  return {
    body: {
      response: 'not exist'
    }
  }
}
