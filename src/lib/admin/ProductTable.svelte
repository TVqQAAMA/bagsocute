<script>
import { onMount } from 'svelte'
import { adminState, selectedProduct, stripeProducts, selectedProductId } from '$lib/functions/store.js'
import Currency from '$lib/components/Currency.svelte'
import Tags from '$lib/admin/Tags.svelte'
import jQuery from 'jquery'

let productTableSection

const base = import.meta.env.VITE_WAREHOUSE_URL + '/products'

async function productSelect(e) {
  const handle = $stripeProducts[e].handle
  const req = await fetch(`${base}/${handle}/product.json`)
  $selectedProduct = await req.json()
  $selectedProduct.handle = handle
  $selectedProductId = $selectedProduct.id
  $adminState = 'editProduct'
}

onMount(async () => {
  if (!window.jQuery) {
    window.jQuery = jQuery
    await import('https://cdn.datatables.net/1.12.1/js/jquery.dataTables.min.js')
    await import('https://cdn.datatables.net/1.12.1/js/dataTables.bulma.min.js')
  }
  window.jQuery('#productTable').DataTable()
  productTableSection.style.display = 'block'
})
</script>

<section class="section" style="display:none" bind:this={productTableSection}>
  <div class="container">
    <div class="buttons">
      <button class="button is-primary"><span class="icon-plus pr-1"></span>Add Product</button>
    </div>
    <table id="productTable" class="table is-fullwidth">
      <thead>
        <tr>
          <th>Name</th>
          <th>Handle</th>
          <th>Quantity</th>
          <th>Price</th>
          <th>Tags</th>
        </tr>
      </thead>
      <tbody>
        {#each Object.entries($stripeProducts) as [key, product]}
          <tr class="tableRow" on:click={() => productSelect(product.id)}>
            <td>{product.title}</td>
            <td>{product.handle}</td>
            <td>{product.qty}</td>
            <td><Currency amount="{product.price}" /></td>
            <td><div class="tags"><Tags tags="{product.tags}" /></div></td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</section>

<style>
  .tableRow {
    cursor: pointer;
  }
</style>

<svelte:head>
  <link rel="stylesheet" href="https://cdn.datatables.net/1.12.1/css/dataTables.bulma.min.css" />
</svelte:head>