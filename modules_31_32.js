// ════════════════════════════════════════════════════════════════
// Yuki 🌸 — modules_31_32.js
// ════════════════════════════════════════════════════════════════


// ============================================================
//  TRACKER DE HÁBITOS
// ============================================================

var habitosData = []; 
// cada hábito: { id, nombre, emoji, completions:{} }
// completions: { 'YYYY-MM-DD': true }

function saveHabitos() {
  try { localStorage.setItem('habitos_data', JSON.stringify(habitosData)); } catch(e){}
  if (window.cloudSave) window.cloudSave('habitos_data', habitosData);
}

function loadHabitos() {
  habitosData = window._habitosData || JSON.parse(localStorage.getItem('habitos_data') || '[]');
}

function dateKey(d) {
  return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');
}

function habitoGetRacha(h) {
  var streak = 0;
  var d = new Date(); d.setHours(0,0,0,0);
  // start from yesterday if not done today, or today if done
  var todayKey = dateKey(d);
  if (!h.completions[todayKey]) { d.setDate(d.getDate()-1); }
  while (true) {
    var k = dateKey(d);
    if (!h.completions[k]) break;
    streak++;
    d.setDate(d.getDate()-1);
  }
  return streak;
}

function habitoGetBestRacha(h) {
  var keys = Object.keys(h.completions).filter(function(k){ return h.completions[k]; }).sort();
  if (!keys.length) return 0;
  var best = 1; var cur = 1;
  for (var i = 1; i < keys.length; i++) {
    var prev = new Date(keys[i-1]); var curr = new Date(keys[i]);
    var diff = (curr - prev) / 86400000;
    if (diff === 1) { cur++; best = Math.max(best, cur); }
    else { cur = 1; }
  }
  return best;
}

function habitoGetPctMes(h) {
  var now = new Date();
  var year = now.getFullYear(); var month = now.getMonth();
  var daysInMonth = new Date(year, month+1, 0).getDate();
  var done = 0;
  for (var d = 1; d <= now.getDate(); d++) {
    var k = year + '-' + String(month+1).padStart(2,'0') + '-' + String(d).padStart(2,'0');
    if (h.completions[k]) done++;
  }
  return Math.round((done / now.getDate()) * 100);
}

function renderHabitos() {
  var list = document.getElementById('habitosList');
  if (!list) return;
  list.innerHTML = '';
  if (!habitosData.length) {
    list.innerHTML = '<div class="habito-empty">Aún no tienes hábitos 🌱<br><span style="font-size:.75rem">¡Crea tu primero!</span></div>';
    return;
  }
  var todayKey = dateKey(new Date());
  habitosData.forEach(function(h, idx) {
    var done = !!h.completions[todayKey];
    var racha = habitoGetRacha(h);
    var best  = habitoGetBestRacha(h);
    var pct   = habitoGetPctMes(h);

    var card = document.createElement('div');
    card.className = 'habito-card';

    // Top row
    var top = document.createElement('div');
    top.className = 'habito-card-top';

    var chk = document.createElement('button');
    chk.className = 'habito-check-btn' + (done ? ' done' : '');
    chk.textContent = done ? '✓' : (h.emoji || '⭐');
    chk.onclick = function() {
      var _wasHabitoDone = !!habitosData[idx].completions[todayKey];
      if (_wasHabitoDone) {
        delete habitosData[idx].completions[todayKey];
      } else {
        habitosData[idx].completions[todayKey] = true;
        if (window.starBurst) window.starBurst(chk);
      }
      saveHabitos(); renderHabitos();
    };

    var info = document.createElement('div');
    info.className = 'habito-info';
    info.innerHTML = '<div class="habito-name">' + (h.emoji ? h.emoji + ' ' : '') + h.nombre + '</div>';

    var stats = document.createElement('div');
    stats.className = 'habito-stats';
    stats.innerHTML =
      '<span class="habito-stat racha">🔥 ' + racha + ' día' + (racha !== 1 ? 's' : '') + '</span>' +
      '<span class="habito-stat">🏆 mejor: ' + best + '</span>' +
      '<span class="habito-stat pct">📅 ' + pct + '% este mes</span>';
    info.appendChild(stats);

    // Progress bar
    var bar = document.createElement('div');
    bar.className = 'habito-progress-bar';
    var fill = document.createElement('div');
    fill.className = 'habito-progress-fill';
    fill.style.width = pct + '%';
    bar.appendChild(fill);

    // Delete btn
    var del = document.createElement('button');
    del.className = 'habito-del-btn';
    del.textContent = '✕';
    del.onclick = function(e) {
      e.stopPropagation();
      if (confirm('¿Eliminar "' + h.nombre + '"?')) {
        habitosData.splice(idx, 1);
        saveHabitos(); renderHabitos();
      }
    };

    top.appendChild(chk);
    top.appendChild(info);
    card.appendChild(top);
    card.appendChild(bar);
    card.appendChild(del);
    list.appendChild(card);
  });
}

window.openHabitoModal = function() {
  var ov = document.createElement('div');
  ov.className = 'habito-modal-overlay';
  ov.innerHTML =
    '<div class="habito-modal">' +
      '<div class="habito-modal-title">✦ Nuevo hábito</div>' +
      '<div class="habito-modal-field">' +
        '<label class="habito-modal-label">Emoji</label>' +
        '<input class="habito-modal-input" id="hModalEmoji" placeholder="🌟" maxlength="4" style="width:70px">' +
      '</div>' +
      '<div class="habito-modal-field">' +
        '<label class="habito-modal-label">Nombre del hábito</label>' +
        '<input class="habito-modal-input" id="hModalNombre" placeholder="Ej: Beber 2L de agua">' +
      '</div>' +
      '<button class="habito-modal-save" id="hModalSave">Guardar hábito</button>' +
    '</div>';

  ov.onclick = function(e) { if (e.target === ov) document.body.removeChild(ov); };
  document.getElementById('hModalSave', ov);
  document.body.appendChild(ov);

  setTimeout(function() {
    var saveBtn = document.getElementById('hModalSave');
    if (saveBtn) saveBtn.onclick = function() {
      var nombre = (document.getElementById('hModalNombre').value || '').trim();
      var emoji  = (document.getElementById('hModalEmoji').value || '').trim();
      if (!nombre) { document.getElementById('hModalNombre').focus(); return; }
      habitosData.push({ id: 'h_' + Date.now(), nombre: nombre, emoji: emoji, completions: {} });
      saveHabitos(); renderHabitos();
      document.body.removeChild(ov);
    };
  }, 50);
};

// Wire add button
document.addEventListener('DOMContentLoaded', function() {
  var btn = document.getElementById('habitoAddBtn');
  if (btn) btn.onclick = window.openHabitoModal;
});

// Init
loadHabitos(); renderHabitos();



// ============================================================
//  SECCIÓN 7 · ALERTAS DE CAMBIO / PLAN B
// ============================================================
const CAMBIO_CARDS = [
  { id:'c1', icon:'⚠️', title:'Alerta de Cambio', desc:'Algo cambió en mi plan. Está bien, puedo adaptarme.', type:'alerta' },
  { id:'c2', icon:'🗺️', title:'Plan B Activo',    desc:'Tengo un plan alternativo listo para usar.', type:'planb' },
  { id:'c3', icon:'😮‍💨', title:'Pausa y Respira', desc:'Necesito un momento antes de continuar.', type:'alerta' },
  { id:'c4', icon:'🔄', title:'Rutina Flexible',  desc:'Hoy el orden puede ser diferente. Está permitido.', type:'planb' },
  { id:'c5', icon:'🆘', title:'Pedir Ayuda',      desc:'Puedo pedir ayuda. No tengo que manejarlo sola.', type:'alerta' },
  { id:'c6', icon:'🧘', title:'Tiempo Fuera',     desc:'Me doy permiso de pausar y recargarme.', type:'planb' },
];

let cambioState   = {}; // key: "wo|dayIdx|cardId" => bool
let cambioCustom  = []; // array of strings (global, not per day)
let cambioDayIdx  = 0; // siempre empieza en el primer día del rango visible

function cambioKey(dayIdx, cardId) {
  const dates = getWeekDates(weekOffset);
  const d = dates[dayIdx];
  if (!d) return `cb_${weekOffset}_${dayIdx}_${cardId}`;
  const dateStr = d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');
  return `cb_${dateStr}_${cardId}`;
}
function cambioKeyToday(cardId) {
  const d = new Date();
  const dateStr = d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');
  return `cb_${dateStr}_${cardId}`;
}

function renderCambio() {
  const sel = document.getElementById('cambioDaySelector');
  if (sel) sel.innerHTML = '';

  const grid = document.getElementById('cambioGrid');
  if (!grid) return;
  grid.innerHTML = '';
  CAMBIO_CARDS.forEach(c => {
    const key = cambioKeyToday(c.id);
    const on = !!cambioState[key];
    const card = document.createElement('div');
    card.className = `cambio-card ${on ? (c.type === 'alerta' ? 'alerta-on' : 'planb-on') : ''}`;
    card.innerHTML = `
      <span class="cambio-badge">${on ? (c.type==='alerta' ? '⚡ activa' : '✓ plan b') : ''}</span>
      <span class="cambio-icon">${c.icon}</span>
      <div class="cambio-title">${c.title}</div>
      <div class="cambio-desc">${c.desc}</div>`;
    card.onclick = () => { cambioState[key] = !on; saveCambio(); renderCambio(); };
    grid.appendChild(card);
  });
  renderCambioCustom();
}
function loadCambio() {
  cambioState  = window._cambioState  || JSON.parse(localStorage.getItem('cambio_state')  || '{}');
  cambioCustom = window._cambioCustom || JSON.parse(localStorage.getItem('cambio_custom') || '[]');
}
function saveCambio() {
  try { localStorage.setItem('cambio_state',  JSON.stringify(cambioState));  } catch(e){}
  try { localStorage.setItem('cambio_custom', JSON.stringify(cambioCustom)); } catch(e){}
  if (window.cloudSave) {
    window.cloudSave('cambio_state',  cambioState);
    window.cloudSave('cambio_custom', cambioCustom);
  }
}


function renderCambioCustom() {
  const list = document.getElementById('cambioList');
  if (!list) return;
  list.innerHTML = '';
  cambioCustom.forEach((text, i) => {
    const pill = document.createElement('div');
    pill.className = 'cambio-custom-pill';
    pill.innerHTML = `<span>🗒️ ${text}</span><button onclick="removeCambio(${i})">✕</button>`;
    list.appendChild(pill);
  });
}

function addCambio() {
  const input = document.getElementById('cambioInput');
  const val = input.value.trim();
  if (!val) return;
  cambioCustom.push(val);
  input.value = '';
  saveCambio(); renderCambioCustom();
}
function removeCambio(i) { cambioCustom.splice(i,1); saveCambio(); renderCambioCustom(); }
var _cambioInp = document.getElementById('cambioInput'); if(_cambioInp) _cambioInp.onkeydown = e => { if(e.key==='Enter') addCambio(); };

// ============================================================
//  SECCIÓN 8 · LOGROS & FORTALEZAS
// ============================================================
let logrosData    = {}; // key: "wo|dayIdx" => [string]
let fortalezas    = [];

const DEFAULT_FORTALEZAS = ['Atención al detalle','Pensamiento profundo','Honestidad','Creatividad única','Memoria especial'];

function loadLogros() {
  logrosData = window._logrosData || JSON.parse(localStorage.getItem('logros_data') || '{}');
  fortalezas = window._fortalezas || JSON.parse(localStorage.getItem('fortalezas')  || 'null') || [...DEFAULT_FORTALEZAS];
}
function saveLogros() {
  try { localStorage.setItem('logros_data', JSON.stringify(logrosData)); } catch(e){}
  try { localStorage.setItem('fortalezas',  JSON.stringify(fortalezas)); } catch(e){}
  if (window.cloudSave) {
    window.cloudSave('logros_data', logrosData);
    window.cloudSave('fortalezas',  fortalezas);
  }
}
function logroKey(dayIdx) { return `lg_${weekOffset}_${dayIdx}`; }
function logroKeyByDate(d) { return `lg_${dateKey(d)}`; }

function renderLogros() {
  const today = new Date(); today.setHours(0,0,0,0);
  const grid  = document.getElementById('logrosGrid');
  if (!grid) return;
  grid.innerHTML = '';

  const key   = logroKeyByDate(today);
  const items = logrosData[key] || [];

  const col = document.createElement('div');
  col.className = 'logro-day-col today-l';
  const lJsDay = today.getDay(); const lRealIdx = lJsDay === 0 ? 6 : lJsDay - 1;
  col.innerHTML = `<div class="logro-dayname">${DAYS[lRealIdx]} ${today.getDate()}</div>`;

  items.forEach((text, i) => {
    const item = document.createElement('div');
    item.className = 'logro-item';
    item.innerHTML = `<span class="logro-item-star">⭐</span>
      <span class="logro-item-text">${text}</span>
      <button class="logro-item-del" onclick="removeLogroToday(${i})">✕</button>`;
    col.appendChild(item);
  });

  const addBtn = document.createElement('button');
  addBtn.className = 'logro-add-btn';
  addBtn.innerHTML = '＋ logro';
  addBtn.onclick = () => startLogroInput(col, addBtn, key);
  col.appendChild(addBtn);
  grid.appendChild(col);

  renderFortalezas();
}

function startLogroInput(col, addBtn, key) {
  addBtn.style.display = 'none';
  const input = document.createElement('input');
  input.className = 'logro-edit-input';
  input.placeholder = '¿Qué hiciste bien hoy? 🌟';
  col.appendChild(input);
  input.focus();
  const commit = () => {
    const val = input.value.trim();
    if (val) {
      if (!logrosData[key]) logrosData[key] = [];
      logrosData[key].push(val);
      saveLogros();
    }
    renderLogros();
  };
  input.onkeydown = e => { if(e.key==='Enter') commit(); if(e.key==='Escape') renderLogros(); };
  input.onblur = commit;
}

function removeLogroToday(i) {
  const today = new Date(); today.setHours(0,0,0,0);
  const key = logroKeyByDate(today);
  if (logrosData[key]) { logrosData[key].splice(i,1); saveLogros(); renderLogros(); }
}

function removeLogro(dayIdx, i) {
  const key = logroKey(dayIdx);
  if (logrosData[key]) { logrosData[key].splice(i,1); saveLogros(); renderLogros(); }
}

function renderFortalezas() {
  const wrap = document.getElementById('fortalezasChips');
  if (!wrap) return;
  wrap.innerHTML = '';
  fortalezas.forEach((f, i) => {
    const chip = document.createElement('div');
    chip.className = 'fortaleza-chip';
    chip.innerHTML = `<span>✨ ${f}</span><button onclick="removeFortaleza(${i})">✕</button>`;
    wrap.appendChild(chip);
  });
}

function addFortaleza() {
  const input = document.getElementById('fortalezaInput');
  const val = input.value.trim();
  if (!val) return;
  fortalezas.push(val); input.value = '';
  saveLogros(); renderFortalezas();
}
function removeFortaleza(i) { fortalezas.splice(i,1); saveLogros(); renderFortalezas(); }
var _fortInp = document.getElementById('fortalezaInput'); if(_fortInp) _fortInp.onkeydown = e => { if(e.key==='Enter') addFortaleza(); };

// ============================================================
//  SECCIÓN 9 · AUTOCUIDADO & CITA
// ============================================================
const RECARGAS = [
  { id:'r1', icon:'🎧', text:'Música con audífonos' },
  { id:'r2', icon:'🛁', text:'Baño largo y tranquilo' },
  { id:'r3', icon:'📖', text:'Leer sin interrupciones' },
  { id:'r4', icon:'🌿', text:'Tiempo en la naturaleza' },
  { id:'r5', icon:'🎨', text:'Crear algo con mis manos' },
  { id:'r6', icon:'😴', text:'Siesta / descanso sin culpa' },
];
const REMINDERS = [
  { id:'rm1', icon:'💧', text:'Tomar agua cada hora' },
  { id:'rm2', icon:'🍽️', text:'Comer a mis horas' },
  { id:'rm3', icon:'🚶', text:'Moverme un poco hoy' },
  { id:'rm4', icon:'🌬️', text:'Respirar profundo' },
  { id:'rm5', icon:'📵', text:'Descanso de pantallas' },
];
const QUOTES = [
  { text: 'Mi cerebro funciona diferente, no defectuoso. Eso es una fortaleza.', author: '- Comunidad neurodivergente' },
  { text: 'No tengo que ser como todos los demás para ser valiosa. Soy suficiente tal como soy.', author: '- Autocompasión neurodivergente' },
  { text: 'Cada pequeño logro del día cuenta. No hay victorias demasiado pequeñas.', author: '- Para ti, hoy' },
  { text: 'Pedir ayuda es inteligente, no debilidad. Conocerme a mí misma es mi superpoder.', author: '- Sabiduría neurodivergente' },
  { text: 'Mis necesidades sensoriales son válidas. Cuidarme es mi prioridad.', author: '- Autocuidado neurodivergente' },
  { text: 'El caos de hoy no define el mañana. Puedo empezar de nuevo en cualquier momento.', author: '- Para días difíciles' },
];

let recargaState  = {};
let reminderState = {};
let quoteIdx      = 0;

function loadCuida() {
  recargaState  = window._recargaState  || JSON.parse(localStorage.getItem(`recarga_${weekOffset}`)  || '{}');
  reminderState = window._reminderState || JSON.parse(localStorage.getItem(`reminder_${weekOffset}`) || '{}');
  quoteIdx = window._quoteIdx !== undefined ? window._quoteIdx : parseInt(localStorage.getItem(`quote_${weekOffset}`) || '0') % QUOTES.length;
}
function saveCuida() {
  try { localStorage.setItem(`recarga_${weekOffset}`,  JSON.stringify(recargaState));  } catch(e){}
  try { localStorage.setItem(`reminder_${weekOffset}`, JSON.stringify(reminderState)); } catch(e){}
  try { localStorage.setItem(`quote_${weekOffset}`, quoteIdx); } catch(e){}
  if (window.cloudSave) {
    window.cloudSave(`recarga_${weekOffset}`,  recargaState);
    window.cloudSave(`reminder_${weekOffset}`, reminderState);
    window.cloudSave(`quote_${weekOffset}`,    quoteIdx);
  }
}

function renderCuida() {
  // Fecha de hoy
  const hoy = new Date();
  const DIAS_ES = ['domingo','lunes','martes','miércoles','jueves','viernes','sábado'];
  const MESES_ES = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
  const fechaEl = document.getElementById('cuidaFecha');
  if (fechaEl) fechaEl.textContent = `📅 ${DIAS_ES[hoy.getDay()]}, ${hoy.getDate()} de ${MESES_ES[hoy.getMonth()]} de ${hoy.getFullYear()}`;

  // Recargas
  const rWrap = document.getElementById('recargaItems');
  if (!rWrap) return;
  rWrap.innerHTML = '';
  RECARGAS.forEach(r => {
    const done = !!recargaState[r.id];
    const el = document.createElement('div');
    el.className = 'recarga-item' + (done ? ' done-r' : '');
    el.innerHTML = `<span class="recarga-icon">${r.icon}</span>
      <span class="recarga-text">${r.text}</span>
      <div class="recarga-check">${done ? '✓' : ''}</div>`;
    el.onclick = () => { recargaState[r.id] = !done; saveCuida(); renderCuida(); };
    rWrap.appendChild(el);
  });

  // Reminders
  const rmWrap = document.getElementById('reminderItems');
  if (!rmWrap) return;
  rmWrap.innerHTML = '';
  REMINDERS.forEach(r => {
    const done = !!reminderState[r.id];
    const el = document.createElement('div');
    el.className = 'reminder-item' + (done ? ' done-rm' : '');
    el.innerHTML = `<span class="reminder-icon">${r.icon}</span>
      <span class="reminder-text">${r.text}</span>
      <div class="reminder-check">${done ? '✓' : ''}</div>`;
    el.onclick = () => { reminderState[r.id] = !done; saveCuida(); renderCuida(); };
    rmWrap.appendChild(el);
  });

  // Quote — filter neurodivergent quotes if user is not neuro
  const _activeQuotes = (window._filteredQuotes && window._filteredQuotes.length) ? window._filteredQuotes : QUOTES;
  const _safeIdx = quoteIdx % _activeQuotes.length;
  const q = _activeQuotes[_safeIdx];
  ['quoteText','quoteTextSemana'].forEach(id => { const el = document.getElementById(id); if(el) el.textContent = q.text; });
  ['quoteAuthor','quoteAuthorSemana'].forEach(id => { const el = document.getElementById(id); if(el) el.textContent = q.author; });
  ['quoteNav','quoteNavSemana'].forEach(navId => {
    const nav = document.getElementById(navId);
    if (!nav) return;
    nav.innerHTML = '';
    _activeQuotes.forEach((_,i) => {
      const dot = document.createElement('div');
      dot.className = 'quote-dot' + (i === _safeIdx ? ' active' : '');
      dot.onclick = () => { quoteIdx = i; saveCuida(); renderCuida(); };
      nav.appendChild(dot);
    });
  });
}

// ============================================================
//  SECCIÓN 10 · LÍNEA DE TIEMPO VISUAL
// ============================================================
let tlDayIdx = 0; // siempre empieza en el primer día del rango visible

const TL_SLOTS = [
  { id:'m', icon:'🌅', name:'Mañana', time:'05-11h', chipCls:'tl-chip-m' },
  { id:'t', icon:'☀️', name:'Tarde',  time:'11-18h', chipCls:'tl-chip-t' },
  { id:'n', icon:'🌙', name:'Noche',  time:'18-22h', chipCls:'tl-chip-n' },
];

function renderTimeline() {
  const today = new Date(); today.setHours(0,0,0,0);

  // Ocultar selector de días (ya no se necesita)
  const sel = document.getElementById('tlDaySelector');
  if (sel) sel.innerHTML = '';

  // Track
  const track = document.getElementById('tlTrack');
  if (!track) return;
  track.innerHTML = '';

  const isToday = true;
  const nowHour = new Date().getHours();
  const date = today;

  let totalTasks = 0, doneTasks = 0;

  TL_SLOTS.forEach(slot => {
    const allTasks = recurringTasks.filter(t => t.slotId === slot.id && taskVisibleOnDate(t, date));

    const slotHour = slot.id === 'm' ? 8 : slot.id === 't' ? 14 : 20;
    const isCurrent = Math.abs(nowHour - slotHour) < 4;
    const isPast    = nowHour > slotHour + 3;

    const slotDone = allTasks.length > 0 && allTasks.every(t => !!completions[completionKey(t.id, date)]);

    totalTasks += allTasks.length;

    const el = document.createElement('div');
    el.className = 'tl-slot' + (slotDone || isPast ? ' tl-done' : '') + (isCurrent ? ' tl-current' : '');

    el.innerHTML = `<div class="tl-node">${slot.icon}</div>
      <div class="tl-slot-header">
        <span class="tl-slot-time">${slot.time}</span>
        <span class="tl-slot-name">${slot.name}</span>
      </div>`;

    const chipsRow = document.createElement('div');
    chipsRow.className = 'tl-tasks-mini';
    allTasks.forEach(task => {
      const cKey = completionKey(task.id, date);
      const done = !!completions[cKey];
      if (done) doneTasks++;
      const chip = document.createElement('div');
      chip.className = `tl-task-chip ${slot.chipCls}` + (done ? ' chip-done' : '');
      chip.innerHTML = `${done ? '✓' : '○'} ${task.text}`;
      chip.style.cursor = 'pointer';
      chip.onclick = () => {
        completions[cKey] = !done;
        saveData(); updateProgress(); renderTimeline();
      };
      chipsRow.appendChild(chip);
    });
    el.appendChild(chipsRow);
    track.appendChild(el);
  });

  const pct = totalTasks > 0 ? Math.round((doneTasks/totalTasks)*100) : 0;
  const _tpf = document.getElementById('tlProgFill'); if (_tpf) _tpf.style.width = pct + '%';
  const stars = pct >= 80 ? '🌟🌟🌟' : pct >= 50 ? '⭐⭐' : pct > 0 ? '⭐' : '';
  const _tps = document.getElementById('tlProgStars'); if (_tps) _tps.textContent = stars + ' ' + pct + '%';
}

// Patch nav for new sections
document.getElementById('prevWeek').addEventListener('click', () => {
  loadCuida(); renderCuida(); renderLogros(); renderCambio();
});
document.getElementById('nextWeek').addEventListener('click', () => {
  loadCuida(); renderCuida(); renderLogros(); renderCambio();
});

loadCambio();   renderCambio();
loadLogros();   renderLogros();
loadCuida();    renderCuida();
renderTimeline();
