<script context="module">
  export async function load({ session, fetch }) {
    const response = await fetch(import.meta.env.VITE_WAREHOUSE_URL);
    return {
      props: {
        session_id: session,
        products: await response.json(),
      },
    };
  }
</script>

<script>
  import { page } from '$app/stores';
  import { browser } from '$app/env';
  import { onMount } from 'svelte';
  import Image from '$lib/Image.svelte';
  import Currency from '$lib/Currency.svelte';
  import Stock from '$lib/Stock.svelte';
  import '@splidejs/splide/css';

  export let products;

  let cart;
  let n = 0;

  const slug = $page.params.slug;

  onMount(async () => {});

  if (browser) {
    if (localStorage.getItem('cart') != null) {
      cart = JSON.parse(localStorage.getItem('cart'));
    }
  }
</script>

<section class="section">
  <div class="container">
    <h1 class="title is-capitalized">{slug}</h1>
    <div class="columns is-multiline mt-6 is-mobile">
      {#each Object.entries(products) as [handle, product]}
        {#each product.tags as tag}
          {#if tag === slug}
            <div class="column is-one-fifth-desktop is-half-mobile">
              <a sveltekit:prefetch href="/products/{handle}">
                <div class="card is-shadowless">
                  <figure class="image is-square card-image">
                    <Image base='/products/' alt={product.title} src={product.image[0]} />
                  </figure>
                  <div class="card-content has-text-centered is-size-7">
                    <p class="stock mb-1">
                      <Stock qty={product.qty} />
                    </p>
                    <p class="product-title has-text-weight-medium">
                      {product.title}
                    </p>
                    <p class="product-price">
                      <Currency amount={product.price} /> SGD
                    </p>
                  </div>
                </div>
              </a>
            </div>
          {/if}
        {/each}
      {/each}
    </div>
  </div>
</section>

<style>
</style>
