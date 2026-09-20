(function(root){
'use strict';
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n)),dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const PHASES={
 opening:{chapter:0,title:'The last ball',objective:'Walk to the crease. Your team is waiting for one last six.',target:'Vikram'},
 join:{chapter:0,title:'The chanda team',objective:'Join Ronny and the donation group by the cricket gate.',target:'Ronny'},
 donations:{chapter:1,title:'Every home has a story',objective:'Visit all three houses with your friends and collect chanda.',target:'homes'},
 report:{chapter:2,title:'A promise kept',objective:'Bring the donations to Dada at the mandap square.',target:'Dada'},
 donor:{chapter:2,title:'A gift for Bappa',objective:'Mr. Deshmukh is arriving with the ornaments.',target:'Mr. Deshmukh'},
 delivery:{chapter:2,title:'The golden tusk',objective:'Carry the golden tusk to the godown with Vikram.',target:'godown'},
 ambush:{chapter:2,title:'An unfair debt',objective:'The rival group has blocked your way.',target:'Deva'},
 chase:{chapter:2,title:'After them!',objective:'Chase Deva down the east lane. Do not lose sight of him.',target:'Deva'},
 aftermath:{chapter:2,title:'An empty-handed return',objective:'The rivals escaped. Talk to your friends.',target:'Vikram'},
 nextday:{chapter:3,title:'Something to hide',objective:'Dada needs help at the mandap. Meet him in the square.',target:'Dada'},
 investigate:{chapter:3,title:'A familiar face',objective:'Find Deva near the east market. Keep your distance.',target:'Deva'},
 follow:{chapter:3,title:'Down the other lane',objective:'Follow Deva. Stay 90–310 steps behind and out of his sight.',target:'Deva'},
 listen:{chapter:3,title:'Behind closed doors',objective:'Listen beside the hideout window without entering.',target:'listen'},
 build:{chapter:4,title:'A place for everyone',objective:'Return to Ronny. The mandap still needs its pillars.',target:'Ronny'},
 decorate:{chapter:5,title:'Flowers, light & a plan',objective:'Help Neha arrange the decorations and festival lights.',target:'Neha'},
 briefing:{chapter:6,title:'The midnight plan',objective:'Meet your friends at the mandap. Tell them what you found.',target:'Vikram'},
 approach:{chapter:6,title:'The quiet way in',objective:'Take the team to the ladder behind the rival hideout.',target:'ladder'},
 roof:{chapter:6,title:'One very small window',objective:'Help Golu through the window. Pull together on the count.',target:'Golu'},
 search:{chapter:7,title:'The missing treasure',objective:'Search the hideout. The tusk is among the stored ornaments.',target:'chest'},
 escape:{chapter:7,title:'The way we came',objective:'The tusk is safe. Get everyone back through the window.',target:'window'},
 return:{chapter:7,title:'Before the sun comes up',objective:'Return the tusk to your godown with the whole team.',target:'godown'},
 truth:{chapter:7,title:'Dada at the door',objective:'Dada is here. It is time to tell him the truth.',target:'Dada'},
 invite:{chapter:8,title:'One big mandal',objective:'Find Deva at his lane and invite the other mandal.',target:'Deva'},
 celebrate:{chapter:8,title:'Ganpati Bappa Morya!',objective:'Join Dada and both mandals at the celebration.',target:'Dada'},
 festival:{chapter:8,title:'Let the celebration begin',objective:'Play the dhol circle, modak game, and flower puzzle. Then meet Dada.',target:'festival'},
 complete:{chapter:8,title:'One colony. One family.',objective:'Keep celebrating. All three festival games and cricket are open.',target:'festival'}
};
const CHAPTERS=['The last ball','Chanda collection','The golden tusk','The other lane','Building the mandap','A secret plan','The night heist','The truth comes home','The grand Chaturthi'];
const CAST={Dada:0,Rohan:1,Vikram:2,Ayesha:3,Neha:4,Golu:5,Ronny:6,Deva:7,Manav:8,Aadi:9,Sameer:10,Ishant:11,Priya:12,'Mr. Deshmukh':0,'Joshi Aunty':4,'Patil Uncle':0,'Mehta Aunty':3};
const DEFAULT_POINTS={crease:[658,495],gate:[654,750],square:[1688,480],godown:[2558,535],ambush:[2230,810],east:[2605,880],ladder:[2214,1370],listen:[2450,1305],home0:[340,1360],home1:[680,1360],home2:[1040,1360],chest:[1210,247],window:[306,754]};
// Art-space collision and navigation are shared by actors, the player, and tests.
const outdoorAreas=[[63,380,1470,427],[814,416,876,787],[64,706,1490,783],[29,90,65,766],[1470,102,1503,768],[597,80,639,390],[1054,80,1095,390],[1293,420,1329,720],[298,310,356,392],[108,120,558,335],[680,177,1010,330],[820,315,872,390],[1180,243,1410,330],[1253,318,1316,391],[1083,651,1138,724],[1046,649,1245,676],[1214,510,1251,670],[65,648,804,726],[145,620,190,710],[315,625,355,710],[495,635,540,710],[688,640,730,710],[876,668,1295,720],[1230,425,1300,515]];
const MAPS={colony:{width:3072,height:2048,minX:58,maxX:3006,minY:160,maxY:1570,areas:outdoorAreas.map(a=>a.map(n=>n*2)),blocks:[[1442,60,476,278],[2340,132,532,350],[224,866,224,372],[558,878,248,368],[922,878,240,384],[1252,886,308,390],[2072,984,348,314],[1842,908,214,194],[1806,1148,206,166],[2680,908,240,250],[2680,1180,232,184]]},hideout:{width:1536,height:1024,minX:215,maxX:1335,minY:225,maxY:795,blocks:[[208,0,88,279],[1182,766,315,168],[659,807,456,147]]}};
function inside(p,b,pad=0){return p.x>b[0]-pad&&p.x<b[0]+b[2]+pad&&p.y>b[1]-pad&&p.y<b[1]+b[3]+pad;}
function walkable(x,y,map='colony',pad=10){const m=MAPS[map];return x>=m.minX&&x<=m.maxX&&y>=m.minY&&y<=m.maxY&&(!m.areas||m.areas.some(a=>x>=a[0]&&x<=a[2]&&y>=a[1]&&y<=a[3]))&&!m.blocks.some(b=>inside({x,y},b,pad));}
function lineClear(a,b,map='colony'){const n=Math.ceil(dist(a,b)/12);for(let i=0;i<=n;i++)if(!walkable(a.x+(b.x-a.x)*i/Math.max(n,1),a.y+(b.y-a.y)*i/Math.max(n,1),map))return false;return true;}
function safePoint(x,y,map='colony'){if(walkable(x,y,map))return {x,y};for(let r=20;r<600;r+=20)for(let k=0;k<16;k++){const a=k*Math.PI/8,px=x+Math.cos(a)*r,py=y+Math.sin(a)*r;if(walkable(px,py,map))return{x:px,y:py};}return map==='colony'?{x:1688,y:680}:{x:750,y:650};}
function path(a,b,map='colony'){
 b=safePoint(b.x,b.y,map);if(lineClear(a,b,map))return[b];
 const cell=40,m=MAPS[map],cols=Math.ceil(m.width/cell),sx=Math.round(a.x/cell),sy=Math.round(a.y/cell),gx=Math.round(b.x/cell),gy=Math.round(b.y/cell),start=sy*cols+sx,goal=gy*cols+gx;
 const open=[start],parents=new Map(),cost=new Map([[start,0]]),closed=new Set();let found=null;
 const score=n=>(cost.get(n)??1e9)+Math.abs(n%cols-gx)+Math.abs(Math.floor(n/cols)-gy);
 for(let i=0;i<6500&&open.length;i++){open.sort((x,y)=>score(y)-score(x));const n=open.pop();if(closed.has(n))continue;closed.add(n);const x=n%cols,y=Math.floor(n/cols),from=n===start?a:{x:x*cell,y:y*cell};if((n===goal||Math.hypot(x*cell-b.x,y*cell-b.y)<56)&&lineClear(from,b,map)){found=n;break;}for(const [dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy,nn=ny*cols+nx;if(nx<0||nx>=cols||ny<0||!walkable(nx*cell,ny*cell,map)||closed.has(nn)||!lineClear(from,{x:nx*cell,y:ny*cell},map))continue;const v=cost.get(n)+1;if(v<(cost.get(nn)??1e9)){parents.set(nn,n);cost.set(nn,v);open.push(nn);}}}
 if(found===null)return[];const result=[b];for(let n=found;n!==start&&n!==undefined;n=parents.get(n))result.unshift({x:n%cols*cell,y:Math.floor(n/cols)*cell});while(result.length>1&&lineClear(a,result[1],map))result.shift();return result;
}
class Game {
 constructor(saved){this.points={...DEFAULT_POINTS};this.state=this.validate(saved);this.player={...safePoint(this.state.x,this.state.y,this.state.map),name:'Rohan',sprite:1,dir:'down',walking:false};this.actors=[];this.events=[];this.clock=0;this.alert=0;this.activity=null;this.routeTarget=null;this.rebuild();}
 validate(s){const fallback={version:2,phase:'opening',map:'colony',x:540,y:550,donations:[],rupees:0,pillars:false,decorated:false,tusk:false,games:[],completed:false};if(!s||s.version!==2||!PHASES[s.phase])return fallback;let st={...fallback,...s};st.donations=[...new Set(Array.isArray(st.donations)?st.donations:[])].filter(n=>[0,1,2].includes(n));st.games=[...new Set(Array.isArray(st.games)?st.games:[])].filter(n=>['dhol','modak','flowers'].includes(n));st.rupees=st.donations.reduce((sum,n)=>sum+[251,501,301][n],0);st.x=Number.isFinite(st.x)?st.x:540;st.y=Number.isFinite(st.y)?st.y:550;st.map=['search','escape','roof'].includes(st.phase)?'hideout':'colony';const resume={donor:'report',ambush:'delivery',chase:'delivery',aftermath:'nextday',follow:'investigate',truth:'return'};if(resume[st.phase]){st.phase=resume[st.phase];const p=st.phase==='delivery'?[1850,860]:st.phase==='investigate'?[2560,850]:st.phase==='return'?[2650,690]:[1580,600];st.x=p[0];st.y=p[1];}if(['return','escape','delivery'].includes(st.phase))st.tusk=true;if(st.completed===true){st.phase='complete';st.map='colony';st.tusk=false;st.x=1688;st.y=680;}st.pillars=!!st.pillars;st.decorated=!!st.decorated;st.tusk=!!st.tusk;st.completed=st.completed===true;return st;}
 get phase(){return PHASES[this.state.phase];}
 point(name){const p=this.points[name]||[this.player.x,this.player.y];return{x:p[0],y:p[1],name,kind:name};}
 emit(type,data={}){this.events.push({type,...data});}
 drain(){const es=this.events;this.events=[];return es;}
 actor(name){return this.actors.find(a=>a.name===name);}
 spawn(name,x,y,options={}){if(this.actor(name))throw Error('Duplicate actor: '+name);const p=safePoint(x,y,this.state.map),a={name,x:p.x,y:p.y,sprite:CAST[name]??1,dir:'down',walking:false,route:[],routeTime:0,age:0,mode:'idle',home:{...p},...options};this.actors.push(a);return a;}
 at(name,point,dx=0,dy=0,options={}){const p=this.point(point);return this.spawn(name,p.x+dx,p.y+dy,options);}
 remove(name){this.actors=this.actors.filter(a=>a.name!==name);}
 goto(a,x,y,speed=105,exit=false){if(!a)return;a.route=path(a,{x,y},this.state.map);a.speed=speed;a.exit=exit;a.mode='route';}
 setPhase(phase,position){if(!PHASES[phase])throw Error('Unknown phase '+phase);this.state.phase=phase;this.state.map=['roof','search','escape'].includes(phase)?'hideout':'colony';this.activity=null;this.alert=0;this.routeTarget=null;if(position){const p=safePoint(position[0],position[1],this.state.map);Object.assign(this.player,p);}this.rebuild();this.emit('phase');}
 party(names=['Vikram','Ronny','Golu']){names.forEach((n,i)=>this.spawn(n,this.player.x-50-i*26,this.player.y+60+i*22,{mode:'follow',slot:i}));}
 ambient(){const s=this.state.phase,chap=this.phase.chapter;if(this.state.map!=='colony'||chap===6||chap===7)return;if(!['opening','join'].includes(s)){[['Neighbour',3,350,930],['Flower seller',4,1720,890],['Schoolboy',1,1180,970]].forEach(([n,sp,x,y],i)=>this.spawn(n,x,y,{sprite:sp,mode:'wander',radius:80,seed:i}));}}
 rebuild(){this.actors=[];const s=this.state.phase,p=this.player;this.ambient();
 if(s==='opening'||s==='join'){
  this.at('Vikram','crease',0,-170,{dir:'down'});this.at('Ayesha','crease',240,100,{mode:'wander',radius:35});this.at('Neha','crease',290,140,{mode:'wander',radius:30});
  [[-220,-130],[200,-210],[-240,220],[250,250],[-80,320],[340,-40]].forEach(([x,y],i)=>this.at('Fielder '+(i+1),'crease',x,y,{sprite:[1,2,6,1,2,6][i],mode:'wander',radius:35,seed:i}));
  this.at('Ronny','gate',0,0,{mode:'wander',radius:20});this.at('Golu','gate',65,45,{mode:'wander',radius:25});this.at('Dada','square',0,0,{mode:'wander',radius:40});if(s==='opening'){this.goto(this.actor('Ronny'),this.points.crease[0]+100,this.points.crease[1]+100,85);this.goto(this.actor('Golu'),this.points.crease[0]+140,this.points.crease[1]+140,78);}
 }else if(s==='donations'){this.party();for(let i=0;i<3;i++)if(!this.state.donations.includes(i))this.at(['Joshi Aunty','Patil Uncle','Mehta Aunty'][i],'home'+i,0,0,{mode:'wander',radius:15});this.at('Dada','square');}
 else if(['report','donor','delivery'].includes(s)){this.party();this.at('Dada','square');this.at('Ayesha','square',-130,90,{mode:'wander',radius:30});this.at('Neha','square',150,80,{mode:'wander',radius:30});if(s==='donor')this.at('Mr. Deshmukh','square',420,260);}
 else if(['ambush','chase','aftermath'].includes(s)){this.party(['Vikram']);if(s!=='aftermath'){this.spawn('Deva',p.x+110,p.y);this.spawn('Sameer',p.x+120,p.y+60);this.spawn('Ishant',p.x+170,p.y-60);}}
 else if(['nextday','investigate','follow','listen','build','decorate','briefing'].includes(s)){this.at('Dada','square');this.at('Ronny','square',-130,100,{mode:'work',radius:70});this.at('Golu','square',100,100,{mode:'work',radius:60});this.at('Vikram','square',-200,140,{mode:'work',radius:90});this.at('Neha','square',200,100,{mode:'work',radius:70});this.at('Ayesha','square',250,140,{mode:'work',radius:60});if(s==='investigate'||s==='follow')this.at('Deva','east');}
 else if(s==='approach'){this.party(['Vikram','Ronny','Golu']);this.at('Manav','ladder',230,140,{mode:'guard',radius:110,seed:0});this.at('Ishant','ladder',-300,160,{mode:'guard',radius:100,seed:2});}
 else if(['roof','search','escape'].includes(s)){this.party(['Vikram','Ronny','Golu']);if(s==='roof'){const a=this.actor('Golu');a.x=this.point('window').x;a.y=this.point('window').y; a.mode='idle';}}
 else if(s==='return'){this.party(['Vikram','Ronny','Golu']);}
 else if(s==='truth'){this.party(['Vikram','Ronny','Golu']);this.at('Dada','godown',0,-20);}
 else if(s==='invite'){this.at('Deva','ladder',0,100,{mode:'wander',radius:35});this.at('Manav','ladder',120,120,{mode:'wander',radius:40});this.at('Priya','ladder',-90,120,{mode:'wander',radius:25});}
 else if(['celebrate','festival','complete'].includes(s)){['Dada','Vikram','Ayesha','Neha','Golu','Ronny','Deva','Manav','Aadi','Sameer','Ishant','Priya','Mr. Deshmukh'].forEach((n,i)=>this.at(n,'square',-180+(i%4)*115,Math.floor(i/4)*105,{mode:'dance',radius:30,seed:i}));}
 }
 targets(){const s=this.state.phase,t=this.phase.target;if(t==='homes')return this.actors.filter(a=>a.name.endsWith('Aunty')||a.name==='Patil Uncle');if(t==='festival'){const list=['Neha','Golu','Ronny'].map(n=>this.actor(n)).filter(Boolean);if(this.state.games.length===3||s==='complete')list.push(this.actor('Dada'));return list;}if(['godown','ladder','listen','chest','window'].includes(t))return[this.point(t)];const a=this.actor(t);return a?[a]:[];}
 nearest(){const list=[...this.targets(),...this.actors.filter(a=>!a.name.startsWith('Fielder')&&!['Neighbour','Flower seller','Schoolboy'].includes(a.name))];return list.filter(a=>dist(a,this.player)<100).sort((a,b)=>dist(a,this.player)-dist(b,this.player))[0]||null;}
 move(dx,dy,dt){this.player.walking=!!(dx||dy);if(dx)dy=0;if(dx||dy)this.player.dir=dx?(dx>0?'right':'left'):(dy>0?'down':'up');const speed=this.state.phase==='chase'?285:this.state.phase==='approach'?160:230;const nx=this.player.x+dx*speed*dt,ny=this.player.y+dy*speed*dt;if(walkable(nx,this.player.y,this.state.map))this.player.x=nx;if(walkable(this.player.x,ny,this.state.map))this.player.y=ny;}
 tick(dt,moving=true){dt=clamp(dt,0,.05);this.clock+=dt;for(const a of [...this.actors]){a.age+=dt;a.walking=false;a.routeTime-=dt;if(a.mode==='follow'&&moving){const n=a.slot||0,dir=this.player.dir,v={down:[0,-1],up:[0,1],left:[1,0],right:[-1,0]}[dir],target=safePoint(this.player.x+v[0]*(65+n*42)+(n%2?20:-20),this.player.y+v[1]*(65+n*42),this.state.map);if(dist(a,target)>45&&a.routeTime<=0){a.route=path(a,target,this.state.map);a.routeTime=.65;a.speed=245;}}
  if(['wander','work','guard'].includes(a.mode)&&!a.route.length&&a.routeTime<=0){const angle=this.clock*.73+(a.seed||a.x)*1.7,r=a.radius||30,b=safePoint(a.home.x+Math.cos(angle)*r,a.home.y+Math.sin(angle)*r,this.state.map);a.route=path(a,b,this.state.map);a.speed=a.mode==='guard'?65:50;a.routeTime=2+(a.seed||0)%3;}
  if(a.route.length){const b=a.route[0],d=dist(a,b),step=(a.speed||100)*dt;if(d<step+2){a.x=b.x;a.y=b.y;a.route.shift();if(!a.route.length&&a.exit){this.remove(a.name);continue;}}else{a.walking=true;const dx=b.x-a.x,dy=b.y-a.y;a.dir=Math.abs(dx)>Math.abs(dy)?dx>0?'right':'left':dy>0?'down':'up';const nx=a.x+dx/d*step,ny=a.y+dy/d*step;if(walkable(nx,ny,this.state.map)){a.x=nx;a.y=ny;}else{a.route=[];a.routeTime=.2;}}}
 }
 if(!moving)return;
 const s=this.state.phase;if(s==='delivery'&&dist(this.player,this.point('ambush'))<145){this.setPhase('ambush');this.emit('ambush');}
 if(s==='investigate'&&this.actor('Deva')&&dist(this.player,this.actor('Deva'))<255){this.setPhase('follow');const a=this.actor('Deva');a.x=this.points.east[0];a.y=this.points.east[1];this.goto(a,this.points.ladder[0],this.points.ladder[1]+50,112);this.emit('follow');}
 if(s==='follow'){const a=this.actor('Deva');if(!a)return;const d=dist(a,this.player);const bad=d<78||d>420;this.alert=clamp(this.alert+(bad?dt:-dt*.8),0,3.5);if(this.alert>=3.5){this.setPhase('investigate',[this.points.east[0]-240,this.points.east[1]-60]);this.emit('caught',{reason:d<78?'Deva spotted you. Stay farther back.':'You lost Deva. Keep him in sight.'});}else if(a.route.length===0&&dist(a,this.point('ladder'))<130&&d<310){this.setPhase('listen');this.emit('arrived');}}
 if(s==='chase'&&this.activity){this.activity.elapsed+=dt;const d=this.actor('Deva');if(!d||this.activity.elapsed>24){this.setPhase('aftermath');this.emit('escaped');}}
 if(s==='approach'){let seen=false;for(const a of this.actors.filter(a=>a.mode==='guard')){const dx=this.player.x-a.x,dy=this.player.y-a.y,dir={down:Math.PI/2,up:-Math.PI/2,left:Math.PI,right:0}[a.dir],ang=Math.atan2(dy,dx);const diff=Math.atan2(Math.sin(ang-dir),Math.cos(ang-dir));if(dist(a,this.player)<185&&Math.abs(diff)<.65&&lineClear(a,this.player))seen=true;}this.alert=clamp(this.alert+(seen?dt:-dt),0,2.4);if(this.alert>=2.4){this.setPhase('approach',[this.points.ladder[0]-470,this.points.ladder[1]+120]);this.emit('caught',{reason:'The lookout heard you. Your team regrouped safely. Try the darker side of the lane.'});}}
 }
 startChase(){this.state.tusk=false;this.setPhase('chase');const dest=this.point('ladder');this.actors.filter(a=>['Deva','Sameer','Ishant'].includes(a.name)).forEach((a,i)=>this.goto(a,dest.x+i*20,dest.y+50,245+i*8,true));this.activity={elapsed:0};}
 collectDonation(i){if(![0,1,2].includes(i)||this.state.donations.includes(i))return false;this.state.donations.push(i);this.state.rupees+=[251,501,301][i];this.remove(['Joshi Aunty','Patil Uncle','Mehta Aunty'][i]);if(this.state.donations.length===3)this.setPhase('report');return true;}
 festivalWin(kind){if(!['dhol','modak','flowers'].includes(kind))throw Error('Unknown game');if(!this.state.games.includes(kind))this.state.games.push(kind);}
 snapshot(){return{...this.state,x:this.player.x,y:this.player.y};}
}
const api={Game,PHASES,CHAPTERS,CAST,MAPS,DEFAULT_POINTS,walkable,lineClear,safePoint,path,dist,clamp};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.GameCore=api;
})(typeof globalThis!=='undefined'?globalThis:this);
