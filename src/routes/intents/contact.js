/* eslint-disable dot-notation */
import dotenv from 'dotenv'
import sgMail from '@sendgrid/mail'

dotenv.config()

export async function post ({ request }) {
  const v = await request.json()
  const comment = v.comment

  sgMail.setApiKey(process.env['SENDGRID'])

  const msg = {
    to: 'jaredyeo@gmail.com',
    from: 'Bag So Cute! <info@bagsocute.com>',
    subject: `Bag So Cute! Message from ${v.name}`,
    html: comment,
    reply_to: v.email
  }

  await sgMail.send(msg)

  return {
    body: {
      response: 'ok'
    }
  }
}
