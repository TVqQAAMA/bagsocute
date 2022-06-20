/* eslint-disable dot-notation */
import { encrypt } from '$lib/functions/crypto.js'
import dotenv from 'dotenv'
import sgMail from '@sendgrid/mail'
import Stripe from 'stripe'

dotenv.config()

let uuid

export async function post ({ request }) {
  const v = await request.json()
  try {
    const accountID = process.env['STRIPE_ID']
    uuid = encrypt(accountID)
    if (accountID.indexOf('sk_test') !== -1) { // live
      const stripe = new Stripe(process.env['STRIPE_SECRET_KEY'])
      const req = await stripe.accounts.retrieve(accountID)
      if (req.email === v.email) {
        sgMail.setApiKey(process.env['SENDGRID'])
        const emailBody = 'http://localhost:3000/admin/' + encrypt(accountID)
        await sgMail.send({
          to: req.email,
          from: 'Bag So Cute! <info@bagsocute.com>',
          subject: 'Your magic link',
          html: emailBody
        })
      }
    } else { // test mode
      console.log(uuid)
    }
  } catch (e) {
    console.log(e)
  }

  return {
    body: {
      response: 'done'
    }
  }
}
