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

let m_catRom = new THREE.Matrix4();
m_catRom.set(
    -1, 3, -3, 1,
    2, -5, 4, -1,
    -1, 0, 1, 0,
    0, 2, 0, 0
);
m_catRom.multiplyScalar(0.5);

function catRom(p1, p2, p3, p4, u) {
    // let m_points = new THREE.Matrix4();
    // //console.log(p1);
    // m_points.set(
    //     p4.x, p4.y, p4.z, 0,
    //     p3.x, p3.y, p3.z, 0,
    //     p2.x, p2.y, p2.z, 0,
    //     p1.x, p1.y, p1.z, 0
    // );
    //console.log(m_points);
    // let mC = new THREE.Matrix4().multiplyMatrices(m_catRom,m_points);
    //console.log(mC);
    // let vU = new THREE.Vector4();
    // vU.set(u*u*u, u*u, u, 1);

    // Something is wack with the Catmull-Rom method in the slides...I found this on https://www.mvps.org/directx/articles/catmull/
    // 0.5 * ( ( 2*P1 ) + (-P0 + P2) * t + (2 * P0 - 5 * P1 + 4 * P2 - P3) * t*t + (-P0 + 3 * P1 - 3 * P2 + P3) * t * t * t)
    // I don't understand exactly how best to do a long vector operation like this in JS with THREE.js, so this is the eqn in pieces.
    let e1 = new THREE.Vector3(p2.x*2, p2.y*2, p2.z*2);
    let e2 = new THREE.Vector3(-1 * p1.x + p3.x, -1 * p1.y + p3.y, -1 * p1.z + p3.z);
    let e3 = new THREE.Vector3(2 * p1.x - 5 * p2.x + 4 * p3.x - p4.x, 2 * p1.y - 5 * p2.y + 4 * p3.y - p4.y, 2 * p1.z - 5 * p2.z + 4 * p3.z - p4.z);
    let e4 = new THREE.Vector3(-1 * p1.x + 3 * p2.x - 3 * p3.x + p4.x, -1 * p1.y + 3 * p2.y - 3 * p3.y + p4.y, -1 * p1.z + 3 * p2.z - 3 * p3.z + p4.z);
    let e5 = new THREE.Vector3().addVectors(e1,e2.multiplyScalar(u));
    let e6 = new THREE.Vector3().addVectors(e3.multiplyScalar(u*u), e4.multiplyScalar(u*u*u));
    let q = new THREE.Vector3().addVectors(e5,e6);
    q.multiplyScalar(0.5);
    // let mCarr = mC.elements;
    // let q1 = vU.x * mCarr[0] + vU.y * mCarr[4] + vU.z * mCarr[8] + vU.w * mCarr[12];
    // let q2 = vU.x * mCarr[1] + vU.y * mCarr[5] + vU.z * mCarr[9] + vU.w * mCarr[13];
    // let q3 = vU.x * mCarr[2] + vU.y * mCarr[6] + vU.z * mCarr[10] + vU.w * mCarr[14];
    // console.log(q1, q2, q3);
    // q.set(q1, q2, q3)
    console.log(q);

    return q;
}

function genPriorPt(p1, p2) {
    let t = new THREE.Vector3().subVectors(p1, p2);
    return new THREE.Vector3().addVectors(p1, t);
}

function genPostPt(p1,p2) {
    let t = new THREE.Vector3().subVectors(p2, p1);
    return new THREE.Vector3().addVectors(p2, t);
}

let doesAnimate = {
    value: false,
  };
let dt = 0;

let doesKeyFrame = {
    value: false,
};

let doesCatRom = {
    value: false,
};

let kf_button = {KeyFrame:function() {
    initTime = Date.now();
    doesKeyFrame.value = true;
    doesAnimate.value = true;
    dt = 0;
}}

gui.add(kf_button,'KeyFrame');

let catRom_button = {CatmullRom:function(){
    initTime = Date.now();
    doesKeyFrame.value = true;
    doesAnimate.value = true;
    dt = 0;
    doesCatRom.value = true;
    let tempKF1 = JSON.parse(JSON.stringify(kfs[0]));
    let tempKF2 = JSON.parse(JSON.stringify(kfs[kfs.length-1]));
    tempKF1.position = genPriorPt(kfs[0].position, kfs[1].position)
    let n = kfs.unshift(tempKF1);
    tempKF2.position  = genPostPt(kfs[kfs.length-2].position, kfs[kfs.length-1].position)
    kfs.push(tempKF2);
    cur_kf = 1;
    next_kf = 2;
    console.log(kfs);
}};

gui.add(catRom_button,'CatmullRom');

let reset_button = {Reset:function(){
    doesAnimate.value = false;
    dt = 0;
    // reset all the values we change.
    cube.rotation.y = 0;
    cube.position.x = 0;
    cube.position.z = 0;
    cur_kf = 0;
    next_kf = 1;
    if(doesCatRom.value) {
        kfs.pop();
        kfs.shift();
    }
    doesCatRom.value = false;
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
            console.log(kfs[cur_kf], kfs[next_kf]);
            let o_set = doesCatRom.value ? 1 : 0;
            if(next_kf >= kfs.length - o_set) {
                next_kf = 0;
                doesAnimate.value = false;
                doesKeyFrame.value = false;
            }
        }
        var curTime = dt - kfs[cur_kf].time * 1000;
        var frameGap = (kfs[next_kf].time - kfs[cur_kf].time) * 1000;
        var u = curTime/frameGap;
        if(!doesCatRom.value){
            cube.position.lerpVectors(kfs[cur_kf].position,kfs[next_kf].position,u);
            cube.quaternion.slerpQuaternions(kfs[cur_kf].quat, kfs[next_kf].quat, u);
        } else {
            let nPos = catRom(kfs[cur_kf - 1].position, kfs[cur_kf].position, kfs[next_kf].position, kfs[next_kf+1].position, u);
            //console.log(nPos);
            cube.position.set(nPos.x, nPos.y, nPos.z);
            cube.quaternion.slerpQuaternions(kfs[cur_kf].quat, kfs[next_kf].quat, u);
        }
        //console.log(cube.position);
    }

    requestAnimationFrame( animate );
    renderer.render( scene, camera );
}

animate();