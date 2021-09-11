import * as dat from "../lib/dat.gui.module.js";

// Our Javascript will go here.
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 35, window.innerWidth / window.innerHeight, 0.1, 2000 );
const geometry = new THREE.BoxGeometry();
const geometry2 = new THREE.SphereGeometry();
const material = new THREE.MeshPhongMaterial({shininess: 10, color: 0x5F9EA0});
const cube = new THREE.Mesh( geometry, material );
//const sphere = new THREE.Mesh(geometry2, material );
const light1 = new THREE.AmbientLight({hex: 0xffffff, intensity: 0.25});
const light2 = new THREE.PointLight(0xffffff, 0.5);
let d = new Date();
const gui = new dat.gui.GUI();
let initTime = 0;
cube.scale.x = 10;
cube.scale.y = 10;
cube.scale.z = 10;
scene.add( cube );
//scene.add(sphere);
scene.add( light1 );
scene.add( light2 );

camera.position.z = 250;
camera.position.x = 50;
camera.position.y = 50;

light2.position.x = 5;
light2.position.y = 5;
light2.position.z = 5;
//sphere.position.x = 5;

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );


//var anim = false;

let doesAnimate = {
    value: false,
  };
let dt = 0;

// let animToggle = gui.add(doesAnimate, "value").name("Move with time?").listen();

// animToggle.onChange(function(){ initTime = Date.now(); });

let anim_button = {Animate:function(){
    initTime = Date.now();
    doesAnimate.value = true;
    dt = 0;
}};

gui.add(anim_button,'Animate');

let reset_button = {Reset:function(){
    doesAnimate.value = false;
    dt = 0;
    // reset all the values we change.
    cube.rotation.y = 0;
    cube.position.x = 0;
    cube.position.y = 0;
}};

gui.add(reset_button,'Reset');
// window.addEventListener('keydown', (e) => {
//     if(!e.repeat) {
//         console.log('Key "${e.key}" pressed  [event: keydown]');
//         anim = !anim;
//     }
//     else {
//         console.log('Key "${e.key} is held down.');
//     }
// })
function deg_to_rad(degrees) {
    return degrees * (Math.PI/180);
}


function animate() {
    if(doesAnimate.value && (dt/1000 <= 20)) {
        dt = Date.now() - initTime;
        //cube.rotation.x += 0.01;
        cube.rotation.y = deg_to_rad(18*(dt/1000));	
        cube.position.x = 5*(dt/1000);
        cube.position.y = 5*(dt/1000);
        //camera.rotation.x += 0.01;
        //console.log(initTime);
        console.log(dt.toString());
    }

    requestAnimationFrame( animate );
    renderer.render( scene, camera );
}
//dt = d.getTime();
animate();

