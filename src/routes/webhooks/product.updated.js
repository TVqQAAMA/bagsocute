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
    // console.dir(v)
    const newQty = v.data.object.metadata.qty
    const handle = v.data.object.metadata.handle
    const treeItems = []
    const headers = { Authorization: `token ${process.env['GIT']}` }
    const blobUrl = 'https://api.github.com/repos/TVqQAAMA/bagsocute/git/blobs'

    // get heads/main
    const mainUrl = 'https://api.github.com/repos/TVqQAAMA/bagsocute/git/ref/heads/main'
    const mainReq = await fetch(mainUrl, {
      headers: {
        Authorization: `token ${process.env['GIT']}`
      }
    })
    const main = await mainReq.json()
    // console.log(main)

    // get existing product.json
    const productUrl = `https://api.github.com/repos/TVqQAAMA/bagsocute/contents/cdn/products/${handle}/product.json`
    const productReq = await fetch(productUrl, {
      headers: {
        Authorization: `token ${process.env['GIT']}`
      }
    })
    const product = await productReq.json()
    // console.log(product)

    // update product.json
    const productJson = JSON.parse(Buffer.from(product.content, 'base64').toString('ascii'))
    productJson.qty = parseInt(newQty, 10)

    // create blob for product.json
    const productBlobPayload = {
      content: JSON.stringify(productJson),
      encoding: 'utf-8'
    }
    const productBlobReq = await fetch(blobUrl, {
      method: 'POST',
      body: JSON.stringify(productBlobPayload),
      headers: {
        Authorization: `token ${process.env['GIT']}`
      }
    })

    const productBlob = await productBlobReq.json()
    treeItems.push({
      path: `cdn/products/${handle}/product.json`,
      mode: '100644',
      type: 'blob',
      sha: productBlob.sha
    })

    // get existing index.json
    const indexApiUrl = 'https://api.github.com/repos/TVqQAAMA/bagsocute/contents/cdn/index.json'
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

    // create blob for index.json
    const indexBlobPayload = {
      content: JSON.stringify(indexJson),
      encoding: 'utf-8'
    }

    const indexBlobReq = await fetch(blobUrl, {
      method: 'POST',
      body: JSON.stringify(indexBlobPayload),
      headers: {
        Authorization: `token ${process.env['GIT']}`
      }
    })

    const indexBlob = await indexBlobReq.json()
    treeItems.push({
      path: 'cdn/index.json',
      mode: '100644',
      type: 'blob',
      sha: indexBlob.sha
    })

    // get existing collection.json(s)
    const collectionPromises = []

    for (let i = 0; i < productJson.tags.length; i += 1) {
      collectionPromises.push(fetch(`https://api.github.com/repos/TVqQAAMA/bagsocute/contents/cdn/collections/${productJson.tags[i]}.json`, { headers }))
    }

    const collectionJson = await Promise.all(collectionPromises)

    // update respective collection.json(s)
    const collectionBlobPromises = []
    for (let i = 0; i < collectionJson.length; i += 1) {
      const collectionRes = await collectionJson[i].json()
      const collection = JSON.parse(Buffer.from(collectionRes.content, 'base64').toString('ascii'))

      for (let j = 0; j < collection.length; j += 1) {
        if (collection[j].id === productJson.id) {
          collection[j].qty = parseInt(newQty, 10)
          break
        }
      }

      // create collection blob
      const collectionBlobPayload = {
        content: JSON.stringify(collection),
        encoding: 'utf-8'
      }

      collectionBlobPromises.push(fetch(blobUrl, {
        method: 'POST',
        body: JSON.stringify(collectionBlobPayload),
        headers
      }))
    }

    const collectionBlob = await Promise.all(collectionBlobPromises)

    // console.log(collectionBlob)

    for (let i = 0; i < collectionBlob.length; i += 1) {
      const response = await collectionBlob[i].json()

      treeItems.push({
        path: `cdn/collections/${productJson.tags[i]}.json`,
        mode: '100644',
        type: 'blob',
        sha: response.sha
      })
    }

    // get sha for base_tree
    const baseTreeUrl = 'https://api.github.com/repos/TVqQAAMA/bagsocute/git/trees/main'
    const baseTreeReq = await fetch(baseTreeUrl, {
      headers: {
        Authorization: `token ${process.env['GIT']}`
      }
    })
    const baseTree = await baseTreeReq.json()

    // create tree
    const createTreeUrl = 'https://api.github.com/repos/TVqQAAMA/bagsocute/git/trees'
    const createTreePayload = {
      tree: treeItems,
      base_tree: baseTree.sha
    }
    const createTreeReq = await fetch(createTreeUrl, {
      method: 'POST',
      body: JSON.stringify(createTreePayload),
      headers: {
        Authorization: `token ${process.env['GIT']}`
      }
    })
    const createTree = await createTreeReq.json()

    // commit
    const commitUrl = 'https://api.github.com/repos/TVqQAAMA/bagsocute/git/commits'
    const commitPayload = {
      tree: createTree.sha,
      message: '[skip ci]',
      parents: [main.object.sha]
    }
    const commitReq = await fetch(commitUrl, {
      method: 'POST',
      body: JSON.stringify(commitPayload),
      headers: {
        Authorization: `token ${process.env['GIT']}`
      }
    })
    const commit = await commitReq.json()

    // console.log(commit)

    // updating the ref
    const refUrl = 'https://api.github.com/repos/TVqQAAMA/bagsocute/git/refs/heads/main'
    const refReq = await fetch(refUrl, {
      method: 'PATCH',
      body: JSON.stringify({ sha: commit.sha }),
      headers: {
        Authorization: `token ${process.env['GIT']}`
      }
    })
    const ref = await refReq

    // sync s3
    const workflowUrl = 'https://api.github.com/repos/TVqQAAMA/bagsocute/actions/workflows/27583157/dispatches'
    const workflowReq = await fetch(workflowUrl, {
      method: 'POST',
      body: JSON.stringify({
        ref: 'main'
      }),
      headers: {
        Authorization: `token ${process.env['GIT']}`
      }
    })

    const workflow = await workflowReq
  }
}
