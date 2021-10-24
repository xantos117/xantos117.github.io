const scene = new THREE.Scene();
const ballRadius = 0.05715/2;
const ballMass = 0.170097;
const camera = new THREE.PerspectiveCamera( 35, window.innerWidth / window.innerHeight, 0.1, 2000 );
const lbox = new THREE.BoxGeometry();
const rbox = new THREE.BoxGeometry();
const tbox = new THREE.BoxGeometry();
const bbox = new THREE.BoxGeometry();
const cueGeo = new THREE.SphereGeometry(ballRadius);
const ball1Geo = new THREE.SphereGeometry(ballRadius);
const ball2Geo = new THREE.SphereGeometry(ballRadius);
const geometry3 = new THREE.PlaneGeometry(2.84,1.42);
//const material = new THREE.MeshPhongMaterial({shininess: 10, color: 0x5F9EA0});
const material = new THREE.MeshPhongMaterial({shininess:1, color: 0x3ab503});
const ballMat1 = new THREE.MeshPhongMaterial({shininess:10, color: 0xCBCCC2});
const ballMat2 = new THREE.MeshPhongMaterial({shininess:10, color: 0xCC2936});
const ballMat3 = new THREE.MeshPhongMaterial({shininess:10, color: 0x388697});
const tablemat = new THREE.MeshBasicMaterial({color: 0x0a6c03})
const tableBase = new THREE.Mesh(geometry3, tablemat);
const rightcube = new THREE.Mesh( rbox, material );
const leftcube = new THREE.Mesh( lbox, material );
const topcube = new THREE.Mesh( tbox, material );
const botcube = new THREE.Mesh( bbox, material );
const cue = new THREE.Mesh(cueGeo, ballMat1 );
const ball1 = new THREE.Mesh(ball1Geo, ballMat2);
const ball2 = new THREE.Mesh(ball2Geo, ballMat3);
const light1 = new THREE.AmbientLight({hex: 0xffffff, intensity: 0.15});
const light2 = new THREE.PointLight(0xffffff, 0.3);
let d = new Date();

let initTime = 0;
cue.position.y += ballRadius;
cue.position.z = -0.2;
ball1.position.z = 0.2;
ball1.position.y += ballRadius;
ball1.position.x = -0.4;
ball2.position.x = -0.2;
ball2.position.y += ballRadius;
//sphere.position.y = 4;
tableBase.position.y = -ballRadius;
tableBase.position.x = 0;
tableBase.position.z = 0;
tableBase.rotation.x = -Math.PI/2;

rightcube.position.x = 1.425;
rightcube.scale.z = 1.62;
rightcube.scale.x = 0.1;
rightcube.scale.y = 0.25;

leftcube.position.x = -1.425;
leftcube.scale.z = 1.62;
leftcube.scale.x = 0.1;
leftcube.scale.y = 0.25;

topcube.position.z = 0.76;
topcube.scale.x = 2.9;
topcube.scale.z = 0.1;
topcube.scale.y = 0.25;

botcube.position.z = -0.76;
botcube.scale.x = 2.9;
botcube.scale.z = 0.1;
botcube.scale.y = 0.25;

scene.add(cue);
scene.add(ball1);
scene.add(ball2);
scene.add( tableBase );
scene.add(rightcube);
scene.add(leftcube);
scene.add(topcube);
scene.add(botcube);
scene.add( light1 );
scene.add( light2 );

light2.position.x = 5;
light2.position.y = 5;
light2.position.z = 5;

leftcube.geometry.computeBoundingBox();
topcube.geometry.computeBoundingBox();
rightcube.geometry.computeBoundingBox();
botcube.geometry.computeBoundingBox();
