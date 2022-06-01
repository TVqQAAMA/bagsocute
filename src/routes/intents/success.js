/* eslint-disable dot-notation */
import dotenv from 'dotenv'
import Stripe from 'stripe'

dotenv.config()

const stripe = new Stripe(process.env['STRIPE_SECRET_KEY'])
const lineItems = []
const payload = []
const stripePromises = []
const customer = {}

async function emailCustomer () {
  console.dir(customer)
}

async function commit () {
  await fetch(payload[0].url, {
    method: 'PUT',
    body: JSON.stringify({
      message: '[skip ci]',
      commiter: { name: '', email: '' },
      content: payload[0].payload,
      sha: payload[0].hash
    }),
    headers: {
      Authorization: `token ${process.env['GIT']}`
    }
  })

  payload.shift()
  if (payload.length === 0) {
    await Promise.all(stripePromises)
    emailCustomer()
  } else {
    commit()
  }
}

async function processLineItems () {
  let res

  const productJsons = {}
  const pathToHash = {}

  // console.log(lineItems);

  customer.lineItems = lineItems

  let cart = []
  for (let i = 0; i < lineItems.length; i += 1) {
    cart.push(stripe.products.retrieve(lineItems[i].price.product))
  }

  cart = await Promise.all(cart)
  customer.cart = cart
  // console.log(cart);

  // get current qty from warehouse, store in productQtyMap
  let urls = []

  for (let i = 0; i < cart.length; i += 1) {
    const { handle } = cart[i].metadata
    const url = process.env['VITE_WAREHOUSE_URL']
    const path = `docs/products/${handle}/product.json`
    urls.push(`${url}/products/${handle}/product.json`)
    pathToHash[path] = {
      url: `https://api.github.com/repos/TVqQAAMA/bagsocute/contents/${path}`,
      product_id: cart[i].id,
      hash: ''
    }
  }

  res = await Promise.all(urls.map(async (url) => {
    const resp = await fetch(url, {
      cache: 'no-store'
    })
    return resp.text()
  }))

  for (let i = 0; i < res.length; i += 1) {
    const o = JSON.parse(res[i])
    productJsons[o.id] = o
  }

  // console.log(productJsons);

  // get the hashes of the files
  urls = []
  Object.keys(pathToHash).forEach((key) => {
    urls.push(pathToHash[key].url)
  })

  // console.log(urls);

  res = await Promise.all(urls.map(async (url) => {
    const resp = await fetch(url, {
      cache: 'no-store',
      headers: {
        Authorization: `token ${process.env['GIT']}`
      }
    })
    return resp.json()
  }))

  for (let i = 0; i < res.length; i += 1) {
    pathToHash[res[i].path].hash = res[i].sha
  }

  Object.keys(pathToHash).forEach((key) => {
    productJsons[pathToHash[key].product_id].hash = pathToHash[key].hash
    productJsons[pathToHash[key].product_id].url = pathToHash[key].url
  })

  // update the new qtys
  for (let i = 0; i < lineItems.length; i += 1) {
    const productId = lineItems[i].price.product
    const qtyToRemove = parseInt(lineItems[i].quantity, 10)
    const currentQty = parseInt(productJsons[productId].qty, 10)
    productJsons[productId].qty = parseInt(currentQty - qtyToRemove, 10)
    console.log(currentQty, qtyToRemove, parseInt(currentQty - qtyToRemove, 10))
    stripePromises.push(
      stripe.products.update(
        productId,
        { metadata: { qty: parseInt(currentQty - qtyToRemove, 10) } }
      )
    )
  }

  // update the warehouse
  Object.keys(productJsons).forEach((key) => {
    const payloadString = productJsons[key]
    const buff = Buffer.from(JSON.stringify(payloadString), 'utf-8')
    payload.push({
      hash: productJsons[key].hash,
      payload: buff.toString('base64'),
      url: productJsons[key].url
    })
  })

  commit()
}

async function getLineItems (checkoutSession, v) {
  let req

  if (!v) {
    req = stripe.checkout.sessions.listLineItems(
      checkoutSession,
      { limit: 100 }
    )
  } else {
    req = stripe.checkout.sessions.listLineItems(
      checkoutSession,
      { limit: 100, starting_after: v }
    )
  }

  const res = await req

  for (let i = 0; i < res.data.length; i += 1) {
    lineItems.push(res.data[i])
  }

  if (res.has_more) {
    getLineItems(checkoutSession, res.data[res.data.length - 1].id)
  } else {
    processLineItems()
  }
}

export async function post ({ request }) {
  const v = await request.json()
  const checkoutSession = v.data.object.id

  // const checkoutSession = 'cs_test_b1yFcKSWk8hHuGPuN2NIVXPNbvKWaazy8LYMU0UnGuB0EO1mnSU90AwneA';

  customer.details = v.data.object.customer_details
  customer.payment_intent = v.data.object.payment_intent
  customer.shipping = v.data.object.shipping

  await getLineItems(checkoutSession, false)

  return {
    body: {
      response: 'ok'
    }
  }
}
