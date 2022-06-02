<script>
  import { page } from '$app/stores'
  import { onMount } from 'svelte'

  let email
  let password
  let signInDisabled = true
  let loading = ''

  const gotoCart = $page.url.searchParams.has('cart')
  const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY

  onMount(() => {
    window.captchaCallback = captchaCallback
    window.handleCaptchaError = handleCaptchaError
    window.resetCaptcha = resetCaptcha
    window.onloadCaptcha = onloadCaptcha
  })

  async function onSubmit() {
    // eslint-disable-next-line no-undef
    grecaptcha.execute()
  }

  async function captchaCallback(token) {
    signInDisabled = true
    loading = 'is-loading'
    console.log(JSON.stringify({ u: email, p: password }))
    const login = await fetch('/intents/login', {
      method: 'POST',
      body: JSON.stringify({ u: email, p: password }),
      headers: {
        'Content-Type': 'application/json'
      }
    })

    const { response } = await login.json()

    if (response === 'ok') {
      if (gotoCart) {
        window.location = '/cart'
      } else {
        window.location = '/'
      }
    }
  }

  function handleCaptchaError() {
    window.location = '/login'
  }

  function resetCaptcha() {
    window.grecaptcha.reset()
  }

  function onloadCaptcha() {
    signInDisabled = false
  }
</script>

<svelte:head>
  <script src="//www.google.com/recaptcha/api.js?onload=onloadCaptcha" async defer></script>
</svelte:head>

<div class="g-recaptcha" data-sitekey="{RECAPTCHA_SITE_KEY}" data-callback="captchaCallback" data-size="invisible"></div>

<section class="section">
  <div class="container">
    <div class="columns is-centered">
      <div class="column is-half">
        <h1 class="title is-centered has-text-centered">Login</h1>
        <form id="loginForm" on:submit|preventDefault="{onSubmit}">
          <div class="field">
            <label for="email" class="label">Email</label>
            <div class="control">
              <input type="email" class="input" id="email" required bind:value="{email}" />
            </div>
          </div>
          <div class="field">
            <label for="password" class="label">Password</label>
            <div class="control">
              <input type="password" class="input" id="password" required bind:value="{password}" />
            </div>
          </div>
          <a class="help is-info" href="/">Forgot your password?</a>
          <div class="mt-5 control has-text-centered">
            <button disabled="{signInDisabled}" class="{loading} button is-dark">Sign in</button>
          </div>
          <div class="block has-text-centered mt-3">
            <a class="help is-info" href="/register">Create account</a>
          </div>
        </form>
      </div>
    </div>
  </div>
</section>
