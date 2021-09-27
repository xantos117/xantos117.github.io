import * as dat from "../lib/dat.gui.module.js";

// Our Javascript will go here.

class KeyFrame {
    constructor(time, x, y, z, xa, ya, za, theta) {
        this.time = parseFloat(time);
        this.position = new THREE.Vector3(parseFloat(x),parseFloat(y),parseFloat(z));
        this.quat = new THREE.Quaternion();
        var axis = new THREE.Vector3(parseFloat(xa), parseFloat(ya), parseFloat(za));
        this.quat.setFromAxisAngle( axis.normalize(), parseFloat(theta));
    }
}

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 35, window.innerWidth / window.innerHeight, 0.1, 2000 );
const geometry = new THREE.BoxGeometry();
const geometry2 = new THREE.SphereGeometry();
//const material = new THREE.MeshPhongMaterial({shininess: 10, color: 0x5F9EA0});
const material = new THREE.MeshNormalMaterial();
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

camera.position.z = -250;
camera.position.x = -50;
camera.position.y = 50;
camera.rotation.y = Math.PI;

light2.position.x = 5;
light2.position.y = 5;
light2.position.z = 5;
//sphere.position.x = 5;

// text file reading function taken from https://stackoverflow.com/a/14446538/14727262

var file = '../keyframe-input.txt';
var rawFile = new XMLHttpRequest();
var allText = 'ERROR';
rawFile.open("GET", file, false);
rawFile.onreadystatechange = function ()
{
    if(rawFile.readyState === 4)
    {
        if(rawFile.status === 200 || rawFile.status == 0)
        {
            allText = rawFile.responseText;
        }
    }
}
rawFile.send(null);

const lines = allText.split('\n');
var kfs = [];

for (const l of lines) {
    var params = l.split(' ');
    //console.log(params);
    kfs.push(new KeyFrame(params[0], params[2], params[3], params[4], params[5], params[6], params[7], params[8]));
}
console.log(kfs);

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );


//var anim = false;

let doesAnimate = {
    value: false,
  };
let dt = 0;

let doesKeyFrame = {
    value: false,
};

let anim_button = {Animate:function(){
    initTime = Date.now();
    doesAnimate.value = true;
    dt = 0;
}};

let kf_button = {KeyFrame:function() {
    initTime = Date.now();
    doesKeyFrame.value = true;
    doesAnimate.value = true;
    dt = 0;
}}

gui.add(anim_button,'Animate');
gui.add(kf_button,'KeyFrame');

let reset_button = {Reset:function(){
    doesAnimate.value = false;
    dt = 0;
    // reset all the values we change.
    cube.rotation.y = 0;
    cube.position.x = 0;
    cube.position.z = 0;
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

var cur_kf = 0;
var next_kf = 1;
//cube.position = kfs[cur_kf].position;
//cube.quaternion = kfs[cur_kf].quat;


function animate() {
    if(doesAnimate.value && !doesKeyFrame.value && (dt/1000 <= 20)) {
        dt = Date.now() - initTime;
        //cube.rotation.x += 0.01;
        cube.rotation.y = deg_to_rad(18*(dt/1000));	
        cube.position.x = -5*(dt/1000);
        cube.position.y = 5*(dt/1000);
        //camera.rotation.x += 0.01;
        //console.log(initTime);
        console.log(dt.toString());
    }
    if(doesAnimate.value && doesKeyFrame.value && (dt/1000 <= 20)) {
        dt = Date.now() - initTime;
        if(dt/1000 >= kfs[next_kf].time) {
            cur_kf = next_kf;
            next_kf++;
            if(next_kf >= kfs.length) {
                next_kf = 0;
                doesAnimate.value = false;
                doesKeyFrame.value = false;
            }
        }
        var curTime = dt - kfs[cur_kf].time * 1000;
        var frameGap = (kfs[next_kf].time - kfs[cur_kf].time) * 1000;
        var u = curTime/frameGap;
        cube.position.lerpVectors(kfs[cur_kf].position,kfs[next_kf].position,u);
        // cube.rotation.x = kfs[cur_kf].xa;
        // cube.rotation.y = kfs[cur_kf].ya;
        // cube.rotation.z = kfs[cur_kf].za;
        cube.quaternion.slerpQuaternions(kfs[cur_kf].quat, kfs[next_kf].quat, u);
    }

    requestAnimationFrame( animate );
    renderer.render( scene, camera );
}
//dt = d.getTime();
animate();

