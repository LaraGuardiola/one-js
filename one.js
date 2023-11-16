import { showModal, hideModal } from "./utils.js"
import { setHand, deck } from "./cards.js"

let players = [setHand(), setHand()]
let [player1, player2] = players

console.log(player1)

const topHand = document.querySelector('.top-hand')
const bottomHand = document.querySelector('.bottom-hand')
const hands = [bottomHand, topHand]
const pile = document.querySelector('.pile')
const colors = document.querySelectorAll(".color")
const selectedColor = document.querySelector(".selected-color")
const summation = document.querySelector(".summation")
const summationInt = summation.children[1]
const startBtn = document.querySelector(".start")
const nextBtn = document.querySelector(".finalize")

let dragged
let cardInPlay
let historical = []
let cardCounter = 0

const setStart = () => {
    let card = setRandomPileStarter()
    setDrawingAnimation(card)

    historical.push(card)
    cardInPlay = card
    deck.splice(deck.indexOf(card), 1)[0]
    selectedColor.style.backgroundColor = card.color
    console.log(deck)
}
const setRandomPileStarter = () => {
    const random = Math.floor(Math.random() * deck.filter(card => card.color !== "black").length)

    let card = deck
        .filter(card => card.color !== "black")
        .splice(random, 1)[0]

    pile.appendChild(card.cardDOM)

    return card
}
const setDraggableCards = () => {
    hands.forEach(hand => {
        if(hand.classList.contains("active-hand")) {
            hand.childNodes.forEach(card => {
                card.draggable = true
            })
        }else {
            hand.childNodes.forEach(card => {
                card.draggable = false
            })
        }
    })
}
const setSelectedColor = () => {
    colors.forEach(color => {
        color.addEventListener("click", () => {
            let newColor
            console.log(color.className.split(" ")[1])
            newColor = color.className.split(" ")[1]
            hideModal()
            historical.at(-1).color = newColor
            selectedColor.style.backgroundColor = newColor
        })
    })
}

const setButtons = () => {
    startBtn.style.display = "none"
    setStarterActiveHand()
    setDraggableCards()

    //button events and layout
    nextBtn.style.display = "flex"
    nextBtn.addEventListener("click", setActiveHand)
}

const setStarterActiveHand = () => {
    let random = Math.floor(Math.random() * 2)
    random === 0 ? bottomHand.classList.add("active-hand") : topHand.classList.add("active-hand")
}

const setActiveHand = () => {
    cleanUpPlusCards()
    handleDrawEvent()
    addActiveHandClass()
    setDraggableCards()
    drawCardsIfNeeded()

    cardCounter = 0
    console.log("deck after turn: ", deck)
}

const handleDrawEvent = () => {
    if(cardCounter === 0) {
        if(cardInPlay.value === "&#x1F6C7" || cardInPlay.value === "&#8644;") {}
        else drawCard()
    }
}
const cleanUpPlusCards = () => {
    players.forEach(player => {
        player.forEach(card => {
            card.cardDOM.classList.remove("plus-card")
        })
    })
}

const addActiveHandClass = () => {
    hands.forEach(hand => {
        if(hand.classList.contains("active-hand")) {
            hand.classList.remove("active-hand")
        }else {
            hand.classList.add("active-hand")
        }
    })
}

//handles if there is a sum pending
const drawCardsIfNeeded = () => {
    if(parseInt(summationInt.innerHTML) > 0) {
   
        players[getActiveHand()].forEach(card => {
            if(
                card.value.toString() === "+4" 
                || cardInPlay.value.toString() === "+2" && card.value.toString() === "+2"
                || cardInPlay.value.toString() === "+4" && card.color.toString() === cardInPlay.color.toString() && card.value.toString().includes("+")
                ){
                card.cardDOM.classList.add("plus-card")
            }
        })

        if(document.querySelectorAll(".plus-card").length === 0) {
            setDrawInterval(drawCard, 200, parseInt(summationInt.innerHTML))
            summationInt.innerHTML = "0"
        }
    }
}

function setDrawInterval(callback, interval, times) {
    let counter = 0;
    const intervalID = setInterval(() => {
        callback();
        counter++;
        if (counter === times) {
            clearInterval(intervalID);
        }
    }, interval);
}

const setDrawingAnimation = (card) => {
    //sets the drawing animation
    card.cardDOM.draggable = true
    card.cardDOM.style.backgroundColor = "black"
    card.cardDOM.children[1].firstChild.style.color = "yellow"
    card.cardDOM.children[1].firstChild.innerHTML = "one!"

    setTimeout(() => {
        card.cardDOM.classList.remove("card-reverse")
        card.cardDOM.style.backgroundColor = card.color
        card.cardDOM.children[1].firstChild.style.color = card.color
        card.cardDOM.children[1].firstChild.innerHTML = card.value

        if (card.color === "black" && card.value === "+4") {
            card.cardDOM.children[1].firstChild.innerHTML = "🃏"
        }
    }, 500)
}

const onDragStart = (event, card) => {
    if(event.target.classList.contains("plus-card")) {
        event.target.classList.remove("plus-card")
    }
    event.target.style.opacity = '0.7'
    event.target.style.borderRadius = '10px'
    event.target.style.boxShadow = '5px 5px 5px #888'
    event.dataTransfer.setData("application/json", JSON.stringify(card))
    dragged = event.target
}

const onDragEnd = (event) => {
    event.target.style.opacity = ''
    event.target.style.borderRadius = ''
    event.target.style.boxShadow = ''
}
const onDragOver = (event) => {
    event.preventDefault()
    if(startBtn.style.display === 'none') {
        pile.classList.add('drag-over');
    }
}

const onDragleave = (event) => {
    event.preventDefault()
    pile.classList.remove('drag-over')
}

const onDrop = (event) => {
    const data = JSON.parse(event.dataTransfer.getData("application/json"))
    pile.classList.remove('drag-over')
    data.cardDOM = dragged

    if(cardInPlay.color === data.color || cardInPlay.value === data.value || data.color === "black" ) {
       
        if(cardCounter === 0 
            || cardCounter > 0 && cardInPlay.value === data.value 
            || cardCounter > 0 && data.value.toString().includes("+") && cardCounter > 0 && data.color === cardInPlay.color) {

            if(data.color === "black") showModal()

            pile.appendChild(data.cardDOM)

            //for 2 players, if the first card is a reverse or skip you basically have a new turn
            if(data.value === "&#x1F6C7" || data.value === "&#8644;") cardCounter = 0
            else cardCounter++

            cardInPlay = data
            if(!cardInPlay.value.toString().includes("+") && parseInt(summationInt.innerHTML) > 0) {
                setDrawInterval(drawCard, 200, parseInt(summationInt.innerHTML))
                summationInt.innerHTML = "0"
            }

            historical.push(data)
            data.cardDOM.draggable = false
            
            removeCards()
            setSummation()
        }
    }

    // console.log("historical after drop: ", historical)
    console.log("player1 after drop: ", player1)
    console.log("player2 after drop: ", player2)
    // console.log("Deck after drop: ", deck)
    console.log(cardCounter)
    selectedColor.style.backgroundColor = historical.at(-1).color
}

const removeCards = () => {
    //always leaves only 1 card in play
    if(historical.length > 1) {
        pile.removeChild(historical.at(-2).cardDOM)
    }

    let hand = getActiveHand()
    //removes card from the hand of the player
    players[hand].forEach(card => {
        if(JSON.stringify(card) === JSON.stringify(cardInPlay)) {
            players[hand].splice(players[hand].indexOf(card),1)
        }
    })
}

const setSummation = () => {
    //sets summation
    if(cardInPlay.value.toString().includes("+")) {
        summation.children[1].innerHTML = parseInt(summation.children[1].innerHTML) + parseInt(cardInPlay.value.slice(-1))
    }
}

const drawCard = () => {
    const random = Math.floor(Math.random() * deck.length)
    let card = deck.splice(random, 1)[0]
    let hand = getActiveHand()

    players[hand].push(card)
    hands[hand].appendChild(card.cardDOM)

    setDrawingAnimation(card)
    console.log("draw card - deck ", deck)
    console.log("draw card - player1 ", player1)
    card.cardDOM.addEventListener('dragstart', (event) => onDragStart(event, card))
    card.cardDOM.addEventListener('dragend', onDragEnd)
    // setActiveHand()
}

const getActiveHand = () => {
    return document.querySelector(".active-hand") === bottomHand ? 0 : 1
}
//handing the cards to the players
player1.forEach(card => {
    bottomHand.appendChild(card.cardDOM)
    card.cardDOM.classList.remove('card-reverse')
    
    card.cardDOM.addEventListener('dragstart', (event) => onDragStart(event, card))
    card.cardDOM.addEventListener('dragend', onDragEnd)
})

player2.forEach(card => {
    topHand.appendChild(card.cardDOM)
    card.cardDOM.classList.remove('card-reverse')
    
    card.cardDOM.addEventListener('dragstart', (event) => onDragStart(event, card))
    card.cardDOM.addEventListener('dragend', onDragEnd)
})

const init = () => {
    setStart()
    setSelectedColor()
}

init()

//drag events
pile.addEventListener('dragover', onDragOver)
pile.addEventListener('dragleave', onDragleave)
pile.addEventListener('drop', onDrop)
startBtn.addEventListener("click", setButtons)