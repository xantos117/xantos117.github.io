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
        this.mesh = new THREE.Mesh(new THREE.BoxGeometry(), new THREE.MeshNormalMaterial());
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
        // let curVal = nProcessed;
        // let tMat = new THREE.Matrix4();
        // let rMat = new THREE.Matrix4();
        // for (let index = 0; index < this.channels.length; index++) {
        //     const chanName = this.channels[index];
        //     const value = parseFloat(lineVals[curVal+index]);
        //     let nMat = new THREE.Matrix4();
        //     switch(chanName){
        //         case 'Xposition':
        //             nMat.makeTranslation(value,0,0);
        //             tMat.multiply(nMat);
        //         case 'Yposition':
        //             nMat.makeTranslation(0,value,0);
        //             tMat.multiply(nMat);
        //         case 'Zposition':
        //             nMat.makeTranslation(0,0,value);
        //             tMat.multiply(nMat);
        //         case 'Xrotation':
        //             nMat.makeRotationX(value);
        //             rMat.multiply(nMat);
        //         case 'Yrotation':
        //             nMat.makeRotationY(value);
        //             rMat.multiply(nMat);
        //         case 'Zrotation':
        //             nMat.makeRotationZ(value);
        //             rMat.multiply(nMat);
        //     }  
        // }
        // this.rotMat.copy(rMat);
        // this.xlateMat.copy(tMat);
        // nProcessed += (this.channels.length-1);

        return nProcessed;
    }
    print(n_indent) {
        let tabs = '\t';
        let indentString = tabs.repeat(n_indent);
        let nStr =  indentString + 'END SITE\n';
        let vStr = indentString + '\t' + this.offset + '\n'
        return nStr + vStr;
    }
}

class Joint {
    constructor(j_name,parent) {
        this.name = j_name
        this.offset = new THREE.Vector3();
        this.channels = [];
        this.joints = [];
        this.parent = parent;
        this.mesh = new THREE.Mesh(new THREE.BoxGeometry(), new THREE.MeshNormalMaterial());
        this.line = null;
        this.xlateMat = new THREE.Matrix4();
        this.rotMat = new THREE.Matrix4();
    }
    
    init(lines, start_index) {
        let cur_index = start_index;
        let offsetVec = lines[cur_index].trim().split('\t');
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
            let geo = new THREE.CylinderGeometry(0.5,0.5,tVec.distanceTo(pVec),32);
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
        scene.add(this.mesh);
        cur_index++;
        let chanVals = lines[cur_index].trim().split('\t');
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
                cur_index++;
            }
            else if(lineVals[0] == 'End') {
                cur_index += 2;
                let offsetVals = lines[cur_index].trim().split('\t');
                let lineName = offsetVals.shift();
                if(lineName = 'OFFSET') {
                    let e = new EndSite(offsetVals,this);
                    this.joints.push(e);
                }
                cur_index += 2;
            }
        }

        return cur_index;
    }

    update() {
        //console.log("Updating "+this.name);
        let tempMat = new THREE.Matrix4();
        this.mesh.rotation.set(0,0,0);
        //this.mesh.updateMatrix();
        this.mesh.updateMatrixWorld(true);
        if(this.parent) {
            this.line.updateMatrixWorld(true);
            tempMat.multiplyMatrices(this.parent.mesh.matrixWorld,this.xlateMat);
        }
        else {
            tempMat.multiply(this.xlateMat);
        }
        //tempMat.multiply(this.rotMat);
        this.mesh.position.setFromMatrixPosition(tempMat);
        //this.mesh.matrixWorld.copy(tempMat);
        //this.mesh.updateMatrixWorld(true);
        // let q = new THREE.Quaternion().setFromRotationMatrix(tempMat);
        // this.mesh.quaternion.multiply(q);
        this.mesh.rotation.setFromRotationMatrix(this.rotMat);
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
        for (let index = 0; index < this.joints.length; index++) {
            const element = this.joints[index];
            element.update();
        }
        // this.joints.forEach(element => {
        //     element.update();
        // });
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
}

class Skeleton {
    constructor(root_node) {
        this.root = root_node;
        this.objType = 'point';
    }
    addToRenderer(renderer) {

    }
}


var file = '../Circle.bvh';
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
let braceStack = [];
let buildHierarchy = false;
let readAngles = false;


const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );


camera.position.z = 400;
// camera.position.y = 20;
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
let line_num = 0;
let root = null;
let nFrames = 0;
let fTime = 0;
let readFrames = false;
let frameLines = [];
while(line_num < lines.length) {
    if(lines[line_num].trim() == "HIERARCHY") {
        buildHierarchy = true;
    }
    else if(buildHierarchy) {
        let lsplit = lines[line_num].trim().split(' ');
        if(lsplit[0] == 'ROOT') {
            root = new Joint(lsplit[1],null);
            line_num = root.init(lines,line_num+2);
            buildHierarchy = false;
        }
    }
    if(lines[line_num].trim() == 'MOTION') {
        line_num++;
        let lsplit = lines[line_num].trim().split('\t');
        nFrames = parseInt(lsplit[1]);
        line_num++;
        lsplit = lines[line_num].trim().split('\t');
        fTime = parseFloat(lsplit[1]);
        readFrames = true;
    }else if(readFrames){
        frameLines.push(lines[line_num]);
    }
    line_num++;
}

const gui = new dat.gui.GUI();

console.log(root.print(0));
console.log(frameLines);

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
}}

let bvhFile = {Filename:'Circle.bvh'};


gui.add(animate_button,'Animate');
gui.add(step_button,'Step');
gui.add(jump_button,'Jump');
gui.add(reset_button,'Reset');
gui.add(bvhFile,'Filename',['Circle.bvh','Ambient.bvh','Jog.bvh','Sit.bvh']);

let initTime = Date.now();
let timeWarp = 1;

function degreesToRadians(degrees)
{
  var pi = Math.PI;
  return degrees * (pi/180);
}

function animate() {
    let curFrame = (Date.now() - initTime)/1000;
    if(doesAnimate.value) {
        frameNum.value = Math.floor(curFrame/(fTime*timeWarp));
        if(frameNum.value < frameLines.length) {
            let keyVals = frameLines[frameNum.value].trim().split('\t');
            root.setKeys(keyVals,0);
        }
    }
    // root.joints[0].line.rotation.x += 0.1;
    // let rotStep = new THREE.Matrix4().makeRotationX(0.1);
    // root.joints[0].rotMat.multiply(rotStep);
    
    if(!doesAnimate.value && step.value && frameNum.value < frameLines.length) {
        let keyVals = frameLines[frameNum.value].trim().split('\t');
        root.setKeys(keyVals,0);
        step.value = false;
        frameNum.value++;
    }
    //root.xlateMat.premultiply(new THREE.Matrix4().makeTranslation(0.1,0,0));
    root.update();

    camera.position.copy(root.mesh.position);
    camera.position.add(new THREE.Vector3(0,0,400));

    requestAnimationFrame( animate );
    renderer.render( scene, camera );
}

animate();