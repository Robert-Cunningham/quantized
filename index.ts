import yaml from 'js-yaml'
import fs from 'fs'
import _ from 'lodash'
import { TagManager, Tag, TagDecoration } from './tags'
import { toID } from './utils'
import { trust, writeCardToDisk } from './answers'
import { standardFormat, trustAnswerBack, trustAnswerFront } from './formatting'
import { standardTrustCard, makeCardFromTemplateHTML, standardIntroCard } from './templates'
import stringify from 'json-stable-stringify'
import hash from 'object-hash'

export {
    Tag,
    trust,
    writeCardToDisk,
    TagDecoration,
    standardFormat,
    trustAnswerBack,
    trustAnswerFront,
    standardTrustCard,
    standardIntroCard,
    makeCardFromTemplateHTML,
}
export interface OGCard {
    front: string
    back: string
    id: string
    tags: string[]
    answer: Answer
}

export interface SourceCard {
    source: string
    id: string
    tags: string[]
}

export type Card = SourceCard | OGCard

export interface Meta {
    author?: string | string[]
    version: string
    modified?: string
    name?: string
    description?: string
    image?: string
    ready?: boolean
}

export type QuantaID = string

export type Answer =
    | { type: answer_type.text_precise; value: string }
    | { type: answer_type.acknowledge }
    | { type: answer_type.multiple_choice; options: string[] }
    | { type: answer_type.trust }

export enum answer_type {
    text_precise = '@general/text/precise',
    acknowledge = '@general/acknowledge',
    multiple_choice = '@general/select',
    trust = '@general/trust',
}

export const initCard = (front: string, back: string, id: QuantaID, tags: string[], answer: Answer): Card => {
    return {
        front,
        back,
        answer,
        tags,
        id,
    }
}

export const initSourceCard = (data: { source: string; front?: string; back?: string }, id: QuantaID, tags: string[]): Card => {
    return {
        source: data.source,
        front: data.front,
        back: data.back,
        tags,
        id,
    }
}

export class Deck {
    tagManager: TagManager
    cards: Card[]
    name: string
    meta: Meta

    constructor(namespace: string, deck_name: string, human_name: string, meta: Meta, decoration: TagDecoration) {
        this.tagManager = new TagManager()
        this.cards = []
        this.name = `${namespace}/${deck_name}`

        const parentTag = this.tagManager.newDeckTag(this.name)
        parentTag.visible = !!meta.ready
        this.tagManager.setTag(0, { ...parentTag, ...decoration })

        if (!meta.modified) {
            meta.modified = Date.now() + ''
        }

        if (!meta.name) {
            meta.name = human_name
        }

        this.meta = meta
    }

    addCard(front: string, back: string, id: QuantaID, answer: Answer) {
        const card = initCard(front, back, id, this.tagManager.getCurrentTagIDs(), answer)
        this.cards.push(card)
    }

    addSourceCard(data: { source: string; front?: string; back?: string }, id: QuantaID) {
        const card = initSourceCard(data, id, this.tagManager.getCurrentTagIDs())
        this.cards.push(card)
    }

    checkNoDupes() {
        if (_.uniqBy(this.cards, (x: Card) => x.id).length !== this.cards.length) {
            console.log("There's a duplicate ID!")
            throw 'wtf'
        }
    }

    writeDeck(path?: string) {
        this.checkNoDupes()
        const yamlObj = {
            meta: this.meta,
            tags: this.tagManager.getAllTags(),
            cards: this.cards,
        }
        /*
        if (JSON.stringify(yamlObj).toLowerCase().includes('undefined')) {
            console.error('Some part of yaml is undefined.')
            console.log(JSON.stringify(yamlObj, null, 2))
        }
        */
        fs.writeFileSync(path || 'quanta.yaml', yaml.safeDump(yamlObj, { lineWidth: 100000 }))

        try {
            fs.mkdirSync('cards')
        } catch {}

        let out: string[] = []

        this.cards.forEach((c, i) => {
            if ('source' in c) {
                //fs.writeFileSync(`cards/${(i + '').padStart(4, '0')}-${c.id}.html`, c.source)
                fs.writeFileSync(`cards/${c.id}.html`, c.source)
                out.push(`<iframe width="800px" height="800px" src="cards/${(i + '').padStart(4, '0')}-${c.id}.html"></iframe>`)
            }
        })
        fs.writeFileSync('all.html', out.join('\n'))
    }

    setTag(level: number, name: string) {
        this.tagManager.makeAndSetTag(level, name)
    }

    writeDemo() {
        //@ts-ignore
        fs.writeFileSync('demo1.html', _.sample(this.cards).source)
        //@ts-ignore
        fs.writeFileSync('demo2.html', _.sample(this.cards).source)
        //@ts-ignore
        fs.writeFileSync('demo3.html', _.sample(this.cards).source)
    }
}

/*
export class DeckBuilder {
    authors: string[] | undefined = undefined
    modified: string | undefined = undefined
    version: string | undefined = undefined

    constructor() {}

    setAuthors(authors: string[]) {
        this.authors = authors
    }

    build(): Deck {
        return new Deck()
    }
}
*/
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
