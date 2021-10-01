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