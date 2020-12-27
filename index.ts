import crypto from 'crypto'
import yaml from 'js-yaml'
import fs from 'fs'

interface Card {
    front: string,
    back: string,
    id: string,
    tags: string[],
    answer_type: answer_type
}

export enum answer_type {
    text_precise = "@text/precise",
    acknowledge = "@general/acknowledge",
    multiple_choice = "@general/select"
}

export const toID = (s: string) => {
    return crypto.createHash('sha256').update(s).digest('hex').substr(0, 16)
}

export const initCard = (front: string, back: string, id: string, tags: string[], answer_type: answer_type): Card => {
    return {
        front, back, id, tags, answer_type
    }
}

export const initDeck = (namespace: string, deck_name: string, version: string, human_name: string) => {
    const name = `${namespace}/${deck_name}`

    const allTag = {
        id: toID(name),
        title: human_name,
        topLevelDisplay: true
    }

    const tags = [allTag]

    const cards: any[] = []

    const addCard = (front: string, back: string, id: string, answer_type: answer_type) => {
        const card = initCard(front, back, toID(name + id), [allTag.id], answer_type)
        cards.push(card)
    }

    const writeDeck = (path: string) => {
        fs.writeFileSync(path, yaml.safeDump({ tags, cards }))
    }

    return { writeDeck, addCard, deckID: name }
}