
<script context="module">
    import { GetObjectCommand } from '@aws-sdk/client-s3'
    import { s3Client } from '$lib/s3.js'

    export async function load ({ fetch }) {
      const params = {
        Bucket: 'bagsocute',
        Key: 'index.json'
      }

      const command = new GetObjectCommand(params)
      const s3response = await s3Client.send(command)
      const response = new Response(s3response.Body)
      const data = await response.json()
      console.log(data)
      return {
        props: {
          products: data
        },
        cache: {
          maxage: 1
        }
      }
    }
</script>

<script>
    export let products
</script>

{products}