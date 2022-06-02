<script>
  import { onMount } from 'svelte'
  const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY

  let signUpDisabled = false

  let name
  let email
  let p
  let helpName = ''
  let helpEmail = ''
  let helpPassword = ''
  let loading = ''

  onMount(() => {
    window.captchaCallback = captchaCallback
    window.handleCaptchaError = handleCaptchaError
    window.resetCaptcha = resetCaptcha
  })

  async function onSubmit() {
    loading = 'is-loading'
    signUpDisabled = true
    // eslint-disable-next-line no-undef
    grecaptcha.execute()
  }

  async function captchaCallback(token) {
    helpName = ''
    helpEmail = ''
    helpPassword = ''

    const register = await fetch('/intents/register', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ name, email, p })
    })

    const { response } = await register.json()

    if (response !== 'Exists') {
      window.location = '/'
    } else {
      helpEmail = 'Email already exists'
      loading = ''
    }
  }

  function handleCaptchaError() {
    window.location = '/login'
  }

  function resetCaptcha() {
    window.grecaptcha.reset()
  }
</script>

<svelte:head>
  <script src="//www.google.com/recaptcha/api.js"></script>
</svelte:head>

<div class="g-recaptcha" data-sitekey="{RECAPTCHA_SITE_KEY}" data-callback="captchaCallback" data-size="invisible"></div>

<section class="section">
  <div class="container">
    <div class="columns is-centered">
      <div class="column is-half">
        <h1 class="title is-centered has-text-centered">Create account</h1>
        <form on:submit|preventDefault="{onSubmit}">
          <div class="field">
            <label for="name" class="label">Name</label>
            <div class="control">
              <input type="name" class="input" id="name" required bind:value="{name}" />
            </div>
            <p class="help is-danger">{helpName}</p>
          </div>

          <div class="field">
            <label for="email" class="label">Email</label>
            <div class="control">
              <input type="email" class="input" id="email" required bind:value="{email}" />
            </div>
            <p class="help is-danger">{helpEmail}</p>
          </div>

          <div class="field">
            <label for="password" class="label">Password</label>
            <div class="control">
              <input type="password" class="input" id="password" minlength="1" required bind:value="{p}" />
            </div>
            <p class="help is-danger">{helpPassword}</p>
          </div>

          <div class="mt-5 control has-text-centered">
            <button disabled="{signUpDisabled}" class="{loading} button is-dark">Create</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</section>
