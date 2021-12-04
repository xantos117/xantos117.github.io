import * as dat from "../lib/dat.gui.module.js";

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 35, window.innerWidth / window.innerHeight, 0.1, 2000 );

const material = new THREE.MeshBasicMaterial({
	color: 0x0000ff
});

class EndSite {
    constructor(offsetVec,parent){
        this.offset = new THREE.Vector3()
        this.offset.x = parseFloat(offsetVec[0]);
        this.offset.y = parseFloat(offsetVec[1]);
        this.offset.z = parseFloat(offsetVec[2]);
        this.parent = parent;
        this.mesh = new THREE.Mesh(new THREE.BoxGeometry(2,2,2), new THREE.MeshNormalMaterial());
        this.xlateMat = new THREE.Matrix4();
        this.rotMat = new THREE.Matrix4();
        this.xlateMat.makeTranslation(this.offset.x,this.offset.y,this.offset.z);
        // this.mesh.position.set(this.offset.x,this.offset.y,this.offset.z);
        // this.mesh.position.add(this.parent.mesh.position);
        let tempMat = new THREE.Matrix4();
        tempMat.multiplyMatrices(this.xlateMat,this.parent.mesh.matrixWorld);
        this.mesh.applyMatrix4(tempMat);
        let points = [this.mesh.position, this.parent.mesh.position];
        let geo = new THREE.CylinderGeometry(1,1,this.mesh.position.distanceTo(this.parent.mesh.position),32);
        this.line = new THREE.Mesh(geo,material);
        this.line.applyMatrix4(tempMat);
        this.mesh.updateMatrixWorld();
        let nVec = new THREE.Vector3();
        this.mesh.getWorldPosition(nVec);
        this.min_y = nVec.y;
        scene.add(this.mesh);
        scene.add(this.line);
    }
    update() {
        let tempMat = new THREE.Matrix4();
        tempMat.multiplyMatrices(this.parent.mesh.matrixWorld,this.xlateMat);
        this.mesh.position.setFromMatrixPosition(tempMat);
        // this.mesh.applyMatrix4(this.rotMat);
        this.mesh.rotation.setFromRotationMatrix(this.parent.rotMat);
        this.mesh.updateMatrixWorld(true);
        let pVec = new THREE.Vector3();
        let tVec = new THREE.Vector3();
        this.mesh.getWorldPosition(tVec);
        this.parent.mesh.getWorldPosition(pVec);
        let dirVec = new THREE.Vector3().subVectors(tVec,pVec);
        let axis = new THREE.Vector3(0,1,0);
        this.line.position.copy(dirVec.clone().multiplyScalar(0.5)).add(pVec);
        this.line.quaternion.setFromUnitVectors(axis,dirVec.clone().normalize());
    }
    setKeys(lineVals,nProcessed) {

        return nProcessed;
    }
    print(n_indent) {
        let tabs = '\t';
        let indentString = tabs.repeat(n_indent);
        let nStr =  indentString + 'END SITE\n';
        let vStr = indentString + '\t' + this.offset + '\n'
        return nStr + vStr;
    }
    remove() {
        this.mesh.geometry.dispose();
        this.mesh.material.dispose();
        scene.remove(this.mesh);
        this.line.geometry.dispose();
        this.line.material.dispose();
        scene.remove(this.line);
        delete(this.mesh);
        delete(this.line);
    }
}

class Joint {
    constructor(j_name,parent) {
        this.name = j_name
        this.offset = new THREE.Vector3();
        this.channels = [];
        this.joints = [];
        this.parent = parent;
        this.mesh = new THREE.Mesh(new THREE.BoxGeometry(2,2,2), new THREE.MeshNormalMaterial());
        this.line = null;
        this.xlateMat = new THREE.Matrix4();
        this.rotMat = new THREE.Matrix4();
        this.min_y = 0;
    }
    
    init(lines, start_index) {
        let cur_index = start_index;
        let offsetVec = lines[cur_index].trim().split(/[ \t]+/);
        this.offset.x = parseFloat(offsetVec[1]);
        this.offset.y = parseFloat(offsetVec[2]);
        this.offset.z = parseFloat(offsetVec[3]);
        this.xlateMat.makeTranslation(this.offset.x,this.offset.y,this.offset.z);
        //this.mesh.position.set(this.offset.x,this.offset.y,this.offset.z);
        if(this.parent) {
            //this.mesh.position.add(this.parent.mesh.position);
            let tempMat = new THREE.Matrix4();
            tempMat.multiplyMatrices(this.xlateMat,this.parent.mesh.matrixWorld);
            this.mesh.applyMatrix4(tempMat);
            this.mesh.updateMatrixWorld(true);
            let pVec = new THREE.Vector3();
            let tVec = new THREE.Vector3();
            this.mesh.getWorldPosition(tVec);
            this.parent.mesh.getWorldPosition(pVec);
            let dirVec = new THREE.Vector3().subVectors(tVec,pVec);
            let cylHeight = tVec.distanceTo(pVec);
            if(isNaN(cylHeight)) {
                cylHeight = 0.01;
            }
            let geo = new THREE.CylinderGeometry(0.5,0.5,cylHeight,32);
            this.line = new THREE.Mesh(geo,material);
            let axis = new THREE.Vector3(0,1,0);
            this.line.position.copy(dirVec.clone().multiplyScalar(0.5)).add(pVec);
            this.line.quaternion.setFromUnitVectors(axis,dirVec.clone().normalize());
            //this.line.applyMatrix4(tempMat);
            scene.add(this.line);
        } else {
            let tempMat = new THREE.Matrix4();
            tempMat.multiply(this.xlateMat);
            this.mesh.applyMatrix4(tempMat);
        }
        this.mesh.updateMatrixWorld();
        let nVec = new THREE.Vector3();
        this.mesh.getWorldPosition(nVec);
        if(nVec.y < this.min_y) {
            this.min_y = nVec.y;
        }
        scene.add(this.mesh);
        cur_index++;
        let chanVals = lines[cur_index].trim().split(/[ \t]+/);
        for(let i = 2;i<2+parseInt(chanVals[1]);i++) {
            this.channels.push(chanVals[i]);
        }
        cur_index++;
        while(lines[cur_index].trim() != '}') {
            let lineVals =lines[cur_index].trim().split(' ');
            if(lineVals[0] == 'JOINT') {
                let j = new Joint(lineVals[1],this);
                cur_index = j.init(lines,cur_index+2);
                this.joints.push(j);
                if(j.min_y < this.min_y) {
                    this.min_y = j.min_y;
                }
                cur_index++;
            }
            else if(lineVals[0] == 'End') {
                cur_index += 2;
                let offsetVals = lines[cur_index].trim().split(/[ \t]+/);
                let lineName = offsetVals.shift();
                if(lineName == 'OFFSET') {
                    let e = new EndSite(offsetVals,this);
                    this.joints.push(e);
                    if(e.min_y < this.min_y) {
                        this.min_y = e.min_y;
                    }
                }
                cur_index += 2;
            }
        }

        return cur_index;
    }

    update() {
        //console.log("Updating "+this.name);
        let tempMat = new THREE.Matrix4();
        let tRotMat = new THREE.Matrix4();
        this.mesh.rotation.set(0,0,0);
        //this.mesh.updateMatrix();
        this.mesh.updateMatrixWorld(true);
        if(this.parent) {
            this.parent.mesh.updateMatrixWorld(true);
            this.line.updateMatrixWorld(true);
            tempMat.multiplyMatrices(this.parent.mesh.matrixWorld,this.xlateMat);
            tRotMat.makeRotationFromEuler(this.parent.mesh.rotation);
            tRotMat.multiply(this.rotMat);
        }
        else {
            tempMat.multiply(this.xlateMat);
            tRotMat.multiply(this.rotMat);
        }
        //tempMat.premultiply(this.rotMat);
        this.mesh.position.setFromMatrixPosition(tempMat);
        //this.mesh.matrixWorld.copy(tempMat);
        //this.mesh.updateMatrixWorld(true);
        // let q = new THREE.Quaternion().setFromRotationMatrix(tempMat);
        // this.mesh.quaternion.multiply(q);
        this.mesh.rotation.setFromRotationMatrix(tRotMat);
        //this.mesh.updateMatrixWorld(true);
        if(this.line){
            // this.line.position.setFromMatrixPosition(tempMat);
            // this.line.updateMatrixWorld(true);
            this.line.rotation.set(0,0,0);
            this.line.updateMatrix();
            let pVec = new THREE.Vector3();
            let tVec = new THREE.Vector3();
            this.mesh.getWorldPosition(tVec);
            this.parent.mesh.getWorldPosition(pVec);
            let dirVec = new THREE.Vector3().subVectors(tVec,pVec);
            let axis = new THREE.Vector3(0,1,0);
            this.line.position.copy(dirVec.clone().multiplyScalar(0.5)).add(pVec);
            this.line.quaternion.setFromUnitVectors(axis,dirVec.clone().normalize());

            //this.line.applyMatrix4(trmat);
            //this.line.updateMatrixWorld(true);
        }
        // for (let index = 0; index < this.joints.length; index++) {
        //     const element = this.joints[index];
        //     element.update();
        // }
        this.joints.forEach(element => {
            element.update();
        });
    }

    setKeys(lineVals,nProcessed) {
        let curVal = nProcessed;
        this.xlateMat.makeTranslation(this.offset.x,this.offset.y,this.offset.z);
        let tMat = new THREE.Matrix4();
        let rMat = new THREE.Matrix4();
        for (let index = 0; index < this.channels.length; index++) {
            const chanName = this.channels[index];
            const value = parseFloat(lineVals[curVal+index]);
            let nMat = new THREE.Matrix4();
            switch(chanName){
                case 'Xposition':
                    nMat.makeTranslation(value,0,0);
                    tMat.multiply(nMat);
                    break;
                case 'Yposition':
                    nMat.makeTranslation(0,value,0);
                    tMat.multiply(nMat);
                    break;
                case 'Zposition':
                    nMat.makeTranslation(0,0,value);
                    tMat.multiply(nMat);
                    break;
                case 'Xrotation':
                    nMat.makeRotationX(degreesToRadians(value));
                    rMat.multiply(nMat);
                    break;
                case 'Yrotation':
                    nMat.makeRotationY(degreesToRadians(value));
                    rMat.multiply(nMat);
                    break;
                case 'Zrotation':
                    nMat.makeRotationZ(degreesToRadians(value));
                    rMat.multiply(nMat);
                    break;
            }  
        }
        this.rotMat.copy(rMat);
        this.xlateMat.premultiply(tMat);
        nProcessed += (this.channels.length);
        for (let index = 0; index < this.joints.length; index++) {
            const element = this.joints[index];
            nProcessed = element.setKeys(lineVals,nProcessed);
        }
        return nProcessed;
        
    }

    print(n_indent) {
        let tabs = '\t';
        let indentString = tabs.repeat(n_indent);
        let nameStr = indentString + this.name + '\n';
        let offsetString = indentString + 'OFFSET ' + this.offset + '\n';
        let chanString = indentString + 'CHANNELS ' + this.channels.length + ' ';
        for (let index = 0; index < this.channels.length; index++) {
            const val = this.channels[index];
            chanString += (' ' + val);
        }
        chanString += '\n'
        let jString = '';
        for (let index = 0; index < this.joints.length; index++) {
            const element = this.joints[index];
            jString += element.print(n_indent+1);
        }
        jString += '\n';
        return nameStr + offsetString + chanString + jString;
    }
    remove() {
        this.mesh.geometry.dispose();
        this.mesh.material.dispose();
        scene.remove(this.mesh);
        if(this.parent){
            this.line.geometry.dispose();
            this.line.material.dispose();
            scene.remove(this.line);
            delete(this.line);
        }
        delete(this.mesh);
        for (let index = 0; index < this.joints.length; index++) {
            const element = this.joints[index];
            element.remove();
            delete(this.joints[index]);
        }
        delete(this.joints);
    }
}

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );


camera.position.z = 400;
camera.position.y = 100;
// camera.position.x = 100;
// camera.rotation.y = degreesToRadians(30);
/*
* Structure:
* Root
*   - Offset
*   - Channels
*   - N Joints
* 
* Joint
*   - Offset
*   - Channels
*   - N Joints
*/
function readBVH(fileName) {
    let rawFile = new XMLHttpRequest();
    let allText = 'ERROR';
    rawFile.open("GET", 'bvh/'+fileName, false);
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

    let bvhStruct = {
        line_num: 0,
        root: null,
        nFrames: 0,
        fTime: 0,
        frameLines: [],
        min_y: 0,
    }
    let buildHierarchy = false;
    let readFrames = false;
    while(bvhStruct.line_num < lines.length) {
        if(lines[bvhStruct.line_num].trim() == "HIERARCHY") {
            buildHierarchy = true;
        }
        else if(buildHierarchy) {
            let lsplit = lines[bvhStruct.line_num].trim().split(' ');
            if(lsplit[0] == 'ROOT') {
                bvhStruct.root = new Joint(lsplit[1],null);
                bvhStruct.line_num = bvhStruct.root.init(lines,bvhStruct.line_num+2);
                bvhStruct.min_y = bvhStruct.root.min_y;
                const geometry3 = new THREE.BoxGeometry(1000,1,1000);
                const tablemat = new THREE.MeshBasicMaterial({color: 0x0a6c03})
                const tableBase = new THREE.Mesh(geometry3, tablemat);
                tableBase.position.y = bvhStruct.min_y;
                camera.position.z = 5 * Math.abs(bvhStruct.min_y);
                camera.position.y = 2 * Math.abs(bvhStruct.min_y);
                scene.add(tableBase);
                buildHierarchy = false;
            }
        }
        if(lines[bvhStruct.line_num].trim() == 'MOTION') {
            bvhStruct.line_num++;
            let lsplit = lines[bvhStruct.line_num].trim().split(/[ \t]+/);
            bvhStruct.nFrames = parseInt(lsplit[1]);
            bvhStruct.line_num++;
            lsplit = lines[bvhStruct.line_num].trim().split(/[ \t]+/);
            bvhStruct.fTime = parseFloat(lsplit[2]);
            readFrames = true;
        }else if(readFrames){
            bvhStruct.frameLines.push(lines[bvhStruct.line_num]);
        }
        bvhStruct.line_num++;
    }
    return bvhStruct;
}


const gui = new dat.gui.GUI();

let doesAnimate = {
    value: false,
};

let animate_button = {Animate:function() {
    doesAnimate.value = true;
    initTime = Date.now();
}}

let step = { value: false };
let step_button = {Step:function(){
    step.value = true;
}};

let frameNum = {value: 0};
let reset_button = {Reset:function() {
    step.value = false;
    frameNum.value = 0;
    doesAnimate.value = false;
}};

let jump_button = {Jump:function() {
    frameNum.value += 10;
}};

let bvhFile = {Filename:'Ambient.bvh'};

let bvhStruct = readBVH(bvhFile.Filename);

let load_button = {Load:function() {
    if(bvhStruct) {
        bvhStruct.root.remove();
    }
    bvhStruct = readBVH(bvhFile.Filename);
}};

let stick_camera = {Stick_to_camera: false};
let cam_dist = {distance: 400};
let cam_height = {height: 100};

let stick_cam_button = {Stick_to_camera:function(){
    stick_camera.Stick_to_camera = !stick_camera.Stick_to_camera;
}};

let fileList = [
    'Ambient.bvh',
    'Arms.bvh',
    'Circle.bvh',
    'Example1.bvh',
    'Jog.bvh',
    'karate-03-spin kick-yokoyama.bvh',
    'karate-03-spin kick-yokoyama.bvh',
    'karate-04-back spin kick 1-yokoyama.bvh',
    'karate-05-back spin kick 2-yokoyama.bvh',
    'karate-07-kakato otoshi-yokoyama.bvh',
    'karate-12-double punch-yokoyama.bvh',
    'Legs.bvh',
    'Pick up.bvh',
    'Sit.bvh',
    'Sneak.bvh',
    'Stand.bvh',
    'tiptoe.bvh',
    'turn.bvh',
    'wave.bvh',
]



gui.add(animate_button,'Animate');
gui.add(step_button,'Step');
gui.add(jump_button,'Jump');
gui.add(reset_button,'Reset');
gui.add(bvhFile,'Filename',fileList);
gui.add(load_button,'Load');
gui.add(stick_cam_button,'Stick_to_camera');

let initTime = Date.now();
let timeWarp = {Warp: 1};

gui.add(cam_dist,'distance',10,1000).step(10);
gui.add(cam_height,'height',10,1000).step(10);
gui.add(timeWarp,'Warp',0.1,2).step(0.1);

function degreesToRadians(degrees)
{
  var pi = Math.PI;
  return degrees * (pi/180);
}

function animate() {
    if(bvhStruct){
        let curFrame = (Date.now() - initTime)/1000;
        if(doesAnimate.value) {
            frameNum.value = Math.floor(curFrame*timeWarp.Warp/bvhStruct.fTime);
            if(frameNum.value < bvhStruct.frameLines.length) {
                let keyVals = bvhStruct.frameLines[frameNum.value].trim().split(/[ \t]+/);
                bvhStruct.root.setKeys(keyVals,0);
            }
        }
        // root.joints[0].line.rotation.x += 0.1;
        // let rotStep = new THREE.Matrix4().makeRotationY(0.1);
        // bvhStruct.root.rotMat.multiply(rotStep);
        
        if(!doesAnimate.value && step.value && frameNum.value < bvhStruct.frameLines.length) {
            let keyVals = bvhStruct.frameLines[frameNum.value].trim().split(/[ \t]+/);
            bvhStruct.root.setKeys(keyVals,0);
            step.value = false;
            frameNum.value++;
        }
        //root.xlateMat.premultiply(new THREE.Matrix4().makeTranslation(0.1,0,0));
        bvhStruct.root.update();

        if(stick_camera.Stick_to_camera){
            camera.position.copy(bvhStruct.root.mesh.position);
            camera.position.add(new THREE.Vector3(0,0,cam_dist.distance));
        } else {
            camera.lookAt(bvhStruct.root.mesh.position);
            camera.position.z = cam_dist.distance;
            camera.position.y = cam_height.height;
        }

    }
    
    requestAnimationFrame( animate );
    renderer.render( scene, camera );
}

animate();