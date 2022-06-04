<script>
  import { onMount } from 'svelte'
  const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY

  let signUpDisabled = true

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
    window.onloadCaptcha = onloadCaptcha

    const captcha = document.createElement('script')
    captcha.src = '//www.google.com/recaptcha/api.js?onload=onloadCaptcha'
    document.head.append(captcha)
  })

  async function onSubmit() {
    // eslint-disable-next-line no-undef
    grecaptcha.execute()
  }

  async function captchaCallback(token) {
    window.grecaptcha.reset()
  
    loading = 'is-loading'
    signUpDisabled = true
    helpName = ''
    helpEmail = ''
    helpPassword = ''

    const register = await fetch('/intents/register', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ name, email, p })
    })

    const { response } = await register.json()

    switch (response) {
      case 'Exists':
        helpEmail = 'Email already exists'
        loading = ''
        signUpDisabled = false
        break
      case 'Compromised':
        helpPassword = '<a class="underline" href="https://haveibeenpwned.com/Passwords">Insecure password used</a>'
        loading = ''
        signUpDisabled = false
        break
      default:
        window.location = '/'
        break
    }
  }

  function handleCaptchaError() {
    window.location = '/register'
  }

  function resetCaptcha() {
    window.grecaptcha.reset()
  }

  function onloadCaptcha() {
    signUpDisabled = false
  }
</script>

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
              <input disabled="{signUpDisabled}" type="name" class="input" id="name" required bind:value="{name}" />
            </div>
            <p class="help is-danger">{helpName}</p>
          </div>

          <div class="field">
            <label for="email" class="label">Email</label>
            <div class="control">
              <input disabled="{signUpDisabled}" type="email" class="input" id="email" required bind:value="{email}" />
            </div>
            <p class="help is-danger">{helpEmail}</p>
          </div>

          <div class="field">
            <label for="password" class="label">Password</label>
            <div class="control">
              <input disabled="{signUpDisabled}" type="password" class="input" id="password" minlength="1" required bind:value="{p}" />
            </div>
            <p class="help is-danger">{@html helpPassword}</p>
          </div>

          <div class="mt-5 control has-text-centered">
            <button disabled="{signUpDisabled}" class="{loading} button is-dark">Create</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</section>
