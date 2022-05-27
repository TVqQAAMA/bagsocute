<script>
  export let src;
  export let alt;
  export let base;
  
  const fileBase = src.slice(0, -4);
</script>

<picture>
  <source type="image/webp" srcset="{base}{fileBase}.webp">
  <source type="image/jpeg" srcset="{base}{fileBase}.jpg">                        
  <img loading="lazy" alt={alt} src="products/{fileBase}.jpg" />
</picture>

<style>

</style>