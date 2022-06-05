
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
    const collectionPromises = []

    for (let i = 0; i < productJson.tags.length; i += 1) {
      collectionPromises.push(axios.get(`https://api.github.com/repos/TVqQAAMA/bagsocute/contents/docs/collections/${productJson.tags[i]}.json`, { headers }))
    }

    const collectionJson = await Promise.all(collectionPromises)

    // update respective collection.json(s)
    const collectionBlobPromises = []
    for (let i = 0; i < collectionJson.length; i += 1) {
      const collectionRes = collectionJson[i]
      const collection = JSON.parse(Buffer.from(collectionRes.data.content, 'base64').toString('ascii'))

      for (let j = 0; j < collection.length; j += 1) {
        if (collection[j].id === productJson.id) {
          collection[j].qty = parseInt(newQty, 10)
          break
        }
      }
      // create collection blob
      collection.push({ name: collectionRes.data.name })
      // console.log(collection)
      const collectionBlobPayload = {
        content: JSON.stringify(collection),
        encoding: 'utf-8'
      }

      collectionBlobPromises.push(axios.post(blobUrl, collectionBlobPayload, { headers }))
    }

    const collectionBlob = await Promise.all(collectionBlobPromises)
    // const updatedCollection = JSON.parse(JSON.parse(collectionBlob[0].config.data).content)
    let collectionName
    for (let i = 0; i < collectionBlob.length; i += 1) {
      const content = JSON.parse(JSON.parse(collectionBlob[i].config.data).content)
      for (let j = 0; j < content.length; j += 1) {
        if (content[j].name !== undefined) {
          collectionName = content[j].name
          treeItems.push({
            path: `docs/collections/${collectionName}`,
            mode: '100644',
            type: 'blob',
            sha: collectionBlob[i].data.sha
          })
        }
      }
    }

    console.log(treeItems)

    // console.log(treeItems)

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
}
