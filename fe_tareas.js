// ════════════════════════════════════════════════════════════════
// Yuki 🌸 — fe_tareas.js
// ════════════════════════════════════════════════════════════════


// ══════════════════════════════════════════
//  DESGLOSADOR DE TAREAS COMPLEJAS
// ══════════════════════════════════════════

let desgloseItems = []; 
// [{ id, title, recompensa, pasos:['paso1','paso2'...], completedSteps:[0,1,...] }]

function saveDesglose() {
  try { localStorage.setItem('desglose_items', JSON.stringify(desgloseItems)); } catch(e){}
  if (window.cloudSave) window.cloudSave('desglose_items', desgloseItems);
}

function loadDesglose() {
  desgloseItems = window._desgloseItems || JSON.parse(localStorage.getItem('desglose_items') || '[]');
}

function renderDesglose() {
  const list = document.getElementById('desgloseList');
  if (!list) return;
  list.innerHTML = '';

  if (desgloseItems.length === 0) {
    list.innerHTML = '<div class="rutina-empty-state">🧩 Sin tareas complejas aún.<br>¡Desglosa algo grande en pequeños pasos!</div>';
    return;
  }

  desgloseItems.forEach((item, itemIdx) => {
    const total    = item.pasos.length;
    const done     = (item.completedSteps || []).length;
    const allDone  = total > 0 && done === total;
    const pct      = total > 0 ? Math.round((done/total)*100) : 0;

    const card = document.createElement('div');
    card.className = 'desglose-card';
    card.id = 'dcard_' + item.id;

    card.innerHTML = `
      <div class="desglose-card-header">
        <div class="desglose-card-main">
          <div class="desglose-card-title">
            ${item.title}
            <span class="desglose-arrow">→</span>
            <span class="desglose-recompensa-tag">🎁 ${item.recompensa.length > 22 ? item.recompensa.slice(0,22)+'...' : item.recompensa}</span>
          </div>
          <div class="desglose-card-meta">${done}/${total} pasos completados</div>
        </div>
        <div class="desglose-progress-mini">
          <div class="desglose-progress-mini-fill" style="width:${pct}%"></div>
        </div>
        <div class="desglose-card-actions">
          <button class="rut-action-btn" title="Editar" data-edit="${item.id}">✏️</button>
          <button class="rut-action-btn" title="Eliminar" data-del="${item.id}">✕</button>
        </div>
        <span class="desglose-chevron">▼</span>
      </div>
      <div class="desglose-body">
        <div class="desglose-steps" id="dsteps_${item.id}"></div>
        <div class="desglose-recompensa-box ${allDone ? 'unlocked' : ''}" id="drecomp_${item.id}">
          <span class="desglose-recompensa-icon">🎁</span>
          <div>
            <span class="desglose-recompensa-label">Tu recompensa</span>
            <div class="desglose-recompensa-text">${item.recompensa}</div>
          </div>
        </div>
        <div class="desglose-congrats ${allDone ? 'show' : ''}" id="dcongrats_${item.id}">
          🌟 ¡Lo lograste! Mereces cada segundo de tu recompensa 🎉
        </div>
      </div>`;

    // Toggle open/close
    card.querySelector('.desglose-card-header').onclick = (e) => {
      if (e.target.closest('.desglose-card-actions')) return;
      card.classList.toggle('open');
      if (card.classList.contains('open')) renderDesgloseSteps(item, itemIdx);
    };

    // Edit
    card.querySelector('[data-edit]').onclick = (e) => {
      e.stopPropagation();
      openDesgloseModal(item.id);
    };

    // Delete
    card.querySelector('[data-del]').onclick = (e) => {
      e.stopPropagation();
      kittyConfirm('¿Eliminar "' + item.title + '"?', function() {
        desgloseItems.splice(itemIdx, 1);
        saveDesglose(); renderDesglose();
      });
    };

    list.appendChild(card);
  });
}

function renderDesgloseSteps(item, itemIdx) {
  const stepsEl = document.getElementById('dsteps_' + item.id);
  if (!stepsEl) return;
  stepsEl.innerHTML = '';
  const completed = item.completedSteps || [];

  item.pasos.forEach((paso, idx) => {
    const isDone   = completed.includes(idx);
    const isLocked = !isDone && idx > 0 && !completed.includes(idx - 1);

    const row = document.createElement('div');
    row.className = 'desglose-step' + (isDone ? ' step-done' : '') + (isLocked ? ' step-locked' : '');

    const num = document.createElement('span');
    num.className = 'desglose-step-num';
    num.textContent = isDone ? '✓' : (idx + 1);

    const chk = document.createElement('span');
    chk.className = 'desglose-step-check';
    chk.textContent = isDone ? '✓' : '';
    if (!isLocked) {
      chk.onclick = (e) => {
        e.stopPropagation();
        toggleDesgloseStep(item.id, idx);
      };
      row.onclick = () => toggleDesgloseStep(item.id, idx);
    }

    const txt = document.createElement('span');
    txt.className = 'desglose-step-text';
    txt.textContent = paso;

    row.appendChild(num);
    row.appendChild(chk);
    row.appendChild(txt);
    stepsEl.appendChild(row);
  });
}

function toggleDesgloseStep(itemId, stepIdx) {
  const item = desgloseItems.find(d => d.id === itemId);
  if (!item) return;
  if (!item.completedSteps) item.completedSteps = [];

  const already = item.completedSteps.includes(stepIdx);
  if (already) {
    // Uncheck this and all after
    item.completedSteps = item.completedSteps.filter(i => i < stepIdx);
  } else {
    item.completedSteps.push(stepIdx);
  }

  saveDesglose();
  renderDesglose();
  // Re-open the card
  setTimeout(() => {
    const card = document.getElementById('dcard_' + itemId);
    if (card) {
      card.classList.add('open');
      const itemIdx = desgloseItems.findIndex(d => d.id === itemId);
      renderDesgloseSteps(desgloseItems[itemIdx], itemIdx);
    }
  }, 50);
}

function openDesgloseModal(itemId) {
  const existing = itemId ? desgloseItems.find(d => d.id === itemId) : null;
  const old = document.getElementById('desgloseModal');
  if (old) old.remove();

  const title      = existing ? existing.title      : '';
  const recompensa = existing ? existing.recompensa : '';
  const pasos      = existing ? [...existing.pasos]  : [];

  const backdrop = document.createElement('div');
  backdrop.className = 'rutina-modal-backdrop';
  backdrop.id = 'desgloseModal';
  backdrop.onclick = (e) => { if (e.target === backdrop) backdrop.remove(); };

  const box = document.createElement('div');
  box.className = 'rutina-modal-box';
  box.innerHTML = `
    <div class="rutina-modal-title">🧩 <em>${existing ? 'Editar' : 'Nueva'} tarea compleja</em></div>

    <div class="modal-field">
      <label class="modal-label">Nombre de la tarea</label>
      <input class="modal-input" id="dTitle" placeholder="ej: Limpiar mi cuarto, Estudiar para el examen..." value="${title.replace(/"/g,'&quot;')}">
    </div>

    <div class="modal-field">
      <label class="modal-label">🎁 Recompensa al terminar</label>
      <input class="modal-input" id="dRecompensa" placeholder="ej: 30 minutos de mi serie favorita, un snack rico..." value="${recompensa.replace(/"/g,'&quot;')}">
    </div>

    <div class="modal-field">
      <label class="modal-label">Pasos (en orden)</label>
      <div id="dPasosList" class="rutina-pasos-list"></div>
      <button class="rutina-add-paso-btn" id="dAddPasoBtn">＋ Agregar paso</button>
    </div>

    <div class="modal-btns">
      <button class="modal-btn-cancel" onclick="document.getElementById('desgloseModal').remove()">Cancelar</button>
      <button class="modal-btn-save" id="dSaveBtn">Guardar 🎯</button>
    </div>`;

  backdrop.appendChild(box);
  document.body.appendChild(backdrop);

  function renderModalPasos() {
    const list = box.querySelector('#dPasosList');
    list.innerHTML = '';
    pasos.forEach((paso, idx) => {
      const row = document.createElement('div');
      row.className = 'rutina-paso-edit-row';
      row.innerHTML = `
        <span style="font-size:.65rem;font-weight:700;color:var(--muted2);min-width:16px">${idx+1}.</span>
        <input type="text" value="${pasoText(paso).replace(/"/g,'&quot;')}" placeholder="Paso ${idx+1}...">
        <button class="rutina-paso-del">✕</button>`;
      row.querySelector('input').oninput = (e) => { pasos[idx] = e.target.value; };
      row.querySelector('.rutina-paso-del').onclick = () => { pasos.splice(idx,1); renderModalPasos(); };
      list.appendChild(row);
    });
  }

  renderModalPasos();

  box.querySelector('#dAddPasoBtn').onclick = () => {
    pasos.push('');
    renderModalPasos();
    const inputs = box.querySelectorAll('#dPasosList input');
    if (inputs.length) inputs[inputs.length-1].focus();
  };

  box.querySelector('#dSaveBtn').onclick = () => {
    const t = box.querySelector('#dTitle').value.trim();
    const r = box.querySelector('#dRecompensa').value.trim();
    if (!t) { box.querySelector('#dTitle').focus(); return; }
    if (!r) { box.querySelector('#dRecompensa').focus(); return; }
    const cleanPasos = pasos.filter(p => p.trim() !== '');
    if (cleanPasos.length === 0) { box.querySelector('#dAddPasoBtn').focus(); return; }

    if (existing) {
      existing.title = t;
      existing.recompensa = r;
      existing.pasos = cleanPasos;
    } else {
      desgloseItems.push({
        id: 'des_' + Date.now(),
        title: t,
        recompensa: r,
        pasos: cleanPasos,
        completedSteps: []
      });
    }
    saveDesglose();
    renderDesglose();
    backdrop.remove();
  };

  box.querySelector('#dTitle').focus();
}

document.addEventListener('DOMContentLoaded', function() {
  var _desNew = document.getElementById('desgloseNewBtn');
  if(_desNew) _desNew.onclick = () => openDesgloseModal(null);
});

// Patch cloud sync for desglose
const _origSyncR = window.syncFromCloud;
window.syncFromCloud = function() {
  if (window._desgloseItems) desgloseItems = window._desgloseItems;
  if (_origSyncR) _origSyncR();
  renderDesglose();
};

loadDesglose();
renderDesglose();



// ══════════════════════════════════════════
//  IMÁGENES DECORATIVAS DE MÁRGENES
// ══════════════════════════════════════════

let imgUrls      = [];       // all user URLs
let imgInterval  = 30;       // minutes
let imgCurrentIdx = 0;       // current rotation index
let imgTimer     = null;
const IMG_SLOTS  = 20;       // images per column — many slots down the page

function saveImgs() {
  try { localStorage.setItem('deco_imgs',     JSON.stringify(imgUrls));     } catch(e){}
  try { localStorage.setItem('deco_interval', String(imgInterval));          } catch(e){}
  if (window.cloudSave) {
    window.cloudSave('deco_imgs',     imgUrls);
    window.cloudSave('deco_interval', imgInterval);
  }
}

function loadImgs() {
  imgUrls     = window._decoImgs     || JSON.parse(localStorage.getItem('deco_imgs')     || '[]');
  imgInterval = window._decoInterval !== undefined
    ? parseInt(window._decoInterval)
    : parseInt(localStorage.getItem('deco_interval') || '30');
}

function buildColumns() {
  ['imgColLeft','imgColRight'].forEach(id => {
    const col = document.getElementById(id);
    if (!col) return;
    col.innerHTML = '';
    for (let i = 0; i < IMG_SLOTS; i++) {
      const slot = document.createElement('div');
      slot.className = 'img-col-slot empty';
      slot.id = id + '_slot' + i;
      col.appendChild(slot);
    }
  });
}

function getRotatedSet(startIdx) {
  // Returns IMG_SLOTS*2 urls starting from startIdx, cycling
  if (imgUrls.length === 0) return [];
  const result = [];
  for (let i = 0; i < IMG_SLOTS * 2; i++) {
    result.push(imgUrls[(startIdx + i) % imgUrls.length]);
  }
  return result;
}

function renderImgSlots() {
  ['imgColLeft','imgColRight'].forEach((id, colIdx) => {
    for (let i = 0; i < IMG_SLOTS; i++) {
      const slot = document.getElementById(id + '_slot' + i);
      if (!slot) continue;
      if (imgUrls.length === 0) {
        slot.innerHTML = ''; slot.classList.add('empty');
        continue;
      }
      // Offset right column by half so left/right don't show same image at same height
      const offset = colIdx * Math.ceil(IMG_SLOTS / 2);
      const url = imgUrls[(i + offset) % imgUrls.length];
      slot.classList.remove('empty');
      const existing = slot.querySelector('img');
      if (existing) {
        existing.classList.add('img-fade-out');
        setTimeout(() => {
          existing.src = url;
          existing.onload  = () => existing.classList.remove('img-fade-out');
          existing.onerror = () => { slot.innerHTML = ''; slot.classList.add('empty'); };
        }, 700);
      } else {
        slot.innerHTML = '';
        const img = document.createElement('img');
        img.src = url;
        img.alt = '';
        img.onerror = () => { slot.innerHTML = ''; slot.classList.add('empty'); };
        slot.appendChild(img);
      }
    }
  });
}

function startImgTimer() {
  if (imgTimer) clearInterval(imgTimer);
  if (imgUrls.length <= IMG_SLOTS * 2) return; // no need to rotate if few images
  imgTimer = setInterval(() => {
    imgCurrentIdx = (imgCurrentIdx + 1) % imgUrls.length;
    renderImgSlots();
  }, imgInterval * 60 * 1000);
}

// ── Manager modal
function openImgManager() {
  const old = document.getElementById('imgManagerModal');
  if (old) old.remove();

  const backdrop = document.createElement('div');
  backdrop.className = 'rutina-modal-backdrop';
  backdrop.id = 'imgManagerModal';
  backdrop.onclick = (e) => { if (e.target === backdrop) closeImgManager(); };

  const box = document.createElement('div');
  box.className = 'img-manager-box';

  box.innerHTML = `
    <div class="img-manager-title">🖼️ <em>Imágenes decorativas</em></div>
    <p class="img-manager-hint">
      Pega URLs de imágenes (de Pinterest, Google, donde quieras).<br>
      Aparecerán en las columnas laterales y rotarán automáticamente 🌸
    </p>
    <div class="img-url-list" id="imgUrlList"></div>
    <button class="img-add-btn" id="imgAddBtn">＋ Agregar imagen</button>
    <div class="img-interval-row">
      <span>Cambiar cada</span>
      <select class="img-interval-select" id="imgIntervalSel">
        <option value="10">10 min</option>
        <option value="20">20 min</option>
        <option value="30">30 min</option>
        <option value="60">1 hora</option>
        <option value="120">2 horas</option>
      </select>
    </div>
    <div class="modal-btns">
      <button class="modal-btn-cancel" onclick="closeImgManager()">Cerrar</button>
      <button class="modal-btn-save" id="imgSaveBtn">Guardar 🌸</button>
    </div>`;

  backdrop.appendChild(box);
  document.body.appendChild(backdrop);

  // Set interval selector
  const sel = box.querySelector('#imgIntervalSel');
  sel.value = String(imgInterval);

  // Render URL list
  let localUrls = [...imgUrls];

  function renderList() {
    const list = box.querySelector('#imgUrlList');
    list.innerHTML = '';
    if (localUrls.length === 0) {
      list.innerHTML = '<div style="font-size:.72rem;color:var(--muted2);font-weight:600;padding:.3rem 0">Aún no hay imágenes - agrega una URL abajo 🌸</div>';
      return;
    }
    localUrls.forEach((url, i) => {
      const row = document.createElement('div');
      row.className = 'img-url-row';

      const preview = document.createElement('img');
      preview.className = 'img-url-preview';
      preview.src = url;
      preview.onerror = () => { preview.style.opacity = '.3'; };

      const input = document.createElement('input');
      input.type = 'text';
      input.className = 'img-url-input';
      input.placeholder = 'https://...';
      input.value = url;
      input.oninput = () => {
        localUrls[i] = input.value;
        preview.src = input.value;
      };

      const del = document.createElement('button');
      del.className = 'img-url-del';
      del.textContent = '✕';
      del.onclick = () => { localUrls.splice(i, 1); renderList(); };

      row.appendChild(preview);
      row.appendChild(input);
      row.appendChild(del);
      list.appendChild(row);
    });
  }

  renderList();

  box.querySelector('#imgAddBtn').onclick = () => {
    localUrls.push('');
    renderList();
    const inputs = box.querySelectorAll('.img-url-input');
    if (inputs.length) inputs[inputs.length-1].focus();
  };

  box.querySelector('#imgSaveBtn').onclick = () => {
    imgUrls     = localUrls.filter(u => u.trim() !== '');
    imgInterval = parseInt(sel.value);
    imgCurrentIdx = 0;
    saveImgs();
    renderImgSlots();
    startImgTimer();
    closeImgManager();
  };
}

function closeImgManager() {
  const m = document.getElementById('imgManagerModal');
  if (m) m.remove();
}

var _imgMgr = document.getElementById('imgManageBtn'); if(_imgMgr) _imgMgr.onclick = openImgManager;

// Patch cloud sync
const _origSyncImg = window.syncFromCloud;
window.syncFromCloud = function() {
  if (window._decoImgs !== undefined)     imgUrls     = window._decoImgs;
  if (window._decoInterval !== undefined) imgInterval = parseInt(window._decoInterval);
  if (_origSyncImg) _origSyncImg();
  renderImgSlots();
  startImgTimer();
};

// Init
loadImgs();
document.addEventListener('DOMContentLoaded', function() {
  buildColumns();
  renderImgSlots();
  startImgTimer();
});




// --- dateKey helper (early definition) ---
function dateKey(d) {
  if (typeof d === 'string') return d;
  return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');
}

// ============================================================
//  RUTINAS DE EJERCICIO
// ============================================================

var ejTemplates = [];
// [{ id, name, emoji, imgBase64, pasos:[{texto, duracion}] }]
var ejRegistros = {};
// { 'YYYY-MM-DD': [ { templateId, completedSteps:[0,2,...] } ] }
var ejDateOffset = 0;

function saveEjercicio() {
  try { localStorage.setItem('ej_templates', JSON.stringify(ejTemplates)); } catch(e){}
  try { localStorage.setItem('ej_registros', JSON.stringify(ejRegistros)); } catch(e){}
  if (window.cloudSave) {
    window.cloudSave('ej_templates', ejTemplates);
    window.cloudSave('ej_registros', ejRegistros);
  }
}

function loadEjercicio() {
  ejTemplates = window._ejTemplates || JSON.parse(localStorage.getItem('ej_templates') || '[]');
  ejRegistros = window._ejRegistros || JSON.parse(localStorage.getItem('ej_registros') || '{}');
}

function getEjDate() {
  var d = new Date();
  d.setDate(d.getDate() + ejDateOffset);
  return d;
}

function showEjImageFullscreen(tpl, reg, regIdx, dk) {
  var overlay = document.createElement('div');
  overlay.className = 'ejercicio-img-fullscreen';
  
  var content_div = document.createElement('div');
  content_div.className = 'ejercicio-img-fullscreen-content';
  
  var img = document.createElement('img');
  img.src = tpl.imgBase64;
  img.className = 'ejercicio-img-fullscreen-img';
  img.alt = tpl.name;
  content_div.appendChild(img);
  
  var bottom = document.createElement('div');
  bottom.className = 'ejercicio-img-fullscreen-bottom';
  
  var checkBtn = document.createElement('button');
  checkBtn.className = 'ejercicio-img-check-btn';
  checkBtn.textContent = reg.completed ? '✓ Completada' : 'Marcar como completada ✓';
  checkBtn.onclick = function(e) {
    e.stopPropagation();
    reg.completed = !reg.completed;
    ejRegistros[dk][regIdx] = reg;
    saveEjercicio();
    renderEjercicio();
  };
  if (reg.completed) checkBtn.style.opacity = '0.7';
  bottom.appendChild(checkBtn);
  content_div.appendChild(bottom);
  
  var closeBtn = document.createElement('button');
  closeBtn.className = 'ejercicio-img-close-btn';
  closeBtn.textContent = '✕';
  closeBtn.onclick = function() { overlay.remove(); };
  content_div.appendChild(closeBtn);
  
  overlay.appendChild(content_div);
  overlay.onclick = function(e) { if (e.target === overlay) overlay.remove(); };
  
  document.body.appendChild(overlay);
}

function renderEjercicio() {
  var date = getEjDate();
  var dk = dateKey(date);
  var DIAS_ES  = ['domingo','lunes','martes','miercoles','jueves','viernes','sabado'];
  var MESES_ES = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
  var label = DIAS_ES[date.getDay()] + ' ' + date.getDate() + ' de ' + MESES_ES[date.getMonth()];
  if (ejDateOffset === 0) label = 'Hoy - ' + label;
  if (ejDateOffset === 1) label = 'Manana - ' + label;
  if (ejDateOffset === -1) label = 'Ayer - ' + label;
  const _edl = document.getElementById('ejDateLbl'); if (_edl) _edl.textContent = label;

  var dayWrap = document.getElementById('ejDayWrap');
  if (!dayWrap) return;
  dayWrap.innerHTML = '';

  var registros = ejRegistros[dk] || [];

  if (registros.length === 0) {
    // Show selection UI
    var sel = document.createElement('div');
    sel.className = 'ejercicio-select-wrap';
    if (ejTemplates.length === 0) {
      sel.innerHTML = '<div class="ejercicio-select-hint">Crea tu primera rutina abajo para empezar a registrar 💪</div>';
    } else {
      var hint = document.createElement('div');
      hint.className = 'ejercicio-select-hint';
      hint.textContent = 'Selecciona la rutina que hiciste hoy:';
      sel.appendChild(hint);
      var grid = document.createElement('div');
      grid.className = 'ejercicio-select-grid';
      ejTemplates.forEach(function(tpl) {
        var chip = document.createElement('div');
        chip.className = 'ejercicio-select-chip';
        chip.innerHTML = '<span>' + tpl.emoji + '</span><span>' + tpl.name + '</span>';
        if (tpl.imgBase64) {
          var img = document.createElement('img');
          img.src = tpl.imgBase64;
          img.className = 'ejercicio-select-chip-img';
          chip.appendChild(img);
        }
        chip.onclick = function() {
          if (!ejRegistros[dk]) ejRegistros[dk] = [];
          ejRegistros[dk].push({ templateId: tpl.id, completedSteps: [] });
          saveEjercicio(); renderEjercicio();
        };
        grid.appendChild(chip);
      });
      sel.appendChild(grid);
    }
    dayWrap.appendChild(sel);
  } else {
    // Show registered routines with steps
    registros.forEach(function(reg, regIdx) {
      var tpl = ejTemplates.find(function(t) { return t.id === reg.templateId; });
      if (!tpl) return;

      var total = tpl.pasos.length;
      var done = reg.completedSteps.length;
      var pct = total > 0 ? Math.round(done/total*100) : 0;
      var allDone = total > 0 && done === total;

      var card = document.createElement('div');
      card.className = 'ejercicio-day-card';

      // Header
      var hdr = document.createElement('div');
      hdr.className = 'ejercicio-day-card-hdr';
      hdr.innerHTML = '<div class="ejercicio-emoji">' + tpl.emoji + '</div>' +
        '<div class="ejercicio-card-info">' +
          '<div class="ejercicio-card-name">' + tpl.name + '</div>' +
          '<div class="ejercicio-card-meta">' + done + '/' + total + ' ejercicios</div>' +
        '</div>' +
        '<div class="ejercicio-prog-mini"><div class="ejercicio-prog-mini-fill" style="width:' + pct + '%"></div></div>' +
        (allDone ? '<span class="ejercicio-done-badge">Completada</span>' : '') +
        '<span class="ejercicio-chevron">v</span>';

      var moreBtn = document.createElement('button');
      moreBtn.className = 'rut-action-btn';
      moreBtn.textContent = '⋯';
      moreBtn.title = 'Opciones';
      moreBtn.onclick = function(e) {
        e.stopPropagation();
        kittyConfirm('¿Quitar "' + tpl.name + '" del registro de este día?', function() {
          ejRegistros[dk].splice(regIdx, 1);
          saveEjercicio(); renderEjercicio();
        });
      };
      hdr.appendChild(moreBtn);
      hdr.onclick = function() {
        card.classList.toggle('ej-open');
        if (card.classList.contains('ej-open')) renderEjPasos(card, tpl, reg, regIdx, dk);
      };

      // Delete button
      // del moved to ⋯ inside step view

      // Body
      var body = document.createElement('div');
      body.className = 'ejercicio-body';
      card.appendChild(hdr);
      card.appendChild(body);
      dayWrap.appendChild(card);
    });

    // Add another routine button
    if (ejTemplates.length > registros.length) {
      var addMore = document.createElement('button');
      addMore.className = 'rutina-new-btn';
      addMore.style.cssText = 'margin-top:.4rem;display:block';
      addMore.textContent = '+ Agregar otra rutina';
      addMore.onclick = function() { openEjAddModal(dk); };
      dayWrap.appendChild(addMore);
    }
  }

  // Plantillas list
  renderEjPlantillas();
}

function renderEjPasos(card, tpl, reg, regIdx, dk) {
  var body = card.querySelector('.ejercicio-body');
  body.innerHTML = '';
  var wrap = document.createElement('div');
  wrap.className = 'ejercicio-pasos';

  tpl.pasos.forEach(function(paso, pi) {
    var isDone = reg.completedSteps.indexOf(pi) !== -1;
    var row = document.createElement('div');
    row.className = 'ejercicio-paso' + (isDone ? ' ej-paso-done' : '');

    var chk = document.createElement('div');
    chk.className = 'ejercicio-paso-check';
    chk.textContent = isDone ? 'v' : '';

    var txt = document.createElement('div');
    txt.className = 'ejercicio-paso-texto';
    txt.textContent = paso.texto;

    row.appendChild(chk);
    row.appendChild(txt);

    if (paso.duracion) {
      var dur = document.createElement('span');
      dur.className = 'ejercicio-paso-dur';
      dur.textContent = paso.duracion;
      row.appendChild(dur);
    }

    row.onclick = function() {
      var idx = reg.completedSteps.indexOf(pi);
      if (idx !== -1) reg.completedSteps.splice(idx, 1);
      else reg.completedSteps.push(pi);
      ejRegistros[dk][regIdx] = reg;
      saveEjercicio();
      renderEjPasos(card, tpl, reg, regIdx, dk);
      // update header
      var total = tpl.pasos.length;
      var done = reg.completedSteps.length;
      var pct = total > 0 ? Math.round(done/total*100) : 0;
      var allDone = total > 0 && done === total;
      card.querySelector('.ejercicio-card-meta').textContent = done + '/' + total + ' ejercicios';
      card.querySelector('.ejercicio-prog-mini-fill').style.width = pct + '%';
      // 🎮 Rutina completada al 100% → EXP + flores
      if (allDone && idx === -1) {
        if (window.yukiAddXP) window.yukiAddXP(20, 'Ejercicio');
        if (window.yukiAddSakura) window.yukiAddSakura(5);
        if (window.yukiCheckStreak) window.yukiCheckStreak();
      }
    };

    wrap.appendChild(row);
  });

  body.appendChild(wrap);
}

function openEjAddModal(dk) {
  var already = (ejRegistros[dk] || []).map(function(r) { return r.templateId; });
  var available = ejTemplates.filter(function(t) { return already.indexOf(t.id) === -1; });

  var old = document.getElementById('ejAddModal');
  if (old) old.remove();
  var back = document.createElement('div');
  back.className = 'rutina-modal-backdrop';
  back.id = 'ejAddModal';
  back.onclick = function(e) { if (e.target === back) back.remove(); };

  var box = document.createElement('div');
  box.className = 'rutina-modal-box';
  box.innerHTML = '<div class="rutina-modal-title">+ <em>Agregar rutina al dia</em></div>';

  available.forEach(function(tpl) {
    var card = document.createElement('div');
    card.className = 'ejercicio-plantilla-card';
    var cardHtml = '<span style="font-size:1.3rem">' + tpl.emoji + '</span>';
    
    if (tpl.imgBase64) {
      cardHtml += '<img src="' + tpl.imgBase64 + '" class="ejercicio-plantilla-img" style="width:50px;height:50px;border-radius:8px;object-fit:cover;border:1px solid var(--border);margin-left:.5rem">';
    }
    
    cardHtml += '<div class="ejercicio-plantilla-info"><div class="ejercicio-plantilla-name">' + tpl.name + '</div>' +
      '<div class="ejercicio-plantilla-meta">' + tpl.pasos.length + ' ejercicios</div></div>';
    
    card.innerHTML = cardHtml;
    card.onclick = function() {
      if (!ejRegistros[dk]) ejRegistros[dk] = [];
      ejRegistros[dk].push({ templateId: tpl.id, completedSteps: [] });
      saveEjercicio(); renderEjercicio();
      back.remove();
    };
    box.appendChild(card);
  });

  var cancelBtn = document.createElement('div');
  cancelBtn.className = 'modal-btns';
  var ejCancelBtn = document.createElement('button');
  ejCancelBtn.className = 'modal-btn-cancel';
  ejCancelBtn.textContent = 'Cancelar';
  ejCancelBtn.onclick = function() { back.remove(); };
  cancelBtn.appendChild(ejCancelBtn);
  box.appendChild(cancelBtn);
  back.appendChild(box);
  document.body.appendChild(back);
}

function renderEjPlantillas() {
  var list = document.getElementById('ejPlantillasList');
  if (!list) return;
  list.innerHTML = '';

  if (ejTemplates.length === 0) {
    list.innerHTML = '<div class="rutina-empty-state">💪 Sin rutinas aun. Crea la primera!</div>';
    return;
  }

  ejTemplates.forEach(function(tpl, idx) {
    var card = document.createElement('div');
    card.className = 'ejercicio-plantilla-card';
    card.style.cursor = 'pointer';
    var cardHtml = '<span style="font-size:1.3rem">' + tpl.emoji + '</span>';
    
    if (tpl.imgBase64) {
      cardHtml += '<img src="' + tpl.imgBase64 + '" class="ejercicio-plantilla-card-img" style="width:50px;height:50px;border-radius:8px;object-fit:cover;border:1px solid var(--border);margin-left:.5rem">';
    }
    
    cardHtml += '<div class="ejercicio-plantilla-info">' +
        '<div class="ejercicio-plantilla-name">' + tpl.name + '</div>' +
      '</div>';
    
    card.innerHTML = cardHtml;
    card.onclick = function() { openEjViewModal(tpl.id); };
    list.appendChild(card);
  });
}


function openEjViewModal(templateId) {
  var tpl = ejTemplates.find(function(t) { return t.id === templateId; });
  if (!tpl) return;
  var old = document.getElementById('ejViewModal');
  if (old) old.remove();
  var back = document.createElement('div');
  back.className = 'rutina-modal-backdrop';
  back.id = 'ejViewModal';
  back.onclick = function(e) { if (e.target === back) back.remove(); };
  var box = document.createElement('div');
  box.className = 'rutina-modal-box';
  box.style.position = 'relative';

  var editBtn = document.createElement('button');
  editBtn.title = 'Editar rutina';
  editBtn.textContent = '✏️';
  editBtn.style.cssText = 'position:absolute;top:.7rem;right:.7rem;background:var(--pink-light,#fde8f0);border:none;border-radius:50%;width:32px;height:32px;font-size:1rem;cursor:pointer;display:flex;align-items:center;justify-content:center;';
  editBtn.onclick = function() { back.remove(); openEjModal(templateId); };

  var pasosHtml = '';
  (tpl.pasos || []).forEach(function(p, i) {
    pasosHtml += '<div style="display:flex;align-items:center;gap:.5rem;padding:.35rem .5rem;border-radius:8px;background:var(--bg);border:1.5px solid var(--border);margin-bottom:.3rem">' +
      '<span style="font-size:.65rem;font-weight:700;color:var(--muted2);min-width:16px">' + (i+1) + '.</span>' +
      '<span style="font-size:.8rem;color:var(--text);font-weight:500">' + pasoText(p) + '</span></div>';
  });

  var inner = document.createElement('div');
  var imageHtml = '';
  if (tpl.imgBase64) {
    imageHtml = '<img src="' + tpl.imgBase64 + '" style="width:100%;max-height:200px;border-radius:12px;object-fit:cover;border:1.5px solid var(--border);margin-bottom:.6rem">';
  }
  
  inner.innerHTML = '<div class="rutina-modal-title" style="padding-right:2.5rem">' + tpl.emoji + ' <em>' + tpl.name + '</em></div>' +
    imageHtml +
    '<div style="margin-top:.6rem">' + (pasosHtml || '<div style="color:var(--muted2);font-size:.8rem">Sin ejercicios registrados.</div>') + '</div>' +
    '<div class="modal-btns" style="margin-top:1rem"><button class="modal-btn-cancel" id="ejViewClose">Cerrar</button></div>';

  box.appendChild(editBtn);
  box.appendChild(inner);
  inner.querySelector('#ejViewClose').onclick = function() { back.remove(); };
  back.appendChild(box);
  document.body.appendChild(back);
}

function openEjModal(templateId) {
  var existing = templateId ? ejTemplates.find(function(t) { return t.id === templateId; }) : null;
  var old = document.getElementById('ejEditModal');
  if (old) old.remove();

  var nombre = existing ? existing.name : '';
  var emoji  = existing ? existing.emoji : '💪';
  var imgBase64 = existing ? existing.imgBase64 || '' : '';
  var pasos  = existing ? JSON.parse(JSON.stringify(existing.pasos)) : [];

  var back = document.createElement('div');
  back.className = 'rutina-modal-backdrop';
  back.id = 'ejEditModal';
  back.onclick = function(e) { if (e.target === back) back.remove(); };

  var box = document.createElement('div');
  box.className = 'rutina-modal-box';

  var emojiOpts = ['💪','🧘','🏃','🤸','🚴','🏋️','⚽','🧗','🤼','🏊','🥊','🎯','🌿','✨'];
  var emojiPickerHtml = emojiOpts.map(function(e) {
    return '<span class="emoji-opt' + (e === emoji ? ' selected' : '') + '" data-emoji="' + e + '">' + e + '</span>';
  }).join('');

  box.innerHTML = '<div class="rutina-modal-title">💪 <em>' + (existing ? 'Editar' : 'Nueva') + ' rutina</em></div>' +
    '<div class="modal-field"><label class="modal-label">Nombre</label>' +
    '<input class="modal-input" id="ejNombre" placeholder="ej: Rutina de cintura, Yoga matutino..." value="' + nombre.replace(/"/g, '&quot;') + '"></div>' +
    '<div class="modal-field"><label class="modal-label">Emoji</label>' +
    '<div class="emoji-picker-row" id="ejEmojiPicker">' + emojiPickerHtml + '</div></div>' +
    '<div class="modal-field"><label class="modal-label">Imagen de la rutina (opcional)</label>' +
    '<img id="ejImgPreview" class="ej-img-preview" src="' + imgBase64 + '" alt="" style="display:' + (imgBase64 ? 'block' : 'none') + '">' +
    '<label class="ej-img-upload-btn" for="ejImgInput">📷 ' + (imgBase64 ? 'Cambiar imagen' : 'Añadir imagen') + '</label>' +
    '<input type="file" id="ejImgInput" accept="image/*" style="display:none">' +
    '<div class="modal-field" style="margin-top:.6rem"><label class="modal-label">O URL de imagen</label>' +
    '<input class="modal-input" id="ejImgUrl" placeholder="https://ejemplo.com/imagen.jpg" value="" style="width:100%"></div>' +
    '<div class="modal-field"><label class="modal-label">Ejercicios</label>' +
    '<div id="ejPasosList"></div>' +
    '<button class="rutina-add-paso-btn" id="ejAddPasoBtn">+ Agregar ejercicio</button></div>' +
    '<div class="modal-btns">' +
    '<button class="modal-btn-cancel" id="ejEditModalCancel">Cancelar</button>' +
    (existing ? '<button class="modal-btn-delete" id="ejDelBtn">⋯ Eliminar</button>' : '') +
    '<button class="modal-btn-save" id="ejSaveBtn">Guardar 💪</button></div>';

  back.appendChild(box);
  document.body.appendChild(back);

  var ejCancelEl = document.getElementById('ejEditModalCancel');
  if (ejCancelEl) ejCancelEl.onclick = function() { back.remove(); };
  var ejDelBtn = document.getElementById('ejDelBtn');
  if (ejDelBtn) {
    ejDelBtn.onclick = function() {
      kittyConfirm('¿Eliminar "' + existing.name + '"?', function() {
        ejTemplates = ejTemplates.filter(function(t){ return t.id !== existing.id; });
        saveEjercicio(); renderEjercicio();
        back.remove();
      });
    };
  }

  // Image preview handlers
  var imgPreview = document.getElementById('ejImgPreview');
  var imgInput = document.getElementById('ejImgInput');
  var imgUrlInput = document.getElementById('ejImgUrl');
  var currentImgBase64 = imgBase64;
  
  // File upload handler
  imgInput.onchange = function() {
    var file = imgInput.files[0];
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function(e) {
      currentImgBase64 = e.target.result;
      imgPreview.src = currentImgBase64;
      imgPreview.style.display = 'block';
      box.querySelector('.ej-img-upload-btn').textContent = '📷 Cambiar imagen';
      imgUrlInput.value = '';
    };
    reader.readAsDataURL(file);
  };
  
  // URL input handler
  imgUrlInput.oninput = function() {
    var url = this.value.trim();
    if (url) {
      currentImgBase64 = url;
      imgPreview.src = url;
      imgPreview.style.display = 'block';
      box.querySelector('.ej-img-upload-btn').textContent = '📷 Cambiar imagen';
    }
  };
  
  // Clear image button
  var clearBtn = document.createElement('button');
  clearBtn.className = 'ej-img-clear-btn';
  clearBtn.textContent = '✕ Quitar imagen';
  clearBtn.style.cssText = 'display:' + (imgBase64 ? 'inline-flex' : 'none') + ';margin-top:.4rem;align-items:center;background:none;border:1.5px solid var(--border);border-radius:20px;padding:.3rem .7rem;font-size:.7rem;font-weight:700;color:var(--muted2);cursor:pointer;font-family:var(--font-body)';
  clearBtn.onclick = function() {
    currentImgBase64 = '';
    imgPreview.style.display = 'none';
    imgPreview.src = '';
    imgUrlInput.value = '';
    clearBtn.style.display = 'none';
    box.querySelector('.ej-img-upload-btn').textContent = '📷 Añadir imagen';
  };
  
  // Insert clear button after the URL input
  imgUrlInput.parentNode.insertBefore(clearBtn, imgUrlInput.nextSibling);
  
  // Emoji picker
  var selectedEmoji = emoji;
  back.querySelectorAll('.emoji-opt').forEach(function(opt) {
    opt.onclick = function() {
      back.querySelectorAll('.emoji-opt').forEach(function(o) { o.classList.remove('selected'); });
      opt.classList.add('selected');
      selectedEmoji = opt.dataset.emoji;
    };
  });

  function renderPasos() {
    var list = box.querySelector('#ejPasosList');
    list.innerHTML = '';
    pasos.forEach(function(paso, pi) {
      var row = document.createElement('div');
      row.className = 'ej-paso-edit-row';
      row.innerHTML = '<span style="font-size:.65rem;font-weight:700;color:var(--muted2);min-width:16px">' + (pi+1) + '.</span>' +
        '<input type="text" placeholder="Nombre del ejercicio..." value="' + paso.texto.replace(/"/g,'&quot;') + '">' +
        '<input type="text" class="ej-dur-input" placeholder="dur. (opc.)" value="' + (paso.duracion || '').replace(/"/g,'&quot;') + '">' +
        '<button class="rutina-paso-del">x</button>';
      row.querySelectorAll('input')[0].oninput = function(e) { pasos[pi].texto = e.target.value; };
      row.querySelectorAll('input')[1].oninput = function(e) { pasos[pi].duracion = e.target.value; };
      row.querySelector('.rutina-paso-del').onclick = function() { pasos.splice(pi,1); renderPasos(); };
      list.appendChild(row);
    });
  }

  renderPasos();

  box.querySelector('#ejAddPasoBtn').onclick = function() {
    pasos.push({ texto:'', duracion:'' });
    renderPasos();
    var inputs = box.querySelectorAll('#ejPasosList input[type=text]');
    var last = inputs[inputs.length - 2];
    if (last) last.focus();
  };

  box.querySelector('#ejSaveBtn').onclick = function() {
    var n = box.querySelector('#ejNombre').value.trim();
    if (!n) { box.querySelector('#ejNombre').focus(); return; }
    var cleanPasos = pasos.filter(function(p) { return p.texto.trim() !== ''; })
      .map(function(p) { return { texto: p.texto.trim(), duracion: p.duracion ? p.duracion.trim() : '' }; });

    if (existing) {
      existing.name = n;
      existing.emoji = selectedEmoji;
      existing.imgBase64 = currentImgBase64;
      existing.pasos = cleanPasos;
    } else {
      ejTemplates.push({ id: 'ej_' + Date.now(), name: n, emoji: selectedEmoji, imgBase64: currentImgBase64, pasos: cleanPasos });
    }
    saveEjercicio(); renderEjercicio();
    back.remove();
  };

  box.querySelector('#ejNombre').focus();
}

// Patch cloud sync
var _origSyncEj = window.syncFromCloud;
window.syncFromCloud = function() {
  if (window._ejTemplates) ejTemplates = window._ejTemplates;
  if (window._ejRegistros) ejRegistros = window._ejRegistros;
  if (_origSyncEj) _origSyncEj();
  renderEjercicio();
};

loadEjercicio();
