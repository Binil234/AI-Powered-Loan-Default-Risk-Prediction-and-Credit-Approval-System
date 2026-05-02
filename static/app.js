const DRIVERS = [
  {name:"Max Verstappen",team:"Red Bull Racing",num:1,avg:2.1,cons:2.3,form:"⚡ Dominant",color:"#3671C6",insights:["Led most laps in recent races","Excellent qualifying pace","Strong in all weather conditions"]},
  {name:"Lewis Hamilton",team:"Ferrari",num:44,avg:4.2,cons:3.8,form:"🔥 Strong",color:"#DC0000",insights:["Exceptional race craft","Strong tyre management","Experienced at all circuits"]},
  {name:"Charles Leclerc",team:"Ferrari",num:16,avg:4.8,cons:3.8,form:"📈 Improving",color:"#DC0000",insights:["Strong qualifying performer","Occasional DNF risk","Improving race pace"]},
  {name:"Lando Norris",team:"McLaren",num:4,avg:4.5,cons:4.1,form:"🔥 Strong",color:"#FF8000",insights:["Consistent points finisher","Strong on street circuits","Excellent in clean air"]},
  {name:"Carlos Sainz",team:"Williams",num:55,avg:5.9,cons:7.2,form:"📊 Average",color:"#37BEDD",insights:["Good racecraft","Mid-grid challenges","Solid qualifying"]},
  {name:"George Russell",team:"Mercedes",num:63,avg:5.3,cons:5.1,form:"📈 Improving",color:"#27F4D2",insights:["Strong qualifying","Consistent finisher","Growing race pace"]},
  {name:"Fernando Alonso",team:"Aston Martin",num:14,avg:6.8,cons:6.5,form:"📊 Average",color:"#358C75",insights:["Veteran race craft","Strong defensive driving","Inconsistent qualifying"]},
  {name:"Oscar Piastri",team:"McLaren",num:81,avg:5.1,cons:4.1,form:"🔥 Strong",color:"#FF8000",insights:["Fast learner","Improving each race","Good tyre management"]},
  {name:"Lance Stroll",team:"Aston Martin",num:18,avg:10.2,cons:6.5,form:"📉 Weak",color:"#358C75",insights:["Inconsistent performances","Struggles in qualifying","Better in race conditions"]},
  {name:"Yuki Tsunoda",team:"RB",num:22,avg:9.4,cons:8.7,form:"📊 Average",color:"#6692FF",insights:["High energy driving style","Occasional errors","Improving consistency"]}
];

let selectedDriver = null;

// --- Build dropdown ---
const searchEl = document.getElementById('driver-search');
const dropEl   = document.getElementById('driver-dropdown');

function renderDropdown(filter=''){
  const list = filter ? DRIVERS.filter(d=>d.name.toLowerCase().includes(filter.toLowerCase())||d.team.toLowerCase().includes(filter.toLowerCase())) : DRIVERS;
  dropEl.innerHTML = list.map(d=>`
    <div class="dd-item" data-name="${d.name}">
      <div class="dd-avatar" style="background:${d.color}22;border:1.5px solid ${d.color}">${d.num}</div>
      <div><div class="dd-name">${d.name}</div><div class="dd-team">${d.team}</div></div>
    </div>`).join('');
  dropEl.querySelectorAll('.dd-item').forEach(el=>{
    el.addEventListener('click',()=>selectDriver(el.dataset.name));
  });
}

searchEl.addEventListener('focus',()=>{ renderDropdown(searchEl.value); dropEl.classList.remove('hidden'); });
searchEl.addEventListener('input',()=>{ renderDropdown(searchEl.value); dropEl.classList.remove('hidden'); });
document.addEventListener('click',e=>{ if(!e.target.closest('.search-wrap')) dropEl.classList.add('hidden'); });

function selectDriver(name){
  selectedDriver = DRIVERS.find(d=>d.name===name);
  searchEl.value = selectedDriver.name;
  dropEl.classList.add('hidden');

  // Driver card
  document.getElementById('d-avatar').textContent = selectedDriver.num;
  document.getElementById('d-avatar').style.background = selectedDriver.color+'33';
  document.getElementById('d-avatar').style.borderColor = selectedDriver.color;
  document.getElementById('d-name').textContent = selectedDriver.name;
  document.getElementById('d-team').textContent = selectedDriver.team;
  document.getElementById('d-num').textContent = '#'+selectedDriver.num;
  document.getElementById('driver-card').classList.remove('hidden');

  // Auto stats
  document.getElementById('s-driver').textContent = selectedDriver.avg.toFixed(1);
  document.getElementById('s-cons').textContent   = selectedDriver.cons.toFixed(1);
  document.getElementById('s-team').textContent   = selectedDriver.team;
  document.getElementById('s-form').textContent   = selectedDriver.form;

  checkBtn();
}

// --- Validation ---
function checkBtn(){
  const g = parseFloat(document.getElementById('grid').value);
  const q = parseFloat(document.getElementById('quali').value);
  const ok = selectedDriver && g>=1&&g<=20 && q>=1&&q<=20;
  document.getElementById('predict-btn').disabled = !ok;
}
['grid','quali'].forEach(id=>{
  document.getElementById(id).addEventListener('input',function(){
    const v=parseFloat(this.value), field=this.parentElement;
    const ok=this.value!==''&&!isNaN(v)&&v>=1&&v<=20;
    field.classList.toggle('has-err',!ok);
    this.classList.toggle('invalid',!ok);
    checkBtn();
  });
});

// --- Gauge animation ---
function animateGauge(pct){
  const arc   = document.getElementById('gauge-arc');
  const txt   = document.getElementById('gauge-txt');
  const total = 283;
  let cur=0;
  const target = (pct/100)*total;
  const step=()=>{
    cur=Math.min(cur+target/50,target);
    arc.setAttribute('stroke-dasharray',`${cur} ${total}`);
    txt.textContent=Math.round((cur/total)*100)+'%';
    if(cur<target) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

// --- Predict ---
document.getElementById('predict-btn').addEventListener('click', async()=>{
  const grid = parseFloat(document.getElementById('grid').value);
  const quali= parseFloat(document.getElementById('quali').value);

  const btn=document.getElementById('predict-btn');
  const sp =document.getElementById('spinner');
  btn.disabled=true; sp.classList.remove('hidden');
  document.getElementById('btn-txt').textContent='ANALYSING...';

  document.getElementById('placeholder').classList.add('hidden');
  document.getElementById('result-card').classList.add('hidden');
  document.getElementById('insight-card').classList.add('hidden');

  try{
    const res = await fetch('/predict',{method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({grid,quali_pos:quali,driver_avg_pos:selectedDriver.avg,constructor_avg_pos:selectedDriver.cons})});
    const data = await res.json();
    if(data.error) throw new Error(data.error);

    const pct = Math.round(data.probability*100);
    const isPod = data.top3_prediction===1;

    // Color class
    let col = pct>=70?'#4ade80':pct>=40?'#fbbf24':'#f87171';

    document.getElementById('r-icon').textContent  = isPod?'🏆':'🚫';
    document.getElementById('r-icon').style.background = isPod?'rgba(225,6,0,.15)':'rgba(107,107,128,.15)';
    document.getElementById('r-label').textContent = isPod?'Likely Podium Finish':'Unlikely Podium Finish';
    document.getElementById('r-label').style.color = isPod?'#e10600':'#6b6b80';
    document.getElementById('r-sub').textContent   = `${selectedDriver.name} — ${pct}% confidence`;

    const arc = document.getElementById('gauge-arc');
    arc.setAttribute('stroke',col);
    arc.setAttribute('stroke-dasharray','0 283');
    document.getElementById('bar-fill').style.width='0%';
    document.getElementById('bar-fill').style.background = col;

    document.getElementById('result-card').classList.remove('hidden');
    document.getElementById('insight-card').classList.remove('hidden');

    setTimeout(()=>{
      animateGauge(pct);
      document.getElementById('bar-fill').style.width=pct+'%';
    },80);

    // Pills
    const pills=[
      {t:grid<=3?'🟢 Front-row start':grid<=8?'🟡 Mid-grid':'🔴 Back-of-grid', c:grid<=3?'pill-g':grid<=8?'pill-y':'pill-r'},
      {t:selectedDriver.avg<=4?'🟢 Top driver form':selectedDriver.avg<=8?'🟡 Average form':'🔴 Poor form', c:selectedDriver.avg<=4?'pill-g':selectedDriver.avg<=8?'pill-y':'pill-r'},
      {t:selectedDriver.cons<=4?'🟢 Strong constructor':'🟡 Midfield team', c:selectedDriver.cons<=4?'pill-g':'pill-y'}
    ];
    document.getElementById('pills').innerHTML=pills.map(p=>`<span class="pill ${p.c}">${p.t}</span>`).join('');

    // Insights
    document.getElementById('insights-list').innerHTML = selectedDriver.insights.map((ins,i)=>`
      <div class="insight">
        <div class="insight-dot" style="background:${['#4ade80','#fbbf24','#60a5fa'][i%3]}"></div>
        <div class="insight-txt">${ins}</div>
      </div>`).join('');

  } catch(e){
    alert('Error: '+e.message);
    document.getElementById('placeholder').classList.remove('hidden');
  } finally{
    btn.disabled=false; sp.classList.add('hidden');
    document.getElementById('btn-txt').textContent='🏁 PREDICT PODIUM CHANCE';
    checkBtn();
  }
});
