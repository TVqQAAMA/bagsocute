<script>
  import { onMount } from 'svelte'
  import { Splide } from '@splidejs/splide'

  export const messages = ['Free Shipping! (1/2)', 'Leave a review! (2/2)']

  onMount(async () => {
    const announcement = new Splide('#announcement', {
      type: 'loop',
      fixedHeight: 20,
      rewind: true,
      pagination: false,
      arrows: false,
      autoplay: true,
      speed: 750,
      interval: 4000
    })

    announcement.mount()
  })
</script>

<div class="splide" id="announcement">
  <div class="splide__track">
    <ul class="splide__list">
      {#each messages as message}
        <li class="splide__slide has-text-centered has-text-weight-semibold has-text-white">{message}</li>
      {/each}
    </ul>
  </div>
</div>

<style>
  #announcement {
    background: -webkit-linear-gradient(45deg, orange, #ff69b4);
    padding: 0.5rem;
    font-size: 0.8rem;
  }
</style>
