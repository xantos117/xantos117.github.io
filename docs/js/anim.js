import * as dat from "../lib/dat.gui.module.js";

// Our Javascript will go here.
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
const cube = new THREE.Mesh( geometry, material );
const gui = new dat.gui.GUI();
scene.add( cube );

camera.position.z = 5;

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );


//var anim = false;

let doesAnimate = {
    value: true,
  };

gui.add(doesAnimate, "value").name("Move with time?");

// window.addEventListener('keydown', (e) => {
//     if(!e.repeat) {
//         console.log('Key "${e.key}" pressed  [event: keydown]');
//         anim = !anim;
//     }
//     else {
//         console.log('Key "${e.key} is held down.');
//     }
// })
function animate() {
    if(doesAnimate.value) {
        cube.rotation.x += 0.01;
        cube.rotation.y += 0.01;	
        //camera.rotation.x += 0.01;
    }
    requestAnimationFrame( animate );
    renderer.render( scene, camera );
}

animate();

