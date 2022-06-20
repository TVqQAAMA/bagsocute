import { writable } from 'svelte/store'

const cart = { items: [], total: 0 }

export const store = writable(JSON.stringify(cart))

export const selectedProductId = writable(false)
export const stripeProducts = writable('')
export const selectedProduct = writable({ images: [] })
export const adminState = writable('')
