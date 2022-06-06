<script context="module">
  export async function load({ session, fetch, params }) {
    const slug = params.slug
    const response = await fetch(import.meta.env.VITE_WAREHOUSE_URL + '/collections/' + slug + '.json')
    return {
      props: {
        products: await response.json()
      },
      cache: {
        maxage: 1
      }
    }
  }
</script>

<script>
  import { page } from '$app/stores'
  import { browser } from '$app/env'
  import { onMount } from 'svelte'
  import Image from '$lib/Image.svelte'
  import Currency from '$lib/Currency.svelte'
  import Stock from '$lib/Stock.svelte'
  import '@splidejs/splide/css'

  export let products

  let cart

  const slug = $page.params.slug
  const base = import.meta.env.VITE_WAREHOUSE_URL + '/products/'

  onMount(async () => {})

  if (browser) {
    if (localStorage.getItem('cart') != null) {
      cart = JSON.parse(localStorage.getItem('cart'))
    }
  }
</script>

<section class="section">
  <div class="container">
    <h2 class="subtitle has-text-weight-medium is-capitalized">{slug}</h2>
    <div class="columns is-multiline mt-6 is-mobile">
      {#each products as product}
        <div class="column is-one-fifth-desktop is-half-mobile">
          <a sveltekit:prefetch href="/products/{product.handle}">
            <div class="card is-shadowless">
              <figure class="image is-square card-image">
                <Image alt="{product.title}" src="{base}/{product.handle}/{product.images[0]}" />
              </figure>
              <div class="card-content has-text-centered">
                <p class="stock mb-1">
                  <Stock qty="{product.qty}" />
                </p>
                <p class="product-title has-text-weight-medium">
                  {product.title}
                </p>
                <p class="product-price">
                  <Currency amount="{product.price}" /> SGD
                </p>
              </div>
            </div>
          </a>
        </div>
      {/each}
    </div>
  </div>
</section>

<style>
</style>
