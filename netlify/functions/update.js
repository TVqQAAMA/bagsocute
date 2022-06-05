
/* eslint-disable dot-notation */
import dotenv from 'dotenv'
import axios from 'axios'

dotenv.config()

exports.handler = async function (event) {
  try {
    return {
      statusCode: 200,
      body: JSON.stringify(event)
    }
  } finally {
    // console.log(event.body)
    const v = JSON.parse(event.body)
    // console.dir(v)
    const newQty = v.data.object.metadata.qty
    const handle = v.data.object.metadata.handle
    const treeItems = []
    const headers = { Authorization: `token ${process.env['GIT']}` }
    const blobUrl = 'https://api.github.com/repos/TVqQAAMA/bagsocute/git/blobs'

    // get heads/main
    const mainReq = axios.get('https://api.github.com/repos/TVqQAAMA/bagsocute/git/ref/heads/main', { headers })
    const main = await mainReq
    // console.log(main.data)

    // get existing product.json
    const productUrl = `https://api.github.com/repos/TVqQAAMA/bagsocute/contents/docs/products/${handle}/product.json`
    const productReq = axios.get(productUrl, { headers })
    const product = await productReq
    // console.log(product.data)

    // update product.json
    const productJson = JSON.parse(Buffer.from(product.data.content, 'base64').toString('ascii'))
    productJson.qty = parseInt(newQty, 10)

    // create blob for product.json
    const productBlobPayload = {
      content: JSON.stringify(productJson),
      encoding: 'utf-8'
    }
    const productBlobReq = axios.post(blobUrl, productBlobPayload, { headers })

    const productBlob = await productBlobReq

    treeItems.push({
      path: `docs/products/${handle}/product.json`,
      mode: '100644',
      type: 'blob',
      sha: productBlob.data.sha
    })

    // console.log(productBlob)

    // get existing index.json
    const indexApiUrl = 'https://api.github.com/repos/TVqQAAMA/bagsocute/contents/docs/index.json'
    const indexReq = axios.get(indexApiUrl, { headers })
    const index = await indexReq

    // update index.json
    const indexJson = JSON.parse(Buffer.from(index.data.content, 'base64').toString('ascii'))
    indexJson[handle].qty = parseInt(newQty, 10)

    // create blob for index.json
    const indexBlobPayload = {
      content: JSON.stringify(indexJson),
      encoding: 'utf-8'
    }
    const indexBlobReq = axios.post(blobUrl, indexBlobPayload, { headers })
    const indexBlob = await indexBlobReq
    treeItems.push({
      path: 'docs/index.json',
      mode: '100644',
      type: 'blob',
      sha: indexBlob.data.sha
    })

    // get existing collection.json(s)
    const collectionPromises = productJson.tags.map(async (item) => {
      const collectionUrl = `https://api.github.com/repos/TVqQAAMA/bagsocute/contents/docs/collections/${item}.json`
      return axios.get(collectionUrl, { headers })
    })

    const collectionJson = await Promise.all(collectionPromises)

    // update respective collection.json(s)
    collectionJson.map(async (o, i) => {
      const collectionRes = await o
      const collection = JSON.parse(Buffer.from(collectionRes.data.content, 'base64').toString('ascii'))
      collection.map(async (collectionItem) => {
        if (collectionItem.id === productJson.id) {
          collectionItem.qty = parseInt(newQty, 10)
        }
      })

      // create collection blob

      const collectionBlobPayload = {
        content: JSON.stringify(collection),
        encoding: 'utf-8'
      }
      const collectionBlobReq = axios.post(blobUrl, collectionBlobPayload, { headers })
      const collectionBlob = await collectionBlobReq
      treeItems.push({
        path: `docs/collections/${collectionRes.data.name}`,
        mode: '100644',
        type: 'blob',
        sha: collectionBlob.data.sha
      })

      console.log(treeItems)

      if (i === collectionJson.length - 1) {
      // get sha for base_tree
        const baseTreeUrl = 'https://api.github.com/repos/TVqQAAMA/bagsocute/git/trees/main'
        const baseTreeReq = axios.get(baseTreeUrl, { headers })
        const baseTree = await baseTreeReq

        // create tree
        const createTreeUrl = 'https://api.github.com/repos/TVqQAAMA/bagsocute/git/trees'
        const createTreePayload = {
          tree: treeItems,
          base_tree: baseTree.data.sha
        }
        const createTreeReq = axios.post(createTreeUrl, createTreePayload, { headers })
        const createTree = await createTreeReq

        // commit
        const commitUrl = 'https://api.github.com/repos/TVqQAAMA/bagsocute/git/commits'
        const commitPayload = {
          tree: createTree.data.sha,
          message: '[skip ci]',
          parents: [main.data.object.sha]
        }
        const commitReq = axios.post(commitUrl, commitPayload, { headers })
        const commit = await commitReq

        // console.log(commit)

        // updating the ref
        const refUrl = 'https://api.github.com/repos/TVqQAAMA/bagsocute/git/refs/heads/main'
        const refReq = axios.patch(refUrl, { sha: commit.data.sha }, { headers })
        const ref = await refReq

        console.log(ref)
      }
    })
  }
}
