import { initDeck, answer_type } from './index'

const { writeDeck, addCard, ..._ } = initDeck('robert-cunningham', 'test-deck', 'Test Deck', { version: '0' })

addCard('front\n\n test \n \n more front \n yo sup', 'cool back yo', 'asd', { type: answer_type.acknowledge })
writeDeck()
