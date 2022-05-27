/* eslint linebreak-style: ["error", "windows"] */
import { serialize } from 'cookie';

// eslint-disable-next-line import/prefer-default-export
export async function get() {
  return {
    status: 200,
    headers: {
      'Set-Cookie': serialize('session_id', false, {
        path: '/',
        expires: new Date(0),
      }),
    },
    body: {
      response: 'ok',
    },
  };
}
