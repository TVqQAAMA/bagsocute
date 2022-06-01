import { parse } from 'cookie'

export async function handle ({ event, resolve }) {
  const cookies = parse(event.request.headers.get('cookie') || '')

  if (cookies.sessionId) {
    event.locals.session = cookies.sessionId
  }

  // console.log('Hook ' + cookies.session_id)
  // console.log('Hook ' + event.locals.session)

  const response = await resolve(event)
  return response
}

export function getSession (event) {
  return event.locals.session
}
