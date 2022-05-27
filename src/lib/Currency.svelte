<script>
  export let amount;
  $: formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "SGD",
  });
  $: renderedAmount = formatter.format(amount);
</script>

{renderedAmount}
