export const generateCard = (newCard) => {
    // Card and divs
    let card = document.createElement('div');
    let numTop = document.createElement('div');
    let ellipse = document.createElement('div');
    let numBottom = document.createElement('div');

    //classes for each
    card.classList.add('card', 'card-reverse')
    numTop.classList.add("num", "top")
    ellipse.classList.add("ellipse")
    numBottom.classList.add("num", "bottom")

    card.appendChild(numTop)
    card.appendChild(ellipse)
    card.appendChild(numBottom)

    let spanTop = document.createElement('span');
    let spanEllipse = document.createElement('span');
    let spanBottom = document.createElement('span');

    numTop.appendChild(spanTop)
    ellipse.appendChild(spanEllipse)
    numBottom.appendChild(spanBottom)

    // I use innerHTML because I want to put unicode
    spanTop.innerHTML = newCard.value
    spanEllipse.innerHTML = newCard.value
    spanBottom.innerHTML = newCard.value

    if(newCard.color === "black" && newCard.value === "+4") {
        spanTop.style.webkitTextStroke = "2px white"
        spanEllipse.innerHTML = "🃏"
        spanBottom.style.webkitTextStroke = "2px white"
    }

    card.style.backgroundColor = newCard.color
    spanEllipse.style.color = newCard.color

    return {
        ...createCard(newCard.value, newCard.color),
        cardDOM: card
    }
}

export const cardFactory = () => {
    let cards = []

    //numbers x80
    for(let i = 0; i < 2; i++) {
        for (let i = 0; i < 10; i++) {
            cards.push(generateCard(createCard(i, "red")))
            cards.push(generateCard(createCard(i, "green")))
            cards.push(generateCard(createCard(i, "yellow")))
            cards.push(generateCard(createCard(i, "blue")))
        }
    }

    //skip cards x8
    for(let i = 0; i < 2; i++) {
        cards.push(generateCard(createCard("&#x1F6C7", "red")))
        cards.push(generateCard(createCard("&#x1F6C7", "green")))
        cards.push(generateCard(createCard("&#x1F6C7", "yellow")))
        cards.push(generateCard(createCard("&#x1F6C7", "blue")))
    }

    //reverse cards x8
    for(let i = 0; i < 2; i++) {
        cards.push(generateCard(createCard("&#8644;", "red")))
        cards.push(generateCard(createCard("&#8644;", "green")))
        cards.push(generateCard(createCard("&#8644;", "yellow")))
        cards.push(generateCard(createCard("&#8644;", "blue")))
    }

    //draw 2 cards x8
    for(let i = 0; i < 2; i++) {
        cards.push(generateCard(createCard("+2", "red")))
        cards.push(generateCard(createCard("+2", "green")))
        cards.push(generateCard(createCard("+2", "yellow")))
        cards.push(generateCard(createCard("+2", "blue")))
    }

    //wild cards x4
    for(let i = 0; i < 4; i++) {
        cards.push(generateCard(createCard("🃏", "black")))
    }

    //wild draw 4 cards x4
    for(let i = 0; i < 4; i++) {
        cards.push(generateCard(createCard("+4", "black")))
    }

    return cards
}

export const createCard = (value, color) => {
    return {
        value: value,
        color: color,
    }
}

export const setHand = () => {
    let hand = []
    for(let i = 0; i < 7; i++) {
        const random = Math.floor(Math.random() * DECK.length)
        let number = DECK.splice(random,1)[0]
        hand.push(number)
    }
    return hand
}

export let DECK = cardFactory()