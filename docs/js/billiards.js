import * as dat from "../lib/dat.gui.module.js";

let minVelocity = {
    value: 0.05,
  };

class physobject {
    constructor(obj, objMass, initVel = new THREE.Vector3(), initAcc = new THREE.Vector3(), 
                initAngVel = new THREE.Vector3(), inertia = new THREE.Vector3(), sMomentum = new THREE.Vector3(), objType) {
        this.obj = obj;
        this.mass = objMass;
        this.vel = initVel;
        this.acc = initAcc;
        this.momentum = initVel.multiplyScalar(objMass);
        this.angVel = initAngVel;
        this.inert = inertia;
        this.angMoment = (new THREE.Vector3()).crossVectors(initAngVel, inertia);
        this.objType = objType;
        this.pPos = obj.position;
        this.pRot = obj.rotation;
        this.pVel = this.vel;
        this.pAcc = this.acc;
        this.pMomentum = this.momentum;
        this.pAngVel = this.angVel;
        this.pAngMomentum = this.angMoment;
        this.storedMomentum  = sMomentum;
        this.storedForce = new THREE.Vector3();
    }

    storePriors() {
        this.pPos = this.obj.position.clone();
        this.pVel = this.vel.clone();
        this.pAcc = this.acc.clone();
        this.pMomentum = this.momentum.clone();
        this.pAngVel = this.angVel.clone();
        this.pAngMomentum = this.angMoment.clone();
    }

    resetToPriors() {
        this.obj.position.copy(this.pPos);
        this.vel.copy(this.pVel);
        this.acc.copy(this.pAcc);
        this.momentum.copy(this.pMomentum);
        this.angVel.copy(this.pAngVel);
        this.angMoment.copy(this.pAngMomentum);
    }

    integrate(dt) {
        let velCopy = new THREE.Vector3();
        velCopy.copy(this.vel);
        velCopy.multiplyScalar(dt);
        this.obj.position.add(velCopy);
        // get to rotation later, I guess? I don't know how to multiply a quaternion by a scalar in THREEJS
        // this.obj.applyQuaternion(this.obj.quaternion.multiply(new THREE.Quaternion(0,this.angVel.x,this.angVel.y,this.angVel.z)))
        
    }

    updateMomentum(dt) {
        let fCopy = (new THREE.Vector3()).copy(this.storedForce);
        fCopy.multiplyScalar(dt);
        this.momentum.add(fCopy);
        this.momentum.add(this.storedMomentum);
        // this.angMoment.add(torque.multiplyScalar(dt));
        this.storedMomentum = new THREE.Vector3();
        this.storedForce = new THREE.Vector3();
    }

    updateVels(impulseVel, impulseRot) {
        this.vel.copy(this.momentum);
        this.vel.divideScalar(this.mass);
        this.vel.add(impulseVel);
        let speed = Math.abs(this.vel.length());
        if(speed<minVelocity.value){
            this.vel = new THREE.Vector3();
        }
    }

    storeMomentum(rho_in) {
        this.storedMomentum.add(rho_in);
    }

    zeroMometum() {
        this.storedMomentum.set(0,0,0);
    }

    resetPosition(pos) {
        this.obj.position.copy(pos);
        this.vel.copy(new THREE.Vector3());
        this.momentum.copy(new THREE.Vector3());
        this.angVel.copy(new THREE.Vector3());
        this.angMoment.copy(new THREE.Vector3());
    }
}

// Our Javascript will go here.
const gui = new dat.gui.GUI();

gui.add(minVelocity,'value');

let cameraFolder = gui.addFolder('Camera');
let posFolder = cameraFolder.addFolder('Position');
let rotFolder = cameraFolder.addFolder('Rotation');
posFolder.add(camera.position,'x');
posFolder.add(camera.position,'y');
posFolder.add(camera.position,'z');
rotFolder.add(camera.position,'x');
rotFolder.add(camera.position,'y');
rotFolder.add(camera.position,'z');

let cueFolder = gui.addFolder('Cue');
cueFolder.add(cue.position,'x');
cueFolder.add(cue.position,'y');
cueFolder.add(cue.position,'z');
cueFolder.open();

let redFolder = gui.addFolder('Red Ball');
redFolder.add(ball1.position,'x');
redFolder.add(ball1.position,'y');
redFolder.add(ball1.position,'z');
redFolder.open();

let blueFolder = gui.addFolder('Blue Ball');
blueFolder.add(ball2.position,'x');
blueFolder.add(ball2.position,'y');
blueFolder.add(ball2.position,'z');
blueFolder.open();

camera.position.z = 0;
camera.position.y = 4;
camera.position.x = 0;
camera.rotation.x = -Math.PI/2;

// initial conditions:
let cueInitPos = (new THREE.Vector3()).copy(cue.position);
let ball1InitPos = (new THREE.Vector3()).copy(ball1.position);
let ball2InitPos = (new THREE.Vector3()).copy(ball2.position);

let cueInitRot = (new THREE.Vector3()).copy(cue.rotation);
let ball1InitRot = (new THREE.Vector3()).copy(ball1.rotation);
let ball2InitRot = (new THREE.Vector3()).copy(ball2.rotation);

let cueObj = new physobject(cue,ballMass,new THREE.Vector3(),new THREE.Vector3(),new THREE.Vector3(),new THREE.Vector3(),new THREE.Vector3(),'sphere');
let ball1Obj = new physobject(ball1,ballMass,new THREE.Vector3(),new THREE.Vector3(),new THREE.Vector3(),new THREE.Vector3(),new THREE.Vector3(),'sphere');
let ball2Obj = new physobject(ball2,ballMass,new THREE.Vector3(),new THREE.Vector3(),new THREE.Vector3(),new THREE.Vector3(),new THREE.Vector3(),'sphere');

cueObj.obj.geometry.computeBoundingSphere();
ball1Obj.obj.geometry.computeBoundingSphere();
ball2Obj.obj.geometry.computeBoundingSphere();
cueObj.obj.geometry.boundingSphere.radius = ballRadius;
ball1Obj.obj.geometry.boundingSphere.radius = ballRadius;
ball2Obj.obj.geometry.boundingSphere.radius = ballRadius;
cueObj.obj.frustumCulled = false;
ball1Obj.obj.frustumCulled = false;
ball2Obj.obj.frustumCulled = false;

let activeObjList = [cueObj,ball1Obj,ball2Obj];

let leftWall = new physobject(leftcube,10000,new THREE.Vector3(),new THREE.Vector3(),new THREE.Vector3(),new THREE.Vector3(),new THREE.Vector3(),'cube');
let topWall = new physobject(topcube,10000,new THREE.Vector3(),new THREE.Vector3(),new THREE.Vector3(),new THREE.Vector3(),new THREE.Vector3(),'cube');
let rightWall = new physobject(rightcube,10000,new THREE.Vector3(),new THREE.Vector3(),new THREE.Vector3(),new THREE.Vector3(),new THREE.Vector3(),'cube');
let botWall = new physobject(botcube,10000,new THREE.Vector3(),new THREE.Vector3(),new THREE.Vector3(),new THREE.Vector3(),new THREE.Vector3(),'cube');

let boxBounds = [leftWall,topWall,rightWall,botWall];

let raycaster = new THREE.Raycaster();

let curForces = new THREE.Vector3();
let curTorques = new THREE.Vector3();



const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

let doesAnimate = {
    value: false,
  };
let dt = 0;

let doesSimulate = {
    value:false,
  };

let iVel = {
    x:-2,
    y:0,
    z:2,
};

let coeffRes = {
    e:0.5,
}

let ballCoeffRes = {
    e:0.98
}

let coeffFric = {
    u:0.1
}


const hex = 0xffff00;
const iDir = new THREE.Vector3(iVel.x, iVel.y, iVel.z);

const arrowHelper = new THREE.ArrowHelper( iDir, cue.position, iDir.length(), hex);
scene.add( arrowHelper );

let initVelFolder = gui.addFolder('Initial Force');
initVelFolder.add(iVel,'x');
initVelFolder.add(iVel,'y');
initVelFolder.add(iVel,'z');
//initVelFolder.add(iForceScalar,'force');
initVelFolder.open();

gui.add(coeffRes,'e').name('Coeff of Rest');
gui.add(ballCoeffRes,'e').name('Ball CoR');
gui.add(coeffFric,'u').name('Friction');

let frameTime = 0;

let sim_button = {Simulate:function(){
    doesSimulate.value = true;
    doesAnimate.value = true;
    initTime = Date.now();
    frameTime = initTime;
    cueObj.vel = new THREE.Vector3(iVel.x,iVel.y,iVel.z);
    cueObj.momentum.copy(cueObj.vel);
    cueObj.momentum.multiplyScalar(cueObj.mass);    
    arrowHelper.visible = false;
}};

gui.add(sim_button,'Simulate');

let reset_button = {Reset:function(){
    doesSimulate.value = false;
    doesAnimate.value = false;
    initTime = 0;
    cueObj.resetPosition(cueInitPos);
    ball1Obj.resetPosition(ball1InitPos);
    ball2Obj.resetPosition(ball2InitPos);

    arrowHelper.visible = true;
}};

gui.add(reset_button,'Reset');

function setupInitStates() {

}

function deg_to_rad(degrees) {
    return degrees * (Math.PI/180);
}
renderer.render(scene,camera);
rightcube.geometry.boundingBox.applyMatrix4(rightcube.matrixWorld);
leftcube.geometry.boundingBox.applyMatrix4(leftcube.matrixWorld);
topcube.geometry.boundingBox.applyMatrix4(topcube.matrixWorld);
botcube.geometry.boundingBox.applyMatrix4(botcube.matrixWorld);

function findCollision(obj1,obj2,f1,t1,st,dt) {
    if(dt < 0.00001) {
        return st;
    }
    obj1.integrate(st + dt/2);
    let nt = st + dt/2;
    if(obj2.objType == 'cube'){
        if(obj1.obj.geometry.boundingSphere.intersectsBox(obj2.obj.geometry.boundingBox)){
            obj1.resetToPriors();
            nt = findCollision(obj1,obj2,f1,t1,st, dt/2);
        } else {
            raycaster.set(obj1.obj.position, obj1.vel);
            let intersects = raycaster.intersectObject(obj2.obj);
            let faceNorm = intersects[0].face.normal;
            if(faceNorm.length() - ballRadius < 0.00001 && faceNorm.length() - ballRadius > 0) {
                obj1.resetToPriors();
                return st;
            }
            obj1.resetToPriors();
            nt = findCollision(obj1,obj2,f1,t1,nt,dt/2);
        }
    }
    else {
        if(obj1.obj.geometry.boundingSphere.intersectsSphere(obj2.obj.geometry.boundingSphere)){
            obj1.resetToPriors();
            nt = findCollision(obj1,obj2,f1,t1,st, dt/2);
        } else {
            let distBetween = obj1.obj.position.distanceTo(obj2.obj.position);
            if( distBetween > 2*ballRadius && distBetween < (2 * ballRadius + 0.0001)) {
                obj1.resetToPriors();
                return st;
            }
            obj1.resetToPriors();
            nt = findCollision(obj1,obj2,f1,t1,nt,dt/2);
        }
    }
    return nt;
}

function animate() {
    if(doesAnimate.value && doesSimulate.value) {
        dt = Date.now() - frameTime;
        dt = dt/1000;
        frameTime = Date.now();
        for (let index = 0; index < activeObjList.length; index++) {
            let element = activeObjList[index];
            // store current state of object
            element.storePriors();
            // calculate forces, torques

            //curForces.add(element.storedForce);
            //let curTorques = new THREE.Vector3();
            let elVel = new THREE.Vector3();
            let speed = Math.abs(element.vel.length());
            if(speed>minVelocity.value){
                elVel.copy(element.vel);
                elVel.normalize();
                elVel.negate();
                curForces = new THREE.Vector3();
                curForces.copy(elVel);
                curForces.multiplyScalar(coeffFric.u*ballMass*9.8);
                element.storedForce.add(curForces);
            }
            // this should primarily be friction, no?
            // integrate pos/rot
            element.integrate(dt);
            // s(t +Dt) = s(t) + v(t)Dt
            // q(t +Dt) = q(t) + 0.5 (w(t)q(t)) Dt
            // normalize q(t+Dt)
            // R(t +Dt) = quatToRot(q(t +Dt) ) or set obj rotation to q(t+Dt)
            // update momentum:
            // M(t +Dt) = M(t) + F(t) Dt
            // L(t +Dt) = L(t) + t(t) Dt

            // do collision detection
            element.obj.geometry.boundingSphere.center = element.obj.position;
            for (let j = 0; j < activeObjList.length; j++) {
                if(j!=index){
                    let el2 = activeObjList[j];
                    el2.obj.geometry.boundingSphere.center = el2.obj.position;
                    if(element.obj.geometry.boundingSphere.intersectsSphere(el2.obj.geometry.boundingSphere)){
                        // do some stuff
                        element.resetToPriors();
                        let nt = findCollision(element,el2,curForces,curTorques,0,dt);
                        element.integrate(nt);

                        let collisionDir = new THREE.Vector3();
                        collisionDir.subVectors(el2.obj.position, element.obj.position);
                        collisionDir.normalize();
                        let negColDir = new THREE.Vector3();
                        negColDir.copy(collisionDir);
                        negColDir.negate();
                        let el1Dir = new THREE.Vector3();
                        let el2Dir = new THREE.Vector3();
                        // let vec1 = new THREE.Vector3();
                        // let vec2 = new THREE.Vector3();
                        // vec1.copy(element.vel);
                        // vec2.copy(el2.vel);
                        let impulseJmag = (element.mass * (ballCoeffRes.e + 1)/2) * (el2.vel.dot(negColDir) - element.vel.dot(collisionDir));
                        el1Dir.copy(collisionDir);
                        el1Dir.multiplyScalar(impulseJmag);
                        el2Dir.copy(negColDir);
                        el2Dir.multiplyScalar(impulseJmag);
                        //el2Dir.negate();

                        if(el2 == ball1Obj) {
                            console.log('Ball 1');
                        }

                        element.storedMomentum.add(el1Dir);
                        el2.storedMomentum.add(el2Dir);

                        console.log("Sphere collision");
                    }
                }
            }
            for (let j = 0; j < boxBounds.length; j++) {
                let b = boxBounds[j];
                //b.geometry.boundingBox.center = b.position;
                if(element.obj.geometry.boundingSphere.intersectsBox(b.obj.geometry.boundingBox)){
                    // do some stuff
                    element.resetToPriors();
                    let nt = findCollision(element,b,curForces,curTorques,0,dt);
                    element.integrate(nt);

                    raycaster.set(element.obj.position, element.vel);
                    let intersects = raycaster.intersectObject(b.obj);
                    let faceNorm = intersects[0].face.normal;
                    let newVelDir = new THREE.Vector3();
                    newVelDir.copy(element.vel);
                    newVelDir.reflect(faceNorm);
                    element.vel.copy(newVelDir);
                    // element.vel.multiplyScalar(0.5);
                    element.momentum = (new THREE.Vector3()).copy(newVelDir);
                    element.momentum.multiplyScalar(coeffRes.e * element.mass);
                    // calculate impulse
                    console.log("Box collision");
                }
                
            }
            curForces = new THREE.Vector3();
        };
        activeObjList.forEach(element => {
            element.updateMomentum(dt);
        });
        activeObjList.forEach(element => {
            element.updateVels(new THREE.Vector3(),new THREE.Vector3());
        })
        //dt = Date.now();
    }

    iDir.copy(iVel);
    arrowHelper.setLength(0.5 * iDir.length(), 2*ballRadius, ballRadius);
    arrowHelper.setDirection(iDir);

    requestAnimationFrame( animate );
    renderer.render( scene, camera );
}

animate();