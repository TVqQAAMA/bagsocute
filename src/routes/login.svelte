<script>
  let email;
  let password;
  let signInDisabled = false;
  let loading = '';

  import { page } from '$app/stores';
    
  const gotoCart = $page.url.searchParams.has('cart');

  async function onSubmit() {
    signInDisabled = true;
    loading = 'is-loading'

    const login = await fetch('/intents/login', {
      method: 'POST',
      body: JSON.stringify({ u: email, p: password }),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const { response } = await login.json();

    console.log(response);

    if (response == 'ok') {
      if (gotoCart) {
        window.location = "/cart";
      }
      else {
        window.location = '/';
      }
      
    }
  }
</script>

<section class="section">
  <div class="container">
    <div class="columns is-centered">
      <div class="column is-half">
        <h1 class="title is-centered has-text-centered">Login</h1>
        <form on:submit|preventDefault={onSubmit}>
          <div class="field">
            <label for="email" class="label">Email</label>
            <div class="control">
              <input
                type="email"
                class="input"
                id="email"
                required
                bind:value={email}
              />
            </div>
          </div>
          <div class="field">
            <label for="password" class="label">Password</label>
            <div class="control">
              <input
                type="password"
                class="input"
                id="password"
                required
                bind:value={password}
              />
            </div>
          </div>
          <a class="help is-info" href="/">Forgot your password?</a>
          <div class="mt-5 control has-text-centered">
            <button disabled={signInDisabled} class="{loading} button is-dark"
              >Sign in</button
            >
          </div>
          <div class="block has-text-centered mt-3">
            <a class="help is-info" href="/register">Create account</a>
          </div>
        </form>
      </div>
    </div>
  </div>
</section>

<style>
</style>
