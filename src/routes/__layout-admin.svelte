<script>
  import { onMount } from 'svelte'

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
  })

  function closeMenu() {
    document.getElementById('navbar').classList.remove('is-active')
    document.getElementById('navbar-burger').classList.remove('is-active')
  }
</script>

<nav class="navbar sticky">
  <div class="container">
    <div class="navbar-brand">
      <a class="navbar-item" href="/" on:click="{closeMenu}">
        <img alt="Logo" src="/logo.webp" />
      </a>

      <a href="#!" role="button" class="navbar-burger" id="navbar-burger" aria-label="menu" aria-expanded="false" data-target="navbar">
        <span aria-hidden="true"></span>
        <span aria-hidden="true"></span>
        <span aria-hidden="true"></span>
      </a>
    </div>

    <div class="navbar-menu" id="navbar">
      <div class="navbar-start" on:click="{closeMenu}">
        <a href="/" class="navbar-item">Home</a>
      </div>

      <div class="navbar-end" on:click="{closeMenu}">

      </div>
    </div>
  </div>
</nav>
<slot />

<style>
  
  .navbar-burger {
    margin: 0;
  }
  @media only screen and (max-width: 768px) {
    
  }

  .sticky {
    position: -webkit-sticky;
    position: sticky;
    top: 0;
  }

  .navbar-item img {
    max-height: 2.5rem;
  }

  .navbar-burger {
    height: 3.5rem;
    width: 3.5rem;
  }
</style>
