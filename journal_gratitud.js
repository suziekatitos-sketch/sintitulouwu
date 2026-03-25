// ════════════════════════════════════════════════════════════════
// Yuki 🌸 — journal_gratitud.js
// ════════════════════════════════════════════════════════════════


// ══════════════════════════════════════════
//  JOURNAL DE AGRADECIMIENTO
// ══════════════════════════════════════════
let gratitudData = {}; // { 'YYYY-MM-DD': ['cosa1','cosa2','cosa3'] }

var _gratitudSaveTimer = null;
function saveGratitud() {
  try { localStorage.setItem('gratitud_data', JSON.stringify(gratitudData)); } catch(e){}
  // Debounce cloud save to avoid re-render while typing
  if (_gratitudSaveTimer) clearTimeout(_gratitudSaveTimer);
  _gratitudSaveTimer = setTimeout(function() {
    if (window.cloudSave) window.cloudSave('gratitud_data', gratitudData);
  }, 1500);
}
function loadGratitud() {
  gratitudData = window._gratitudData || JSON.parse(localStorage.getItem('gratitud_data') || '{}');
}

function renderGratitud() {
  const grid = document.getElementById('gratitudGrid');
  if (!grid) return;
  grid.innerHTML = '';
  const today = new Date(); today.setHours(0,0,0,0);
  const DIAS_ES = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];

  [today].forEach(date => {
    const dk = dateKey(date);
    const isToday = true;
    if (!gratitudData[dk]) gratitudData[dk] = ['','',''];

    const card = document.createElement('div');
    card.className = 'gratitud-day-card' + (isToday ? ' today-cell' : '');

    const dayName = document.createElement('div');
    dayName.className = 'gratitud-day-name';
    dayName.textContent = DIAS_ES[date.getDay()] + ' ' + date.getDate();
    card.appendChild(dayName);

    [0,1,2].forEach(i => {
      const row = document.createElement('div');
      row.className = 'gratitud-item';

      const num = document.createElement('span');
      num.className = 'gratitud-num';
      num.textContent = (i+1) + '.';

      const input = document.createElement('textarea');
      input.className = 'gratitud-input';
      input.rows = 1;
      input.placeholder = i === 0 ? 'Algo lindo de hoy...' : i === 1 ? 'Una persona que me importa...' : 'Algo de mí misma...';
      input.value = gratitudData[dk][i] || '';
      input.oninput = () => {
        input.style.height = 'auto';
        input.style.height = input.scrollHeight + 'px';
        var _prevGrat = gratitudData[dk][i] || '';
        gratitudData[dk][i] = input.value;
        if (!_prevGrat && input.value.trim() && window.starBurst) window.starBurst(input);
        saveGratitud();
      };
      // Auto-resize on render
      setTimeout(() => {
        input.style.height = 'auto';
        input.style.height = input.scrollHeight + 'px';
      }, 0);

      row.appendChild(num);
      row.appendChild(input);
      card.appendChild(row);
    });

    grid.appendChild(card);
  });
}

// ══════════════════════════════════════════
//  TRACKER DE SUEÑO
// ══════════════════════════════════════════
const SUENO_CALIDAD = ['😴','😪','😐','😊','🌟'];
let suenoData = {}; // { 'YYYY-MM-DD': { dormirse:'23:00', despertar:'07:00', calidad:'😊' } }

function savesueno() {
  try { localStorage.setItem('sueno_data', JSON.stringify(suenoData)); } catch(e){}
  if (window.cloudSave) window.cloudSave('sueno_data', suenoData);
}
function loadSueno() {
  suenoData = window._suenoData || JSON.parse(localStorage.getItem('sueno_data') || '{}');
}

function calcHoras(dormirseStr, despertarStr) {
  if (!dormirseStr || !despertarStr) return '';
  const [h1,m1] = dormirseStr.split(':').map(Number);
  const [h2,m2] = despertarStr.split(':').map(Number);
  let mins = (h2*60+m2) - (h1*60+m1);
  if (mins < 0) mins += 24*60;
  const h = Math.floor(mins/60);
  const m = mins % 60;
  return h + 'h ' + (m > 0 ? m + 'min' : '');
}

// Convert 24h "HH:MM" string to 12h display "h:MM AM/PM"
function to12h(timeStr) {
  if (!timeStr) return '';
  const [h, m] = timeStr.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12  = h % 12 === 0 ? 12 : h % 12;
  const mm   = String(m).padStart(2, '0');
  return h12 + ':' + mm + ' ' + ampm;
}

var suenoWeekOffset = 0;

function getSuenoWeekDates(offset) {
  // Use UTC-safe arithmetic to avoid DST bugs
  var now = new Date();
  // Normalize to midnight local time
  var today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  var dow = today.getDay(); // 0=Sun, 1=Mon ... 6=Sat
  // Find this week's Sunday
  var sundayTime = today.getTime() - dow * 86400000;
  // Apply week offset
  sundayTime += offset * 7 * 86400000;
  return Array.from({length:7}, function(_, i) {
    return new Date(sundayTime + i * 86400000);
  });
}

function updateSuenoWeekLabel() {
  var lbl = document.getElementById('suenoWeekLabel');
  if (!lbl) return;
  var dates = getSuenoWeekDates(suenoWeekOffset);
  var first = dates[0]; var last = dates[6];
  var MESES = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
  var str = first.getDate() + ' ' + MESES[first.getMonth()]
    + ' – ' + last.getDate() + ' ' + MESES[last.getMonth()] + ' ' + last.getFullYear();
  // Label semana actual
  if (suenoWeekOffset === 0) str = '📅 Esta semana  (' + str + ')';
  else if (suenoWeekOffset === -1) str = '⬅ Semana pasada  (' + str + ')';
  else str = (suenoWeekOffset < 0 ? '⬅ ' : '➡ ') + str;
  lbl.textContent = str;
  // Disable next if already at current week
  var nextBtn = document.getElementById('suenoWeekNext');
  if (nextBtn) nextBtn.disabled = suenoWeekOffset >= 0;
}

function renderSueno() {
  const grid = document.getElementById('suenoGrid');
  if (!grid) return;
  grid.innerHTML = '';
  updateSuenoWeekLabel();
  const dates = getSuenoWeekDates(suenoWeekOffset);
  const DIAS_ES = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];

  dates.forEach(date => {
    const dk = dateKey(date);
    const isToday = isTodayDate(date);
    if (!suenoData[dk]) suenoData[dk] = { dormirse:'', despertar:'', calidad:'' };
    const entry = suenoData[dk];

    const card = document.createElement('div');
    card.className = 'sueno-day-card' + (isToday ? ' today-cell' : '');

    const dayName = document.createElement('div');
    dayName.className = 'sueno-day-name';
    dayName.textContent = DIAS_ES[date.getDay()] + ' ' + date.getDate();
    card.appendChild(dayName);

    // Dormir
    const fDormir = document.createElement('div');
    fDormir.className = 'sueno-field';
    fDormir.innerHTML = '<span class="sueno-label">🌙 Me dormí</span>';
    const inDormir = document.createElement('input');
    inDormir.type = 'time'; inDormir.className = 'sueno-time-input';
    inDormir.value = entry.dormirse || '';
    inDormir.oninput = inDormir.onchange = () => {
      suenoData[dk].dormirse = inDormir.value;
      savesueno();
      const d12 = to12h(suenoData[dk].dormirse);
      const w12 = to12h(suenoData[dk].despertar);
      const dur = calcHoras(suenoData[dk].dormirse, suenoData[dk].despertar);
      horasEl.textContent = dur ? (d12 + ' → ' + w12 + ' · ' + dur) : '';
      // 🎮 Sueño completo → EXP + flores (solo cuando ambos están llenos y es hoy)
      if (suenoData[dk].dormirse && suenoData[dk].despertar && isToday && !suenoData[dk]._xpSueno) {
        suenoData[dk]._xpSueno = true;
        savesueno();
        if (window.yukiAddXP) window.yukiAddXP(20, 'Sueño');
        if (window.yukiAddSakura) window.yukiAddSakura(5);
        if (window.yukiCheckStreak) window.yukiCheckStreak();
      }
    };
    fDormir.appendChild(inDormir);
    card.appendChild(fDormir);

    // Despertar
    const fDespertar = document.createElement('div');
    fDespertar.className = 'sueno-field';
    fDespertar.innerHTML = '<span class="sueno-label">🌅 Desperté</span>';
    const inDespertar = document.createElement('input');
    inDespertar.type = 'time'; inDespertar.className = 'sueno-time-input';
    inDespertar.value = entry.despertar || '';
    inDespertar.oninput = inDespertar.onchange = () => {
      suenoData[dk].despertar = inDespertar.value;
      savesueno();
      const d12 = to12h(suenoData[dk].dormirse);
      const w12 = to12h(suenoData[dk].despertar);
      const dur = calcHoras(suenoData[dk].dormirse, suenoData[dk].despertar);
      horasEl.textContent = dur ? (d12 + ' → ' + w12 + ' · ' + dur) : '';
      // 🎮 Sueño completo → EXP + flores (solo cuando ambos están llenos y es hoy)
      if (suenoData[dk].dormirse && suenoData[dk].despertar && isToday && !suenoData[dk]._xpSueno) {
        suenoData[dk]._xpSueno = true;
        savesueno();
        if (window.yukiAddXP) window.yukiAddXP(20, 'Sueño');
        if (window.yukiAddSakura) window.yukiAddSakura(5);
        if (window.yukiCheckStreak) window.yukiCheckStreak();
      }
    };
    fDespertar.appendChild(inDespertar);
    card.appendChild(fDespertar);

    // Horas calculadas
    const horasEl = document.createElement('div');
    horasEl.className = 'sueno-horas';
    const d12i = to12h(entry.dormirse);
  const w12i = to12h(entry.despertar);
  const durI = calcHoras(entry.dormirse, entry.despertar);
  horasEl.textContent = durI ? (d12i + ' → ' + w12i + ' · ' + durI) : '';
    card.appendChild(horasEl);

    // Calidad
    const calLabel = document.createElement('div');
    calLabel.className = 'sueno-label';
    calLabel.textContent = '¿Cómo dormí?';
    card.appendChild(calLabel);

    const calidadRow = document.createElement('div');
    calidadRow.className = 'sueno-calidad-row';
    SUENO_CALIDAD.forEach(emoji => {
      const btn = document.createElement('button');
      btn.className = 'sueno-emoji-btn' + (entry.calidad === emoji ? ' selected-calidad' : '');
      btn.textContent = emoji;
      btn.onclick = () => {
        const prev = suenoData[dk].calidad;
        suenoData[dk].calidad = suenoData[dk].calidad === emoji ? '' : emoji;
        savesueno(); renderSueno();
        // 🎮 Calidad registrada por primera vez hoy → +8 EXP +2🌸
        if (!prev && suenoData[dk].calidad && isToday && !suenoData[dk]._xpCalidad) {
          suenoData[dk]._xpCalidad = true;
          savesueno();
          if (window.yukiAddXP) window.yukiAddXP(8, 'Calidad sueño');
          if (window.yukiAddSakura) window.yukiAddSakura(2);
        }
      };
      calidadRow.appendChild(btn);
    });
    card.appendChild(calidadRow);

    grid.appendChild(card);
  });
}

// ── Personalizar experiencia
function configApplyExperience() {
  var neuro = localStorage.getItem('config_neuro') || 'si';

  // Calma page — hide in drawer and page if not neurodivergente
  var pageCalma = document.getElementById('page-calma');
  if (pageCalma) pageCalma.style.display = (neuro === 'no') ? 'none' : '';

  // Hide/show Calma in drawer
  document.querySelectorAll('.drawer-item').forEach(function(btn) {
    if (btn.dataset.page === 'page-calma') {
      btn.style.display = (neuro === 'no') ? 'none' : '';
    }
  });

  // Neurodivergent quotes — filter from QUOTES array if not neuro
  if (typeof QUOTES !== 'undefined') {
    window._filteredQuotes = (neuro === 'no')
      ? QUOTES.filter(function(q) { return !q.author || !q.author.toLowerCase().includes('neurodiv'); })
      : QUOTES;
  }
}


window.configSetNeuro = function(val) {
  localStorage.setItem('config_neuro', val);
  document.querySelectorAll('#configNeuroRow .config-option-btn').forEach(function(b) {
    b.classList.toggle('active', b.dataset.val === val);
  });
  configApplyExperience();
  // If currently on calma and hiding it, go to inicio
  if (val === 'no' && window.activePage === 'page-calma') {
    window.showPage('page-inicio');
  }
};

function configLoadExperience() {
  var neuro = localStorage.getItem('config_neuro') || 'si';
  document.querySelectorAll('#configNeuroRow .config-option-btn').forEach(function(b) {
    b.classList.toggle('active', b.dataset.val === neuro);
  });
}

// ── UNA SOLA TAREA ──────────────────────────────────────
var _utModo = 'escribir';
var _utTareaActiva = null;
var _utTimerTotal = 25 * 60;
var _utTimerLeft  = 25 * 60;
var _utTimerRunning = false;
var _utTimerInterval = null;
var UT_CIRCUMFERENCE = 2 * Math.PI * 88; // ≈ 552.9

// CSS para botones de minutos
(function(){
  var s = document.createElement('style');
  s.textContent = [
    '.ut-min-btn{padding:.3rem .75rem;border-radius:20px;border:1.5px solid var(--border);',
    'background:var(--surface);color:var(--muted);font-family:var(--font-body);',
    'font-size:.72rem;font-weight:700;cursor:pointer;transition:all .15s}',
    '.ut-min-btn.active,.ut-min-btn:hover{background:var(--rosa);border-color:var(--rosa);color:#fff}'
  ].join('');
  document.head.appendChild(s);
})();

window.utSetMinutes = function(min) {
  utTimerStop();
  _utTimerTotal = min * 60;
  _utTimerLeft  = min * 60;
  document.querySelectorAll('.ut-min-btn').forEach(function(b){
    b.classList.toggle('active', b.textContent.trim() === min + ' min');
  });
  utTimerDraw();
};

function utTimerDraw() {
  var arc = document.getElementById('utTimerArc');
  var disp = document.getElementById('utTimerDisplay');
  var status = document.getElementById('utTimerStatus');
  if (!arc || !disp) return;

  var pct = _utTimerTotal > 0 ? _utTimerLeft / _utTimerTotal : 0;
  var offset = UT_CIRCUMFERENCE * (1 - pct);
  arc.style.strokeDashoffset = offset;

  // Color: rosa → naranja → rojo según queda poco
  var color = pct > 0.5 ? 'var(--rosa)' : pct > 0.2 ? '#e8703a' : '#e84040';
  arc.style.stroke = color;

  var m = Math.floor(_utTimerLeft / 60);
  var s = _utTimerLeft % 60;
  disp.textContent = String(m).padStart(2,'0') + ':' + String(s).padStart(2,'0');

  if (status) {
    status.textContent = _utTimerRunning ? 'concentrada 🎯' : (_utTimerLeft === _utTimerTotal ? 'listo' : 'pausado');
  }

  var btn = document.getElementById('utTimerPlayBtn');
  if (btn) btn.textContent = _utTimerRunning ? '⏸ Pausar' : '▶ Iniciar';
}

window.utTimerToggle = function() {
  if (_utTimerRunning) {
    utTimerStop();
  } else {
    if (_utTimerLeft <= 0) { utTimerReset(); return; }
    _utTimerRunning = true;
    document.getElementById('utTimerSetup').style.display = 'none';
    _utTimerInterval = setInterval(function() {
      _utTimerLeft--;
      utTimerDraw();
      if (_utTimerLeft <= 0) {
        utTimerStop();
        utTimerFinish();
      }
    }, 1000);
    utTimerDraw();
  }
};

function utTimerStop() {
  _utTimerRunning = false;
  clearInterval(_utTimerInterval);
  utTimerDraw();
}

window.utTimerReset = function() {
  utTimerStop();
  _utTimerLeft = _utTimerTotal;
  document.getElementById('utTimerSetup').style.display = '';
  utTimerDraw();
};

function utTimerFinish() {
  if (window.starBurst) starBurst(document.getElementById('utTimerSvg'));
  try { new Notification('🌸 Yuki — ¡Tiempo!', { body: '¡Lo lograste! Tómate un respiro 💙' }); } catch(e){}
  document.getElementById('utTimerSetup').style.display = '';
  utTimerDraw();
}


window.utSetModo = function(modo) {
  _utModo = modo;
  var btnE = document.getElementById('utModoEscribir');
  var btnL = document.getElementById('utModoLista');
  var panE = document.getElementById('utPanelEscribir');
  var panL = document.getElementById('utPanelLista');
  if (!btnE) return;
  if (modo === 'escribir') {
    btnE.style.background = 'var(--rosa)'; btnE.style.color = '#fff'; btnE.style.borderColor = 'var(--rosa)';
    btnL.style.background = 'none'; btnL.style.color = 'var(--muted)'; btnL.style.borderColor = 'var(--border)';
    panE.style.display = ''; panL.style.display = 'none';
  } else {
    btnL.style.background = 'var(--rosa)'; btnL.style.color = '#fff'; btnL.style.borderColor = 'var(--rosa)';
    btnE.style.background = 'none'; btnE.style.color = 'var(--muted)'; btnE.style.borderColor = 'var(--border)';
    panL.style.display = ''; panE.style.display = 'none';
    utRenderLista();
  }
};

function utRenderLista() {
  var cont = document.getElementById('utListaTareas');
  if (!cont) return;
  var tareas = JSON.parse(localStorage.getItem('tareas_v2') || '[]');
  var pendientes = tareas.filter(function(t) { return !t.done; });
  if (pendientes.length === 0) {
    cont.innerHTML = '<p style="font-size:.78rem;color:var(--muted);text-align:center;padding:.8rem">No tienes tareas pendientes 🌸</p>';
    return;
  }
  cont.innerHTML = pendientes.map(function(t) {
    return '<button onclick="utIniciarDeLista(\'' + t.id + '\')" style="text-align:left;width:100%;padding:.55rem .8rem;border-radius:10px;border:1.5px solid var(--border);background:var(--surface);color:var(--text);font-family:var(--font-body);font-size:.82rem;font-weight:600;cursor:pointer">' + (t.emoji || '📌') + ' ' + (t.text || t.titulo || '') + '</button>';
  }).join('');
}

window.utIniciar = function() {
  var input = document.getElementById('utInputEscribir');
  if (!input || !input.value.trim()) return;
  utMostrarEnfoque(input.value.trim());
};

window.utIniciarDeLista = function(id) {
  var tareas = JSON.parse(localStorage.getItem('tareas_v2') || '[]');
  var t = tareas.find(function(x) { return x.id === id; });
  if (!t) return;
  utMostrarEnfoque(t.text || t.titulo || '', id);
};

function utMostrarEnfoque(texto, id) {
  _utTareaActiva = { texto: texto, id: id || null };
  document.getElementById('utTareaActual').textContent = texto;
  document.getElementById('utPanelEscribir').style.display = 'none';
  document.getElementById('utPanelLista').style.display = 'none';
  document.getElementById('utModoEscribir').style.display = 'none';
  document.getElementById('utModoLista').style.display = 'none';
  document.getElementById('utPantallaEnfoque').style.display = '';
  // Init timer
  utTimerStop();
  _utTimerTotal = 25 * 60;
  _utTimerLeft  = 25 * 60;
  document.querySelectorAll('.ut-min-btn').forEach(function(b){
    b.classList.toggle('active', b.textContent.trim() === '25 min');
  });
  document.getElementById('utTimerSetup').style.display = '';
  utTimerDraw();
}

window.utCompletar = function() {
  if (_utTareaActiva && _utTareaActiva.id) {
    var tareas = JSON.parse(localStorage.getItem('tareas_v2') || '[]');
    tareas = tareas.map(function(t) { return t.id === _utTareaActiva.id ? Object.assign({}, t, {done: true}) : t; });
    localStorage.setItem('tareas_v2', JSON.stringify(tareas));
  }
  if (window.starBurst) starBurst(document.getElementById('utPantallaEnfoque'));
  utCancelar();
};

window.utCancelar = function() {
  utTimerStop();
  _utTareaActiva = null;
  document.getElementById('utPantallaEnfoque').style.display = 'none';
  document.getElementById('utModoEscribir').style.display = '';
  document.getElementById('utModoLista').style.display = '';
  document.getElementById('utInputEscribir').value = '';
  utSetModo('escribir');
};

// ── PREPARACIÓN PARA EVENTOS ─────────────────────────────
function eventosLoad() { return JSON.parse(localStorage.getItem('eventos_prep') || '[]'); }
function eventosSave(data) { localStorage.setItem('eventos_prep', JSON.stringify(data)); if(window.cloudSave) window.cloudSave('eventos_prep', data); }

window.eventoNuevoModal = function() {
  var old = document.getElementById('eventoModal');
  if (old) old.remove();

  var m = document.createElement('div');
  m.id = 'eventoModal';
  m.style.cssText = 'position:fixed;inset:0;z-index:9000;background:rgba(0,0,0,.55);display:flex;align-items:flex-start;justify-content:center;padding:1rem;overflow-y:auto';
  m.onclick = function(e){ if(e.target===m) eventoModalCerrar(); };

  m.innerHTML = [
    '<div style="background:var(--card);border-radius:20px;padding:1.5rem;max-width:460px;width:100%;margin:auto;box-shadow:0 20px 60px rgba(0,0,0,.3)" onclick="event.stopPropagation()">',
      '<h3 style="font-family:var(--font-title);font-size:1.1rem;color:var(--rosa);margin-bottom:1.1rem">📅 Nuevo evento</h3>',

      '<label style="font-size:.72rem;font-weight:800;color:var(--muted);text-transform:uppercase;letter-spacing:.07em">Nombre del evento</label>',
      '<input id="evNombre" placeholder="Ej: Reunión con el grupo, cita médica…" style="width:100%;box-sizing:border-box;margin:.35rem 0 .9rem;background:var(--surface);border:1.5px solid var(--border);border-radius:10px;padding:.6rem .8rem;font-family:var(--font-body);font-size:.84rem;color:var(--text);outline:none">',

      '<label style="font-size:.72rem;font-weight:800;color:var(--muted);text-transform:uppercase;letter-spacing:.07em">📅 Fecha y hora</label>',
      '<input id="evFecha" type="datetime-local" style="width:100%;box-sizing:border-box;margin:.35rem 0 .9rem;background:var(--surface);border:1.5px solid var(--border);border-radius:10px;padding:.6rem .8rem;font-family:var(--font-body);font-size:.84rem;color:var(--text);outline:none">',

      '<label style="font-size:.72rem;font-weight:800;color:var(--muted);text-transform:uppercase;letter-spacing:.07em">🗒️ ¿Qué va a pasar?</label>',
      '<textarea id="evQueVaApasar" placeholder="Describe lo que va a ocurrir, paso a paso si quieres…" rows="3" style="width:100%;box-sizing:border-box;margin:.35rem 0 .9rem;background:var(--surface);border:1.5px solid var(--border);border-radius:10px;padding:.6rem .8rem;font-family:var(--font-body);font-size:.84rem;color:var(--text);outline:none;resize:vertical"></textarea>',

      '<label style="font-size:.72rem;font-weight:800;color:var(--muted);text-transform:uppercase;letter-spacing:.07em">🚌 ¿Cómo llego?</label>',
      '<textarea id="evComoLlego" placeholder="Transporte, ruta, tiempo estimado…" rows="2" style="width:100%;box-sizing:border-box;margin:.35rem 0 .9rem;background:var(--surface);border:1.5px solid var(--border);border-radius:10px;padding:.6rem .8rem;font-family:var(--font-body);font-size:.84rem;color:var(--text);outline:none;resize:vertical"></textarea>',

      '<label style="font-size:.72rem;font-weight:800;color:var(--muted);text-transform:uppercase;letter-spacing:.07em">🎒 ¿Qué llevar?</label>',
      '<textarea id="evQueLlevar" placeholder="Lista lo que necesitas llevar…" rows="2" style="width:100%;box-sizing:border-box;margin:.35rem 0 .9rem;background:var(--surface);border:1.5px solid var(--border);border-radius:10px;padding:.6rem .8rem;font-family:var(--font-body);font-size:.84rem;color:var(--text);outline:none;resize:vertical"></textarea>',

      '<label style="font-size:.72rem;font-weight:800;color:var(--muted);text-transform:uppercase;letter-spacing:.07em">😰 Posibles situaciones incómodas y cómo manejarlas</label>',
      '<textarea id="evSituaciones" placeholder="Ej: Si hay mucha gente → uso audífonos. Si llego tarde → respiro y entro igual…" rows="3" style="width:100%;box-sizing:border-box;margin:.35rem 0 1.1rem;background:var(--surface);border:1.5px solid var(--border);border-radius:10px;padding:.6rem .8rem;font-family:var(--font-body);font-size:.84rem;color:var(--text);outline:none;resize:vertical"></textarea>',

      '<div style="display:flex;gap:.6rem">',
        '<button onclick="eventoGuardar()" style="flex:1;padding:.65rem;border-radius:12px;border:none;background:var(--rosa);color:#fff;font-family:var(--font-body);font-size:.84rem;font-weight:800;cursor:pointer">Guardar evento</button>',
        '<button onclick="eventoModalCerrar()" style="padding:.65rem 1rem;border-radius:12px;border:1.5px solid var(--border);background:none;color:var(--muted);font-family:var(--font-body);font-size:.84rem;font-weight:700;cursor:pointer">Cancelar</button>',
      '</div>',
    '</div>',
  ].join('');

  document.body.appendChild(m);
  document.body.style.overflow = 'hidden';
};

window.eventoModalCerrar = function() {
  var m = document.getElementById('eventoModal');
  if (m) m.remove();
  document.body.style.overflow = '';
};

window.eventoGuardar = function() {
  var nombre = (document.getElementById('evNombre').value || '').trim();
  if (!nombre) return;
  var evento = {
    id: Date.now().toString(),
    nombre: nombre,
    fecha: document.getElementById('evFecha').value || '',
    queVaApasar: document.getElementById('evQueVaApasar').value || '',
    comoLlego: document.getElementById('evComoLlego').value || '',
    queLlevar: document.getElementById('evQueLlevar').value || '',
    situaciones: document.getElementById('evSituaciones').value || ''
  };
  var m = document.getElementById('eventoModal');
  var data = eventosLoad();
  if (m && m._editId) {
    data = data.map(function(e) { return e.id === m._editId ? Object.assign({}, evento, {id: m._editId}) : e; });
  } else {
    data.push(evento);
  }
  eventosSave(data);
  eventoModalCerrar();
  eventoRender();
};

window.eventoEliminar = function(id) {
  eventosSave(eventosLoad().filter(function(e) { return e.id !== id; }));
  eventoRender();
};

window.eventoExpandir = function(id) {
  var det = document.getElementById('evDetalle_' + id);
  if (det) det.style.display = det.style.display === 'none' ? '' : 'none';
};

function eventoRender() {
  var cont = document.getElementById('eventosList');
  if (!cont) return;
  var data = eventosLoad();
  if (data.length === 0) {
    cont.innerHTML = '<p style="font-size:.78rem;color:var(--muted2);text-align:center;padding:.8rem">Aún no tienes eventos preparados 🌸</p>';
    return;
  }
  data.sort(function(a,b) { return (a.fecha||'').localeCompare(b.fecha||''); });
  cont.innerHTML = data.map(function(e) {
    var fechaStr = '';
    if (e.fecha) { var d = new Date(e.fecha); fechaStr = d.toLocaleDateString('es-MX',{weekday:'short',day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'}); }
    return '<div style="background:var(--card);border-radius:16px;border:1px solid var(--border);overflow:hidden">' +
      '<div onclick="eventoExpandir(\'' + e.id + '\')" style="padding:.85rem 1rem;cursor:pointer;display:flex;align-items:center;justify-content:space-between">' +
        '<div>' +
          '<p style="font-size:.88rem;font-weight:800;color:var(--text);margin-bottom:.2rem">📅 ' + e.nombre + '</p>' +
          (fechaStr ? '<p style="font-size:.7rem;color:var(--muted);font-weight:600">' + fechaStr + '</p>' : '') +
        '</div>' +
        '<span style="color:var(--rosa);font-size:.8rem">▼</span>' +
      '</div>' +
      '<div id="evDetalle_' + e.id + '" style="display:none;padding:.3rem 1rem 1rem;border-top:1px solid var(--border)">' +
        (e.queVaApasar ? '<p style="font-size:.72rem;font-weight:800;color:var(--rosa);margin:.6rem 0 .2rem">🗒️ ¿Qué va a pasar?</p><p style="font-size:.78rem;color:var(--muted);font-weight:600;line-height:1.6;white-space:pre-wrap">' + e.queVaApasar + '</p>' : '') +
        (e.comoLlego ? '<p style="font-size:.72rem;font-weight:800;color:var(--rosa);margin:.6rem 0 .2rem">🚌 ¿Cómo llego?</p><p style="font-size:.78rem;color:var(--muted);font-weight:600;line-height:1.6;white-space:pre-wrap">' + e.comoLlego + '</p>' : '') +
        (e.queLlevar ? '<p style="font-size:.72rem;font-weight:800;color:var(--rosa);margin:.6rem 0 .2rem">🎒 ¿Qué llevar?</p><p style="font-size:.78rem;color:var(--muted);font-weight:600;line-height:1.6;white-space:pre-wrap">' + e.queLlevar + '</p>' : '') +
        (e.situaciones ? '<p style="font-size:.72rem;font-weight:800;color:var(--rosa);margin:.6rem 0 .2rem">😰 Situaciones incómodas</p><p style="font-size:.78rem;color:var(--muted);font-weight:600;line-height:1.6;white-space:pre-wrap">' + e.situaciones + '</p>' : '') +
        '<button onclick="eventoEliminar(\'' + e.id + '\')" style="margin-top:.8rem;padding:.4rem .8rem;border-radius:8px;border:1.5px solid var(--border);background:none;color:var(--muted2);font-family:var(--font-body);font-size:.7rem;font-weight:700;cursor:pointer">🗑️ Eliminar</button>' +
      '</div>' +
    '</div>';
  }).join('');
}

// ── MODO RECUPERACIÓN ────────────────────────────────────
var RECUPER_FRASES = [
  'No tienes que estar bien todavía. Estás a salvo aquí. 💙',
  'Tu sistema nervioso hizo lo que pudo. Eso es suficiente.',
  'Recuperarse no es lineal. Este momento también cuenta.',
  'Mereces descanso sin tener que ganártelo primero.',
  'No hay prisa. El mundo puede esperar un momento.',
  'Eres más fuerte de lo que crees, incluso cuando no lo sientes.',
  'Este momento difícil va a pasar. Ya pasaron otros.',
  'Tu cuerpo y tu mente trabajaron mucho. Dales tiempo.',
  'No tienes que explicarle a nadie lo que sientes. Solo sentirlo.',
  'Pequeños pasos. No tienes que hacer todo hoy. 🌸'
];

var RECUPER_PASOS = [
  { emoji: '💧', texto: 'Tomar un vaso de agua' },
  { emoji: '🫁', texto: 'Tres respiraciones lentas' },
  { emoji: '🛋️', texto: 'Cambiar de posición o lugar' },
  { emoji: '🧦', texto: 'Ponerte algo cómodo' },
  { emoji: '🔕', texto: 'Silenciar notificaciones' },
  { emoji: '🌡️', texto: 'Chequear si tienes frío, calor o hambre' },
  { emoji: '📱', texto: 'Una cosa pequeña solo para ti' }
];

var _recuperFraseIdx = 0;

window.recuperNuevaFrase = function() {
  _recuperFraseIdx = (_recuperFraseIdx + 1) % RECUPER_FRASES.length;
  var el = document.getElementById('recuperFrase');
  if (el) el.textContent = RECUPER_FRASES[_recuperFraseIdx];
};

function recuperRenderPasos() {
  var cont = document.getElementById('recuperPasos');
  if (!cont) return;
  var hecho = JSON.parse(sessionStorage.getItem('recuper_pasos') || '[]');
  cont.innerHTML = RECUPER_PASOS.map(function(p, i) {
    var done = hecho.indexOf(i) > -1;
    return '<div onclick="recuperTogglePaso(' + i + ')" style="display:flex;align-items:center;gap:.7rem;padding:.5rem .7rem;border-radius:10px;background:' + (done ? 'var(--rosa-soft)' : 'var(--surface)') + ';cursor:pointer;transition:background .2s">' +
      '<span style="font-size:1.1rem">' + p.emoji + '</span>' +
      '<span style="font-size:.8rem;font-weight:600;color:' + (done ? 'var(--rosa)' : 'var(--text)') + ';text-decoration:' + (done ? 'line-through' : 'none') + '">' + p.texto + '</span>' +
      (done ? '<span style="margin-left:auto;color:var(--rosa);font-size:.8rem">✓</span>' : '') +
    '</div>';
  }).join('');
}

window.recuperTogglePaso = function(i) {
  var hecho = JSON.parse(sessionStorage.getItem('recuper_pasos') || '[]');
  var idx = hecho.indexOf(i);
  if (idx > -1) hecho.splice(idx, 1); else hecho.push(i);
  sessionStorage.setItem('recuper_pasos', JSON.stringify(hecho));
  recuperRenderPasos();
};

window.recuperGuardarRegistro = function() {
  var que = (document.getElementById('recuperQue').value || '').trim();
  var ayudo = (document.getElementById('recuperAyudo').value || '').trim();
  if (!que && !ayudo) return;
  var key = new Date().toISOString().slice(0,10);
  var data = JSON.parse(localStorage.getItem('recuper_registros') || '{}');
  if (!data[key]) data[key] = [];
  data[key].push({ ts: Date.now(), que: que, ayudo: ayudo });
  localStorage.setItem('recuper_registros', JSON.stringify(data));
  if(window.cloudSave) window.cloudSave('recuper_registros', data);
  document.getElementById('recuperQue').value = '';
  document.getElementById('recuperAyudo').value = '';
  var msg = document.getElementById('recuperGuardadoMsg');
  if (msg) { msg.style.display = ''; setTimeout(function(){ msg.style.display = 'none'; }, 2500); }
};

function recuperInit() {
  var el = document.getElementById('recuperFrase');
  var cont = document.getElementById('recuperPasos');
  if (!el || !cont) {
    // Elementos no en DOM aún, reintentar
    setTimeout(recuperInit, 300);
    return;
  }
  el.textContent = RECUPER_FRASES[Math.floor(Math.random() * RECUPER_FRASES.length)];
  recuperRenderPasos();
}

// ── CESTO DE PENDIENTES OLVIDADOS ────────────────────────
var _cestoOpen = false;

function cestoGetOlvidadas() {
  var ahora = Date.now();
  var tres_dias = 3 * 24 * 60 * 60 * 1000;
  var resultado = [];

  // Fuente 1: tareas_v2 (lista de "Me concentro")
  try {
    var tv2 = JSON.parse(localStorage.getItem('tareas_v2') || '[]');
    tv2.forEach(function(t) {
      if (t.done) return;
      if (!t.createdAt) return;
      var edad = ahora - new Date(t.createdAt).getTime();
      if (edad >= tres_dias) {
        resultado.push({ id: t.id, texto: t.text || t.titulo || '(sin nombre)', emoji: t.emoji || '📌', fuente: 'tareas_v2', edad: edad });
      }
    });
  } catch(e) {}

  // Fuente 2: recurring_tasks con onceDate pasada
  try {
    var rt = JSON.parse(localStorage.getItem('recurring_tasks') || '[]');
    rt.forEach(function(t) {
      if (!t.createdAt) return;
      var edad = ahora - new Date(t.createdAt).getTime();
      if (edad >= tres_dias && t.recurrence === 'once') {
        resultado.push({ id: t.id, texto: t.text || '(sin nombre)', emoji: '📅', fuente: 'recurring', edad: edad });
      }
    });
  } catch(e) {}

  return resultado;
}

function cestoDiasTexto(ms) {
  var dias = Math.floor(ms / (24 * 60 * 60 * 1000));
  return dias === 1 ? 'hace 1 día' : 'hace ' + dias + ' días';
}

window.cestoToggle = function() {
  _cestoOpen = !_cestoOpen;
  var box = document.getElementById('cestoBox');
  var arrow = document.getElementById('cestoArrow');
  if (box) box.style.display = _cestoOpen ? '' : 'none';
  if (arrow) arrow.style.transform = _cestoOpen ? 'rotate(180deg)' : 'rotate(0deg)';
  if (_cestoOpen) cestoRender();
};

window.cestoRescatar = function(id, fuente) {
  if (fuente === 'tareas_v2') {
    var data = JSON.parse(localStorage.getItem('tareas_v2') || '[]');
    data = data.map(function(t) {
      if (t.id !== id) return t;
      return Object.assign({}, t, { createdAt: new Date().toISOString() });
    });
    localStorage.setItem('tareas_v2', JSON.stringify(data));
  } else if (fuente === 'recurring') {
    var rts = JSON.parse(localStorage.getItem('recurring_tasks') || '[]');
    rts = rts.map(function(t) {
      if (t.id !== id) return t;
      return Object.assign({}, t, { createdAt: new Date().toISOString() });
    });
    localStorage.setItem('recurring_tasks', JSON.stringify(rts));
  }
  cestoRender();
  cestoBadgeRender();
};

window.cestoArchivar = function(id, fuente) {
  if (fuente === 'tareas_v2') {
    var data = JSON.parse(localStorage.getItem('tareas_v2') || '[]');
    data = data.filter(function(t) { return t.id !== id; });
    localStorage.setItem('tareas_v2', JSON.stringify(data));
  } else if (fuente === 'recurring') {
    var rts = JSON.parse(localStorage.getItem('recurring_tasks') || '[]');
    rts = rts.filter(function(t) { return t.id !== id; });
    localStorage.setItem('recurring_tasks', JSON.stringify(rts));
  }
  cestoRender();
  cestoBadgeRender();
};

function cestoRender() {
  var cont = document.getElementById('cestoList');
  if (!cont) return;
  var items = cestoGetOlvidadas();
  if (!items.length) {
    cont.innerHTML = '<div style="text-align:center;padding:1.2rem;font-size:.78rem;color:var(--muted2);font-weight:600">¡El cesto está vacío! Todas tus tareas están al día 🌟</div>';
    return;
  }
  cont.innerHTML = items.map(function(t) {
    return '<div style="background:var(--card);border-radius:14px;padding:.8rem 1rem;border:1px solid var(--border);display:flex;align-items:center;gap:.7rem">' +
      '<span style="font-size:1.1rem">' + t.emoji + '</span>' +
      '<div style="flex:1">' +
        '<p style="font-size:.82rem;font-weight:700;color:var(--text);margin-bottom:.2rem">' + t.texto + '</p>' +
        '<p style="font-size:.68rem;color:var(--muted2);font-weight:600">' + cestoDiasTexto(t.edad) + '</p>' +
      '</div>' +
      '<button onclick="cestoRescatar(\'' + t.id + '\',\'' + t.fuente + '\')" title="Volver a la lista" style="background:var(--rosa-soft);border:none;border-radius:8px;padding:.3rem .6rem;cursor:pointer;font-size:.72rem;font-weight:800;color:var(--rosa)">↩ Retomar</button>' +
      '<button onclick="cestoArchivar(\'' + t.id + '\',\'' + t.fuente + '\')" title="Eliminar" style="background:none;border:none;cursor:pointer;color:var(--muted2);font-size:.8rem;padding:.2rem .4rem">✕</button>' +
    '</div>';
  }).join('');
}

function cestoBadgeRender() {
  var badge = document.getElementById('cestoBadge');
  if (!badge) return;
  var n = cestoGetOlvidadas().length;
  if (n === 0) { badge.style.display = 'none'; return; }
  badge.style.display = '';
  badge.innerHTML = '<span style="font-size:.72rem;font-weight:800;color:var(--muted);background:var(--surface);border-radius:20px;padding:.2rem .7rem;border:1px solid var(--border)">' + n + ' tarea' + (n !== 1 ? 's' : '') + ' esperando 🧺</span>';
}

// Init al cargar Tareas
var _origShowForCesto = window.showPage;
window.showPage = function(p) {
  if (_origShowForCesto) _origShowForCesto(p);
  if (p === 'page-tareas') setTimeout(cestoBadgeRender, 300);
};

// ── TRANSICIONES ─────────────────────────────────────────
function transLoad() { try { return JSON.parse(localStorage.getItem('trans_data') || '[]'); } catch(e) { return []; } }
function transSave(d) { localStorage.setItem('trans_data', JSON.stringify(d)); if(window.cloudSave) window.cloudSave('trans_data', d); }

window.transNueva = function() {
  var old = document.getElementById('transModal');
  if (old) old.remove();

  var today = new Date().toTimeString().slice(0,5);

  var m = document.createElement('div');
  m.id = 'transModal';
  m.style.cssText = 'position:fixed;inset:0;z-index:9000;background:rgba(0,0,0,.5);display:flex;align-items:flex-start;justify-content:center;padding:1rem;overflow-y:auto';
  m.onclick = function(e){ if(e.target===m) transModalCerrar(); };

  m.innerHTML = [
    '<div style="background:var(--card);border-radius:20px;padding:1.5rem;max-width:420px;width:100%;margin:auto;box-shadow:0 20px 60px rgba(0,0,0,.3)" onclick="event.stopPropagation()">',
      '<h3 style="font-family:var(--font-title);font-size:1.05rem;color:var(--rosa);margin-bottom:1.1rem;font-style:italic">🔄 Nueva transición</h3>',

      '<label style="font-size:.7rem;font-weight:800;color:var(--muted);text-transform:uppercase;letter-spacing:.07em">Actividad actual</label>',
      '<input id="transActual" placeholder="Ej: Leer, estudiar, ver series…" style="width:100%;box-sizing:border-box;margin:.3rem 0 .9rem;background:var(--surface);border:1.5px solid var(--border);border-radius:10px;padding:.6rem .8rem;font-family:var(--font-body);font-size:.84rem;color:var(--text);outline:none">',

      '<label style="font-size:.7rem;font-weight:800;color:var(--muted);text-transform:uppercase;letter-spacing:.07em">Actividad siguiente</label>',
      '<input id="transSiguiente" placeholder="Ej: Cocinar, estudiar, dormir…" style="width:100%;box-sizing:border-box;margin:.3rem 0 .9rem;background:var(--surface);border:1.5px solid var(--border);border-radius:10px;padding:.6rem .8rem;font-family:var(--font-body);font-size:.84rem;color:var(--text);outline:none">',

      '<label style="font-size:.7rem;font-weight:800;color:var(--muted);text-transform:uppercase;letter-spacing:.07em">Hora del cambio</label>',
      '<input id="transHora" type="time" value="'+today+'" style="width:100%;box-sizing:border-box;margin:.3rem 0 1.1rem;background:var(--surface);border:1.5px solid var(--border);border-radius:10px;padding:.6rem .8rem;font-family:var(--font-body);font-size:.84rem;color:var(--text);outline:none">',

      '<div style="background:var(--rosa-soft);border-radius:10px;padding:.7rem .9rem;margin-bottom:1.1rem">',
        '<p style="font-size:.72rem;font-weight:700;color:var(--rosa);margin-bottom:.2rem">🔔 Recibirás un aviso:</p>',
        '<p id="transPreview" style="font-size:.76rem;font-weight:600;color:var(--muted);line-height:1.5">— completa los campos para ver el aviso —</p>',
      '</div>',

      '<div style="display:flex;gap:.6rem">',
        '<button onclick="transGuardar()" style="flex:1;padding:.65rem;border-radius:12px;border:none;background:var(--rosa);color:#fff;font-family:var(--font-body);font-size:.84rem;font-weight:800;cursor:pointer">Guardar</button>',
        '<button onclick="transModalCerrar()" style="padding:.65rem 1rem;border-radius:12px;border:1.5px solid var(--border);background:none;color:var(--muted);font-family:var(--font-body);font-size:.84rem;font-weight:700;cursor:pointer">Cancelar</button>',
      '</div>',
    '</div>',
  ].join('');

  document.body.appendChild(m);
  document.body.style.overflow = 'hidden';

  // Live preview
  ['transActual','transSiguiente','transHora'].forEach(function(id){
    var el = document.getElementById(id);
    if(el) el.oninput = transUpdatePreview;
  });
  transUpdatePreview();
};

function transUpdatePreview() {
  var actual = (document.getElementById('transActual').value||'').trim();
  var sig    = (document.getElementById('transSiguiente').value||'').trim();
  var hora   = document.getElementById('transHora').value||'';
  var prev   = document.getElementById('transPreview');
  if(!prev) return;
  if(!actual || !sig || !hora) { prev.textContent='— completa los campos para ver el aviso —'; return; }
  // Calcular hora del aviso (10 min antes)
  var parts = hora.split(':');
  var d = new Date(); d.setHours(parseInt(parts[0]), parseInt(parts[1])-10, 0);
  var hh = String(d.getHours()).padStart(2,'0');
  var mm = String(d.getMinutes()).padStart(2,'0');
  prev.textContent = 'A las ' + hh + ':' + mm + ' — "En 10 minutos vas a terminar de ' + actual.toLowerCase() + ' y empezarás a ' + sig.toLowerCase() + '"';
}

window.transModalCerrar = function() {
  var m = document.getElementById('transModal');
  if (m) m.remove();
  document.body.style.overflow = '';
};

window.transGuardar = function() {
  var actual = (document.getElementById('transActual').value||'').trim();
  var sig    = (document.getElementById('transSiguiente').value||'').trim();
  var hora   = document.getElementById('transHora').value||'';
  if(!actual || !sig || !hora) return;
  var data = transLoad();
  var hoy = new Date().toISOString().slice(0,10);
  data.push({ id: Date.now().toString(), actual: actual, siguiente: sig, hora: hora, fecha: hoy, fired10: false, firedChange: false });
  transSave(data);
  transModalCerrar();
  transRender();
};

window.transEliminar = function(id) {
  transSave(transLoad().filter(function(t){ return t.id!==id; }));
  transRender();
};

function transHoraAviso(hora) {
  var parts = hora.split(':');
  var d = new Date(); d.setHours(parseInt(parts[0]), parseInt(parts[1])-10, 0);
  return String(d.getHours()).padStart(2,'0') + ':' + String(d.getMinutes()).padStart(2,'0');
}

function transRender() {
  var cont = document.getElementById('transList'); if(!cont) return;
  var hoy = new Date().toISOString().slice(0,10);
  var data = transLoad().filter(function(t){ return t.fecha === hoy; });
  if(!data.length) {
    cont.innerHTML = '<p style="font-size:.78rem;color:var(--muted2);text-align:center;padding:1rem;font-weight:600">No hay transiciones para hoy 🌸<br><span style="font-size:.72rem">Añade una arriba para que te avisemos</span></p>';
    return;
  }
  var ahora = new Date();
  var nowStr = String(ahora.getHours()).padStart(2,'0') + ':' + String(ahora.getMinutes()).padStart(2,'0');
  cont.innerHTML = data.map(function(t) {
    var pasada = t.hora <= nowStr;
    var avisoHora = transHoraAviso(t.hora);
    return '<div style="background:var(--card);border-radius:16px;padding:1rem 1.1rem;border:1.5px solid ' + (pasada ? 'var(--border)' : 'var(--rosa)') + ';opacity:' + (pasada ? '.6' : '1') + '">' +
      '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:.6rem">' +
        '<div style="display:flex;align-items:center;gap:.5rem">' +
          '<span style="font-size:.72rem;font-weight:800;background:var(--rosa-soft);color:var(--rosa);padding:.2rem .6rem;border-radius:20px">⏰ ' + t.hora + '</span>' +
          (pasada ? '<span style="font-size:.68rem;color:var(--muted2);font-weight:700">completada</span>' : '<span style="font-size:.68rem;color:var(--rosa);font-weight:700">activa</span>') +
        '</div>' +
        '<button onclick="transEliminar(\'' + t.id + '\')" style="background:none;border:none;cursor:pointer;color:var(--muted2);font-size:.8rem">✕</button>' +
      '</div>' +
      '<div style="display:flex;align-items:center;gap:.5rem;flex-wrap:wrap">' +
        '<span style="font-size:.82rem;font-weight:700;color:var(--text)">' + t.actual + '</span>' +
        '<span style="color:var(--rosa);font-size:.9rem">→</span>' +
        '<span style="font-size:.82rem;font-weight:700;color:var(--text)">' + t.siguiente + '</span>' +
      '</div>' +
      '<p style="font-size:.7rem;color:var(--muted2);font-weight:600;margin-top:.4rem">🔔 Aviso a las ' + avisoHora + ' (10 min antes)</p>' +
    '</div>';
  }).join('');
}

// Verificar transiciones cada minuto
setInterval(function() {
  if(typeof Notification === 'undefined' || Notification.permission !== 'granted') return;
  var hoy = new Date().toISOString().slice(0,10);
  var ahora = new Date();
  var nowStr = String(ahora.getHours()).padStart(2,'0') + ':' + String(ahora.getMinutes()).padStart(2,'0');
  var data = transLoad();
  var changed = false;
  data.forEach(function(t) {
    if(t.fecha !== hoy) return;
    // Aviso 10 min antes
    var aviso10 = transHoraAviso(t.hora);
    if(!t.fired10 && nowStr === aviso10) {
      t.fired10 = true; changed = true;
      try { new Notification('🔄 Yuki — Transición en 10 minutos', {
        body: 'En 10 minutos vas a terminar de ' + t.actual.toLowerCase() + ' y empezarás a ' + t.siguiente.toLowerCase() + ' 🌸',
        tag: 'trans10_' + t.id
      }); } catch(e) {}
    }
    // Aviso al momento del cambio
    if(!t.firedChange && nowStr === t.hora) {
      t.firedChange = true; changed = true;
      try { new Notification('🔄 Yuki — ¡Hora de cambiar!', {
        body: 'Es momento de pasar de ' + t.actual.toLowerCase() + ' a ' + t.siguiente.toLowerCase() + ' 💙',
        tag: 'transChange_' + t.id
      }); } catch(e) {}
    }
  });
  if(changed) { transSave(data); transRender(); }
}, 60000);

// Hook showPage
var _origShowTrans = window.showPage;
window.showPage = function(p) {
  if(_origShowTrans) _origShowTrans(p);
  if(p === 'page-transiciones') setTimeout(transRender, 200);
};

window.toggleSueno = function() {
  var col = document.getElementById('suenoCollapsible');
  var icon = document.getElementById('suenoToggleIcon');
  if (!col) return;
  var open = col.style.display !== 'none';
  col.style.display = open ? 'none' : '';
  if (icon) icon.style.transform = open ? '' : 'rotate(180deg)';
  // Wire up nav buttons on first open
  if (!open) {
    var prev = document.getElementById('suenoWeekPrev');
    var next = document.getElementById('suenoWeekNext');
    if (prev && !prev._wired) {
      prev._wired = true;
      prev.onclick = function() { suenoWeekOffset--; renderSueno(); };
    }
    if (next && !next._wired) {
      next._wired = true;
      next.onclick = function() { if(suenoWeekOffset < 0){ suenoWeekOffset++; renderSueno(); } };
    }
  }
};

// Wire nav buttons also on page load in case collapsible is opened programmatically
document.addEventListener('DOMContentLoaded', function() {
  var prev = document.getElementById('suenoWeekPrev');
  var next = document.getElementById('suenoWeekNext');
  if (prev) prev.onclick = function() { suenoWeekOffset--; renderSueno(); };
  if (next) next.onclick = function() { if(suenoWeekOffset < 0){ suenoWeekOffset++; renderSueno(); } };
});

// ══════════════════════════════════════════
//  TRACKER DE MENSTRUACIÓN
// ══════════════════════════════════════════
let mensData = {}; // { lastDate, dias: { 'YYYY-MM-DD': { flujo, sintomas:[], nota } } }

function saveMens() {
  try { localStorage.setItem('mens_data', JSON.stringify(mensData)); } catch(e){}
  if (window.cloudSave) window.cloudSave('mens_data', mensData);
}
function loadMens() {
  var raw = window._mensData || JSON.parse(localStorage.getItem('mens_data') || '{}');
  // migrar formato viejo (solo lastDate)
  if (raw && raw.lastDate !== undefined && !raw.dias) {
    mensData = { lastDate: raw.lastDate, dias: {} };
  } else {
    mensData = raw || { lastDate: null, dias: {} };
  }
  if (!mensData.dias) mensData.dias = {};
}

const MENS_SINTOMAS = [
  '😣 Cólicos','🤕 Dolor de cabeza','😮‍💨 Cansancio','😤 Irritabilidad',
  '🫠 Hinchazón','🤢 Náuseas','💤 Mucho sueño','😰 Ansiedad',
  '🍫 Antojos','🥶 Escalofríos','💪 Dolor de espalda','😢 Tristeza'
];
const MENS_FLUJO = ['🔴 Abundante','🩸 Moderado','🩷 Ligero','🤏 Manchado','⚪ Ninguno'];

function renderMens() {
  const card = document.getElementById('mensCard');
  if (!card) return;
  card.innerHTML = '';

  const today = new Date();
  const todayDk = dateKey(today);
  const lastDate = mensData.lastDate ? new Date(mensData.lastDate + 'T12:00:00') : null;
  const daysSince = lastDate ? Math.floor((today - lastDate) / 86400000) : null;
  const MESES_ES = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
  const todayEntry = mensData.dias[todayDk] || {};

  // ── Header: días desde último periodo + botón marcar hoy
  const header = document.createElement('div');
  header.className = 'mens-header';

  const drop = document.createElement('div');
  drop.className = 'mens-drop' + (lastDate ? ' active' : '');
  drop.textContent = '🩸';
  drop.title = 'Marcar hoy como inicio de periodo';
  drop.onclick = () => {
    kittyConfirm('¿Marcar hoy como inicio de tu periodo?', function() {
      mensData.lastDate = todayDk;
      saveMens(); renderMens();
    });
  };

  const info = document.createElement('div');
  info.className = 'mens-info';
  const title = document.createElement('div');
  title.className = 'mens-title';
  title.textContent = 'Último periodo';
  const dateLabel = document.createElement('div');
  dateLabel.className = 'mens-date-label';
  dateLabel.textContent = lastDate
    ? `${lastDate.getDate()} de ${MESES_ES[lastDate.getMonth()]} — día ${daysSince}`
    : 'Toca 🩸 para marcar la fecha';
  info.appendChild(title);
  info.appendChild(dateLabel);
  header.appendChild(drop);
  header.appendChild(info);

  if (daysSince !== null) {
    const daysEl = document.createElement('div');
    daysEl.style.cssText = 'text-align:right;flex-shrink:0';
    const num = document.createElement('div');
    num.className = 'mens-days-since';
    num.textContent = daysSince;
    const lbl = document.createElement('div');
    lbl.className = 'mens-days-label';
    lbl.textContent = 'días';
    daysEl.appendChild(num);
    daysEl.appendChild(lbl);
    header.appendChild(daysEl);
  }
  card.appendChild(header);

  // ── Registro del día de hoy
  const todaySection = document.createElement('div');
  todaySection.style.cssText = 'margin-top:.9rem;border-top:1px solid var(--border);padding-top:.9rem';

  const todayTitle = document.createElement('div');
  todayTitle.style.cssText = 'font-size:.7rem;font-weight:800;color:var(--muted);text-transform:uppercase;letter-spacing:.06em;margin-bottom:.6rem';
  todayTitle.textContent = '📋 Registro de hoy';
  todaySection.appendChild(todayTitle);

  // Flujo
  const flujoLabel = document.createElement('div');
  flujoLabel.style.cssText = 'font-size:.72rem;font-weight:700;color:var(--text);margin-bottom:.35rem';
  flujoLabel.textContent = 'Flujo';
  todaySection.appendChild(flujoLabel);

  const flujoRow = document.createElement('div');
  flujoRow.style.cssText = 'display:flex;flex-wrap:wrap;gap:.35rem;margin-bottom:.8rem';
  MENS_FLUJO.forEach(function(f) {
    var btn = document.createElement('button');
    var isActive = todayEntry.flujo === f;
    btn.style.cssText = 'padding:.3rem .65rem;border-radius:20px;border:1.5px solid '+(isActive?'var(--rosa)':'var(--border)')+';background:'+(isActive?'var(--rosa-soft)':'var(--surface)')+';font-family:var(--font-body);font-size:.72rem;font-weight:700;color:'+(isActive?'var(--rosa)':'var(--muted)')+';cursor:pointer';
    btn.textContent = f;
    btn.onclick = function() {
      if (!mensData.dias[todayDk]) mensData.dias[todayDk] = {};
      mensData.dias[todayDk].flujo = (mensData.dias[todayDk].flujo === f) ? null : f;
      saveMens(); renderMens();
    };
    flujoRow.appendChild(btn);
  });
  todaySection.appendChild(flujoRow);

  // Síntomas
  const sinLabel = document.createElement('div');
  sinLabel.style.cssText = 'font-size:.72rem;font-weight:700;color:var(--text);margin-bottom:.35rem';
  sinLabel.textContent = 'Síntomas';
  todaySection.appendChild(sinLabel);

  const sinRow = document.createElement('div');
  sinRow.style.cssText = 'display:flex;flex-wrap:wrap;gap:.35rem;margin-bottom:.8rem';
  var activeSins = (todayEntry.sintomas || []);
  MENS_SINTOMAS.forEach(function(s) {
    var isActive = activeSins.indexOf(s) > -1;
    var btn = document.createElement('button');
    btn.style.cssText = 'padding:.3rem .65rem;border-radius:20px;border:1.5px solid '+(isActive?'#c0556a':'var(--border)')+';background:'+(isActive?'rgba(192,85,106,.12)':'var(--surface)')+';font-family:var(--font-body);font-size:.7rem;font-weight:700;color:'+(isActive?'#c0556a':'var(--muted)')+';cursor:pointer';
    btn.textContent = s;
    btn.onclick = function() {
      if (!mensData.dias[todayDk]) mensData.dias[todayDk] = {};
      if (!mensData.dias[todayDk].sintomas) mensData.dias[todayDk].sintomas = [];
      var idx = mensData.dias[todayDk].sintomas.indexOf(s);
      if (idx > -1) mensData.dias[todayDk].sintomas.splice(idx, 1);
      else mensData.dias[todayDk].sintomas.push(s);
      saveMens(); renderMens();
    };
    sinRow.appendChild(btn);
  });
  todaySection.appendChild(sinRow);

  // Nota del día
  const notaLabel = document.createElement('div');
  notaLabel.style.cssText = 'font-size:.72rem;font-weight:700;color:var(--text);margin-bottom:.35rem';
  notaLabel.textContent = '📝 Nota del día';
  todaySection.appendChild(notaLabel);

  const notaInput = document.createElement('textarea');
  notaInput.style.cssText = 'width:100%;box-sizing:border-box;border:1.5px solid var(--border);border-radius:10px;padding:.5rem .7rem;font-family:var(--font-body);font-size:.82rem;color:var(--text);background:var(--surface);outline:none;resize:none;min-height:60px';
  notaInput.placeholder = 'Cómo te sientes hoy, algo que quieras recordar...';
  notaInput.value = todayEntry.nota || '';
  notaInput.oninput = function() {
    if (!mensData.dias[todayDk]) mensData.dias[todayDk] = {};
    mensData.dias[todayDk].nota = notaInput.value;
    saveMens();
  };
  notaInput.onfocus = function() { notaInput.style.borderColor = 'var(--rosa)'; };
  notaInput.onblur = function() { notaInput.style.borderColor = 'var(--border)'; };
  todaySection.appendChild(notaInput);
  card.appendChild(todaySection);

  // ── Calendario desplegable
  const calWrap = document.createElement('div');
  calWrap.style.cssText = 'margin-top:.9rem;border-top:1px solid var(--border);padding-top:.7rem';

  const calToggle = document.createElement('button');
  calToggle.style.cssText = 'width:100%;display:flex;align-items:center;justify-content:space-between;background:none;border:none;cursor:pointer;font-family:var(--font-body);font-size:.72rem;font-weight:800;color:var(--muted);text-transform:uppercase;letter-spacing:.06em;padding:.1rem 0';
  var calOpen = false;
  calToggle.innerHTML = '<span>📅 Calendario del ciclo</span><span id="mensCalChevron" style="transition:transform .25s;display:inline-block">›</span>';
  calToggle.onclick = function() {
    calOpen = !calOpen;
    calBody.style.display = calOpen ? '' : 'none';
    document.getElementById('mensCalChevron').style.transform = calOpen ? 'rotate(90deg)' : 'rotate(0deg)';
    if (calOpen) renderMensCal(calBody);
  };
  calWrap.appendChild(calToggle);

  const calBody = document.createElement('div');
  calBody.style.display = 'none';
  calBody.style.marginTop = '.7rem';
  calWrap.appendChild(calBody);
  card.appendChild(calWrap);

  // Borrar registro
  if (mensData.lastDate) {
    const clearBtn = document.createElement('button');
    clearBtn.className = 'mens-clear-btn';
    clearBtn.textContent = 'Borrar fecha de último periodo';
    clearBtn.onclick = () => {
      kittyConfirm('¿Borrar el registro del periodo?', function() {
        mensData.lastDate = null;
        saveMens(); renderMens();
      });
    };
    card.appendChild(clearBtn);
  }
}

function renderMensCal(container) {
  container.innerHTML = '';
  var now = new Date();
  var year = now.getFullYear(), month = now.getMonth();
  var MESES_ES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  var DIAS_ES = ['L','M','X','J','V','S','D'];

  // Nav
  var nav = document.createElement('div');
  nav.style.cssText = 'display:flex;align-items:center;justify-content:space-between;margin-bottom:.6rem';
  var prevBtn = document.createElement('button');
  prevBtn.textContent = '‹';
  prevBtn.style.cssText = 'background:none;border:none;font-size:1.1rem;cursor:pointer;color:var(--muted);padding:.2rem .4rem';
  var nextBtn = document.createElement('button');
  nextBtn.textContent = '›';
  nextBtn.style.cssText = prevBtn.style.cssText;
  var monthLabel = document.createElement('span');
  monthLabel.style.cssText = 'font-size:.82rem;font-weight:800;color:var(--text)';

  function buildCal(y, m) {
    monthLabel.textContent = MESES_ES[m] + ' ' + y;
    var grid = container.querySelector('.mens-cal-grid');
    if (grid) grid.remove();
    grid = document.createElement('div');
    grid.className = 'mens-cal-grid';
    grid.style.cssText = 'display:grid;grid-template-columns:repeat(7,1fr);gap:3px';

    DIAS_ES.forEach(function(d) {
      var h = document.createElement('div');
      h.style.cssText = 'text-align:center;font-size:.58rem;font-weight:800;color:var(--muted);padding:.2rem 0';
      h.textContent = d;
      grid.appendChild(h);
    });

    var first = new Date(y, m, 1);
    var startDow = first.getDay(); // 0=Dom
    var offset = startDow === 0 ? 6 : startDow - 1;
    for (var i=0; i<offset; i++) {
      grid.appendChild(document.createElement('div'));
    }
    var daysInMonth = new Date(y, m+1, 0).getDate();
    for (var day=1; day<=daysInMonth; day++) {
      var dk = y+'-'+String(m+1).padStart(2,'0')+'-'+String(day).padStart(2,'0');
      var entry = mensData.dias[dk] || {};
      var isToday = dk === dateKey(new Date());
      var isLast = mensData.lastDate === dk;
      var hasSin = entry.sintomas && entry.sintomas.length > 0;
      var hasFlujo = !!entry.flujo;

      var cell = document.createElement('div');
      cell.style.cssText = 'text-align:center;border-radius:8px;padding:.3rem .1rem;cursor:pointer;font-size:.72rem;font-weight:700;position:relative;' +
        (isToday ? 'background:var(--rosa-soft);color:var(--rosa);' : isLast ? 'background:rgba(192,85,106,.2);color:#c0556a;' : 'color:var(--text);') ;
      cell.textContent = day;

      // Indicadores
      if (hasFlujo || hasSin || entry.nota) {
        var dot = document.createElement('div');
        dot.style.cssText = 'width:4px;height:4px;border-radius:50%;background:'+(hasFlujo?'#c0556a':'var(--muted)')+';margin:1px auto 0';
        cell.appendChild(dot);
      }
      if (isLast) { cell.textContent = '🩸'; }

      cell.onclick = function(dk2) { return function() { mensDayDetail(dk2, container); }; }(dk);
      grid.appendChild(cell);
    }
    container.appendChild(grid);
  }

  prevBtn.onclick = function() { month--; if(month<0){month=11;year--;} buildCal(year,month); };
  nextBtn.onclick = function() { month++; if(month>11){month=0;year++;} buildCal(year,month); };
  nav.appendChild(prevBtn);
  nav.appendChild(monthLabel);
  nav.appendChild(nextBtn);
  container.appendChild(nav);
  buildCal(year, month);
}

function mensDayDetail(dk, container) {
  var existing = container.querySelector('.mens-day-detail');
  if (existing) existing.remove();
  var entry = mensData.dias[dk] || {};
  if (!entry.flujo && (!entry.sintomas || !entry.sintomas.length) && !entry.nota) return;
  var detail = document.createElement('div');
  detail.className = 'mens-day-detail';
  detail.style.cssText = 'background:var(--surface);border-radius:10px;padding:.7rem .9rem;margin-top:.5rem;font-size:.78rem';
  var d = new Date(dk+'T12:00:00');
  var MESES = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
  detail.innerHTML = '<div style="font-weight:800;color:var(--text);margin-bottom:.4rem">'+d.getDate()+' '+MESES[d.getMonth()]+'</div>' +
    (entry.flujo ? '<div style="margin-bottom:.25rem">'+entry.flujo+'</div>' : '') +
    (entry.sintomas && entry.sintomas.length ? '<div style="color:var(--muted);margin-bottom:.25rem">'+entry.sintomas.join(' · ')+'</div>' : '') +
    (entry.nota ? '<div style="color:var(--muted);font-style:italic">'+entry.nota+'</div>' : '');
  container.appendChild(detail);
}

// Patch cloud sync
const _origSyncS = window.syncFromCloud;
window.syncFromCloud = function() {
  // Merge incoming cloud data con cambios locales no guardados aún
  if (window._gratitudData) {
    // Solo actualizar días que NO tengan un input activo en este momento
    var activeEl = document.activeElement;
    var isTypingGratitud = activeEl && activeEl.classList.contains('gratitud-input');
    if (!isTypingGratitud) {
      // Safe to overwrite — no está escribiendo
      gratitudData = window._gratitudData;
    } else {
      // Está escribiendo: merge por fecha, preservando el día activo
      var incoming = window._gratitudData;
      Object.keys(incoming).forEach(function(dk) {
        // Solo actualizar fechas que no sean hoy si está activa
        var todayDk = dateKey(new Date());
        if (dk !== todayDk) {
          gratitudData[dk] = incoming[dk];
        }
        // Para hoy: solo actualizar si el valor local está vacío
        else {
          incoming[dk].forEach(function(val, i) {
            if (!gratitudData[dk] || !gratitudData[dk][i]) {
              if (!gratitudData[dk]) gratitudData[dk] = ['','',''];
              gratitudData[dk][i] = val;
            }
          });
        }
      });
    }
  }
  if (window._suenoData) suenoData = window._suenoData;
  if (window._mensData)  mensData  = window._mensData;
  if (_origSyncS) _origSyncS();
  // Solo re-renderizar gratitud si no está escribiendo
  var activeEl2 = document.activeElement;
  var isTyping2 = activeEl2 && activeEl2.classList.contains('gratitud-input');
  if (!isTyping2) renderGratitud();
  renderSueno(); renderMens();
};

loadGratitud(); renderGratitud();
loadSueno();    renderSueno();
loadMens();     renderMens();
