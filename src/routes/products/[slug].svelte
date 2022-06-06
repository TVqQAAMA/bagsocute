<script context="module">
  export async function load ({ session, fetch, params }) {
    const slug = params.slug
    const response = await fetch(import.meta.env.VITE_WAREHOUSE_URL + '/products/' + slug + '/product.json', {
      headers:
      { 'Cache-Control': 'no-store' }
    })
  
    return {
      props: {
        session_id: session,
        product: await response.json()
      }
    }
  }
</script>

<script>
  import Currency from '$lib/Currency.svelte'
  import Stock from '$lib/Stock.svelte'
  import { toast } from 'bulma-toast'
  import { page } from '$app/stores'
  import { store } from '$lib/store.js'
  import { browser } from '$app/env'
  import { Splide } from '@splidejs/splide'
  import { onMount } from 'svelte'
  import 'animate.css'

  export let product

  let cart
  let disabled = false
  let loading = ''

  const slug = $page.params.slug
  const base = import.meta.env.VITE_WAREHOUSE_URL + '/products/' + slug + '/'

  onMount(async () => {
    const main = new Splide('#carousel', {
      perPage: 1,
      arrows: false,
      pagination: true
    })

    const thumbnails = new Splide('#thumbnail-carousel', {
      fixedWidth: 100,
      fixedHeight: 100,
      gap: 10,
      rewind: true,
      pagination: false,
      isNavigation: true,
      breakpoints: {
        768: {
          fixedWidth: 60,
          fixedHeight: 60
        }
      }
    })

    main.mount()
    thumbnails.mount()
    main.sync(thumbnails)
  })

  if (browser) {
    if (localStorage.getItem('cart') != null) {
      cart = JSON.parse(localStorage.getItem('cart'))
    }
  }

  function addToCart (addedItem) {
    loading = 'is-loading'
    disabled = true

    const item = {}
    let alreadyExists = false

    cart.total += 1

    for (const item of cart.items) {
      if (addedItem.id === item.id) {
        item.qty += 1
        alreadyExists = true
      }
    }

    if (!alreadyExists) {
      item.id = addedItem.id.toString()
      item.name = addedItem.title
      item.handle = slug
      item.qty = 1
      item.image = addedItem.image
      item.price = addedItem.price
      item.price_id = addedItem.price_id
      cart.items.push(item)
    }

    store.set(JSON.stringify(cart))

    if (browser) {
      localStorage.setItem('cart', JSON.stringify(cart))
    }

    disabled = false

    toast({
      message: '🎉 Added to cart',
      type: 'is-white has-text-weight-medium',
      dismissible: false,
      position: 'top-center',
      duration: 1000,
      animate: { in: 'bounceInDown', out: 'bounceOut' }
    })

    loading = ''
  }

  async function share () {
    const shareData = {
      title: 'Bag So Cute! - ' + product.title,
      url: 'http://localhost:3000/products/' + slug
    }
    try {
      await navigator.share(shareData)
    } catch (err) {
      console.log(err)
    }
  }
</script>

<section class="section">
  <div class="container">
    <div class="columns">
      <div class="column">
        <div class="splide" id="carousel">
          <div class="splide__track">
            <ul class="splide__list">
              {#each product.images as image}
                <li class="splide__slide">
                  <figure class="image">
                    <img alt={product.title} src={base}{image} />
                  </figure>
                </li>
              {/each}
            </ul>
          </div>
        </div>

        <div class="splide" id="thumbnail-carousel">
          <div class="splide__track">
            <ul class="splide__list">
              {#each product.images as image}
                <li class="splide__slide">
                  <figure class="image">
                    <img alt={product.title} src={base}{image} />
                  </figure>
                </li>
              {/each}
            </ul>
          </div>
        </div>
      </div>

      <div class="column">
        <h1 class="title">{product.title}</h1>
        <div class="block is-size-5"><Currency amount={product.price} /></div>

        <div class="block">
          {#if product.qty <= 0}
            <div class="block"><span class="tag is-dark">Sold Out</span></div>
            <button disabled class="button has-text-weight-medium"
              ><span class="icon-basket pr-1" />Add to cart</button
            >
          {:else}
            <div class="block"><Stock qty={product.qty} /></div>
            <button
              class="{loading} button has-text-weight-medium is-dark"
              {disabled}
              on:click|preventDefault={() => addToCart(product)}
              ><span class="icon-basket pr-1" />Add to cart</button
            >
          {/if}
        </div>
        <div class="block">
          <button
            class="is-white button is-small"
            on:click|preventDefault={() => share()}
          >
            <svg
              width="13"
              height="12"
              viewBox="0 0 13 12"
              class="icon mr-2"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
              focusable="false"
            >
              <path
                d="M1.625 8.125V10.2917C1.625 10.579 1.73914 10.8545 1.9423 11.0577C2.14547 11.2609 2.42102 11.375 2.70833 11.375H10.2917C10.579 11.375 10.8545 11.2609 11.0577 11.0577C11.2609 10.8545 11.375 10.579 11.375 10.2917V8.125"
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M6.14775 1.27137C6.34301 1.0761 6.65959 1.0761 6.85485 1.27137L9.56319 3.9797C9.75845 4.17496 9.75845 4.49154 9.56319 4.6868C9.36793 4.88207 9.05135 4.88207 8.85609 4.6868L6.5013 2.33203L4.14652 4.6868C3.95126 4.88207 3.63468 4.88207 3.43942 4.6868C3.24415 4.49154 3.24415 4.17496 3.43942 3.9797L6.14775 1.27137Z"
                fill="currentColor"
              />
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M6.5 1.125C6.77614 1.125 7 1.34886 7 1.625V8.125C7 8.40114 6.77614 8.625 6.5 8.625C6.22386 8.625 6 8.40114 6 8.125V1.625C6 1.34886 6.22386 1.125 6.5 1.125Z"
                fill="currentColor"
              />
            </svg>
            Share
          </button>
        </div>
      </div>
    </div>
  </div>
</section>

<style>
.splide__slide img {
  object-fit: cover;
}
</style>
