// ════════════════════════════════════════════════════════════════
// Yuki 🌸 — modules_26_29.js
// ════════════════════════════════════════════════════════════════


// ============================================================
//  LIMPIEZA
// ============================================================
// Frecuencia por tarea: { tipo: 'diaria'|'semanal'|'mensual'|'dias'|'personalizada',
//   dias: [0-6] (si tipo=dias), cadaN: number, unidad: 'dias'|'semanas'|'meses' (si personalizada) }

var limpiezaData = [];

var DIAS_SEMANA_LIMP = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];

function saveLimpieza() {
  try { localStorage.setItem('limpieza_data', JSON.stringify(limpiezaData)); } catch(e){}
  if (window.cloudSave) window.cloudSave('limpieza_data', limpiezaData);
}

function loadLimpieza() {
  limpiezaData = window._limpiezaData || JSON.parse(localStorage.getItem('limpieza_data') || '[]');
  if (limpiezaData.length === 0) {
    limpiezaData = [
      { id:'l1', nombre:'Cuarto', emoji:'🛏️', tareas:[
        { id:'t1', nombre:'Tender cama', done:false, lastDone:null, freq:{tipo:'diaria'} },
        { id:'t2', nombre:'Ordenar escritorio', done:false, lastDone:null, freq:{tipo:'semanal'} },
        { id:'t3', nombre:'Barrer/aspirar', done:false, lastDone:null, freq:{tipo:'semanal'} },
      ]},
      { id:'l2', nombre:'Baño', emoji:'🚿', tareas:[
        { id:'t4', nombre:'Limpiar lavabo', done:false, lastDone:null, freq:{tipo:'semanal'} },
        { id:'t5', nombre:'Limpiar espejo', done:false, lastDone:null, freq:{tipo:'mensual'} },
      ]},
      { id:'l3', nombre:'Cocina', emoji:'🍳', tareas:[
        { id:'t6', nombre:'Lavar trastes', done:false, lastDone:null, freq:{tipo:'diaria'} },
        { id:'t7', nombre:'Limpiar estufa', done:false, lastDone:null, freq:{tipo:'semanal'} },
      ]},
    ];
  }
}

function freqLabel(freq) {
  if (!freq) return '';
  if (freq.tipo === 'diaria') return '🌅 Diaria';
  if (freq.tipo === 'semanal') return '📅 Semanal';
  if (freq.tipo === 'mensual') return '🗓️ Mensual';
  if (freq.tipo === 'dias' && freq.dias && freq.dias.length) {
    return freq.dias.map(function(d){ return DIAS_SEMANA_LIMP[d]; }).join(', ');
  }
  if (freq.tipo === 'personalizada') return 'Cada ' + freq.cadaN + ' ' + (freq.unidad || 'días');
  return '';
}

function freqColor(freq) {
  if (!freq) return 'var(--muted2)';
  if (freq.tipo === 'diaria') return 'var(--rosa)';
  if (freq.tipo === 'semanal') return '#7c8cf8';
  if (freq.tipo === 'mensual') return 'var(--verde)';
  return 'var(--beige)';
}

function isTareaHoy(tarea) {
  var freq = tarea.freq;
  if (!freq) return true;
  var hoy = new Date();
  var dow = hoy.getDay(); // 0=dom
  if (freq.tipo === 'diaria') return true;
  if (freq.tipo === 'dias') return freq.dias && freq.dias.indexOf(dow) !== -1;
  if (freq.tipo === 'semanal' || freq.tipo === 'mensual' || freq.tipo === 'personalizada') return true; // always show, badge shows freq
  return true;
}

function renderLimpieza() {
  var wrap = document.getElementById('limpiezaAreas');
  if (!wrap) return;
  wrap.innerHTML = '';
  var today = dateKey(new Date());

  limpiezaData.forEach(function(area, aIdx) {
    var card = document.createElement('div');
    card.className = 'limpieza-area-card';

    var doneTasks = area.tareas.filter(function(t){ return t.done; }).length;
    var hdr = document.createElement('div');
    hdr.className = 'limpieza-area-hdr';
    hdr.innerHTML =
      '<div class="limpieza-area-name">' +
        '<span class="limpieza-area-emoji">' + area.emoji + '</span>' +
        area.nombre +
      '</div>' +
      '<div style="display:flex;gap:.4rem;align-items:center">' +
        (doneTasks > 0 ? '<span class="limpieza-freq-badge">' + doneTasks + '/' + area.tareas.length + ' ✓</span>' : '') +
        '<button class="rut-action-btn" style="font-size:.65rem" data-edit="' + aIdx + '">✏️</button>' +
      '</div>';
    card.appendChild(hdr);

    area.tareas.forEach(function(tarea) {
      var row = document.createElement('div');
      row.className = 'limpieza-task-row';

      var chk = document.createElement('div');
      chk.className = 'limpieza-check' + (tarea.done ? ' done' : '');
      chk.textContent = tarea.done ? '✓' : '';

      var mid = document.createElement('div');
      mid.style.flex = '1';
      var name = document.createElement('div');
      name.className = 'limpieza-task-name' + (tarea.done ? ' done' : '');
      name.textContent = tarea.nombre;
      var meta = document.createElement('div');
      meta.style.cssText = 'display:flex;gap:.4rem;align-items:center;margin-top:.15rem;flex-wrap:wrap';
      // freq badge
      if (tarea.freq) {
        var fb = document.createElement('span');
        fb.className = 'limpieza-freq-badge';
        fb.style.background = 'transparent';
        fb.style.color = freqColor(tarea.freq);
        fb.style.border = '1px solid ' + freqColor(tarea.freq);
        fb.textContent = freqLabel(tarea.freq);
        meta.appendChild(fb);
      }
      // last done
      if (tarea.lastDone) {
        var ld = document.createElement('span');
        ld.className = 'limpieza-last-done';
        ld.textContent = 'Última: ' + tarea.lastDone;
        meta.appendChild(ld);
      }
      mid.appendChild(name);
      mid.appendChild(meta);

      row.appendChild(chk);
      row.appendChild(mid);
      row.onclick = function() {
        tarea.done = !tarea.done;
        if (tarea.done) tarea.lastDone = today;
        saveLimpieza(); renderLimpieza();
      };
      card.appendChild(row);
    });
    wrap.appendChild(card);

    hdr.querySelector('[data-edit]').onclick = function(e) {
      e.stopPropagation();
      openLimpiezaAreaModal(aIdx);
    };
  });
}

function makeTareaRow(t) {
  // t = { nombre, freq } or null for new
  var freq = (t && t.freq) || { tipo: 'diaria' };
  var nombre = (t && t.nombre) || '';
  var wrap = document.createElement('div');
  wrap.className = 'limp-tarea-block';
  wrap.style.cssText = 'border:1px solid var(--border);border-radius:12px;padding:.7rem;margin-bottom:.6rem;background:var(--bg)';

  var topRow = document.createElement('div');
  topRow.style.cssText = 'display:flex;gap:.4rem;align-items:center;margin-bottom:.5rem';
  var inp = document.createElement('input');
  inp.className = 'modal-input limp-tarea-inp';
  inp.value = nombre;
  inp.placeholder = 'Nombre de la tarea...';
  inp.style.flex = '1';
  var del = document.createElement('button');
  del.className = 'univ-materia-del';
  del.style.color = '#c77';
  del.textContent = '✕';
  del.onclick = function() { wrap.remove(); };
  topRow.appendChild(inp); topRow.appendChild(del);

  // Frequency row
  var freqRow = document.createElement('div');
  freqRow.style.cssText = 'display:flex;flex-wrap:wrap;gap:.3rem;align-items:center';

  var freqOpts = [
    { val: 'diaria', label: '🌅 Diaria' },
    { val: 'semanal', label: '📅 Semanal' },
    { val: 'mensual', label: '🗓️ Mensual' },
    { val: 'dias', label: '📆 Días específicos' },
    { val: 'personalizada', label: '✏️ Personalizada' },
  ];

  var sel = document.createElement('select');
  sel.className = 'modal-input limp-freq-sel';
  sel.style.cssText = 'font-size:.7rem;padding:.2rem .4rem;flex:1;min-width:120px';
  freqOpts.forEach(function(o) {
    var opt = document.createElement('option');
    opt.value = o.val; opt.textContent = o.label;
    if (freq.tipo === o.val) opt.selected = true;
    sel.appendChild(opt);
  });
  freqRow.appendChild(sel);

  // Days checkboxes (visible when dias)
  var diasWrap = document.createElement('div');
  diasWrap.className = 'limp-dias-wrap';
  diasWrap.style.cssText = 'display:' + (freq.tipo === 'dias' ? 'flex' : 'none') + ';flex-wrap:wrap;gap:.25rem;margin-top:.3rem;width:100%';
  ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'].forEach(function(d, i) {
    var lbl = document.createElement('label');
    lbl.style.cssText = 'display:flex;align-items:center;gap:.2rem;font-size:.65rem;font-weight:700;cursor:pointer;background:var(--surface);border:1px solid var(--border);border-radius:8px;padding:.2rem .4rem';
    var cb = document.createElement('input');
    cb.type = 'checkbox'; cb.value = i; cb.className = 'limp-dia-cb';
    if (freq.dias && freq.dias.indexOf(i) !== -1) cb.checked = true;
    lbl.appendChild(cb);
    lbl.appendChild(document.createTextNode(d));
    diasWrap.appendChild(lbl);
  });

  // Custom fields (visible when personalizada)
  var customWrap = document.createElement('div');
  customWrap.className = 'limp-custom-wrap';
  customWrap.style.cssText = 'display:' + (freq.tipo === 'personalizada' ? 'flex' : 'none') + ';gap:.3rem;align-items:center;margin-top:.3rem;width:100%';
  customWrap.innerHTML = '<span style="font-size:.7rem;font-weight:700;color:var(--muted)">Cada</span>';
  var nInp = document.createElement('input');
  nInp.type = 'number'; nInp.min = '1'; nInp.value = (freq.cadaN || 1);
  nInp.className = 'modal-input limp-cadan-inp';
  nInp.style.cssText = 'width:50px;font-size:.75rem;padding:.2rem .4rem';
  var unidadSel = document.createElement('select');
  unidadSel.className = 'modal-input limp-unidad-sel';
  unidadSel.style.cssText = 'font-size:.7rem;padding:.2rem .4rem';
  ['días','semanas','meses'].forEach(function(u) {
    var o = document.createElement('option'); o.value = u; o.textContent = u;
    if ((freq.unidad || 'días') === u) o.selected = true;
    unidadSel.appendChild(o);
  });
  customWrap.appendChild(nInp); customWrap.appendChild(unidadSel);

  sel.onchange = function() {
    diasWrap.style.display = sel.value === 'dias' ? 'flex' : 'none';
    customWrap.style.display = sel.value === 'personalizada' ? 'flex' : 'none';
  };

  wrap.appendChild(topRow);
  wrap.appendChild(freqRow);
  wrap.appendChild(diasWrap);
  wrap.appendChild(customWrap);
  wrap._getFreq = function() {
    var tipo = sel.value;
    if (tipo === 'dias') {
      var checked = [];
      wrap.querySelectorAll('.limp-dia-cb:checked').forEach(function(cb){ checked.push(parseInt(cb.value)); });
      return { tipo: 'dias', dias: checked };
    }
    if (tipo === 'personalizada') {
      return { tipo: 'personalizada', cadaN: parseInt(nInp.value)||1, unidad: unidadSel.value };
    }
    return { tipo: tipo };
  };
  wrap._getNombre = function() { return inp.value.trim(); };
  return wrap;
}

function openLimpiezaAreaModal(editIdx) {
  var editing = editIdx !== null && editIdx !== undefined;
  var area = editing ? limpiezaData[editIdx] : { id: 'l_' + Date.now(), nombre: '', emoji: '🧹', tareas: [] };
  var back = document.createElement('div');
  back.className = 'rutina-modal-backdrop';
  back.onclick = function(e) { if (e.target === back) back.remove(); };
  var box = document.createElement('div');
  box.className = 'rutina-modal-box';
  box.style.maxHeight = '90vh';
  box.style.overflowY = 'auto';

  // Header
  var title = document.createElement('div');
  title.className = 'rutina-modal-title';
  title.innerHTML = (editing ? '✏️' : '🧹') + ' <em>' + (editing ? 'Editar' : 'Nueva') + ' área</em>';
  box.appendChild(title);

  // Emoji + nombre
  var emojiField = document.createElement('div');
  emojiField.className = 'modal-field';
  emojiField.innerHTML = '<label class="modal-label">Emoji</label><input class="modal-input" id="limpEmoji" value="' + area.emoji + '" style="width:70px;text-align:center;font-size:1.2rem">';
  box.appendChild(emojiField);

  var nombreField = document.createElement('div');
  nombreField.className = 'modal-field';
  nombreField.style.marginTop = '.7rem';
  nombreField.innerHTML = '<label class="modal-label">Nombre del área</label><input class="modal-input" id="limpNombre" value="' + area.nombre + '" placeholder="ej: Cuarto, Baño..." style="width:100%">';
  box.appendChild(nombreField);

  // Tareas
  var tareasField = document.createElement('div');
  tareasField.className = 'modal-field';
  tareasField.style.marginTop = '.9rem';
  var tareasLbl = document.createElement('label');
  tareasLbl.className = 'modal-label';
  tareasLbl.textContent = 'Tareas y frecuencia';
  tareasField.appendChild(tareasLbl);

  var tareasList = document.createElement('div');
  tareasList.id = 'limpTareasList';
  tareasField.appendChild(tareasList);
  area.tareas.forEach(function(t) { tareasList.appendChild(makeTareaRow(t)); });

  var addBtn = document.createElement('button');
  addBtn.className = 'belleza-reset-btn';
  addBtn.style.marginTop = '.4rem';
  addBtn.textContent = '＋ Agregar tarea';
  addBtn.onclick = function() {
    var row = makeTareaRow(null);
    tareasList.appendChild(row);
    row.querySelector('.limp-tarea-inp').focus();
  };
  tareasField.appendChild(addBtn);
  box.appendChild(tareasField);

  // Buttons
  var btns = document.createElement('div');
  btns.className = 'modal-btns';
  btns.style.marginTop = '1.2rem';
  if (editing) {
    var delBtn = document.createElement('button');
    delBtn.className = 'modal-btn-delete';
    delBtn.textContent = '⋯ Eliminar';
    delBtn.onclick = function() {
      kittyConfirm('¿Eliminar "' + area.nombre + '"?', function() {
        limpiezaData.splice(editIdx, 1);
        saveLimpieza(); renderLimpieza(); back.remove();
      });
    };
    btns.appendChild(delBtn);
  }
  var cancelBtn = document.createElement('button');
  cancelBtn.className = 'modal-btn-cancel';
  cancelBtn.textContent = 'Cancelar';
  cancelBtn.onclick = function() { back.remove(); };
  var saveBtn = document.createElement('button');
  saveBtn.className = 'modal-btn-save';
  saveBtn.textContent = 'Guardar 🧹';
  saveBtn.onclick = function() {
    var nombre = document.getElementById('limpNombre').value.trim();
    if (!nombre) return;
    var emoji = document.getElementById('limpEmoji').value.trim() || '🧹';
    var tareas = [];
    box.querySelectorAll('.limp-tarea-block').forEach(function(block) {
      var n = block._getNombre ? block._getNombre() : '';
      if (n) {
        var existing = area.tareas.find(function(t){ return t.nombre === n; });
        tareas.push({
          id: (existing && existing.id) || ('t_' + Date.now() + Math.random()),
          nombre: n,
          done: (existing && existing.done) || false,
          lastDone: (existing && existing.lastDone) || null,
          freq: block._getFreq ? block._getFreq() : { tipo: 'diaria' }
        });
      }
    });
    if (editing) {
      limpiezaData[editIdx].nombre = nombre;
      limpiezaData[editIdx].emoji = emoji;
      limpiezaData[editIdx].tareas = tareas;
    } else {
      area.nombre = nombre; area.emoji = emoji; area.tareas = tareas;
      limpiezaData.push(area);
    }
    saveLimpieza(); renderLimpieza(); back.remove();
  };
  btns.appendChild(cancelBtn);
  btns.appendChild(saveBtn);
  box.appendChild(btns);

  back.appendChild(box);
  document.body.appendChild(back);
  document.getElementById('limpNombre').focus();
}

// Cloud sync
if (typeof window.syncFromCloud !== 'undefined') {
  var _origSyncLimp = window.syncFromCloud;
  window.syncFromCloud = function() {
    if (window._limpiezaData) limpiezaData = window._limpiezaData;
    if (_origSyncLimp) _origSyncLimp();
    if (typeof renderLimpieza === 'function') renderLimpieza();
  };
}

loadLimpieza();
document.addEventListener('DOMContentLoaded', function() {
  var addBtn = document.getElementById('limpiezaAddAreaBtn');
  if (addBtn) addBtn.onclick = function() { openLimpiezaAreaModal(null); };
  renderLimpieza();
});



// ============================================================
//  RUTINAS RECURRENTES DE LIMPIEZA
// ============================================================
// Estructura: [{ id, nombre, emoji, freq:{tipo,dias?,cadaN?,unidad?,diasMes?},
//               pasos:[{id,nombre,nota}], sesiones:[{fecha,pasosDone:[ids]}],
//               ultimaCompletada:null|fecha }]

var limpRutinas = [];

var DIAS_LIMP_RUT = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];

function saveLimpRutinas() {
  try { localStorage.setItem('limp_rutinas', JSON.stringify(limpRutinas)); } catch(e){}
  if (window.cloudSave) window.cloudSave('limp_rutinas', limpRutinas);
}

function loadLimpRutinas() {
  limpRutinas = (window._limpRutinas) || JSON.parse(localStorage.getItem('limp_rutinas') || '[]');
  if (limpRutinas.length === 0) {
    limpRutinas = [
      { id:'lr1', nombre:'Limpiar refrigerador', emoji:'🧊',
        freq:{ tipo:'personalizada', cadaN:2, unidad:'semanas' },
        pasos:[
          { id:'p1', nombre:'Sacar todos los alimentos', nota:'' },
          { id:'p2', nombre:'Retirar cajones y repisas', nota:'Lavar con agua y jabón' },
          { id:'p3', nombre:'Limpiar interior con vinagre', nota:'Mezcla 1:1 con agua' },
          { id:'p4', nombre:'Limpiar exterior y manijas', nota:'' },
          { id:'p5', nombre:'Reorganizar alimentos', nota:'Verificar fechas de caducidad' },
        ],
        sesiones:[], ultimaCompletada:null
      }
    ];
  }
}

function limpRutFreqLabel(freq) {
  if (!freq) return '';
  if (freq.tipo === 'diaria') return '🌅 Diaria';
  if (freq.tipo === 'semanal') return '📅 Semanal';
  if (freq.tipo === 'mensual') return '🗓️ Mensual';
  if (freq.tipo === 'dias') {
    if (!freq.dias || !freq.dias.length) return '📆 Días específicos';
    return '📆 ' + freq.dias.map(function(d){ return DIAS_LIMP_RUT[d]; }).join(', ');
  }
  if (freq.tipo === 'personalizada') return '🔁 Cada ' + freq.cadaN + ' ' + (freq.unidad || 'días');
  return '';
}

function limpRutNextDue(rut) {
  var freq = rut.freq;
  var ultima = rut.ultimaCompletada ? new Date(rut.ultimaCompletada) : null;
  var hoy = new Date(); hoy.setHours(0,0,0,0);

  if (!ultima) return hoy; // nunca hecha → due hoy

  var sig = new Date(ultima); sig.setHours(0,0,0,0);

  if (freq.tipo === 'diaria') { sig.setDate(sig.getDate()+1); }
  else if (freq.tipo === 'semanal') { sig.setDate(sig.getDate()+7); }
  else if (freq.tipo === 'mensual') { sig.setMonth(sig.getMonth()+1); }
  else if (freq.tipo === 'personalizada') {
    var n = parseInt(freq.cadaN) || 1;
    if (freq.unidad === 'días' || freq.unidad === 'dias') sig.setDate(sig.getDate()+n);
    else if (freq.unidad === 'semanas') sig.setDate(sig.getDate()+n*7);
    else if (freq.unidad === 'meses') sig.setMonth(sig.getMonth()+n);
  } else if (freq.tipo === 'dias') {
    // próximo día de la semana permitido
    sig.setDate(sig.getDate()+1);
    var dias = freq.dias || [];
    for (var i=0; i<8; i++) {
      if (dias.indexOf(sig.getDay()) !== -1) break;
      sig.setDate(sig.getDate()+1);
    }
  }
  return sig;
}

function limpRutDueLabel(rut) {
  var due = limpRutNextDue(rut);
  var hoy = new Date(); hoy.setHours(0,0,0,0);
  var diff = Math.round((due - hoy) / 86400000);
  if (diff < 0) return { label: 'Vencida hace ' + Math.abs(diff) + ' día' + (Math.abs(diff)>1?'s':''), cls:'overdue' };
  if (diff === 0) return { label: '¡Toca hoy! 🌟', cls:'today-due' };
  if (diff === 1) return { label: 'Mañana', cls:'' };
  return { label: 'En ' + diff + ' días', cls:'' };
}

function getTodaySesion(rut) {
  var today = dateKey(new Date());
  return rut.sesiones.find(function(s){ return s.fecha === today; }) || null;
}

function getOrCreateTodaySesion(rut) {
  var today = dateKey(new Date());
  var ses = rut.sesiones.find(function(s){ return s.fecha === today; });
  if (!ses) {
    ses = { fecha: today, pasosDone: [] };
    rut.sesiones.push(ses);
  }
  return ses;
}

function renderLimpRutinas() {
  var wrap = document.getElementById('limpRutinasWrap');
  if (!wrap) return;
  wrap.innerHTML = '';

  if (limpRutinas.length === 0) {
    wrap.innerHTML = '<p style="font-size:.75rem;color:var(--muted);text-align:center;padding:1.2rem 0;">Aún no tienes rutinas. ¡Crea la primera! 🧹</p>';
    return;
  }

  limpRutinas.forEach(function(rut, rIdx) {
    var sesHoy = getTodaySesion(rut);
    var doneCount = sesHoy ? sesHoy.pasosDone.length : 0;
    var totalPasos = rut.pasos.length;
    var pct = totalPasos > 0 ? Math.round((doneCount/totalPasos)*100) : 0;
    var dueInfo = limpRutDueLabel(rut);

    var card = document.createElement('div');
    card.className = 'limp-rut-card';

    // Header
    var hdr = document.createElement('div');
    hdr.className = 'limp-rut-hdr';
    hdr.innerHTML =
      '<span class="limp-rut-emoji">' + rut.emoji + '</span>' +
      '<div class="limp-rut-info">' +
        '<div class="limp-rut-name">' + rut.nombre + '</div>' +
        '<div class="limp-rut-meta">' +
          '<span class="limp-rut-freq-badge">' + limpRutFreqLabel(rut.freq) + '</span>' +
          '<span class="limp-rut-due ' + dueInfo.cls + '">' + dueInfo.label + '</span>' +
        '</div>' +
        '<div class="limp-rut-bar-wrap"><div class="limp-rut-bar" style="width:' + pct + '%"></div></div>' +
      '</div>' +
      '<div class="limp-rut-actions">' +
        (doneCount > 0 ? '<span class="limp-rut-progress">' + doneCount + '/' + totalPasos + '</span>' : '') +
        '<button class="rut-action-btn" style="font-size:.65rem" data-edit="' + rIdx + '">✏️</button>' +
        '<span style="font-size:.75rem;color:var(--muted);transition:transform .2s" class="limp-rut-chevron">▾</span>' +
      '</div>';
    card.appendChild(hdr);

    // Body con pasos
    var body = document.createElement('div');
    body.className = 'limp-rut-body';

    rut.pasos.forEach(function(paso, pIdx) {
      var isDone = sesHoy && sesHoy.pasosDone.indexOf(paso.id) !== -1;
      var row = document.createElement('div');
      row.className = 'limp-rut-step-row';
      row.innerHTML =
        '<div class="limp-rut-step-num' + (isDone?' done':'') + '">' + (isDone ? '✓' : (pIdx+1)) + '</div>' +
        '<div style="flex:1">' +
          '<div class="limp-rut-step-name' + (isDone?' done':'') + '">' + paso.nombre + '</div>' +
          (paso.nota ? '<div class="limp-rut-step-note">💡 ' + paso.nota + '</div>' : '') +
        '</div>';
      row.onclick = function() {
        var ses = getOrCreateTodaySesion(rut);
        var idx = ses.pasosDone.indexOf(paso.id);
        if (idx === -1) ses.pasosDone.push(paso.id);
        else ses.pasosDone.splice(idx, 1);
        saveLimpRutinas(); renderLimpRutinas();
        // re-open this card
        setTimeout(function(){
          var cards = document.querySelectorAll('.limp-rut-card');
          if (cards[rIdx]) {
            var b = cards[rIdx].querySelector('.limp-rut-body');
            if (b) { b.classList.add('open'); cards[rIdx].querySelector('.limp-rut-chevron').style.transform='rotate(180deg)'; }
          }
        }, 30);
      };
      body.appendChild(row);
    });

    // Botón completar rutina
    var allDone = sesHoy && sesHoy.pasosDone.length >= totalPasos && totalPasos > 0;
    var complBtn = document.createElement('button');
    complBtn.className = 'limp-rut-complete-btn';
    complBtn.textContent = allDone ? '✅ ¡Rutina completada hoy!' : '🎉 Marcar rutina como completada';
    complBtn.disabled = allDone;
    if (!allDone) {
      complBtn.onclick = function(e) {
        e.stopPropagation();
        var ses = getOrCreateTodaySesion(rut);
        rut.pasos.forEach(function(p){ if (ses.pasosDone.indexOf(p.id)===-1) ses.pasosDone.push(p.id); });
        rut.ultimaCompletada = dateKey(new Date());
        if (window.starBurst) window.starBurst(complBtn);
        saveLimpRutinas(); renderLimpRutinas();
        setTimeout(function(){
          var cards = document.querySelectorAll('.limp-rut-card');
          if (cards[rIdx]) {
            var b = cards[rIdx].querySelector('.limp-rut-body');
            if (b) { b.classList.add('open'); cards[rIdx].querySelector('.limp-rut-chevron').style.transform='rotate(180deg)'; }
          }
        }, 30);
      };
    }
    body.appendChild(complBtn);
    card.appendChild(body);

    // Toggle body
    hdr.onclick = function(e) {
      if (e.target.closest('[data-edit]')) return;
      body.classList.toggle('open');
      var ch = hdr.querySelector('.limp-rut-chevron');
      ch.style.transform = body.classList.contains('open') ? 'rotate(180deg)' : '';
    };

    // Edit button
    hdr.querySelector('[data-edit]').onclick = function(e) {
      e.stopPropagation();
      openLimpRutinaModal(rIdx);
    };

    wrap.appendChild(card);
  });
}

// ── Modal crear/editar rutina recurrente ──
function openLimpRutinaModal(editIdx) {
  var editing = editIdx !== null && editIdx !== undefined;
  var rut = editing
    ? JSON.parse(JSON.stringify(limpRutinas[editIdx]))
    : { id:'lr_'+Date.now(), nombre:'', emoji:'🧹', freq:{tipo:'semanal'}, pasos:[], sesiones:[], ultimaCompletada:null };

  var back = document.createElement('div');
  back.className = 'rutina-modal-backdrop';
  back.onclick = function(e){ if (e.target===back) back.remove(); };

  var box = document.createElement('div');
  box.className = 'rutina-modal-box';
  box.style.cssText = 'max-height:90vh;overflow-y:auto;';

  box.innerHTML = '<div class="rutina-modal-title">' + (editing?'✏️':'🧹') + ' <em>' + (editing?'Editar':'Nueva') + ' rutina</em></div>';

  // Emoji + Nombre
  var f1 = document.createElement('div'); f1.className = 'modal-field';
  f1.innerHTML = '<label class="modal-label">Emoji</label><input class="modal-input" id="lrEmoji" value="'+rut.emoji+'" style="width:70px;text-align:center;font-size:1.2rem">';
  box.appendChild(f1);

  var f2 = document.createElement('div'); f2.className = 'modal-field'; f2.style.marginTop='.7rem';
  f2.innerHTML = '<label class="modal-label">Nombre de la rutina</label><input class="modal-input" id="lrNombre" value="'+rut.nombre+'" placeholder="ej: Limpiar refrigerador..." style="width:100%">';
  box.appendChild(f2);

  // Frecuencia
  var fFreq = document.createElement('div'); fFreq.className = 'modal-field'; fFreq.style.marginTop='.9rem';
  fFreq.innerHTML = '<label class="modal-label">¿Con qué frecuencia?</label>';

  var freqOpts = [
    {val:'diaria',label:'🌅 Todos los días'},
    {val:'semanal',label:'📅 Cada semana'},
    {val:'mensual',label:'🗓️ Cada mes'},
    {val:'dias',label:'📆 Días específicos de la semana'},
    {val:'personalizada',label:'✏️ Personalizada (cada N días/semanas/meses)'},
  ];
  var selFreq = document.createElement('select');
  selFreq.className = 'modal-input'; selFreq.id = 'lrFreqTipo';
  selFreq.style.cssText = 'width:100%;font-size:.78rem';
  freqOpts.forEach(function(o){
    var opt = document.createElement('option'); opt.value=o.val; opt.textContent=o.label;
    if (rut.freq.tipo===o.val) opt.selected=true;
    selFreq.appendChild(opt);
  });
  fFreq.appendChild(selFreq);

  // Días específicos
  var diasWrap = document.createElement('div');
  diasWrap.style.cssText = 'display:'+(rut.freq.tipo==='dias'?'flex':'none')+';flex-wrap:wrap;gap:.3rem;margin-top:.5rem;';
  DIAS_LIMP_RUT.forEach(function(d,i){
    var lbl = document.createElement('label');
    lbl.style.cssText='display:flex;align-items:center;gap:.2rem;font-size:.68rem;font-weight:700;cursor:pointer;background:var(--surface);border:1px solid var(--border);border-radius:8px;padding:.25rem .5rem';
    var cb = document.createElement('input'); cb.type='checkbox'; cb.value=i; cb.className='lr-dia-cb';
    if (rut.freq.dias && rut.freq.dias.indexOf(i)!==-1) cb.checked=true;
    lbl.appendChild(cb); lbl.appendChild(document.createTextNode(d));
    diasWrap.appendChild(lbl);
  });
  fFreq.appendChild(diasWrap);

  // Personalizada
  var customWrap = document.createElement('div');
  customWrap.style.cssText = 'display:'+(rut.freq.tipo==='personalizada'?'flex':'none')+';gap:.4rem;align-items:center;margin-top:.5rem;';
  customWrap.innerHTML = '<span style="font-size:.75rem;font-weight:700;color:var(--muted)">Cada</span>';
  var nInp = document.createElement('input');
  nInp.type='number'; nInp.min='1'; nInp.value=rut.freq.cadaN||2;
  nInp.className='modal-input'; nInp.id='lrCadaN';
  nInp.style.cssText='width:60px;font-size:.78rem';
  var unidadSel = document.createElement('select');
  unidadSel.className='modal-input'; unidadSel.id='lrUnidad';
  unidadSel.style.cssText='font-size:.75rem';
  ['días','semanas','meses'].forEach(function(u){
    var o=document.createElement('option'); o.value=u; o.textContent=u;
    if ((rut.freq.unidad||'semanas')===u) o.selected=true;
    unidadSel.appendChild(o);
  });
  customWrap.appendChild(nInp); customWrap.appendChild(unidadSel);
  fFreq.appendChild(customWrap);

  selFreq.onchange = function(){
    diasWrap.style.display = selFreq.value==='dias'?'flex':'none';
    customWrap.style.display = selFreq.value==='personalizada'?'flex':'none';
  };
  box.appendChild(fFreq);

  // Pasos
  var fPasos = document.createElement('div'); fPasos.className='modal-field'; fPasos.style.marginTop='.9rem';
  fPasos.innerHTML = '<label class="modal-label">Pasos en orden 📋</label><p style="font-size:.68rem;color:var(--muted);margin-bottom:.5rem">Agrega cada paso que hay que hacer. El orden importa.</p>';
  var pasosList = document.createElement('div'); pasosList.id='lrPasosList';
  fPasos.appendChild(pasosList);

  function makePasoRow(p) {
    p = p || { id:'p_'+Date.now()+Math.random(), nombre:'', nota:'' };
    var row = document.createElement('div');
    row.style.cssText='display:flex;gap:.4rem;align-items:flex-start;margin-bottom:.5rem;background:var(--bg);border:1px solid var(--border);border-radius:10px;padding:.5rem .6rem';
    row.innerHTML =
      '<div style="display:flex;flex-direction:column;gap:.3rem;flex:1">' +
        '<input class="modal-input lr-paso-nombre" value="'+p.nombre+'" placeholder="Nombre del paso..." style="font-size:.78rem">' +
        '<input class="modal-input lr-paso-nota" value="'+(p.nota||'')+'" placeholder="Nota opcional (tip, ingrediente, etc)..." style="font-size:.7rem;color:var(--muted)">' +
      '</div>' +
      '<div style="display:flex;flex-direction:column;gap:.25rem">' +
        '<button class="univ-materia-del lr-paso-del" style="color:#c77;font-size:.7rem" title="Eliminar">✕</button>' +
        '<button class="univ-materia-del lr-paso-up" style="font-size:.7rem" title="Subir">▲</button>' +
        '<button class="univ-materia-del lr-paso-dn" style="font-size:.7rem" title="Bajar">▼</button>' +
      '</div>';
    row._pasoId = p.id;
    row.querySelector('.lr-paso-del').onclick = function(){ row.remove(); };
    row.querySelector('.lr-paso-up').onclick = function(){
      var prev = row.previousElementSibling;
      if (prev) pasosList.insertBefore(row, prev);
    };
    row.querySelector('.lr-paso-dn').onclick = function(){
      var next = row.nextElementSibling;
      if (next) pasosList.insertBefore(next, row);
    };
    return row;
  }
  rut.pasos.forEach(function(p){ pasosList.appendChild(makePasoRow(p)); });

  var addPasoBtn = document.createElement('button');
  addPasoBtn.className='belleza-reset-btn'; addPasoBtn.style.marginTop='.4rem';
  addPasoBtn.textContent='＋ Agregar paso';
  addPasoBtn.onclick = function(){
    var r = makePasoRow(null);
    pasosList.appendChild(r);
    r.querySelector('.lr-paso-nombre').focus();
  };
  fPasos.appendChild(addPasoBtn);
  box.appendChild(fPasos);

  // Botones
  var btns = document.createElement('div'); btns.className='modal-btns'; btns.style.marginTop='1.2rem';
  if (editing) {
    var delBtn = document.createElement('button'); delBtn.className='modal-btn-delete'; delBtn.textContent='⋯ Eliminar';
    delBtn.onclick = function(){
      kittyConfirm('¿Eliminar "' + limpRutinas[editIdx].nombre + '"?', function() {
        limpRutinas.splice(editIdx,1);
        saveLimpRutinas(); renderLimpRutinas(); back.remove();
      });
    };
    btns.appendChild(delBtn);
  }
  var cancelBtn = document.createElement('button'); cancelBtn.className='modal-btn-cancel'; cancelBtn.textContent='Cancelar';
  cancelBtn.onclick = function(){ back.remove(); };
  var saveBtn = document.createElement('button'); saveBtn.className='modal-btn-save'; saveBtn.textContent='Guardar 🧹';
  saveBtn.onclick = function(){
    var nombre = document.getElementById('lrNombre').value.trim();
    if (!nombre) { document.getElementById('lrNombre').focus(); return; }
    var emoji = document.getElementById('lrEmoji').value.trim() || '🧹';
    // Freq
    var tipoFreq = selFreq.value;
    var freq = { tipo: tipoFreq };
    if (tipoFreq === 'dias') {
      var dias = [];
      box.querySelectorAll('.lr-dia-cb:checked').forEach(function(cb){ dias.push(parseInt(cb.value)); });
      freq.dias = dias;
    } else if (tipoFreq === 'personalizada') {
      freq.cadaN = parseInt(document.getElementById('lrCadaN').value)||2;
      freq.unidad = document.getElementById('lrUnidad').value;
    }
    // Pasos
    var pasos = [];
    box.querySelectorAll('#lrPasosList > div').forEach(function(row){
      var n = row.querySelector('.lr-paso-nombre').value.trim();
      if (n) pasos.push({ id: row._pasoId || ('p_'+Date.now()+Math.random()), nombre:n, nota: row.querySelector('.lr-paso-nota').value.trim() });
    });
    if (editing) {
      limpRutinas[editIdx].nombre = nombre;
      limpRutinas[editIdx].emoji = emoji;
      limpRutinas[editIdx].freq = freq;
      limpRutinas[editIdx].pasos = pasos;
    } else {
      rut.nombre=nombre; rut.emoji=emoji; rut.freq=freq; rut.pasos=pasos;
      limpRutinas.push(rut);
    }
    saveLimpRutinas(); renderLimpRutinas(); back.remove();
  };
  btns.appendChild(cancelBtn); btns.appendChild(saveBtn);
  box.appendChild(btns);

  back.appendChild(box);
  document.body.appendChild(back);
  document.getElementById('lrNombre').focus();
}

loadLimpRutinas();
document.addEventListener('DOMContentLoaded', function(){
  var addBtn = document.getElementById('limpRutinaAddBtn');
  if (addBtn) addBtn.onclick = function(){ openLimpRutinaModal(null); };
  renderLimpRutinas();
});



// ============================================================
//  FINANZAS
// ============================================================
// categorias: [{ id, nombre, emoji, color, presupuesto }]
// movimientos: [{ id, tipo:'gasto'|'ingreso', categoriaId, monto, desc, fecha }]

var finCategorias = [];
var finMovimientos = [];
var finPeriod = 'mes'; // 'mes' | 'semana'

var FIN_CAT_DEFAULTS = [
  { id:'fc1', nombre:'Comida',      emoji:'🌸', color:'#f9a8d4', presupuesto:0 },
  { id:'fc2', nombre:'Higiene',     emoji:'🫧', color:'#c4b5fd', presupuesto:0 },
  { id:'fc3', nombre:'Belleza',     emoji:'🪷', color:'#f0abfc', presupuesto:0 },
  { id:'fc4', nombre:'Videojuegos', emoji:'⭐', color:'#fde68a', presupuesto:0 },
  { id:'fc5', nombre:'Universidad', emoji:'🌱', color:'#6ee7b7', presupuesto:0 },
  { id:'fc6', nombre:'Transporte',  emoji:'🫧', color:'#bae6fd', presupuesto:0 },
  { id:'fc7', nombre:'Ropa',        emoji:'🦄', color:'#ddd6fe', presupuesto:0 },
  { id:'fc8', nombre:'Ingresos',    emoji:'🌱', color:'#6ee7b7', presupuesto:0 },
];

var FIN_COLORS = ['#f9a8d4','#f0abfc','#c4b5fd','#ddd6fe','#bae6fd','#6ee7b7','#fde68a','#fca5a5','#fdba74','#a5f3fc'];

function saveFinanzas() {
  var data = { categorias: finCategorias, movimientos: finMovimientos };
  try { localStorage.setItem('finanzas_data', JSON.stringify(data)); } catch(e){}
  if (window.cloudSave) window.cloudSave('finanzas_data', data);
}

function loadFinanzas() {
  var raw = window._finanzasData || JSON.parse(localStorage.getItem('finanzas_data') || 'null');
  if (raw) {
    finCategorias  = raw.categorias  || FIN_CAT_DEFAULTS;
    finMovimientos = raw.movimientos || [];
  } else {
    finCategorias  = FIN_CAT_DEFAULTS;
    finMovimientos = [];
  }
}

function finDateKey(d) {
  return d.toISOString().slice(0,10);
}

function finGetPeriodMovs() {
  var now = new Date();
  return finMovimientos.filter(function(m) {
    var d = new Date(m.fecha);
    if (finPeriod === 'mes') {
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
    } else {
      // semana: usar getWeekDates si existe
      var dates = (typeof getWeekDates === 'function') ? getWeekDates(0) : null;
      if (dates) {
        var dk = finDateKey(d);
        var start = finDateKey(dates[0]);
        var end   = finDateKey(dates[dates.length-1]);
        return dk >= start && dk <= end;
      }
      var day = now.getDay();
      var mon = new Date(now); mon.setDate(now.getDate() - (day === 0 ? 6 : day-1));
      var sun = new Date(mon); sun.setDate(mon.getDate() + 6);
      return d >= mon && d <= sun;
    }
  });
}

function finFormatMoney(n) {
  return '$' + n.toLocaleString('es-MX', { minimumFractionDigits:2, maximumFractionDigits:2 });
}

function renderFinanzas() {
  var wrap = document.getElementById('finCatsList');
  if (!wrap) return;

  var movs = finGetPeriodMovs();
  var totalGastos   = 0;
  var totalIngresos = 0;
  movs.forEach(function(m) {
    if (m.tipo === 'gasto')   totalGastos   += m.monto;
    if (m.tipo === 'ingreso') totalIngresos += m.monto;
  });
  var balance = totalIngresos - totalGastos;

  // Balance card
  var ig = document.getElementById('finTotalIngresos');
  var gg = document.getElementById('finTotalGastos');
  var bg = document.getElementById('finBalance');
  if (ig) ig.textContent = finFormatMoney(totalIngresos);
  if (gg) gg.textContent = finFormatMoney(totalGastos);
  if (bg) {
    bg.textContent = finFormatMoney(Math.abs(balance));
    bg.className = 'fin-balance-total-val ' + (balance >= 0 ? 'positivo' : 'negativo');
    bg.textContent = (balance < 0 ? '-' : '') + finFormatMoney(Math.abs(balance));
  }

  // Gráfica pastel
  renderFinPie(movs);

  // Categorías con barras
  wrap.innerHTML = '';
  var gastoCats = {};
  movs.filter(function(m){ return m.tipo === 'gasto'; }).forEach(function(m) {
    gastoCats[m.categoriaId] = (gastoCats[m.categoriaId] || 0) + m.monto;
  });

  finCategorias.filter(function(c){ return c.nombre !== 'Ingresos'; }).forEach(function(cat, cIdx) {
    var gastado  = gastoCats[cat.id] || 0;
    var presup   = cat.presupuesto || 0;
    var pct      = presup > 0 ? Math.min((gastado / presup) * 100, 100) : 0;
    var over     = presup > 0 && gastado > presup;

    var card = document.createElement('div');
    card.className = 'fin-cat-card';
    card.innerHTML =
      '<div class="fin-cat-hdr">' +
        '<span class="fin-cat-emoji">' + cat.emoji + '</span>' +
        '<span class="fin-cat-name">' + cat.nombre + '</span>' +
        '<div class="fin-cat-amounts">' +
          '<span class="fin-cat-spent">' + finFormatMoney(gastado) + '</span>' +
          (presup > 0 ? '<span class="fin-cat-budget">/ ' + finFormatMoney(presup) + '</span>' : '') +
        '</div>' +
        '<button class="rut-action-btn" style="font-size:.6rem;margin-left:.3rem" data-catidx="' + cIdx + '">✏️</button>' +
      '</div>' +
      (presup > 0 ?
        '<div class="fin-prog-track"><div class="fin-prog-fill' + (over ? ' over' : '') + '" style="width:' + pct + '%;background:' + cat.color + '"></div></div>'
        : '') ;
    card.querySelector('[data-catidx]').onclick = function(e) {
      e.stopPropagation();
      openFinCatModal(cIdx);
    };
    wrap.appendChild(card);
  });

  // Movimientos lista
  var movWrap = document.getElementById('finMovsList');
  if (!movWrap) return;
  movWrap.innerHTML = '';
  var sorted = movs.slice().sort(function(a,b){ return b.fecha.localeCompare(a.fecha); });
  if (sorted.length === 0) {
    movWrap.innerHTML = '<div class="fin-empty">Sin movimientos en este período 🌸</div>';
    return;
  }
  sorted.forEach(function(mov, i) {
    var cat = finCategorias.find(function(c){ return c.id === mov.categoriaId; }) || {};
    var item = document.createElement('div');
    item.className = 'fin-mov-item';
    item.innerHTML =
      '<div class="fin-mov-emoji">' + (cat.emoji || (mov.tipo === 'ingreso' ? '💚' : '💸')) + '</div>' +
      '<div class="fin-mov-info">' +
        '<div class="fin-mov-desc">' + mov.desc + '</div>' +
        '<div class="fin-mov-meta">' + (cat.nombre || '') + ' · ' + mov.fecha + '</div>' +
      '</div>' +
      '<div class="fin-mov-amount ' + mov.tipo + '">' + (mov.tipo === 'gasto' ? '-' : '+') + finFormatMoney(mov.monto) + '</div>';
    item.onclick = function() { openFinMovModal(mov.id); };
    movWrap.appendChild(item);
  });
}

function renderFinPie(movs) {
  var canvas = document.getElementById('finPieChart');
  var legend = document.getElementById('finChartLegend');
  if (!canvas || !legend) return;
  var ctx = canvas.getContext('2d');
  var W = canvas.width, H = canvas.height, cx = W/2, cy = H/2, R = Math.min(W,H)/2 - 8;

  // Gastos por categoría
  var gastoCats = {};
  movs.filter(function(m){ return m.tipo === 'gasto'; }).forEach(function(m) {
    gastoCats[m.categoriaId] = (gastoCats[m.categoriaId] || 0) + m.monto;
  });
  var total = Object.values(gastoCats).reduce(function(a,b){ return a+b; }, 0);

  ctx.clearRect(0, 0, W, H);
  legend.innerHTML = '';

  if (total === 0) {
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI*2);
    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--surface').trim() || '#1a1a2e';
    ctx.fill();
    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--rosa').trim() || '#a78bfa';
    ctx.font = 'bold 11px var(--font-body)';
    ctx.textAlign = 'center';
    ctx.fillText('🌸 Sin gastos', cx, cy);
    return;
  }

  var angle = -Math.PI / 2;
  var cats = finCategorias.filter(function(c){ return gastoCats[c.id]; });

  cats.forEach(function(cat) {
    var val = gastoCats[cat.id] || 0;
    var slice = (val / total) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, R, angle, angle + slice);
    ctx.closePath();
    ctx.fillStyle = cat.color || '#f48fb1';
    ctx.fill();
    ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--bg').trim() || '#12121e';
    ctx.lineWidth = 2;
    ctx.stroke();
    angle += slice;

    // Legend
    var pct = Math.round((val/total)*100);
    var li = document.createElement('div');
    li.className = 'fin-legend-item';
    li.innerHTML =
      '<div class="fin-legend-dot" style="background:' + cat.color + '"></div>' +
      cat.emoji + ' ' + cat.nombre +
      '<span class="fin-legend-pct">' + pct + '%</span>';
    legend.appendChild(li);
  });

  // Hole (donut)
  ctx.beginPath();
  ctx.arc(cx, cy, R * 0.45, 0, Math.PI*2);
  ctx.fillStyle = '#fdf6f9';
  ctx.fill();
  ctx.fillStyle = '#c084fc';
  ctx.font = 'bold 10px var(--font-body)';
  ctx.textAlign = 'center';
  ctx.fillText('Gastos', cx, cy - 5);
  ctx.fillStyle = '#f472b6';
  ctx.font = 'bold 9px var(--font-body)';
  ctx.fillText(finFormatMoney(total), cx, cy + 9);
}

function openFinCatModal(editIdx) {
  var editing = editIdx !== null && editIdx !== undefined;
  var cat = editing ? finCategorias[editIdx] : { id:'fc_'+Date.now(), nombre:'', emoji:'🌸', color: FIN_COLORS[finCategorias.length % FIN_COLORS.length], presupuesto:0 };
  var back = document.createElement('div');
  back.className = 'rutina-modal-backdrop';
  back.onclick = function(e) { if(e.target===back) back.remove(); };
  var box = document.createElement('div');
  box.className = 'rutina-modal-box';
  box.innerHTML =
    '<div class="rutina-modal-title">' + (editing?'✏️':'💰') + ' <em>' + (editing?'Editar':'Nueva') + ' categoría</em></div>' +
    '<div class="modal-field"><label class="modal-label">Emoji</label>' +
    '<input class="modal-input" id="finCatEmoji" value="' + cat.emoji + '" style="width:60px;text-align:center;font-size:1.2rem"></div>' +
    '<div class="modal-field" style="margin-top:.6rem"><label class="modal-label">Nombre</label>' +
    '<input class="modal-input" id="finCatNombre" value="' + cat.nombre + '" placeholder="ej: Comida, Ropa..." style="width:100%"></div>' +
    '<div class="modal-field" style="margin-top:.6rem"><label class="modal-label">Color</label>' +
    '<input type="color" id="finCatColor" value="' + cat.color + '" style="width:50px;height:34px;border:none;border-radius:8px;cursor:pointer"></div>' +
    '<div class="modal-field" style="margin-top:.6rem"><label class="modal-label">Presupuesto límite (0 = sin límite)</label>' +
    '<input class="modal-input" id="finCatPresup" type="number" min="0" value="' + cat.presupuesto + '" style="width:100%"></div>' +
    '<div class="modal-btns" style="margin-top:1.2rem">' +
    (editing ? '<button class="modal-btn-delete" id="finCatDel">⋯ Eliminar</button>' : '') +
    '<button class="modal-btn-cancel" id="finCatCancel">Cancelar</button>' +
    '<button class="modal-btn-save" id="finCatSave">Guardar 💰</button></div>';
  back.appendChild(box);
  document.body.appendChild(back);
  document.getElementById('finCatCancel').onclick = function() { back.remove(); };
  var delBtn = document.getElementById('finCatDel');
  if (delBtn) delBtn.onclick = function() {
    kittyConfirm('¿Eliminar categoría "' + cat.nombre + '"?', function() {
      finCategorias.splice(editIdx,1);
      saveFinanzas(); renderFinanzas(); back.remove();
    });
  };
  document.getElementById('finCatSave').onclick = function() {
    var nombre = document.getElementById('finCatNombre').value.trim();
    if (!nombre) return;
    var emoji  = document.getElementById('finCatEmoji').value.trim() || '💰';
    var color  = document.getElementById('finCatColor').value;
    var presup = parseFloat(document.getElementById('finCatPresup').value) || 0;
    if (editing) {
      finCategorias[editIdx] = { id:cat.id, nombre, emoji, color, presupuesto:presup };
    } else {
      finCategorias.push({ id:cat.id, nombre, emoji, color, presupuesto:presup });
    }
    saveFinanzas(); renderFinanzas(); back.remove();
  };
  document.getElementById('finCatNombre').focus();
}

function openFinMovModal(editId) {
  var editing = editId !== null && editId !== undefined;
  var mov = editing ? finMovimientos.find(function(m){ return m.id===editId; }) : null;
  if (editing && !mov) return;
  if (!mov) mov = { id:'fm_'+Date.now(), tipo:'gasto', categoriaId: finCategorias[0] && finCategorias[0].id, monto:0, desc:'', fecha: finDateKey(new Date()) };

  var back = document.createElement('div');
  back.className = 'rutina-modal-backdrop';
  back.onclick = function(e) { if(e.target===back) back.remove(); };
  var box = document.createElement('div');
  box.className = 'rutina-modal-box';

  var catsOptions = finCategorias.map(function(c) {
    return '<option value="' + c.id + '"' + (c.id === mov.categoriaId ? ' selected' : '') + '>' + c.emoji + ' ' + c.nombre + '</option>';
  }).join('');

  box.innerHTML =
    '<div class="rutina-modal-title">💸 <em>' + (editing?'Editar':'Nuevo') + ' movimiento</em></div>' +
    '<div class="modal-field"><label class="modal-label">Tipo</label>' +
    '<div style="display:flex;gap:.5rem">' +
    '<button class="fin-tipo-btn' + (mov.tipo==='gasto'?' active':'') + '" data-tipo="gasto" style="flex:1">💸 Gasto</button>' +
    '<button class="fin-tipo-btn' + (mov.tipo==='ingreso'?' active':'') + '" data-tipo="ingreso" style="flex:1">💚 Ingreso</button>' +
    '</div></div>' +
    '<div class="modal-field" style="margin-top:.6rem"><label class="modal-label">Descripción</label>' +
    '<input class="modal-input" id="finMovDesc" value="' + (mov.desc||'') + '" placeholder="ej: Lonche, Uber..." style="width:100%"></div>' +
    '<div class="modal-field" style="margin-top:.6rem"><label class="modal-label">Monto</label>' +
    '<input class="modal-input" id="finMovMonto" type="number" min="0" step="0.01" value="' + (mov.monto||'') + '" placeholder="0.00" style="width:100%"></div>' +
    '<div class="modal-field" style="margin-top:.6rem"><label class="modal-label">Categoría</label>' +
    '<select class="modal-input" id="finMovCat" style="width:100%">' + catsOptions + '</select></div>' +
    '<div class="modal-field" style="margin-top:.6rem"><label class="modal-label">Fecha</label>' +
    '<input class="modal-input" id="finMovFecha" type="date" value="' + mov.fecha + '" style="width:100%"></div>' +
    '<div class="modal-btns" style="margin-top:1.2rem">' +
    (editing ? '<button class="modal-btn-delete" id="finMovDel">⋯ Eliminar</button>' : '') +
    '<button class="modal-btn-cancel" id="finMovCancel">Cancelar</button>' +
    '<button class="modal-btn-save" id="finMovSave">Guardar 💸</button></div>';

  back.appendChild(box);
  document.body.appendChild(back);

  // tipo toggle
  var tipoActual = mov.tipo;
  box.querySelectorAll('.fin-tipo-btn').forEach(function(btn) {
    btn.style.cssText = 'flex:1;padding:.4rem;border-radius:10px;border:1.5px solid var(--border);font-family:var(--font-body);font-size:.75rem;font-weight:700;cursor:pointer;background:var(--surface);color:var(--text);transition:all .2s';
    if (btn.dataset.tipo === tipoActual) { btn.style.background='var(--rosa)'; btn.style.color='#fff'; btn.style.borderColor='var(--rosa)'; }
    btn.onclick = function() {
      tipoActual = btn.dataset.tipo;
      box.querySelectorAll('.fin-tipo-btn').forEach(function(b) {
        b.style.background='var(--surface)'; b.style.color='var(--text)'; b.style.borderColor='var(--border)';
      });
      btn.style.background='var(--rosa)'; btn.style.color='#fff'; btn.style.borderColor='var(--rosa)';
    };
  });

  document.getElementById('finMovCancel').onclick = function() { back.remove(); };
  var delBtn = document.getElementById('finMovDel');
  if (delBtn) delBtn.onclick = function() {
    finMovimientos = finMovimientos.filter(function(m){ return m.id !== editId; });
    saveFinanzas(); renderFinanzas(); back.remove();
  };
  document.getElementById('finMovSave').onclick = function() {
    var desc  = document.getElementById('finMovDesc').value.trim();
    var monto = parseFloat(document.getElementById('finMovMonto').value);
    var catId = document.getElementById('finMovCat').value;
    var fecha = document.getElementById('finMovFecha').value;
    if (!desc || !monto || monto <= 0) return;
    var newMov = { id: mov.id, tipo: tipoActual, categoriaId: catId, monto: monto, desc: desc, fecha: fecha };
    if (editing) {
      var idx = finMovimientos.findIndex(function(m){ return m.id===editId; });
      finMovimientos[idx] = newMov;
    } else {
      finMovimientos.push(newMov);
    }
    saveFinanzas(); renderFinanzas(); back.remove();
  };
  document.getElementById('finMovDesc').focus();
}

loadFinanzas();
document.addEventListener('DOMContentLoaded', function() {
  var addCatBtn = document.getElementById('finAddCatBtn');
  if (addCatBtn) addCatBtn.onclick = function() { openFinCatModal(null); };
  var addMovBtn = document.getElementById('finAddMovBtn');
  if (addMovBtn) addMovBtn.onclick = function() { openFinMovModal(null); };

  var tabs = document.querySelectorAll('.fin-tab');
  tabs.forEach(function(tab) {
    tab.onclick = function() {
      tabs.forEach(function(t){ t.classList.remove('active'); });
      tab.classList.add('active');
      finPeriod = tab.dataset.period;
      renderFinanzas();
    };
  });

  renderFinanzas();
});




// ============================================================
//  RECETARIO
// ============================================================
// recetas: [{ id, nombre, categoria, receta, imgBase64 }]

var recetas = [];
var recCatActiva = 'todas';
var recSugIdx = -1;

var REC_CATS = ['Desayunos','Almuerzos','Bebidas'];
var REC_CAT_EMOJI = { 'Desayunos':'☀️', 'Almuerzos':'🌿', 'Bebidas':'🧃' };

function saveRecetario() {
  try { localStorage.setItem('recetario_data', JSON.stringify(recetas)); } catch(e){}
  if (window.cloudSave) window.cloudSave('recetario_data', recetas);
}

function loadRecetario() {
  recetas = window._recetarioData || JSON.parse(localStorage.getItem('recetario_data') || '[]');
}

function recShuffle() {
  if (recetas.length === 0) return;
  var idx;
  do { idx = Math.floor(Math.random() * recetas.length); } while (recetas.length > 1 && idx === recSugIdx);
  recSugIdx = idx;
  renderRecSugerencia();
}

function renderRecSugerencia() {
  var imgWrap  = document.getElementById('recSugImgWrap');
  var nombre   = document.getElementById('recSugNombre');
  var cat      = document.getElementById('recSugCat');
  if (!imgWrap || !nombre || !cat) return;

  if (recetas.length === 0) {
    imgWrap.textContent = '🍽️';
    nombre.textContent  = 'Añade tu primera receta 🌸';
    cat.textContent     = '';
    return;
  }
  if (recSugIdx < 0 || recSugIdx >= recetas.length) recSugIdx = 0;
  var r = recetas[recSugIdx];
  nombre.textContent = r.nombre;
  cat.textContent    = (REC_CAT_EMOJI[r.categoria] || '') + ' ' + r.categoria;

  imgWrap.innerHTML = '';
  if (r.imgBase64) {
    var img = document.createElement('img');
    img.src = r.imgBase64;
    img.className = 'rec-sug-img';
    imgWrap.appendChild(img);
  } else {
    imgWrap.className = 'rec-sug-img-empty';
    imgWrap.textContent = '🍽️';
  }
}

function renderRecGrid() {
  var grid = document.getElementById('recGrid');
  if (!grid) return;
  grid.innerHTML = '';

  var filtered = recCatActiva === 'todas'
    ? recetas
    : recetas.filter(function(r){ return r.categoria === recCatActiva; });

  if (filtered.length === 0) {
    grid.innerHTML = '<div class="rec-empty">Sin recetas aquí todavía 🌸<br>¡Añade la primera!</div>';
    return;
  }

  filtered.forEach(function(receta) {
    var card = document.createElement('div');
    card.className = 'rec-card';

    if (receta.imgBase64) {
      var img = document.createElement('img');
      img.className = 'rec-card-img';
      img.src = receta.imgBase64;
      img.alt = receta.nombre;
      card.appendChild(img);
    } else {
      var imgEmpty = document.createElement('div');
      imgEmpty.className = 'rec-card-img-empty';
      imgEmpty.textContent = REC_CAT_EMOJI[receta.categoria] || '🍽️';
      card.appendChild(imgEmpty);
    }

    var body = document.createElement('div');
    body.className = 'rec-card-body';
    body.innerHTML =
      '<div class="rec-card-name">' + receta.nombre + '</div>' +
      '<div class="rec-card-cat">' + (REC_CAT_EMOJI[receta.categoria]||'') + ' ' + receta.categoria + '</div>';
    card.appendChild(body);

    card.onclick = function() { openRecetaViewModal(receta.id); };
    grid.appendChild(card);
  });
}

function renderRecetario() {
  renderRecSugerencia();
  renderRecGrid();
}

// ── Modal VER receta ──
function openRecetaViewModal(recetaId) {
  var r = recetas.find(function(x){ return x.id === recetaId; });
  if (!r) return;

  var back = document.createElement('div');
  back.className = 'rutina-modal-backdrop';
  back.onclick = function(e) { if(e.target===back) back.remove(); };
  var box = document.createElement('div');
  box.className = 'rutina-modal-box';
  box.style.maxHeight = '90vh';
  box.style.overflowY = 'auto';

  // Image
  var imgEl;
  if (r.imgBase64) {
    imgEl = '<img src="' + r.imgBase64 + '" class="rec-modal-img" alt="' + r.nombre + '">';
  } else {
    imgEl = '<div class="rec-modal-img-empty">' + (REC_CAT_EMOJI[r.categoria]||'🍽️') + '</div>';
  }

  box.innerHTML = imgEl +
    '<div class="rec-modal-nombre">' + r.nombre + '</div>' +
    '<span class="rec-modal-cat">' + (REC_CAT_EMOJI[r.categoria]||'') + ' ' + r.categoria + '</span>' +
    (r.receta ? '<div class="rec-modal-receta">' + r.receta + '</div>' : '<div class="rec-modal-receta" style="color:var(--muted2)">Sin receta añadida aún 🌸</div>') +
    '<div class="modal-btns" style="margin-top:1.1rem">' +
    '<button class="modal-btn-delete" id="recViewDel">⋯ Eliminar</button>' +
    '<button class="modal-btn-cancel" id="recViewEdit">✏️ Editar</button>' +
    '<button class="modal-btn-save" id="recViewClose">Cerrar</button>' +
    '</div>';

  back.appendChild(box);
  document.body.appendChild(back);

  document.getElementById('recViewClose').onclick = function() { back.remove(); };
  document.getElementById('recViewEdit').onclick = function() { back.remove(); openRecetaEditModal(r.id); };
  document.getElementById('recViewDel').onclick = function() {
    kittyConfirm('¿Eliminar "' + r.nombre + '"?', function() {
      recetas = recetas.filter(function(x){ return x.id !== recetaId; });
      if (recSugIdx >= recetas.length) recSugIdx = 0;
      saveRecetario(); renderRecetario(); back.remove();
    });
  };
}

// ── Modal EDITAR/CREAR receta ──
function openRecetaEditModal(editId) {
  var editing = !!editId;
  var r = editing ? recetas.find(function(x){ return x.id === editId; }) : null;
  if (editing && !r) return;
  if (!r) r = { id: 'rec_' + Date.now(), nombre:'', categoria:'Desayunos', receta:'', imgBase64:'' };

  var back = document.createElement('div');
  back.className = 'rutina-modal-backdrop';
  back.onclick = function(e) { if(e.target===back) back.remove(); };
  var box = document.createElement('div');
  box.className = 'rutina-modal-box';
  box.style.maxHeight = '92vh';
  box.style.overflowY = 'auto';

  var catsOpts = REC_CATS.map(function(c) {
    return '<option value="' + c + '"' + (c === r.categoria ? ' selected' : '') + '>' + (REC_CAT_EMOJI[c]||'') + ' ' + c + '</option>';
  }).join('');

  box.innerHTML =
    '<div class="rutina-modal-title">🍽️ <em>' + (editing?'Editar':'Nueva') + ' receta</em></div>' +
    // Image upload
    '<div class="modal-field">' +
    '<img id="recImgPreview" class="rec-img-preview" src="' + (r.imgBase64||'') + '" alt="" style="display:' + (r.imgBase64?'block':'none') + '">' +
    '<label class="rec-img-upload-btn" for="recImgInput">📷 ' + (r.imgBase64 ? 'Cambiar imagen' : 'Añadir imagen') + '</label>' +
    '<input type="file" id="recImgInput" accept="image/*" style="display:none">' +
    '</div>' +
    '<div class="modal-field"><label class="modal-label">Nombre</label>' +
    '<input class="modal-input" id="recNombre" value="' + (r.nombre||'') + '" placeholder="ej: Avena con fruta..." style="width:100%"></div>' +
    '<div class="modal-field" style="margin-top:.6rem"><label class="modal-label">Categoría</label>' +
    '<select class="modal-input" id="recCat" style="width:100%">' + catsOpts + '</select></div>' +
    '<div class="modal-field" style="margin-top:.6rem"><label class="modal-label">Receta / ingredientes</label>' +
    '<textarea class="modal-input" id="recReceta" rows="6" placeholder="Ingredientes y pasos…" style="width:100%;resize:vertical">' + (r.receta||'') + '</textarea></div>' +
    '<div class="modal-btns" style="margin-top:1.1rem">' +
    '<button class="modal-btn-cancel" id="recEditCancel">Cancelar</button>' +
    '<button class="modal-btn-save" id="recEditSave">Guardar 🌸</button></div>';

  back.appendChild(box);
  document.body.appendChild(back);

  // Image preview
  var imgPreview = document.getElementById('recImgPreview');
  var imgInput   = document.getElementById('recImgInput');
  var currentB64 = r.imgBase64 || '';
  imgInput.onchange = function() {
    var file = imgInput.files[0];
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function(e) {
      currentB64 = e.target.result;
      imgPreview.src = currentB64;
      imgPreview.style.display = 'block';
      box.querySelector('.rec-img-upload-btn').textContent = '📷 Cambiar imagen';
    };
    reader.readAsDataURL(file);
  };

  document.getElementById('recEditCancel').onclick = function() { back.remove(); };
  document.getElementById('recEditSave').onclick = function() {
    var nombre = document.getElementById('recNombre').value.trim();
    if (!nombre) return;
    var categoria = document.getElementById('recCat').value;
    var recetaTxt = document.getElementById('recReceta').value.trim();
    var newRec = { id: r.id, nombre, categoria, receta: recetaTxt, imgBase64: currentB64 };
    if (editing) {
      var idx = recetas.findIndex(function(x){ return x.id === editId; });
      recetas[idx] = newRec;
    } else {
      recetas.push(newRec);
      recSugIdx = recetas.length - 1;
    }
    saveRecetario(); renderRecetario(); back.remove();
  };
  document.getElementById('recNombre').focus();
}

// Cloud sync
var _origSyncRec = window.syncFromCloud;
window.syncFromCloud = function() {
  if (window._recetarioData) recetas = window._recetarioData;
  if (_origSyncRec) _origSyncRec();
  if (typeof renderRecetario === 'function') renderRecetario();
};

loadRecetario();
document.addEventListener('DOMContentLoaded', function() {
  var addBtn = document.getElementById('recAddBtn');
  if (addBtn) addBtn.onclick = function() { openRecetaEditModal(null); };

  var shuffleBtn = document.getElementById('recShuffleBtn');
  if (shuffleBtn) shuffleBtn.onclick = recShuffle;

  // Category tabs
  document.querySelectorAll('.rec-cat-tab').forEach(function(tab) {
    tab.onclick = function() {
      document.querySelectorAll('.rec-cat-tab').forEach(function(t){ t.classList.remove('active'); });
      tab.classList.add('active');
      recCatActiva = tab.dataset.cat;
      renderRecGrid();
    };
  });

  // Initial shuffle
  if (recetas.length > 0) recShuffle();
  renderRecetario();
});

