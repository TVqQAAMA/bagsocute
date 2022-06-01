import { serialize } from 'cookie'

export async function get () {
  return {
    status: 200,
    headers: {
      'Set-Cookie': serialize('sessionId', false, {
        path: '/',
        expires: new Date(0)
      })
    },
    body: {
      response: 'ok'
    }
  }
}
