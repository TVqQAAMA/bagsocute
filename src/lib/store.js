import { writable } from 'svelte/store'

const cart = { items: [], total: 0 }

export const store = writable(JSON.stringify(cart))
