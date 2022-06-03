
<script context="module">
  export async function load ({ fetch }) {
    const response = await fetch(import.meta.env.VITE_WAREHOUSE_URL + '/index.json')

    return {
      props: {
        products: await response.json()
      }
    }
  }
</script>

<script>
  import Currency from '$lib/Currency.svelte'
  import { Splide } from '@splidejs/splide'
  import { onMount } from 'svelte'
  import Stock from '$lib/Stock.svelte'
  import Image from '$lib/Image.svelte'

  export let products

  const maxItemsPerRow = 5
  const base = import.meta.env.VITE_WAREHOUSE_URL + '/products'
  const order = {}

  for (const s in products) {
    for (let i = 0; i < products[s].tags.length; i++) {
      const tag = products[s].tags[i]

      if (order[tag] === undefined) {
        order[tag] = []
      }

      order[tag].hasMore = false
      if (order[tag].length < maxItemsPerRow) {
        products[s].handle = s
        order[tag].push(products[s])
      } else {
        order[tag].hasMore = true
      }
    }
  }

  onMount(async () => {
    const featured = {}
    for (const s in order) {
      featured[s] = new Splide('#' + s, {
        perPage: maxItemsPerRow,
        drag: false,
        breakpoints: {
          768: {
            perPage: 2,
            drag: true,
            padding: { right: '2.5rem' }
          }
        },
        arrows: false,
        pagination: false
      })
    }

    for (const s in featured) {
      featured[s].mount()
      featured[s].on('updated', function () {
        featured[s].go(0)
      })
    }
  })
</script>

<section class="section">
  <div class="container">
    {#each Object.entries(order) as [key, object]}
      <h2 class="subtitle content has-text-weight-medium is-capitalized">
        <a href="/collections/{key}">{key}</a>
      </h2>
      <div class="splide block" id={key}>
        <div class="splide__track">
          <ul class="splide__list">
            {#each object as product}
              <li class="splide__slide">
                <a sveltekit:prefetch href="products/{product.handle}">
                  <div class="card is-shadowless">
                    <figure class="image is-square card-image">
                      <Image
                        alt={product.title}
                        src={base}/{product.handle}/{product.images[0]}
                      />
                    </figure>
                    <div class="card-content has-text-centered">
                      <p class="stock mb-1">
                        <Stock qty={product.qty} />
                      </p>
                      <p class="product-title has-text-weight-medium">
                        {product.title}
                      </p>
                      <p class="product-price">
                        <Currency amount={product.price} />
                      </p>
                    </div>
                  </div>
                </a>
              </li>
            {/each}
            {#if object.hasMore}
              <li class="splide__slide">
                <a sveltekit:prefetch href="collections/{key}">
                  <div class="mt-6 card is-shadowless">
                    <div class="card-content has-text-centered">
                      <p class="content has-text-weight-medium">
                        <a href="/collections/{key}"
                          ><span class="icon-angle-double-right" />View All</a
                        >
                      </p>
                    </div>
                  </div>
                </a>
              </li>
            {/if}
          </ul>
        </div>
      </div>
      {#if object.hasMore}
        <div
          class="see-more content has-text-right has-text-weight-medium see-more is-capitalized mt-2"
        >
          <a href="/collections/{key}" class="underline"
            ><span class="icon-angle-double-right" />See More {key}</a
          >
        </div>
      {/if}
    {/each}
  </div>
</section>

<svelte:head>
  <title>Welcome</title>
</svelte:head>

<style>
  @media only screen and (max-width: 768px) {
    .see-more {
      display: none;
    }
  }
</style>
