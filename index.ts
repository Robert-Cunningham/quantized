import yaml from 'js-yaml'
import fs from 'fs'
import _ from 'lodash'
import { TagManager, Tag, TagDecoration } from './tags'
import { toID } from './utils'
import stringify from 'json-stable-stringify'
import hash from 'object-hash'
import seedrandom from 'seedrandom'

export { Tag, TagDecoration }

export interface SourceCard {
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

export const initSourceCard = (data: { source: string }, id: QuantaID, tags: string[]): Card => {
    return {
        source: data.source,
        tags,
        id,
    }
}

export class Deck {
    tagManager: TagManager
    cards: Card[]
    name: string
    meta: Meta

    constructor(namespace: string, deck_name: string, human_name: string, fileMeta: Meta, deckMeta: TagDecoration) {
        this.tagManager = new TagManager()
        this.cards = []
        this.name = `${namespace}/${deck_name}`

        deckMeta.name = deck_name
        if (deckMeta.visible === undefined) deckMeta.visible = !!fileMeta.ready

        const parentTag = this.tagManager.newDeckTag(this.name, deckMeta)
        this.tagManager.setTag(0, parentTag)

        if (!fileMeta.modified) {
            fileMeta.modified = Date.now() + ''
        }

        this.meta = fileMeta
    }

    addSourceCard(data: { source: string }, id: QuantaID) {
        const card = initSourceCard(data, id, this.tagManager.getCurrentTagIDs())
        this.cards.push(card)
    }

    checkNoDupes() {
        const ids = new Set()
        for (const card of this.cards) {
            if (ids.has(card.id)) {
                throw new Error(`Id: ${card.id} was a duplicate`)
            } else {
                ids.add(card.id)
            }
        }
    }

    writeDeck(path?: string) {
        this.checkNoDupes()
        const yamlObj = {
            meta: this.meta,
            tags: this.tagManager.getAllTags(),
            cards: this.cards,
        }
        try {
            fs.mkdirSync('dist')
        } catch {}

        fs.writeFileSync(path || 'dist/quanta.yaml', yaml.dump(yamlObj, { lineWidth: 100000 }))

        try {
            fs.mkdirSync('dist/cards')
        } catch {}

        let out: string[] = []

        this.cards.forEach((c, i) => {
            if ('source' in c) {
                fs.writeFileSync(`dist/cards/${c.id}.html`, c.source)
                out.push(`<iframe width="800px" height="800px" src="cards/${(i + '').padStart(4, '0')}-${c.id}.html"></iframe>`)
            }
        })
    }

    setTag(level: number, name: string) {
        this.tagManager.makeAndSetTag(level, name)
    }

    writeDemo() {
        fs.writeFileSync('demo1.html', _.sample(this.cards)!.source)
        fs.writeFileSync('demo2.html', _.sample(this.cards)!.source)
        fs.writeFileSync('demo3.html', _.sample(this.cards)!.source)
    }
}

export class Task<T> {
    name: string

    constructor(name: string) {
        this.name = name
    }

    getID(identifier: T): QuantaID {
        const obj = { task: this.name, instance: identifier }
        const str = stringify(obj, (a, b): number => (a.key > b.key ? 1 : -1))
        return toID(str)
    }

    getOldID(identifier: T): QuantaID {
        return toID(hash({ task: this.name, instance: identifier }))
    }
}

export const setRNGFromQuanta = (id: QuantaID) => {
    seedrandom(id, { global: true })
}
