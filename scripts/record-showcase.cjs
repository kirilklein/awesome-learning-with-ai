// Records the README hero and showcase GIFs from the live tools.
//
//   node scripts/record-showcase.cjs            record every clip, then build the GIFs
//   node scripts/record-showcase.cjs <clip>     record one clip only (see CLIPS below)
//   node scripts/record-showcase.cjs build      build the GIFs from clips already recorded
//
// Needs Node 20+, Playwright with Chromium (npm i -D playwright && npx playwright install chromium)
// and ffmpeg on PATH. Set PLAYWRIGHT to load Playwright from another path.
//
// Each page runs under a paused clock: the script sets the next action, advances time by one
// frame (1/15 s) and takes a screenshot. Animations stay smooth on machines without a GPU,
// where these pages render at a few frames per second in real time.
const fs=require('node:fs');
const path=require('node:path');
const {execFileSync}=require('node:child_process');
const {chromium}=require(process.env.PLAYWRIGHT||'playwright');

const root=path.resolve(__dirname,'..');
const work=path.join(root,'.showcase-frames');
const FPS=15;
const ease=u=>u<.5?2*u*u:1-Math.pow(-2*u+2,2)/2;
const lerp=(a,b,u)=>a+(b-a)*u;
const clamp=u=>Math.min(1,Math.max(0,u));
// value at time t along keyframes [[t, value], ...]
function along(keys,t,pick){for(let i=1;i<keys.length;i++)if(t<=keys[i][0]){const u=ease(clamp((t-keys[i-1][0])/(keys[i][0]-keys[i-1][0]||1)));return pick(keys[i-1][1],keys[i][1],u);}return keys[keys.length-1][1];}
const point=(P,keys,t)=>along(keys,t,(a,b,u)=>[lerp(P[a][0],P[b][0],u),lerp(P[a][1],P[b][1],u)]);
const num=(keys,t)=>along(keys,t,(a,b,u)=>lerp(a,b,u));

const CURSOR=size=>`(()=>{const c=document.createElement('div');c.id='__cur';c.style.cssText='position:fixed;left:-99px;top:-99px;width:${size}px;height:${size}px;z-index:2147483647;pointer-events:none;margin:-3px 0 0 -5px';
c.innerHTML='<div id="__pulse" style="position:absolute;left:-12px;top:-12px;width:34px;height:34px;border-radius:50%;border:3px solid #e0582b;opacity:0"></div><svg viewBox="0 0 24 24" width="${size}" height="${size}" style="display:block;width:${size}px;height:${size}px"><path d="M4 2l16 9-7 2-3 7z" fill="#181b19" stroke="#fff" stroke-width="1.5" stroke-linejoin="round"/></svg>';document.body.appendChild(c);})()`;

const hideTour=()=>{for(const e of document.querySelectorAll('*'))if(e.children.length<3&&/What is Transformer\?/.test(e.textContent)){let n=e;for(let i=0;i<8&&n;i++){const pos=getComputedStyle(n).position;if(pos==='fixed'||pos==='absolute'){n.style.display='none';break;}n=n.parentElement;}}};
const setRange=({sel,v})=>{const r=document.querySelector(sel);r.value=v;r.dispatchEvent(new Event('input',{bubbles:true}));r.dispatchEvent(new Event('change',{bubbles:true}));};

async function anatomy(p,slug,ready){
  for(let k=0;k<5;k++){try{await p.goto('https://skills.wheresryan.sh/anatomy/collection/'+slug,{timeout:30000});await p.waitForFunction(re=>[...document.querySelectorAll('body *')].some(e=>new RegExp(re).test(e.textContent)),ready,{timeout:15000});break;}catch{console.log('  reload');}}
  await p.waitForTimeout(2500);
  // cover the page title and the description so only the machine and its readout show
  await p.evaluate(()=>{for(const [top,h] of [[120,72],[592,200]]){const m=document.createElement('div');m.style.cssText=`position:fixed;left:0;right:0;top:${top}px;height:${h}px;background:#fafafa;z-index:2147483646;pointer-events:none`;document.body.appendChild(m);}});
}
const ANATOMY={vw:1000,vh:1000,dsf:2,frames:50,cursor:34,clip:{x:215,y:165,width:570,height:527}};

const CLIPS={
  // hover and expand the attention matrix, step through heads, open the softmax formula, drag temperature
  'transformer-explainer':{vw:1600,vh:900,frames:150,cursor:40,blendLoop:6,clip:{x:300,y:0,width:1300,height:712},
    async open(p){await p.goto('https://poloclub.github.io/transformer-explainer/');await p.waitForSelector('input.slider',{timeout:60000});await p.waitForTimeout(5000);await p.evaluate(hideTour);},
    targets:p=>p.evaluate(()=>{const c=r=>[r.left+r.width/2,r.top+r.height/2];
      const heads=[...document.querySelectorAll('button.svelte-3ij8uy')].map(b=>c(b.getBoundingClientRect()));
      const m=document.querySelector('.attention-matrix-container').getBoundingClientRect();
      const pr=[...document.querySelectorAll('.title.expandable')].find(e=>/Probabilities/.test(e.textContent)).getBoundingClientRect();
      const s=document.querySelector('input.slider').getBoundingClientRect();
      return{prev:heads[0],next:heads[1],m0:[m.left+m.width*.18,m.top+m.height*.3],m1:[m.left+m.width*.8,m.top+m.height*.7],probs:[pr.left+pr.width*.45,pr.top+22],R:[1150,800],slider:[s.left,s.width,s.top+s.height/2]};}),
    moves:[[0,'R'],[0.4,'R'],[1.0,'m0'],[1.7,'m1'],[1.8,'m1'],[2.5,'R'],[4.6,'R'],[5.0,'next'],[5.55,'next'],[5.9,'probs'],[6.2,'probs'],[6.5,'T'],[7.9,'T'],[8.1,'probs'],[8.15,'probs'],[8.55,'prev'],[8.95,'prev'],[9.5,'R'],[10,'R']],
    temperature:[[0,6],[6.5,6],[7.0,0],[7.5,13],[7.9,6],[10,6]],
    clicks:[[1.8,'m1'],[4.6,'R'],[5.2,'next'],[5.55,'next'],[6.2,'probs'],[8.15,'probs'],[8.6,'prev'],[8.95,'prev']],
    async frame(p,t,st){const P=await this.targets(p);
      const v=Math.round(num(this.temperature,t));P.T=[P.slider[0]+P.slider[1]*(v/17),P.slider[2]];
      if(v!==st.v){st.v=v;await p.evaluate(setRange,{sel:'input.slider',v});}
      const pos=point(P,this.moves,t);await p.mouse.move(...pos);
      for(const [tc,k] of this.clicks)if(t>=tc&&!st['c'+tc]){st['c'+tc]=1;st.click=t;await p.mouse.click(...P[k]);}
      return pos;}},
  // hold the press until the tank runs dry and presses are refused
  'anatomy-token-bucket':{...ANATOMY,
    async open(p){await anatomy(p,'rate-limiter','\\d \\/ 8');await p.mouse.move(437,357);await p.mouse.down();await p.waitForTimeout(150);await p.mouse.up();await p.waitForTimeout(6000);},
    async frame(p,t,st){if(t>=0.15&&!st.down){st.down=1;st.click=t;await p.mouse.down();}return[437,357];}},
  // heat the wheel, spin it, cool it to one pocket, spin again
  'anatomy-temperature':{...ANATOMY,
    async open(p){await anatomy(p,'sampling','T \\d\\.\\d\\d');},
    P:{a:[420,380],hot:[680,380],wheel:[430,320],cold:[330,380]},
    moves:[[0,'a'],[0.1,'a'],[0.8,'hot'],[0.95,'wheel'],[1.7,'hot'],[1.8,'hot'],[2.5,'cold'],[2.65,'wheel'],[3.4,'wheel']],
    events:[[0.1,'down'],[0.8,'up'],[0.95,'tap'],[1.8,'down'],[2.5,'up'],[2.65,'tap']],
    async frame(p,t,st){const pos=point(this.P,this.moves,t);await p.mouse.move(...pos);
      for(const [tc,e] of this.events)if(t>=tc&&!st['e'+tc]){st['e'+tc]=1;if(e!=='up')st.click=t;if(e==='down')await p.mouse.down();else if(e==='up')await p.mouse.up();else{await p.mouse.down();await p.mouse.up();}}
      return pos;}},
  // throttle a jet engine up until the afterburner lights
  'anatomy-afterburner':{...ANATOMY,
    async open(p){await anatomy(p,'afterburner','kN');},
    async frame(p,t,st){const pos=[560,330];
      if(t>=0.15&&!st.focus){st.focus=1;st.click=t;await p.mouse.click(...pos);}
      const n=Math.floor((t-0.3)/0.15);if(t>=0.3&&n<12&&n>=(st.k||0)){st.k=n+1;await p.keyboard.press('ArrowRight');}
      return pos;}},
  // answer the pre-lesson check, fly down the lesson, saturate softmax, fly back up
  'ai-engineering-from-scratch':{vw:560,vh:900,dsf:2,frames:150,cursor:30,clip:{x:1,y:76,width:558,height:516},
    async open(p){await p.goto('https://aiengineeringfromscratch.com/lesson?path=phases/07-transformers-deep-dive/02-self-attention-from-scratch');await p.waitForSelector('#quiz-pre button.quiz-option',{timeout:60000});await p.waitForTimeout(3000);await p.evaluate(()=>{document.documentElement.style.scrollBehavior='auto';});},
    // document positions, read every frame: answering the quiz changes the layout
    layout:p=>p.evaluate(()=>{const Y=e=>e.getBoundingClientRect().top+scrollY;const c=e=>{const r=e.getBoundingClientRect();return[r.left+Math.min(70,r.width/2),r.top+r.height/2]};
      const opts=[...document.querySelectorAll('#quiz-pre button.quiz-option')];const figs=[...document.querySelectorAll('.lesson-figure')];
      const soft=figs.find(f=>f.querySelector('input[type=range]'));const rg=soft.querySelector('input[type=range]').getBoundingClientRect();const sel=soft.querySelector('select').getBoundingClientRect();
      const wrong=opts.find(b=>/To normalize/.test(b.textContent)),right=opts.find(b=>/Query, key, and value/.test(b.textContent));
      return{quiz:Y(document.getElementById('quiz-pre'))-70,q2:Y(right)-330,anim:Y(figs[0])-90,soft:Y(soft)-70,wrong:c(wrong),right:c(right),range:[rg.left,rg.width,rg.top+rg.height/2],sel:[sel.left+sel.width*.6,sel.top+sel.height/2]};}),
    scroll:[[0,'quiz'],[0.9,'quiz'],[1.35,'q2'],[2.1,'q2'],[2.9,'anim'],[3.9,'anim'],[4.4,'soft'],[7.8,'soft'],[8.8,'quiz'],[10,'quiz']],
    headDim:[[0,64],[5.0,64],[5.6,8],[6.7,256],[7.25,256],[7.7,64],[10,64]],
    moves:[[0,'rest'],[0.3,'rest'],[0.8,'wrong'],[1.4,'wrong'],[1.95,'right'],[2.3,'right'],[2.9,'rest'],[4.45,'rest'],[4.75,'sel'],[5.0,'thumb'],[6.75,'thumb'],[7.0,'sel'],[7.25,'thumb'],[7.7,'thumb'],[8.0,'rest'],[10,'rest']],
    async frame(p,t,st){let L=await this.layout(p);
      await p.evaluate(y=>scrollTo(0,y),along(this.scroll,t,(a,b,u)=>lerp(L[a],L[b],u)));L=await this.layout(p);
      const dk=Math.max(8,Math.round(num(this.headDim,t)/8)*8);
      if(dk!==st.dk){st.dk=dk;await p.evaluate(setRange,{sel:'.lesson-figure input[type=range]',v:dk});}
      const scaled=!(t>=4.75&&t<7.0);
      if(scaled!==st.scaled){if(st.scaled!==undefined)st.click=t;st.scaled=scaled;await p.evaluate(v=>{const s=document.querySelector('.lesson-figure select');s.value=v;s.dispatchEvent(new Event('change',{bubbles:true}));},scaled?'1':'0');}
      const P={rest:[470,520],wrong:L.wrong,right:L.right,sel:L.sel,thumb:[L.range[0]+L.range[1]*((dk-8)/248),L.range[2]]};
      const answer=re=>p.evaluate(re=>[...document.querySelectorAll('#quiz-pre button.quiz-option')].find(b=>new RegExp(re).test(b.textContent)).click(),re);
      if(t>=0.8&&!st.a1){st.a1=1;st.click=t;await answer('To normalize');}
      if(t>=1.95&&!st.a2){st.a2=1;st.click=t;await answer('Query, key, and value');}
      // reset the quiz while it is off screen, so the loop starts clean
      if(t>=8.0&&!st.reset){st.reset=1;await p.evaluate(()=>{const b=[...document.querySelectorAll('#quiz-pre button')].find(b=>/retry/i.test(b.textContent));if(b)b.click();document.activeElement?.blur();});}
      return point(P,this.moves,t);}},
};

async function record(name){const C=CLIPS[name],out=path.join(work,name);
  fs.rmSync(out,{recursive:true,force:true});fs.mkdirSync(out,{recursive:true});
  const b=await chromium.launch();
  try{const p=await b.newPage({viewport:{width:C.vw,height:C.vh},deviceScaleFactor:C.dsf||1});
    await C.open.call(C,p);await p.evaluate(CURSOR(C.cursor));
    await p.clock.install();await p.clock.pauseAt(Date.now()+1000);
    // three seconds of pre-roll so running animations are settled at frame 0
    await C.frame.call(C,p,0,{});for(let k=0;k<45;k++)await p.clock.runFor(1000/FPS);
    const st={};
    for(let i=0;i<C.frames;i++){const t=i/FPS;const [x,y]=await C.frame.call(C,p,t,st);
      const pulse=st.click==null?null:t-st.click;
      await p.evaluate(([x,y,pu])=>{const c=document.getElementById('__cur');c.style.left=x+'px';c.style.top=y+'px';
        const q=document.getElementById('__pulse');if(pu==null||pu>.5)q.style.opacity=0;else{q.style.opacity=1-pu/.5;q.style.transform=`scale(${.4+2.2*pu})`;}},[x,y,pulse]);
      await p.clock.runFor(1000/FPS);
      await p.screenshot({path:path.join(out,String(i).padStart(4,'0')+'.png'),clip:C.clip});}
    console.log(name,C.frames,'frames');
  }finally{await b.close();}
  // the sampled token is random, so blend the last frames into the first to hide the loop seam
  if(C.blendLoop)ff([...rate,'-i',path.join(out,'%04d.png'),'-vf',`split[a][b];[b]trim=end_frame=${C.blendLoop},setpts=PTS-STARTPTS+${(C.frames-C.blendLoop)/FPS}/TB[h];[a][h]overlay=enable='gte(n,${C.frames-C.blendLoop})':format=auto,format=rgb24`,'-start_number','0',path.join(out,'b%04d.png')]);
}

const ff=args=>execFileSync('ffmpeg',['-loglevel','error','-y',...args],{stdio:'inherit'});
const rate=['-framerate',String(FPS)];
const gif=(input,width,out)=>ff([...(input.includes('%')?rate:[]),'-i',input,'-vf',`scale=${width}:-1:flags=lanczos,split[s0][s1];[s0]palettegen=max_colors=160:stats_mode=diff[p];[s1][p]paletteuse=dither=bayer:bayer_scale=4:diff_mode=rectangle`,'-loop','0',out]);
const frames=name=>path.join(work,name,CLIPS[name].blendLoop?'b%04d.png':'%04d.png');

const HERO=`<!doctype html><html><head><meta charset="utf-8"><style>
*{box-sizing:border-box;margin:0;padding:0}html,body{width:1200px;height:780px;overflow:hidden;background:#fbfbfa;color:#181b19;font-family:Inter,"DejaVu Sans",Arial,sans-serif}
.k{position:absolute;left:34px;top:40px;font-size:13px;font-weight:700;letter-spacing:1.5px}.k::before{content:"";display:inline-block;width:9px;height:9px;background:#234b35;margin-right:10px}
h1{position:absolute;left:30px;top:66px;font-size:66px;line-height:1;letter-spacing:-3px;font-weight:800}h1 span{color:#234b35}
.sub{position:absolute;left:34px;top:142px;font-size:19px;color:#545b54}
.panel{position:absolute;border:1px solid #cdd0c8;border-radius:12px;background:#fff;box-shadow:0 8px 24px rgba(24,27,25,.08)}
.cap{position:absolute;font-size:16px;font-weight:600}.cap span{font-weight:400;color:#6b716b;margin-left:7px;font-size:14px}
.foot{position:absolute;left:34px;top:676px;width:750px;font-size:14px;line-height:1.6;color:#6b716b;border-top:1px solid #cdd0c8;padding-top:12px}.foot b{color:#181b19}
</style></head><body>
<div class="k">AWESOME LEARNING WITH AI</div><h1>Learn with <span>AI.</span></h1>
<div class="sub">Explanations you can explore. Concepts you can practise.</div>
<div class="panel" style="left:32px;top:192px;width:762px;height:418px"></div><div class="cap" style="left:34px;top:620px">Watch a model work<span>Transformer Explainer</span></div>
<div class="panel" style="left:812px;top:32px;width:358px;height:331px"></div><div class="cap" style="left:814px;top:372px">Operate the concept<span>Anatomy</span></div>
<div class="panel" style="left:812px;top:404px;width:358px;height:331px"></div><div class="cap" style="left:814px;top:744px">Get tested<span>AI Engineering from Scratch</span></div>
<div class="foot"><b>Recorded live from each tool.</b><br>Transformer Explainer (Polo Club) · Anatomy (Ryan) · AI Engineering from Scratch (Rohit Ghumare)</div>
</body></html>`;
const MASK=(w,h)=>`<body style="margin:0;background:#000"><div style="width:${w}px;height:${h}px;border-radius:11px;background:#fff"></div></body>`;

async function build(){
  // Anatomy: three machines cut together
  const ana=path.join(work,'anatomy');fs.rmSync(ana,{recursive:true,force:true});fs.mkdirSync(ana);
  let i=0;for(const n of ['anatomy-token-bucket','anatomy-temperature','anatomy-afterburner'])for(const f of fs.readdirSync(path.join(work,n)).filter(f=>/^\d+\.png$/.test(f)).sort())fs.copyFileSync(path.join(work,n,f),path.join(ana,String(i++).padStart(4,'0')+'.png'));
  const show=path.join(root,'assets/showcase');fs.mkdirSync(show,{recursive:true});
  gif(frames('transformer-explainer'),800,path.join(show,'transformer-explainer.gif'));
  gif(path.join(ana,'%04d.png'),520,path.join(show,'anatomy.gif'));
  gif(frames('ai-engineering-from-scratch'),520,path.join(show,'ai-engineering-from-scratch.gif'));
  // hero: static layout plus the three clips in rounded panels
  const b=await chromium.launch();
  try{const shot=async(html,w,h,file)=>{const p=await b.newPage({viewport:{width:w,height:h}});await p.setContent(html);await p.screenshot({path:file});await p.close();};
    await shot(HERO,1200,780,path.join(work,'hero-bg.png'));await shot(MASK(760,416),760,416,path.join(work,'mask-wide.png'));await shot(MASK(356,329),356,329,path.join(work,'mask-small.png'));
  }finally{await b.close();}
  const mp4=path.join(work,'hero.mp4');
  ff([...rate,'-loop','1','-i',path.join(work,'hero-bg.png'),'-framerate',String(FPS),'-i',frames('transformer-explainer'),'-framerate',String(FPS),'-i',path.join(ana,'%04d.png'),'-framerate',String(FPS),'-i',frames('ai-engineering-from-scratch'),
    '-loop','1','-framerate',String(FPS),'-i',path.join(work,'mask-wide.png'),'-loop','1','-framerate',String(FPS),'-i',path.join(work,'mask-small.png'),
    '-filter_complex','[4:v]format=gray[mw];[5:v]format=gray,split[m1][m2];[1:v]scale=760:416:flags=lanczos,format=rgba[a0];[a0][mw]alphamerge[a];[2:v]scale=356:329:flags=lanczos,format=rgba[b0];[b0][m1]alphamerge[b];[3:v]scale=356:329:flags=lanczos,format=rgba[c0];[c0][m2]alphamerge[c];[0:v][a]overlay=33:193:shortest=1[t1];[t1][b]overlay=813:33:shortest=1[t2];[t2][c]overlay=813:405:shortest=1,format=yuv420p',
    '-frames:v','150','-c:v','libx264','-crf','16',mp4]);
  gif(mp4,1200,path.join(root,'assets/hero.gif'));
  console.log('wrote assets/hero.gif and assets/showcase/*.gif');
}

(async()=>{const arg=process.argv[2];
  if(arg&&arg!=='build'&&!CLIPS[arg])throw new Error('unknown clip: '+arg+'. Clips: '+Object.keys(CLIPS).join(', '));
  if(arg!=='build')for(const n of arg?[arg]:Object.keys(CLIPS))await record(n);
  if(!arg||arg==='build')await build();
})().catch(e=>{console.error(e);process.exitCode=1;});
