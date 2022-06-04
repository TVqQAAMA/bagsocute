/* eslint-disable dot-notation */
import dotenv from 'dotenv'
import Stripe from 'stripe'
import sgMail from '@sendgrid/mail'

dotenv.config()

const stripe = new Stripe(process.env['STRIPE_SECRET_KEY'])
const lineItems = []
const checkout = {}

async function emailCustomer() {
  let lineItemsBody = ''

  const customer = await stripe.customers.retrieve(checkout.details.customer)
  const nextInvoiceSequence = parseInt(customer.next_invoice_sequence, 10) + 1
  await stripe.customers.update(checkout.details.customer,
    { next_invoice_sequence: nextInvoiceSequence }
  )
  checkout.invoice = customer.invoice_prefix + '-' + nextInvoiceSequence

  for (let i = 0; i < lineItems.length; i += 1) {
    const amount = lineItems[i].amount_total / 100
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: checkout.details.currency
    })
    const renderedAmount = formatter.format(amount)
    lineItemsBody += `
      <tr>
        <td>${lineItems[i].description}</td>
        <td>${lineItems[i].quantity}</td>
        <td>${renderedAmount}</td>
      </tr>
    `
  }

  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: checkout.details.currency
  })
  const grandTotal = formatter.format(checkout.details.amount_total / 100)

  const emailBody = `
    <h3>Thank you for your purchase!</h3>
    <p>We're getting your order ready to be shipped. We will notify you when it has been sent.</p>
    <h3>Order Summary</h3>
    <table style='border-spacing: 20px; text-align:left;'>
      <tr>
        <th>Product</th>
        <th>Quantity</th>
        <th>Subtotal</th>
      </tr>
      ${lineItemsBody}
      <tr><td><strong>Total ${grandTotal}</strong></td></tr>
    </table>
    <h3>Shipping Details</h3>
    <table style='border-spacing: 20px;>
      <tbody style='vertical-align: top;'>
        <tr>
          <td>
            <h4>Shipping Address</h4>
            <p>${checkout.details.shipping.name}</p>
            <p>${checkout.details.shipping.address.line1}<br>
            ${checkout.details.shipping.address.line2}<br>
            ${checkout.details.shipping.address.postal_code}<br>
            ${checkout.details.shipping.address.state}, ${checkout.details.shipping.address.city}<br>
            ${checkout.details.shipping.address.country}
            </p>
          </td>
          <td>
            <h4>Billing Address</h4>
            <p>${checkout.details.customer_details.name} ${checkout.details.customer_details.phone}
            </p>
            <p>${checkout.details.customer_details.address.line1}<br>
            ${checkout.details.customer_details.address.line2}<br>
            ${checkout.details.customer_details.address.postal_code}<br>
            ${checkout.details.customer_details.address.state}, ${checkout.details.customer_details.address.city}<br>
            ${checkout.details.customer_details.address.country}
            </p>
          </td>
        </tr>
      </tbody>
    </table>
    <hr>
    <p>If you have any questions, reply to this email or contact us at info@bagsocute.com</p>
  `

  sgMail.setApiKey(process.env['SENDGRID'])

  const msg = {
    to: checkout.details.customer_details.email,
    from: 'Bag So Cute! <info@bagsocute.com>',
    subject: 'Order ' + checkout.invoice + ' confirmed',
    html: emailBody
  }

  await sgMail.send(msg)
}

async function getLineItems(checkoutSession, v) {
  let req

  if (!v) {
    req = stripe.checkout.sessions.listLineItems(
      checkoutSession,
      { limit: 100 }
    )
  } else {
    req = stripe.checkout.sessions.listLineItems(
      checkoutSession,
      { limit: 100, starting_after: v }
    )
  }

  const res = await req

  for (let i = 0; i < res.data.length; i += 1) {
    lineItems.push(res.data[i])
  }

  if (res.has_more) {
    getLineItems(checkoutSession, res.data[res.data.length - 1].id)
  } else {
    console.dir(lineItems)
    const o = {}

    let promises = []
    for (let i = 0; i < lineItems.length; i += 1) {
      promises.push(stripe.products.retrieve(lineItems[i].price.product))
      o[lineItems[i].price.product] = { qtyToRemove: lineItems[i].quantity, currentQty: '' }
    }

    const productList = await Promise.all(promises)
    console.dir(productList)

    for (let i = 0; i < productList.length; i += 1) {
      o[productList[i].id].currentQty = parseInt(productList[i].metadata.qty, 10)
    }

    console.dir(o)

    promises = []
    Object.keys(o).forEach((key) => {
      const newQty = o[key].currentQty - o[key].qtyToRemove
      promises.push(stripe.products.update(key, { metadata: { qty: newQty } }))
    })

    await Promise.all(promises)

    await emailCustomer()
  }
}

export async function post({ request, response }) {
  try {
    return {
      status: 200
    }
  } finally {
    const v = await request.json()
    // console.dir(v)
    // console.dir(v.data.object.customer_details)
    checkout.details = v.data.object
    await getLineItems(v.data.object.id, false)
  }
}
