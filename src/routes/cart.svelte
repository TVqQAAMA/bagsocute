<script context="module">
  export async function load({ session, fetch }) {
    let customer;

    if (session !== undefined) {
      const request = await fetch('/intents/customer', {
        method: 'POST',
        body: session,
      });

      customer = await request.json();
    }
    return {
      props: {
        session_id: session,
      },
    };
  }
</script>

<script>
  import { browser } from '$app/env';
  import { loadStripe } from '@stripe/stripe-js';
  import { onMount } from 'svelte';
  import Currency from '$lib/Currency.svelte';
  import { store } from '$lib/store.js';
  import { toast } from 'bulma-toast';
  import 'animate.css';

  export let session_id;

  let cart = { items: [], total: 0 };
  let stripe;
  let checkOutDisabled = false;
  let visibility = 'hidden';
  let loading = '';

  onMount(async () => {
    stripe = await loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);
  });

  if (browser) {
    if (localStorage.getItem('cart') != null) {
      cart = JSON.parse(localStorage.getItem('cart'));
    }
    visibility = 'visible';
  }

  async function onSubmit() {
    checkOutDisabled = true;
    loading = 'is-loading';
    
    if (!session_id) {
      window.location = '/login?cart';
    } else {
      const checkout = await fetch('/intents/checkout', {
        method: 'POST',
        body: JSON.stringify({
          session_id,
          cart,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const { response } = await checkout.json();

      stripe.redirectToCheckout({
        sessionId: response,
      });
    }
  }

  function minusCart(handle) {
    cart.total -= 1;    
    for (let i = 0; i < cart.items.length; i += 1) {
      if (cart.items[i].handle === handle) {
        cart.items[i].qty -= 1;
        if (cart.items[i].qty <= 0) {
          cart.items.splice(i, 1);
        }
        localStorage.setItem('cart', JSON.stringify(cart));
        store.set(JSON.stringify(cart));
        break;
      }
    }
    grandTotal = getGrandTotal();
    toast({
      message: 'Quantity updated',
      type: 'is-light is-size-7 has-text-weight-medium',
      dismissible: false,
      position: 'top-center',
      duration: 1000,
      animate: { in: 'bounceInDown', out: 'bounceOut' },
    });
  }

  function plusCart(handle) {
    cart.total += 1;    
    for (let i = 0; i < cart.items.length; i += 1) {
      if (cart.items[i].handle === handle) {
        cart.items[i].qty += 1;
        localStorage.setItem('cart', JSON.stringify(cart));
        store.set(JSON.stringify(cart));
        break;
      }
    }
    grandTotal = getGrandTotal();
    toast({
      message: 'Quantity updated',
      type: 'is-light is-size-7 has-text-weight-medium',
      dismissible: false,
      position: 'top-center',
      duration: 1000,
      animate: { in: 'bounceInDown', out: 'bounceOut' },
    });
    
  }

  let grandTotal = getGrandTotal();
  
  function getGrandTotal()
  {
    let n = 0;
    for (let i = 0; i < cart.items.length; i += 1)
    {
      n += cart.items[i].price * cart.items[i].qty;
    }
    return n;
  }

</script>

<section class="section">
  <div class="container" style="visibility:{visibility}">
    <div class="columns is-centered">
      <div class="column is-fullwidth">
        {#if cart.items.length == 0}
          <h1 class="title has-text-centered">Your cart is empty</h1>
        {:else}
          <h1 class="title">Your Cart</h1>

          <table class="table is-fullwidth">
            <thead>
              <tr class="menu-label">
                <th>Product</th>
                <th>Quantity</th>
                <th>Price</th>
              </tr>
              {#each cart.items as item, index (item.id)}
                <tr>
                  <td class="pt-4"
                    ><a href="/products/{item.handle}">{item.name}</a></td
                  >
                  <td
                    ><div class="field is-grouped">
                      <button
                        on:click|preventDefault={() => minusCart(item.handle)}
                        class="button is-white"
                        ><svg
                          xmlns="http://www.w3.org/2000/svg"
                          focusable="false"
                          role="presentation"
                          class="icon"
                          fill="none"
                          viewBox="-5 0 20 2"
                        >
                          <path
                            fill-rule="evenodd"
                            clip-rule="evenodd"
                            d="M.5 1C.5.7.7.5 1 .5h8a.5.5 0 110 1H1A.5.5 0 01.5 1z"
                            fill="#777"
                          /></svg
                        ></button
                      ><input
                        size="2"
                        class="has-text-centered input is-static"
                        readonly
                        value={item.qty}
                        style="width:2rem"
                      /><button
                        on:click|preventDefault={() => plusCart(item.handle)}
                        class="button is-white"
                        ><svg
                          xmlns="http://www.w3.org/2000/svg"
                          focusable="false"
                          role="presentation"
                          class="icon"
                          fill="none"
                          viewBox="-5 0 20 10"
                        >
                          <path
                            fill-rule="evenodd"
                            clip-rule="evenodd"
                            d="M1 4.51a.5.5 0 000 1h3.5l.01 3.5a.5.5 0 001-.01V5.5l3.5-.01a.5.5 0 00-.01-1H5.5L5.49.99a.5.5 0 00-1 .01v3.5l-3.5.01H1z"
                            fill="#777"
                          /></svg
                        ></button
                      >
                    </div></td
                  >
                  <td class="pt-4"><Currency amount={item.price} /></td>
                </tr>
              {/each}
            </thead>
          </table>
        {/if}
        <form on:submit|preventDefault={onSubmit}>
          <div class="mt-5 control has-text-centered">
            {#if cart.items.length == 0}
              <a href="/" class="button is-link">Continue shopping 😊</a>
              <div class="section">
                <p class="content subtitle">Have an account?</p>
                <p class="content">
                  <a href="/login">Log in</a> to check out faster.
                </p>
              </div>
            {:else}
              <div class="block has-text-right"><span class="subtitle is-size-6 pr-3">Subtotal</span><span class="subtitle is-size-6 has-text-weight-medium"><Currency amount={grandTotal} /></span></div>
              <div class="block has-text-right">
              <button disabled={checkOutDisabled} class="{loading} button is-warning has-text-weight-bold"
                >💳 Check out</button
              >
              </div>
              
            {/if}
          </div>
        </form>
      </div>      
    </div>
    
  </div>
</section>

<style>
  th {
    font-size: 0.75rem;
  }

  .table thead td,
  .table thead th {
    border-width: 0 0 1px;
  }

  td:nth-child(1) {
    width: 50%;
  }

  td:nth-child(2) {
    width: 25%;
  }

  td:nth-child(3) {
    width: 25%;
  }
</style>
