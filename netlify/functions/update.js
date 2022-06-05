
/* eslint-disable dot-notation */
import dotenv from 'dotenv'
import fetch from 'node-fetch'

dotenv.config()

async function go(r) {
  const v = JSON.parse(r)
  // console.dir(v)
  const newQty = v.data.object.metadata.qty
  const handle = v.data.object.metadata.handle
  const treeItems = []

  // get heads/main
  /* const mainUrl = 'https://api.github.com/repos/TVqQAAMA/bagsocute/git/ref/heads/main'
  const mainReq = await fetch(mainUrl, {
    headers: {
      'Cache-Control': 'no-store',
      Authorization: `token ${process.env['GIT']}`
    }
  })
  const main = await mainReq.json()
  // console.log(main)

  // get existing product.json
  const productUrl = `https://api.github.com/repos/TVqQAAMA/bagsocute/contents/docs/products/${handle}/product.json`
  const productReq = await fetch(productUrl, {
    headers: {
      'Cache-Control': 'no-store',
      Authorization: `token ${process.env['GIT']}`
    }
  })
  const product = await productReq.json()
  // console.log(product)

  // update product.json
  const productJson = JSON.parse(Buffer.from(product.content, 'base64').toString('ascii'))
  productJson.qty = parseInt(newQty, 10)

  // create blob for product.json
  const productBlobUrl = 'https://api.github.com/repos/TVqQAAMA/bagsocute/git/blobs'
  const productBlobPayload = {
    content: JSON.stringify(productJson),
    encoding: 'utf-8'
  }
  const productBlobReq = await fetch(productBlobUrl, {
    method: 'POST',
    body: JSON.stringify(productBlobPayload),
    headers: {
      'Cache-Control': 'no-store',
      Authorization: `token ${process.env['GIT']}`
    }
  })

  const productBlob = await productBlobReq.json()
  treeItems.push({
    path: `docs/products/${handle}/product.json`,
    mode: '100644',
    type: 'blob',
    sha: productBlob.sha
  })

  // get existing index.json
  const indexApiUrl = 'https://api.github.com/repos/TVqQAAMA/bagsocute/contents/docs/index.json'
  const indexReq = await fetch(indexApiUrl, {
    headers: {
      'Cache-Control': 'no-store',
      Authorization: `token ${process.env['GIT']}`
    }
  })

  // update index.json
  const index = await indexReq.json()
  const indexJson = JSON.parse(Buffer.from(index.content, 'base64').toString('ascii'))
  indexJson[handle].qty = parseInt(newQty, 10)

  // create blob for index.json
  const indexBlobUrl = 'https://api.github.com/repos/TVqQAAMA/bagsocute/git/blobs'
  const indexBlobPayload = {
    content: JSON.stringify(indexJson),
    encoding: 'utf-8'
  }
  const indexBlobReq = await fetch(indexBlobUrl, {
    method: 'POST',
    body: JSON.stringify(indexBlobPayload),
    headers: {
      'Cache-Control': 'no-store',
      Authorization: `token ${process.env['GIT']}`
    }
  })
  const indexBlob = await indexBlobReq.json()
  treeItems.push({
    path: 'docs/index.json',
    mode: '100644',
    type: 'blob',
    sha: indexBlob.sha
  })

  // get existing collection.json(s)
  const collectionPromises = productJson.tags.map(async (item) => {
    const collectionUrl = `https://api.github.com/repos/TVqQAAMA/bagsocute/contents/docs/collections/${item}.json`
    return await fetch(collectionUrl, {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-store',
        Authorization: `token ${process.env['GIT']}`
      }
    })
  })

  const collectionJson = await Promise.all(collectionPromises)

  // update respective collection.json(s)
  collectionJson.map(async (o, i) => {
    const collectionRes = await o.json()
    const collection = JSON.parse(Buffer.from(collectionRes.content, 'base64').toString('ascii'))
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
    const collectionBlobReq = await fetch('https://api.github.com/repos/TVqQAAMA/bagsocute/git/blobs', {
      method: 'POST',
      body: JSON.stringify(collectionBlobPayload),
      headers: {
        'Cache-Control': 'no-store',
        Authorization: `token ${process.env['GIT']}`
      }
    })
    const collectionBlob = await collectionBlobReq.json()
    treeItems.push({
      path: `docs/collections/${collectionRes.name}`,
      mode: '100644',
      type: 'blob',
      sha: collectionBlob.sha
    })
    if (i === collectionJson.length - 1) {
      // get sha for base_tree
      const baseTreeUrl = 'https://api.github.com/repos/TVqQAAMA/bagsocute/git/trees/main'
      const baseTreeReq = await fetch(baseTreeUrl, {
        headers: {
          'Cache-Control': 'no-store',
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
          'Cache-Control': 'no-store',
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
          'Cache-Control': 'no-store',
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
          'Cache-Control': 'no-store',
          Authorization: `token ${process.env['GIT']}`
        }
      })
      const ref = await refReq.json()

      console.log(ref)
    }
  }) */
}

exports.handler = async function (event, request) {
  try {
    return {
      statusCode: 200,
      body: JSON.stringify(event)
    }
  } finally {
    const mainUrl = 'https://api.github.com/repos/TVqQAAMA/bagsocute/git/ref/heads/main'
    const mainReq = await fetch(mainUrl, {
      headers: {
        'Cache-Control': 'no-store',
        Authorization: `token ${process.env['GIT']}`
      }
    })
    const main = await mainReq.json()
  }
}
