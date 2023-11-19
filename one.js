import { showModal, hideModal, showStatsModal, hideStatsModal, modal } from "./utils.js"
import { setHand, DECK, cardFactory } from "./cards.js"

let deck = DECK
let players = [setHand(), setHand()]
let [player1, player2] = players
let NPC = true

const topHand = document.querySelector('.top-hand')
const bottomHand = document.querySelector('.bottom-hand')
const hands = [bottomHand, topHand]
const pile = document.querySelector('.pile')
const colors = document.querySelectorAll(".color")
const turnInfo = document.querySelector(".turn > span")
const turnInfoDiv = document.querySelector(".turn")
const summation = document.querySelector(".summation")
const summationInt = summation.children[1]
const graveyard = document.querySelector(".right-hand")
const matchResult = document.querySelector(".match-result")
const startBtn = document.querySelector(".start")
const nextBtn = document.querySelector(".finalize")
const newMatchBtn = document.querySelector(".new-match")

let dragged
let cardInPlay
let historical = []
let actualTurn = []
let cardCounter = 0
let usedCards = 0
let hasCardBeenDropped = []
let hasStarted = false
let turn = 0

const setStart = () => {
    handCards()
    let card = setRandomPileStarter()
    setDrawingAnimation(card)
    hasStarted = true
    turn = 0
    historical.push(card)
    cardInPlay = card
    deck.splice(deck.indexOf(card), 1)[0]
    pile.style.backgroundColor = card.color
    setSelectedModalColor()
    // console.log(deck)
}
const setRandomPileStarter = () => {
    const random = Math.floor(Math.random() * deck.filter(card => card.color !== "black").length)

    let card = deck
        .filter(card => card.color !== "black")
        .splice(random, 1)[0]

    pile.appendChild(card.cardDOM)

    return card
}

const setDrawingAnimation = (card) => {
    //sets the drawing animation
    
    card.cardDOM.draggable = true
    setReversedCards(card)
    
    if(!hasStarted) {
        startDrawingCardAnimation(card)
    }
    if(getActiveHand() === 1 && hasStarted) {}
    else startDrawingCardAnimation(card)
}

const startDrawingCardAnimation = (card) => {
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

const setSelectedModalColor = () => {
    colors.forEach(color => {
        color.addEventListener("click", () => {
            let newColor
            newColor = color.className.split(" ")[1]
            hideModal()
            historical.at(-1).color = newColor
            pile.style.backgroundColor = newColor
        })
    })
}

const setButtons = () => {
    startBtn.style.display = "none"
    turnInfoDiv.style.display = "flex"
    setStarterActiveHand()
    setDraggableCards()
    setTurnInfo()
    //if npc gets first turn it does it's thing, otherwise it will wait until nextBtn is clicked
    if(getActiveHand() === 1) setNpcTurn()
    //button events and layout
    nextBtn.addEventListener("click", setActiveHand)
}

const setStarterActiveHand = () => {
    let random = Math.floor(Math.random() * 2)
    random === 0 ? bottomHand.classList.add("active-hand") : topHand.classList.add("active-hand")
    showHideNextBtn()
}


const setDraggableCards = () => {
    hands.forEach(hand => {
        if(hand.classList.contains("active-hand")) {
            console.log("HANDS OF EACH PLAYER: ",players)
            if(NPC && topHand.classList.contains("active-hand")) {
                hand.childNodes.forEach(card => {
                    card.draggable = false
                })
            }else {
                hand.childNodes.forEach(card => {
                    card.draggable = true
                })
            }
            
        }else {
            hand.childNodes.forEach(card => {
                card.draggable = false
            })
        }
    })
}

const setActiveHand = () => {
    setTurnInfo()
    setGraveyard()
    cleanUpPlusCards()
    handleDrawEvent()
    addActiveHandClass()
    showHideNextBtn()
    setDraggableCards()
    drawCardsIfNeeded()
    resetCounters()
    setNpcTurn()
    // console.log("deck after turn: ", deck)
}

const showHideNextBtn = () => {
    nextBtn.style.display = getActiveHand() === 1 ? "none" : "flex"
}

const setTurnInfo = () => {
    turn++
    turnInfo.textContent = turn
}

const resetCounters = () => {
    cardCounter = 0
    usedCards = 0
    actualTurn = []
    hasCardBeenDropped = []
}

const setGraveyard = () => {
    graveyard.childNodes.forEach(droppedCard => {
        droppedCard.style.outline = ""
    })

    actualTurn.forEach((droppedCard, index) => {
        let clonedNode = droppedCard.cardDOM.cloneNode(true)
        clonedNode.style.outline = "5px solid blue"

        if(index === actualTurn.length - 1) {
            clonedNode.style.outline = "5px solid yellow"
        }
        graveyard.appendChild(clonedNode)
    })

    graveyard.scrollTop = graveyard.scrollHeight
}

const setNpcTurn = () => {
    if(NPC && getActiveHand() === 1) {
        const possibleCards = getNpcHand()
        console.log("POSSIBLE CARDS: ", possibleCards)
        if(possibleCards.length === 0) {
            setTimeout(() => nextBtn.click(), 3000)
        }else {
            possibleCards.forEach((card) => {
                emulateDropEvent(card)
     
                if(card.color === "black") {
                    setNpcWildCardColor()
                }
            })
            setTimeout(() => nextBtn.click(), 3000)
        }
    }
}

const setNpcWildCardColor = () => {
    //was tired sorry for this
    const redColored = player2.filter(card => card.color === "red").length
    const greenColored = player2.filter(card => card.color === "green").length
    const blueColored = player2.filter(card => card.color === "blue").length
    const yellowColored = player2.filter(card => card.color === "yellow").length

    if(redColored > greenColored && redColored > blueColored && redColored > greenColored) {
        // setTimeout(() => red.click(), 3000)
        pile.style.backgroundColor = "red"
        return "red"
    }
    if(greenColored > redColored && greenColored > blueColored && greenColored > yellowColored) {
        // setTimeout(() => green.click(), 3000)
        pile.style.backgroundColor = "green"
        return "green"
    }
    if(blueColored > redColored && blueColored > greenColored && blueColored > yellowColored) {
        // setTimeout(() => blue.click(), 3000)
        pile.style.backgroundColor = "blue"
        return "blue"
    }
    if(yellowColored > redColored && yellowColored > greenColored && yellowColored > blueColored) {
        // setTimeout(() => yellow.click(), 3000)
        pile.style.backgroundColor = "yellow"
        return "yellow"
    }
    
    return setRandomColor()
}

const setRandomColor = () => {
    let random = Math.floor(Math.random() * 4)
    let colors = ["red", "green", "blue", "yellow"]
    pile.style.backgroundColor = colors[random]
    return colors[random]
}

const getNpcHand = () => {
    cleanUpPlusCards()
    const possibleCards = player2.filter(card => {
        return cardInPlay.color === card.color || cardInPlay.value === card.value || card.color === "black" 
    })

    // const possiblePlusCards = possibleCards.filter(card => {
    //     return (
    //         cardInPlay.value.toString() === "+2" && cardInPlay.value.toString().includes("+") 
    //         || card.color === "black" && cardInPlay.value.toString().includes("+")
    //     )
    // })
    
    // console.log(possiblePlusCards)

    possibleCards.sort((a, b) => {
        if ((a.value === "&#x1F6C7" || a.value === "&#8644;") && !(b.value === "&#x1F6C7" || b.value === "&#8644;")) {
            return -1
        }
        else if (!(a.value === "&#x1F6C7" || a.value === "&#8644;") && (b.value === "&#x1F6C7" || b.value === "&#8644;")) {
            return 1
        }
        else {
            return 0
        }
    })
    return possibleCards
}

const emulateDropEvent = (card) => {
    dragged = card.cardDOM
    const dropEvent = new Event("drop")
    dropEvent.dataTransfer = new DataTransfer()
    dropEvent.dataTransfer.setData("application/json", JSON.stringify(card))
    pile.dispatchEvent(dropEvent)
}

const cleanUpPlusCards = () => {
    players.forEach(player => {
        player.forEach(card => {
            card.cardDOM.classList.remove("plus-card")
        })
    })
}

const handleDrawEvent = () => {
    if(usedCards === 0) {
        if(deck.length > 0) drawCard()
    }
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

    if(pile.style.backgroundColor === data.color 
        || cardInPlay.color === data.color 
        || cardInPlay.value === data.value 
        || data.color === "black" ) {
       
        if(cardCounter === 0 
            || cardCounter > 0 && cardInPlay.value === data.value 
            || cardCounter > 0 && data.value.toString().includes("+") && cardCounter > 0 && data.color === cardInPlay.color) {

            if(data.color === "black" && getActiveHand() === 0) showModal()
            if(data.color === "black" && getActiveHand() === 1) setNpcWildCardColor()
            
            if(data.cardDOM.classList.contains("card-reverse")) setFacedCards(data)
            pile.appendChild(data.cardDOM)

            //for 2 players, if the first card is a reverse or skip you basically have a new turn
            if(data.value === "&#x1F6C7" || data.value === "&#8644;") cardCounter > 0 ? cardCounter-- : cardCounter = 0
            else cardCounter++

            usedCards++
            cardInPlay = data
            pile.style.backgroundColor = cardInPlay.color
            if(data.color === "black" && getActiveHand() === 1) setNpcWildCardColor()

            hasCardBeenDropped.push(true)

            if(!cardInPlay.value.toString().includes("+") && parseInt(summationInt.innerHTML) > 0) {
                setDrawInterval(drawCard, 200, parseInt(summationInt.innerHTML))
                summationInt.innerHTML = "0"
            }

            historical.push(data)
            actualTurn.push(data)
            data.cardDOM.draggable = false
            
            // setDrawingAnimation(data)
            removeCards()
            setSummation()
        }else hasCardBeenDropped.push(false)
    }

    // console.log("historical after drop: ", historical)
    // console.log("player1 after drop: ", player1)
    // console.log("player2 after drop: ", player2)
    // console.log("Deck after drop: ", deck)
    // console.log(cardCounter)
    // console.log(actualTurn)
    if(players[getActiveHand()].length === 0) setStatsModal()
    console.log("hasCardBeenDropped :", hasCardBeenDropped)
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

    players[getActiveHand()].push(card)
    hands[getActiveHand()].appendChild(card.cardDOM)

    setDrawingAnimation(card)

    card.cardDOM.addEventListener('dragstart', (event) => onDragStart(event, card))
    card.cardDOM.addEventListener('dragend', onDragEnd)
}

const getActiveHand = () => {
    return document.querySelector(".active-hand") === bottomHand ? 0 : 1
}

const setReversedCards = (card) => {
    card.cardDOM.classList.add('card-reverse')
    card.cardDOM.style.backgroundColor = "black"
    card.cardDOM.children[1].firstChild.style.color = "yellow"
    card.cardDOM.children[1].firstChild.innerHTML = "one!"
}

const setFacedCards = (card) => {
    card.cardDOM.classList.remove('card-reverse')
    card.cardDOM.style.backgroundColor = card.color
    card.cardDOM.children[1].firstChild.style.color = card.color
    card.cardDOM.children[1].firstChild.innerHTML = card.value === "+4" ? "🃏" : card.value
}

const setStatsModal = () => {
    //if player ends with a wild card, hides the color modal
    if(document.querySelector(".modal")) modal.style.display = "none"
    showStatsModal()

    players = []
    deck = []
    historical = []
    hasStarted = false
    matchResult.className = "match-result"

    matchResult.textContent = getActiveHand() === 0 ? "VICTORIA" : "DERROTA"
    matchResult.textContent === "VICTORIA"
        ? matchResult.classList.add("victory")
        : matchResult.classList.add("defeat")

    newMatchBtn.addEventListener("click", () => {
        
        deck = cardFactory()
        players = [setHand(), setHand()]
        console.log(deck, players)
        nextBtn.style.display = "none"
        startBtn.style.display = "flex"
        turnInfoDiv.style.display = "none"
        turn = 0
        turnInfo.textContent = turn
        hands.forEach(hand => hand.classList.remove("active-hand"))
        while(graveyard.firstChild) graveyard.removeChild(graveyard.firstChild)
        while(graveyard.firstChild) graveyard.removeChild(graveyard.firstChild)
        while(topHand.firstChild) topHand.removeChild(topHand.firstChild)
        while(bottomHand.firstChild) bottomHand.removeChild(bottomHand.firstChild)
        while(pile.firstChild) pile.removeChild(pile.firstChild)
    
        player1 = players[0]
        player2 = players[1]
        
        init()
        hideStatsModal()
    })
}

//handing the cards to the players
const handCards = () => {
    player1.forEach(card => {
        bottomHand.appendChild(card.cardDOM)
        card.cardDOM.classList.remove('card-reverse')
        
        card.cardDOM.addEventListener('dragstart', (event) => onDragStart(event, card))
        card.cardDOM.addEventListener('dragend', onDragEnd)
    })
    
    player2.forEach(card => {
        topHand.appendChild(card.cardDOM)
        card.cardDOM.classList.remove('card-reverse')
        if(NPC) {
            setReversedCards(card)
        }
        
        card.cardDOM.addEventListener('dragstart', (event) => onDragStart(event, card))
        card.cardDOM.addEventListener('dragend', onDragEnd)
    })
}

const init = () => {
    setStart()
}

init()

//drag events
pile.addEventListener('dragover', onDragOver)
pile.addEventListener('dragleave', onDragleave)
pile.addEventListener('drop', onDrop)
startBtn.addEventListener("click", setButtons)