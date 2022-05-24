import _ from 'lodash'
import { toID } from './utils'

type TagID = string

type TagLevel = number

export interface Tag {
    id: string
    parent: string | null
    meta: TagDecoration
}

export interface TagDecoration {
    visible?: boolean
    standalone?: boolean
    name?: string
    title?: string
    description?: string
    flavor?: string
    image?: string
    price?: number
    faq?: { question: string; answer: string }[]
    changelog?: { date: string; info: string; version: string }[]

    author?: string
    externalURL?: string
    permissions?: string
}

const NO_PARENT = ''

export class TagManager {
    currentTags: Partial<Record<TagLevel, TagID>> = {} // #: asdf, ##: ldjkflasjkdfl
    tagsDb: Record<TagID, Tag> = {}

    constructor() {}

    getCurrentTagIDs(): TagID[] {
        //const sorted: [TagLevel, TagID][] = _.sortBy(_.values(this.currentTags), )
        //return sorted
        //.map(([_, id]: [TagLevel, TagID]) => id)
        return _.values(this.currentTags).filter((x) => x) as string[]
    }

    getAllTags(): Record<TagID, Tag> {
        return this.tagsDb
    }

    setTag(level: TagLevel, tag: Tag) {
        this.clearThroughLevel(level)
        this.currentTags[level] = tag.id
        this.tagsDb[tag.id] = tag
    }

    clearThroughLevel(level: TagLevel) {
        let levels: TagLevel[] = Object.keys(this.currentTags).map((x) => parseInt(x))
        levels
            .filter((x: TagLevel) => x >= level)
            .forEach((levelToClear) => {
                delete this.currentTags[levelToClear]
            })
    }

    newTag(id: string, level: TagLevel, name: string): Tag {
        const parentList = this.getCurrentTagIDs()

        const out = {
            id: id,
            //parents: parentList,
            //level: level,
            parent: _.last(parentList) || NO_PARENT,
            meta: {
                name,
            },
        }

        return out
    }

    makeAndSetTag(level: TagLevel, name: string): void {
        this.clearThroughLevel(level)
        const t = this.newTag(toID(name), level, name)
        this.setTag(level, t)
    }

    newDeckTag(deck_name: string, meta: TagDecoration): Tag {
        const allTag = {
            id: toID(deck_name + 'parent_tag'),
            parent: null,
            meta: {
                ...meta,
                standalone: true,
            },
        }

        this.tagsDb[allTag.id] = allTag

        return allTag
    }
}
