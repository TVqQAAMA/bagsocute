<script>
import { onMount } from 'svelte'

let magiclink
let email
let isLoading = ''
let helpText = ''
let sendButton
let isDisabled = false

async function sendMagicLink() {
  isLoading = 'is-loading'
  isDisabled = true
  const req = await fetch('/intents/magiclink', {
    method: 'POST',
    body: JSON.stringify({
      email
    })
  })
  const res = await req.json()
  if (res.response === 'done') {
    isLoading = ''
    sendButton.style.display = 'none'
    helpText = 'If authorized, a magic link will be sent to your inbox.'
  }
}

onMount(async () => {
  magiclink.style.display = 'block'
})
</script>

<section class="section" bind:this={magiclink} style="display:none">
  <div class="container">
    <div class="columns is-centered">
      <div class="column is-half">
        <form on:submit|preventDefault="{sendMagicLink}">
        <input disabled={isDisabled} type="text" placeholder="Email" class="input" bind:value="{email}" required /> 
        <p class="has-text-centered help is-dark">{helpText}</p>       
        <div class="block has-text-centered mt-5">
          <button bind:this={sendButton} class="{isLoading} button is-primary"><span class="icon-magic pr-1"></span>Send Magic Link</button>
        </div>
      </form>
      </div>
    </div>
  </div>
</section>

