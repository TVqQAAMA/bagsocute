<script>
  export let qty;
  let stockText;
  if (qty <= 0) {
    stockText = '<span class="icon-bell-alt"></span> Notify Me';
  } else if (qty <= 2) {
    stockText = '<span class="icon-fire"></span>' + qty + ' Left!';
  } else {
    stockText = '<span class="icon-ok"></span> In Stock';
  }
</script>

{@html stockText}