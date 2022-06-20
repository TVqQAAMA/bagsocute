import dotenv from 'dotenv'

dotenv.config()

export async function get ({ request }) {
  // await getStripeProducts(false)
  // await getStripePrices(false)
  const req = await fetch(process.env.VITE_WAREHOUSE_URL + '/index.json')
  const indexJson = await req.json()
  const stripeProducts = {}
  Object.keys(indexJson).forEach((indexKey) => {
    stripeProducts[indexJson[indexKey].id] = indexJson[indexKey]
    stripeProducts[indexJson[indexKey].id].handle = indexKey
  })
  return {
    body: {
      stripeProducts
    }
  }
}
