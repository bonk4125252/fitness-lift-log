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
].map(d=>({...d,exercises:d.exercises.map(([category,equipment,name,sets,reps])=>({id:crypto.randomUUID(),category,equipment,name,sets,reps}))}));
let plan = JSON.parse(localStorage.getItem('lift-log-plan') || 'null') || defaultPlan;
let activeDay = 0, editing = null;
const $ = s=>document.querySelector(s); const dayTabs=$('#day-tabs'), view=$('#workout-view'), dialog=$('#exercise-dialog');
function save(){localStorage.setItem('lift-log-plan',JSON.stringify(plan))}
function render(){dayTabs.innerHTML='';plan.forEach((day,i)=>{const b=document.createElement('button');b.className=`day-tab ${i===activeDay?'active':''}`;b.textContent=`${day.day}・${day.focus}`;b.onclick=()=>{activeDay=i;render()};dayTabs.append(b)});const day=plan[activeDay];view.innerHTML='';const head=document.createElement('div');head.className='workout-heading';head.innerHTML=`<div><h2>${day.day}｜${day.focus}</h2><p>${day.exercises.length} 個訓練動作</p></div>`;view.append(head);const list=document.createElement('div');list.className='exercise-list';if(!day.exercises.length)list.innerHTML='<div class="empty">尚未安排動作。從下方加入第一個訓練項目。</div>';day.exercises.forEach(item=>{const card=$('#exercise-card-template').content.firstElementChild.cloneNode(true);card.querySelector('.exercise-tag').textContent=`${item.category} · ${item.equipment}`;card.querySelector('h3').textContent=item.name;card.querySelector('p').textContent=`${item.sets} 組 × ${item.reps} 下`;card.querySelector('.edit-button').onclick=()=>openDialog(item);card.querySelector('.delete-button').onclick=()=>{if(confirm(`刪除「${item.name}」？`)){day.exercises=day.exercises.filter(x=>x.id!==item.id);save();render()}};list.append(card)});view.append(list);const add=document.createElement('button');add.className='add-button';add.textContent='+ 新增訓練動作';add.onclick=()=>openDialog();view.append(add)}
function fill(select,values,placeholder){select.innerHTML=`<option value="">${placeholder}</option>`+values.map(v=>`<option>${v}</option>`).join('')}
function openDialog(item){editing=item||null;$('#dialog-title').textContent=item?'修改動作':'新增動作';fill($('#category'),Object.keys(library),'選擇訓練部位');$('#equipment').disabled=true;$('#exercise').disabled=true;['equipment','exercise'].forEach(id=>fill($(`#${id}`),[],'請先選擇上一項'));$('#sets').value=item?.sets||3;$('#reps').value=item?.reps||12;if(item){$('#category').value=item.category;updateEquipment();$('#equipment').value=item.equipment;updateExercise();$('#exercise').value=item.name}dialog.showModal()}
function updateEquipment(){const c=$('#category').value;fill($('#equipment'),c?Object.keys(library[c]):[],'選擇器材類型');$('#equipment').disabled=!c;fill($('#exercise'),[],'請先選擇器材');$('#exercise').disabled=true}
function updateExercise(){const c=$('#category').value,e=$('#equipment').value;fill($('#exercise'),e?library[c][e]:[],'選擇動作');$('#exercise').disabled=!e}
$('#category').onchange=updateEquipment;$('#equipment').onchange=updateExercise;
$('#exercise-form').addEventListener('submit',e=>{if(e.submitter?.value==='cancel')return;e.preventDefault();const data={id:editing?.id||crypto.randomUUID(),category:$('#category').value,equipment:$('#equipment').value,name:$('#exercise').value,sets:+$('#sets').value,reps:+$('#reps').value};if(!data.name)return;const items=plan[activeDay].exercises;if(editing)Object.assign(editing,data);else items.push(data);save();dialog.close();render()});
$('#reset-plan').onclick=()=>{if(confirm('將目前所有自訂內容還原為預設課表？')){plan=structuredClone(defaultPlan);save();render()}};render();
