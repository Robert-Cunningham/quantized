import yaml from 'js-yaml'
import fs from 'fs'
import _ from 'lodash'
import { TagManager } from './tags'
import { toID } from './utils'
import hash from 'object-hash'

export interface Card {
    front: string,
    back: string,
    id: string,
    tags: string[],
    answer: Answer
}

export interface Meta {
    author?: string | string[],
    version: string,
    modified?: string,
    name?: string,
}

export type QuantaID = string;

export type Answer = { type: answer_type.text_precise, value: string } | { type: answer_type.acknowledge } | { type: answer_type.multiple_choice, options: string[] } | { type: answer_type.trust }

export enum answer_type {
    text_precise = "@general/text/precise",
    acknowledge = "@general/acknowledge",
    multiple_choice = "@general/select",
    trust = "@general/trust"
}

export const initCard = (front: string, back: string, id: string, tags: string[], answer: Answer): Card => {
    return {
        front, back, answer, tags, id
    }
}

export class Deck {
    tagManager: TagManager;
    cards: Card[];
    name: string;
    meta: Meta;

    constructor(namespace: string, deck_name: string, human_name: string, meta: Meta) {
        this.tagManager = new TagManager()
        this.cards = []
        this.name = `${namespace}/${deck_name}`

        this.tagManager.setTag(0, this.tagManager.newDeckTag(name))

        if (!meta.modified) {
            meta.modified = Date.now() + ''
        }

        if (!meta.name) {
            meta.name = human_name
        }

        this.meta = meta;
    }

    addCard(front: string, back: string, id: string, answer: Answer) {
        const card = initCard(front, back, toID(name + id), this.tagManager.getCurrentTagIDs(), answer)
        this.cards.push(card)
    }

    writeDeck(path?: string) {
        fs.writeFileSync(path || 'quanta.yaml', yaml.safeDump({ meta: this.meta, tags: this.tagManager.getAllTags(), cards: this.cards }))
    }

    setTag(level: number, name: string) {
        this.tagManager.makeAndSetTag(level, name)
    }
}

export class Task<T> {
    name: string;

    constructor(name: string) {
        this.name = name
    }

    getID(identifier: T): QuantaID {
        return toID(hash({ task: identifier }))
    }
}