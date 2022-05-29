/* eslint-disable dot-notation */
/* eslint linebreak-style: ["error", "windows"] */
import Stripe from 'stripe';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const stripe = new Stripe(process.env['STRIPE_SECRET_KEY']);

const stripeProducts = [];
const products = {};

async function getProducts(v) {
  let req;
  if (!v) {
    req = await stripe.products.list({
      limit: 2,
    });
  } else {
    req = await stripe.products.list({
      limit: 2,
      starting_after: v,
    });
  }

  for (let i = 0; i < req.data.length; i += 1) {
    stripeProducts.push(req.data[i]);
  }

  if (req.has_more) {
    await getProducts(req.data[req.data.length - 1].id);
  }
}

await getProducts(false);

console.log(stripeProducts);

const imageList = [];

/*for (let i = 0; i < stripeProducts.length; i += 1) {
  fs.readdir(
    `./warehouse/${stripeProducts[i].metadata.handle}`,
    { withFileTypes: true },
    (err, files) => {     
      files.forEach((file) => {
        if (file.name.slice(-4) === 'webp') {
          imageList.push(file.name)
        }
      });
     
    },
  );
}

console.log(await imageList);*/
/* const content = {
    id: stripeProducts[i].id,
    title: stripeProducts[i].name,
    images: imageList,
    price: stripeProducts[i].default_price,
    qty: stripeProducts[i].metadata.qty,
    tags: [], // todo
  }; */

/* fs.appendFile(
    `./warehouse/${stripeProducts[i].metadata.handle}.json`,
    JSON.stringify(content),
    () => {}
  ); */

// console.log(content);
// }

// console.log(imageList)

/* async function populateKeys() {
  const fsPromises = fs.promises;
  const files = await fsPromises.readdir('./warehouse', {
    withFileTypes: true,
  });
  files.forEach((file) => {
    if (file.isDirectory()) {
      products[file.name] = {};
    }
  });
} */

/* const v = await stripe.prices.retrieve(stripeProducts[i].default_price);
  products[stripeProducts[i].metadata.handle] = {
    id: stripeProducts[i].id,
    title: stripeProducts[i].name,
    price: v.unit_amount / 100,
    qty: stripeProducts[i].metadata.qty
  };
  console.log(v) */
