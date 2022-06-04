/* eslint-disable dot-notation */
import Stripe from 'stripe'
import crypto from 'crypto'
import dotenv from 'dotenv'

dotenv.config()

const stripe = new Stripe(process.env['STRIPE_SECRET_KEY'])

export async function post ({ request }) {
  const v = await request.json()

  const text = v.sessionId
  const textParts = text.split('-')
  const iv = Buffer.from(textParts.shift(), 'hex')
  const encryptedText = Buffer.from(textParts.join(':'), 'hex')
  const decipher = crypto.createDecipheriv(
    'aes-256-cbc',
    Buffer.from(process.env['SK']),
    iv
  )

  let custId = decipher.update(encryptedText)
  custId = Buffer.concat([custId, decipher.final()]).toString()

  const lineItems = []

  const { cart } = v

  for (let i = 0; i < v.cart.items.length; i += 1) {
    lineItems.push({ price: `${cart.items[i].price_id}`, quantity: cart.items[i].qty })
  }

  const stripeCheckOutSession = await stripe.checkout.sessions.create({
    success_url: 'https://bagsocute.netlify.app/thanks',
    cancel_url: 'https://bagsocute.netlify.app/cart',
    line_items: lineItems,
    mode: 'payment',
    customer: custId,
    payment_method_types: ['card'],
    shipping_address_collection: { allowed_countries: ['SG'] },
    phone_number_collection: {
      enabled: true
    }
  })

  return {
    body: {
      response: stripeCheckOutSession.id
    }
  }
}
