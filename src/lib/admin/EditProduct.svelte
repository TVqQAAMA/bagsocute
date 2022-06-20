<script>
  import { onMount } from 'svelte'
  import { adminState, selectedProduct, selectedProductId, stripeProducts } from '$lib/functions/store.js'
  import ProductImage from '$lib/components/ProductImage.svelte'
  import Tagify from '@yaireo/tagify'
  import '@yaireo/tagify/dist/tagify.css'

  const base = import.meta.env.VITE_WAREHOUSE_URL + '/products'

  let loading
  let editProduct
  let fileinput
  let tagInput
  let selectedImage
  let selectedTab = 'details'
  let processing = false
  let isCover = false

  onMount(async () => {
    showDetails()
  })

  async function setCover() {
    if (!processing) {
      processing = true
      loading = 'setcover'
      await fetch('/intents/setcover', {
        method: 'POST',
        body: JSON.stringify({
          Key: selectedImage
        })
      }).then(() => {
        refresh()
      })
    }
  }

  function saveProduct() {}

  function closeProduct() {
    $adminState = 'productTable'
  }

  function deleteProduct() {}

  async function deleteImage() {
    if (!processing) {
      processing = true
      loading = 'delete'
      await fetch('/intents/delete', {
        method: 'POST',
        body: JSON.stringify({
          Key: selectedImage
        })
      }).then(() => {
        refresh()
      })
    }
  }

  function showDetails() {
    if (!processing) {
      // eslint-disable-next-line no-unused-vars
      const tags = new Tagify(tagInput)
      selectedTab = 'details'
    }
  }

  function downloadImage() {
    if (!processing) {
      window.location = base + '/' + selectedImage
    }
  }

  function showImages() {
    if (!processing) {
      selectedTab = 'images'
    }
  }

  function showReviews() {
    if (!processing) {
      selectedTab = 'reviews'
    }
  }

  function imageSelect(image) {
    if (!processing) {
      selectedImage = $selectedProduct.handle + '/' + image
      isCover = ($selectedProduct.cover === image)
    }
  }

  async function refresh() {
    let req
    req = await fetch('/intents/products')
    const res = await req.json()
    $stripeProducts = res.stripeProducts
    const handle = $stripeProducts[$selectedProductId].handle
    console.log(handle)
    req = await fetch(`${base}/${handle}/product.json`)
    $selectedProduct = await req.json()
    $selectedProduct.handle = handle
    selectedImage = undefined
    loading = ''
    processing = false
  }

  const onFileSelected = (e) => {
    try {
      processing = true
      loading = 'upload'
      const image = e.target.files[0]
      const reader = new FileReader()
      reader.readAsDataURL(image)
      reader.onload = (e) => {
        const img = new Image()
        img.src = e.target.result
        img.onload = () => {
          const canvas = document.createElement('canvas')
          canvas.width = img.naturalWidth
          canvas.height = img.naturalHeight
          canvas.getContext('2d').drawImage(img, 0, 0)
          canvas.toBlob(
            (blob) => {
              const reader = new FileReader()
              reader.readAsDataURL(blob)
              reader.onloadend = async () => {
                await fetch('/intents/upload', {
                  method: 'POST',
                  body: JSON.stringify({
                    product: $selectedProduct.handle,
                    blob: reader.result
                  })
                }).then((response) => {
                  refresh()
                })
              }
            },
            'image/webp',
            0.75
          )
        }
      }
    } catch (e) {}
  }
</script>

<section class="section" bind:this="{editProduct}">
  <div class="container">
    <div class="buttons is-left">
      <button disabled={processing} class="button is-primary" on:click="{saveProduct}"><span class="icon icon-floppy mr-1"></span>Save</button>
      <button disabled={processing} class="button" on:click="{closeProduct}"><span class="icon icon-cancel-circled mr-1"></span>Cancel</button>
    </div>
    <div class="tabs is-fullwidth">
      <ul>
        <li class:is-active="{selectedTab === 'details'}" on:click="{showDetails}">
          <!-- svelte-ignore a11y-missing-attribute -->
          <a><span class="icon icon-edit mr-1"></span>Details</a>
        </li>
        <li class:is-active="{selectedTab === 'images'}" on:click="{showImages}">
          <!-- svelte-ignore a11y-missing-attribute -->
          <a><span class="icon icon-picture-outline mr-1"></span>Images</a>
        </li>
        <li class:is-active="{selectedTab === 'reviews'}" on:click="{showReviews}">
          <!-- svelte-ignore a11y-missing-attribute -->
          <a><span class="icon icon-comment-empty mr-1"></span>Reviews</a>
        </li>
      </ul>
    </div>

    {#if selectedTab === 'details'}
      <div class="field">
        <label for="title" class="label">Product</label>
        <input id="title" type="text" class="input" required bind:value="{$selectedProduct.title}" />
      </div>
      <div class="field">
        <label for="handle" class="label">Handle</label>
        <input id="handle" type="text" class="input" required bind:value="{$selectedProduct.handle}" />
      </div>
      <div class="field">
        <label for="price" class="label">Price</label>
        <input id="price" type="number" class="input" required bind:value="{$selectedProduct.price}" />
      </div>
      <div class="field">
        <label for="quantity" class="label">Quantity</label>
        <input id="quantity" type="number" class="input" required bind:value="{$selectedProduct.qty}" />
      </div>
      <div class="field">
        <label for="tags" class="label">Tags</label>
        <input id="tags" name="tags" class="input" required bind:value="{$selectedProduct.tags}" bind:this="{tagInput}" />
      </div>

      <div class="buttons is-centered">
        <button class="button is-danger mt-6 mb-6" on:click="{deleteProduct}"><span class="icon icon-warning-empty mr-1"></span>Delete Product</button>
      </div>
    {:else if selectedTab === 'images'}
      <div class="buttons">
        <button
          disabled={processing}
          class="button"
          class:is-warning="{loading === 'upload'}"
          class:is-loading="{loading === 'upload'}"
          on:click="{() => {
            fileinput.click()
          }}"><span class="icon icon-upload mr-1"></span>Add Image</button
        >
        <button 
          disabled={selectedImage === undefined || processing || isCover} 
          class="button" on:click="{deleteImage}" 
          class:is-warning="{loading === 'delete'}"
          class:is-loading="{loading === 'delete'}" >
          <span class="icon icon-trash mr-1"></span>Delete Image</button>
        <button 
          disabled={(selectedImage === undefined || selectedImage === $selectedProduct.handle + '/' + $selectedProduct.cover) || processing } 
          class:is-warning="{loading === 'setcover'}"
          class:is-loading="{loading === 'setcover'}"
          on:click={setCover} class="button"><span class="icon icon-star-empty mr-1"></span>Make Cover</button>
        <button 
          disabled={selectedImage === undefined || processing} 
          class="button" on:click={downloadImage}>
          <span class="icon icon-eye mr-1"></span>Download</button>
      </div>

      <div class="columns is-multiline">
        {#if $selectedProduct.images.length > 0}
          {#each $selectedProduct.images as image}          
            <div class="column is-one-quarter has-text-centered">              
              <figure 
                class:is-active-image={selectedImage === $selectedProduct.handle + '/' + image} 
                class="hand hover image is-square" on:click={() => imageSelect(image)}>                         
                  <ProductImage alt="{$selectedProduct.title}" src="{base}/{$selectedProduct.handle}/{image}" /> 
                </figure>
                {#if $selectedProduct.cover === image} 
                <span class="mt-2 tag is-warning is-light">
                  <span class="icon icon-star-empty mr-1"></span>Cover</span>  
                {/if}
            </div>
          {/each}
        {:else}
          <div class="column has-text-centered">No images!</div>
        {/if}
      </div>

      <input style="display:none" type="file" accept=".jpg, .jpeg, .png" on:change="{(e) => onFileSelected(e)}" bind:this="{fileinput}" />
    {:else if selectedTab === 'reviews'}{/if}
  </div>
</section>

<style>
  .image {
    box-shadow: rgba(0, 0, 0, 0.05) 0px 6px 24px 0px, rgba(0, 0, 0, 0.08) 0px 0px 0px 1px;
    border-radius: 5px;
    overflow: hidden;
  }

  .is-active-image,
  .hover:hover {
    box-shadow: rgba(54, 54, 54, 0.75) 0px 0px 0px 1px;
    border-radius: 5px;
    overflow: hidden;
  }
</style>
