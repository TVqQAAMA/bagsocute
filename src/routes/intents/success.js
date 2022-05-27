/* eslint-disable dot-notation */
/* eslint linebreak-style: ["error", "windows"] */
import dotenv from 'dotenv';
import crypto from 'crypto';
import { Blob } from 'buffer';

dotenv.config();

let products;

// eslint-disable-next-line import/prefer-default-export
export async function post({ request }) {
  // const v = await request.json();

  /* console.dir(v.data.object.customer_details);
  console.dir(v.data.object.payment_intent);
  console.dir(v.data.object.shipping);
  console.dir(cart); */

  // get the exist db

  const req = await fetch(process.env['VITE_WAREHOUSE_URL'], {
    method: 'GET',
  });

  products = await req.json();

  // now subtract cart qty from products

  products['spiderman-hard-shell-bag'].qty = 9;

  // get hash list from netlify

  getFileList();

  /* for (let i = 0; i < cart.items.length; i += 1) {
    const currentQty = parseInt(products[cart.items[i].handle].qty, 10);
    const newQty = currentQty - parseInt(cart.items[i].qty, 10);
    products[cart.items[i].handle].qty = newQty;
  } */

  // prep for uploads

  /* const blob = new Blob([JSON.stringify(products)], {
    type: 'text/plain',
  });

  const hash = crypto
    .createHash('sha1')
    .update(JSON.stringify(products))
    .digest('hex');

  const corsBlob = new Blob(['/*\n  Access-Control-Allow-Origin: *'], {
    type: 'text/plain',
  });

  const corsHash = crypto
    .createHash('sha1')
    .update('/*\n  Access-Control-Allow-Origin: *')
    .digest('hex');

  const indexBlob = new Blob(['Nothing to see here'], {
    type: 'text/plain',
  });

  const indexHash = crypto
    .createHash('sha1')
    .update('Nothing to see here')
    .digest('hex');

  // send the digests to prep for deploy
  req = await fetch(process.env['WAREHOUSE_DEPLOY'], {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env['WAREHOUSE']}`,
    },
    body: JSON.stringify({
      files: {
        '/db.json': hash,
        '/_headers': corsHash,
        '/index.html': indexHash,
      },
    }),
  });

  const res = await req.json();

  // upload the blobs
  req = await fetch(
    `https://api.netlify.com/api/v1/deploys/${res.id}/files/db.json`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/octet-stream',
        Authorization: `Bearer ${process.env['WAREHOUSE']}`,
      },
      body: blob,
    },
  );

  req = await fetch(
    `https://api.netlify.com/api/v1/deploys/${res.id}/files/_headers`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/octet-stream',
        Authorization: `Bearer ${process.env['WAREHOUSE']}`,
      },
      body: corsBlob,
    },
  );

  req = await fetch(
    `https://api.netlify.com/api/v1/deploys/${res.id}/files/index.html`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/octet-stream',
        Authorization: `Bearer ${process.env['WAREHOUSE']}`,
      },
      body: indexBlob,
    },
  ); */

  return {
    body: {
      response: 'ok',
    },
  };
}
