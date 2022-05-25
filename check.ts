import glob from 'glob-promise'
import _ from 'lodash'
import semver from 'semver'
import fs from 'fs'
import { decompress } from 'brotli'
import yaml from 'js-yaml'
import { YamlFormat } from './types'

export const check = async () => {
    const files = await glob('dist/**.quanta.yaml.br')

    const out = files.map((path) => {
        const filename = path.split('/').at(-1)!
        const matched = filename.match(new RegExp(`(?<org>.*)-(?<deck>.*)-v(?<version>.*)-(?<hash>.*).quanta.yaml.br`))

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

            const current = sorted.at(-1)?.path!
            const last = sorted.at(-2)?.path!

            const currentYaml = yaml.load(decompress(Buffer.from(fs.readFileSync(current, 'utf-8'))).toString()) as YamlFormat
            const lastYaml = yaml.load(decompress(Buffer.from(fs.readFileSync(last, 'utf-8'))).toString()) as YamlFormat

            const currrentIDs = currentYaml.cards.map((c) => c.id)
            const lastIDs = lastYaml.cards.map((c) => c.id)

            const gained = _.difference(currrentIDs, lastIDs).length
            const lost = _.difference(lastIDs, currrentIDs).length

            console.log(`Gained ${gained} and lost ${lost}.`)
            //const dumped = yaml.dump(yamlObj, { lineWidth: 100000 })
            //const compressed = compress(Buffer.from(dumped), { mode: 1, quality: 11 })
        })
        .value()

    console.log(sortedByVersion)
}
