<script context="module">
  export async function load({ session }) {
    return {
      props: {
        sessionId: session
      }
    }
  }
</script>

<script>
  import { page } from '$app/stores'
  import { store } from '$lib/store.js'
  import { browser } from '$app/env'
  import { onMount } from 'svelte'
  import Announcement from '$lib/Announcement.svelte'

  export let sessionId

  let cart
  let logOutDisabled = true
  let loading = ''

  store.subscribe((value) => {
    cart = JSON.parse(value)
  })

  onMount(async () => {
    const $navbarBurgers = Array.prototype.slice.call(document.querySelectorAll('.navbar-burger'), 0)

    $navbarBurgers.forEach((el) => {
      el.addEventListener('click', () => {
        const target = el.dataset.target
        const t = document.getElementById(target)
        el.classList.toggle('is-active')
        t.classList.toggle('is-active')
      })
    })

    logOutDisabled = false
  })

  if (browser) {
    if (localStorage.getItem('cart') != null) {
      cart = JSON.parse(localStorage.getItem('cart'))
    } else {
      cart = { items: [], total: 0 }
      store.set(JSON.stringify(cart))
      localStorage.setItem('cart', JSON.stringify(cart))
    }
  }

  async function onLogout() {
    logOutDisabled = true
    loading = 'is-loading'
    const logout = await fetch('/intents/logout', { method: 'GET' })
    const { response } = await logout.json()
    if (response === 'ok') {
      window.location = '/'
    }
  }

  function closeMenu() {
    document.getElementById('navbar').classList.remove('is-active')
    document.getElementById('navbar-burger').classList.remove('is-active')
  }
</script>

<Announcement />

<nav class="navbar sticky">
  <div class="container">
    <div class="navbar-brand">
      <a class="navbar-item" href="/" on:click="{closeMenu}">
        <img alt="Logo" src="/logo.webp" width="112" height="28" />
      </a>
      <a on:click="{closeMenu}" class="navbar-item mobileCart" href="/cart"><span class="icon-basket"> ({cart.total})</span></a>

      <a href="#!" role="button" class="navbar-burger" id="navbar-burger" aria-label="menu" aria-expanded="false" data-target="navbar">
        <span aria-hidden="true"></span>
        <span aria-hidden="true"></span>
        <span aria-hidden="true"></span>
      </a>
    </div>

    <div class="navbar-menu" id="navbar">
      <div class="navbar-start" on:click="{closeMenu}">
        <a href="/" class="navbar-item">Home </a>
        <a href="/about" class="navbar-item">About</a>
      </div>

      <div class="navbar-end" on:click="{closeMenu}">
        {#if $page.url.pathname !== '/thanks'}
          <a class="navbar-item desktopCart" href="/cart"><span class="icon-basket"> ({cart.total})</span></a>

          {#if sessionId}
            <div class="navbar-item">
              <div class="buttons">
                <button disabled="{logOutDisabled}" class="{loading} button is-light" on:click|once="{onLogout}">
                  <strong>Log Out</strong>
                </button>
              </div>
            </div>
          {:else}
            <div class="navbar-item">
              <div class="buttons">
                <a href="/register" class="button is-primary">
                  <strong>Sign up</strong>
                </a>
                <a href="/login" class="button is-light">Sign in </a>
              </div>
            </div>
          {/if}
        {/if}
      </div>
    </div>
  </div>
</nav>
<slot />

<style>
  .mobileCart {
    margin-left: auto;
    display: none;
  }
  .navbar-burger {
    margin: 0;
  }
  @media only screen and (max-width: 768px) {
    .mobileCart {
      display: grid;
    }
    .desktopCart {
      display: none;
    }

    .buttons {
      margin-top: 1rem;
    }
  }

  .sticky {
    position: -webkit-sticky;
    position: sticky;
    top: 0;
  }
</style>
