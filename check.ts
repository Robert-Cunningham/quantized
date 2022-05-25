import glob from 'glob-promise'
import _ from 'lodash'
import semver from 'semver'
import fs from 'fs'
import { decompress } from 'brotli'
import yaml from 'js-yaml'
import { YamlFormat } from './types'
import objectHash from 'object-hash'

export const check = async () => {
    const files = await glob('dist/**.quanta.yaml.br')

    console.log(files)

    const out = files.map((path) => {
        const filename = path.split('/').at(-1)!
        const matched = filename.match(new RegExp(`(?<org>.*?)-(?<deck>.*?)-v(?<version>.*)-(?<hash>.*?).quanta.yaml.br`))

        if (!matched) {
            console.error(`${path} does not match the naming spec.`)
        }

        const { org, deck, version, hash } = matched!.groups as {
            org: string
            deck: string
            version: string
            hash: string
        }

        return { path, org, deck, version, hash }
    })

    const sortedByVersion = _(out)
        .groupBy((o) => o.org + o.deck)
        .values()
        .map((versionsOfOneDeck) => {
            const sorted = versionsOfOneDeck.sort((a, b) => (semver.gt(a.version, b.version) ? 1 : -1))

            if (_.uniqBy(sorted, 'version').length !== sorted.length) {
                throw Error(`Multiple files with same version: \n${sorted.map((s) => s.path).join('\n')}`)
            }

            const current = sorted.at(-1)
            const last = sorted.at(-2)

            const decoder = new TextDecoder('utf-8')

            const currentYaml = yaml.load(decoder.decode(decompress(fs.readFileSync(current?.path!)))) as YamlFormat
            const lastYaml = yaml.load(decoder.decode(decompress(fs.readFileSync(last?.path!)))) as YamlFormat

            const currrentIDs = currentYaml.cards.map((c) => c.id)
            const lastIDs = lastYaml.cards.map((c) => c.id)

            const gained = _.difference(currrentIDs, lastIDs).length
            const lost = _.difference(lastIDs, currrentIDs).length

            const same = _.intersectionBy(currentYaml.cards, lastYaml.cards, (c) => objectHash(c)).length

            const total = currrentIDs.length

            console.log(
                `Moving from ${last?.version} to ${current?.version}.
Gained: ${gained} cards.
Lost: ${lost} cards.
Changed: ${total - same} cards.
Total: ${total} cards.`
            )

            if (lost > 0) {
                console.error(
                    "WARNING: Deleting cards will delete users' scheduling information for those cards. Make sure you're confident in this change."
                )
            }
            if (gained > 0) {
                console.error(
                    'WARNING: New cards have no attached scheduling information and will appear as new for all users (even those who have finished the deck, for example).'
                )
            }
        })
        .value()
}
