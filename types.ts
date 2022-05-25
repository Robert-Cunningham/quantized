import { Tag } from './tags'

export type YamlFormat = {
    meta: Meta
    tags: Record<string, Tag>
    cards: SourceCard[]
}

interface SourceCard {
    source: string
    id: string
    tags: string[]
}

export type Card = SourceCard

export interface Meta {
    version: string
    modified?: string
    ready?: boolean
}

export type QuantaID = string
