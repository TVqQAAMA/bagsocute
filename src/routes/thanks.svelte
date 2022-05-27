<script>
  import { store } from '$lib/store.js';
  import { browser } from '$app/env';

  let cart;
  
  store.subscribe((value) => {
    cart = JSON.parse(value);
  }); 

  cart = {"items":[]};
  store.set(JSON.stringify(cart))

  if (browser) {    
    localStorage.setItem('cart', JSON.stringify(cart));
  }

</script>

<section class="section">
  <div class="container">
    <h1 class="title has-text-centered">Thank you!</h1>
  </div>
</section>
