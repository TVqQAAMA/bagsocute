<script>
  import { onMount } from 'svelte'

  let email
  let forgotDisabled = true
  let loading = ''
  const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY

  onMount(() => {
    window.captchaCallback = captchaCallback
    window.handleCaptchaError = handleCaptchaError
    window.resetCaptcha = resetCaptcha
    window.onloadCaptcha = onloadCaptcha
  })

  function onSubmit() {
    // eslint-disable-next-line no-undef
    grecaptcha.execute()
  }

  async function captchaCallback(token) {
    window.grecaptcha.reset()

    forgotDisabled = true
    loading = 'is-loading'

    /* const login = await fetch('/intents/login', {
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
    } */
  }

  function handleCaptchaError() {
    window.location = '/forgot'
  }

  function resetCaptcha() {
    window.grecaptcha.reset()
  }

  function onloadCaptcha() {
    forgotDisabled = false
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
        <h1 class="title is-centered has-text-centered">Reset your password</h1>
        <h3 class="is-centered has-text-centered mb-6">We will send you an email to reset your password</h3>
        <form id="loginForm" on:submit|preventDefault="{onSubmit}">
          <div class="field">
            <div class="control">
              <input type="email" placeholder="Email" class="input" id="email" required bind:value="{email}" />
            </div>
          </div>
          <div class="mt-6 control has-text-centered">
            <button disabled="{forgotDisabled}" class="{loading} button is-dark">Submit</button>
          </div>
          <div class="block has-text-centered mt-3">
            <a class="help is-info" href="/login">Cancel</a>
          </div>
        </form>
      </div>
    </div>
  </div>
</section>
