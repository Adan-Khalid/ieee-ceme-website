/* IEEE CEME website: power core hero (needs three.js loaded first) */
(function(){
  var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  /* ---------- power core hero (light studio) ---------- */
  var canvas=document.getElementById('ieeeScene'), THREE=window.THREE, renderer;
  if(!THREE) return;
  try{ renderer=new THREE.WebGLRenderer({canvas:canvas,antialias:true,alpha:true}); }catch(e){ return; }
  renderer.setPixelRatio(Math.min(devicePixelRatio,2));
  renderer.setClearColor(0xffffff,0);
  renderer.outputEncoding=THREE.sRGBEncoding;
  var scene=new THREE.Scene(), camera=new THREE.PerspectiveCamera(38,1,0.1,100);

  var envScene=new THREE.Scene(), cv=document.createElement('canvas'); cv.width=cv.height=512; var g=cv.getContext('2d');
  var grd=g.createLinearGradient(0,0,0,512);
  grd.addColorStop(0,'#ffffff'); grd.addColorStop(.38,'#e3eaf0'); grd.addColorStop(.52,'#4f5c68'); grd.addColorStop(.62,'#8e9aa5'); grd.addColorStop(1,'#d5dde4');
  g.fillStyle=grd; g.fillRect(0,0,512,512);
  g.fillStyle='rgba(255,255,255,1)'; g.beginPath(); g.ellipse(370,110,150,70,0,0,7); g.fill();
  g.fillStyle='rgba(40,120,180,.35)'; g.beginPath(); g.ellipse(110,330,120,50,0,0,7); g.fill();
  var envTex=new THREE.CanvasTexture(cv); envTex.mapping=THREE.EquirectangularReflectionMapping;
  envScene.add(new THREE.Mesh(new THREE.SphereGeometry(30,32,32),new THREE.MeshBasicMaterial({map:envTex,side:THREE.BackSide})));
  scene.environment=new THREE.PMREMGenerator(renderer).fromScene(envScene,0.03).texture;

  scene.add(new THREE.AmbientLight(0xdfe8ef,0.55));
  var key=new THREE.DirectionalLight(0xffffff,1.3); key.position.set(4,7,9); scene.add(key);
  var rim=new THREE.DirectionalLight(0x4fb3ea,0.9); rim.position.set(-6,2,-7); scene.add(rim);
  var coreLight=new THREE.PointLight(0x2aa8e8,0,8,2); scene.add(coreLight);

  var gun=new THREE.MeshStandardMaterial({color:0x3a4552,metalness:0.85,roughness:0.34,envMapIntensity:0.9});
  var gunDk=new THREE.MeshStandardMaterial({color:0x1f2730,metalness:0.8,roughness:0.4,envMapIntensity:0.8});
  var silver=new THREE.MeshStandardMaterial({color:0xc3cbd2,metalness:1.0,roughness:0.22});
  var copper=new THREE.MeshStandardMaterial({color:0xc27a3e,metalness:1.0,roughness:0.28});
  var lensM=new THREE.MeshStandardMaterial({color:0x5ec2f2,metalness:0.1,roughness:0.04,transparent:true,opacity:0.14,depthWrite:false});
  var hot=new THREE.MeshBasicMaterial({color:0xcff0ff}), glowR=new THREE.MeshBasicMaterial({color:0x1e9be0});

  function cylZ(rt,rb,h,seg){ var gg=new THREE.CylinderGeometry(rt,rb,h,seg||64); gg.rotateX(Math.PI/2); return gg; }
  function ringAt(parent,n,r,z,make){ for(var i=0;i<n;i++){ var a=i/n*Math.PI*2, m=make(a); m.position.set(Math.cos(a)*r,Math.sin(a)*r,z); m.rotation.z=a; parent.add(m);} }
  var core=new THREE.Group(); scene.add(core); var layers=[];
  function layer(z0,zX,spin){ var grp=new THREE.Group(); grp.position.z=z0; core.add(grp); layers.push({g:grp,z0:z0,zX:zX,spin:spin}); return grp; }

  var L0=layer(-0.45,-2.3,0);
  L0.add(new THREE.Mesh(cylZ(2.1,2.1,0.35),gun)); L0.add(new THREE.Mesh(cylZ(1.7,1.7,0.37),gunDk));
  var finG=new THREE.BoxGeometry(0.36,0.07,0.34); ringAt(L0,40,2.26,0,function(){ return new THREE.Mesh(finG,gunDk); });
  var L1=layer(-0.06,-1.15,0.35);
  L1.add(new THREE.Mesh(new THREE.TorusGeometry(1.6,0.15,16,96),gunDk));
  var coilG=new THREE.TorusGeometry(0.19,0.034,8,20); coilG.rotateY(Math.PI/2);
  var clampG=new THREE.BoxGeometry(0.2,0.44,0.44);
  for(var i=0;i<10;i++){ var a0=i/10*Math.PI*2;
    for(var k=0;k<7;k++){ var a=a0+(k-3)*0.052, m=new THREE.Mesh(coilG,copper); m.position.set(Math.cos(a)*1.6,Math.sin(a)*1.6,0); m.rotation.z=a+Math.PI/2; L1.add(m); }
    var ac=a0+Math.PI/10, c=new THREE.Mesh(clampG,silver); c.position.set(Math.cos(ac)*1.6,Math.sin(ac)*1.6,0); c.rotation.z=ac; L1.add(c); }
  var L2=layer(0.05,0.0,-0.5);
  L2.add(new THREE.Mesh(new THREE.TorusGeometry(1.15,0.09,16,96),silver)); L2.add(new THREE.Mesh(new THREE.TorusGeometry(0.56,0.07,16,72),silver));
  var spokeG=new THREE.BoxGeometry(0.62,0.12,0.14); ringAt(L2,6,0.86,0,function(){ return new THREE.Mesh(spokeG,gun); });
  var L4=layer(-0.02,1.75,0);
  L4.add(new THREE.Mesh(cylZ(0.46,0.46,0.2,48),hot)); L4.add(new THREE.Mesh(new THREE.TorusGeometry(0.62,0.045,12,64),glowR));
  var coreRing=new THREE.Mesh(new THREE.TorusGeometry(0.3,0.022,10,48),new THREE.MeshBasicMaterial({color:0x2aa8e8})); coreRing.position.z=0.11; L4.add(coreRing);
  var L3=layer(0.2,1.0,0);
  L3.add(new THREE.Mesh(cylZ(1.1,1.1,0.05),lensM)); L3.add(new THREE.Mesh(new THREE.TorusGeometry(1.1,0.014,8,96),glowR));
  var L5=layer(0.1,2.6,0.12);
  L5.add(new THREE.Mesh(new THREE.TorusGeometry(2.0,0.14,20,120),silver));
  var boltG=cylZ(0.07,0.07,0.1,16); ringAt(L5,12,2.0,0.15,function(){ return new THREE.Mesh(boltG,gunDk); });

  var sc=document.createElement('canvas'); sc.width=sc.height=256; var sg=sc.getContext('2d');
  var rg=sg.createRadialGradient(128,128,0,128,128,128);
  rg.addColorStop(0,'rgba(170,228,255,.95)'); rg.addColorStop(.25,'rgba(42,168,232,.45)'); rg.addColorStop(.6,'rgba(42,168,232,.12)'); rg.addColorStop(1,'rgba(42,168,232,0)');
  sg.fillStyle=rg; sg.fillRect(0,0,256,256);
  var glow=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(sc),depthWrite:false,transparent:true})); L4.add(glow);

  function smooth(a,b,x){ var t=Math.min(Math.max((x-a)/(b-a),0),1); return t*t*(3-2*t); }
  function lerp(a,b,t){ return a+(b-a)*t; }
  var hero=document.querySelector('.ieee .hero'), rawP=0, curP=0;
  function onScroll(){ var r=hero.getBoundingClientRect(),tot=hero.offsetHeight-innerHeight; rawP=tot>0?Math.min(Math.max(-r.top,0),tot)/tot:0; }
  if(!reduce){ addEventListener('scroll',onScroll,{passive:true}); onScroll(); }
  var mx=0,my=0,tx=0,ty=0;
  if(matchMedia('(pointer:fine)').matches&&!reduce){ addEventListener('pointermove',function(e){ mx=e.clientX/innerWidth-.5; my=e.clientY/innerHeight-.5; }); }
  var W=0,H=0,narrow=false,heroVisible=true;
  if('IntersectionObserver' in window){ new IntersectionObserver(function(es){ heroVisible=es[0].isIntersecting; },{threshold:0}).observe(hero); }
  function resize(){ var w=canvas.clientWidth,h=canvas.clientHeight; if(w===W&&h===H) return; W=w;H=h; narrow=w<900; renderer.setSize(w,h,false); camera.aspect=w/h; }
  function frameView(e){ if(narrow) camera.setViewOffset(W,H,0,H*0.24,W,H); else camera.setViewOffset(W,H,-W*(0.22+0.08*e),0,W,H); camera.updateProjectionMatrix(); }
  var qs=new URLSearchParams(location.search), forceP=qs.has('p')?parseFloat(qs.get('p')):null, frames=0, t0=performance.now();
  function frame(now){
    requestAnimationFrame(frame);
    if(!heroVisible && forceP===null) return;
    resize();
    var t=(now-t0)/1000;
    if(forceP!==null){ rawP=curP=forceP; t=6; if(++frames>20) return; }
    curP+=(rawP-curP)*0.07;
    var intro=reduce?1:smooth(0,1.8,t);
    var e=reduce?0.55:smooth(0.06,0.42,curP)*(1-smooth(0.7,0.94,curP));
    var burst=smooth(0.86,0.97,curP)*(1-smooth(0.97,1.0,curP));
    for(var i=0;i<layers.length;i++){ var L=layers[i], open=Math.max(e,(1-intro)*0.35);
      L.g.position.z=L.z0+L.zX*open*0.85; L.g.rotation.z=(reduce?0:t*L.spin*0.25)+open*L.spin*1.6; }
    var power=intro*(0.85+0.15*Math.sin(t*2.2))+burst*0.9;
    glow.scale.setScalar(1.4+power*1.2); glow.material.opacity=Math.min(power*0.85,1);
    coreLight.position.copy(L4.position); coreLight.intensity=power*2.2;
    tx+=(mx-tx)*0.05; ty+=(my-ty)*0.05;
    core.rotation.y=tx*0.25+(reduce?0:Math.sin(t*0.3)*0.04); core.rotation.x=ty*0.18;
    var d=narrow?1.75+0.3*e:1;
    frameView(e);
    camera.position.set(lerp(0,6.8,e)*d,lerp(0.2,2.6,e)*d,lerp(9.4,7.2,e)*d); camera.lookAt(0,0,0.15*e);
    renderer.render(scene,camera);
  }
  requestAnimationFrame(frame);
})();
