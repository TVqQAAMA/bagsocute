/* eslint-disable dot-notation */
/* eslint linebreak-style: ["error", "windows"] */
import Stripe from 'stripe';
import dotenv from 'dotenv';
import { serialize } from 'cookie';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// eslint-disable-next-line import/prefer-default-export
export async function post({ request }) {
  const v = await request.json();

  const checkExists = await stripe.customers.search({
    query: `email:'${v.email}'`,
  });

  if (checkExists.data.length > 0) {
    return {
      body: {
        response: 'Exists',
      },
    };
  }

  const customer = await stripe.customers.create({
    email: v.email,
    name: v.name,
    metadata: {
      p: bcrypt.hashSync(v.p, 10),
      cart: '{"i":[],"total":0}',
    },
  });

  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(process.env['SK']), iv);
  let encrypted = cipher.update(customer.id);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  const uuid = `${iv.toString('hex')}-${encrypted.toString('hex')}`;

  await stripe.customers.update(customer.id, { metadata: { s: uuid } });

  return {
    status: 201,
    headers: {
      'Set-Cookie': serialize('session_id', uuid, {
        path: '/',
        httpOnly: true,
        sameSite: 'strict',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 7, // one week
      }),
    },
    body: {
      response: customer.id,
    },
  };
}
