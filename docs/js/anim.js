import * as dat from "../lib/dat.gui.module.js";

// Our Javascript will go here.
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 35, window.innerWidth / window.innerHeight, 0.1, 2000 );
const geometry = new THREE.BoxGeometry();
const geometry2 = new THREE.SphereGeometry();
const material = new THREE.MeshPhongMaterial({shininess: 10, color: 0x5F9EA0});
const cube = new THREE.Mesh( geometry, material );
const sphere = new THREE.Mesh(geometry2, material );
const light1 = new THREE.AmbientLight({hex: 0xffffff, intensity: 0.25});
const light2 = new THREE.PointLight(0xffffff, 0.5);
const gui = new dat.gui.GUI();
scene.add( cube );
scene.add(sphere);
scene.add( light1 );
scene.add( light2 );

camera.position.z = 20;

light2.position.x = 5;
light2.position.y = 5;
light2.position.z = 5;
sphere.position.x = 5;

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

