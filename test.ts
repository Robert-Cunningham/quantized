import { initDeck, answer_type } from './index'

const { writeDeck, addCard, ..._ } = initDeck('robert-cunningham', 'test-deck', '0.0.1', 'Test Deck')

addCard('front\n\n test \n \n more front \n yo sup', 'back', 'asd', answer_type.acknowledge)
writeDeck('./test-deck.yaml')