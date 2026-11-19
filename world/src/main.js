import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
const scene=new THREE.Scene();scene.background=new THREE.Color(0x7a3c91);scene.fog=new THREE.FogExp2(0x9b559e,0.012);
const camera=new THREE.PerspectiveCamera(65,innerWidth/innerHeight,.1,500);const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.shadowMap.enabled=true;document.body.prepend(renderer.domElement);
scene.add(new THREE.HemisphereLight(0xffb5df,0x202c5a,2));const sun=new THREE.DirectionalLight(0xff9a5a,2.2);sun.position.set(-30,60,-40);scene.add(sun);
const mat=(c)=>new THREE.MeshStandardMaterial({color:c,roughness:.6});
function block(w,h,d,x,y,z,m){const a=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);a.position.set(x,y,z);scene.add(a);return a}
block(240,.3,240,0,-.2,0,mat(0x24203a));
const road=mat(0x111322),walk=mat(0x4c4260);block(18,.04,220,0,.01,0,road);block(220,.04,18,0,.02,0,road);
for(let i=-90;i<100;i+=12){block(.25,.06,5,0,.07,i,mat(0xffd7a5));block(5,.06,.25,i,.08,0,mat(0xffd7a5))}
const buildings=[];const colors=[0x30204e,0x443056,0x2b315e,0x4a2852];
for(let x=-90;x<=90;x+=22)for(let z=-90;z<=90;z+=22){if(Math.abs(x)<15||Math.abs(z)<15)continue;const h=9+((Math.abs(x*7+z*3)%19));const building=block(16,h,16,x,h/2,z,mat(colors[Math.abs(x+z)%4]));buildings.push({x,z,half:8});for(let y=3;y<h-1;y+=4)for(let k=-5;k<=5;k+=5){block(1.4,1.7,.07,x+k,y,z+8.04,mat((y+k)%3?0xffbc76:0x6fd8ff))}}
const cityMeshes=scene.children.filter(o=>o.isMesh);
const player=new THREE.Group();const torso=block(1.25,1.7,.65,0,1.65,0,mat(0x1151df));scene.remove(torso);player.add(torso);torso.position.set(0,1.65,0);const head=new THREE.Mesh(new THREE.SphereGeometry(.43,16,12),mat(0x89533b));head.position.y=2.8;player.add(head);const cap=new THREE.Mesh(new THREE.CylinderGeometry(.46,.46,.18,16),mat(0x0d37ac));cap.position.y=3.13;player.add(cap);for(const s of [-1,1]){const arm=new THREE.Mesh(new THREE.BoxGeometry(.35,1.35,.4),mat(0x164de1));arm.position.set(s*.82,1.6,0);player.add(arm);const leg=new THREE.Mesh(new THREE.BoxGeometry(.43,1.05,.48),mat(0x17244b));leg.position.set(s*.33,.52,0);player.add(leg)}scene.add(player);
// Original crew companions, street lighting, and a Queensbridge-inspired district.
function crewMember(x,z,jacket){const g=new THREE.Group();const shirt=new THREE.Mesh(new THREE.BoxGeometry(1.2,1.6,.65),mat(jacket));shirt.position.y=1.65;g.add(shirt);const face=new THREE.Mesh(new THREE.SphereGeometry(.42,12,12),mat(0x845239));face.position.y=2.78;g.add(face);for(const side of [-1,1]){const leg=new THREE.Mesh(new THREE.BoxGeometry(.4,1,.45),mat(0x171522));leg.position.set(side*.32,.5,0);g.add(leg)}g.position.set(x,0,z);scene.add(g);return g}
const companions=[crewMember(-3,3,0x191923),crewMember(3,3,0xc01434)];
const glowMat=new THREE.MeshBasicMaterial({color:0x41cfff});
for(let z=-90;z<=90;z+=24)for(const x of [-11,11]){const pole=new THREE.Mesh(new THREE.CylinderGeometry(.08,.11,7,8),mat(0x282838));pole.position.set(x,3.5,z);scene.add(pole);const lamp=new THREE.Mesh(new THREE.SphereGeometry(.35,8,8),glowMat);lamp.position.set(x,7,z);scene.add(lamp);const light=new THREE.PointLight(0x41cfff,3,13);light.position.set(x,7,z);scene.add(light)}
const sign=document.createElement('canvas');sign.width=512;sign.height=128;const ctx=sign.getContext('2d');ctx.fillStyle='#130f33';ctx.fillRect(0,0,512,128);ctx.font='bold 54px Arial';ctx.textAlign='center';ctx.fillStyle='#39d7ff';ctx.fillText('WISE² CARTOOLS',256,80);const billboard=new THREE.Mesh(new THREE.PlaneGeometry(12,3),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(sign),side:THREE.DoubleSide}));billboard.position.set(-15,8,-25);billboard.rotation.y=Math.PI/2;scene.add(billboard);
const marker=new THREE.Mesh(new THREE.TorusGeometry(2,.2,10,32),new THREE.MeshBasicMaterial({color:0x31edff}));marker.position.set(0,2,-30);scene.add(marker);const beacon=new THREE.PointLight(0x31edff,12,14);beacon.position.set(0,2,-30);scene.add(beacon);
const car=new THREE.Group();const body=new THREE.Mesh(new THREE.BoxGeometry(3,1.1,6),mat(0x123fc6));body.position.y=1.05;car.add(body);const roof=new THREE.Mesh(new THREE.BoxGeometry(2.5,.85,2.8),mat(0x10182f));roof.position.set(0,1.95,-.3);car.add(roof);for(const x of [-1.45,1.45])for(const z of [-1.8,1.8]){const wheel=new THREE.Mesh(new THREE.CylinderGeometry(.65,.65,.35,16),mat(0x08080e));wheel.rotation.z=Math.PI/2;wheel.position.set(x,.68,z);car.add(wheel)}car.position.set(8,0,-12);scene.add(car);
// Switch between the original procedural city and the three imported Blender blockouts.
const worlds={city:null,wise_square:'Wise Square',trade_gang_hq:'Trade Gang HQ',soundlabs_district:'Soundlabs District'};
let loadedWorld=null;
const worldSelector=document.createElement('select');
worldSelector.setAttribute('aria-label','Select world');
worldSelector.style.cssText='position:fixed;top:64px;right:12px;z-index:20;background:#12142a;color:#fff;border:1px solid #35cfff;border-radius:8px;padding:10px;font-size:14px;max-width:50vw';
for(const [key,label] of Object.entries(worlds)){const option=document.createElement('option');option.value=key;option.textContent=label||'Original City';worldSelector.append(option)}
worldSelector.id='world-choice';document.body.append(worldSelector);
const loader=new GLTFLoader();
function setWorld(id){
 if(loadedWorld){scene.remove(loadedWorld);loadedWorld=null}
 cityMeshes.forEach(mesh=>mesh.visible=id==='city');
 if(id==='city'){player.position.set(0,0,0);car.position.set(8,0,-12);return}
 document.getElementById('status').textContent='Loading '+worlds[id]+'…';
 loader.load(import.meta.env.BASE_URL+'worlds/'+id+'.glb',gltf=>{
  if(worldSelector.value!==id)return;
  loadedWorld=gltf.scene;
  const bounds=new THREE.Box3().setFromObject(loadedWorld);
  const size=bounds.getSize(new THREE.Vector3());
  const center=bounds.getCenter(new THREE.Vector3());
  const scale=110/Math.max(size.x,size.z,1);
  loadedWorld.scale.setScalar(scale);
  loadedWorld.position.set(-center.x*scale,-bounds.min.y*scale,-center.z*scale);
  scene.add(loadedWorld);
  player.position.set(0,0,0);car.position.set(8,0,-12);
  document.getElementById('status').textContent=worlds[id]+' · 3D blockout loaded';
 },undefined,err=>{
  console.error('World load failed',err);
  document.getElementById('status').textContent='World load failed — returned to city';
  worldSelector.value='city';setWorld('city');
 });
}
worldSelector.addEventListener('change',()=>setWorld(worldSelector.value));
// Android TV D-pad and Bluetooth gamepads: axes 0/1 for walking or driving,
// face button A / Cross for interaction, and shoulder buttons for world cycling.
let padForward=0,padTurn=0,previousButtons=new Set();
const worldIds=Object.keys(worlds);
function cycleWorld(direction){const index=worldIds.indexOf(worldSelector.value);worldSelector.value=worldIds[(index+direction+worldIds.length)%worldIds.length];setWorld(worldSelector.value)}
function pollGamepad(){
 pollMenuPad();if(menuOpen){padForward=0;padTurn=0;return;}
 const pad=[...(navigator.getGamepads?.()||[])].find(p=>p&&p.connected);
 padForward=0;padTurn=0;
 if(!pad)return;
 const axis=(n)=>Math.abs(pad.axes[n]||0)>.18?(pad.axes[n]||0):0;
 padForward=-(axis(1)||0);padTurn=axis(0)||0;
 const down=new Set();
 pad.buttons.forEach((b,i)=>{if(b.pressed)down.add(i)});
 if(down.has(12))padForward=1;
 if(down.has(13))padForward=-1;
 if(down.has(14))padTurn=-1;
 if(down.has(15))padTurn=1;
 if((down.has(0)||down.has(1))&&!previousButtons.has(0)&&!previousButtons.has(1))interact();
 if(down.has(4)&&!previousButtons.has(4))cycleWorld(-1);
 if(down.has(5)&&!previousButtons.has(5))cycleWorld(1);
 previousButtons=down;
}
// Original procedural cinematic detailing, optimized for the Android TV GPU.
const neonBlue=new THREE.MeshBasicMaterial({color:0x36cfff});
const neonPink=new THREE.MeshBasicMaterial({color:0xff3cbd});
const darkMetal=mat(0x10121e),chrome=mat(0xb8c7da);
function detailBox(parent,w,h,d,x,y,z,material){
 const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material);
 mesh.position.set(x,y,z);parent.add(mesh);return mesh;
}
// Give the blue 392-inspired original muscle car a recognizable front, lighting and silhouette.
detailBox(car,2.8,.22,.22,0,.87,3.05,darkMetal);
detailBox(car,2.45,.13,.09,0,1.43,3.06,chrome);
for(const x of [-1.08,1.08]){
 detailBox(car,.72,.22,.09,x,1.25,3.09,neonBlue);
 detailBox(car,.64,.2,.09,x,1.25,-3.08,neonPink);
 detailBox(car,.12,.26,2.7,x,1.51,0,chrome);
}
detailBox(car,2.55,.08,.55,0,1.64,-2.88,darkMetal);
detailBox(car,2.05,.08,.15,0,2.4,-1.55,darkMetal);
// Original crew outfit details. These are placeholders, not likeness-accurate 3D scans.
function dressCrew(group,color){
 const accent=new THREE.MeshBasicMaterial({color});
 detailBox(group,.92,.12,.7,0,2.43,0,accent);
 detailBox(group,.85,.10,.12,0,1.83,.37,accent);
 detailBox(group,.68,.1,.52,0,3.13,0,darkMetal);
 for(const x of [-.28,.28])detailBox(group,.39,.18,.65,x,.13,.1,darkMetal);
}
dressCrew(player,0x46d8ff);
dressCrew(companions[0],0xb6b8d2);
dressCrew(companions[1],0xff365e);
// Lightweight skyline atmosphere and emissive street signs.
for(let i=0;i<18;i++){
 const x=i%2===0?-11.5:11.5,z=-86+Math.floor(i/2)*20;
 const sign=new THREE.Mesh(new THREE.PlaneGeometry(2.5,.48),new THREE.MeshBasicMaterial({color:i%3?0x35a8fa:0xe35cb7,side:THREE.DoubleSide}));
 sign.position.set(x,4.5,z);sign.rotation.y=Math.PI/2;scene.add(sign);
}
renderer.toneMapping=THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure=1.15;
// TV-first cinematic launcher; only routes to implemented features.
const menu=document.getElementById('main-menu');
let menuOpen=true,menuIndex=0;
const menuButtons=[...document.querySelectorAll('[data-menu]')];
function focusMenu(){menuButtons[menuIndex]?.focus()}
function showMenu(visible){menuOpen=visible;menu.classList.toggle('hidden',!visible);document.body.classList.toggle('menu-open',visible);if(visible)focusMenu()}
function chooseMenu(action){
 if(action==='play'){worldSelector.value='city';setWorld('city')}
 else if(action==='soundlabs'){worldSelector.value='soundlabs_district';setWorld(worldSelector.value)}
 else if(action==='hq'){worldSelector.value='trade_gang_hq';setWorld(worldSelector.value)}
 else if(action==='world'){worldSelector.value='wise_square';setWorld(worldSelector.value)}
 else if(action==='garage'){worldSelector.value='city';setWorld('city');player.position.set(7,0,-10)}
 else if(action==='missions'){worldSelector.value='city';setWorld('city');player.position.set(0,0,-18)}
 else if(action==='crew'){worldSelector.value='city';setWorld('city')}
 else if(action==='dashboard'){worldSelector.value='trade_gang_hq';setWorld(worldSelector.value)}
 showMenu(false);
}
menuButtons.forEach((b,i)=>b.addEventListener('click',()=>{menuIndex=i;chooseMenu(b.dataset.menu)}));
showMenu(true);
window.addEventListener('keydown',e=>{
 if(menuOpen){
  if(['ArrowDown','ArrowUp','Enter',' '].includes(e.key)){e.preventDefault();e.stopImmediatePropagation()}
  if(e.key==='ArrowDown'){menuIndex=(menuIndex+1)%menuButtons.length;focusMenu()}
  if(e.key==='ArrowUp'){menuIndex=(menuIndex+menuButtons.length-1)%menuButtons.length;focusMenu()}
  if(e.key==='Enter'||e.key===' ')chooseMenu(menuButtons[menuIndex].dataset.menu);
 }else if(e.key==='Escape'||e.key==='Backspace'){e.preventDefault();e.stopImmediatePropagation();showMenu(true)}
},true);
let previousMenuPad=new Set();
function pollMenuPad(){
 const pad=[...(navigator.getGamepads?.()||[])].find(p=>p&&p.connected);
 if(!pad)return;
 const down=new Set();pad.buttons.forEach((b,i)=>{if(b.pressed)down.add(i)});
 const pressed=i=>down.has(i)&&!previousMenuPad.has(i);
 if(pressed(9)){showMenu(!menuOpen)}
 if(menuOpen){if(pressed(12)){menuIndex=(menuIndex+menuButtons.length-1)%menuButtons.length;focusMenu()}
 if(pressed(13)){menuIndex=(menuIndex+1)%menuButtons.length;focusMenu()}
 if(pressed(0))chooseMenu(menuButtons[menuIndex].dataset.menu)}
 previousMenuPad=down;
}
const keys=new Set();addEventListener('keydown',e=>{keys.add(e.key.toLowerCase());if(e.key.toLowerCase()==='e'||e.key==='Enter'||e.key===' ')interact();if(e.key==='PageDown')cycleWorld(1);if(e.key==='PageUp')cycleWorld(-1)});addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));document.querySelectorAll('[data-dir]').forEach(b=>{const k={up:'w',down:'s',left:'a',right:'d'}[b.dataset.dir];b.addEventListener('pointerdown',e=>{e.preventDefault();keys.add(k);b.setPointerCapture(e.pointerId)});for(const ev of ['pointerup','pointercancel'])b.addEventListener(ev,()=>keys.delete(k))});document.getElementById('action').onclick=interact;
let completed=false;let driving=false;function interact(){if(player.position.distanceTo(marker.position.clone().setY(0))<5){completed=true;document.getElementById('status').textContent='MISSION COMPLETE: DOORZ OPEN';document.getElementById('mission').textContent='WISE² CREW · Mission complete!'}else if(driving||player.position.distanceTo(car.position)<5){driving=!driving;player.visible=!driving;if(driving){player.position.copy(car.position);document.getElementById('status').textContent='DRIVING · WASD / arrows · E to exit'}else{player.position.set(car.position.x+4,0,car.position.z);document.getElementById('status').textContent='ON FOOT · Find the glowing marker'}}}
const clock=new THREE.Clock();let speed=0;function tick(){requestAnimationFrame(tick);pollGamepad();const dt=Math.min(clock.getDelta(),.05),forward=THREE.MathUtils.clamp(Number(keys.has('w')||keys.has('arrowup'))-Number(keys.has('s')||keys.has('arrowdown'))+padForward,-1,1),turn=THREE.MathUtils.clamp(Number(keys.has('d')||keys.has('arrowright'))-Number(keys.has('a')||keys.has('arrowleft'))+padTurn,-1,1);if(menuOpen){renderer.render(scene,camera);return}if(driving){speed=THREE.MathUtils.damp(speed,forward*18,3,dt);car.rotation.y+=turn*dt*1.8*(speed>=0?1:-1);const next=car.position.clone().add(new THREE.Vector3(Math.sin(car.rotation.y)*speed*dt,0,Math.cos(car.rotation.y)*speed*dt));if(canMove(next,2)){car.position.copy(next)}else{speed=0}player.position.copy(car.position)}else{const v=new THREE.Vector3(turn,0,-forward);if(v.lengthSq()){v.normalize();const next=player.position.clone().addScaledVector(v,dt*9);if(canMove(next,.7))player.position.copy(next);player.rotation.y=Math.atan2(v.x,v.z)}}companions.forEach((c,i)=>{const offset=i===0?-2.7:2.7;const goal=new THREE.Vector3(player.position.x+offset,0,player.position.z+3);c.position.lerp(goal,Math.min(dt*2,1));c.rotation.y=player.rotation.y});marker.rotation.z+=dt;marker.visible=!completed;const target=driving?car.position:player.position;camera.position.lerp(new THREE.Vector3(target.x,driving?9:7,target.z+(driving?17:12)),.09);camera.lookAt(target.x,driving?2.5:1.8,target.z);renderer.render(scene,camera)}function canMove(p,r){if(Math.abs(p.x)>105||Math.abs(p.z)>105)return false;return !buildings.some(b=>Math.abs(p.x-b.x)<b.half+r&&Math.abs(p.z-b.z)<b.half+r)}tick();addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)});
