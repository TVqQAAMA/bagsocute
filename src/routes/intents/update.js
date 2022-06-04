
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
    const productReq = await fetch(productApiUrl, {
      cache: 'no-store',
      headers: {
        Authorization: `token ${process.env['GIT']}`
      }
    })

    // update product.json
    const product = await productReq.json()
    const productJson = JSON.parse(Buffer.from(product.content, 'base64').toString('ascii'))
    productJson.qty = parseInt(newQty, 10)

    await fetch(productApiUrl, {
      method: 'PUT',
      body: JSON.stringify({
        message: '[skip ci]',
        commiter: { name: '', email: '' },
        content: Buffer.from(JSON.stringify(productJson), 'utf-8').toString('base64'),
        sha: product.sha
      }),
      headers: {
        Authorization: `token ${process.env['GIT']}`
      }
    })

    // get existing index.json
    const indexApiUrl = 'https://api.github.com/repos/TVqQAAMA/bagsocute/contents/docs/index.json'
    const indexReq = await fetch(indexApiUrl, {
      cache: 'no-store',
      headers: {
        Authorization: `token ${process.env['GIT']}`
      }
    })

    // update index.json
    const index = await indexReq.json()
    const indexJson = JSON.parse(Buffer.from(index.content, 'base64').toString('ascii'))
    indexJson[handle].qty = parseInt(newQty, 10)
    await fetch(indexApiUrl, {
      method: 'PUT',
      body: JSON.stringify({
        message: '[skip ci]',
        commiter: { name: '', email: '' },
        content: Buffer.from(JSON.stringify(indexJson), 'utf-8').toString('base64'),
        sha: index.sha
      }),
      headers: {
        Authorization: `token ${process.env['GIT']}`
      }
    })

    // get existing collection.json(s)
    const collectionPromises = productJson.tags.map(async (item) => {
      const collectionUrl = `https://api.github.com/repos/TVqQAAMA/bagsocute/contents/docs/collections/${item}.json`
      return await fetch(collectionUrl, {
        cache: 'no-store',
        headers: {
          Authorization: `token ${process.env['GIT']}`
        }
      })
    })

    const collectionJson = await Promise.all(collectionPromises)

    // update respective collection.json(s)
    collectionJson.map(async (o) => {
      const collectionRes = await o.json()
      const collection = JSON.parse(Buffer.from(collectionRes.content, 'base64').toString('ascii'))
      collection.map(async (o) => {
        if (o.id === productJson.id) {
          o.qty = parseInt(newQty, 10)
        }
      })
      await fetch(`https://api.github.com/repos/TVqQAAMA/bagsocute/contents/${collectionRes.path}`, {
        method: 'PUT',
        body: JSON.stringify({
          message: '[skip ci]',
          commiter: { name: '', email: '' },
          content: Buffer.from(JSON.stringify(collection), 'utf-8').toString('base64'),
          sha: collectionRes.sha
        }),
        headers: {
          Authorization: `token ${process.env['GIT']}`
        }
      })
    })
  }
}
