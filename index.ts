import yaml from 'js-yaml'
import fs from 'fs'
import _ from 'lodash'
import { TagManager, Tag, TagDecoration } from './tags'
import { toID } from './utils'
import stringify from 'json-stable-stringify'
import hash from 'object-hash'
import seedrandom from 'seedrandom'
import { compress } from 'brotli'
import objectHash from 'object-hash'
import semver from 'semver'
import { Card, Meta, QuantaID } from './types'

export { Tag, TagDecoration }

export { check } from './check'

const initSourceCard = (data: { source: string }, id: QuantaID, tags: string[]): Card => {
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
    deck_name: string
    namespace: string
    meta: Meta

    constructor(namespace: string, deck_name: string, human_name: string, fileMeta: Meta, deckMeta: TagDecoration) {
        this.tagManager = new TagManager()
        this.cards = []
        this.name = `${namespace}/${deck_name}`
        this.deck_name = deck_name
        this.namespace = namespace

        deckMeta.name = deck_name
        if (deckMeta.visible === undefined) deckMeta.visible = !!fileMeta.ready

        const parentTag = this.tagManager.newDeckTag(this.name, deckMeta)
        this.tagManager.setTag(0, parentTag)

        if (!fileMeta.modified) {
            fileMeta.modified = Date.now() + ''
        }

        this.meta = fileMeta

        if (!semver.valid(this.meta.version)) {
            throw Error(`Version ${this.meta.version} is not a valid semver version.`)
        }
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

    writeDeck() {
        this.checkNoDupes()
        const yamlObj = {
            meta: this.meta,
            tags: this.tagManager.getAllTags(),
            cards: this.cards,
        }
        try {
            fs.mkdirSync('dist')
        } catch {}

        const dumped = yaml.dump(yamlObj) //, { lineWidth: 100000 })
        const compressed = compress(Buffer.from(dumped, 'utf-8'), { mode: 1, quality: 11 })
        const hash = objectHash({ tags: yamlObj.tags, cards: yamlObj.cards })
        fs.writeFileSync(
            `dist/${this.namespace}-${this.deck_name}-v${this.meta.version}-${hash.slice(-4)}.quanta.yaml.br`,
            compressed
        )

        try {
            fs.mkdirSync('debug')
        } catch {}
        try {
            fs.mkdirSync('debug/cards')
        } catch {}

        let out: string[] = []

        this.cards.forEach((c, i) => {
            if ('source' in c) {
                fs.writeFileSync(`debug/cards/${c.id}.html`, c.source)
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
