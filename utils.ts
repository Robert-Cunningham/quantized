import crypto from 'crypto'

export const toID = (s: string) => {
    return crypto.createHash('sha256').update(s).digest('hex').substr(0, 16)
}