/* eslint-disable dot-notation */
import dotenv from 'dotenv'
import crypto from 'crypto'
import Stripe from 'stripe'

dotenv.config()

const stripe = new Stripe(process.env['STRIPE_SECRET_KEY'])

export async function post ({ request }) {
  const text = await request.text()
  const textParts = text.split('-')
  const iv = Buffer.from(textParts.shift(), 'hex')
  const encryptedText = Buffer.from(textParts.join(':'), 'hex')
  const decipher = crypto.createDecipheriv(
    'aes-256-cbc',
    Buffer.from(process.env['SK']),
    iv
  )
  let custId = decipher.update(encryptedText)
  custId = Buffer.concat([custId, decipher.final()])

  const customer = await stripe.customers.retrieve(custId.toString())

  return {
    body: {
      shipping: customer.shipping
    }
  }
}
