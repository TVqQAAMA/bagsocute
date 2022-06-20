<script context="module">
  export async function load({ fetch, params }) {
    let req
    let res
    let state
    let products

    if (params.slug === 'magic') {
      state = 'magic'
    } else {
      req = await fetch('/intents/auth', {
        method: 'POST',
        body: JSON.stringify({ slug: params.slug })
      })
      res = await req.json()
  
      if (res.response === 'verified') {
        req = await fetch('/intents/products')
        res = await req.json()
        state = 'productTable'
        products = res.stripeProducts
      } else {
        state = 'invalid'
      }
    }

    return {
      props: {
        state,
        products
      }
    }
  }
</script>

<script>
  import { onMount } from 'svelte'
  import { adminState, stripeProducts } from '$lib/functions/store.js'
  import MagicLink from '$lib/admin/MagicLink.svelte'
  import ProductTable from '$lib/admin/ProductTable.svelte'
  import EditProduct from '$lib/admin/EditProduct.svelte'

  export let state
  export let products

  let preloader

  // eslint-disable-next-line prefer-const
  $stripeProducts = products

  // eslint-disable-next-line prefer-const
  $adminState = state

  onMount(async () => {
    preloader.style.display = 'none'
    if (state === 'invalid') {
      window.location = '/'
    }
  })
</script>

<section class="section" bind:this="{preloader}">
  <div class="container has-text-centered">
    <button class="button is-loading is-white"></button>
  </div>
</section>

{#if $adminState === 'magic'}
  <MagicLink />
{:else if $adminState === 'productTable'}
  <ProductTable />
{:else if $adminState === 'editProduct'}
  <EditProduct />
{/if}

