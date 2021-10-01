import * as dat from "../lib/dat.gui.module.js";

// Our Javascript will go here.
const gui = new dat.gui.GUI();

class KeyFrame {
    constructor(time, x, y, z, xa, ya, za, theta) {
        this.time = parseFloat(time);
        this.position = new THREE.Vector3(parseFloat(x),parseFloat(y),parseFloat(z));
        this.quat = new THREE.Quaternion();
        var axis = new THREE.Vector3(parseFloat(xa), parseFloat(ya), parseFloat(za));
        this.quat.setFromAxisAngle( axis.normalize(), parseFloat(theta));
    }
}

camera.position.z = -30;
camera.position.y = 5;
camera.position.x = 10;

cube.scale.x = 1;
cube.scale.y = 1;
cube.scale.z = 1;

var cur_kf = 0;
var next_kf = 1;

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
    kfs.push(new KeyFrame(params[0], params[2], params[3], params[4], params[5], params[6], params[7], params[8]));
}

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

let doesAnimate = {
    value: false,
  };
let dt = 0;

let doesKeyFrame = {
    value: false,
};

let kf_button = {KeyFrame:function() {
    initTime = Date.now();
    doesKeyFrame.value = true;
    doesAnimate.value = true;
    dt = 0;
}}

gui.add(kf_button,'KeyFrame');

let reset_button = {Reset:function(){
    doesAnimate.value = false;
    dt = 0;
    // reset all the values we change.
    cube.rotation.y = 0;
    cube.position.x = 0;
    cube.position.z = 0;
    cur_kf = 0;
    next_kf = 1;
}};

gui.add(reset_button,'Reset');

function deg_to_rad(degrees) {
    return degrees * (Math.PI/180);
}

function animate() {
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
        cube.quaternion.slerpQuaternions(kfs[cur_kf].quat, kfs[next_kf].quat, u);
    }

    requestAnimationFrame( animate );
    renderer.render( scene, camera );
}

animate();