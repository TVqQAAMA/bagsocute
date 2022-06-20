import dotenv from 'dotenv'
import { S3Client, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { Upload } from '@aws-sdk/lib-storage'

dotenv.config()

const s3Client = new S3Client({ region: 'ap-southeast-1' })

export async function getContents(Key) {
  const s3Command = new GetObjectCommand({ Bucket: 'bagsocute', Key })
  const s3Response = await s3Client.send(s3Command)
  const fetchResponse = new Response(s3Response.Body)
  const contents = await fetchResponse.json()
  return contents
}

export async function uploadFile(blob, Key) {
  const upload = new Upload({
    client: s3Client,
    params: { Bucket: 'bagsocute', Key, Body: blob }
  })
  await upload.done()
}

export async function deleteFile(Key) {
  try {
    console.log(Key)
    const s3Command = new DeleteObjectCommand({ Bucket: 'bagsocute', Key })
    await s3Client.send(s3Command)
  } catch (e) {
    console.log(e)
  }
}
