<script>
  export let src
  export let alt
  export let base
  
  const fileBase = src.slice(0, -5)
</script>

<picture>                      
  <img loading="lazy" alt={alt} src="{base}{fileBase}.webp" />
</picture>

<style>

</style>