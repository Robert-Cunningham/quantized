import crypto from 'crypto'
import { QuantaID } from './types'

export const toID = (s: string): QuantaID => {
    return crypto.createHash('sha256').update(s).digest('hex').substr(0, 16)
}
