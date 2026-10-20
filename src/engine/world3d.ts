import { drawRoad } from './road3d';
import { arenaObstacles, arenaSupplySites, fireObstacles } from '../games/rung4/models';
import { roverWalls } from '../runtime/roverRules';
export type Vec3 = [number,number,number];
export interface Mesh { vertices:number[]; color:string }
const colors:Record<string,string>={math:'#98caff',geometry:'#d6b0ff',calculus:'#ffaece',physics:'#ffe096',engine:'#ffb17e',robot:'#97eed8',vm:'#a4b5ff',trail:'#b7dc95',water:'#8fe1ff',kitchen:'#ffd49e',creator:'#dfaeff',driving:'#a4dfc8',cdl:'#ffbf82',trade:'#dfc396',lines:'#afd4ff',electric:'#ffe48e',fire:'#ffb2a0',swim:'#8fe2e7',sports:'#bded90',outpost:'#d5ca9a',scenario:'#b8b4ff',space:'#9edcff'};
const rgb=(hex:string)=>[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)/255);
export class MeshBuilder {
  meshes:Mesh[]=[];
  triangle(a:Vec3,b:Vec3,c:Vec3,color:string) { const u=b.map((v,i)=>v-a[i]);const v=c.map((n,i)=>n-a[i]); const n=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]];const l=Math.hypot(...n)||1; const normal=n.map(x=>x/l); this.meshes.push({vertices:[...a,...normal,...b,...normal,...c,...normal],color}); }
  quad(a:Vec3,b:Vec3,c:Vec3,d:Vec3,color:string){this.triangle(a,b,c,color);this.triangle(a,c,d,color);}
  box(x:number,y:number,z:number,w:number,h:number,d:number,color:string){
    const a:Vec3=[x-w/2,y,z-d/2],b:Vec3=[x+w/2,y,z-d/2],c:Vec3=[x+w/2,y+h,z-d/2],e:Vec3=[x-w/2,y+h,z-d/2],f:Vec3=[x-w/2,y,z+d/2],g:Vec3=[x+w/2,y,z+d/2],i:Vec3=[x+w/2,y+h,z+d/2],j:Vec3=[x-w/2,y+h,z+d/2];
    this.quad(a,e,c,b,color);this.quad(f,g,i,j,color);this.quad(e,j,i,c,color);this.quad(a,b,g,f,color);this.quad(b,c,i,g,color);this.quad(a,f,j,e,color);
  }
  cylinder(x:number,y:number,z:number,r:number,h:number,color:string,n=20){for(let k=0;k<n;k++){const a=k/n*Math.PI*2,b=(k+1)/n*Math.PI*2;const p:Vec3=[x+Math.cos(a)*r,y,z+Math.sin(a)*r],q:Vec3=[x+Math.cos(b)*r,y,z+Math.sin(b)*r],pt:Vec3=[p[0],y+h,p[2]],qt:Vec3=[q[0],y+h,q[2]];this.quad(p,pt,qt,q,color);this.triangle([x,y+h,z],qt,pt,color);}}
  orb(x:number,y:number,z:number,r:number,color:string){const top:Vec3=[x,y+r,z],bottom:Vec3=[x,y-r,z];const ring:Vec3[]=[[x+r,y,z],[x,y,z+r],[x-r,y,z],[x,y,z-r]];for(let i=0;i<4;i++){this.triangle(top,ring[i],ring[(i+1)%4],color);this.triangle(bottom,ring[(i+1)%4],ring[i],color);}}
}
export function build3D(kind:string,data:Record<string,number>={},time=0):Mesh[] {
  const p=new MeshBuilder(),c=colors[kind]||'#a6d9ef';
  if (kind === 'dmv' || kind === 'driving' || kind === 'cdl') { drawRoad(p, { ...data, ...(kind === 'dmv' ? {} : { scene: 3, truck: kind === 'cdl' ? 1 : 0 }) }, time); return p.meshes; }
  const floor=kind==='sports'?'#385c48':kind==='outpost'?'#5a624c':kind==='space'?'#253a54':kind==='learner'?'#294d58':'#304359';
  p.box(0,-0.5,0,9,0.35,7,'#233447');p.box(0,-0.17,0,8.6,0.12,6.6,floor);
  for(let i=-4;i<=4;i++)p.box(i,-0.03,0,0.018,0.018,6.3,'#4e677b');for(let i=-3;i<=3;i++)p.box(0,-0.03,i,8.3,0.018,0.018,'#4e677b');
  const pillar=(x:number,z:number,h=1.6)=>{p.box(x,0,z,0.65,h,0.65,'#465c73');p.box(x,h,z,0.72,0.08,0.72,c);};
  if(['math','geometry','calculus','physics'].includes(kind)){
    p.box(0,0,-2.2,6,3.5,0.15,'#1c2940');p.box(0,0.2,-2.07,0.024,3.1,0.03,'#a3bad4');p.box(0,1.3,-2.06,5.8,0.025,0.03,'#a3bad4');
    for(let i=0;i<24;i++){const x=-2.8+i*5.6/23;const y=kind==='calculus'?0.5+(x+1)**2*0.2:kind==='physics'?0.5+Math.max(0,2.4-(x/1.8)**2):1.5+Math.sin(x*1.2)*0.8;p.orb(x,y,-1.98,0.055,c);}
    if(kind==='geometry'){p.box(-1.7,0,0.5,1.5,1.7,1.5,c);p.cylinder(1,0,0.4,0.7,1.9,'#91ddd7');p.orb(2.5,1.2,1.2,0.9,'#ffda94');}
    else {pillar(-2.7,1,0.7);pillar(2.7,1,0.7);const phase=(time*0.4)%1;const x=-2.6+phase*5.2;const y=kind==='physics'?0.6+4*phase*(1-phase)*2:0.6;p.orb(x,y,0.8,0.28,c);for(let i=0;i<8;i++)p.box(-2.4+i*0.65,0,2,0.48,0.3+i*0.11,0.6,c);}
  }else if(kind==='engine'){
    p.box(0,0,0,3,0.5,2.2,'#637585');const moving=data.rpm?Math.sin(time*5):0;
    for(let i=0;i<(data.cylinders||4);i++){const x=-1.1+(i%4)*0.72;const z=Math.floor(i/4)*0.8;p.cylinder(x,0.5,z,0.29,0.5,'#45566d');p.box(x-0.28,0.5,z,0.055,1.35,0.055,'#91a5b4');p.box(x+0.28,0.5,z,0.055,1.35,0.055,'#91a5b4');p.cylinder(x,0.95+moving*0.22,z,0.22,0.2,c);p.box(x,0.7,z,0.06,0.7+moving*0.2,0.06,'#bdd2df');}
    p.cylinder(2.1,0,0,0.85,0.35,'#32485b');for(let i=0;i<8;i++){const angle=i/8*Math.PI*2+time*(data.rpm?2:0);p.orb(2.1+Math.cos(angle)*0.65,0.42,Math.sin(angle)*0.65,0.11,c);}for(let i=0;i<4;i++)p.box(-2.6,0.4+i*0.3,0,0.7,0.07,1.4,'#a5c1c7');
  }else if(kind==='robot'){
    for(const [x,z]of [[2,1],[2,2],[2,3],[4,4],[1,4]])p.box(x-3,0,z-3,0.8,0.8,0.8,'#59637b');
    p.box(3,0,2,0.85,0.08,0.85,'#d8ec8c');const x=(data.x||0)-3,z=(data.y||0)-3;p.box(x,0.2,z,0.7,0.38,0.75,c);p.box(x,0.58,z,0.4,0.24,0.4,'#d6e7ef');p.orb(x+0.14,0.74,z+0.2,0.06,'#1b3241');p.orb(x-0.14,0.74,z+0.2,0.06,'#1b3241');for(const dx of[-0.4,0.4])for(const dz of[-0.25,0.25])p.box(x+dx,0.08,z+dz,0.16,0.28,0.21,'#172832');
  }else if(kind==='vm'){
    p.box(-1,0,0,3.5,0.15,3.4,'#397665');p.box(-1,0.15,0,1.3,0.28,1.3,c);for(let i=0;i<(data.ram||8);i++){const x=0.2+i%4*0.55,z=-1+Math.floor(i/4)*0.7;p.box(x,0.15,z,0.4,0.3,0.55,i===(data.pc||0)%16?'#caff66':'#8994bc');}p.box(2.7,0,-0.5,1.2,1.7,1,'#293b54');for(let i=0;i<5;i++)p.box(2.7,0.2+i*0.28,0.03,0.95,0.07,0.06,i<(data.cycles||0)%6?c:'#536577');
  }else if(kind==='trail'){
    p.box(0,0,0,8,0.02,1.1,'#192e3c');for(let i=-3;i<=3;i++)p.box(i,0.05,0,0.45,0.02,0.04,'#e5d5aa');for(let i=0;i<5;i++){const x=-3+i*1.5;p.box(x,0,-2.2,1,0.8+i%3*0.5,0.9,'#667f8a');p.box(x,0.2,-1.72,0.25,0.35,0.04,c);p.cylinder(x,0,2,0.12,0.8,'#93795e');p.orb(x,1.2,2,0.65,'#829f71');}p.box(-3+(data.step||0)*1.1,0.1,0,0.85,0.35,0.5,c);
  }else if(kind==='water'){
    for(let i=0;i<3;i++){const x=-2.2+i*2.1;p.cylinder(x,0,0,0.75,0.18,'#4b657a');for(const dx of[-0.7,0.7])for(const dz of[-0.7,0.7])p.box(x+dx,0,dz,0.055,2.3,0.055,'#8ca8b7');p.cylinder(x,0.04,0,0.69,clampHeight((data.stored||40)/100*2.2),'#56bad6');p.box(x,2.3,0,1.5,0.12,1.5,c);if(i<2)p.box(x+1,0.55,0,1,0.16,0.16,'#cad5d9');}p.box(0,0,2.3,2,0.55,0.5,'#425f70');
  }else if(kind==='kitchen'){
    p.box(0,0,-1.3,6,1.1,1.3,'#5c697d');p.box(0,1.1,-1.3,6.2,0.12,1.5,'#e0d3ba');p.cylinder(-1,1.22,-1.2,0.7,0.5,'#8899a2');p.cylinder(-1,1.73,-1.2,0.6,0.04,c);for(let i=0;i<6;i++)p.orb(-1+Math.sin(i)*0.45,1.79,-1.2+Math.cos(i)*0.4,0.1,'#b5d88c');for(let i=0;i<4;i++)p.orb(-1+Math.sin(time+i)*0.3,1.9+(time*0.3+i*0.22)%1,-1.2,0.05,'#c2d4df');p.box(2,0,1,1.3,2.4,1.1,'#c3d1d3');p.box(2,1.35,1.58,1.1,0.045,0.04,'#4e7189');
  }else if(kind==='creator'){
    p.box(0,0,-1.8,5,2.7,0.2,'#6f5897');p.box(0,0.3,-1.66,4.6,2.1,0.04,c);p.cylinder(0,0,0,0.9,0.13,'#aab5d2');p.box(-2.4,0.6,1,0.7,0.7,0.5,'#273a50');p.box(-2.4,0,1,0.08,0.6,0.08,'#b9cdd6');p.box(-2.4,0,1,1.1,0.05,0.7,'#596f87');for(const x of[-2.5,2.5]){p.box(x,0,-1,0.08,2.7,0.08,'#bbc5d8');p.orb(x,2.75,-1,0.42,'#ffe7ae');}p.box(1.8,0,1.8,1.5,0.6,0.8,'#445a72');for(let i=0;i<5;i++)p.box(1.25+i*0.25,0.62,1.8,0.08,0.1+((data.peak||0)+i)%4*0.03,0.5,c);
  }else if(kind==='trade'){
    p.box(0,0,0,6,0.9,3.8,'#526676');p.box(0,0.9,0,6.2,0.1,4,'#b2916d');
    const w=data.width||3.4,h=data.height||2.2,n=data.parts??4;for(let i=0;i<Math.min(4,n);i++){if(i%2===0)p.box(0,1,-h/2+(i/2)*h,w,0.16,0.17,c);else p.box(-w/2+Math.floor(i/2)*w,1,0,0.17,0.16,h,c);}
    p.box(-2.3,1.02,0,0.2,0.025,3,'#d9e3dd');for(let i=0;i<13;i++)p.box(-2.27,1.05,-1.3+i*0.2,0.07,0.02,0.015,'#44596c');
    p.box(2.3,1.04,0,0.65,0.06,2.4,'#4e84a0');for(let i=0;i<4;i++)p.box(2.3,1.11,-0.8+i*0.5,0.42,0.01,0.025,'#b2d7df');
  }else if(kind==='lines'){
    for(let i=0;i<6;i++){const x=-3+(i%3)*3,z=-2+Math.floor(i/3)*4;p.box(x,0,z,1.4,0.9,1.2,(data.progress||0)>=1?c:'#526d85');p.box(x,0.9,z,1.55,0.16,1.4,'#adc5cc');p.box(x,0.2,z+0.62,0.3,0.55,0.04,c);p.box(x+0.85,0,z,0.12,2,0.12,'#a98e70');p.box(x+0.85,1.8,z,0.9,0.08,0.08,'#c7d1d4');if(i%3<2)p.box(x+2.15,1.7,z,2.6,0.025,0.025,'#829bac');}
    p.box(0,0,0,8,0.05,0.85,'#213644');p.box(-3+(data.selected||0)%3*3,0.08,0,0.8,0.42,0.55,'#ffbc77');
  }else if(kind==='electric'){
    p.box(0,0,0,6.7,0.15,4.6,'#315e53');p.box(-2.3,0.15,0,0.65,0.75,1.3,'#657d91');p.box(-2.3,0.91,0,0.5,0.07,0.9,c);
    for(const z of[-1,1]){p.box(0,0.2,z,1.4,0.3,0.45,'#be9a72');p.box(0,0.52,z,0.1,0.03,0.45,'#6e5861');p.box(-1.1,0.2,z,0.8,0.04,0.05,c);p.box(1.1,0.2,z,0.8,0.04,0.05,c);}
    p.box(1.6,0.2,0,0.05,0.04,2,'#efb176');p.box(-1.6,0.2,0,0.05,0.04,2,'#efb176');p.box(2.3,0.15,0,1,0.55,1.4,'#697aac');p.box(2.3,0.72,0,0.7,0.04,0.8,(data.current||0)>0?'#bcf197':'#92b9c9');
  }else if(kind==='fire'){
    p.box(0,0,-2.8,8.2,1.2,0.15,'#8b7a8e');p.box(-4,0,0,0.15,1.2,5.6,'#8b7a8e');
    for(const [x,z]of fireObstacles(data.mission||0))p.box(x-3.5,0,z-2.5,0.8,1,0.8,'#766579');
    const exitX=(data.mission||0)%2?3.5:-3.5;p.box(exitX,0,-2.5,0.8,0.06,0.8,'#b1e8a6');p.box(exitX,1.25,-2.8,0.7,0.35,0.08,'#b1e8a6');p.cylinder((data.x??1)-3.5,0,(data.y??4)-2.5,0.17,0.52,c);p.orb((data.x??1)-3.5,0.7,(data.y??4)-2.5,0.2,'#dce4df');
  }else if(kind==='swim'){
    p.box(0,0,0,6,0.1,4.2,'#60bad0');p.box(-3.4,0,-0.1,0.8,0.45,5.2,'#d6c4a2');p.box(3.4,0,-0.1,0.8,0.45,5.2,'#d6c4a2');for(let i=0;i<4;i++)p.box(0,0.13,-1.5+i,5.8,0.02,0.025,'#b3ebef');
    p.cylinder(-3.3,0.5,-1.5,0.12,1.35,'#c9e1e3');p.box(-3.3,1.7,-1.5,0.6,0.3,0.6,c);p.cylinder(3.3,0.5,1,0.36,0.1,'#ffbb8c');p.cylinder(3.3,0.61,1,0.2,0.02,'#d6c4a2');p.box(0,0.2,2.4,2,0.1,0.4,c);
  }else if(['sports','outpost','scenario','learner'].includes(kind)){
    const learner=kind==='learner',center=learner?3:4;
    const variant=data.variant===2?'transfer':data.variant===1?'constraints':'standard';
    const walls=learner?roverWalls(data.layout||0,variant):arenaObstacles(data.seed||0,variant);
    for(const [x,z]of walls){p.box(x-center,0,z-3,0.8,0.66,0.8,'#54667b');p.box(x-center,0.66,z-3,0.85,0.08,0.85,'#738aa1');}
    if(kind==='sports'){
      for(const z of[-2.8,2.8])p.box(0,0,z,8.2,0.018,0.035,'#cce3c4');for(const x of[-4,0,4])p.box(x,0,0,0.035,0.018,5.6,'#cce3c4');
      for(let i=0;i<28;i++){const a=i/28*Math.PI*2;p.box(Math.cos(a)*1.1,0.015,Math.sin(a)*1.1,0.09,0.015,0.09,'#cce3c4');}
      for(const z of[-3.65,3.65])for(let i=0;i<3;i++){p.box(0,0.1+i*0.32,z+Math.sign(z)*i*0.18,7,0.28,0.35,'#506480');for(let seat=0;seat<12;seat++)p.box(-3.1+seat*0.56,0.4+i*0.32,z+Math.sign(z)*i*0.18,0.28,0.18,0.25,seat%3===0?'#dba674':'#819aa6');}
      p.box(4,0,-1.2,0.08,1.7,0.08,'#d7eee1');p.box(4,0,1.2,0.08,1.7,0.08,'#d7eee1');p.box(4,1.7,0,0.08,0.08,2.45,'#d7eee1');
      for(let i=0;i<9;i++)p.box(4.35,0.15+i*0.18,0,0.04,0.025,2.4,'#769389');p.orb((data.goalX??2)-4,0.18,(data.goalY??3)-3,0.18,'#f0caa0');
    }else if(kind==='outpost'){
      p.box(-3,0,-2.25,1.3,0.8,1.3,'#899a70');p.orb(-3,0.9,-2.25,0.85,'#b9ccb0');p.box(-3,0,-1.58,0.4,0.75,0.08,'#37546c');
      p.cylinder(-4,0,-3,0.25,0.55,'#83d2df');p.box(-3.6,0.05,-3,0.3,0.1,0.5,'#d5d8c2');
      for(const [x,z]of[[-4.6,-3.5],[-2,-3.9],[0,-3.8],[2.7,-3.8],[4.7,2.9]]){p.cylinder(x,0,z,0.1,0.75,'#8a705c');p.orb(x,1.15,z,0.58,'#8bb282');p.orb(x,1.55,z,0.36,'#b2d39e');}
      for(let i=0;i<3;i++)p.orb(-2+i*2.2,0.55,-4.6,0.9+i*0.2,'#6c8190');
    }else if(kind==='scenario'){
      for(let i=0;i<5;i++){const x=-4+i*2,z=-3.6,h=1.2+i%3*0.7;p.box(x,0,z,1.1,h,0.85,'#596d8b');p.box(x,h,z,1.2,0.08,0.95,'#aac2d5');for(let j=0;j<3;j++)p.box(x-0.32+j*0.32,0.6,z+0.44,0.16,0.22,0.025,'#cee7bd');}
      for(const x of[-4.4,4.4]){p.box(x,0,1.5,0.07,2,0.07,'#94aab5');p.orb(x,2,1.5,0.15,'#f8daa7');}
    }else{
      if(!data.carrying)p.box((data.variant===2?5:6)-center,0,-3,0.7,0.12,0.7,'#f4c27e');p.box(-3,0,3,0.8,0.12,0.8,'#9eedc9');
      for(const x of[-4.4,4.4]){p.box(x,0,-2.6,0.8,1.4,0.8,'#465e7a');p.box(x,1.4,-2.6,0.84,0.12,0.84,'#9cdaec');for(let i=0;i<3;i++)p.box(x,0.2+i*0.35,-2.17,0.5,0.04,0.02,'#b0dfd5');}
      if(data.storm)for(let i=0;i<8;i++){const x=-4.1+i*1.15,z=-2.4+(time*2+i)%5;p.box(x,1.2+(i%3)*0.4,z,0.035,0.15,0.035,'#b9d8e5');}
    }
    if(kind==='outpost'||kind==='scenario')for(const [i,[x,z]]of arenaSupplySites(kind,variant).entries())if(i>=(data.progress||0)){p.box(x-4,0,z-3,0.38,0.38,0.38,kind==='outpost'?'#e3c89c':'#b8b4ff');p.box(x-4,0.39,z-3,0.08,0.02,0.4,'#eaf2d7');}
    const gx=(data.goalX??2)-center,gz=(data.goalY??3)-3;
    for(let i=0;i<16;i++){const a=i/16*Math.PI*2;p.box(gx+Math.cos(a)*0.42,0.03,gz+Math.sin(a)*0.42,0.085,0.03,0.085,'#c9f0b4');}
    p.orb(gx,0.95+Math.sin(time*2)*0.07,gz,0.11,'#bfeec6');
    for(let i=0;i<Math.min(12,data.trailCount||0);i++)p.cylinder((data[`tx${i}`]||0)-center,0.05,(data[`ty${i}`]||0)-3,0.06+i*0.003,0.025,'#7dded3');
    const x=(data.x??0)-center,z=(data.y??3)-3,bob=Math.sin(time*2.5)*0.015;p.box(x,0.18+bob,z,0.62,0.33,0.7,c);p.box(x,0.52+bob,z,0.42,0.26,0.38,'#d2e0e9');p.box(x,0.57+bob,z+0.2,0.33,0.1,0.03,'#2b566b');
    for(const dx of[-0.32,0.32])for(const dz of[-0.22,0.22])p.orb(x+dx,0.16,z+dz,0.12,'#162c3a');p.cylinder(x,0.79+bob,z,0.02,0.16,'#a5c2d5');p.orb(x,0.96+bob,z,0.04,'#a7f2d8');
    if(data.carrying)p.box(x,0.79,z-0.18,0.23,0.22,0.23,'#f4c27e');
  }else if(kind==='space'){
    p.box(-2,0,-0.5,1.6,1.6,1.6,'#607b96');p.box(-2,1.6,-0.5,1.7,0.15,1.7,c);p.box(-3.4,0.8,-0.5,1.2,0.04,2,'#7187bf');p.box(-0.6,0.8,-0.5,1.2,0.04,2,'#7187bf');p.cylinder(-2,0,-0.5,0.95,0.1,'#97c9d8');
    const x=Math.max(-1.4,Math.min(3.6,-1.4+(data.x??50)*0.075)),z=Math.max(-2,Math.min(2,(data.y??3)*0.25));p.box(x,0.65,z,0.7,0.45,0.8,'#c3d0df');p.box(x,0.8,z-0.9,1.4,0.04,0.75,c);p.box(x,0.8,z+0.9,1.4,0.04,0.75,c);for(let i=0;i<8;i++)p.orb(-3.5+i,0.6+(i%3)*0.7,-2.5,0.04,'#edf1dd');
    for(let i=0;i<52;i++){const sx=-7+(i*31%140)/10,sz=-6+(i*17%100)/10,sy=1+(i*13%60)/10;p.orb(sx,sy,sz,i%7===0?0.045:0.022,i%3===0?'#acd8ee':'#d9d5eb');}
    for(const dx of[-3.4,-0.6])for(let i=0;i<5;i++)p.box(dx-0.5+i*0.25,0.845,-0.5,0.025,0.008,1.9,'#aacbe0');
    p.box(-2,0.45,0.32,0.65,0.65,0.08,'#24465b');p.box(-2,0.8,0.38,0.3,0.12,0.03,'#b3f2d5');p.cylinder(-2,1.75,-0.5,0.11,0.7,'#91aec5');p.orb(-2,2.5,-0.5,0.2,'#c7d8e4');
    for(let i=0;i<8;i++){const a=i/8*Math.PI*2;p.orb(-1.3,0.9+Math.cos(a)*0.42,-0.5+Math.sin(a)*0.42,0.05,'#b4edc8');}
    for(let i=0;i<Math.min(12,data.trailCount||0);i++)p.orb(Math.max(-1.4,Math.min(3.6,-1.4+(data[`tx${i}`]||0)*0.075)),0.48,Math.max(-2,Math.min(2,(data[`ty${i}`]||0)*0.25)),0.035,'#72d6e6');
    if(Math.hypot(data.vx||0,data.vy||0)>0.1){p.orb(x+0.44,0.83,z,0.09+Math.sin(time*6)*0.025,'#b1e9f5');p.orb(x+0.58,0.83,z,0.055,'#7dc6ea');}
    p.box(x,1.11,z,0.24,0.05,0.26,'#91d9e8');
  }
  return p.meshes;
}
const clampHeight=(v:number)=>Math.max(0.06,Math.min(2.2,v));
export function vertexData(meshes:Mesh[]){const out:number[]=[];for(const mesh of meshes){const color=rgb(mesh.color);for(let i=0;i<mesh.vertices.length;i+=6)out.push(...mesh.vertices.slice(i,i+6),...color);}return new Float32Array(out);}
export function cameraMatrix(angle:number,zoom:number,aspect:number){
  const eye:Vec3=[Math.sin(angle)*zoom,zoom*0.62,Math.cos(angle)*zoom];const target:Vec3=[0,0.8,0];const norm=(v:number[])=>{const l=Math.hypot(...v);return v.map(x=>x/l);};const cross=(a:number[],b:number[])=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];const z=norm(eye.map((v,i)=>v-target[i])),x=norm(cross([0,1,0],z)),y=cross(z,x);const dot=(a:number[],b:number[])=>a.reduce((s,v,i)=>s+v*b[i],0);const view=[x[0],y[0],z[0],0,x[1],y[1],z[1],0,x[2],y[2],z[2],0,-dot(x,eye),-dot(y,eye),-dot(z,eye),1];const f=1/Math.tan(Math.PI/7),near=0.1,far=80;const proj=[f/aspect,0,0,0,0,f,0,0,0,0,(far+near)/(near-far),-1,0,0,2*far*near/(near-far),0];const matrix=Array(16).fill(0);for(let c=0;c<4;c++)for(let r=0;r<4;r++)for(let k=0;k<4;k++)matrix[c*4+r]+=proj[k*4+r]*view[c*4+k];return {matrix:new Float32Array(matrix),eye};
}
export function projectMesh(mesh:Mesh,angle=0.65,zoom=12){const {matrix}=cameraMatrix(angle,zoom,1.78);const points=[];for(let i=0;i<mesh.vertices.length;i+=6){const v=[...mesh.vertices.slice(i,i+3),1],p=[0,0,0,0];for(let r=0;r<4;r++)for(let k=0;k<4;k++)p[r]+=matrix[k*4+r]*v[k];points.push([360+p[0]/p[3]*360,200-p[1]/p[3]*200]);}return points.map(p=>p.map(x=>x.toFixed(1)).join(',')).join(' ');}

export function shadedColor(mesh:Mesh){const normal=mesh.vertices.slice(3,6),light=[-0.32,0.75,0.54];const factor=0.45+Math.max(0,normal.reduce((sum,v,i)=>sum+v*light[i],0))*0.55;return '#'+rgb(mesh.color).map(v=>Math.round(v*factor*255).toString(16).padStart(2,'0')).join('');}
