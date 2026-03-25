// ════════════════════════════════════════════════════════════════
// Yuki 🌸 — universidad.js
// ════════════════════════════════════════════════════════════════



// ============================================================
//  UNIVERSIDAD / MEDICINA
// ============================================================

var univData = {
  motivacion: '',
  semestres: [],     // [{ id, nombre, activo, materias:[], tareas:[], examenes:[] }]
  horas: {}          // { 'YYYY-MM-DD': number }
};

var univCalOffset = 0; // month offset for calendar

function getActiveSem() {
  return univData.semestres.find(function(s) { return s.activo; }) || null;
}

function saveUniv() {
  try { localStorage.setItem('univ_data', JSON.stringify(univData)); } catch(e){}
  if (window.cloudSave) window.cloudSave('univ_data', univData);
}

function loadUniv() {
  var saved = window._univData || JSON.parse(localStorage.getItem('univ_data') || 'null');
  if (saved) {
    univData.motivacion = saved.motivacion || '';
    univData.horas      = saved.horas      || {};
    // Migrate old format
    if (saved.semestres) {
      univData.semestres = saved.semestres;
    } else if (saved.materias || saved.tareas || saved.examenes) {
      // Old data: wrap in a default semester
      univData.semestres = [{
        id: 'sem_legacy',
        nombre: 'Mi primer semestre',
        activo: true,
        materias: saved.materias || [],
        tareas:   saved.tareas   || [],
        examenes: saved.examenes || []
      }];
    }
  }
}

var MESES_CORTO = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
var MESES_LARGO = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
var COLORES_MAT = ['#5b7bd5','#e57373','#81c784','#ffb74d','#ba68c8','#4db6ac','#f06292','#90a4ae'];

function renderUniv() {
  renderUnivMotiv();
  renderUnivSemSelector();
  renderUnivMaterias();
  renderUnivTareas();
  renderUnivExamenes();
  renderUnivHoras();
  renderUnivHistorial();
  renderUnivCalendario();
}

// ── Motivación
function renderUnivMotiv() {
  var card = document.getElementById('univMotivCard');
  if (!card) return;
  card.innerHTML = '';
  var label = document.createElement('span');
  label.className = 'univ-motiv-label';
  label.textContent = '💙 ¿Por qué quiero seguir en este camino?';
  var text = document.createElement('div');
  text.className = 'univ-motiv-text';
  text.textContent = univData.motivacion || 'Toca el ✏️ para escribir tu motivación...';
  if (!univData.motivacion) text.style.opacity = '.5';
  var editBtn = document.createElement('button');
  editBtn.className = 'univ-motiv-edit';
  editBtn.textContent = '✏️';
  editBtn.onclick = function() {
    var val = prompt('¿Por qué quieres seguir en este camino?', univData.motivacion || '');
    if (val !== null) { univData.motivacion = val; saveUniv(); renderUnivMotiv(); }
  };
  card.appendChild(label);
  card.appendChild(text);
  card.appendChild(editBtn);
}

// ── Semestre selector
function renderUnivSemSelector() {
  var el = document.getElementById('univSemSelector');
  if (!el) return;
  el.innerHTML = '';

  if (univData.semestres.length === 0) {
    el.innerHTML = '<div class="univ-empty">Sin semestres todavía — crea el primero 💙</div>';
    return;
  }

  var wrap = document.createElement('div');
  wrap.style.cssText = 'display:flex;gap:.5rem;flex-wrap:wrap;';

  univData.semestres.forEach(function(sem, idx) {
    var chip = document.createElement('div');
    chip.className = 'univ-sem-chip' + (sem.activo ? ' active' : '');
    chip.textContent = sem.nombre;
    chip.onclick = function() {
      univData.semestres.forEach(function(s) { s.activo = false; });
      univData.semestres[idx].activo = true;
      saveUniv(); renderUniv();
    };
    wrap.appendChild(chip);
  });

  el.appendChild(wrap);

  var active = getActiveSem();
  if (active) {
    var lbl = document.createElement('div');
    lbl.style.cssText = 'font-size:.65rem;color:var(--muted);font-weight:600;margin-top:.5rem;';
    lbl.textContent = 'Semestre activo: ' + active.nombre;
    el.appendChild(lbl);
  }
}

// ── Materias
function renderUnivMaterias() {
  var list = document.getElementById('univMateriasList');
  if (!list) return;
  list.innerHTML = '';
  var sem = getActiveSem();
  if (!sem) { list.innerHTML = '<div class="univ-empty">Crea un semestre primero 🎓</div>'; return; }
  if (sem.materias.length === 0) { list.innerHTML = '<div class="univ-empty">Sin materias aún 📚</div>'; return; }

  var grid = document.createElement('div');
  grid.className = 'univ-materias-grid';

  sem.materias.forEach(function(mat, idx) {
    var card = document.createElement('div');
    card.className = 'univ-materia-card';
    card.style.borderColor = mat.color || 'var(--border)';

    // Imagen o color de fondo
    if (mat.img) {
      var img = document.createElement('img');
      img.className = 'univ-materia-card-img';
      img.src = mat.img;
      img.alt = mat.name;
      card.appendChild(img);
    } else {
      var noImg = document.createElement('div');
      noImg.className = 'univ-materia-card-noimg';
      noImg.style.background = mat.color ? mat.color + '33' : 'var(--beige-soft)';
      noImg.textContent = '📚';
      card.appendChild(noImg);
    }

    // Botón eliminar (top right)
    var del = document.createElement('button');
    del.className = 'univ-materia-card-del';
    del.textContent = '✕';
    del.onclick = function(e) {
      e.stopPropagation();
      kittyConfirm('¿Eliminar ' + mat.name + '?', function(){ sem.materias.splice(idx,1); saveUniv(); renderUniv(); });
    };
    card.appendChild(del);

    // Body
    var body = document.createElement('div');
    body.className = 'univ-materia-card-body';

    var name = document.createElement('div');
    name.className = 'univ-materia-card-name';
    name.textContent = mat.name;
    name.style.backgroundColor = mat.color || 'var(--muted)';

    var cal = document.createElement('div');
    cal.className = 'univ-materia-card-cal';
    cal.textContent = mat.calificacion ? '★ ' + mat.calificacion : '★ —';
    cal.style.backgroundColor = mat.color ? mat.color + 'BB' : 'rgba(0,0,0,.5)';
    cal.style.cursor = 'pointer';
    cal.title = 'Clic para editar calificación';
    cal.onclick = function(e) {
      e.stopPropagation();
      var v = prompt('Calificación de ' + mat.name + ':', mat.calificacion || '');
      if (v !== null) { sem.materias[idx].calificacion = v.trim(); saveUniv(); renderUnivMaterias(); }
    };

    body.appendChild(name);
    body.appendChild(cal);
    card.appendChild(body);

    // Click en la tarjeta abre modal de vista
    card.onclick = function() { openUnivMateriaViewModalById(mat.id); };

    grid.appendChild(card);
  });

  list.appendChild(grid);
}

// ── Tareas
function renderUnivTareas() {
  var list = document.getElementById('univTareasList');
  if (!list) return;
  list.innerHTML = '';
  var sem = getActiveSem();
  if (!sem) { list.innerHTML = '<div class="univ-empty">Crea un semestre primero 🎓</div>'; return; }

  var pending = sem.tareas.filter(function(t) { return !t.done; });
  var done    = sem.tareas.filter(function(t) { return t.done; });
  var sorted  = pending.concat(done);

  if (sorted.length === 0) { list.innerHTML = '<div class="univ-empty">Sin tareas pendientes 🎉</div>'; return; }

  sorted.forEach(function(tarea) {
    var realIdx = sem.tareas.findIndex(function(t) { return t.id === tarea.id; });
    var row = document.createElement('div');
    row.className = 'univ-tarea-row' + (tarea.done ? ' done' : '');
    var chk = document.createElement('div');
    chk.className = 'univ-tarea-check';
    chk.textContent = tarea.done ? '✓' : '';
    var info = document.createElement('div');
    info.className = 'univ-tarea-info';
    var nm = document.createElement('div');
    nm.className = 'univ-tarea-name';
    nm.textContent = tarea.name;
    var meta = document.createElement('div');
    meta.className = 'univ-tarea-meta';
    var parts = [];
    if (tarea.materia) parts.push(tarea.materia);
    if (tarea.fecha) parts.push('Entrega: ' + formatFecha(tarea.fecha));
    meta.textContent = parts.join(' · ');
    info.appendChild(nm);
    if (parts.length) info.appendChild(meta);
    row.appendChild(chk); row.appendChild(info);
    if (tarea.urgente && !tarea.done) {
      var urg = document.createElement('span');
      urg.className = 'univ-tarea-urgente';
      urg.textContent = '¡Urgente!';
      row.appendChild(urg);
    }
    var del = document.createElement('button');
    del.className = 'univ-materia-del';
    del.textContent = '✕';
    del.onclick = function(e) { e.stopPropagation(); sem.tareas.splice(realIdx,1); saveUniv(); renderUnivTareas(); };
    row.appendChild(del);
    row.onclick = function() { sem.tareas[realIdx].done = !sem.tareas[realIdx].done; saveUniv(); renderUnivTareas(); };
    list.appendChild(row);
  });
}

// ── Exámenes
function renderUnivExamenes() {
  var list = document.getElementById('univExamenesList');
  if (!list) return;
  list.innerHTML = '';
  var sem = getActiveSem();
  if (!sem) { list.innerHTML = '<div class="univ-empty">Crea un semestre primero 🎓</div>'; return; }

  var today = new Date(); today.setHours(0,0,0,0);
  var upcoming = sem.examenes.filter(function(e) {
    return !e.fecha || new Date(e.fecha + 'T12:00:00') >= today;
  });
  upcoming.sort(function(a,b) { return new Date(a.fecha+'T12:00:00') - new Date(b.fecha+'T12:00:00'); });

  if (upcoming.length === 0) { list.innerHTML = '<div class="univ-empty">Sin exámenes próximos 🎓</div>'; return; }

  upcoming.forEach(function(ex) {
    var realIdx = sem.examenes.findIndex(function(e) { return e.id === ex.id; });
    var row = document.createElement('div');
    row.className = 'univ-examen-row';
    var fechaEl = document.createElement('div');
    fechaEl.className = 'univ-examen-fecha';
    if (ex.fecha) {
      var d = new Date(ex.fecha+'T12:00:00');
      fechaEl.innerHTML = '<span class="univ-examen-dia">'+d.getDate()+'</span><span class="univ-examen-mes">'+MESES_CORTO[d.getMonth()]+'</span>';
    } else { fechaEl.innerHTML = '<span class="univ-examen-dia">?</span>'; }
    var info = document.createElement('div');
    info.className = 'univ-examen-info';
    info.innerHTML = '<div class="univ-examen-name">'+ex.name+'</div>' + (ex.materia ? '<div class="univ-examen-materia">'+ex.materia+'</div>' : '');
    var diasEl = document.createElement('div');
    diasEl.className = 'univ-examen-dias';
    if (ex.fecha) {
      var d2 = new Date(ex.fecha+'T12:00:00');
      var diff = Math.ceil((d2-today)/86400000);
      diasEl.textContent = diff===0?'¡Hoy!':diff===1?'Mañana':'en '+diff+'d';
    }
    var del = document.createElement('button');
    del.className = 'univ-examen-del';
    del.textContent = '✕';
    del.onclick = function() { sem.examenes.splice(realIdx,1); saveUniv(); renderUnivExamenes(); };
    row.appendChild(fechaEl); row.appendChild(info); row.appendChild(diasEl); row.appendChild(del);
    list.appendChild(row);
  });
}

// ── Horas de estudio
function renderUnivHoras() {
  var wrap = document.getElementById('univHorasWrap');
  if (!wrap) return;
  wrap.innerHTML = '';
  var tdk = dateKey(new Date());
  var hoy = univData.horas[tdk] || 0;
  var meta = 4;
  var tracker = document.createElement('div');
  tracker.className = 'univ-horas-tracker';
  var info = document.createElement('div');
  info.className = 'univ-horas-info';
  var num = document.createElement('div');
  num.className = 'univ-horas-num';
  num.textContent = hoy + 'h';
  var lbl = document.createElement('div');
  lbl.className = 'univ-horas-label';
  lbl.textContent = 'de estudio hoy';
  var dots = document.createElement('div');
  dots.className = 'univ-horas-dots';
  for (var i=0; i<meta; i++) {
    var dot = document.createElement('div');
    dot.className = 'univ-horas-dot' + (i < hoy ? ' filled' : '');
    dots.appendChild(dot);
  }
  info.appendChild(num); info.appendChild(lbl); info.appendChild(dots);
  var btns = document.createElement('div');
  btns.className = 'univ-horas-btns';
  var plus = document.createElement('button');
  plus.className = 'univ-horas-plus';
  plus.textContent = '+';
  plus.onclick = function() { univData.horas[tdk] = (univData.horas[tdk]||0)+1; saveUniv(); renderUnivHoras(); renderUnivCalendario(); };
  var minus = document.createElement('button');
  minus.className = 'univ-horas-minus';
  minus.textContent = '−';
  minus.onclick = function() { if(univData.horas[tdk]>0){univData.horas[tdk]--; saveUniv(); renderUnivHoras(); renderUnivCalendario();} };
  btns.appendChild(plus); btns.appendChild(minus);
  tracker.appendChild(info); tracker.appendChild(btns);
  wrap.appendChild(tracker);
  var totalWrap = document.createElement('div');
  totalWrap.className = 'univ-horas-meta-row';
  var total = 0;
  for (var dk in univData.horas) { total += univData.horas[dk]; }
  totalWrap.textContent = '📊 Total acumulado: ' + total + ' horas de estudio';
  wrap.appendChild(totalWrap);
}

// ── Historial de semestres
function renderUnivHistorial() {
  var list = document.getElementById('univHistorialList');
  if (!list) return;
  list.innerHTML = '';

  if (univData.semestres.length === 0) {
    list.innerHTML = '<div class="univ-empty">Aquí aparecerán tus semestres como recuerdos 💙</div>';
    return;
  }

  univData.semestres.forEach(function(sem, idx) {
    var card = document.createElement('div');
    card.className = 'univ-hist-card' + (sem.activo ? ' active' : '');

    var hdr = document.createElement('div');
    hdr.className = 'univ-hist-hdr';

    var title = document.createElement('div');
    title.className = 'univ-hist-title';
    title.textContent = (sem.activo ? '⭐ ' : '📖 ') + sem.nombre;

    var stats = document.createElement('div');
    stats.className = 'univ-hist-stats';
    var tareasDone = sem.tareas.filter(function(t){return t.done;}).length;
    stats.textContent = sem.materias.length + ' materias · ' + tareasDone + '/' + sem.tareas.length + ' tareas · ' + sem.examenes.length + ' exámenes';

    var del = document.createElement('button');
    del.className = 'univ-materia-del';
    del.textContent = '✕';
    del.title = 'Archivar semestre';
    del.onclick = function() {
      kittyConfirm('¿Archivar "' + sem.nombre + '"? Los datos se conservan.', function() {
        // Just deactivate, never delete
        univData.semestres[idx].activo = false;
        // if was active, activate first one
        var hasActive = univData.semestres.some(function(s){return s.activo;});
        if (!hasActive && univData.semestres.length > 0) univData.semestres[0].activo = true;
        saveUniv(); renderUniv();
      });
    };

    hdr.appendChild(title);
    hdr.appendChild(del);
    card.appendChild(hdr);
    card.appendChild(stats);

    // Show materias with calificaciones
    if (sem.materias.length > 0) {
      var mats = document.createElement('div');
      mats.className = 'univ-hist-mats';
      sem.materias.forEach(function(m) {
        var chip = document.createElement('span');
        chip.className = 'univ-hist-mat-chip';
        chip.style.borderLeft = '3px solid ' + m.color;
        chip.textContent = m.name + (m.calificacion ? ' · ' + m.calificacion : '');
        mats.appendChild(chip);
      });
      card.appendChild(mats);
    }

    list.appendChild(card);
  });
}

// ── Calendario de horas de estudio
function renderUnivCalendario() {
  var wrap = document.getElementById('univCalendario');
  if (!wrap) return;
  wrap.innerHTML = '';

  var today = new Date();
  var viewDate = new Date(today.getFullYear(), today.getMonth() + univCalOffset, 1);
  var year  = viewDate.getFullYear();
  var month = viewDate.getMonth();

  // Header
  var hdr = document.createElement('div');
  hdr.className = 'univ-cal-hdr';
  var prev = document.createElement('button');
  prev.className = 'nav-btn';
  prev.textContent = '‹';
  prev.onclick = function() { univCalOffset--; renderUnivCalendario(); };
  var next = document.createElement('button');
  next.className = 'nav-btn';
  next.textContent = '›';
  next.onclick = function() { univCalOffset++; renderUnivCalendario(); };
  var lbl = document.createElement('span');
  lbl.className = 'univ-cal-lbl';
  lbl.textContent = MESES_LARGO[month] + ' ' + year;
  hdr.appendChild(prev); hdr.appendChild(lbl); hdr.appendChild(next);
  wrap.appendChild(hdr);

  // Day names
  var dayNames = ['L','M','X','J','V','S','D'];
  var grid = document.createElement('div');
  grid.className = 'univ-cal-grid';
  dayNames.forEach(function(d) {
    var dn = document.createElement('div');
    dn.className = 'univ-cal-dayname';
    dn.textContent = d;
    grid.appendChild(dn);
  });

  // First day offset (Mon=0)
  var firstDay = new Date(year, month, 1).getDay();
  var offset = firstDay === 0 ? 6 : firstDay - 1;
  for (var i=0; i<offset; i++) {
    var empty = document.createElement('div');
    grid.appendChild(empty);
  }

  var daysInMonth = new Date(year, month+1, 0).getDate();
  var todayKey2 = dateKey(today);

  for (var d2=1; d2<=daysInMonth; d2++) {
    var cellDate = new Date(year, month, d2);
    var dk2 = dateKey(cellDate);
    var horas = univData.horas[dk2] || 0;
    var isToday = dk2 === todayKey2;

    var cell = document.createElement('div');
    cell.className = 'univ-cal-cell' + (isToday ? ' today' : '') + (horas > 0 ? ' has-horas' : '');
    cell.title = horas > 0 ? horas + 'h de estudio · toca para ver recuerdos' : 'Toca para ver recuerdos';

    var dayNum = document.createElement('div');
    dayNum.className = 'univ-cal-day-num';
    dayNum.textContent = d2;
    cell.appendChild(dayNum);

    if (horas > 0) {
      var horasEl = document.createElement('div');
      horasEl.className = 'univ-cal-horas';
      horasEl.textContent = horas + 'h';
      cell.appendChild(horasEl);
    }

    // Mark selected
    if (dk2 === univSelectedDay) cell.classList.add('selected');

    // Click to view recuerdos
    (function(key) {
      cell.onclick = function() { renderRecuerdos(key); };
    })(dk2);

    grid.appendChild(cell);
  }

  wrap.appendChild(grid);

  // Legend
  var legend = document.createElement('div');
  legend.className = 'univ-cal-legend';
  legend.innerHTML = '<span class="univ-cal-legend-dot"></span> Horas de estudio registradas · toca un día para ver tus recuerdos';
  wrap.appendChild(legend);
}

var univSelectedDay = null;

function renderRecuerdos(dk) {
  univSelectedDay = dk;
  var wrap = document.getElementById('univRecuerdosContent');
  if (!wrap) return;
  wrap.innerHTML = '';

  var d = new Date(dk + 'T12:00:00');
  var DIAS = ['domingo','lunes','martes','miércoles','jueves','viernes','sábado'];
  var MESES_L = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];

  // Date title
  var title = document.createElement('div');
  title.className = 'rec-date-title';
  title.textContent = DIAS[d.getDay()] + ' ' + d.getDate() + ' de ' + MESES_L[d.getMonth()] + ' ' + d.getFullYear();
  wrap.appendChild(title);

  var hasAnything = false;

  // ── Horas de estudio
  var horas = (univData.horas && univData.horas[dk]) || 0;
  if (horas > 0) {
    hasAnything = true;
    var sec = document.createElement('div');
    sec.className = 'rec-section';
    sec.innerHTML = '<div class="rec-section-title">⏱️ Horas de estudio</div>';
    var item = document.createElement('div');
    item.className = 'rec-item';
    item.innerHTML = '<span class="rec-horas-big">' + horas + 'h</span> estudiadas ese día';
    sec.appendChild(item);
    wrap.appendChild(sec);
  }

  // ── Reflexión / Relación con Dios
  if (typeof diosData !== 'undefined' && diosData[dk]) {
    var dd = diosData[dk];
    if (dd.oracion || dd.intencion || dd.ore > 0) {
      hasAnything = true;
      var sec2 = document.createElement('div');
      sec2.className = 'rec-section';
      sec2.innerHTML = '<div class="rec-section-title">🌟 Relación con Dios</div>';
      if (dd.ore > 0) {
        var i1 = document.createElement('div');
        i1.className = 'rec-item';
        i1.textContent = '🙏 Oré ' + dd.ore + ' vez' + (dd.ore > 1 ? 'es' : '') + ' ese día';
        sec2.appendChild(i1);
      }
      if (dd.oracion) {
        var i2 = document.createElement('div');
        i2.className = 'rec-item';
        i2.innerHTML = '<div class="rec-item-meta">Oración / reflexión</div>' + dd.oracion;
        sec2.appendChild(i2);
      }
      if (dd.intencion) {
        var i3 = document.createElement('div');
        i3.className = 'rec-item';
        i3.innerHTML = '<div class="rec-item-meta">Intención / petición</div>' + dd.intencion;
        sec2.appendChild(i3);
      }
      wrap.appendChild(sec2);
    }
  }

  // ── Agradecimiento
  if (typeof gratitudData !== 'undefined' && gratitudData[dk]) {
    var gr = gratitudData[dk].filter(function(g){return g && g.trim();});
    if (gr.length > 0) {
      hasAnything = true;
      var sec3 = document.createElement('div');
      sec3.className = 'rec-section';
      sec3.innerHTML = '<div class="rec-section-title">🌸 Agradecimiento</div>';
      gr.forEach(function(g) {
        var item = document.createElement('div');
        item.className = 'rec-item';
        item.textContent = '✨ ' + g;
        sec3.appendChild(item);
      });
      wrap.appendChild(sec3);
    }
  }

  // ── Sueño
  if (typeof suenoData !== 'undefined' && suenoData[dk]) {
    var sd = suenoData[dk];
    if (sd.dormirse || sd.despertar) {
      hasAnything = true;
      var sec4 = document.createElement('div');
      sec4.className = 'rec-section';
      sec4.innerHTML = '<div class="rec-section-title">🌙 Sueño</div>';
      var item4 = document.createElement('div');
      item4.className = 'rec-item';
      var txt4 = '';
      if (sd.dormirse) txt4 += 'Me dormí a las ' + (typeof to12h === 'function' ? to12h(sd.dormirse) : sd.dormirse);
      if (sd.despertar) txt4 += (txt4 ? ' · ' : '') + 'Desperté a las ' + (typeof to12h === 'function' ? to12h(sd.despertar) : sd.despertar);
      if (sd.calidad) txt4 += ' · ' + sd.calidad;
      item4.textContent = txt4;
      sec4.appendChild(item4);
      wrap.appendChild(sec4);
    }
  }

  // ── Tareas completadas ese día (recurring tasks con completion en esa fecha)
  if (typeof completions !== 'undefined' && typeof recurringTasks !== 'undefined') {
    var doneTasks = recurringTasks.filter(function(t) {
      return completions[t.id + '|' + dk];
    });
    if (doneTasks.length > 0) {
      hasAnything = true;
      var sec5 = document.createElement('div');
      sec5.className = 'rec-section';
      sec5.innerHTML = '<div class="rec-section-title">✅ Tareas completadas</div>';
      doneTasks.forEach(function(t) {
        var item = document.createElement('div');
        item.className = 'rec-item done';
        item.textContent = t.text;
        sec5.appendChild(item);
      });
      wrap.appendChild(sec5);
    }
  }

  // ── Ejercicio ese día
  if (typeof ejRegistros !== 'undefined' && ejRegistros[dk] && ejRegistros[dk].length > 0) {
    hasAnything = true;
    var sec6 = document.createElement('div');
    sec6.className = 'rec-section';
    sec6.innerHTML = '<div class="rec-section-title">🏃 Ejercicio</div>';
    ejRegistros[dk].forEach(function(reg) {
      var tpl = (typeof ejTemplates !== 'undefined') && ejTemplates.find(function(t){return t.id===reg.templateId;});
      if (!tpl) return;
      var item = document.createElement('div');
      item.className = 'rec-item';
      var done = reg.completedSteps.length;
      var total = tpl.pasos.length;
      item.textContent = tpl.emoji + ' ' + tpl.name + ' · ' + done + '/' + total + ' ejercicios';
      sec6.appendChild(item);
    });
    wrap.appendChild(sec6);
  }

  // ── Belleza ese día
  if (typeof bellezaRegistros !== 'undefined' && bellezaRegistros[dk] && bellezaRegistros[dk].length > 0) {
    hasAnything = true;
    var sec7 = document.createElement('div');
    sec7.className = 'rec-section';
    sec7.innerHTML = '<div class="rec-section-title">✨ Belleza</div>';
    bellezaRegistros[dk].forEach(function(reg) {
      var tpl = (typeof bellezaTemplates !== 'undefined') && bellezaTemplates.find(function(t){return t.id===reg.templateId;});
      if (!tpl) return;
      var item = document.createElement('div');
      item.className = 'rec-item';
      var done = reg.completedSteps.length;
      var total = tpl.pasos.length;
      item.textContent = tpl.emoji + ' ' + tpl.name + ' · ' + done + '/' + total + ' pasos';
      sec7.appendChild(item);
    });
    wrap.appendChild(sec7);
  }

  if (!hasAnything) {
    var empty = document.createElement('div');
    empty.className = 'rec-empty-day';
    empty.textContent = 'Sin registros para este día 🌙';
    wrap.appendChild(empty);
  }

  // Scroll to recuerdos block
  var block = document.getElementById('univRecuerdosBlock');
  if (block) block.scrollIntoView({ behavior: 'smooth', block: 'start' });

  // Re-render calendar to show selected day
  renderUnivCalendario();
}

// ── Helpers
function formatFecha(str) {
  if (!str) return '';
  var d = new Date(str + 'T12:00:00');
  return d.getDate() + ' ' + MESES_CORTO[d.getMonth()];
}

// ── Modales
function openUnivSemModal() {
  var back = document.createElement('div');
  back.className = 'rutina-modal-backdrop';
  back.onclick = function(e) { if (e.target===back) back.remove(); };
  var box = document.createElement('div');
  box.className = 'rutina-modal-box';
  box.innerHTML = '<div class="rutina-modal-title">🎓 <em>Nuevo semestre</em></div>' +
    '<div class="modal-field"><label class="modal-label">Nombre</label>' +
    '<input class="modal-input" id="semNombre" placeholder="ej: Semestre 1, Prepa 3er año..." style="width:100%"></div>' +
    '<div class="modal-btns" style="margin-top:1.2rem">' +
    '<button class="modal-btn-cancel" id="semCancel">Cancelar</button>' +
    '<button class="modal-btn-save" id="semSave">Crear 🎓</button></div>';
  back.appendChild(box);
  document.body.appendChild(back);
  document.getElementById('semCancel').onclick = function() { back.remove(); };
  document.getElementById('semSave').onclick = function() {
    var n = document.getElementById('semNombre').value.trim();
    if (!n) return;
    // Deactivate all
    univData.semestres.forEach(function(s){s.activo=false;});
    univData.semestres.push({ id:'sem_'+Date.now(), nombre:n, activo:true, materias:[], tareas:[], examenes:[] });
    saveUniv(); renderUniv();
    back.remove();
  };
  document.getElementById('semNombre').focus();
}

function openUnivMateriaViewModalById(matId) {
  var sem = getActiveSem();
  if (!sem) return;
  var matIdx = sem.materias.findIndex(function(m) { return m.id === matId; });
  if (matIdx === -1) return;
  openUnivMateriaViewModal(matIdx);
}

function openUnivMateriaViewModal(matIdx) {
  var sem = getActiveSem();
  if (!sem || !sem.materias[matIdx]) return;
  var mat = sem.materias[matIdx];

  var back = document.createElement('div');
  back.className = 'rutina-modal-backdrop';
  back.onclick = function(e) { if (e.target===back) back.remove(); };

  var box = document.createElement('div');
  box.className = 'rutina-modal-box';
  box.style.maxWidth = '500px';
  box.style.position = 'relative';

  // Botón editar (lápiz) en la esquina superior derecha
  var editBtn = document.createElement('button');
  editBtn.innerHTML = '✏️';
  editBtn.style.cssText = 'position:absolute;top:.7rem;right:.7rem;background:'+mat.color+';border:none;border-radius:50%;width:36px;height:36px;font-size:1.1rem;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:transform .15s,opacity .15s;box-shadow:0 2px 8px rgba(0,0,0,.15)';
  editBtn.title = 'Editar materia';
  editBtn.onmouseover = function(){ this.style.transform = 'scale(1.1)'; };
  editBtn.onmouseout = function(){ this.style.transform = 'scale(1)'; };
  editBtn.onclick = function(e) {
    e.stopPropagation();
    back.remove();
    openUnivMateriaModal(matIdx);
  };

  var titleDiv = document.createElement('div');
  titleDiv.className = 'rutina-modal-title';
  titleDiv.style.paddingRight = '3rem';
  titleDiv.innerHTML = '📚 <em>' + mat.name + '</em>';

  var content = document.createElement('div');
  content.style.marginTop = '.8rem';

  // Sección de calificación
  var calDiv = document.createElement('div');
  calDiv.style.cssText = 'background:'+mat.color+'22;border-left:4px solid '+mat.color+';padding:.8rem;border-radius:8px;margin-bottom:1rem';
  var calLabel = document.createElement('div');
  calLabel.style.cssText = 'font-size:.7rem;font-weight:700;color:var(--muted);text-transform:uppercase;margin-bottom:.3rem';
  calLabel.textContent = '⭐ Calificación General';
  var calVal = document.createElement('div');
  calVal.style.cssText = 'font-size:1.3rem;font-weight:800;color:'+mat.color;
  calVal.textContent = mat.calificacion ? mat.calificacion : '—';
  calDiv.appendChild(calLabel);
  calDiv.appendChild(calVal);
  content.appendChild(calDiv);

  // Tareas pendientes de esta materia
  var tasksDiv = document.createElement('div');
  tasksDiv.style.marginBottom = '1rem';
  var tasksLabel = document.createElement('div');
  tasksLabel.style.cssText = 'font-size:.75rem;font-weight:700;color:var(--text);margin-bottom:.5rem;text-transform:uppercase';
  tasksLabel.textContent = '📝 Tareas de ' + mat.name;
  tasksDiv.appendChild(tasksLabel);

  var tasksList = document.createElement('div');
  tasksList.style.display = 'flex';
  tasksList.style.flexDirection = 'column';
  tasksList.style.gap = '.4rem';

  // Buscar tareas de esta materia
  var materiasTareas = sem.tareas ? sem.tareas.filter(function(t) { return t.materia === mat.name; }) : [];
  if (materiasTareas.length === 0) {
    var emptyTask = document.createElement('div');
    emptyTask.style.cssText = 'font-size:.7rem;color:var(--muted2);font-style:italic;padding:.5rem;text-align:center';
    emptyTask.textContent = 'Sin tareas pendientes 🎉';
    tasksList.appendChild(emptyTask);
  } else {
    materiasTareas.forEach(function(task) {
      var taskRow = document.createElement('div');
      taskRow.style.cssText = 'display:flex;align-items:flex-start;gap:.5rem;padding:.6rem;background:var(--surface);border-radius:8px;border-left:3px solid '+mat.color;
      
      var taskName = document.createElement('div');
      taskName.style.cssText = 'flex:1;font-size:.75rem;font-weight:600;color:var(--text)';
      taskName.textContent = task.nombre || task.name || 'Tarea sin nombre';
      
      var taskDate = document.createElement('div');
      taskDate.style.cssText = 'font-size:.65rem;color:var(--muted);white-space:nowrap';
      taskDate.textContent = task.entrega || '—';
      
      taskRow.appendChild(taskName);
      taskRow.appendChild(taskDate);
      tasksList.appendChild(taskRow);
    });
  }
  tasksDiv.appendChild(tasksList);
  content.appendChild(tasksDiv);

  // Cerrar botón
  var closeBtn = document.createElement('button');
  closeBtn.className = 'modal-btn-cancel';
  closeBtn.textContent = 'Cerrar';
  closeBtn.style.marginTop = '1rem';
  closeBtn.onclick = function() { back.remove(); };

  box.appendChild(editBtn);
  box.appendChild(titleDiv);
  box.appendChild(content);
  box.appendChild(closeBtn);

  back.appendChild(box);
  document.body.appendChild(back);
}

function openUnivMateriaModal(editIdx) {
  var sem = getActiveSem();
  if (!sem) { alert('Primero crea un semestre 🎓'); return; }
  var isEdit = (typeof editIdx === 'number');
  var existing = isEdit ? sem.materias[editIdx] : null;
  var selImgData = existing ? (existing.img || null) : null;

  var back = document.createElement('div');
  back.className = 'rutina-modal-backdrop';
  back.onclick = function(e) { if (e.target===back) back.remove(); };

  var colOpts = COLORES_MAT.map(function(c) {
    return '<span class="univ-color-opt" data-color="'+c+'" style="background:'+c+';width:20px;height:20px;border-radius:50%;display:inline-block;cursor:pointer;border:2px solid transparent;margin:2px"></span>';
  }).join('');

  var box = document.createElement('div');
  box.className = 'rutina-modal-box';
  box.innerHTML =
    '<div class="rutina-modal-title">📚 <em>' + (isEdit ? 'Editar' : 'Nueva') + ' materia</em></div>' +
    '<div style="font-size:.65rem;color:var(--muted);font-weight:600;margin-bottom:.8rem">Semestre: ' + sem.nombre + '</div>' +
    '<div class="modal-field"><label class="modal-label">Nombre</label>' +
    '<input class="modal-input" id="univMatNombre" placeholder="ej: Biología, Química..." style="width:100%" value="'+(existing?existing.name:'')+'"></div>' +
    '<div class="modal-field" style="margin-top:.8rem"><label class="modal-label">Color de tarjeta</label>' +
    '<div style="display:flex;gap:4px;flex-wrap:wrap;margin-top:4px" id="univColorPicker">'+colOpts+'</div></div>' +
    '<div class="modal-field" style="margin-top:.8rem"><label class="modal-label">Foto de la materia (URL)</label>' +
    '<div id="univMatImgPreview" style="margin:.4rem 0;border-radius:10px;overflow:hidden;display:'+(selImgData?'block':'none')+';height:100px">' +
      '<img id="univMatImgPreviewImg" src="'+(selImgData||'')+'" style="width:100%;height:100px;object-fit:cover">' +
    '</div>' +
    '<input class="modal-input" id="univMatImgUrl" placeholder="https://ejemplo.com/imagen.jpg" style="width:100%;margin-top:.4rem" value="'+(selImgData||'')+'">' +
    '<button id="univMatImgClear" style="display:'+(selImgData?'inline-flex':'none')+';margin-top:.4rem;align-items:center;background:none;border:1.5px solid var(--border);border-radius:20px;padding:.3rem .7rem;font-size:.7rem;font-weight:700;color:var(--muted2);cursor:pointer;font-family:var(--font-body)">✕ Quitar foto</button>' +
    '</div>' +
    '<div class="modal-btns" style="margin-top:1.2rem">' +
    '<button class="modal-btn-cancel" id="univMatCancel">Cancelar</button>' +
    '<button class="modal-btn-save" id="univMatSave">Guardar 💙</button></div>';

  back.appendChild(box);
  document.body.appendChild(back);

  var selColor = existing ? (existing.color || COLORES_MAT[0]) : COLORES_MAT[0];
  box.querySelectorAll('.univ-color-opt').forEach(function(el) {
    if (el.dataset.color === selColor) el.style.border = '2px solid #333';
    el.onclick = function() {
      box.querySelectorAll('.univ-color-opt').forEach(function(o){ o.style.border='2px solid transparent'; });
      el.style.border = '2px solid #333';
      selColor = el.dataset.color;
    };
  });

  // Image URL handler
  var urlInput = document.getElementById('univMatImgUrl');
  if (urlInput) {
    urlInput.onchange = function() {
      var url = this.value.trim();
      if (url) {
        selImgData = url;
        var preview = document.getElementById('univMatImgPreview');
        var previewImg = document.getElementById('univMatImgPreviewImg');
        var clearBtn = document.getElementById('univMatImgClear');
        if (preview) { preview.style.display = 'block'; }
        if (previewImg) previewImg.src = selImgData;
        if (clearBtn) clearBtn.style.display = 'inline-flex';
      }
    };
  }

  document.getElementById('univMatImgClear').onclick = function() {
    selImgData = null;
    var preview = document.getElementById('univMatImgPreview');
    var clearBtn = document.getElementById('univMatImgClear');
    if (preview) preview.style.display = 'none';
    this.style.display = 'none';
  };

  document.getElementById('univMatCancel').onclick = function() { back.remove(); };
  document.getElementById('univMatSave').onclick = function() {
    var n = document.getElementById('univMatNombre').value.trim();
    if (!n) return;
    if (isEdit) {
      sem.materias[editIdx].name  = n;
      sem.materias[editIdx].color = selColor;
      sem.materias[editIdx].img   = selImgData;
    } else {
      sem.materias.push({ id:'mat_'+Date.now(), name:n, color:selColor, img:selImgData, calificacion:'' });
    }
    saveUniv(); 
    renderUnivMaterias();
    back.remove();
  };
  document.getElementById('univMatNombre').focus();
}

function openUnivTareaModal() {
  var sem = getActiveSem();
  if (!sem) { alert('Primero crea un semestre 🎓'); return; }
  var back = document.createElement('div');
  back.className = 'rutina-modal-backdrop';
  back.onclick = function(e) { if (e.target===back) back.remove(); };
  var materiaOpts = '<option value="">Sin materia</option>' +
    sem.materias.map(function(m){return '<option value="'+m.name+'">'+m.name+'</option>';}).join('');
  var box = document.createElement('div');
  box.className = 'rutina-modal-box';
  box.innerHTML = '<div class="rutina-modal-title">📝 <em>Nueva tarea</em></div>' +
    '<div class="modal-field"><label class="modal-label">Tarea</label>' +
    '<input class="modal-input" id="univTareaNombre" placeholder="ej: Resumen capítulo 3..." style="width:100%"></div>' +
    '<div class="modal-field" style="margin-top:.8rem"><label class="modal-label">Materia</label>' +
    '<select class="modal-input" id="univTareaMateria" style="width:100%">'+materiaOpts+'</select></div>' +
    '<div class="modal-field" style="margin-top:.8rem"><label class="modal-label">Fecha de entrega</label>' +
    '<input type="date" class="modal-input" id="univTareaFecha" style="width:100%"></div>' +
    '<div class="modal-field" style="margin-top:.8rem;display:flex;align-items:center;gap:.6rem">' +
    '<input type="checkbox" id="univTareaUrgente" style="width:16px;height:16px">' +
    '<label for="univTareaUrgente" class="modal-label" style="margin:0">¡Urgente!</label></div>' +
    '<div class="modal-btns" style="margin-top:1.2rem">' +
    '<button class="modal-btn-cancel" id="univTareaCancel">Cancelar</button>' +
    '<button class="modal-btn-save" id="univTareaSave">Guardar 📝</button></div>';
  back.appendChild(box);
  document.body.appendChild(back);
  document.getElementById('univTareaCancel').onclick = function() { back.remove(); };
  document.getElementById('univTareaSave').onclick = function() {
    var n = document.getElementById('univTareaNombre').value.trim();
    if (!n) return;
    sem.tareas.push({id:'tar_'+Date.now(),name:n,
      materia:document.getElementById('univTareaMateria').value,
      fecha:document.getElementById('univTareaFecha').value,
      urgente:document.getElementById('univTareaUrgente').checked,done:false});
    saveUniv(); renderUniv(); back.remove();
  };
  document.getElementById('univTareaNombre').focus();
}

function openUnivExamenModal() {
  var sem = getActiveSem();
  if (!sem) { alert('Primero crea un semestre 🎓'); return; }
  var back = document.createElement('div');
  back.className = 'rutina-modal-backdrop';
  back.onclick = function(e) { if (e.target===back) back.remove(); };
  var materiaOpts = '<option value="">Sin materia</option>' +
    sem.materias.map(function(m){return '<option value="'+m.name+'">'+m.name+'</option>';}).join('');
  var box = document.createElement('div');
  box.className = 'rutina-modal-box';
  box.innerHTML = '<div class="rutina-modal-title">📅 <em>Nuevo examen</em></div>' +
    '<div class="modal-field"><label class="modal-label">Nombre del examen</label>' +
    '<input class="modal-input" id="univExNombre" placeholder="ej: Parcial 1..." style="width:100%"></div>' +
    '<div class="modal-field" style="margin-top:.8rem"><label class="modal-label">Materia</label>' +
    '<select class="modal-input" id="univExMateria" style="width:100%">'+materiaOpts+'</select></div>' +
    '<div class="modal-field" style="margin-top:.8rem"><label class="modal-label">Fecha</label>' +
    '<input type="date" class="modal-input" id="univExFecha" style="width:100%"></div>' +
    '<div class="modal-btns" style="margin-top:1.2rem">' +
    '<button class="modal-btn-cancel" id="univExCancel">Cancelar</button>' +
    '<button class="modal-btn-save" id="univExSave">Guardar 📅</button></div>';
  back.appendChild(box);
  document.body.appendChild(back);
  document.getElementById('univExCancel').onclick = function() { back.remove(); };
  document.getElementById('univExSave').onclick = function() {
    var n = document.getElementById('univExNombre').value.trim();
    if (!n) return;
    sem.examenes.push({id:'ex_'+Date.now(),name:n,
      materia:document.getElementById('univExMateria').value,
      fecha:document.getElementById('univExFecha').value});
    saveUniv(); renderUniv(); back.remove();
  };
  document.getElementById('univExNombre').focus();
}

// Cloud sync
var _origSyncUniv = window.syncFromCloud;
window.syncFromCloud = function() {
  if (window._univData) {
    univData.motivacion = window._univData.motivacion || '';
    univData.horas      = window._univData.horas      || {};
    if (window._univData.semestres) {
      univData.semestres = window._univData.semestres;
    } else if (window._univData.materias) {
      univData.semestres = [{id:'sem_legacy',nombre:'Mi primer semestre',activo:true,
        materias:window._univData.materias||[],tareas:window._univData.tareas||[],examenes:window._univData.examenes||[]}];
    }
  }
  if (_origSyncUniv) _origSyncUniv();
  renderUniv();
};

// Patch syncFromCloud para links, proyectos y spark
var _origSyncExtra = window.syncFromCloud;
window.syncFromCloud = function() {
  if (_origSyncExtra) _origSyncExtra();
  // Links
  if (window._univLinks) { univLinks = window._univLinks; renderUnivLinks(); }
  // Proyectos
  if (window._univProyectos) { univProyectos = window._univProyectos; renderProyectos(); }
  // Spark
  if (window._sparkPins)         { sparkPins = window._sparkPins; renderSparkPins(); }
  if (window._sparkHistorial)    { sparkHistorial = window._sparkHistorial; renderSparkHistorial(); }
  if (typeof window._sparkTotalMinutes === 'number') {
    sparkTotalMinutes = window._sparkTotalMinutes;
    updateSparkTimeDisplay();
  }
};

loadUniv();
document.addEventListener('DOMContentLoaded', function() {
  var newSemBtn = document.getElementById('univNewSemBtn');
  if (newSemBtn) newSemBtn.onclick = function() { openUnivSemModal(); };
  var newMatBtn = document.getElementById('univNewMateriaBtn');
  if (newMatBtn) newMatBtn.onclick = function() { openUnivMateriaModal(); };

  // ── Links / Recursos
  var univLinks = [];

  var _cardBg = getComputedStyle(document.documentElement).getPropertyValue('--card').trim() || '#1e1e30';
  var _surfBg = getComputedStyle(document.documentElement).getPropertyValue('--surface').trim() || '#1a1a2e';
  var LINK_CATS = [
    { id:'anatomia',  label:'Anatomía 3D',   emoji:'🫀', color:'var(--rosa)',  bg:'var(--rosa-soft)' },
    { id:'video',     label:'Video / YouTube',emoji:'▶️', color:'var(--rosa)',  bg:'var(--surface)' },
    { id:'articulo',  label:'Artículo / Web', emoji:'📄', color:'var(--muted)', bg:'var(--surface)' },
    { id:'libro',     label:'Libro / PDF',    emoji:'📖', color:'var(--verde)', bg:'var(--verde-soft)' },
    { id:'herramienta',label:'Herramienta',   emoji:'🔬', color:'var(--rosa)',  bg:'var(--rosa-soft)' },
    { id:'otro',      label:'Otro',           emoji:'🔗', color:'var(--muted2)',bg:'var(--surface)' },
  ];

  function getCat(id) {
    return LINK_CATS.find(function(c){ return c.id === id; }) || LINK_CATS[LINK_CATS.length-1];
  }

  function loadUnivLinks() {
    try { univLinks = JSON.parse(localStorage.getItem('univ_links') || '[]'); } catch(e){ univLinks=[]; }
    if (window._univLinks) univLinks = window._univLinks;
    renderUnivLinks();
  }

  function saveUnivLinks() {
    try { localStorage.setItem('univ_links', JSON.stringify(univLinks)); } catch(e){}
    if (window.cloudSave) window.cloudSave('univ_links', univLinks);
  }

  function renderUnivLinks() {
    var list = document.getElementById('univLinksList');
    if (!list) return;
    list.innerHTML = '';
    if (univLinks.length === 0) {
      list.innerHTML = '<div class="univ-empty">Sin recursos aún — ¡agrega tu primer link! 🔗</div>';
      return;
    }
    var grid = document.createElement('div');
    grid.className = 'univ-links-grid';

    univLinks.forEach(function(lnk, idx) {
      var cat = getCat(lnk.cat);
      var card = document.createElement('div');
      card.className = 'univ-link-card';
      card.style.borderColor = cat.color;

      // Thumbnail
      var thumb = document.createElement('div');
      thumb.className = 'univ-link-card-thumb';
      thumb.style.background = cat.bg;
      thumb.textContent = cat.emoji;
      card.appendChild(thumb);

      // Delete btn
      var del = document.createElement('button');
      del.className = 'univ-link-card-del';
      del.textContent = '✕';
      del.onclick = function(e) {
        e.stopPropagation();
        kittyConfirm('¿Eliminar "' + lnk.title + '"?', function() {
          univLinks.splice(idx, 1);
          saveUnivLinks();
          renderUnivLinks();
        });
      };
      card.appendChild(del);

      // Body
      var body = document.createElement('div');
      body.className = 'univ-link-card-body';

      var tag = document.createElement('span');
      tag.className = 'univ-link-card-tag';
      tag.style.background = cat.bg;
      tag.style.color = cat.color.replace(')', ', .9)').replace('rgb', 'rgba');
      tag.style.border = '1px solid ' + cat.color;
      tag.textContent = cat.label;

      var title = document.createElement('div');
      title.className = 'univ-link-card-title';
      title.textContent = lnk.title;

      var url = document.createElement('div');
      url.className = 'univ-link-card-url';
      try { url.textContent = new URL(lnk.url).hostname; } catch(e) { url.textContent = lnk.url; }

      body.appendChild(tag);
      body.appendChild(title);
      body.appendChild(url);
      card.appendChild(body);

      // Click abre el link
      card.onclick = function() {
        if (lnk.url) window.open(lnk.url, '_blank', 'noopener');
      };

      grid.appendChild(card);
    });

    list.appendChild(grid);
  }

  function openUnivLinkModal() {
    var back = document.createElement('div');
    back.className = 'rutina-modal-backdrop';
    back.onclick = function(e) { if (e.target===back) back.remove(); };

    var catOpts = LINK_CATS.map(function(c) {
      return '<button class="univ-link-cat-btn" data-cat="'+c.id+'" style="display:inline-flex;align-items:center;gap:.3rem;padding:.3rem .7rem;border-radius:20px;border:1.5px solid '+c.color+';background:'+c.bg+';font-size:.68rem;font-weight:700;color:var(--text);cursor:pointer;font-family:var(--font-body);margin:.2rem .2rem 0 0;transition:all .15s">'+c.emoji+' '+c.label+'</button>';
    }).join('');

    var box = document.createElement('div');
    box.className = 'rutina-modal-box';
    box.innerHTML =
      '<div class="rutina-modal-title">🔗 <em>Nuevo recurso</em></div>' +
      '<div class="modal-field"><label class="modal-label">Nombre del recurso</label>' +
      '<input class="modal-input" id="univLinkTitle" placeholder="ej: Anatomía 3D — Visible Body" style="width:100%"></div>' +
      '<div class="modal-field" style="margin-top:.8rem"><label class="modal-label">URL</label>' +
      '<input class="modal-input" id="univLinkUrl" placeholder="https://..." style="width:100%"></div>' +
      '<div class="modal-field" style="margin-top:.8rem"><label class="modal-label">Categoría</label>' +
      '<div style="display:flex;flex-wrap:wrap;margin-top:.2rem" id="univLinkCats">' + catOpts + '</div></div>' +
      '<div class="modal-btns" style="margin-top:1.2rem">' +
      '<button class="modal-btn-cancel" id="univLinkCancel">Cancelar</button>' +
      '<button class="modal-btn-save" id="univLinkSave">Guardar 🔗</button></div>';

    back.appendChild(box);
    document.body.appendChild(back);

    var selCat = 'otro';
    function updateCatBtns() {
      box.querySelectorAll('.univ-link-cat-btn').forEach(function(b) {
        var active = b.dataset.cat === selCat;
        var c = getCat(b.dataset.cat);
        b.style.background  = active ? c.color : c.bg;
        b.style.color       = active ? 'white'  : 'var(--text)';
        b.style.fontWeight  = active ? '800'    : '700';
      });
    }
    box.querySelectorAll('.univ-link-cat-btn').forEach(function(b) {
      b.onclick = function() { selCat = b.dataset.cat; updateCatBtns(); };
    });
    updateCatBtns();

    document.getElementById('univLinkCancel').onclick = function() { back.remove(); };
    document.getElementById('univLinkSave').onclick = function() {
      var t = document.getElementById('univLinkTitle').value.trim();
      var u = document.getElementById('univLinkUrl').value.trim();
      if (!t || !u) return;
      if (!/^https?:\/\//i.test(u)) u = 'https://' + u;
      univLinks.push({ id:'lnk_'+Date.now(), title:t, url:u, cat:selCat });
      saveUnivLinks();
      renderUnivLinks();
      back.remove();
    };

    // Enter en URL guarda
    document.getElementById('univLinkUrl').onkeydown = function(e) {
      if (e.key === 'Enter') document.getElementById('univLinkSave').click();
    };
    document.getElementById('univLinkTitle').focus();
  }

  var newLinkBtn = document.getElementById('univNewLinkBtn');
  if (newLinkBtn) newLinkBtn.onclick = openUnivLinkModal;

  loadUnivLinks();
  var newTarBtn = document.getElementById('univNewTareaBtn');
  if (newTarBtn) newTarBtn.onclick = function() { openUnivTareaModal(); };
  var newExBtn  = document.getElementById('univNewExamenBtn');
  if (newExBtn)  newExBtn.onclick  = function() { openUnivExamenModal(); };
});
