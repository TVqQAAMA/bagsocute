/* Script to get data from Stripe, and create respective product and collection jsons */

import Stripe from 'stripe'
import dotenv from 'dotenv'
import fs from 'fs'

dotenv.config()

// eslint-disable-next-line dot-notation
const stripe = new Stripe(process.env['STRIPE_SECRET_KEY'])

const stripeProducts = []
const stripeProductPromises = []
const stripePricesPromises = []
const readdirPromises = []
const productPriceMap = {}
const productPriceIdMap = {}
const index = {}

async function createJsonContent () {
  const handles = []
  const imageMap = {}

  for (let i = 0; i < stripeProducts.length; i += 1) {
    if (
      !fs.existsSync(`./cdn/products/${stripeProducts[i].metadata.handle}/`)
    ) {
      console.log(
        `The folder cdn/products/${stripeProducts[i].metadata.handle} does not exist!`
      )
      return
    }

    const fsPromises = fs.promises
    readdirPromises.push(
      fsPromises.readdir(
        `./cdn/products/${stripeProducts[i].metadata.handle}`,
        {
          withFileTypes: true
        }
      )
    )

    handles.push(`${stripeProducts[i].metadata.handle}`)
  }

  const v = await Promise.all(readdirPromises)

  for (let i = 0; i < v.length; i += 1) {
    const imageList = []
    const files = v[i]
    files.forEach((file) => {
      if (file.name.slice(-4) === 'webp') {
        imageList.push(file.name)
      }
    })
    imageMap[handles[i]] = imageList
  }

  // create individual product jsons
  for (let i = 0; i < stripeProducts.length; i += 1) {
    const content = {
      id: stripeProducts[i].id,
      title: stripeProducts[i].name,
      images: imageMap[stripeProducts[i].metadata.handle],
      price: productPriceMap[stripeProducts[i].id],
      price_id: productPriceIdMap[stripeProducts[i].id],
      qty: parseInt(stripeProducts[i].metadata.qty, 10),
      tags: stripeProducts[i].metadata.tags.replace(', ', ',').split(',')
    }

    fs.writeFile(
      `./cdn/products/${stripeProducts[i].metadata.handle}/product.json`,
      '',
      () => {}
    )

    fs.appendFile(
      `./cdn/products/${stripeProducts[i].metadata.handle}/product.json`,
      JSON.stringify(content),
      () => {}
    )

    index[stripeProducts[i].metadata.handle] = content
  }

  // write index.json
  fs.writeFile('./cdn/index.json', '', () => {})
  fs.appendFile('./cdn/index.json', JSON.stringify(index), () => {})

  // create collection jsons
  const tags = {}
  for (let i = 0; i < stripeProducts.length; i += 1) {
    const list = stripeProducts[i].metadata.tags.replace(', ', ',').split(',')
    const content = {
      id: stripeProducts[i].id,
      title: stripeProducts[i].name,
      images: imageMap[stripeProducts[i].metadata.handle],
      price: productPriceMap[stripeProducts[i].id],
      qty: parseInt(stripeProducts[i].metadata.qty, 10),
      handle: stripeProducts[i].metadata.handle
    }
    for (let j = 0; j < list.length; j += 1) {
      if (tags[list[j]] === undefined) {
        tags[list[j]] = []
      }
      tags[list[j]].push(content)
    }
  }

  // eslint-disable-next-line no-restricted-syntax
  for (const key in tags) {
    if (Object.prototype.hasOwnProperty.call(tags, key)) {
      fs.writeFile(`./cdn/collections/${key}.json`, '', () => {})

      fs.appendFile(
        `./cdn/collections/${key}.json`,
        JSON.stringify(tags[key]),
        () => {}
      )
    }
  }
}

async function getStripePrices (v) {
  let req
  if (!v) {
    req = stripe.prices.list({
      limit: 100
    })
  } else {
    req = stripe.prices.list({
      limit: 100,
      starting_after: v
    })
  }

  stripePricesPromises.push(req)

  const res = await req

  if (res.has_more) {
    getStripePrices(res.data[res.data.length - 1].id)
  } else {
    const r = await Promise.all(stripePricesPromises)
    for (let i = 0; i < r.length; i += 1) {
      for (let j = 0; j < r[i].data.length; j += 1) {
        if (r[i].data[j].active) {
          productPriceMap[r[i].data[j].product] = r[i].data[j].unit_amount
          productPriceIdMap[r[i].data[j].product] = r[i].data[j].id
        }
      }
    }
    createJsonContent()
  }
}

async function getStripeProducts (v) {
  let req
  if (!v) {
    req = stripe.products.list({
      limit: 100
    })
  } else {
    req = stripe.products.list({
      limit: 100,
      starting_after: v
    })
  }

  stripeProductPromises.push(req)

  const res = await req

  if (res.has_more) {
    getStripeProducts(res.data[res.data.length - 1].id)
  } else {
    const r = await Promise.all(stripeProductPromises)
    for (let i = 0; i < r.length; i += 1) {
      for (let j = 0; j < r[i].data.length; j += 1) {
        stripeProducts.push(r[i].data[j])
      }
    }
    getStripePrices(false)
  }
}

getStripeProducts(false)
