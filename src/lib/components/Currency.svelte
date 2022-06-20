<script>
  export let amount
  $: amount /= 100
  $: formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'sgd'
  })
  $: renderedAmount = formatter.format(amount)
</script>

{renderedAmount}
