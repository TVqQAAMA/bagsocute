/* eslint-disable dot-notation */
/* eslint linebreak-style: ["error", "windows"] */
import Stripe from 'stripe';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

const stripe = new Stripe(process.env['STRIPE_SECRET_KEY']);

// eslint-disable-next-line import/prefer-default-export
export async function post({ request }) {
  const v = await request.json();

  const text = v.session_id;
  const textParts = text.split('-');
  const iv = Buffer.from(textParts.shift(), 'hex');
  const encryptedText = Buffer.from(textParts.join(':'), 'hex');
  const decipher = crypto.createDecipheriv(
    'aes-256-cbc',
    Buffer.from(process.env['SK']),
    iv,
  );

  let custId = decipher.update(encryptedText);
  custId = Buffer.concat([custId, decipher.final()]).toString();

  const l = [];

  const { cart } = v;

  for (let i = 0; i < v.cart.items.length; i += 1) {
    l.push({ price: `price_${cart.items[i].id}`, quantity: cart.items[i].qty });
  }

  const stripeCheckOutSession = await stripe.checkout.sessions.create({
    success_url: 'http://localhost:3000/thanks',
    cancel_url: 'http://localhost:3000/cart',
    line_items: l,
    mode: 'payment',
    customer: custId,
    payment_method_types: ['card'],
    shipping_address_collection: { allowed_countries: ['SG'] },
    phone_number_collection: {
      enabled: true,
    },
  });

  return {
    body: {
      response: stripeCheckOutSession.id,
    },
  };
}
