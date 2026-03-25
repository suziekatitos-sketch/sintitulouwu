// ════════════════════════════════════════════════════════════════
// Yuki 🌸 — belleza.js
// ════════════════════════════════════════════════════════════════


// ============================================================
//  RUTINAS DE BELLEZA
// ============================================================

var bellezaTemplates = [];
var bellezaRegistros = {};
var belDateOffset = 0;

function saveBelleza() {
  try { localStorage.setItem('belleza_templates', JSON.stringify(bellezaTemplates)); } catch(e){}
  try { localStorage.setItem('belleza_registros', JSON.stringify(bellezaRegistros)); } catch(e){}
  if (window.cloudSave) {
    window.cloudSave('belleza_templates', bellezaTemplates);
    window.cloudSave('belleza_registros', bellezaRegistros);
  }
}

function loadBelleza() {
  bellezaTemplates = window._bellezaTemplates || JSON.parse(localStorage.getItem('belleza_templates') || '[]');
  bellezaRegistros = window._bellezaRegistros || JSON.parse(localStorage.getItem('belleza_registros') || '{}');
}

function getBelDate() {
  var d = new Date();
  d.setDate(d.getDate() + belDateOffset);
  return d;
}

function renderBelleza() {
  var date = getBelDate();
  var dk = dateKey(date);
  var DIAS_ES  = ['domingo','lunes','martes','miercoles','jueves','viernes','sabado'];
  var MESES_ES = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
  var label = DIAS_ES[date.getDay()] + ' ' + date.getDate() + ' de ' + MESES_ES[date.getMonth()];
  if (belDateOffset === 0) label = 'Hoy - ' + label;
  if (belDateOffset === 1) label = 'Manana - ' + label;
  if (belDateOffset === -1) label = 'Ayer - ' + label;
  var lbl = document.getElementById('belDateLbl');
  if (lbl) lbl.textContent = label;
  renderBelDayWrap(dk);
  renderBelPlantillas();
}

function renderBelDayWrap(dk) {
  var dayWrap = document.getElementById('belDayWrap');
  if (!dayWrap) return;
  dayWrap.innerHTML = '';
  var registros = bellezaRegistros[dk] || [];
  if (registros.length === 0) {
    var sel = document.createElement('div');
    sel.className = 'ejercicio-select-wrap';
    if (bellezaTemplates.length === 0) {
      sel.innerHTML = '<div class="ejercicio-select-hint">Crea tu primera rutina abajo para empezar ✨</div>';
    } else {
      var hint = document.createElement('div');
      hint.className = 'ejercicio-select-hint';
      hint.textContent = 'Selecciona la rutina que hiciste hoy:';
      sel.appendChild(hint);
      var grid = document.createElement('div');
      grid.className = 'ejercicio-select-grid';
      bellezaTemplates.forEach(function(tpl) {
        var chip = document.createElement('div');
        chip.className = 'ejercicio-select-chip';
        chip.innerHTML = '<span>' + tpl.emoji + '</span><span>' + tpl.name + '</span>';
        chip.onclick = function() {
          if (!bellezaRegistros[dk]) bellezaRegistros[dk] = [];
          bellezaRegistros[dk].push({ templateId: tpl.id, completedSteps: [] });
          saveBelleza(); renderBelleza();
        };
        grid.appendChild(chip);
      });
      sel.appendChild(grid);
    }
    dayWrap.appendChild(sel);
  } else {
    registros.forEach(function(reg, regIdx) {
      var tpl = bellezaTemplates.find(function(t) { return t.id === reg.templateId; });
      if (!tpl) return;
      var total = tpl.pasos.length;
      var done = reg.completedSteps.length;
      var pct = total > 0 ? Math.round(done/total*100) : 0;
      var allDone = total > 0 && done === total;
      var card = document.createElement('div');
      card.className = 'ejercicio-day-card';
      var hdr = document.createElement('div');
      hdr.className = 'ejercicio-day-card-hdr';
      hdr.innerHTML = '<div class="ejercicio-emoji">' + tpl.emoji + '</div>' +
        '<div class="ejercicio-card-info">' +
          '<div class="ejercicio-card-name">' + tpl.name + '</div>' +
          '<div class="ejercicio-card-meta">' + done + '/' + total + ' pasos</div>' +
        '</div>' +
        '<div class="ejercicio-prog-mini"><div class="ejercicio-prog-mini-fill" style="width:' + pct + '%"></div></div>' +
        (allDone ? '<span class="ejercicio-done-badge" style="background:linear-gradient(135deg,#fce4ec,#f8bbd9);color:#c0395a">Lista 💗</span>' : '') +
        '<span class="ejercicio-chevron">v</span>';
      // del moved to ⋯ inside step view
      var moreBelBtn = document.createElement('button');
      moreBelBtn.className = 'rut-action-btn';
      moreBelBtn.textContent = '⋯';
      moreBelBtn.title = 'Opciones';
      moreBelBtn.onclick = function(e) {
        e.stopPropagation();
        kittyConfirm('¿Quitar "' + tpl.name + '" del registro de este día?', function() {
          bellezaRegistros[dk].splice(regIdx, 1);
          saveBelleza(); renderBelleza();
        });
      };
      hdr.appendChild(moreBelBtn);
      hdr.onclick = function() {
        card.classList.toggle('ej-open');
        if (card.classList.contains('ej-open')) renderBelPasos(card, tpl, reg, regIdx, dk);
      };
      card.appendChild(hdr);
      dayWrap.appendChild(card);
    });
  }
}

function renderBelPasos(card, tpl, reg, regIdx, dk) {
  var existing = card.querySelector('.belleza-pasos');
  if (existing) existing.remove();
  var pasosEl = document.createElement('div');
  pasosEl.className = 'belleza-pasos open';
  tpl.pasos.forEach(function(paso, pIdx) {
    var isDone = (reg.completedSteps || []).includes(pIdx);
    var row = document.createElement('div');
    row.className = 'belleza-paso-row' + (isDone ? ' done' : '');
    var chk = document.createElement('div');
    chk.className = 'belleza-paso-check';
    chk.textContent = isDone ? '✓' : '';
    var txt = document.createElement('div');
    txt.className = 'belleza-paso-texto';
    txt.textContent = pasoText(paso);
    row.appendChild(chk);
    row.appendChild(txt);
    row.onclick = function() {
      var arr = bellezaRegistros[dk][regIdx].completedSteps;
      var i = arr.indexOf(pIdx);
      if (i === -1) arr.push(pIdx); else arr.splice(i, 1);
      saveBelleza(); renderBelleza();
      card.classList.add('ej-open');
      setTimeout(function() { renderBelPasos(card, tpl, bellezaRegistros[dk][regIdx], regIdx, dk); }, 50);
    };
    pasosEl.appendChild(row);
  });
  card.appendChild(pasosEl);
}

function renderBelPlantillas() {
  var list = document.getElementById('belPlantillasList');
  if (!list) return;
  list.innerHTML = '';
  if (bellezaTemplates.length === 0) {
    list.innerHTML = '<div class="belleza-empty">Sin rutinas aún ✨<br><small>Agrega tu rutina de piel, pelo, cuerpo...</small></div>';
    return;
  }
  bellezaTemplates.forEach(function(tpl, tplIdx) {
    var row = document.createElement('div');
    row.className = 'ejercicio-plantilla-row';
    row.style.cursor = 'pointer';
    row.innerHTML = '<span class="ejercicio-plantilla-emoji">' + tpl.emoji + '</span>' +
      '<span class="ejercicio-plantilla-name">' + tpl.name + '</span>';
    row.onclick = function() { openBelViewModal(tplIdx); };
    list.appendChild(row);
  });
}

function openBelViewModal(tplIdx) {
  var tpl = bellezaTemplates[tplIdx];
  if (!tpl) return;
  var old = document.getElementById('belViewModal');
  if (old) old.remove();
  var back = document.createElement('div');
  back.className = 'rutina-modal-backdrop';
  back.id = 'belViewModal';
  back.onclick = function(e) { if (e.target === back) back.remove(); };
  var box = document.createElement('div');
  box.className = 'rutina-modal-box';
  box.style.position = 'relative';

  var editBtn = document.createElement('button');
  editBtn.title = 'Editar rutina';
  editBtn.textContent = '✏️';
  editBtn.style.cssText = 'position:absolute;top:.7rem;right:.7rem;background:var(--pink-light,#fde8f0);border:none;border-radius:50%;width:32px;height:32px;font-size:1rem;cursor:pointer;display:flex;align-items:center;justify-content:center;';
  editBtn.onclick = function() { back.remove(); openBellezaModal(tplIdx); };

  var pasosHtml = '';
  (tpl.pasos || []).forEach(function(p, i) {
    pasosHtml += '<div style="display:flex;align-items:center;gap:.5rem;padding:.35rem .5rem;border-radius:8px;background:var(--bg);border:1.5px solid var(--border);margin-bottom:.3rem">' +
      '<span style="font-size:.65rem;font-weight:700;color:var(--muted2);min-width:16px">' + (i+1) + '.</span>' +
      '<span style="font-size:.8rem;color:var(--text);font-weight:500">' + pasoText(p) + '</span></div>';
  });

  var inner = document.createElement('div');
  inner.innerHTML = '<div class="rutina-modal-title" style="padding-right:2.5rem">' + tpl.emoji + ' <em>' + tpl.name + '</em></div>' +
    '<div style="margin-top:.6rem">' + (pasosHtml || '<div style="color:var(--muted2);font-size:.8rem">Sin pasos registrados.</div>') + '</div>' +
    '<div class="modal-btns" style="margin-top:1rem"><button class="modal-btn-cancel" id="belViewClose">Cerrar</button></div>';

  box.appendChild(editBtn);
  box.appendChild(inner);
  inner.querySelector('#belViewClose').onclick = function() { back.remove(); };
  back.appendChild(box);
  document.body.appendChild(back);
}

function openBellezaModal(editIdx) {
  var editing = editIdx !== null && editIdx !== undefined;
  var tpl = editing ? bellezaTemplates[editIdx] : { id: 'bel_' + Date.now(), name: '', emoji: '✨', pasos: [] };
  var back = document.createElement('div');
  back.className = 'rutina-modal-backdrop';
  back.onclick = function(e) { if (e.target === back) back.remove(); };
  var box = document.createElement('div');
  box.className = 'rutina-modal-box';
  var pasosHtml = (tpl.pasos || []).map(function(p) {
    return '<div class="desglose-step-row" style="display:flex;gap:.4rem;align-items:center;margin-bottom:.3rem">' +
      '<input class="modal-input bel-paso-input" value="' + p.replace(/"/g,'&quot;') + '" style="flex:1" placeholder="Paso...">' +
      '<button class="univ-materia-del bel-paso-del" style="color:#c77">✕</button></div>';
  }).join('');
  box.innerHTML = '<div class="rutina-modal-title">' + (editing ? '✏️' : '✨') + ' <em>' + (editing ? 'Editar' : 'Nueva') + ' rutina de belleza</em></div>' +
    '<div class="modal-field"><label class="modal-label">Emoji</label>' +
    '<input class="modal-input" id="belEmoji" value="' + (tpl.emoji||'✨') + '" style="width:80px;text-align:center;font-size:1.2rem"></div>' +
    '<div class="modal-field" style="margin-top:.7rem"><label class="modal-label">Nombre</label>' +
    '<input class="modal-input" id="belNombre" value="' + (tpl.name||'') + '" placeholder="ej: Rutina piel AM..." style="width:100%"></div>' +
    '<div class="modal-field" style="margin-top:.9rem"><label class="modal-label">Pasos</label>' +
    '<div id="belPasosList">' + pasosHtml + '</div>' +
    '<button class="belleza-reset-btn" id="belAddPasoBtn" style="margin-top:.4rem">＋ Agregar paso</button></div>' +
    '<div class="modal-btns" style="margin-top:1.2rem">' +
    '<button class="modal-btn-cancel" id="belCancel">Cancelar</button>' +
    (editing ? '<button class="modal-btn-delete" id="belDelBtn">⋯ Eliminar</button>' : '') +
    '<button class="modal-btn-save" id="belSave">Guardar ✨</button></div>';
  back.appendChild(box);
  document.body.appendChild(back);
  box.querySelectorAll('.bel-paso-del').forEach(function(btn) {
    btn.onclick = function() { btn.closest('.desglose-step-row').remove(); };
  });
  document.getElementById('belAddPasoBtn').onclick = function() {
    var row = document.createElement('div');
    row.className = 'desglose-step-row';
    row.style.cssText = 'display:flex;gap:.4rem;align-items:center;margin-bottom:.3rem';
    var inp = document.createElement('input');
    inp.className = 'modal-input bel-paso-input';
    inp.style.flex = '1';
    inp.placeholder = 'Nuevo paso...';
    var del = document.createElement('button');
    del.className = 'univ-materia-del bel-paso-del';
    del.style.color = '#c77';
    del.textContent = '✕';
    del.onclick = function() { row.remove(); };
    row.appendChild(inp);
    row.appendChild(del);
    document.getElementById('belPasosList').appendChild(row);
    inp.focus();
  };
  document.getElementById('belCancel').onclick = function() { back.remove(); };
  document.getElementById('belSave').onclick = function() {
    var nombre = document.getElementById('belNombre').value.trim();
    if (!nombre) return;
    var emoji = document.getElementById('belEmoji').value.trim() || '✨';
    var pasos = [];
    box.querySelectorAll('.bel-paso-input').forEach(function(inp) {
      var v = inp.value.trim();
      if (v) pasos.push(v);
    });
    if (editing) {
      bellezaTemplates[editIdx].name  = nombre;
      bellezaTemplates[editIdx].emoji = emoji;
      bellezaTemplates[editIdx].pasos = pasos;
    } else {
      tpl.name = nombre; tpl.emoji = emoji; tpl.pasos = pasos;
      bellezaTemplates.push(tpl);
    }
    saveBelleza(); renderBelleza();
    back.remove();
  };
  var belDelBtn = document.getElementById('belDelBtn');
  if (belDelBtn) {
    belDelBtn.onclick = function() {
      kittyConfirm('¿Eliminar "' + tpl.name + '"?', function() {
        bellezaTemplates.splice(editIdx, 1);
        saveBelleza(); renderBelleza();
        back.remove();
      });
    };
  }
  document.getElementById('belNombre').focus();
}

// Cloud sync
var _origSyncBelleza = window.syncFromCloud;
window.syncFromCloud = function() {
  if (window._bellezaTemplates) bellezaTemplates = window._bellezaTemplates;
  if (window._bellezaRegistros) bellezaRegistros = window._bellezaRegistros;
  if (_origSyncBelleza) _origSyncBelleza();
  renderBelleza();
};

loadBelleza();

document.addEventListener('DOMContentLoaded', function() {
  var belNew  = document.getElementById('bellezaNewBtn');
  var belPrev = document.getElementById('belPrevDay');
  var belNext = document.getElementById('belNextDay');
  if (belNew)  belNew.onclick  = function() { openBellezaModal(null); };
  if (belPrev) belPrev.onclick = function() { belDateOffset--; renderBelleza(); };
  if (belNext) belNext.onclick = function() { belDateOffset++; renderBelleza(); };
  renderBelleza();
});
