/* eslint-disable dot-notation */
import dotenv from 'dotenv'
import { Blob } from 'buffer'
import { getContents, uploadFile, deleteFile } from '$lib/functions/file'

dotenv.config()

let arrayIndex
// let promises

export async function post({ request }) {
  const res = await request.json()
  const handle = res.Key.split('/')[0]
  const fileName = res.Key.split('/')[1]

  // delete file
  await deleteFile('products/' + res.Key)

  // get index.json
  /* const indexJson = await getContents('index.json')

  // update index.json
   arrayIndex = indexJson[handle].images.indexOf(fileName)
  indexJson[handle].images.splice(arrayIndex, 1)
  await uploadFile(new Blob([JSON.stringify(indexJson)], { type: 'text/plain' }), 'index.json') */

  // get product.json
  const productJson = await getContents(`products/${handle}/product.json`)

  // update product.json
  arrayIndex = productJson.images.indexOf(fileName)
  productJson.images.splice(arrayIndex, 1)
  await uploadFile(new Blob([JSON.stringify(productJson)], { type: 'text/plain' }), `products/${handle}/product.json`)

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
        arrayIndex = collectionJson[j].images.indexOf(fileName)
        collectionJson[j].images.splice(arrayIndex, 1)
        promises.push(uploadFile(
          new Blob([JSON.stringify(collectionJson)], { type: 'text/plain' }),
          `collections/${productJson.tags[i]}.json`
        ))
      }
    }
  }
  await Promise.all(promises) */

  return {
    status: 200
  }
}
