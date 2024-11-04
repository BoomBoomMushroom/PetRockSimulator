const canvas = document.getElementById("canvas")
const ctx = canvas.getContext("2d")

canvas.width = window.innerWidth
canvas.height = window.innerHeight

// Game Variables

var petRock = {
    x: canvas.width / 2,
    y: canvas.height / 4,
    vx: 0,
    vy: 0,
    mass: 0.25,
    rotation: 0,
    rotationVelocity: 0,
    hitboxRadius: 50,
    beingHeld: false,

    warpScaleX: 0,
    warpScaleY: 0,
}

var gravity = 9.8
var friction = 1

var floorYLevel = canvas.height

var mousePosition = {x: -1, y: -1}
var deltaMousePosition = {x: 0, y: 0}
var mouseChanging = false;
var mouseDown = false;

// Assets
var petRockImage = new Image()
petRockImage.src = "./assets/rock.png"
petRockImage.onload = (e)=>{
    petRock["width"] = petRockImage.width
    petRock["height"] = petRockImage.height
    petRock["scale"] = 1 / 4
}

// Rendering Functions

function drawRock(){
    if(petRock["width"] == undefined){ return false }

    // https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/drawImage
    // https://gamedev.stackexchange.com/questions/67274/how-to-rotate-an-image-on-an-html5-canvas-without-rotating-the-whole-canvas
    // https://stackoverflow.com/questions/36859472/html-5-canvas-rotate-scale-translate-and-drawimage

    let drawX = petRock.x - petRock.width/2
    let drawY = petRock.y - petRock.height/2

    ctx.save();

    ctx.translate(drawX+petRock.width/2, drawY+petRock.height/2);

    ctx.rotate(petRock.rotation * Math.PI / 180);
    
    //ctx.scale(petRock.scale, petRock.scale);
    ctx.scale(
        petRock.scale * petRock.warpScaleX,
        petRock.scale * petRock.warpScaleY
    );
    
    ctx.translate((-petRock.width)/2, (-petRock.height)/2);

    ctx.drawImage(petRockImage, 0, 0);

    ctx.restore();
}

function drawFrame(){
    ctx.fillStyle = "#232323"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    drawRock()
}

// Updating

function petRockPhysicsTick(deltaTime){
    let feetY = (petRock.y + (petRock.height/2 * petRock.scale))
    let inAir = feetY <= floorYLevel

    if(petRock.beingHeld){
        petRock.vy = 0
        petRock.x = mousePosition.x
        petRock.y = mousePosition.y
        petRock.rotationVelocity = 0
    }
    else if(inAir){
        petRock.vy += petRock["mass"] * gravity // Mass * Acceleration (F = ma)
        petRock.rotationVelocity = 180
    }
    else{
        petRock.vy = 0
        petRock.rotationVelocity = 0
    }

    if(petRock.vx != 0){
        petRock.vx += -1 * Math.sign(petRock.vx) * friction
    }

    petRock.x += petRock.vx * deltaTime
    petRock.y += petRock.vy * deltaTime
    petRock.rotation += petRock.rotationVelocity * deltaTime

    stretchDirection = normalizeVector({
        x: petRock.scale + petRock.vx/10000,
        y: petRock.scale + petRock.vy/10000,
    })
    petRock.warpScaleX = stretchDirection.x
    petRock.warpScaleY = stretchDirection.y

    if(petRock.x > canvas.width-(petRock.width/2*petRock.scale)){
        petRock.vx = -1 * Math.abs(petRock.vx)
    }
    if(petRock.x < (petRock.width/2*petRock.scale)){
        petRock.vx = 1 * Math.abs(petRock.vx)
    }
    if(petRock.y < 0){
        petRock.vy = 1 * Math.abs(petRock.vy)
        //petRock.vy = -10
    }

    let distFromMouse = distanceFunction(mousePosition.x, mousePosition.y, petRock.x, petRock.y)
    let mouseInHitbox = distFromMouse < petRock.hitboxRadius
    if(mouseInHitbox && mouseDown){
        petRock.beingHeld = true
    }

    if(mouseChanging && mouseDown == false && mouseInHitbox){
        petRock.vx -= deltaMousePosition.x * 100
        petRock.vy -= deltaMousePosition.y * 100
    }

    if(mouseDown == false){
        petRock.beingHeld = false
    }
}

// Helpful Functions

function distanceFunction(x1, y1, x2, y2){
    let dx = x2 - x1
    let dy = y2 - y1
    return Math.sqrt( dx*dx + dy*dy )
}

function normalizeVector(v){
    let magnitude = Math.sqrt(v.x*v.x + v.y*v.y)
    if(magnitude == 0){ return {x: 0, y: 0} }
    return {x: v.x / magnitude, y: v.y / magnitude}
}

// Game Loop

var lastUpdate = Date.now();
var gameInterval = setInterval(tick, 0);

function tick() {
    let now = Date.now();
    let dt = now - lastUpdate;
    lastUpdate = now;

    dt = dt / 1000

    petRockPhysicsTick(dt)
    drawFrame()

    mouseChanging = false
}

document.onmousemove = (e)=>{
    deltaMousePosition = {
        x: mousePosition.x - e.clientX,
        y: mousePosition.y - e.clientY,
    }

    mousePosition = {
        x: e.clientX,
        y: e.clientY
    }
}
document.body.onmousedown = function() { 
  mouseDown = true;
  mouseChanging = true
}
document.body.onmouseup = function() {
  mouseDown = false;
  mouseChanging = true
}