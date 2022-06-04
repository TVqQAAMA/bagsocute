<script>
  import { onMount } from 'svelte'
  const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY

  let submitDisabled = true

  let name
  let email
  let comment
  let helpEmail = ''
  let loading = ''
  let sentStatus = ''

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
    submitDisabled = true
    helpEmail = ''

    const register = await fetch('/intents/contact', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ name, email, comment })
    })

    const { response } = await register.json()
  
    if (response === 'ok') {
      document.getElementById('sendButton').style.display = 'none'
      sentStatus = 'Message sent!'
    }
  }

  function handleCaptchaError() {
    window.location = '/contact'
  }

  function resetCaptcha() {
    window.grecaptcha.reset()
  }

  function onloadCaptcha() {
    submitDisabled = false
  }
</script>

<div class="g-recaptcha" data-sitekey="{RECAPTCHA_SITE_KEY}" data-callback="captchaCallback" data-size="invisible"></div>

<section class="section">
  <div class="container">
    <div class="columns is-centered">
      <div class="column is-half">
        <h1 class="title is-centered">Contact Us</h1>
        <p class="content has-text-justified">If you have a question, please read our FAQ first! If you can't find answers there, we are happy to assist.</p>
        <p class="content has-text-justified">
          If you need recommendations, have a comment or any feedback, feel free to reach out to us using the contact form below. Alternatively, we can be
          contacted through WhatsApp, Instagram or email us directly at info@bagsocute.com
        </p>
        <form on:submit|preventDefault="{onSubmit}">
          <div class="field">
            <label for="name" class="label">Name</label>
            <div class="control">
              <input disabled="{submitDisabled}" type="name" class="input" id="name" required bind:value="{name}" />
            </div>
          </div>

          <div class="field">
            <label for="email" class="label">Email</label>
            <div class="control">
              <input disabled="{submitDisabled}" type="email" class="input" id="email" required bind:value="{email}" />
            </div>
            <p class="help is-danger">{helpEmail}</p>
          </div>

          <div class="field">
            <label for="comment" class="label">Comment</label>
            <textarea disabled="{submitDisabled}" class="textarea" required bind:value="{comment}"></textarea>
          </div>

          <div class="mt-5 control has-text-right">
            <button disabled="{submitDisabled}" class="{loading} button is-dark" id="sendButton">Send</button>
            <p class="help is-info">{sentStatus}</p>
          </div>
        </form>
      </div>
    </div>
  </div>
</section>
