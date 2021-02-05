import { answer_type, Deck } from './index'

const d = new Deck('robert-cunningham', 'test-deck', 'Test Deck', { version: '0' }, { flavor: 'hello' })

d.addCard('front\n\n test \n \n more front \n yo sup', 'cool back yo', 'asd', { type: answer_type.acknowledge })
d.writeDeck()
