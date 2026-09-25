const library = {
  "胸": {"槓鈴":["平板槓鈴臥推","上斜槓鈴臥推","下斜槓鈴臥推"],"史密斯":["史密斯平板臥推","史密斯上斜臥推"],"啞鈴":["平板啞鈴臥推","上斜啞鈴臥推","啞鈴飛鳥"],"滑輪":["滑輪夾胸","低位至高位夾胸","高位至低位夾胸"],"固定器械":["機械式胸推","蝴蝶機夾胸"]},
  "背": {"滑輪":["高位下拉","窄握高位下拉","直臂下拉","滑輪坐姿划船"],"固定器械":["胸靠式划船","機械式高位划船"],"槓鈴":["槓鈴划船","羅馬尼亞硬舉"],"啞鈴":["單手啞鈴划船","啞鈴羅馬尼亞硬舉"],"徒手":["引體向上","反手引體向上"]},
  "肩": {"啞鈴":["啞鈴肩推","啞鈴側平舉","啞鈴前平舉","俯身反向飛鳥"],"滑輪":["滑輪側平舉","繩索面拉","滑輪後三角飛鳥"],"固定器械":["機械肩推","反向蝴蝶機"],"槓鈴":["站姿槓鈴肩推"],"史密斯":["史密斯肩推"]},
  "二頭": {"啞鈴":["啞鈴彎舉","槌式彎舉","上斜啞鈴彎舉"],"滑輪":["滑輪彎舉","繩索槌式彎舉"],"槓鈴":["槓鈴彎舉","EZ 槓彎舉"],"固定器械":["機械式二頭彎舉"]},
  "三頭": {"滑輪":["繩索下壓","繩索過頭臂屈伸","直槓下壓"],"啞鈴":["單臂啞鈴過頭伸展","啞鈴臂屈伸"],"槓鈴":["窄握槓鈴臥推","仰臥臂屈伸"],"固定器械":["機械式三頭伸展"]},
  "腿": {"固定器械":["腿推","腿屈伸","腿彎舉","髖外展","髖內收","提踵機"],"槓鈴":["深蹲","硬舉","臀推"],"史密斯":["史密斯深蹲","史密斯臀推"],"啞鈴":["高腳杯深蹲","啞鈴弓箭步","保加利亞分腿蹲"],"徒手":["徒手深蹲","臀橋"]},
  "核心": {"徒手":["捲腹","棒式","死蟲","仰臥抬腿"],"固定器械":["機械腹肌"],"滑輪":["滑輪捲腹","Pallof Press"]}
};

const defaultPlan = [
  {day:"週一", focus:"胸＋三頭", exercises:[['胸','槓鈴','平板槓鈴臥推',4,10],['胸','啞鈴','上斜啞鈴臥推',3,10],['胸','固定器械','機械式胸推',3,12],['胸','滑輪','滑輪夾胸',3,15],['三頭','滑輪','繩索下壓',3,12],['三頭','滑輪','繩索過頭臂屈伸',3,12]]},
  {day:"週三", focus:"背＋二頭", exercises:[['背','滑輪','高位下拉',4,10],['背','滑輪','滑輪坐姿划船',4,10],['背','固定器械','胸靠式划船',3,12],['背','滑輪','直臂下拉',3,15],['二頭','啞鈴','啞鈴彎舉',3,12],['二頭','啞鈴','槌式彎舉',3,12]]},
  {day:"週五", focus:"肩＋手臂＋核心", exercises:[['肩','啞鈴','啞鈴肩推',4,10],['肩','啞鈴','啞鈴側平舉',4,15],['肩','滑輪','滑輪側平舉',3,15],['肩','固定器械','反向蝴蝶機',3,15],['二頭','滑輪','滑輪彎舉',3,12],['三頭','滑輪','繩索下壓',3,12],['核心','固定器械','機械腹肌',3,15]]}
].map(day=>({...day,exercises:day.exercises.map(([category,equipment,name,sets,reps])=>({id:crypto.randomUUID(),category,equipment,name,sets,reps,setLogs:[]}))}));

const PLAN_KEY='lift-log-plan';
const CALENDAR_KEY='lift-log-calendar';
let plan=JSON.parse(localStorage.getItem(PLAN_KEY)||'null')||defaultPlan;
let calendarRecords=JSON.parse(localStorage.getItem(CALENDAR_KEY)||'null')||{};
let activeDay=0;
let editing=null;
let addingDay=false;
let activePage='workout';
let calendarCursor=new Date(new Date().getFullYear(),new Date().getMonth(),1);
let selectedCalendarDate=localDateKey(new Date());
const expandedIds=new Set();
const $=selector=>document.querySelector(selector);
const dayTabs=$('#day-tabs');
const workoutView=$('#workout-view');
const calendarPage=$('#calendar-page');
const exerciseDialog=$('#exercise-dialog');
const dayDialog=$('#day-dialog');
const completeDialog=$('#complete-dialog');
const escapeHtml=value=>String(value).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));

function localDateKey(date){
  const year=date.getFullYear();
  const month=String(date.getMonth()+1).padStart(2,'0');
  const day=String(date.getDate()).padStart(2,'0');
  return `${year}-${month}-${day}`;
}
function ensureSetLogs(item){
  const old=Array.isArray(item.setLogs)?item.setLogs:[];
  item.setLogs=Array.from({length:Number(item.sets)||1},(_,index)=>({done:Boolean(old[index]?.done),weight:String(old[index]?.weight??'')}));
  return item.setLogs;
}
plan.forEach(day=>day.exercises.forEach(ensureSetLogs));
function savePlan(){localStorage.setItem(PLAN_KEY,JSON.stringify(plan))}
function saveCalendar(){localStorage.setItem(CALENDAR_KEY,JSON.stringify(calendarRecords))}
savePlan();

function switchPage(page){
  activePage=page;
  document.querySelectorAll('.app-tab').forEach(button=>button.classList.toggle('active',button.dataset.page===page));
  $('#workout-page').classList.toggle('active',page==='workout');
  calendarPage.classList.toggle('active',page==='calendar');
  $('#complete-workout').hidden=page!=='workout';
  if(page==='calendar') renderCalendar();
}
document.querySelectorAll('.app-tab').forEach(button=>button.onclick=()=>switchPage(button.dataset.page));

function renderWorkout(){
  dayTabs.innerHTML='';
  plan.forEach((day,index)=>{
    const group=document.createElement('div');
    group.className=`day-tab-group ${index===activeDay?'active':''}`;
    const button=document.createElement('button');
    button.className='day-tab';
    button.textContent=`${day.day}・${day.focus}`;
    button.onclick=()=>{activeDay=index;renderWorkout()};
    const editButton=document.createElement('button');
    editButton.className='day-action';editButton.type='button';editButton.textContent='編輯';
    editButton.setAttribute('aria-label',`編輯 ${day.day}・${day.focus}`);
    editButton.onclick=()=>{activeDay=index;renderWorkout();openDayDialog(false)};
    group.append(button,editButton);
    if(plan.length>1){
      const deleteButton=document.createElement('button');
      deleteButton.className='day-action day-delete';deleteButton.type='button';deleteButton.textContent='×';
      deleteButton.setAttribute('aria-label',`刪除 ${day.day}・${day.focus}`);
      deleteButton.onclick=()=>deleteDay(index);
      group.append(deleteButton);
    }
    dayTabs.append(group);
  });
  const addDay=document.createElement('button');
  addDay.className='day-tab add-day';addDay.textContent='＋ 新增';addDay.onclick=()=>openDayDialog(true);dayTabs.append(addDay);

  const day=plan[activeDay];
  workoutView.innerHTML='';
  const head=document.createElement('div');
  head.className='workout-heading';
  head.innerHTML=`<div><h2>${escapeHtml(day.day)}｜${escapeHtml(day.focus)}</h2><p>${day.exercises.length} 個訓練動作</p></div><button class="mini-button" id="edit-day" type="button">編輯訓練日</button>`;
  workoutView.append(head);$('#edit-day').onclick=()=>openDayDialog(false);

  const list=document.createElement('div');list.className='exercise-list';
  if(!day.exercises.length) list.innerHTML='<div class="empty">尚未安排動作。從下方加入第一個訓練項目。</div>';
  day.exercises.forEach(item=>list.append(createExerciseCard(item,day)));
  workoutView.append(list);
  const add=document.createElement('button');add.className='add-button';add.textContent='+ 新增訓練動作';add.onclick=()=>openExerciseDialog();workoutView.append(add);
}

function createExerciseCard(item,day){
  ensureSetLogs(item);
  const card=$('#exercise-card-template').content.firstElementChild.cloneNode(true);
  const tracker=card.querySelector('.set-tracker');
  const expand=card.querySelector('.expand-button');
  const summary=card.querySelector('.exercise-copy small');
  card.querySelector('.exercise-tag').textContent=`${item.category} · ${item.equipment}`;
  card.querySelector('.exercise-copy strong').textContent=item.name;
  function updateSummary(){summary.textContent=`${item.setLogs.filter(log=>log.done).length}/${item.sets} 組完成 · 每組 ${item.reps} 下`}
  updateSummary();
  item.setLogs.forEach((log,index)=>{
    const row=document.createElement('div');row.className='set-row';
    const check=document.createElement('input');check.type='checkbox';check.className='set-check';check.checked=log.done;check.setAttribute('aria-label',`${item.name} 第 ${index+1} 組完成`);
    check.onchange=()=>{log.done=check.checked;savePlan();updateSummary()};
    const label=document.createElement('div');label.className='set-label';label.innerHTML=`第 ${index+1} 組<span class="set-reps">目標 ${item.reps} 下</span>`;
    const weightWrap=document.createElement('label');weightWrap.className='weight-field';weightWrap.textContent='重量';
    const weight=document.createElement('input');weight.type='number';weight.inputMode='decimal';weight.min='0';weight.step='0.5';weight.placeholder='kg';weight.value=log.weight;weight.setAttribute('aria-label',`${item.name} 第 ${index+1} 組重量`);
    weight.oninput=()=>{log.weight=weight.value;savePlan()};
    weightWrap.append(weight);row.append(check,label,weightWrap);tracker.append(row);
  });
  const opened=expandedIds.has(item.id);tracker.hidden=!opened;expand.setAttribute('aria-expanded',String(opened));
  expand.onclick=()=>{const next=expand.getAttribute('aria-expanded')!=='true';expand.setAttribute('aria-expanded',String(next));tracker.hidden=!next;if(next)expandedIds.add(item.id);else expandedIds.delete(item.id)};
  card.querySelector('.edit-button').onclick=()=>openExerciseDialog(item);
  card.querySelector('.delete-button').onclick=()=>{if(confirm(`刪除「${item.name}」？`)){day.exercises=day.exercises.filter(exercise=>exercise.id!==item.id);expandedIds.delete(item.id);savePlan();renderWorkout()}};
  return card;
}

function fill(select,values,placeholder){select.innerHTML=`<option value="">${placeholder}</option>`+values.map(value=>`<option>${escapeHtml(value)}</option>`).join('')}
function openExerciseDialog(item){
  editing=item||null;$('#dialog-title').textContent=item?'修改動作':'新增動作';fill($('#category'),Object.keys(library),'選擇訓練部位');$('#equipment').disabled=true;$('#exercise').disabled=true;['equipment','exercise'].forEach(id=>fill($(`#${id}`),[],'請先選擇上一項'));$('#custom-exercise').value='';$('#sets').value=item?.sets||3;$('#reps').value=item?.reps||12;$('#selection-note').textContent='請依序選擇部位、器材與動作，或輸入自訂動作。';
  if(item){$('#category').value=item.category;updateEquipment();$('#equipment').value=item.equipment;updateExercise();const exists=[...$('#exercise').options].some(option=>option.value===item.name);if(exists)$('#exercise').value=item.name;else $('#custom-exercise').value=item.name}
  exerciseDialog.showModal();
}
function updateEquipment(){const category=$('#category').value;fill($('#equipment'),category?Object.keys(library[category]):[],'選擇器材類型');$('#equipment').disabled=!category;fill($('#exercise'),[],'請先選擇器材');$('#exercise').disabled=true}
function updateExercise(){const category=$('#category').value;const equipment=$('#equipment').value;fill($('#exercise'),equipment?library[category][equipment]:[],'選擇動作');$('#exercise').disabled=!equipment}
function closeExercise(){exerciseDialog.close()}
$('#category').onchange=updateEquipment;$('#equipment').onchange=updateExercise;$('#close-exercise').onclick=closeExercise;$('#cancel-exercise').onclick=closeExercise;
$('#exercise-form').addEventListener('submit',event=>{
  event.preventDefault();const name=$('#custom-exercise').value.trim()||$('#exercise').value;
  if(!name){$('#selection-note').textContent='請從選單選擇動作，或輸入自訂動作名稱。';return}
  const data={id:editing?.id||crypto.randomUUID(),category:$('#category').value,equipment:$('#equipment').value,name,sets:+$('#sets').value,reps:+$('#reps').value};
  const items=plan[activeDay].exercises;
  if(editing){Object.assign(editing,data);ensureSetLogs(editing)}else{data.setLogs=[];ensureSetLogs(data);items.push(data)}
  savePlan();exerciseDialog.close();renderWorkout();
});

function openDayDialog(isNew){addingDay=isNew;$('#day-dialog-title').textContent=isNew?'新增訓練日':'編輯訓練日';$('#day-name').value=isNew?'':plan[activeDay].day;$('#day-focus').value=isNew?'':plan[activeDay].focus;$('#delete-day').hidden=isNew||plan.length===1;dayDialog.showModal()}
function closeDay(){dayDialog.close()}
function deleteDay(index){
  const day=plan[index];
  if(confirm(`刪除「${day.day}・${day.focus}」及其中所有動作？`)){
    plan.splice(index,1);if(activeDay>=plan.length)activeDay=plan.length-1;else if(index<activeDay)activeDay-=1;savePlan();if(dayDialog.open)dayDialog.close();renderWorkout();
  }
}
$('#close-day').onclick=closeDay;$('#cancel-day').onclick=closeDay;
$('#day-form').addEventListener('submit',event=>{event.preventDefault();const data={day:$('#day-name').value.trim(),focus:$('#day-focus').value.trim()};if(addingDay){plan.push({...data,exercises:[]});activeDay=plan.length-1}else Object.assign(plan[activeDay],data);savePlan();dayDialog.close();renderWorkout()});
$('#delete-day').onclick=()=>deleteDay(activeDay);

function openCompleteDialog(){
  const day=plan[activeDay];
  $('#complete-date').value=localDateKey(new Date());
  const total=day.exercises.reduce((sum,item)=>sum+ensureSetLogs(item).length,0);
  const done=day.exercises.reduce((sum,item)=>sum+item.setLogs.filter(log=>log.done).length,0);
  $('#complete-summary').innerHTML=`<strong>${escapeHtml(day.day)}｜${escapeHtml(day.focus)}</strong><br>${day.exercises.length} 個動作，共完成 ${done}／${total} 組`;
  completeDialog.showModal();
}
function closeComplete(){completeDialog.close()}
$('#complete-workout').onclick=openCompleteDialog;$('#close-complete').onclick=closeComplete;$('#cancel-complete').onclick=closeComplete;
$('#complete-form').addEventListener('submit',event=>{
  event.preventDefault();
  const date=$('#complete-date').value;
  const day=plan[activeDay];
  const record={id:crypto.randomUUID(),savedAt:new Date().toISOString(),day:day.day,focus:day.focus,exercises:day.exercises.map(item=>({name:item.name,category:item.category,equipment:item.equipment,reps:item.reps,sets:ensureSetLogs(item).map(log=>({done:log.done,weight:log.weight}))}))};
  if(!calendarRecords[date])calendarRecords[date]=[];
  calendarRecords[date].push(record);saveCalendar();
  day.exercises.forEach(item=>item.setLogs.forEach(log=>{log.done=false;log.weight=''}));savePlan();
  selectedCalendarDate=date;const parsed=new Date(`${date}T12:00:00`);calendarCursor=new Date(parsed.getFullYear(),parsed.getMonth(),1);completeDialog.close();renderWorkout();switchPage('calendar');
});

function renderCalendar(){
  const year=calendarCursor.getFullYear();const month=calendarCursor.getMonth();
  calendarPage.innerHTML='';
  const head=document.createElement('div');head.className='calendar-head';head.innerHTML=`<button class="calendar-arrow" id="prev-month" type="button" aria-label="上個月">‹</button><h2>${year} 年 ${month+1} 月</h2><button class="calendar-arrow" id="next-month" type="button" aria-label="下個月">›</button>`;calendarPage.append(head);
  $('#prev-month').onclick=()=>{calendarCursor=new Date(year,month-1,1);renderCalendar()};$('#next-month').onclick=()=>{calendarCursor=new Date(year,month+1,1);renderCalendar()};
  const grid=document.createElement('div');grid.className='calendar-grid';['日','一','二','三','四','五','六'].forEach(text=>{const label=document.createElement('div');label.className='weekday';label.textContent=text;grid.append(label)});
  const firstWeekday=new Date(year,month,1).getDay();const days=new Date(year,month+1,0).getDate();
  for(let i=0;i<firstWeekday;i++){const blank=document.createElement('div');blank.className='calendar-day blank';grid.append(blank)}
  for(let day=1;day<=days;day++){
    const date=localDateKey(new Date(year,month,day));const button=document.createElement('button');button.className='calendar-day';button.type='button';button.textContent=String(day);
    if(date===localDateKey(new Date()))button.classList.add('today');
    if(calendarRecords[date]?.length){button.classList.add('has-record');const dot=document.createElement('span');dot.className='calendar-dot';button.append(dot)}
    button.onclick=()=>{selectedCalendarDate=date;renderCalendar()};grid.append(button);
  }
  calendarPage.append(grid);calendarPage.append(renderCalendarDetail(selectedCalendarDate));
}
function renderCalendarDetail(date){
  const detail=document.createElement('div');detail.className='calendar-detail';const records=calendarRecords[date]||[];
  detail.innerHTML=`<h3>${escapeHtml(date)}</h3><p>${records.length?`${records.length} 筆訓練記錄`:'這一天尚無訓練記錄'}</p>`;
  records.forEach(record=>{
    const session=document.createElement('div');session.className='record-session';const title=document.createElement('h4');title.textContent=`${record.day}｜${record.focus}`;session.append(title);
    record.exercises.forEach(exercise=>{const row=document.createElement('div');row.className='record-exercise';const sets=exercise.sets.map((set,index)=>`${set.done?'✓':'○'} 第${index+1}組${set.weight?` ${set.weight}kg`:''}`).join(' · ');row.innerHTML=`<strong>${escapeHtml(exercise.name)}</strong><div class="record-sets">${escapeHtml(sets)} · 每組 ${exercise.reps} 下</div>`;session.append(row)});
    detail.append(session);
  });
  return detail;
}

renderWorkout();
switchPage(activePage);
