<script>
  import { onMount } from 'svelte'

  export let src
  export let alt

  let loaded = false

  onMount(() => {
    const img = new Image()
    img.src = src

    img.onload = () => {
      loaded = true
    }
  })
</script>

<div>
  {#if loaded}
    <img loading="auto" alt="{alt}" src="{src}" />
  {:else}
    <img alt="Loading" src="/loading.svg" class="loading" />
  {/if}
</div>

<style>
  .loading {
    width: 50px !important;
    object-fit: contain;
    margin-left: auto;
    margin-right: auto;
  }

  img { 
    object-fit: contain;
  }
</style>
