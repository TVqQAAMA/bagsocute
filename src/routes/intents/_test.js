/* eslint-disable dot-notation */
import dotenv from 'dotenv'
import sgMail from '@sendgrid/mail'
import Stripe from 'stripe'
import crypto from 'crypto'
import { Upload } from '@aws-sdk/lib-storage'
import { S3Client } from '@aws-sdk/client-s3'
import { Blob } from 'buffer'

sgMail.setApiKey(process.env['SENDGRID'])

dotenv.config()

const sendGrid = process.env['SENDGRID']

export async function post ({ request }) {
  // const v = await request.json();
  // console.log(v.hello);

  // console.log(request.headers.get('authorization'))

  return {
    body: {
      response: request.headers
    }
  }
}

export async function get ({ request }) {
  // const v = await request.headers

  /* const blob = new Blob(['bbbbb'], { type: 'text/plain' })

  const target = { Bucket: 'bagsocute', Key: 'a.json', Body: blob }

  const parallelUploads3 = new Upload({
    client: new S3Client({ region: 'ap-southeast-1' }),
    params: target
  })

  const p = await parallelUploads3.done()
  console.log(p)

  return {
    body: {
      response: 'hello get'
    }
  } */

  /* github api below */

  // console.log(response.headers.get('authorization'));

  // get db.json sha
  /* req = await fetch(
    dbUrl,
    {
      method: 'GET',
      headers,
    },
  );

  response = await req.json();

  const dbSha = response.sha;

  req = await fetch(
    dbUrl,
    {
      method: 'PUT',
      body: JSON.stringify({
        message: 'Update',
        commiter: { name: '', email: '' },
        content: 'YWFhYWFhYWE=',
        sha: dbSha,
      }),
      headers,
    }
  );

  response = await req.json();

  console.log(response) */
}

/* netlify

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
