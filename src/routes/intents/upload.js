import dotenv from 'dotenv'
import { getContents, uploadFile } from '$lib/functions/file'
import { Blob } from 'buffer'
import crypto from 'crypto'

dotenv.config()

// let promises

export async function post({ request }) {
  const res = await request.json()

  // upload image
  const imgFileName = crypto.randomBytes(16).toString('hex')
  const blobReq = await fetch(res.blob)
  await uploadFile(await blobReq.blob(), `products/${res.product}/${imgFileName}.webp`)

  // get index.json
  /* const indexJson = await getContents('index.json')

  // update index.json
  indexJson[res.product].images.push(`${imgFileName}.webp`)
  await uploadFile(new Blob([JSON.stringify(indexJson)], { type: 'text/plain' }), 'index.json') */

  // get product.json
  const productJson = await getContents(`products/${res.product}/product.json`)

  // update product.json
  productJson.images.push(`${imgFileName}.webp`)
  await uploadFile(new Blob([JSON.stringify(productJson)], { type: 'text/plain' }), `products/${res.product}/product.json`)

  // get collection.jsons
  /* promises = []
  for (let i = 0; i < productJson.tags.length; i += 1) {
    promises.push(getContents(`collections/${productJson.tags[i]}.json`))
  }
  const collectionRes = await Promise.all(promises)

  // update collections.json
  promises = []
  for (let i = 0; i < collectionRes.length; i += 1) {
    const collectionJson = collectionRes[i]
    for (let j = 0; j < collectionJson.length; j += 1) {
      if (collectionJson[j].id === productJson.id) {
        collectionJson[j].images.push(`${imgFileName}.webp`)
        promises.push(uploadFile(
          new Blob([JSON.stringify(collectionJson)], { type: 'text/plain' }),
          `collections/${productJson.tags[i]}.json`
        ))
      }
    }
  }
  await Promise.all(promises) */

  return {
    body: {
      fileName: `products/${res.product}/${imgFileName}.webp`
    }
  }
}
