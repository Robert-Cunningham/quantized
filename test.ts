import { Deck } from './index'

const d = new Deck('robert-cunningham', 'test-deck', 'Test Deck', { version: '0' }, { flavor: 'hello' })

d.addSourceCard({ source: 'front\n\n test \n \n more front \n yo sup' }, 'asdf')
d.writeDeck()
