import{io} from 'socket.io-client';
import DrawableCanvas from './DrawableCanvas'

const production = process.env.NODE_ENV === 'production'
const serverUrl = production ? 'https://guessit-fq2e.onrender.com' : 'http://localhost:3000' 
const urlParams = new URLSearchParams(window.location.search)
const name = urlParams.get('name')
const roomId = urlParams.get('room-id')
console.log('name : '+name,'|','room-id : '+roomId);
if(!name || !roomId) window.location = '/index.html'


const socket = io(serverUrl)
const guessForm = document.querySelector('[data-guess-form]')
const guessInput = document.querySelector('[data-guess-input]')
const wordElement = document.querySelector('[data-word]')
const messagesElement= document.querySelector('[data-messages]')
const readyButton = document.querySelector('[data-ready-btn]')
const canvas= document.querySelector('[data-canvas]')
const guessTemplate= document.querySelector('[data-guess-template]')
const redButton = document.querySelector('.color-1')
const blueButton = document.querySelector('.color-2')
const blackButton = document.querySelector('.color-3')
const drawableCanvas = new DrawableCanvas(canvas,socket)

socket.emit('join-room',{name: name, roomId: roomId})
socket.on('start-drawer',startRoundDrawer)
socket.on('start-guesser',startRoundGuesser)
socket.on('guess',displayGuess)
socket.on('winner',endRound)


endRound()
resizeCanvas()
setupHTMLEvents()

function setupHTMLEvents(){
    readyButton.addEventListener('click',()=>{
        hide(readyButton)
        socket.emit('ready')
    })
    guessForm.addEventListener('submit',e=>{
        e.preventDefault()
        if(guessInput.value ==="") return 
        socket.emit('make-guess',{guess: guessInput.value})
        displayGuess(name,guessInput.value)

        guessInput.value = ''
    })
    window.addEventListener('resize',resizeCanvas)
    
}

function startRoundDrawer(word){
    drawableCanvas.canDraw = true
    drawableCanvas.clearCanvas()
    wordElement.innerText = word
    messagesElement.innerHTML= ""
}
function startRoundGuesser(){
    show(guessForm)
    hide(wordElement)
    wordElement.innerText = ""
    messagesElement.innerHTML= ""
    drawableCanvas.clearCanvas()
}
function endRound(name,word){
    if(name && word){
        wordElement.innerText = word
        show(wordElement)
        displayGuess(null, `${name} is the WINNER` )
    }
    drawableCanvas.canDraw = false
    hide(guessForm)
    show(readyButton)
}

function hide(element){
    element.classList.add("hide")
}
function show(element){
    element.classList.remove("hide")
    
}
function resizeCanvas(){
    canvas.width=null
    canvas.height = null
    const clientDimensions = canvas.getBoundingClientRect()
    canvas.width = clientDimensions.width
    canvas.height = clientDimensions.height
}
function displayGuess(guesserName, guess){
    const guessElement = guessTemplate.content.cloneNode(true)
    const messageElement = guessElement.querySelector('[data-text]')
    const nameElement = guessElement.querySelector('[data-name]')
    nameElement.innerText = guesserName
    messageElement.innerText = guess
    messagesElement.append(guessElement)

}
redButton.addEventListener('click',()=>{
   drawableCanvas.setColor('red');
})
blackButton.addEventListener('click',()=>{
    drawableCanvas.setColor('black')
})
blueButton.addEventListener('click',()=>{
    drawableCanvas.setColor('blue')
})