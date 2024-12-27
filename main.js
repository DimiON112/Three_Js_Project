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

camera.position.z = 5;
camera.position.y = 2;
camera.position.x = 2;

const renderer = new THREE.WebGLRenderer();
renderer.setAnimationLoop( animate );
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

const orbit = new OrbitControls(camera, renderer.domElement);
orbit.update();

//=================================== Light ====================================//

const light = new THREE.AmbientLight(0x404040, 40);
scene.add( light );

//=================================== MASH ====================================//

// snake
const snakeGeometry = new THREE.BoxGeometry( 1, 1, 1 );
const snakeMtl = new THREE.MeshStandardMaterial( { color: '#3638ac' } );
const snake = new THREE.Mesh( snakeGeometry, snakeMtl );
snake.position.set(0,0.5,0);
scene.add( snake );

// plane
const planeGeometry = new THREE.PlaneGeometry(20,20);
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
const wallGeometry = new THREE.BoxGeometry( 20.5, 2, 0.5 );
const wallMtl = new THREE.MeshBasicMaterial( { color: '#777777' } );

const wallHorizontalPosition = [
    [10,1,0],
    [-10,1,0],
];

const wallVerticalPosition = [
    [0,1,10],
    [0,1,-10]
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

//================================ Axes Helper ===================================//

const axesHelper = new THREE.AxesHelper(3);
scene.add(axesHelper);

//================================== Animate =====================================//

function animate() {

    renderer.render( scene, camera );
}