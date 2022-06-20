import crypto from 'crypto'
import dotenv from 'dotenv'

dotenv.config()

export function encrypt(s) {
  try {
    const expires = Date.now() + (86400000 * 7)
    const iv = crypto.randomBytes(16)
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(process.env.SK), iv)
    let encrypted = cipher.update(s + '-' + expires)
    encrypted = Buffer.concat([encrypted, cipher.final()])
    const encryptedString = `${iv.toString('hex')}-${encrypted.toString('hex')}`
    return encryptedString
  } catch (e) {
    return false
  }
}

export function decrypt(s) {
  try {
    const textParts = s.split('-')
    const iv = Buffer.from(textParts[0], 'hex')
    const encryptedText = Buffer.from(textParts[1], 'hex')
    const decipher = crypto.createDecipheriv(
      'aes-256-cbc',
      Buffer.from(process.env.SK),
      iv
    )
    let decrypted = decipher.update(encryptedText)
    decrypted = Buffer.concat([decrypted, decipher.final()])
    return decrypted.toString()
  } catch (e) {
    // console.log(e)
    return false
  }
}
