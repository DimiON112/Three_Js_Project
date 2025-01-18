import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';

const scene = new THREE.Scene();

function radians(deg)
{
    return Math.PI / 180 * deg;
}

//=================================== Camera ====================================//

const camera = new THREE.PerspectiveCamera( 75,
    window.innerWidth / window.innerHeight,
    0.1, 1000
);

camera.position.set(0, 15, 10);
camera.lookAt(new THREE.Vector3(0, 0, 0));

const renderer = new THREE.WebGLRenderer();
renderer.setAnimationLoop( animate );
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

const orbit = new OrbitControls(camera, renderer.domElement);
orbit.update();

//=================================== Light ====================================//

const light = new THREE.AmbientLight(0x404040, 40);
scene.add( light );

//================================ audio ===================================//
const appleSound = new Audio();
appleSound.src = 'sounds/apple_eaten.mp3';
appleSound.load();

const endSound = new Audio();
endSound.src = 'sounds/zvuk-proigryisha.mp3';
endSound.load();

let gameOverSoundPlayed = false;



//================================ UI ===================================//

const scoreDiv = document.createElement('div');
scoreDiv.style.position = 'absolute';
scoreDiv.style.top = '10px';
scoreDiv.style.right = '10px';
scoreDiv.style.fontSize = '24px';
scoreDiv.style.color = 'white';
scoreDiv.style.fontWeight = 'bold';
scoreDiv.innerHTML = `Score: 0`;
document.body.appendChild(scoreDiv);


const gameOverMenu = document.createElement('div');
gameOverMenu.style.position = 'absolute';
gameOverMenu.style.top = '50%';
gameOverMenu.style.left = '50%';
gameOverMenu.style.transform = 'translate(-50%, -50%)';
gameOverMenu.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
gameOverMenu.style.padding = '20px';
gameOverMenu.style.color = 'white';
gameOverMenu.style.fontSize = '24px';
gameOverMenu.style.textAlign = 'center';
gameOverMenu.style.display = 'none'; 
document.body.appendChild(gameOverMenu);

// Score element
const scoreDisplay = document.createElement('div');
scoreDisplay.style.fontSize = '36px';
scoreDisplay.style.marginBottom = '20px';
gameOverMenu.appendChild(scoreDisplay);

// Restart button
const restartButton = document.createElement('button');
restartButton.innerText = 'Restart';
restartButton.style.padding = '10px 20px';
restartButton.style.fontSize = '18px';
restartButton.style.cursor = 'pointer';
gameOverMenu.appendChild(restartButton);

// Add event listener to restart the game
restartButton.addEventListener('click', () => {
	window.location.reload();  
});

// Funkcja, która będzie sprawdzać zakończenie gry
function checkGameOver() {
    const headGridPos = snake.gridPositions[0];
    

    // Sprawdzamy kolizję ze ścianą
    if (
        Math.abs(headGridPos.x) > GRID_LIMIT ||
        Math.abs(headGridPos.z) > GRID_LIMIT
    ) {
        endGame("You hit the wall!");
        return;
    }

    // Sprawdzamy kolizję z samym sobą
    if (snake.checkSelfCollision(headGridPos)) {
        endGame("You collided with yourself!");
        return;
    }
}

function endGame(message) {    

    if (!gameOverSoundPlayed) {
        endSound.play(); 
        gameOverSoundPlayed = true;  
    }

    cancelAnimationFrame(animationFrameId);
    gameOverMenu.style.display = 'block';
    scoreDisplay.innerHTML = `Game Over!<br>Your Score: ${game.getScore()}`;
}

let animationFrameId;


// Uruchamiamy animację
let previousTimestamp = 0;
animationFrameId = requestAnimationFrame(animate);


//=================================== MASH ====================================//
// plane
const planeGeometry = new THREE.PlaneGeometry(21,21);
const planeTextures = new THREE.TextureLoader().load("images/grass.webp");
planeTextures.wrapS = THREE.RepeatWrapping;
planeTextures.wrapT = THREE.RepeatWrapping;
planeTextures.repeat.set(20, 20);
const planeMtl = new THREE.MeshStandardMaterial( { 
    map: planeTextures,
    side: THREE.FrontSide
});
const plane = new THREE.Mesh( planeGeometry, planeMtl );
plane.rotateX(radians(-90));
scene.add( plane )

// walls
const wallGeometry = new THREE.BoxGeometry( 22, 2, 1 );
const wallMtl = new THREE.MeshBasicMaterial( { color: '#777777' } );

const wallHorizontalPosition = [
    [11,1,0],
    [-11,1,0],
];

const wallVerticalPosition = [
    [0,1,11],
    [0,1,-11]
];

wallHorizontalPosition.forEach(HorizontalPosition=>{
    const wall = new THREE.Mesh( wallGeometry, wallMtl );
    wall.position.set(...HorizontalPosition);
    wall.rotateY(radians(90));
    scene.add( wall );
});

wallVerticalPosition.forEach(verticalPosition=>{
    const wall = new THREE.Mesh( wallGeometry, wallMtl );
    wall.position.set(...verticalPosition);
    scene.add( wall );
});

//==================================    Game    =====================================//

class Game {
    constructor(scene) {
        this.scene = scene;
        this.score = 0;
        this.apple = null;
        this.appleSound = new Audio('sounds/apple_eaten.mp3');
        this.appleSound.volume = 0.2; 
    }
    
    getScore()
    {
        return this.score;
    }

    spawnApple(snakeGridPositions) {
        if (this.apple) {
            this.scene.remove(this.apple);
        }

        let applePosition;
        do {
            const x = Math.floor(Math.random() * (2 * GRID_LIMIT + 1)) - GRID_LIMIT;
            const z = Math.floor(Math.random() * (2 * GRID_LIMIT + 1)) - GRID_LIMIT;

            applePosition = new THREE.Vector3(x, 0, z);

        } while (
            Math.abs(applePosition.x) > GRID_LIMIT ||
            Math.abs(applePosition.z) > GRID_LIMIT ||
            snakeGridPositions.some((pos) => pos.equals(applePosition))
        );

        const appleGeometry = new THREE.SphereGeometry(GRID_SIZE / 2, 16, 16);
        const appleMaterial = new THREE.MeshBasicMaterial({ color: 0xff9900 });
        this.apple = new THREE.Mesh(appleGeometry, appleMaterial);

        this.apple.position.set(
            applePosition.x * GRID_SIZE,
            GRID_SIZE / 2,
            applePosition.z * GRID_SIZE
        );

        this.apple.gridPosition = applePosition;
        this.scene.add(this.apple);
    }

    checkCollisionWithApple(headGridPosition) {
        if (this.apple && this.apple.gridPosition.equals(headGridPosition)) {
            console.log("Apple eaten!");
            this.score++;
            scoreDiv.innerHTML = `Score: ${game.getScore()}`;

            snake.addGrowth(this.apple.gridPosition);
            this.spawnApple(snake.gridPositions);
            this.appleSound.play();
        }
    }
}
const game = new Game(scene);

//================================== Animate Snake =====================================//

const GRID_SIZE = 1;
const GRID_LIMIT = 10;

class SnakeObj {
    constructor(scene, segmentCount = 3) {
        this.scene = scene;
        this.segments = [];
        this.direction = new THREE.Vector3(0, 0, -1); 
        this.lastDirection = this.direction.clone();
        this.gridPositions = [];
        this.pendingGrowth = [];

        this.moveInterval = 200;
        this.elapsedTime = 0;

        for (let i = 0; i < segmentCount; i++) {
            const snakeGeometry = new THREE.BoxGeometry(GRID_SIZE, GRID_SIZE, GRID_SIZE);
            const snakeMtl = new THREE.MeshBasicMaterial({ color: i === 0 ? 0xff0000 : 0x00ff00 });
            const snake = new THREE.Mesh(snakeGeometry, snakeMtl);

            const gridPosition = new THREE.Vector3(0, 0, i);
            this.gridPositions.push(gridPosition);
            snake.position.set(gridPosition.x * GRID_SIZE, 0, gridPosition.z * GRID_SIZE);
            this.segments.push(snake);
            this.scene.add(snake);
        }
    }

    update(deltaTime) {
        this.elapsedTime += deltaTime;
        if (this.elapsedTime < this.moveInterval) return;

        this.elapsedTime = 0;

        // odswiezanie pozycji segmentów
        for (let i = this.segments.length - 1; i > 0; i--) {
            this.gridPositions[i].copy(this.gridPositions[i - 1]);
        }

        //odsieżanie głowy
        const headGridPos = this.gridPositions[0];
        headGridPos.add(this.direction);

        if (Math.abs(headGridPos.x) > GRID_LIMIT ||
         Math.abs(headGridPos.z) > GRID_LIMIT){return;}

        // czy trafił sam na siebie
        if (this.checkSelfCollision(headGridPos)) {
            endSound.play();
            return;
        }

        // odświerzanie segmentów
        for (let i = 0; i < this.segments.length; i++) {
            const segment = this.segments[i];
            segment.position.set(
                this.gridPositions[i].x * GRID_SIZE,
                0,
                this.gridPositions[i].z * GRID_SIZE
            );
        }

        this.lastDirection.copy(this.direction);
        this.growIfNeeded();
    }

    checkSelfCollision(headGridPosition) {
        for (let i = 1; i < this.gridPositions.length; i++) 
        { 
            if (headGridPosition.equals(this.gridPositions[i])) {
                return true;
            }
        }
        return false;
    }

    growIfNeeded() {
        if (this.pendingGrowth.length > 0) {
            const tailGridPos = this.gridPositions[this.gridPositions.length - 1];
            const growthTarget = this.pendingGrowth[0];

            if (tailGridPos.equals(growthTarget)) {
                const snakeGeometry = new THREE.BoxGeometry(GRID_SIZE, GRID_SIZE, GRID_SIZE);
                const snakeMtl = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
                const newSegment = new THREE.Mesh(snakeGeometry, snakeMtl);

                this.gridPositions.push(growthTarget.clone());
                newSegment.position.set(
                    growthTarget.x * GRID_SIZE,
                    0,
                    growthTarget.z * GRID_SIZE
                );
                this.segments.push(newSegment);
                this.scene.add(newSegment);

                this.pendingGrowth.shift();
            }
        }
    }

    setDirection(x, y, z) {
        const newDirection = new THREE.Vector3(x, y, z);

        if (!newDirection.equals(this.lastDirection.clone().negate()) &&
            newDirection.dot(this.lastDirection) === 0
        ) {
            this.direction.copy(newDirection);
        }
    }

    addGrowth(position) {
        this.pendingGrowth.push(position.clone());
    }
}

const snake = new SnakeObj(scene, 3);
game.spawnApple(snake.gridPositions);

const keys = {};
document.addEventListener('keydown', (event) => {
    keys[event.key] = true;
    if (keys['w']) snake.setDirection(0, 0, -1);
    if (keys['s']) snake.setDirection(0, 0, 1);
    if (keys['a']) snake.setDirection(-1, 0, 0);
    if (keys['d']) snake.setDirection(1, 0, 0);
});

document.addEventListener('keyup', (event) => {
    keys[event.key] = false;
});

//================================== Animate =====================================//
function animate(timestamp) {
    const deltaTime = timestamp - previousTimestamp;
    previousTimestamp = timestamp;

    snake.update(deltaTime);
    game.checkCollisionWithApple(snake.gridPositions[0]);

    checkGameOver();

    renderer.render(scene, camera);
    animationFrameId = requestAnimationFrame(animate);
}