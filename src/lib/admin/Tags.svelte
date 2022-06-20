<script>
    export let tags
    let o = ''
    for (let i = 0; i < tags.length; i += 1) {
      o += `<span class="tag">${tags[i]}</span>`
    }
    </script>
  
  {@html o}
  