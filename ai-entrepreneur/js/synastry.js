/* ============================================================
   AI 创投命理合盘 · 主逻辑
   ============================================================ */

/* ============ 内置库（公开资料整理，趣味用） ============ */
const PRESETS={
 org:[
  {n:'英伟达 NVIDIA',d:'1993-04-05'},{n:'苹果 Apple',d:'1976-04-01'},{n:'微软 Microsoft',d:'1975-04-04'},
  {n:'谷歌 Google',d:'1998-09-04'},{n:'亚马逊 Amazon',d:'1994-07-05'},{n:'特斯拉 Tesla',d:'2003-07-01'},
  {n:'Meta（脸书）',d:'2004-02-04'},{n:'OpenAI',d:'2015-12-11'},{n:'Anthropic',d:'2021-01-01'},
  {n:'SpaceX',d:'2002-03-14'},{n:'奈飞 Netflix',d:'1997-08-29'},{n:'腾讯 Tencent',d:'1998-11-11'},
  {n:'阿里巴巴',d:'1999-09-09'},{n:'字节跳动',d:'2012-03-09'},{n:'小米 Xiaomi',d:'2010-04-06'},
  {n:'华为 Huawei',d:'1987-09-15'},{n:'比亚迪 BYD',d:'1995-02-10'},{n:'美团 Meituan',d:'2010-03-04'}
 ],
 person:[
  {n:'埃隆·马斯克',d:'1971-06-28'},{n:'史蒂夫·乔布斯',d:'1955-02-24'},{n:'比尔·盖茨',d:'1955-10-28'},
  {n:'杰夫·贝索斯',d:'1964-01-12'},{n:'黄仁勋',d:'1963-02-17'},{n:'马克·扎克伯格',d:'1984-05-14'},
  {n:'沃伦·巴菲特',d:'1930-08-30'},{n:'萨姆·奥特曼',d:'1985-04-22'},{n:'马云',d:'1964-09-10'},
  {n:'马化腾',d:'1971-10-29'},{n:'雷军',d:'1969-12-16'},{n:'张一鸣',d:'1983-04-01'}
 ]
};

/* ============ 命格推算 ============ */
const ANIMALS=['鼠','牛','虎','兔','龙','蛇','马','羊','猴','鸡','狗','猪'];
const BRANCH=['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
const EMOJI=['🐭','🐮','🐯','🐰','🐲','🐍','🐴','🐑','🐵','🐔','🐶','🐷'];
const ELS=['木','火','土','金','水'];
const WEST=[['摩羯',19],['水瓶',18],['双鱼',20],['白羊',20],['金牛',21],['双子',21],['巨蟹',22],['狮子',23],['处女',23],['天秤',23],['天蝎',22],['射手',22],['摩羯',31]];
const WSYM={摩羯:'♑',水瓶:'♒',双鱼:'♓',白羊:'♈',金牛:'♉',双子:'♊',巨蟹:'♋',狮子:'♌',处女:'♍',天秤:'♎',天蝎:'♏',射手:'♐'};
function westSign(m,d){return d<WEST[m-1][1]?WEST[m-1][0]:WEST[m][0];}
function zodiacIcon(dz) {
  return dz.emoji || EMOJI[dz.zi] || dz.animal;
}
window.zodiacIcon = zodiacIcon;
function destiny(dateStr){
  const dt=new Date(dateStr+'T00:00:00'); if(isNaN(dt))return null;
  const y=dt.getFullYear(),m=dt.getMonth()+1,d=dt.getDate();
  const zi=((y-4)%12+12)%12, elIdx=Math.floor((((y-4)%10)+10)%10/2);
  const w=westSign(m,d);
  return {y,m,d,zi,animal:ANIMALS[zi],branch:BRANCH[zi],emoji:EMOJI[zi],el:ELS[elIdx],west:w,wsym:WSYM[w]};
}

/* ============ 关系引擎（稳定可复现） ============ */
const SIX=[[0,1],[2,11],[3,10],[4,9],[5,8],[6,7]];
const TRIAD=[[8,0,4],[11,3,7],[2,6,10],[5,9,1]];
const elDist=(x,y)=>{const i=ELS.indexOf(x),j=ELS.indexOf(y),a=Math.abs(i-j);return Math.min(a,5-a);};
const spread=(a,b,lo,hi)=>{const m=Math.min(a,b),n=Math.max(a,b);return lo+((m*7+n*13+m*n)%(hi-lo+1));};
function relate(A,B){
  const a=A.zi,b=B.zi;let base,tone,rel;
  const clash=b===(a+6)%12;
  const six=SIX.some(p=>(p[0]===a&&p[1]===b)||(p[0]===b&&p[1]===a));
  const three=TRIAD.some(t=>t.includes(a)&&t.includes(b)&&a!==b);
  if(a===b){base=60;tone='gray';rel='同属相·撞型';}
  else if(clash){base=32;tone='red';rel='相冲·气场对冲';}
  else if(six){base=90;tone='gold';rel='六合·天作之合';}
  else if(three){base=84;tone='gold';rel='三合·同盟局';}
  else{base=60;tone='gray';rel='平相';}
  const d=elDist(A.el,B.el);let elTag;
  if(d===1){base+=8;if(tone==='gray')tone='gold';elTag=A.el+B.el+'相生';}
  else if(d===2){base-=11;if(tone!=='gold')tone='red';elTag=A.el+B.el+'相克';}
  else{elTag='同'+A.el+'比和';}
  const score=Math.max(15,Math.min(98,base+spread(a,b,-3,3)));
  return {score,tone,rel,elTag,clash,six,three};
}

/* ============ 状态 ============ */
const ST={a:{type:'org',name:'',date:'',dz:null},b:{type:'org',name:'',date:'',dz:null}};
const $=s=>document.querySelector(s);
const $$=s=>document.querySelectorAll(s);

function fillPresets(){
  ['a','b'].forEach(side=>{
    const sel=$(`.preset[data-side=${side}]`); sel.innerHTML='<option value="">— 手动输入 —</option>';
    PRESETS[ST[side].type].forEach((p,i)=>{const o=document.createElement('option');o.value=i;o.textContent=p.n;sel.appendChild(o);});
  });
}
function refreshDestiny(side){
  const o=ST[side];const dz=o.date?destiny(o.date):null;o.dz=dz;
  const tag=$('#dtag'+side.toUpperCase());
  if(dz){tag.innerHTML=`${zodiacIcon(dz)} <b>${dz.branch}${dz.animal}</b> · 五行属<b>${dz.el}</b> · <b>${dz.west}座</b> ${dz.wsym} · ${dz.y}`;}
  else tag.textContent='填好后自动推算命格…';
  $('#run').disabled=!(ST.a.dz&&ST.b.dz&&ST.a.name&&ST.b.name);
}
function setType(side,t){
  const changed = ST[side].type !== t;
  ST[side].type=t;
  $$(`.typetog[data-side=${side}] button`).forEach(b=>b.classList.toggle('on',b.dataset.t===t));
  const org=t==='org';
  $('#lblName'+side.toUpperCase()).textContent=org?'企业名称':'人物姓名';
  $('#lblDate'+side.toUpperCase()).textContent=org?'成立日期':'出生日期';
  $(`.nm[data-side=${side}]`).placeholder=org?'如：英伟达':'如：黄仁勋';
  if (changed) {
    ST[side].name='';
    ST[side].date='';
    ST[side].dz=null;
    $(`.nm[data-side=${side}]`).value='';
    $(`.dt[data-side=${side}]`).value='';
    $(`.preset[data-side=${side}]`).value='';
  }
  fillPresets();
  refreshDestiny(side);
}

/* ============ 绑定 ============ */
$$('.typetog button').forEach(b=>b.onclick=()=>setType(b.parentElement.dataset.side,b.dataset.t));
$$('.preset').forEach(sel=>sel.onchange=()=>{
  const side=sel.dataset.side, v=sel.value;
  if(v===''){return;}
  const p=PRESETS[ST[side].type][+v];
  ST[side].name=p.n;ST[side].date=p.d;
  $(`.nm[data-side=${side}]`).value=p.n; $(`.dt[data-side=${side}]`).value=p.d;
  refreshDestiny(side);
});
$$('.nm').forEach(inp=>inp.oninput=()=>{ST[inp.dataset.side].name=inp.value.trim();refreshDestiny(inp.dataset.side);});
$$('.dt').forEach(inp=>inp.oninput=()=>{ST[inp.dataset.side].date=inp.value;refreshDestiny(inp.dataset.side);});

function pickRandomPreset(side) {
  const lib = PRESETS[ST[side].type];
  const p = lib[Math.floor(Math.random() * lib.length)];
  ST[side].name = p.n;
  ST[side].date = p.d;
  $(`.nm[data-side=${side}]`).value = p.n;
  $(`.dt[data-side=${side}]`).value = p.d;
  $(`.preset[data-side=${side}]`).value = '';
  refreshDestiny(side);
}

$('#rand').onclick=()=>{
  ['a','b'].forEach(pickRandomPreset);
  run();
};
$('#again').onclick=()=>{$('#result').classList.remove('show');window.scrollTo({top:0,behavior:'smooth'});};
$('#run').onclick=run;

/* ============ 主流程 ============ */
var LAST = null;
async function run(){
  const A=ST.a,B=ST.b; if(!A.dz||!B.dz||!A.name||!B.name)return;
  const r=relate(A.dz,B.dz);
  LAST={A,B,r,interpret:null};
  $('#eZiA').textContent=zodiacIcon(A.dz);
  $('#eZiB').textContent=zodiacIcon(B.dz);
  $('#eNmA').textContent=A.name; $('#eNmB').textContent=B.name;
  $('#eMetaA').textContent=`${A.dz.branch}${A.dz.animal} · ${A.dz.el} · ${A.dz.west}${A.dz.wsym}`;
  $('#eMetaB').textContent=`${B.dz.branch}${B.dz.animal} · ${B.dz.el} · ${B.dz.west}${B.dz.wsym}`;
  const tcls=r.tone==='gold'?'gold':r.tone==='red'?'red':'gray';
  $('#connLine').className='conn-line tone-'+tcls; $('#connLine').setAttribute('data-rel',r.rel+' · '+r.elTag);
  $('#eScore').className='score-big score-'+tcls;
  $('#rTags').innerHTML=[r.rel,r.elTag,(r.tone==='gold'?'金线·高适配':r.tone==='red'?'红线·待磨合':'灰线·平稳')]
    .map(t=>`<span class="tag ${tcls}">${t}</span>`).join('');
  const res=$('#result');res.classList.add('show');
  animateScore(r.score);
  res.scrollIntoView({behavior:'smooth',block:'start'});
  $('#loading').style.display='block'; $('#aiOut').style.display='none';
  let out=await aiInterpret(A,B,r);
  LAST.interpret=out;
  $('#rHead').textContent=out.headline;
  $('#rVerdict').textContent=out.verdict;
  $('#aiSrc').textContent=out.fromAI?'由 Claude 实时生成':'AI 暂不可用 · 已用内置解读';
  $('#loading').style.display='none'; $('#aiOut').style.display='block';
}
function animateScore(target){
  const tcls=LAST.r.tone==='gold'?'gold':LAST.r.tone==='red'?'red':'gray';
  let n=0;const step=Math.max(1,Math.round(target/26));
  const nn=$('#scoreNum');
  clearInterval(window._sa);
  window._sa=setInterval(()=>{n+=step;if(n>=target){n=target;clearInterval(window._sa);}nn.textContent=n;},32);
}

/* ============ AI 解读 ============ */
async function aiInterpret(A,B,r){
  const labelA=A.type==='org'?'企业':'人物', labelB=B.type==='org'?'企业':'人物';
  const sys=`你是「AI 创投命理合盘」的趣味解读官，风格轻松、有创投圈梗、像财经八卦号。严格遵守：
1) 这是纯娱乐内容，绝不预测真实经营成败、投资吉凶，不做任何投资/决策建议，不下负面定论。
2) 涉及真实企业与人物只做轻松、不诋毁的趣味演绎；适配度低就说成"性格互补待磨合""欢喜冤家"等，不得暗示谁会失败、内讧、塌房。
3) 全部用娱乐圈/创投圈场景比喻（联名、合伙、对家、二搭、官配氛围感等），不用封建命理凶吉话术。
只返回 JSON，不要任何解释或 markdown 代码块。`;
  const usr=`请为下面这对"合盘"写趣味解读。已算好的命盘数据请直接采用，不要改分数：
对象A（${labelA}）：${A.name}，生肖${A.dz.branch}${A.dz.animal}，五行属${A.dz.el}，${A.dz.west}座
对象B（${labelB}）：${B.name}，生肖${B.dz.branch}${B.dz.animal}，五行属${B.dz.el}，${B.dz.west}座
关系：${r.rel}，${r.elTag}，适配度${r.score}分。
返回 JSON 字段：
{"headline":"≤14字的吸睛标题","verdict":"70-110字趣味解读，结合两者风格与上面关系","posterLine":"≤22字的海报金句"}`;
  try{
    const resp=await fetch("api/ai-interpret.php",{
      method:"POST",headers:{"Content-Type":"application/json"},
      body:JSON.stringify({system:sys,message:usr})
    });
    const data=await resp.json();
    let txt=(data.content||[]).map(i=>i.type==='text'?i.text:'').join('').trim();
    txt=txt.replace(/```json|```/g,'').trim();
    const o=JSON.parse(txt);
    if(o.headline&&o.verdict){o.fromAI=true;return o;}
    throw new Error('bad');
  }catch(e){ return fallback(A,B,r); }
}
function fallback(A,B,r){
  const pools={
   gold:[`${A.name} 和 ${B.name} 这对，命盘上就是写着"官配"二字 —— ${r.elTag}，氛围感直接拉满，要联名／结盟，路人都得喊一句天选。`,
         `${r.rel}！${A.name} × ${B.name} 同框就是一整套默契，私下相处估计也合拍，二搭呼声预定。`],
   red:[`${A.name} 和 ${B.name} 属于"欢喜冤家"型，${r.elTag}，气场各有主张，凑一起火花四溅 —— 互补得好是王炸，需要互相磨合。`,
        `${r.rel}，这对性格反差明显，话题度拉满，是那种"看着吵其实很带感"的组合，磨合到位就有戏。`],
   gray:[`${A.name} 与 ${B.name} 走的是细水长流路线，没有惊天动地的火花，但也稳，属于各做各的、偶尔同框也不尴尬的体面关系。`,
         `平平淡淡的一对，${r.elTag}，缘分不浓不淡，合作能成但不会上热搜，靠的是日久见人心。`]
  };
  const v=pools[r.tone][(A.dz.zi+B.dz.zi)%pools[r.tone].length];
  const heads={gold:'天选合盘·官配预定',red:'欢喜冤家·火花四溅',gray:'细水长流·体面搭档'};
  return {headline:heads[r.tone],verdict:v,posterLine:r.rel+'·适配度'+r.score+'%',fromAI:false};
}

/* init */
setType('a','org');setType('b','org');fillPresets();
