/* ClinicPad add-on: prescriptions (PDF), medicine database, billing, clinics & team, reschedule */
const MED0=[['Paracetamol','500 mg','Every 6 hours as needed','Analgesic'],['Amoxicillin','500 mg','3x daily for 7 days','Antibiotic'],['Metformin','500 mg','Twice daily','Antidiabetic'],['Amlodipine','5 mg','Once daily','Antihypertensive'],['Losartan','50 mg','Once daily','Antihypertensive'],['Omeprazole','20 mg','Once daily before breakfast','Gastrointestinal'],['Cetirizine','10 mg','Once daily at night','Antihistamine'],['Ibuprofen','400 mg','Every 8 hours after meals','Analgesic'],['Azithromycin','500 mg','Once daily for 3 days','Antibiotic'],['Salbutamol','100 mcg','2 puffs as needed','Bronchodilator'],['Atorvastatin','20 mg','Once daily at night','Statin'],['Insulin glargine','100 IU/ml','Once daily at bedtime','Antidiabetic'],['Oral rehydration salts','1 sachet','After each loose stool','Supplement'],['Vitamin D3','1000 IU','Once daily','Supplement'],['Doxycycline','100 mg','Twice daily for 7 days','Antibiotic'],['Prednisone','5 mg','Once daily','Corticosteroid'],['Cotrimoxazole','800/160 mg','Twice daily for 5 days','Antibiotic'],['Multivitamins','1 tablet','Once daily','Supplement']];
D.M=D.M||MED0.map((m,i)=>({id:'m'+i,n:m[0],d:m[1],f:m[2],c:m[3]}));
D.R=D.R||[];D.B=D.B||[];D.clinics=D.clinics||[D.clinic];
D.team=D.team||[{n:'Dr. Rin (you)',r:'doctor'},{n:'Nina Park',r:'nurse'},{n:'Leo Mendoza',r:'assistant'}];
let RX=null,ME=null,RQ='',MQ='';
const pn=id=>P(id)?P(id).n:'Unknown patient';
Object.assign(TITLE,{rx:'Prescriptions',rf:'New prescription',rp:'Prescription',md:'Medicines',bl:'Billing',cl:'Clinics & team',rs:'Reschedule'});
document.head.insertAdjacentHTML('beforeend','<style>#pd{display:none;--tx:#000;--ln:#ccc;--mut:#555;color:#000;background:#fff}@media print{#app,#toast,.nav,.fab{display:none!important}#pd{display:block!important;padding:24px}}.box{border:1px solid var(--ln);border-radius:12px;padding:10px;margin-top:10px}.two{display:grid;grid-template-columns:1fr 1.5fr;gap:6px;margin-top:6px}</style>');
document.body.insertAdjacentHTML('beforeend','<div id="pd"></div>');

/* ---- prescriptions ---- */
function newRx(pid){RX={p:pid||(D.P[0]&&D.P[0].id)||'',m:[{n:'',d:'',f:''}],t:''};go({v:'rf'})}
function readRx(){if(!RX||!$('#rxp'))return;RX.p=$('#rxp').value;RX.t=$('#rxn').value;RX.m.forEach((m,i)=>{m.n=$('#mn'+i).value;m.d=$('#md'+i).value;m.f=$('#mf'+i).value})}
function fillMed(i){const d=D.M.find(x=>x.n.toLowerCase()==$('#mn'+i).value.trim().toLowerCase());if(!d)return;if(!$('#md'+i).value)$('#md'+i).value=d.d;if(!$('#mf'+i).value)$('#mf'+i).value=d.f}
function addMed(){readRx();RX.m.push({n:'',d:'',f:''});draw();scrollTo(0,document.body.scrollHeight)}
function rmMed(i){readRx();RX.m.splice(i,1);if(!RX.m.length)RX.m.push({n:'',d:'',f:''});draw()}
function saveRx(pdf){readRx();const m=RX.m.filter(x=>x.n.trim());if(!RX.p||!m.length)return toast('Choose a patient and add a medicine');
const r={id:'r'+Date.now(),p:RX.p,d:ymd(new Date()),t:RX.t.trim(),m};D.R.unshift(r);save();RX=null;S.pop();if(pdf)S.push({v:'rp',id:r.id});draw();toast('Prescription saved')}
function loadRx(id){const r=D.R.find(x=>x.id==id);RX={p:r.p,m:r.m.map(x=>({...x})),t:r.t||''};go({v:'rf'});toast('Loaded — edit, then save')}
function delRx(id){if(!confirm('Delete this prescription?'))return;D.R=D.R.filter(r=>r.id!=id);save();draw()}
function rxList(pid){const s=RQ.toLowerCase(),l=D.R.filter(r=>pid?r.p==pid:(pn(r.p)+' '+r.m.map(m=>m.n).join(' ')+' '+r.t).toLowerCase().includes(s));
return l.length?l.map(r=>`<div class="row"><div class="t"><b>${esc(pn(r.p))}</b><small>${r.d}</small><small>${r.m.map(m=>esc(m.n+' '+m.d+' · '+m.f)).join('<br>')}</small>${r.t?`<small>${esc(r.t)}</small>`:''}<div><button class="mini" onclick="loadRx('${r.id}')">Load</button><button class="mini" onclick="go({v:'rp',id:'${r.id}'})">PDF</button><button class="mini d" onclick="delRx('${r.id}')">Delete</button></div></div></div>`).join(''):'<div class="empty">No prescriptions yet. Tap + to write one.</div>'}
function rxDoc(r){return `<div class="box" style="padding:18px"><h3 style="margin:0;color:#2f4fd8">${esc(D.clinic)}</h3><small style="color:var(--mut)">Prescription</small><p>Patient: <b>${esc(pn(r.p))}</b><br>Date: <b>${r.d}</b></p><table style="width:100%;border-collapse:collapse;font-size:14px"><tr style="text-align:left"><th>Medication</th><th>Dose</th><th>Frequency</th></tr>${r.m.map(m=>`<tr><td style="border-top:1px solid var(--ln);padding:6px 4px 6px 0">${esc(m.n)}</td><td style="border-top:1px solid var(--ln)">${esc(m.d)}</td><td style="border-top:1px solid var(--ln)">${esc(m.f)}</td></tr>`).join('')}</table>${r.t?`<p><b>Notes:</b> ${esc(r.t)}</p>`:''}<p style="margin:36px 0 0">${esc(D.team[0]?D.team[0].n:'Physician')}</p><div style="border-top:1px solid currentColor;width:180px;font-size:12px;padding-top:2px">Signature</div></div>`}
function printRx(id){$('#pd').innerHTML=rxDoc(D.R.find(r=>r.id==id));setTimeout(()=>print(),60)}
V.rx=()=>`<div class="pad" style="padding-bottom:0"><input type="search" placeholder="Search patient, medicine or note" value="${esc(RQ)}" oninput="RQ=this.value;$('#rxl').innerHTML=rxList()"></div><div id="rxl">${rxList()}</div><button class="fab" aria-label="New prescription" onclick="newRx()">+</button>`;
V.rf=()=>{if(!RX)return '<div class="empty">Nothing to edit.</div>';if(!D.P.length)return '<div class="empty">Add a patient first.</div>';
return `<div class="pad"><label>Patient</label><select id="rxp">${D.P.map(p=>`<option value="${p.id}"${p.id==RX.p?' selected':''}>${esc(p.n)}</option>`).join('')}</select><datalist id="mdl">${D.M.map(m=>`<option value="${esc(m.n)}">`).join('')}</datalist>`+
RX.m.map((m,i)=>`<div class="box"><div style="display:flex;gap:6px"><input id="mn${i}" list="mdl" placeholder="Medicine — type to search" value="${esc(m.n)}" onchange="fillMed(${i})"><button class="mini d" style="margin:0" aria-label="Remove medicine" onclick="rmMed(${i})">✕</button></div><div class="two"><input id="md${i}" placeholder="Dose" value="${esc(m.d)}"><input id="mf${i}" placeholder="Frequency" value="${esc(m.f)}"></div></div>`).join('')+
`<button class="btn g" style="margin-top:10px" onclick="addMed()">+ Add medication</button><label>Notes</label><textarea id="rxn" rows="3" placeholder="Instructions, duration…">${esc(RX.t)}</textarea><button class="btn" onclick="saveRx(1)">Save and view PDF</button><button class="btn g" onclick="saveRx(0)">Save prescription</button></div>`};
V.rp=s=>{const r=D.R.find(x=>x.id==s.id);return r?`<div class="pad">${rxDoc(r)}<button class="btn" onclick="printRx('${r.id}')">Print / save as PDF</button></div>`:'<div class="empty">Prescription not found.</div>'};

/* ---- medicine database ---- */
function medList(){const s=MQ.toLowerCase().trim(),l=D.M.filter(m=>(m.n+' '+m.c).toLowerCase().includes(s));
return `<div style="padding:0 16px 6px;color:var(--mut);font-size:12px">${l.length} of ${D.M.length} medicines</div>`+(l.map(m=>`<div class="row"><div class="t"><b>${esc(m.n)}</b><small>${esc(m.d)} · ${esc(m.f)}</small><span class="chip">${esc(m.c)}</span><div><button class="mini" onclick="ME='${m.id}';draw();scrollTo(0,0)">Edit</button><button class="mini d" onclick="delMed('${m.id}')">Delete</button></div></div></div>`).join('')||'<div class="empty">No medicines found.</div>')}
V.md=()=>{const ed=ME&&D.M.find(x=>x.id==ME),m=ed||{n:'',d:'',f:'',c:''};
return `<div class="pad"><b>${ed?'Edit medicine':'New medicine'}</b><label>Name</label><input id="mnm" value="${esc(m.n)}"><label>Usual dose</label><input id="mdo" value="${esc(m.d)}"><label>Usual frequency</label><input id="mfr" value="${esc(m.f)}"><label>Category</label><input id="mca" value="${esc(m.c)}"><button class="btn" onclick="saveMed()">Save medicine</button>${ed?'<button class="btn g" onclick="ME=null;draw()">Cancel</button>':''}<p style="color:var(--mut);font-size:12px">Saved medicines appear as suggestions when writing a prescription.</p></div><div class="pad" style="padding-top:0"><input type="search" placeholder="Search medicines" value="${esc(MQ)}" oninput="MQ=this.value;$('#mlst').innerHTML=medList()"></div><div id="mlst">${medList()}</div>`};
function saveMed(){const n=$('#mnm').value.trim();if(!n)return toast('Enter the medicine name');const v={n,d:$('#mdo').value.trim(),f:$('#mfr').value.trim(),c:$('#mca').value.trim()||'General'},ed=ME&&D.M.find(x=>x.id==ME);
if(ed)Object.assign(ed,v);else D.M.push({id:'m'+Date.now(),...v});ME=null;save();draw();toast('Medicine saved')}
function delMed(id){if(!confirm('Delete this medicine?'))return;D.M=D.M.filter(m=>m.id!=id);save();draw()}

/* ---- billing ---- */
function billForm(pid){return `<div class="pad">${pid?'':`<label>Patient</label><select id="bp">${D.P.map(p=>`<option value="${p.id}">${esc(p.n)}</option>`).join('')}</select>`}<label>Item</label><input id="bi" placeholder="e.g. Consultation, ECG"><label>Amount ₱</label><input id="ba" type="number" inputmode="decimal" min="0"><button class="btn" onclick="saveBill('${pid||''}')">Create bill</button></div>`}
function billRows(l){return l.map(b=>`<div class="row"><div class="t"><b>${esc(b.i)}</b><small>${esc(pn(b.p))}</small><span class="chip ${b.paid?'ok':'wn'}">${b.paid?'Paid':'Unpaid'}</span><div><button class="mini" onclick="togBill('${b.id}')">${b.paid?'Mark unpaid':'Mark paid'}</button><button class="mini d" onclick="delBill('${b.id}')">Delete</button></div></div><b>₱${b.a.toLocaleString()}</b></div>`).join('')||'<div class="empty">No bills yet.</div>'}
V.bl=()=>{const t=D.B.reduce((s,b)=>s+b.a,0),c=D.B.filter(b=>b.paid).reduce((s,b)=>s+b.a,0);
return `<div class="stats"><div class="stat"><b>₱${t.toLocaleString()}</b><span>Billed</span></div><div class="stat"><b>₱${c.toLocaleString()}</b><span>Collected</span></div><div class="stat"><b>₱${(t-c).toLocaleString()}</b><span>Outstanding</span></div></div>`+(D.P.length?billForm():'<div class="empty">Add a patient first.</div>')+billRows(D.B)};
function saveBill(pid){const p=pid||$('#bp').value,i=$('#bi').value.trim(),a=parseFloat($('#ba').value);if(!i||!(a>0))return toast('Enter an item and an amount above 0');D.B.unshift({id:'b'+Date.now(),p,i,a,paid:false});save();draw();toast('Bill created')}
function togBill(id){const b=D.B.find(x=>x.id==id);b.paid=!b.paid;save();draw()}
function delBill(id){if(!confirm('Delete this bill?'))return;D.B=D.B.filter(b=>b.id!=id);save();draw()}

/* ---- clinics & team ---- */
V.cl=()=>{if(!D.clinics.includes(D.clinic))D.clinics.push(D.clinic);const rc={doctor:'',nurse:'wn',assistant:'ok'};
return `<div class="pad" style="padding-bottom:0"><b>Clinics</b></div>`+D.clinics.map((c,i)=>`<div class="row"><div class="t"><b>${esc(c)}</b></div>${c==D.clinic?'<span class="chip ok">Active</span>':`<button class="mini" onclick="swClinic(${i})">Switch</button>`}${D.clinics.length>1?`<button class="mini d" aria-label="Delete clinic" onclick="delClinic(${i})">✕</button>`:''}</div>`).join('')+
`<div class="pad" style="display:flex;gap:6px"><input id="cn" placeholder="New clinic name"><button class="mini" style="margin:0;white-space:nowrap" onclick="addClinic()">Add clinic</button></div><div class="pad" style="padding-bottom:0"><b>Team</b></div>`+
D.team.map((m,i)=>`<div class="row"><div class="av">${ini(m.n)}</div><div class="t"><b>${esc(m.n)}</b></div><span class="chip ${rc[m.r]}">${m.r}</span>${i?`<button class="mini d" aria-label="Remove member" onclick="delMember(${i})">✕</button>`:''}</div>`).join('')+
`<div class="pad"><input id="tn" placeholder="Member name"><select id="tr" style="margin-top:6px"><option value="doctor">Doctor</option><option value="nurse">Nurse</option><option value="assistant">Assistant</option></select><button class="btn" onclick="addMember()">Invite member</button></div>`};
function swClinic(i){D.clinic=D.clinics[i];save();draw();toast('Switched to '+D.clinic)}
function addClinic(){const n=$('#cn').value.trim();if(!n)return toast('Enter the clinic name');D.clinics.push(n);D.clinic=n;save();draw()}
function delClinic(i){if(!confirm('Remove this clinic from the list?'))return;const c=D.clinics.splice(i,1)[0];if(c==D.clinic)D.clinic=D.clinics[0];save();draw()}
function addMember(){const n=$('#tn').value.trim();if(!n)return toast('Enter the member name');D.team.push({n,r:$('#tr').value});save();draw()}
function delMember(i){if(!confirm('Remove this member?'))return;D.team.splice(i,1);save();draw()}

/* ---- reschedule ---- */
V.rs=s=>{const a=D.A.find(x=>x.id==s.id);return a?`<div class="pad"><b>${esc(pn(a.p))}</b><label>Date</label><input id="rd" type="date" value="${a.d}"><label>Time</label><input id="rt" type="time" value="${a.t}"><button class="btn" onclick="saveRs('${a.id}')">Save new schedule</button></div>`:'<div class="empty">Appointment not found.</div>'};
function saveRs(id){const a=D.A.find(x=>x.id==id);if(!$('#rd').value)return toast('Choose a date');a.d=$('#rd').value;a.t=$('#rt').value;save();back();toast('Rescheduled')}

/* ---- patient page: prescriptions + billing per patient ---- */
const _pt=V.pt,_sec=V.sec;
V.pt=s=>_pt(s).replace('<div class="pad"><button class="btn g"',`<div class="pad"><button class="btn" style="margin-top:0" onclick="newRx('${s.id}')">💊 Write prescription</button><button class="btn g"`);
V.sec=s=>{const p=P(s.id);
if(s.k=='med')return `<div class="pad"><b>${esc(p.n)}</b><button class="btn" onclick="newRx('${p.id}')">Write prescription</button></div>`+rxList(p.id);
if(s.k=='bill')return `<div class="pad" style="padding-bottom:0"><b>${esc(p.n)}</b></div>`+billForm(p.id)+billRows(D.B.filter(b=>b.p==p.id));
return _sec(s)};
draw();
