<script>
  import { onMount } from 'svelte'

  export let src
  export let alt

  $: imgTag = '<img alt="Loading" src="loading.gif" />'

  onMount(() => {
    const img = new Image()
    img.src = src

    img.onload = () => {
      imgTag = `<img loading="lazy" alt=${alt} src="${src}" />`
    }
    img.onerror = () => {
  
    }
  })
</script>

<picture>
  {@html imgTag}
</picture>

<style>
</style>
