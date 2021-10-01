import * as dat from "../lib/dat.gui.module.js";

// Our Javascript will go here.

const gui = new dat.gui.GUI();

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

let doesAnimate = {
    value: false,
  };
let dt = 0;

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
    cube.position.z = 0;
}};

gui.add(reset_button,'Reset');

function deg_to_rad(degrees) {
    return degrees * (Math.PI/180);
}

function animate() {
    if(doesAnimate.value && (dt/1000 <= 20)) {
        dt = Date.now() - initTime;
        cube.rotation.y = deg_to_rad(18*(dt/1000));	
        cube.position.x = -5*(dt/1000);
        cube.position.y = 5*(dt/1000);
        //console.log(dt.toString());
    }

    requestAnimationFrame( animate );
    renderer.render( scene, camera );
}
//dt = d.getTime();
animate();

