import yaml from 'js-yaml'
import fs from 'fs'
import _ from 'lodash'
import { TagManager } from './tags'
import { toID } from './utils'

export interface Card {
    front: string,
    back: string,
    id: string,
    tags: string[],
    answer: Answer
}

export interface Deck {
    cards: Card[]
}

export interface Meta {
    author?: string | string[],
    version: string,
    modified?: string,
    name?: string,
}

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

export const initDeck = (namespace: string, deck_name: string, human_name: string, meta: Meta) => {
    const name = `${namespace}/${deck_name}`

    const tm = new TagManager()

    tm.setTag(0, tm.newDeckTag(name))

    if (!meta.modified) {
        meta.modified = Date.now() + ''
    }

    if (!meta.name) {
        meta.name = human_name
    }

    const cards: any[] = []

    const addCard = (front: string, back: string, id: string, answer: Answer) => {
        const card = initCard(front, back, toID(name + id), tm.getCurrentTagIDs(), answer)
        cards.push(card)
    }

    const writeDeck = (path?: string) => {
        fs.writeFileSync(path || 'quanta.yaml', yaml.safeDump({ meta, tags: tm.getAllTags(), cards }))
    }

    const setTag = (level: number, name: string) => {
        tm.makeAndSetTag(level, name)
    }

    return { writeDeck, addCard, deckID: name, setTag }
}
