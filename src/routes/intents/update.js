
/* eslint-disable dot-notation */
import dotenv from 'dotenv'

dotenv.config()

export async function post({ request }) {
  try {
    return {
      status: 200
    }
  } finally {
    const v = await request.json()
    console.dir(v)
    const newQty = v.data.object.metadata.qty
    const handle = v.data.object.metadata.handle

    // get existing product.json
    const productApiUrl = `https://api.github.com/repos/TVqQAAMA/bagsocute/contents/docs/products/${handle}/product.json`
    const req = await fetch(productApiUrl, {
      cache: 'no-store',
      headers: {
        Authorization: `token ${process.env['GIT']}`
      }
    })

    const product = await req.json()
    const productJson = JSON.parse(Buffer.from(product.content, 'base64').toString('ascii'))

    productJson.qty = parseInt(newQty, 10)

    // update warehouse
    const buff = Buffer.from(JSON.stringify(productJson), 'utf-8')
    await fetch(productApiUrl, {
      method: 'PUT',
      body: JSON.stringify({
        message: '[skip ci]',
        commiter: { name: '', email: '' },
        content: buff.toString('base64'),
        sha: product.sha
      }),
      headers: {
        Authorization: `token ${process.env['GIT']}`
      }
    })
  }
}
