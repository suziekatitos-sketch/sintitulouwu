// ════════════════════════════════════════════════════════════════
// Yuki 🌸 — planner_semana.js
// ════════════════════════════════════════════════════════════════


// --- CONFIG -----------------------------------------------
const DAYS   = ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'];
const SLOTS  = [
  { id:'m', name:'Mañana',  icon:'🌅', time:'5:00 - 11:00 AM', cls:'slot-manana',  cellCls:'slot-manana-cell', pillCls:'pill-m' },
  { id:'t', name:'Tarde',   icon:'☀️', time:'11:00 AM - 6:00 PM', cls:'slot-tarde',   cellCls:'slot-tarde-cell',  pillCls:'pill-t' },
  { id:'n', name:'Noche',   icon:'🌙', time:'6:00 - 10:00 PM', cls:'slot-noche',   cellCls:'slot-noche-cell',  pillCls:'pill-n' },
];

// --- STATE ------------------------------------------------
let weekOffset = 0;

// Recurring tasks: array of { id, text, slotId, recurrence, days, interval, createdAt }
// recurrence: 'daily' | 'weekly' | 'once' | 'custom'
// days: [0,1,2,3,4,5,6] indices (0=Mon) for 'weekly'
// interval: number of days for 'custom'
let recurringTasks = [];

// Completion state: key "taskId|YYYY-MM-DD" => true/false
let completions = {};

// Legacy (kept for cloud sync compat)
let data = {};
let customTasks = {};

function getWeekDates(offset) {
  const now = new Date();
  // Encuentra el domingo de la semana actual
  const day = now.getDay(); // 0=dom, 1=lun... 6=sab
  const diffToSun = -day; // domingo siempre es 0, así que retrocedemos `day` días
  const sun = new Date(now);
  sun.setDate(now.getDate() + diffToSun + offset * 7);
  sun.setHours(0,0,0,0);
  return Array.from({length:7}, (_,i) => {
    const d = new Date(sun);
    d.setDate(sun.getDate() + i);
    return d;
  });
}

function isTodayDate(d) {
  const t = new Date();
  return d.getDate()===t.getDate() && d.getMonth()===t.getMonth() && d.getFullYear()===t.getFullYear();
}

function taskKey(dayIdx, slotId, i) {
  return `${weekOffset}|${dayIdx}|${slotId}|${i}`;
}
function customKey(dayIdx, slotId) {
  return `${weekOffset}|${dayIdx}|${slotId}`;
}

function taskVisibleOnDate(task, date) {
  const jsDay = date.getDay();
  const dayIdx = jsDay === 0 ? 6 : jsDay - 1; // 0=Mon
  if (task.recurrence === 'daily') return true;
  if (task.recurrence === 'weekly') return (task.days || []).includes(dayIdx);
  if (task.recurrence === 'once') {
    return task.onceDate === dateKey(date);
  }
  if (task.recurrence === 'custom') {
    const created = new Date(task.createdAt);
    const diff = Math.round((date - created) / 86400000);
    return diff >= 0 && diff % (task.interval || 1) === 0;
  }
  return false;
}

function completionKey(taskId, date) {
  return taskId + '|' + dateKey(date);
}

// --- RENDER -----------------------------------------------
function render() {
  const dates = getWeekDates(weekOffset);

  // Etiqueta semana: Lun 9 - Dom 15 mar
  const fmtShort = d => d.toLocaleDateString('es-MX', {weekday:'short', day:'numeric'});
  const fmtMonth = d => d.toLocaleDateString('es-MX', {month:'short'});
  const _wl = document.getElementById('weekLabel');
  if (_wl) _wl.textContent = fmtShort(dates[0]) + ' — ' + fmtShort(dates[6]) + ' ' + fmtMonth(dates[6]);

  const container = document.getElementById('gridOuter');
  if (!container) return;
  container.innerHTML = '';

  // Layout VERTICAL: cada día es un bloque
  let todayBlock = null;

  dates.forEach((date) => {
    const isToday = isTodayDate(date);
    const isPast  = date < new Date(new Date().setHours(0,0,0,0));
    const jsDay = date.getDay();
    const dayIdx = jsDay === 0 ? 6 : jsDay - 1;

    // Cabecera del día
    const dayBlock = document.createElement('div');
    dayBlock.className = 'day-block' + (isToday ? ' today-block' : '') + (isPast ? ' day-collapsed' : '');

    const dayHeader = document.createElement('div');
    dayHeader.className = 'day-block-header' + (isPast ? ' day-header-collapsible' : '');
    dayHeader.innerHTML =
      '<span class="day-block-name">' + date.toLocaleDateString('es-MX', {weekday:'short'}).replace('.','').toUpperCase() + '</span>' +
      '<span class="day-block-num">' + date.toLocaleDateString('es-MX', {day:'numeric', month:'short'}) + '</span>' +
      (isToday ? '<span class="day-block-today-badge">hoy</span>' : '') +
      (isPast ? '<span class="day-collapse-chevron">›</span>' : '');

    if (isPast) {
      dayHeader.addEventListener('click', function() {
        dayBlock.classList.toggle('day-collapsed');
      });
    }

    dayBlock.appendChild(dayHeader);

    // Franjas del día (mañana, tarde, noche) en fila
    const slotsRow = document.createElement('div');
    slotsRow.className = 'day-slots-row';

    SLOTS.forEach(slot => {
      const slotWrap = document.createElement('div');
      slotWrap.className = 'day-slot-wrap';

      const slotLabel = document.createElement('div');
      slotLabel.className = 'day-slot-label ' + slot.cls;
      slotLabel.innerHTML =
        '<span class="slot-icon">' + slot.icon + '</span>' +
        '<span class="slot-name">' + slot.name + '</span>';
      slotWrap.appendChild(slotLabel);

      const cell = document.createElement('div');
      cell.className = 'cell ' + slot.cellCls + (isToday ? ' today-cell' : '');
      renderCell(cell, slot, date);
      slotWrap.appendChild(cell);

      slotsRow.appendChild(slotWrap);
    });

    dayBlock.appendChild(slotsRow);
    container.appendChild(dayBlock);

    if (isToday) todayBlock = dayBlock;
  });

  updateProgress();

  // Auto-scroll a hoy
  if (todayBlock) {
    setTimeout(function() {
      todayBlock.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 120);
  }
}

// ── Render a single cell
function renderCell(cell, slot, date) {
  cell.innerHTML = '';
  const pillCls = slot.pillCls;
  const dk = dateKey(date);

  // Get tasks visible on this date for this slot
  const tasks = recurringTasks.filter(t => t.slotId === slot.id && taskVisibleOnDate(t, date));

  tasks.forEach((task) => {
    const cKey = completionKey(task.id, date);
    const done = !!completions[cKey];

    const pill = document.createElement('div');
    pill.className = `task-pill ${pillCls}` + (done ? ' done' : '');

    const chk = document.createElement('span');
    chk.className = 'pill-check';
    chk.textContent = done ? '✓' : '';
    chk.onclick = (e) => {
      e.stopPropagation();
      completions[cKey] = !done;
      if (!done && window.starBurst) window.starBurst(chk);
      saveData(); updateProgress(); renderCell(cell, slot, date);
    };

    const txt = document.createElement('span');
    txt.className = 'pill-text';
    txt.textContent = task.text;

    // Recurrence badge
    const badge = document.createElement('span');
    badge.className = 'recur-badge';
    const badgeMap = { daily:'🔁', weekly:'📅', once:'1️⃣', custom:'⚙️' };
    badge.textContent = badgeMap[task.recurrence] || '';
    badge.title = recurrenceLabel(task);

    const editBtn = document.createElement('button');
    editBtn.className = 'pill-action-btn pill-edit-btn';
    editBtn.title = 'Configurar tarea';
    editBtn.textContent = '✏️';
    editBtn.onclick = (e) => { e.stopPropagation(); openTaskModal(task.id); };

    pill.appendChild(chk);
    pill.appendChild(txt);
    pill.appendChild(badge);
    pill.appendChild(editBtn);
    cell.appendChild(pill);
  });

  // Add button
  const addBtn = document.createElement('button');
  addBtn.className = 'add-pill';
  addBtn.innerHTML = '＋ agregar';
  addBtn.onclick = () => openTaskModal(null, slot.id, date);
  cell.appendChild(addBtn);
}

function recurrenceLabel(task) {
  if (task.recurrence === 'daily') return 'Todos los días';
  if (task.recurrence === 'once') return 'Una sola vez';
  if (task.recurrence === 'custom') return `Cada ${task.interval} días`;
  if (task.recurrence === 'weekly') {
    const names = ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'];
    return 'Cada ' + (task.days||[]).map(d => names[d]).join(', ');
  }
  return '';
}

// --- PROGRESS ----------------------------------------------
function updateProgress() {
  const dates = getWeekDates(weekOffset);
  let total = 0, done = 0;
  dates.forEach(date => {
    SLOTS.forEach(slot => {
      recurringTasks.filter(t => t.slotId === slot.id && taskVisibleOnDate(t, date)).forEach(task => {
        total++;
        if (completions[completionKey(task.id, date)]) done++;
      });
    });
  });
  const pct = total > 0 ? Math.round((done/total)*100) : 0;
  const _pf = document.getElementById('progFill'); if (_pf) _pf.style.width = pct + '%';
  const _pp = document.getElementById('progPct'); if (_pp) _pp.textContent = pct + '%';
}

// --- PERSIST -----------------------------------------------
function saveData() {
  try { localStorage.setItem('recurring_tasks', JSON.stringify(recurringTasks)); } catch(e){}
  try { localStorage.setItem('completions', JSON.stringify(completions)); } catch(e){}
  if (window.cloudSave) {
    window.cloudSave('recurring_tasks', recurringTasks);
    window.cloudSave('completions', completions);
  }
}

function loadData() {
  recurringTasks = window._recurringTasks || JSON.parse(localStorage.getItem('recurring_tasks') || '[]');
  completions    = window._completions    || JSON.parse(localStorage.getItem('completions')     || '{}');
}

function resetWeek() {
  kittyConfirm('¿Reiniciar las tareas completadas de esta semana?', function() {
    const dates = getWeekDates(weekOffset);
    dates.forEach(date => {
      recurringTasks.forEach(task => {
        delete completions[completionKey(task.id, date)];
      });
    });
    saveData(); render();
  });
}

function resetAll() {
  kittyConfirm('¿Borrar todas las tareas y completados?', function() {
    recurringTasks = []; completions = {};
    saveData(); render();
  });
}


// ── TASK MODAL ────────────────────────────────────────────
let _modalTaskId = null;  // null = new task

function openTaskModal(taskId, defaultSlotId, defaultDate) {
  _modalTaskId = taskId;
  const existing = taskId ? recurringTasks.find(t => t.id === taskId) : null;

  // Remove existing modal
  const old = document.getElementById('taskModal');
  if (old) old.remove();

  const slot = existing ? existing.slotId : (defaultSlotId || 'm');
  const recur = existing ? existing.recurrence : 'daily';
  const days  = existing ? (existing.days || []) : [];
  const interval = existing ? (existing.interval || 2) : 2;
  const onceDate = existing ? (existing.onceDate || dateKey(defaultDate || new Date())) : dateKey(defaultDate || new Date());

  const backdrop = document.createElement('div');
  backdrop.className = 'modal-backdrop';
  backdrop.id = 'taskModal';

  const DAY_NAMES = ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'];

  backdrop.innerHTML = `
    <div class="modal-box" id="modalBox">
      <div class="modal-title">🐾 <em>${existing ? 'Editar' : 'Nueva'} tarea</em></div>

      <div class="modal-field">
        <label class="modal-label">Nombre de la tarea</label>
        <input class="modal-input" id="mTaskText" placeholder="ej: Tomar medicamento, Revisar agenda..." value="${existing ? existing.text.replace(/"/g,"&quot;") : ''}">
      </div>

      <div class="modal-field">
        <label class="modal-label">Franja del día</label>
        <div class="modal-slot-row">
          <button class="slot-chip ${slot==='m'?'active-m':''}" data-slot="m" onclick="modalSelectSlot(this,'m')">🌅 Mañana</button>
          <button class="slot-chip ${slot==='t'?'active-t':''}" data-slot="t" onclick="modalSelectSlot(this,'t')">☀️ Tarde</button>
          <button class="slot-chip ${slot==='n'?'active-n':''}" data-slot="n" onclick="modalSelectSlot(this,'n')">🌙 Noche</button>
        </div>
      </div>

      <div class="modal-field">
        <label class="modal-label">Repetición</label>
        <div class="recur-options">
          <button class="recur-chip ${recur==='daily'?'active':''}"  data-recur="daily"  onclick="modalSelectRecur(this)">🔁 Todos los días</button>
          <button class="recur-chip ${recur==='weekly'?'active':''}" data-recur="weekly" onclick="modalSelectRecur(this)">📅 Días específicos</button>
          <button class="recur-chip ${recur==='once'?'active':''}"   data-recur="once"   onclick="modalSelectRecur(this)">1️⃣ Una sola vez</button>
          <button class="recur-chip ${recur==='custom'?'active':''}" data-recur="custom" onclick="modalSelectRecur(this)">⚙️ Personalizar</button>
        </div>

        <div id="mWeeklyDays" style="display:${recur==='weekly'?'block':'none'}">
          <div class="days-selector">
            ${DAY_NAMES.map((d,i) => `<button class="day-chip ${days.includes(i)?'active':''}" data-day="${i}" onclick="this.classList.toggle('active')">${d}</button>`).join('')}
          </div>
        </div>

        <div id="mOnceDate" style="display:${recur==='once'?'block':'none'};margin-top:.5rem">
          <input class="modal-input" type="date" id="mDatePicker" value="${onceDate}">
        </div>

        <div id="mCustomInterval" style="display:${recur==='custom'?'flex':'none'}" class="modal-interval-row">
          <span style="font-size:.75rem;color:var(--muted);font-weight:600">Cada</span>
          <button class="interval-btn" onclick="changeInterval(-1)">−</button>
          <span class="interval-val" id="mIntervalVal">${interval}</span>
          <button class="interval-btn" onclick="changeInterval(1)">＋</button>
          <span style="font-size:.75rem;color:var(--muted);font-weight:600">días</span>
        </div>
      </div>

      <div class="modal-btns">
        <button class="modal-btn-cancel" onclick="closeTaskModal()">Cancelar</button>
        ${existing ? '<button class="modal-btn-delete" onclick="deleteTaskFromModal()">⋯ Eliminar</button>' : ''}
        <button class="modal-btn-save"   onclick="saveTaskModal()">Guardar 🐱</button>
      </div>
    </div>`;

  // Close on backdrop click
  backdrop.onclick = (e) => { if (e.target === backdrop) closeTaskModal(); };

  document.body.appendChild(backdrop);
  document.getElementById('mTaskText').focus();
}

function modalSelectSlot(btn, slotId) {
  document.querySelectorAll('#taskModal .slot-chip').forEach(b => {
    b.className = 'slot-chip';
  });
  btn.classList.add('active-' + slotId);
}

function modalSelectRecur(btn) {
  document.querySelectorAll('#taskModal .recur-chip').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const recur = btn.dataset.recur;
  document.getElementById('mWeeklyDays').style.display    = recur === 'weekly' ? 'block' : 'none';
  document.getElementById('mOnceDate').style.display      = recur === 'once'   ? 'block' : 'none';
  document.getElementById('mCustomInterval').style.display= recur === 'custom' ? 'flex'  : 'none';
}

function changeInterval(delta) {
  const el = document.getElementById('mIntervalVal');
  const val = Math.max(2, parseInt(el.textContent) + delta);
  el.textContent = val;
}

function closeTaskModal() {
  const m = document.getElementById('taskModal');
  if (m) m.remove();
}

function deleteTaskFromModal() {
  if (!_modalTaskId) return;
  const task = recurringTasks.find(t => t.id === _modalTaskId);
  if (!task) return;
  kittyConfirm('¿Eliminar "' + task.text + '" y todas sus repeticiones?', function() {
    recurringTasks = recurringTasks.filter(t => t.id !== _modalTaskId);
    Object.keys(completions).forEach(k => { if (k.startsWith(_modalTaskId + '|')) delete completions[k]; });
    saveData(); updateProgress(); render();
    closeTaskModal();
  });
}

function saveTaskModal() {
  const text = document.getElementById('mTaskText').value.trim();
  if (!text) { document.getElementById('mTaskText').focus(); return; }

  const slotBtn  = document.querySelector('#taskModal .slot-chip[class*="active"]');
  const slotId   = slotBtn ? slotBtn.dataset.slot : 'm';
  const recurBtn = document.querySelector('#taskModal .recur-chip.active');
  const recur    = recurBtn ? recurBtn.dataset.recur : 'daily';

  const days = recur === 'weekly'
    ? [...document.querySelectorAll('#taskModal .day-chip.active')].map(b => parseInt(b.dataset.day))
    : [];
  const interval = recur === 'custom' ? parseInt(document.getElementById('mIntervalVal').textContent) : 1;
  const onceDate = recur === 'once'   ? document.getElementById('mDatePicker').value : null;

  if (recur === 'weekly' && days.length === 0) {
    alert('Selecciona al menos un día de la semana 🐱');
    return;
  }

  if (_modalTaskId) {
    // Edit existing
    const t = recurringTasks.find(t => t.id === _modalTaskId);
    if (t) {
      t.text = text; t.slotId = slotId; t.recurrence = recur;
      t.days = days; t.interval = interval; t.onceDate = onceDate;
    }
  } else {
    // New task
    recurringTasks.push({
      id: 'task_' + Date.now() + '_' + Math.random().toString(36).slice(2,6),
      text, slotId, recurrence: recur, days, interval, onceDate,
      createdAt: new Date().toISOString()
    });
  }

  saveData();
  render();
  closeTaskModal();
}

// --- NAVIGATION --------------------------------------------
var _pW = document.getElementById('prevWeek'); if(_pW) _pW.onclick = () => { weekOffset--; render(); };
var _nW = document.getElementById('nextWeek'); if(_nW) _nW.onclick = () => { weekOffset++; render(); };

// --- SYNC FROM CLOUD ---------------------------------------
window.syncFromCloud = function() {
  if (window._recurringTasks !== undefined) recurringTasks = window._recurringTasks;
  if (window._completions    !== undefined) completions    = window._completions;
  render();
  if (typeof renderCheckin    === 'function') { loadCheckin();    renderCheckin();    }
  if (typeof loadSpark        === 'function') { loadSpark();                          }
  if (typeof renderTracker    === 'function') { loadTracker();    renderTracker();    }
  if (typeof renderLogros     === 'function') { loadLogros();     renderLogros();     }
  if (typeof renderCambio     === 'function') { loadCambio();     renderCambio();     }
  if (typeof renderCuida      === 'function') { loadCuida();      renderCuida();      }
  if (typeof renderTimeline   === 'function') { renderTimeline();                     }
  if (typeof loadGratitud === 'function') {
    // Solo recargar si no está escribiendo en un input de gratitud
    var activeEl = document.activeElement;
    var isTypingGratitud = activeEl && activeEl.classList.contains('gratitud-input');
    if (!isTypingGratitud) {
      loadGratitud();
      renderGratitud();
    }
  }
  if (typeof loadSueno        === 'function') { loadSueno();      renderSueno();      }
  if (typeof loadHabitos      === 'function') { loadHabitos();    renderHabitos();    }
  if (typeof loadMens         === 'function') { loadMens();       renderMens();       }
  if (typeof loadDios         === 'function') { loadDios();       renderDios();       }
  if (typeof loadEjercicio    === 'function') { loadEjercicio();  renderEjercicio();  }
  if (typeof loadBelleza      === 'function') { loadBelleza();    renderBelleza();    }
  if (typeof loadRutinas      === 'function') { loadRutinas();    renderRutinas();    }
  if (typeof loadDesglose     === 'function') { loadDesglose();   renderDesglose();   }
  if (typeof loadUniv         === 'function') { loadUniv();       renderUniv();       }
  if (typeof loadLimpieza     === 'function') { loadLimpieza();   renderLimpieza();   }
  if (typeof loadLimpRutinas  === 'function') { loadLimpRutinas(); renderLimpRutinas(); }
  if (typeof loadFinanzas     === 'function') { loadFinanzas();   renderFinanzas();   }
  if (typeof loadRecetario    === 'function') { loadRecetario();  renderRecetario();  }
};

// --- INIT --------------------------------------------------
// Show loading indicator while Firebase connects
document.addEventListener('DOMContentLoaded', () => {
  const loader = document.getElementById('cloudLoader');
  if (loader) loader.style.display = 'flex';
});

// ── POST-PARÁLISIS ────────────────────────────────────────
function postParalisisCheck() {
  var hoy = new Date().toISOString().slice(0,10);
  var lastCheck = localStorage.getItem('pp_last_check') || '';
  if (lastCheck === hoy) return; // Ya se corrió hoy

  var tareas = [];
  try { tareas = JSON.parse(localStorage.getItem('tareas_v2') || '[]'); } catch(e) { return; }

  var ayer = new Date();
  ayer.setDate(ayer.getDate() - 1);
  var ayerStr = ayer.toISOString().slice(0,10);

  var movidas = 0;
  var updated = tareas.map(function(t) {
    if (t.done) return t;
    // Tiene fecha de entrega que ya pasó (antes de hoy)
    if (t.fecha && t.fecha < hoy) {
      movidas++;
      return Object.assign({}, t, { fecha: hoy, pp_moved: true });
    }
    // No tiene fecha pero su createdAt era de ayer o antes → moverla a hoy
    if (!t.fecha && t.createdAt) {
      var created = t.createdAt.slice(0,10);
      if (created < hoy) {
        movidas++;
        return Object.assign({}, t, { createdAt: new Date().toISOString(), pp_moved: true });
      }
    }
    return t;
  });

  localStorage.setItem('tareas_v2', JSON.stringify(updated));
  localStorage.setItem('pp_last_check', hoy);

  if (movidas > 0) {
    postParalisisBanner(movidas);
  }
}

function postParalisisBanner(n) {
  // Inyectar estilos una vez
  if (!document.getElementById('ppStyles')) {
    var st = document.createElement('style');
    st.id = 'ppStyles';
    st.textContent = [
      '@keyframes ppSlideIn{from{transform:translateY(-110%);opacity:0}to{transform:translateY(0);opacity:1}}',
      '@keyframes ppSlideOut{from{transform:translateY(0);opacity:1}to{transform:translateY(-110%);opacity:0}}',
      '.pp-banner{position:fixed;top:1rem;left:50%;transform:translateX(-50%);z-index:8500;',
        'width:calc(100% - 2rem);max-width:400px;',
        'background:linear-gradient(135deg,#f8d7e8,#e8d5f8);',
        'border:1.5px solid #c4b5fd;border-radius:18px;',
        'padding:1rem 1.2rem;box-shadow:0 8px 32px rgba(167,139,250,.25);',
        'animation:ppSlideIn .4s cubic-bezier(.34,1.56,.64,1) both}',
      '.pp-banner.hiding{animation:ppSlideOut .35s ease both}',
    ].join('');
    document.head.appendChild(st);
  }

  var banner = document.createElement('div');
  banner.className = 'pp-banner';

  var msgs = [
    'No eres floja, tu cerebro procesa mucha información. Vamos a intentarlo de nuevo 🌸',
    'Las tareas de ayer te esperan hoy, sin juicio. Un paso a la vez 💙',
    'Tu valor no depende de lo que completaste ayer. Hoy es un día nuevo ✨',
    'El cerebro 3e necesita más tiempo, no menos valor. Aquí están tus tareas 🧩',
  ];
  var msg = msgs[Math.floor(Math.random() * msgs.length)];

  banner.innerHTML = [
    '<div style="display:flex;align-items:flex-start;gap:.75rem">',
      '<span style="font-size:1.5rem;line-height:1;flex-shrink:0">🫂</span>',
      '<div style="flex:1">',
        '<p style="font-size:.78rem;font-weight:800;color:#3d2060;margin-bottom:.25rem">',
          n === 1 ? 'Hay 1 tarea que pasamos al día de hoy' : 'Hay ' + n + ' tareas que pasamos al día de hoy',
        '</p>',
        '<p style="font-size:.73rem;font-weight:600;color:#6b4f8c;line-height:1.5;margin-bottom:.6rem">' + msg + '</p>',
        '<div style="display:flex;gap:.5rem">',
          '<button onclick="postParalisisVerTareas()" style="padding:.3rem .8rem;border-radius:20px;border:none;background:#a78bfa;color:#fff;font-family:var(--font-body);font-size:.72rem;font-weight:800;cursor:pointer">Ver tareas</button>',
          '<button onclick="postParalisisCerrar()" style="padding:.3rem .8rem;border-radius:20px;border:1.5px solid #c4b5fd;background:none;color:#6b4f8c;font-family:var(--font-body);font-size:.72rem;font-weight:700;cursor:pointer">Cerrar</button>',
        '</div>',
      '</div>',
    '</div>',
  ].join('');

  document.body.appendChild(banner);
  window._ppBanner = banner;

  // Auto-cerrar después de 12s
  window._ppTimer = setTimeout(postParalisisCerrar, 12000);
}

window.postParalisisCerrar = function() {
  if (window._ppTimer) clearTimeout(window._ppTimer);
  var b = window._ppBanner;
  if (!b) return;
  b.classList.add('hiding');
  setTimeout(function(){ if(b.parentNode) b.parentNode.removeChild(b); }, 380);
};

window.postParalisisVerTareas = function() {
  postParalisisCerrar();
  if (window.showPage) window.showPage('page-tareas');
};

async function initApp() {
  // Load from cloud if available, else use localStorage immediately
  if (window.cloudLoad) {
    try {
      const raw = await window.cloudLoad();
      if (raw.sem_data)            window._data             = JSON.parse(raw.sem_data);
      if (raw.sem_custom)          window._customTasks      = JSON.parse(raw.sem_custom);
      if (raw.recurring_tasks)     window._recurringTasks   = JSON.parse(raw.recurring_tasks);
      if (raw.completions)         window._completions      = JSON.parse(raw.completions);
      if (raw.ci_state)            window._checkinState     = JSON.parse(raw.ci_state);
      if (raw.nd_state)            window._needsState       = JSON.parse(raw.nd_state);
      if (raw.calm_tools)          window._calmTools        = JSON.parse(raw.calm_tools);
      if (raw.water_goal)          window._waterGoal        = parseInt(raw.water_goal);
      if (raw.water_state)         window._waterState       = JSON.parse(raw.water_state);
      if (raw.food_state)          window._foodState        = JSON.parse(raw.food_state);
      if (raw.logros_data)         window._logrosData       = JSON.parse(raw.logros_data);
      if (raw.fortalezas)          window._fortalezas       = JSON.parse(raw.fortalezas);
      if (raw.cambio_state)        window._cambioState      = JSON.parse(raw.cambio_state);
      if (raw.cambio_custom)       window._cambioCustom     = JSON.parse(raw.cambio_custom);
      if (raw.gratitud_data)       window._gratitudData     = JSON.parse(raw.gratitud_data);
      if (raw.sueno_data)          window._suenoData        = JSON.parse(raw.sueno_data);
      if (raw.mens_data)           window._mensData         = JSON.parse(raw.mens_data);
      if (raw.dios_data)           window._diosData         = JSON.parse(raw.dios_data);
      if (raw.versiculos)          window._versiculos       = JSON.parse(raw.versiculos);
      if (raw.ej_templates)        window._ejTemplates      = JSON.parse(raw.ej_templates);
      if (raw.ej_registros)        window._ejRegistros      = JSON.parse(raw.ej_registros);
      if (raw.belleza_templates)   window._bellezaTemplates = JSON.parse(raw.belleza_templates);
      if (raw.belleza_registros)   window._bellezaRegistros = JSON.parse(raw.belleza_registros);
      if (raw.rutina_templates)    window._rutinaTemplates  = JSON.parse(raw.rutina_templates);
      if (raw.rutina_asignaciones) window._rutinaAsignaciones = JSON.parse(raw.rutina_asignaciones);
      if (raw.rutina_completions)  window._rutinaCompletions  = JSON.parse(raw.rutina_completions);
      if (raw.desglose_items)      window._desgloseItems    = JSON.parse(raw.desglose_items);
      if (raw.univ_data)           window._univData         = JSON.parse(raw.univ_data);
      if (raw.limpieza_data)      window._limpiezaData     = JSON.parse(raw.limpieza_data);
      if (raw.limp_rutinas)        window._limpRutinas      = JSON.parse(raw.limp_rutinas);
      if (raw.finanzas_data)      window._finanzasData     = JSON.parse(raw.finanzas_data);
      if (raw.recetario_data)     window._recetarioData    = JSON.parse(raw.recetario_data);
    } catch(e) { console.warn('Cloud load failed, using localStorage', e); }
  }
  const loader = document.getElementById('cloudLoader');
  if (loader) loader.style.display = 'none';
  loadData();
  render();
  setTimeout(postParalisisCheck, 800);
}

if (window._firebaseReady) {
  initApp();
} else {
  document.addEventListener('firebase-ready', initApp);
  // Fallback: render after 3s even if Firebase doesn't respond
  setTimeout(() => { if (!document.getElementById('cloudLoader') || document.getElementById('cloudLoader').style.display !== 'none') initApp(); }, 3000);
}

// ── OVERFLOW SAFETY GUARD ─────────────────────────────────
// Si el body queda bloqueado sin ningún modal visible, lo libera
setInterval(function() {
  if (document.body.style.overflow === 'hidden') {
    var hasModal = document.querySelector(
      '#transModal, #eventoModal, #emergenciaOverlay, .spark-arch-modal, #wshModal, [id$="Modal"][style*="flex"]'
    );
    if (!hasModal) {
      document.body.style.overflow = '';
    }
  }
}, 500);

// ============================================================
//  SECCIÓN 4 · CHECK-IN SENSORIAL
// ============================================================
const MOODS = [
  { emoji:'😸', label:'Tranquila' },
  { emoji:'🐱', label:'Bien' },
  { emoji:'😐', label:'Neutral' },
  { emoji:'😼', label:'Con energía' },
  { emoji:'🙀', label:'Ansiosa' },
  { emoji:'😿', label:'Abrumada' },
  { emoji:'😾', label:'Triste' },
  { emoji:'🤯', label:'Saturada' },
];

const NEEDS = [
  { id:'silencio',  icon:'🔇', label:'Silencio' },
  { id:'manta',     icon:'🛋️', label:'Manta / peso' },
  { id:'soledad',   icon:'🚪', label:'Espacio solo' },
  { id:'musica',    icon:'🎵', label:'Música' },
  { id:'mover',     icon:'🚶', label:'Moverme' },
  { id:'comer',     icon:'🍵', label:'Algo rico' },
];

const DEFAULT_CALM = ['Respirar profundo','Música con audífonos','Pedir un abrazo','Salir a caminar','Tiempo sin pantallas'];

let checkinState = {};   // key: "wo|dayIdx|mood" => emoji
let needsState   = {};   // key: "wo|dayIdx|needId" => bool
let calmTools    = [];   // array of strings

function checkinKey(dayIdx) {
  var d = getWeekDates(weekOffset)[dayIdx];
  return 'ci_' + dateKey(d);
}
function needKey(dayIdx, needId) {
  var d = getWeekDates(weekOffset)[dayIdx];
  return 'nd_' + dateKey(d) + '_' + needId;
}

function loadCheckin() {
  checkinState = window._checkinState || JSON.parse(localStorage.getItem('ci_state')   || '{}');
  needsState   = window._needsState   || JSON.parse(localStorage.getItem('nd_state')   || '{}');
  calmTools    = window._calmTools    || JSON.parse(localStorage.getItem('calm_tools')  || 'null') || [...DEFAULT_CALM];
}

function saveCheckin() {
  try { localStorage.setItem('ci_state',   JSON.stringify(checkinState)); } catch(e){}
  try { localStorage.setItem('nd_state',   JSON.stringify(needsState));   } catch(e){}
  try { localStorage.setItem('calm_tools', JSON.stringify(calmTools));    } catch(e){}
  if (window.cloudSave) {
    window.cloudSave('ci_state',   checkinState);
    window.cloudSave('nd_state',   needsState);
    window.cloudSave('calm_tools', calmTools);
  }
}

function renderCheckin() {
  const today = new Date(); today.setHours(0,0,0,0);
  const dk = dateKey(today);
  const grid  = document.getElementById('checkinGrid');
  if (!grid) return;
  grid.innerHTML = '';

  const cell = document.createElement('div');
  cell.className = 'checkin-day today-cell';

  const selectedMood = checkinState['ci_' + dk] || null;

  const jsDay = today.getDay();
  const realDayIdx = jsDay === 0 ? 6 : jsDay - 1;
  cell.innerHTML = `<div class="checkin-dayname">${DAYS[realDayIdx]}</div>`;

  const moodRow = document.createElement('div');
  moodRow.className = 'mood-row';
  MOODS.forEach(m => {
    const btn = document.createElement('button');
    btn.className = 'mood-btn' + (selectedMood === m.emoji ? ' selected-mood' : '');
    btn.textContent = m.emoji;
    btn.title = m.label;
    btn.onclick = () => {
      checkinState['ci_' + dk] = (selectedMood === m.emoji) ? null : m.emoji;
      saveCheckin();
      renderCheckin();
    };
    moodRow.appendChild(btn);
  });
  cell.appendChild(moodRow);

  if (selectedMood) {
    const found = MOODS.find(m => m.emoji === selectedMood);
    const lbl = document.createElement('div');
    lbl.style.cssText = 'font-size:.6rem;font-weight:700;color:var(--rosa);text-align:center;margin-top:2px;';
    lbl.textContent = found ? found.label : '';
    cell.appendChild(lbl);
  }

  const needsDiv = document.createElement('div');
  needsDiv.className = 'needs-list';
  NEEDS.forEach(n => {
    const nk = 'nd_' + dk + '_' + n.id;
    const on = !!needsState[nk];
    const item = document.createElement('div');
    item.className = 'need-item' + (on ? ' need-on' : '');
    item.innerHTML = `<div class="need-dot"></div><span>${n.icon} ${n.label}</span>`;
    item.onclick = () => {
      needsState[nk] = !needsState[nk];
      saveCheckin();
      renderCheckin();
    };
    needsDiv.appendChild(item);
  });
  cell.appendChild(needsDiv);
  grid.appendChild(cell);

  renderCalmTools();
}

function renderCalmTools() {
  const wrap = document.getElementById('calmTools');
  if (!wrap) return;
  wrap.innerHTML = '';
  calmTools.forEach((tool, i) => {
    const el = document.createElement('div');
    el.className = 'calm-tool';
    el.innerHTML = `<span>🌸 ${tool}</span><span class="del-tool" title="Eliminar">✕</span>`;
    el.querySelector('.del-tool').onclick = (e) => {
      e.stopPropagation();
      calmTools.splice(i,1);
      saveCheckin();
      renderCalmTools();
    };
    wrap.appendChild(el);
  });
}

function addCalmTool() {
  const input = document.getElementById('calmInput');
  const val = input.value.trim();
  if (!val) return;
  calmTools.push(val);
  input.value = '';
  saveCheckin();
  renderCalmTools();
}
var _calmInp = document.getElementById('calmInput'); if(_calmInp) _calmInp.onkeydown = e => { if(e.key==='Enter') addCalmTool(); };

// ============================================================
//  SECCIÓN 5 · ZONA DE HIPERENFOQUE
// ============================================================
const SPARK_ICONS = ['⭐','🔬','🎨','🎮','📚','🌸','🎵','🦋','🚀','🧩','🌿','💎'];
let sparkIconIdx = 0;
let ideas = [];

function loadSpark() {
  try {
    const key = `spark_${weekOffset}`;
    const raw = window[`_spark_${weekOffset}`] || JSON.parse(localStorage.getItem(key) || '{}');
    const _spTitle = document.getElementById('sparkTitle');
    const _spNotes = document.getElementById('sparkNotes');
    const _spEmoji = document.getElementById('sparkEmoji');
    if (_spTitle) _spTitle.value = raw.title || '';
    if (_spNotes) _spNotes.textContent = raw.notes || '';
    sparkIconIdx = raw.iconIdx || 0;
    if (_spEmoji) _spEmoji.textContent = SPARK_ICONS[sparkIconIdx];
    ideas = raw.ideas || [];
    renderIdeas();
    renderSparkDots(raw.dotLevel || 0);

    const lbl = document.getElementById('sparkRangeLabel');
    if (lbl) lbl.textContent = 'Mi proyecto / interés especial actual';
  } catch(e) {}
}

function saveSpark() {
  const val = {
    title:    document.getElementById('sparkTitle').value,
    notes:    (document.getElementById('sparkNotes').textContent || ''),
    iconIdx:  sparkIconIdx,
    ideas:    ideas,
    dotLevel: currentDotLevel,
  };
  try { localStorage.setItem(`spark_${weekOffset}`, JSON.stringify(val)); } catch(e){}
  if (window.cloudSave) window.cloudSave(`spark_${weekOffset}`, val);
}

function cycleSparkIcon() {
  sparkIconIdx = (sparkIconIdx + 1) % SPARK_ICONS.length;
  var _se = document.getElementById('sparkEmoji');
  if (_se) _se.textContent = SPARK_ICONS[sparkIconIdx];
  saveSpark();
}

var _spT = document.getElementById('sparkTitle'); if(_spT) _spT.oninput = saveSpark;
var _spN = document.getElementById('sparkNotes');
if(_spN) {
  _spN.addEventListener('input', function() { saveSpark(); });
}

function renderIdeas() {
  const list = document.getElementById('ideasList');
  if (!list) return;
  list.innerHTML = '';
  ideas.forEach((idea, i) => {
    const el = document.createElement('div');
    el.className = 'idea-item';
    el.innerHTML = `<span>💡 ${idea}</span>
      <button class="idea-del" onclick="removeIdea(${i})">✕</button>`;
    list.appendChild(el);
  });
}

function addIdea() {
  const input = document.getElementById('ideaInput');
  const val = input.value.trim();
  if (!val) return;
  ideas.push(val);
  input.value = '';
  renderIdeas();
  saveSpark();
}
var _ideaIn = document.getElementById('ideaInput'); if(_ideaIn) _ideaIn.onkeydown = e => { if(e.key==='Enter') addIdea(); };

function removeIdea(i) {
  ideas.splice(i, 1);
  renderIdeas();
  saveSpark();
}

const DOT_LABELS = ['','Recién empezando 🌱','Explorando 🔍','Avanzando bien ✨','¡Muy metida! 🔥','¡En la zona! 🚀'];
let currentDotLevel = 0;

function renderSparkDots(level) {
  currentDotLevel = level;
  const wrap = document.getElementById('sparkDots');
  const lbl  = document.getElementById('sparkMoodLabel');
  if (!wrap) return;
  wrap.innerHTML = '';
  for (let i = 1; i <= 5; i++) {
    const dot = document.createElement('div');
    dot.className = 'spark-dot' + (i <= level ? ' dot-on' : '');
    dot.title = DOT_LABELS[i];
    dot.onclick = () => { renderSparkDots(i === level ? 0 : i); saveSpark(); };
    wrap.appendChild(dot);
  }
  lbl.textContent = DOT_LABELS[level] || '';
}

// ── 📌 PINES (cosas que no quiero olvidar)
let sparkPins = [];
function loadSparkPins() {
  try { sparkPins = window._sparkPins || JSON.parse(localStorage.getItem('spark_pins') || '[]'); } catch(e){ sparkPins=[]; }
  renderSparkPins();
}
function saveSparkPins() {
  try { localStorage.setItem('spark_pins', JSON.stringify(sparkPins)); } catch(e){}
  if (window.cloudSave) window.cloudSave('spark_pins', sparkPins);
}
function renderSparkPins() {
  const list = document.getElementById('sparkPinList');
  if (!list) return;
  list.innerHTML = '';
  sparkPins.forEach((pin, i) => {
    const el = document.createElement('div');
    el.className = 'idea-item';
    el.innerHTML = '<span>📌 ' + pin + '</span><button class="idea-del" onclick="removeSparkPin(' + i + ')">✕</button>';
    list.appendChild(el);
  });
}
function addSparkPin() {
  const inp = document.getElementById('sparkPinInput');
  const val = inp ? inp.value.trim() : '';
  if (!val) return;
  sparkPins.push(val);
  inp.value = '';
  renderSparkPins();
  saveSparkPins();
}
function removeSparkPin(i) {
  sparkPins.splice(i, 1);
  renderSparkPins();
  saveSparkPins();
}
var _spPin = document.getElementById('sparkPinInput');
if (_spPin) _spPin.onkeydown = function(e){ if(e.key==='Enter') addSparkPin(); };

// ── ⚠️ AUTOCUIDADO
const CARE_ITEMS = [
  { id:'comida', label:'¿Comí bien?', emoji:'🍽️' },
  { id:'agua',   label:'¿Tomé agua?', emoji:'💧' },
  { id:'dormi',  label:'¿Dormí bien?', emoji:'😴' },
  { id:'descanso', label:'¿Tomé descansos?', emoji:'🧘' },
  { id:'sol',    label:'¿Salí/vi luz natural?', emoji:'☀️' },
];
function careKey(id) {
  return 'spark_care_' + id + '_' + new Date().toISOString().slice(0,10);
}
function renderSparkCare() {
  const grid = document.getElementById('sparkCareGrid');
  if (!grid) return;
  grid.innerHTML = '';
  CARE_ITEMS.forEach(function(item) {
    const done = localStorage.getItem(careKey(item.id)) === '1';
    const btn = document.createElement('button');
    var doneBg = done ? 'var(--beige)' : 'white';
    var doneColor = done ? 'white' : 'var(--beige)';
    btn.style.cssText = 'display:flex;align-items:center;gap:.4rem;background:' + doneBg + ';border:1.5px solid var(--beige);border-radius:20px;padding:.3rem .75rem;font-size:.7rem;font-weight:700;color:' + doneColor + ';cursor:pointer;font-family:var(--font-body);transition:all .2s;margin:.2rem .2rem 0 0';
    btn.innerHTML = item.emoji + ' ' + item.label + (done ? ' ✓' : '');
    btn.onclick = function() {
      const nowDone = localStorage.getItem(careKey(item.id)) === '1';
      localStorage.setItem(careKey(item.id), nowDone ? '0' : '1');
      renderSparkCare();
    };
    grid.appendChild(btn);
  });
}

// ── 🕐 RASTREADOR DE TIEMPO
let sparkTimerInterval = null;
let sparkTimerStart = null;
let sparkTimerRunning = false;
let sparkTotalMinutes = 0;

function loadSparkTime() {
  try { sparkTotalMinutes = (typeof window._sparkTotalMinutes === 'number') ? window._sparkTotalMinutes : parseInt(localStorage.getItem('spark_total_minutes') || '0'); } catch(e){ sparkTotalMinutes=0; }
  updateSparkTimeDisplay();
}
function saveSparkTime() {
  try { localStorage.setItem('spark_total_minutes', sparkTotalMinutes); } catch(e){}
  if (window.cloudSave) window.cloudSave('spark_total_minutes', sparkTotalMinutes);
}
function updateSparkTimeDisplay() {
  const el = document.getElementById('sparkTimeDisplay');
  if (!el) return;
  const h = Math.floor(sparkTotalMinutes / 60);
  const m = sparkTotalMinutes % 60;
  el.textContent = h + 'h ' + m + 'm';
}
function toggleSparkTimer() {
  const btn = document.getElementById('sparkTimerBtn');
  const running = document.getElementById('sparkTimeRunning');
  if (!sparkTimerRunning) {
    sparkTimerStart = Date.now();
    sparkTimerRunning = true;
    sparkTimerInterval = setInterval(function() {
      const elapsed = Math.floor((Date.now() - sparkTimerStart) / 60000);
      const el = document.getElementById('sparkTimeDisplay');
      const h = Math.floor((sparkTotalMinutes + elapsed) / 60);
      const m = (sparkTotalMinutes + elapsed) % 60;
      if (el) el.textContent = h + 'h ' + m + 'm';
    }, 10000);
    if (btn) { btn.textContent = '⏸ Pausar'; btn.style.background='var(--rosa)'; }
    if (running) running.style.display = 'block';
  } else {
    const elapsed = Math.floor((Date.now() - sparkTimerStart) / 60000);
    sparkTotalMinutes += elapsed;
    clearInterval(sparkTimerInterval);
    sparkTimerRunning = false;
    sparkTimerStart = null;
    saveSparkTime();
    updateSparkTimeDisplay();
    if (btn) { btn.textContent = '▶ Iniciar'; btn.style.background='var(--beige)'; }
    if (running) running.style.display = 'none';
  }
}
function addSparkTimeManual() {
  const val = prompt('¿Cuántas horas agregar? (puedes poner decimales, ej: 1.5)');
  if (!val) return;
  const h = parseFloat(val);
  if (isNaN(h) || h <= 0) return;
  sparkTotalMinutes += Math.round(h * 60);
  saveSparkTime();
  updateSparkTimeDisplay();
}

// ── 🔁 HISTORIAL DE HIPERFOCOS
let sparkHistorial = [];
function loadSparkHistorial() {
  try { sparkHistorial = window._sparkHistorial || JSON.parse(localStorage.getItem('spark_historial') || '[]'); } catch(e){ sparkHistorial=[]; }
  renderSparkHistorial();
}
function saveSparkHistorial() {
  try { localStorage.setItem('spark_historial', JSON.stringify(sparkHistorial)); } catch(e){}
  if (window.cloudSave) window.cloudSave('spark_historial', sparkHistorial);
}
function renderSparkHistorial() {
  const el = document.getElementById('sparkHistorial');
  if (!el) return;
  if (sparkHistorial.length === 0) {
    el.innerHTML = '<div style="font-size:.7rem;color:var(--muted2);font-style:italic;padding:.3rem 0">Aún no tienes hiperfocos archivados ✦</div>';
    return;
  }
  el.innerHTML = '';
  sparkHistorial.slice().reverse().forEach(function(h, i) {
    const card = document.createElement('div');
    card.style.cssText = 'background:var(--card);border:1.5px solid var(--border);border-radius:14px;padding:.7rem .85rem;margin-bottom:.55rem';
    const hrs  = Math.floor((h.minutes||0)/60);
    const mins = (h.minutes||0) % 60;

    // Rango de fechas legible
    var fechaStr = h.date || '';
    if (h.fechaInicio && h.fechaFin) {
      var fmt = function(s){ var d=new Date(s+'T12:00:00'); return d.toLocaleDateString('es-MX',{day:'numeric',month:'short',year:'numeric'}); };
      fechaStr = h.fechaInicio===h.fechaFin ? fmt(h.fechaInicio) : fmt(h.fechaInicio)+' → '+fmt(h.fechaFin);
    }

    var photosHtml = '';
    if (h.photos && h.photos.length) {
      photosHtml = '<div style="display:flex;gap:.35rem;flex-wrap:wrap;margin-top:.5rem">' +
        h.photos.map(function(src){
          return '<img src="'+src+'" style="width:52px;height:52px;object-fit:cover;border-radius:8px;border:1.5px solid var(--border);cursor:pointer" onclick="sparkOpenPhoto(\''+src+'\')">';
        }).join('') +
      '</div>';
    }

    card.innerHTML =
      '<div style="display:flex;align-items:flex-start;gap:.5rem">' +
        '<div style="font-size:1.2rem;line-height:1;margin-top:.1rem">'+(h.icon||'⭐')+'</div>'+
        '<div style="flex:1;min-width:0">'+
          '<div style="font-size:.78rem;font-weight:800;color:var(--text);margin-bottom:.15rem">'+(h.title||'Sin título')+'</div>'+
          '<div style="font-size:.63rem;color:var(--muted2);font-weight:600">'+fechaStr+(hrs||mins?' · '+hrs+'h '+mins+'m':'')+'</div>'+
          (h.notes ? '<div style="font-size:.66rem;color:var(--muted);margin-top:.25rem;line-height:1.4">'+(h.notes.length>100?h.notes.slice(0,100)+'…':h.notes)+'</div>' : '')+
          (h.notaCierre ? '<div style="font-size:.66rem;color:var(--rosa);margin-top:.25rem;font-style:italic;line-height:1.4">💬 '+h.notaCierre+'</div>' : '')+
          photosHtml+
        '</div>'+
      '</div>';
    el.appendChild(card);
  });
}

window.sparkOpenPhoto = function(src) {
  var ov = document.createElement('div');
  ov.style.cssText = 'position:fixed;inset:0;z-index:9500;background:rgba(0,0,0,.85);display:flex;align-items:center;justify-content:center;cursor:pointer;padding:1rem';
  ov.onclick = function(){ ov.remove(); };
  var img = document.createElement('img');
  img.src = src;
  img.style.cssText = 'max-width:100%;max-height:90vh;border-radius:14px;box-shadow:0 20px 60px rgba(0,0,0,.5)';
  ov.appendChild(img);
  document.body.appendChild(ov);
};
function archiveCurrentSpark() {
  const title = (document.getElementById('sparkTitle')||{}).value || '';
  if (!title.trim()) { alert('Escribe el nombre del proyecto antes de archivar 🐱'); return; }

  // Inyectar estilos del modal una sola vez
  if (!document.getElementById('sparkArchiveStyles')) {
    var st = document.createElement('style');
    st.id = 'sparkArchiveStyles';
    st.textContent = [
      '.spark-arch-modal{position:fixed;inset:0;z-index:7000;background:rgba(0,0,0,.55);display:flex;align-items:flex-start;justify-content:center;padding:1rem;overflow-y:auto}',
      '.spark-arch-box{background:var(--card);border-radius:22px;padding:1.6rem;max-width:420px;width:100%;margin:auto;box-shadow:0 24px 60px rgba(0,0,0,.3);animation:emergFadeIn .35s ease both}',
      '.spark-arch-label{font-size:.7rem;font-weight:800;color:var(--muted);text-transform:uppercase;letter-spacing:.07em;display:block;margin-bottom:.35rem}',
      '.spark-arch-input{width:100%;box-sizing:border-box;background:var(--surface);border:1.5px solid var(--border);border-radius:10px;padding:.6rem .8rem;font-family:var(--font-body);font-size:.84rem;color:var(--text);outline:none;margin-bottom:.9rem}',
      '.spark-arch-input:focus{border-color:var(--rosa)}',
      '.spark-photo-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:.5rem;margin-bottom:.9rem}',
      '.spark-photo-thumb{width:100%;aspect-ratio:1;object-fit:cover;border-radius:10px;border:1.5px solid var(--border)}',
      '.spark-photo-add{width:100%;aspect-ratio:1;border-radius:10px;border:1.5px dashed var(--border);background:var(--surface);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:1.3rem;color:var(--muted2);transition:border-color .15s}',
      '.spark-photo-add:hover{border-color:var(--rosa)}',
      '.spark-photo-wrap{position:relative}',
      '.spark-photo-del{position:absolute;top:3px;right:3px;width:18px;height:18px;border-radius:50%;background:rgba(0,0,0,.6);border:none;color:#fff;font-size:.6rem;cursor:pointer;display:flex;align-items:center;justify-content:center;line-height:1}',
    ].join('');
    document.head.appendChild(st);
  }

  // Fotos temporales en memoria
  var archivePhotos = [];

  var today = new Date().toISOString().slice(0,10);

  var m = document.createElement('div');
  m.className = 'spark-arch-modal';
  m.onclick = function(e){ if(e.target===m) m.remove(); };

  m.innerHTML = [
    '<div class="spark-arch-box" onclick="event.stopPropagation()">',
      '<h3 style="font-family:var(--font-title);font-size:1.1rem;color:var(--rosa);font-style:italic;margin-bottom:1.2rem">✦ Archivar hiperfoco</h3>',

      // Título (readonly)
      '<label class="spark-arch-label">Interés / proyecto</label>',
      '<div style="background:var(--surface);border-radius:10px;padding:.6rem .8rem;font-size:.86rem;font-weight:700;color:var(--text);margin-bottom:.9rem;border:1.5px solid var(--border)">',
        '<span id="archTitlePreview"></span>',
      '</div>',

      // Fechas
      '<label class="spark-arch-label">¿De cuándo a cuándo?</label>',
      '<div style="display:flex;gap:.5rem;align-items:center;margin-bottom:.9rem">',
        '<input type="date" id="archFechaInicio" class="spark-arch-input" style="margin-bottom:0;flex:1" value="'+today+'">',
        '<span style="color:var(--muted);font-weight:700;font-size:.8rem">→</span>',
        '<input type="date" id="archFechaFin" class="spark-arch-input" style="margin-bottom:0;flex:1" value="'+today+'">',
      '</div>',

      // Fotos
      '<label class="spark-arch-label">Fotos / recuerdos (opcional)</label>',
      '<div class="spark-photo-grid" id="archPhotoGrid">',
        '<label class="spark-photo-add" title="Agregar foto">',
          '<input type="file" accept="image/*" multiple style="display:none" onchange="archHandlePhotos(this)">',
          '📷',
        '</label>',
      '</div>',

      // Nota cierre
      '<label class="spark-arch-label">Nota de cierre (opcional)</label>',
      '<textarea id="archNotaCierre" class="spark-arch-input" rows="2" placeholder="¿Qué aprendiste? ¿Cómo te fue? ¿Lo retomás? 🌸" style="resize:vertical;margin-bottom:1.1rem"></textarea>',

      // Botones
      '<div style="display:flex;gap:.6rem">',
        '<button onclick="archiveConfirmar()" style="flex:1;padding:.65rem;border-radius:12px;border:none;background:var(--rosa);color:#fff;font-family:var(--font-body);font-size:.84rem;font-weight:800;cursor:pointer">Archivar ✦</button>',
        '<button onclick="document.querySelector(\'.spark-arch-modal\').remove()" style="padding:.65rem 1rem;border-radius:12px;border:1.5px solid var(--border);background:none;color:var(--muted);font-family:var(--font-body);font-size:.84rem;font-weight:700;cursor:pointer">Cancelar</button>',
      '</div>',
    '</div>',
  ].join('');

  document.body.appendChild(m);
  var prev = document.getElementById('archTitlePreview');
  if (prev) prev.textContent = title.trim();
}

// ══════════════════════════════════════════
//  NOTAS POR INTERÉS
// ══════════════════════════════════════════
(function() {
  var NI_EMOJIS = ['📝','💡','🌟','🔭','🎨','🎵','📚','🌿','✨','🦋','🌙','🔬','🎯','🌈','💭','🧩'];
  var _niData = { cats: [], notes: [] };
  var _niActiveCat = '__all__';
  var _niEditId = null;
  var _niSelEmoji = '📝';

  function niLoad() {
    try {
      var raw = localStorage.getItem('notas_intereses_data');
      if (raw) _niData = JSON.parse(raw);
      if (!_niData.cats) _niData.cats = [];
      if (!_niData.notes) _niData.notes = [];
    } catch(e) { _niData = { cats: [], notes: [] }; }
  }

  function niSave() {
    try { localStorage.setItem('notas_intereses_data', JSON.stringify(_niData)); } catch(e) {}
    if (window.cloudSave) window.cloudSave('notas_intereses_data', _niData);
  }

  function niRenderCats() {
    var row = document.getElementById('niCatsRow');
    if (!row) return;
    row.innerHTML = '<button class="ni-cat-chip all-chip' + (_niActiveCat==='__all__'?' active':'') + '" data-cat="__all__" onclick="niSelectCat(\'__all__\')">🗂 Todas</button>';
    _niData.cats.forEach(function(cat) {
      var btn = document.createElement('button');
      btn.className = 'ni-cat-chip' + (_niActiveCat===cat?' active':'');
      btn.innerHTML = cat + ' <button class="ni-cat-del" title="Eliminar categoría" onclick="event.stopPropagation();niDeleteCat(\'' + cat.replace(/'/g,"\\'") + '\')">×</button>';
      btn.onclick = function(){ niSelectCat(cat); };
      row.appendChild(btn);
    });
  }

  function niRenderCards() {
    var grid = document.getElementById('niCardsGrid');
    if (!grid) return;
    var notes = _niActiveCat === '__all__'
      ? _niData.notes
      : _niData.notes.filter(function(n){ return n.cat === _niActiveCat; });
    if (!notes.length) {
      grid.innerHTML = '<div class="ni-empty">No hay notas aquí todavía ✨<br>' +
        (_niActiveCat==='__all__' ? '¡Crea tu primera nota!' : 'Agrega una nota en esta categoría.') + '</div>';
      return;
    }
    grid.innerHTML = '';
    // Más reciente primero
    var sorted = notes.slice().sort(function(a,b){ return (b.ts||0)-(a.ts||0); });
    sorted.forEach(function(note) {
      var card = document.createElement('div');
      card.className = 'ni-note-card';
      // Color accent per cat
      var catIdx = _niData.cats.indexOf(note.cat);
      var colors = ['#f4a7c0','#b39ddb','#80cbc4','#ffcc80','#ef9a9a','#a5d6a7'];
      card.style.borderLeftColor = colors[catIdx % colors.length] || 'var(--beige)';

      var dateStr = note.ts ? new Date(note.ts).toLocaleDateString('es-MX', {day:'numeric',month:'short',year:'numeric'}) : '';
      var bodyPreview = (note.body||'').trim();
      var linkHtml = note.link ? '<a class="ni-note-link" href="' + note.link + '" target="_blank" rel="noopener">🔗 ' + note.link + '</a>' : '';

      card.innerHTML =
        '<div class="ni-note-top">' +
          '<span class="ni-note-emoji" title="Cambiar emoji" onclick="niCycleEmoji(\'' + note.id + '\')">' + (note.emoji||'📝') + '</span>' +
          '<span class="ni-note-title">' + escHtml(note.title||'Sin título') + '</span>' +
          '<div class="ni-note-actions">' +
            '<button class="ni-note-btn" title="Editar" onclick="niOpenModal(\'' + note.id + '\')">✏️</button>' +
            '<button class="ni-note-btn" title="Eliminar" onclick="niDeleteNote(\'' + note.id + '\')">🗑</button>' +
          '</div>' +
        '</div>' +
        (bodyPreview ? '<div class="ni-note-body" id="nibody-' + note.id + '">' + escHtml(bodyPreview) + '</div>' : '') +
        (bodyPreview && bodyPreview.length > 120 ? '<button class="ni-note-btn" style="font-size:.62rem;align-self:flex-start" onclick="niToggleExpand(\'' + note.id + '\')">ver más ▾</button>' : '') +
        linkHtml +
        '<div class="ni-note-footer">' +
          '<span class="ni-note-cat-badge">' + escHtml(note.cat||'Sin cat') + '</span>' +
          '<span class="ni-note-date">' + dateStr + '</span>' +
        '</div>';
      grid.appendChild(card);
    });
  }

  function escHtml(s) {
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  window.niSelectCat = function(cat) {
    _niActiveCat = cat;
    niRenderCats();
    niRenderCards();
  };

  window.niAddCat = function() {
    var inp = document.getElementById('niCatInput');
    if (!inp) return;
    var val = inp.value.trim();
    if (!val || _niData.cats.indexOf(val) !== -1) { inp.value=''; return; }
    _niData.cats.push(val);
    niSave();
    niRenderCats();
    inp.value = '';
  };

  window.niDeleteCat = function(cat) {
    if (!window.kittyConfirm) {
      if (!confirm('¿Eliminar categoría "' + cat + '"? Las notas de esta categoría quedarán sin categoría.')) return;
      doCatDel(cat);
    } else {
      window.kittyConfirm('¿Eliminar categoría "' + cat + '"? Las notas quedarán sin categoría.', function(){ doCatDel(cat); });
    }
  };
  function doCatDel(cat) {
    _niData.cats = _niData.cats.filter(function(c){ return c!==cat; });
    _niData.notes.forEach(function(n){ if(n.cat===cat) n.cat='Sin categoría'; });
    if (_niActiveCat===cat) _niActiveCat='__all__';
    niSave(); niRenderCats(); niRenderCards();
  }

  window.niDeleteNote = function(id) {
    if (!window.kittyConfirm) {
      if (!confirm('¿Eliminar esta nota?')) return;
      doNoteDel(id);
    } else {
      window.kittyConfirm('¿Eliminar esta nota?', function(){ doNoteDel(id); });
    }
  };
  function doNoteDel(id) {
    _niData.notes = _niData.notes.filter(function(n){ return n.n!==id && n.id!==id; });
    niSave(); niRenderCards();
  }

  window.niCycleEmoji = function(id) {
    var note = _niData.notes.find(function(n){ return n.id===id; });
    if (!note) return;
    var idx = NI_EMOJIS.indexOf(note.emoji||'📝');
    note.emoji = NI_EMOJIS[(idx+1) % NI_EMOJIS.length];
    niSave(); niRenderCards();
  };

  window.niToggleExpand = function(id) {
    var el = document.getElementById('nibody-'+id);
    if (!el) return;
    el.classList.toggle('expanded');
  };

  window.niOpenModal = function(editId) {
    _niEditId = editId || null;
    var note = editId ? _niData.notes.find(function(n){ return n.id===editId; }) : null;
    _niSelEmoji = note ? (note.emoji||'📝') : '📝';

    var overlay = document.createElement('div');
    overlay.className = 'ni-modal-overlay';
    overlay.id = 'niModalOverlay';
    overlay.onclick = function(e){ if(e.target===overlay) niCloseModal(); };

    var catOptions = _niData.cats.map(function(c){
      return '<option value="' + escHtml(c) + '"' + (note&&note.cat===c?' selected':'') + '>' + escHtml(c) + '</option>';
    }).join('');
    if (!_niData.cats.length) catOptions = '<option value="">— Sin categoría —</option>';

    overlay.innerHTML =
      '<div class="ni-modal" onclick="event.stopPropagation()">' +
        '<div class="ni-modal-title">' + (editId ? '✏️ Editar nota' : '✦ Nueva nota') + '</div>' +
        '<div>' +
          '<label>Emoji</label>' +
          '<div class="ni-modal-emoji-row" id="niEmojiRow">' +
            NI_EMOJIS.map(function(e){ return '<span class="ni-emoji-opt' + (e===_niSelEmoji?' selected':'') + '" onclick="niPickEmoji(\'' + e + '\')">' + e + '</span>'; }).join('') +
          '</div>' +
        '</div>' +
        '<div><label>Título</label><input id="niModalTitle" placeholder="¿Sobre qué es esta nota?" value="' + escHtml(note?note.title:'') + '" /></div>' +
        '<div><label>Categoría</label><select id="niModalCat">' + catOptions + '</select></div>' +
        '<div><label>Contenido</label><textarea id="niModalBody" placeholder="Escribe tus ideas, descubrimientos, reflexiones…">' + escHtml(note?note.body:'') + '</textarea></div>' +
        '<div><label>Link (opcional)</label><input id="niModalLink" type="url" placeholder="https://…" value="' + escHtml(note?note.link||'':'') + '" /></div>' +
        '<div class="ni-modal-actions">' +
          '<button class="ni-modal-cancel" onclick="niCloseModal()">Cancelar</button>' +
          '<button class="ni-modal-save" onclick="niSaveNote()">Guardar ✦</button>' +
        '</div>' +
      '</div>';

    document.body.appendChild(overlay);
  };

  window.niPickEmoji = function(em) {
    _niSelEmoji = em;
    document.querySelectorAll('.ni-emoji-opt').forEach(function(el){ el.classList.remove('selected'); });
    document.querySelectorAll('.ni-emoji-opt').forEach(function(el){ if(el.textContent===em) el.classList.add('selected'); });
  };

  window.niCloseModal = function() {
    var ov = document.getElementById('niModalOverlay');
    if (ov) ov.remove();
    _niEditId = null;
  };

  window.niSaveNote = function() {
    var title = (document.getElementById('niModalTitle')||{}).value || '';
    var cat   = (document.getElementById('niModalCat')||{}).value || 'Sin categoría';
    var body  = (document.getElementById('niModalBody')||{}).value || '';
    var link  = (document.getElementById('niModalLink')||{}).value || '';
    if (!title.trim()) { alert('El título no puede estar vacío.'); return; }
    if (_niEditId) {
      var note = _niData.notes.find(function(n){ return n.id===_niEditId; });
      if (note) { note.title=title.trim(); note.cat=cat; note.body=body.trim(); note.link=link.trim(); note.emoji=_niSelEmoji; }
    } else {
      _niData.notes.push({
        id: 'ni_' + Date.now(),
        title: title.trim(), cat: cat, body: body.trim(),
        link: link.trim(), emoji: _niSelEmoji,
        ts: Date.now()
      });
    }
    niSave(); niCloseModal(); niRenderCats(); niRenderCards();
    // Si la cat activa era la nueva, seleccionarla
    if (_niActiveCat !== '__all__' && _niActiveCat !== cat) {
      _niActiveCat = cat; niRenderCats(); niRenderCards();
    }
  };

  // Sincronizar desde nube
  var _origSyncFromCloud = window.syncFromCloud;
  window.syncFromCloud = function() {
    if (_origSyncFromCloud) _origSyncFromCloud();
    try {
      var raw = localStorage.getItem('notas_intereses_data');
      if (raw) { _niData = JSON.parse(raw); niRenderCats(); niRenderCards(); }
    } catch(e){}
  };

  // Inicializar cuando el DOM esté listo
  function niInit() {
    niLoad();
    niRenderCats();
    niRenderCards();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', niInit);
  } else {
    niInit();
  }
})();

window.archHandlePhotos = function(input) {
  var files = Array.from(input.files);
  if (!files.length) return;
  files.forEach(function(file) {
    var reader = new FileReader();
    reader.onload = function(e) {
      var b64 = e.target.result;
      window._archivePhotos = window._archivePhotos || [];
      window._archivePhotos.push(b64);
      archRenderPhotoGrid();
    };
    reader.readAsDataURL(file);
  });
  input.value = '';
};

function archRenderPhotoGrid() {
  var grid = document.getElementById('archPhotoGrid'); if(!grid) return;
  var photos = window._archivePhotos || [];
  grid.innerHTML = photos.map(function(src, i){
    return '<div class="spark-photo-wrap">'+
      '<img src="'+src+'" class="spark-photo-thumb">'+
      '<button class="spark-photo-del" onclick="archDelPhoto('+i+')">✕</button>'+
    '</div>';
  }).join('') +
  '<label class="spark-photo-add" title="Agregar foto">'+
    '<input type="file" accept="image/*" multiple style="display:none" onchange="archHandlePhotos(this)">'+
    '📷'+
  '</label>';
}

window.archDelPhoto = function(i) {
  if (window._archivePhotos) {
    window._archivePhotos.splice(i, 1);
    archRenderPhotoGrid();
  }
};

window.archiveConfirmar = function() {
  var title = (document.getElementById('sparkTitle')||{}).value || '';
  var notes = (document.getElementById('sparkNotes')||{}).textContent || '';
  var icon  = SPARK_ICONS[sparkIconIdx] || '⭐';
  var fechaInicio = (document.getElementById('archFechaInicio')||{}).value || '';
  var fechaFin    = (document.getElementById('archFechaFin')||{}).value || '';
  var notaCierre  = (document.getElementById('archNotaCierre')||{}).value || '';

  var entry = {
    title: title.trim(),
    notes: notes,
    notaCierre: notaCierre.trim(),
    icon: icon,
    fechaInicio: fechaInicio,
    fechaFin: fechaFin,
    minutes: sparkTotalMinutes,
    photos: window._archivePhotos ? window._archivePhotos.slice() : [],
  };
  sparkHistorial.push(entry);
  saveSparkHistorial();
  renderSparkHistorial();

  // Limpiar campo activo
  var titleEl = document.getElementById('sparkTitle');
  var notesEl = document.getElementById('sparkNotes');
  if (titleEl) { titleEl.value = ''; }
  if (notesEl) { notesEl.value = ''; }
  ideas = []; renderIdeas();
  sparkIconIdx = 0;
  var emojiEl = document.getElementById('sparkEmoji');
  if (emojiEl) emojiEl.textContent = SPARK_ICONS[0];
  sparkTotalMinutes = 0; saveSparkTime(); updateSparkTimeDisplay();
  sparkPins = []; saveSparkPins(); renderSparkPins();
  renderSparkDots(0);
  saveSpark();

  window._archivePhotos = [];
  var m = document.querySelector('.spark-arch-modal');
  if (m) m.remove();

  // Pequeño feedback
  var chip = document.getElementById('sparkEmoji');
  if (chip && window.starBurst) starBurst(chip);
};

// Override render to also re-render checkin/spark when week changes
const _origRender = render;
// patch nav buttons to also refresh extra sections
document.getElementById('prevWeek').addEventListener('click', () => { loadCheckin(); renderCheckin(); loadSpark(); });
document.getElementById('nextWeek').addEventListener('click', () => { loadCheckin(); renderCheckin(); loadSpark(); });

loadCheckin();
renderCheckin();
loadSpark();
renderSparkDots(0);
loadSparkPins();
setTimeout(renderSparkCare, 100);
loadSparkTime();
loadSparkHistorial();

// ============================================================
//  SECCIÓN 6 · AGUA & COMIDAS
// ============================================================
const MEALS = [
  { id:'desayuno', icon:'🌅', label:'Desa.' },
  { id:'almuerzo', icon:'☀️', label:'Alm.' },
  { id:'cena',     icon:'🌙', label:'Cena' },
  { id:'snack',    icon:'🍎', label:'Snack' },
];

let waterGoal  = 8;
let waterState = {}; // key: "wo|dayIdx" => count (number)
let foodState  = {}; // key: "wo|dayIdx|mealId" => bool

function wKey(dayIdx) {
  var d = getWeekDates(weekOffset)[dayIdx];
  return 'w_' + dateKey(d);
}
function fKey(dayIdx, mealId) {
  var d = getWeekDates(weekOffset)[dayIdx];
  return 'f_' + dateKey(d) + '_' + mealId;
}

function loadTracker() {
  waterGoal  = window._waterGoal  || parseInt(localStorage.getItem('water_goal') || '8');
  waterState = window._waterState || JSON.parse(localStorage.getItem('water_state') || '{}');
  foodState  = window._foodState  || JSON.parse(localStorage.getItem('food_state')  || '{}');
}

function saveTracker() {
  try { localStorage.setItem('water_goal',  waterGoal); } catch(e){}
  try { localStorage.setItem('water_state', JSON.stringify(waterState)); } catch(e){}
  try { localStorage.setItem('food_state',  JSON.stringify(foodState)); } catch(e){}
  if (window.cloudSave) {
    window.cloudSave('water_goal',  waterGoal);
    window.cloudSave('water_state', waterState);
    window.cloudSave('food_state',  foodState);
  }
}

function changeGoal(delta) {
  waterGoal = Math.max(1, Math.min(16, waterGoal + delta));
  saveTracker();
  renderTracker();
}

function renderTracker() {
  const today = new Date(); today.setHours(0,0,0,0);
  const todayDk = dateKey(today);
  const _gl = document.getElementById('goalLabel'); if (_gl) _gl.textContent = waterGoal + ' vasos';

  // -- WATER (solo hoy)
  const wGrid = document.getElementById('waterGrid');
  if (!wGrid) return;
  wGrid.innerHTML = '';
  {
    const d = today;
    const count = waterState['w_' + todayDk] || 0;
    const col = document.createElement('div');
    col.className = 'water-day-col today-w';
    const wJsDay = d.getDay(); const wRealIdx = wJsDay === 0 ? 6 : wJsDay - 1;
    col.innerHTML = `<div class="water-day-label">${DAYS[wRealIdx]}</div>`;

    const dropsRow = document.createElement('div');
    dropsRow.className = 'water-drops-row';

    for (let i = 1; i <= waterGoal; i++) {
      const btn = document.createElement('button');
      btn.className = 'drop-btn' + (i <= count ? ' filled' : '');
      btn.textContent = '💧';
      btn.title = `${i} vaso${i>1?'s':''}`;
      btn.onclick = () => {
        const cur = waterState['w_' + todayDk] || 0;
        waterState['w_' + todayDk] = (cur === i) ? i - 1 : i;
        saveTracker();
        renderTracker();
      };
      dropsRow.appendChild(btn);
    }
    col.appendChild(dropsRow);

    const countLbl = document.createElement('div');
    countLbl.className = 'water-count';
    countLbl.textContent = `${count}/${waterGoal}`;
    col.appendChild(countLbl);
    wGrid.appendChild(col);
  }

  // -- FOOD (solo hoy)
  const fGrid = document.getElementById('foodGrid');
  if (!fGrid) return;
  fGrid.innerHTML = '';
  {
    const d = today;
    const col = document.createElement('div');
    col.className = 'food-day-col today-f';
    const fJsDay = d.getDay(); const fRealIdx = fJsDay === 0 ? 6 : fJsDay - 1;
    col.innerHTML = `<div class="food-day-label">${DAYS[fRealIdx]}</div>`;

    MEALS.forEach(meal => {
      const key = 'f_' + todayDk + '_' + meal.id;
      const data = foodState[key]; // ahora es objeto o bool
      const eaten = !!data;

      const mealItem = document.createElement('div');
      mealItem.className = 'meal-item';

      const dot = document.createElement('div');
      dot.className = 'meal-dot' + (eaten ? ' eaten' : '');
      dot.textContent = meal.icon;
      dot.title = meal.label;
      dot.onclick = () => foodOpenModal(key, meal);

      const lbl = document.createElement('div');
      lbl.className = 'meal-dot-label';
      lbl.textContent = meal.label;

      // Si tiene hora guardada, mostrarla bajo el label
      if (data && data.hora) {
        const horaLbl = document.createElement('div');
        horaLbl.className = 'meal-dot-label';
        horaLbl.textContent = data.hora;
        mealItem.appendChild(dot);
        mealItem.appendChild(lbl);
        mealItem.appendChild(horaLbl);
      } else {
        mealItem.appendChild(dot);
        mealItem.appendChild(lbl);
      }

      col.appendChild(mealItem);
    });

    fGrid.appendChild(col);
  }
}

// ── Food modal
var _foodModalKey = null;
var _foodModalMeal = null;
const QUALITY_LABELS = { '1':'😬 Poco', '2':'😐 Regular', '3':'🙂 Bien', '4':'😋 Muy bien' };

window.foodOpenModal = function(key, meal) {
  _foodModalKey = key;
  _foodModalMeal = meal;
  const data = foodState[key];
  document.getElementById('foodModalTitle').textContent = meal.icon + ' ' + meal.label;

  if (data && data.eaten) {
    // Tiene datos → mostrar vista lectura
    foodRenderView(data);
    foodSetEditing(false, true);
  } else {
    // Sin datos → ir directo a edición
    foodSetEditing(true, true);
  }
  document.getElementById('foodModalBackdrop').style.display = 'flex';
};

function foodRenderView(data) {
  const hasTexto   = !!(data && data.texto);
  const hasHora    = !!(data && data.hora);
  const hasQuality = !!(data && data.quality);
  const hasAny = hasTexto || hasHora || hasQuality;

  document.getElementById('foodViewEmpty').style.display = hasAny ? 'none' : '';
  document.getElementById('foodViewData').style.display  = hasAny ? '' : 'none';

  document.getElementById('foodViewTextoRow').style.display   = hasTexto ? '' : 'none';
  document.getElementById('foodViewHoraRow').style.display    = hasHora ? '' : 'none';
  document.getElementById('foodViewQualityRow').style.display = hasQuality ? '' : 'none';

  document.getElementById('foodViewTexto').textContent   = data && data.texto   ? data.texto : '';
  document.getElementById('foodViewHora').textContent    = data && data.hora    ? data.hora  : '';
  document.getElementById('foodViewQuality').textContent = data && data.quality ? (QUALITY_LABELS[data.quality] || '') : '';
}

window.foodSetEditing = function(editing, skipPopulate) {
  document.getElementById('foodModalView').style.display   = editing ? 'none' : '';
  document.getElementById('foodModalEdit').style.display   = editing ? '' : 'none';
  document.getElementById('foodModalFooter').style.display = editing ? '' : 'none';
  document.getElementById('foodModalEditBtn').style.display = editing ? 'none' : '';

  if (editing && !skipPopulate) {
    // Populate edit fields from saved data
    const data = foodState[_foodModalKey] || {};
    document.getElementById('foodModalTexto').value = data.texto || '';
    document.getElementById('foodModalHora').value  = data.hora  || '';
    document.getElementById('foodModalQuality').value = data.quality || '';
    document.querySelectorAll('.food-quality-btn').forEach(function(b) {
      b.classList.toggle('active', String(b.dataset.val) === String(data.quality || ''));
    });
    setTimeout(function(){ document.getElementById('foodModalTexto').focus(); }, 150);
  } else if (editing && skipPopulate) {
    // New entry — clear fields
    const data = foodState[_foodModalKey] || {};
    document.getElementById('foodModalTexto').value = data.texto || '';
    document.getElementById('foodModalHora').value  = data.hora  || '';
    document.getElementById('foodModalQuality').value = data.quality || '';
    document.querySelectorAll('.food-quality-btn').forEach(function(b) {
      b.classList.toggle('active', String(b.dataset.val) === String(data.quality || ''));
    });
  }
};

window.foodCloseModal = function() {
  document.getElementById('foodModalBackdrop').style.display = 'none';
  _foodModalKey = null;
  _foodModalMeal = null;
};

window.foodPickQuality = function(val) {
  document.getElementById('foodModalQuality').value = val;
  document.querySelectorAll('.food-quality-btn').forEach(function(b) {
    b.classList.toggle('active', Number(b.dataset.val) === val);
  });
};

window.foodSaveModal = function() {
  if (!_foodModalKey) return;
  const texto   = document.getElementById('foodModalTexto').value.trim();
  const hora    = document.getElementById('foodModalHora').value;
  const quality = document.getElementById('foodModalQuality').value;
  foodState[_foodModalKey] = { eaten: true, texto, hora, quality };
  saveTracker();
  // Volver a vista lectura con datos actualizados
  foodRenderView(foodState[_foodModalKey]);
  foodSetEditing(false);
  renderTracker();
};

// Patch nav buttons for tracker too
document.getElementById('prevWeek').addEventListener('click', () => renderTracker());
document.getElementById('nextWeek').addEventListener('click', () => renderTracker());

loadTracker();
renderTracker();
