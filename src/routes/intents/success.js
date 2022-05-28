/* eslint-disable dot-notation */
/* eslint linebreak-style: ["error", "windows"] */
import dotenv from 'dotenv';
import Stripe from 'stripe';

dotenv.config();

const stripe = new Stripe(process.env['STRIPE_SECRET_KEY']);

// eslint-disable-next-line import/prefer-default-export
export async function post({ request }) {
  // const v = await request.json();
  // const checkoutSession = v.data.object.id;

  const checkoutSession = 'cs_test_b1yFcKSWk8hHuGPuN2NIVXPNbvKWaazy8LYMU0UnGuB0EO1mnSU90AwneA';

  let res;

  res = await stripe.checkout.sessions.listLineItems(
    checkoutSession,
    { limit: 100 },
  );

  const lineItems = res.data;

  let cart = [];
  for (let i = 0; i < res.data.length; i += 1) {
    cart.push(stripe.products.retrieve(res.data[i].price.product));
  }

  cart = await Promise.all(cart);

  // now subtract cart qty from products

  console.log(lineItems)
  console.log(cart)

  /* console.dir(v.data.object.customer_details);
  console.dir(v.data.object.payment_intent);
  console.dir(v.data.object.shipping);
  console.dir(cart); */

  // get the exist db

  

  // products['spiderman-hard-shell-bag'].qty = 9;

  /* for (let i = 0; i < cart.items.length; i += 1) {
    const currentQty = parseInt(products[cart.items[i].handle].qty, 10);
    const newQty = currentQty - parseInt(cart.items[i].qty, 10);
    products[cart.items[i].handle].qty = newQty;
  } */

  /* req = await fetch(
    'https://api.github.com/repos/TVqQAAMA/bagsocute/contents/products.json',
    {
      method: 'GET',
      headers: {
        Authorization: 'token ' + process.env['GIT'],
      },
    }
  );

  response = await req.json();

  const dbSha = response.sha;
  const buff = Buffer.from(JSON.stringify(products), 'utf-8');
  const payload = buff.toString('base64');

  req = await fetch(
    'https://api.github.com/repos/TVqQAAMA/bagsocute/contents/products.json',
    {
      method: 'PUT',
      body: JSON.stringify({
        message: '[skip ci]',
        commiter: { name: '', email: '' },
        content: payload,
        sha: dbSha,
      }),
      headers: {
        Authorization: 'token ' + process.env['GIT'],
      },
    }
  );

  response = await req.json(); */

  return {
    body: {
      response: 'ok',
    },
  };
}
