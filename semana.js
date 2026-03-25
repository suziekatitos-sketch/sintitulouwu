// ════════════════════════════════════════════════════════════════
// Yuki 🌸 — semana.js
// ════════════════════════════════════════════════════════════════


// dateKey helper (needed early)
function dateKey(d) {
  if (typeof d === 'string') return d;
  return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');
}
// ══════════════════════════════════════════
//  SECCIÓN · RUTINAS
// ══════════════════════════════════════════

const RUTINA_EMOJIS = ['🌸','⭐','🔥','💫','🌙','🌈','🎯','💪','🧘','📚','🎨','🎵','🌿','✨','🦋','🐱'];
const RUTINA_FRANJAS = [
  { id:'m', icon:'🌅', name:'Mañana',  cls:'franja-m' },
  { id:'t', icon:'☀️', name:'Tarde',   cls:'franja-t' },
  { id:'n', icon:'🌙', name:'Noche',   cls:'franja-n' },
];

// State
let rutinaTemplates = [];     // [{ id, name, emoji, pasos: { m:[], t:[], n:[] } }]
// Helper: lee el texto de un paso sin importar si es string u objeto legacy
function pasoText(p) {
  if (typeof p === 'string') return p;
  if (p && typeof p === 'object') return p.nombre || p.name || p.texto || p.text || '';
  return String(p ?? '');
}
let rutinaAsignaciones = {};  // { 'YYYY-MM-DD': templateId }
let rutinaCompletions = {};   // { 'templateId|YYYY-MM-DD|franja|idx': true }
let rutinaDateOffset = 0;     // days from today

function getRutinaDate() {
  const d = new Date();
  d.setDate(d.getDate() + rutinaDateOffset);
  return d;
}

function saveRutinas() {
  try { localStorage.setItem('rutina_templates',    JSON.stringify(rutinaTemplates));    } catch(e){}
  try { localStorage.setItem('rutina_asignaciones', JSON.stringify(rutinaAsignaciones)); } catch(e){}
  try { localStorage.setItem('rutina_completions',  JSON.stringify(rutinaCompletions));  } catch(e){}
  if (window.cloudSave) {
    window.cloudSave('rutina_templates',    rutinaTemplates);
    window.cloudSave('rutina_asignaciones', rutinaAsignaciones);
    window.cloudSave('rutina_completions',  rutinaCompletions);
  }
}

function loadRutinas() {
  rutinaTemplates    = window._rutinaTemplates    || JSON.parse(localStorage.getItem('rutina_templates')    || '[]');
  rutinaAsignaciones = window._rutinaAsignaciones || JSON.parse(localStorage.getItem('rutina_asignaciones') || '{}');
  rutinaCompletions  = window._rutinaCompletions  || JSON.parse(localStorage.getItem('rutina_completions')  || '{}');
}

function shuffleArray(arr) {
  var a = arr.slice();
  for (var i = a.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var tmp = a[i]; a[i] = a[j]; a[j] = tmp;
  }
  return a;
}

function shuffleRutina(templateId) {
  const tpl = rutinaTemplates.find(t => t.id === templateId);
  if (!tpl || !tpl.pasos) return;
  // Solo barajar tarde y noche — la mañana se mantiene igual 🌅
  ['t','n'].forEach(function(f) {
    if (tpl.pasos[f] && tpl.pasos[f].length > 1) {
      tpl.pasos[f] = shuffleArray(tpl.pasos[f]);
    }
  });
  // Limpiar completions del día para que los checks correspondan al nuevo orden
  const dk = dateKey(getRutinaDate());
  Object.keys(rutinaCompletions).forEach(function(k) {
    if (k.startsWith(templateId + '|' + dk + '|')) {
      delete rutinaCompletions[k];
    }
  });
  saveRutinas();
  renderRutinas();
  // Mini feedback visual
  if (window.starBurst) {
    var el = document.getElementById('rutAssigned');
    if (el) starBurst(el);
  }
}

function renderRutinas() {
  const date = getRutinaDate();
  const dk   = dateKey(date);

  // Date label
  const DIAS_ES  = ['domingo','lunes','martes','miércoles','jueves','viernes','sábado'];
  const MESES_ES = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
  const isToday  = rutinaDateOffset === 0;
  const isTomorrow = rutinaDateOffset === 1;
  let label = `${DIAS_ES[date.getDay()]} ${date.getDate()} de ${MESES_ES[date.getMonth()]}`;
  if (isToday)    label = '📅 Hoy - ' + label;
  if (isTomorrow) label = '📅 Mañana - ' + label;
  const _rdl = document.getElementById('rutDateLabel'); if (_rdl) _rdl.textContent = label;

  // Assigned template for this day
  const assignedId = rutinaAsignaciones[dk];
  const assigned   = assignedId ? rutinaTemplates.find(t => t.id === assignedId) : null;

  const assignedEl = document.getElementById('rutAssigned');
  if (!assignedEl) return;
  assignedEl.innerHTML = '';

  if (assigned) {
    const chip = document.createElement('div');
    chip.className = 'rutina-assign-chip has-rutina';
    chip.innerHTML = `${assigned.emoji} ${assigned.name} <span style="opacity:.6;font-size:.65rem">· ver pasos</span>`;
    chip.onclick = () => openRutinaSessionModal(assigned.id, dk);
    assignedEl.appendChild(chip);

    const clearBtn = document.createElement('button');
    clearBtn.className = 'rut-action-btn';
    clearBtn.title = 'Quitar rutina de este día';
    clearBtn.textContent = '✕';
    clearBtn.onclick = () => {
      delete rutinaAsignaciones[dk];
      saveRutinas(); renderRutinas();
    };
    assignedEl.appendChild(clearBtn);

    // Shuffle button
    const shuffleBtn = document.createElement('button');
    shuffleBtn.className = 'rut-action-btn';
    shuffleBtn.title = 'Modo Shuffle — mezcla tarde y noche, la mañana se mantiene igual 🌅🔀';
    shuffleBtn.innerHTML = '🔀';
    shuffleBtn.style.cssText = 'font-size:.9rem;transition:transform .3s';
    shuffleBtn.onclick = () => {
      shuffleBtn.style.transform = 'rotate(360deg)';
      setTimeout(() => shuffleBtn.style.transform = '', 350);
      shuffleRutina(assigned.id);
    };
    assignedEl.appendChild(shuffleBtn);

    // Colchón toggle
    var colchonActive = localStorage.getItem('rutina_colchon') === '1';
    const colchonBtn = document.createElement('button');
    colchonBtn.className = 'rut-action-btn';
    colchonBtn.title = 'Tiempo de Colchón — pausa suave entre tareas';
    colchonBtn.innerHTML = colchonActive ? '🌿 Colchón ✓' : '🌿 Colchón';
    colchonBtn.style.cssText = colchonActive ? 'color:var(--rosa);border-color:var(--rosa);font-size:.72rem' : 'font-size:.72rem';
    colchonBtn.onclick = () => {
      var now = localStorage.getItem('rutina_colchon') === '1';
      localStorage.setItem('rutina_colchon', now ? '0' : '1');
      renderRutinas();
    };
    assignedEl.appendChild(colchonBtn);
  } else {
    const chip = document.createElement('div');
    chip.className = 'rutina-assign-chip';
    chip.innerHTML = '＋ Asignar rutina a este día';
    chip.onclick = () => openAssignModal(dk);
    assignedEl.appendChild(chip);
  }

  // Day view (3 franjas)
  const dayView = document.getElementById('rutDayView');
  if (!dayView) return;
  dayView.innerHTML = '';

  RUTINA_FRANJAS.forEach(franja => {
    const col = document.createElement('div');
    col.className = `rutina-franja ${franja.cls}`;

    const title = document.createElement('div');
    title.className = 'rutina-franja-title';
    title.textContent = franja.icon + ' ' + franja.name;
    col.appendChild(title);

    const pasos = assigned ? (assigned.pasos[franja.id] || []) : [];

    if (pasos.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'rutina-franja-empty';
      empty.textContent = assigned ? 'Sin pasos' : 'Sin rutina asignada';
      col.appendChild(empty);
    } else {
      const colchonOn = localStorage.getItem('rutina_colchon') === '1';
      pasos.forEach((paso, idx) => {
        const cKey = `${assignedId}|${dk}|${franja.id}|${idx}`;
        const done = !!rutinaCompletions[cKey];

        const row = document.createElement('div');
        row.className = 'rutina-paso' + (done ? ' paso-done' : '');

        const chk = document.createElement('span');
        chk.className = 'paso-check';
        chk.textContent = done ? '✓' : '';
        chk.onclick = () => {
          rutinaCompletions[cKey] = !done;
          saveRutinas(); renderRutinas();
        };

        const txt = document.createElement('span');
        txt.textContent = pasoText(paso);

        row.appendChild(chk);
        row.appendChild(txt);
        row.onclick = () => {
          rutinaCompletions[cKey] = !done;
          saveRutinas(); renderRutinas();
        };
        col.appendChild(row);

        // Colchón entre tareas (no después de la última)
        if (colchonOn && idx < pasos.length - 1) {
          const cColchonKey = `${assignedId}|${dk}|${franja.id}|colchon|${idx}`;
          const cDone = !!rutinaCompletions[cColchonKey];
          const colchon = document.createElement('div');
          colchon.style.cssText = [
            'display:flex;align-items:center;gap:.5rem;',
            'padding:.35rem .6rem;margin:.1rem 0;',
            'border-radius:10px;cursor:pointer;',
            'background:' + (cDone ? 'var(--rosa-soft)' : 'transparent') + ';',
            'border:1px dashed ' + (cDone ? 'var(--rosa)' : 'var(--border)') + ';',
            'opacity:' + (cDone ? '.6' : '1') + ';',
            'transition:all .2s'
          ].join('');
          colchon.innerHTML = '<span style="font-size:.75rem">' + (cDone ? '✓' : '🌿') + '</span>' +
            '<span style="font-size:.72rem;font-weight:600;color:var(--muted);font-style:italic">' +
            'Respira. Tómate un momento antes de continuar. (ꈍᴗꈍ) ♡</span>';
          colchon.onclick = () => {
            rutinaCompletions[cColchonKey] = !cDone;
            saveRutinas(); renderRutinas();
          };
          col.appendChild(colchon);
        }
      });
    }

    dayView.appendChild(col);
  });

  // Templates list
  const list = document.getElementById('rutTemplatesList');
  if (!list) return;
  list.innerHTML = '';

  if (rutinaTemplates.length === 0) {
    list.innerHTML = '<div class="rutina-empty-state">🐾 Aún no tienes plantillas.<br>¡Crea tu primera rutina!</div>';
  } else {
    rutinaTemplates.forEach(tpl => {
      const card = document.createElement('div');
      card.className = 'rutina-template-card' + (tpl.id === assignedId ? ' active-template' : '');

      const totalPasos = tpl.tipo === 'foto' ? 1 : Object.values(tpl.pasos || {}).reduce((s, arr) => s + arr.length, 0);

      if (tpl.tipo === 'foto' && tpl.foto) {
        card.innerHTML = `
          <img src="${tpl.foto}" style="width:38px;height:38px;object-fit:cover;border-radius:8px;flex-shrink:0;border:1.5px solid var(--border);" onerror="this.style.display='none'">
          <div class="rutina-template-info">
            <div class="rutina-template-name">📸 ${tpl.name}</div>
          </div>`;
      } else {
        card.innerHTML = `
          <span class="rutina-template-emoji">${tpl.emoji || '🌸'}</span>
          <div class="rutina-template-info">
            <div class="rutina-template-name">${tpl.name}</div>
          </div>`;
      }

      card.onclick = () => openRutinaViewModal(tpl.id);
      list.appendChild(card);
    });
  }
}


// ── Session modal (read-only + check steps for a specific day)
function openRutinaSessionModal(templateId, dk) {
  const tpl = rutinaTemplates.find(t => t.id === templateId);
  if (!tpl) return;
  const old = document.getElementById('rutinaSessionModal');
  if (old) old.remove();

  const backdrop = document.createElement('div');
  backdrop.className = 'rutina-modal-backdrop';
  backdrop.id = 'rutinaSessionModal';
  backdrop.onclick = (e) => { if (e.target === backdrop) backdrop.remove(); };

  const box = document.createElement('div');
  box.className = 'rutina-modal-box';
  box.style.position = 'relative';

  // Change-rutina button top right
  const changeBtn = document.createElement('button');
  changeBtn.title = 'Cambiar rutina del día';
  changeBtn.textContent = '🔄';
  changeBtn.style.cssText = 'position:absolute;top:.7rem;right:.7rem;background:var(--pink-light);border:none;border-radius:50%;width:32px;height:32px;font-size:1rem;cursor:pointer;display:flex;align-items:center;justify-content:center;';
  changeBtn.onclick = () => { backdrop.remove(); openAssignModal(dk); };

  // Title
  const titleEl = document.createElement('div');
  titleEl.className = 'rutina-modal-title';
  titleEl.style.paddingRight = '2.5rem';
  titleEl.innerHTML = (tpl.emoji || '📸') + ' <em>' + tpl.name + '</em>';

  // Build franjas with checkboxes
  const bodyEl = document.createElement('div');
  bodyEl.style.marginTop = '.6rem';

  function buildBody() {
    bodyEl.innerHTML = '';

    // ── Rutina de FOTO ──
    if (tpl.tipo === 'foto' && tpl.foto) {
      const fotoCKey = templateId + '|' + dk + '|foto';
      const fotoDone = !!rutinaCompletions[fotoCKey];

      // Imagen
      const imgWrap = document.createElement('div');
      imgWrap.style.cssText = 'text-align:center;margin-bottom:.8rem;';
      const img = document.createElement('img');
      img.src = tpl.foto;
      img.style.cssText = 'max-width:100%;max-height:240px;border-radius:12px;border:1.5px solid var(--border);box-shadow:0 2px 8px rgba(0,0,0,.08);';
      imgWrap.appendChild(img);
      bodyEl.appendChild(imgWrap);

      // Checkbox "Hice esta rutina hoy"
      const checkRow = document.createElement('div');
      checkRow.style.cssText = 'display:flex;align-items:center;gap:.7rem;padding:.6rem .8rem;border-radius:10px;background:var(--bg);border:2px solid ' + (fotoDone ? 'var(--verde)' : 'var(--border)') + ';cursor:pointer;transition:all .2s;';

      const chk = document.createElement('span');
      chk.style.cssText = 'width:22px;height:22px;min-width:22px;border-radius:50%;border:2px solid ' + (fotoDone ? 'var(--verde)' : 'var(--muted2)') + ';display:flex;align-items:center;justify-content:center;font-size:.7rem;background:' + (fotoDone ? 'var(--verde)' : 'transparent') + ';color:white;flex-shrink:0;transition:all .2s;';
      chk.textContent = fotoDone ? '✓' : '';

      const lbl = document.createElement('span');
      lbl.style.cssText = 'font-size:.85rem;font-weight:600;color:var(--text);' + (fotoDone ? 'text-decoration:line-through;opacity:.6;' : '');
      lbl.textContent = fotoDone ? '¡Rutina completada hoy! 🎉' : '✅ Marcar como hecha hoy';

      checkRow.appendChild(chk);
      checkRow.appendChild(lbl);
      checkRow.onclick = () => {
        rutinaCompletions[fotoCKey] = !fotoDone;
        saveRutinas();
        renderRutinas();
        buildBody();
      };
      bodyEl.appendChild(checkRow);
      return;
    }

    // ── Rutina de TEXTO (pasos) ──
    RUTINA_FRANJAS.forEach(f => {
      const lista = (tpl.pasos[f.id] || []);
      if (lista.length === 0) return;

      const franjaDiv = document.createElement('div');
      franjaDiv.style.marginBottom = '.8rem';

      const franjaTitle = document.createElement('div');
      franjaTitle.style.cssText = 'font-size:.7rem;font-weight:700;color:var(--muted2);margin-bottom:.4rem';
      franjaTitle.textContent = f.icon + ' ' + f.name;
      franjaDiv.appendChild(franjaTitle);

      lista.forEach((paso, idx) => {
        const cKey = templateId + '|' + dk + '|' + f.id + '|' + idx;
        const done = !!rutinaCompletions[cKey];

        const row = document.createElement('div');
        row.style.cssText = 'display:flex;align-items:center;gap:.5rem;padding:.4rem .5rem;border-radius:8px;background:var(--bg);border:1.5px solid ' + (done ? 'var(--verde)' : 'var(--border)') + ';margin-bottom:.3rem;cursor:pointer;transition:all .15s;' + (done ? 'opacity:.6;' : '');

        const chk = document.createElement('span');
        chk.style.cssText = 'width:18px;height:18px;min-width:18px;border-radius:50%;border:2px solid ' + (done ? 'var(--verde)' : 'var(--muted2)') + ';display:flex;align-items:center;justify-content:center;font-size:.6rem;background:' + (done ? 'var(--verde)' : 'transparent') + ';color:white;flex-shrink:0;transition:all .15s;';
        chk.textContent = done ? '✓' : '';

        const txt = document.createElement('span');
        txt.style.cssText = 'font-size:.8rem;color:var(--text);font-weight:500;' + (done ? 'text-decoration:line-through;' : '');
        txt.textContent = pasoText(paso);

        row.appendChild(chk);
        row.appendChild(txt);

        row.onclick = () => {
          rutinaCompletions[cKey] = !done;
          saveRutinas();
          renderRutinas();
          buildBody();
        };

        franjaDiv.appendChild(row);
      });

      bodyEl.appendChild(franjaDiv);
    });
  }

  buildBody();

  // Buttons
  const btnsEl = document.createElement('div');
  btnsEl.className = 'modal-btns';
  btnsEl.style.marginTop = '1rem';
  const closeBtn = document.createElement('button');
  closeBtn.className = 'modal-btn-cancel';
  closeBtn.textContent = 'Listo ✓';
  closeBtn.onclick = () => backdrop.remove();
  btnsEl.appendChild(closeBtn);

  box.appendChild(changeBtn);
  box.appendChild(titleEl);
  box.appendChild(bodyEl);
  box.appendChild(btnsEl);
  backdrop.appendChild(box);
  document.body.appendChild(backdrop);
}

// ── Assign modal (pick template for a day)
function openAssignModal(dk) {
  const old = document.getElementById('rutinaAssignModal');
  if (old) old.remove();

  if (rutinaTemplates.length === 0) {
    alert('Primero crea una plantilla de rutina 🐱');
    return;
  }

  const backdrop = document.createElement('div');
  backdrop.className = 'rutina-modal-backdrop';
  backdrop.id = 'rutinaAssignModal';

  let html = `<div class="rutina-modal-box">
    <div class="rutina-modal-title">📅 <em>Asignar rutina</em></div>
    <div style="display:flex;flex-direction:column;gap:.5rem;margin-bottom:1.2rem">`;

  rutinaTemplates.forEach(tpl => {
    const totalPasos = Object.values(tpl.pasos).reduce((s, arr) => s + arr.length, 0);
    html += `<div class="rutina-template-card" data-id="${tpl.id}" style="cursor:pointer">
      <span class="rutina-template-emoji">${tpl.emoji}</span>
      <div class="rutina-template-info">
        <div class="rutina-template-name">${tpl.name}</div>
        <div class="rutina-template-meta">${totalPasos} pasos</div>
      </div>
    </div>`;
  });

  html += `</div>
    <div class="modal-btns">
      <button class="modal-btn-cancel" onclick="document.getElementById('rutinaAssignModal').remove()">Cancelar</button>
    </div>
  </div>`;

  backdrop.innerHTML = html;
  backdrop.onclick = (e) => { if (e.target === backdrop) backdrop.remove(); };

  backdrop.querySelectorAll('.rutina-template-card').forEach(card => {
    card.onclick = () => {
      rutinaAsignaciones[dk] = card.dataset.id;
      saveRutinas(); renderRutinas();
      backdrop.remove();
    };
  });

  document.body.appendChild(backdrop);
}


// ── Template VIEW modal (read-only)
function openRutinaViewModal(templateId) {
  const tpl = rutinaTemplates.find(t => t.id === templateId);
  if (!tpl) return;
  const old = document.getElementById('rutinaViewModal');
  if (old) old.remove();

  const backdrop = document.createElement('div');
  backdrop.className = 'rutina-modal-backdrop';
  backdrop.id = 'rutinaViewModal';
  backdrop.onclick = (e) => { if (e.target === backdrop) backdrop.remove(); };

  const box = document.createElement('div');
  box.className = 'rutina-modal-box';
  box.style.position = 'relative';

  let pasosHtml = '';
  RUTINA_FRANJAS.forEach(f => {
    const lista = (tpl.pasos[f.id] || []);
    if (lista.length === 0) return;
    pasosHtml += '<div style="margin-bottom:.8rem">'
      + '<div style="font-size:.7rem;font-weight:700;color:var(--muted2);margin-bottom:.4rem">' + f.icon + ' ' + f.name + '</div>'
      + lista.map((p, i) =>
          '<div style="display:flex;align-items:center;gap:.5rem;padding:.35rem .5rem;border-radius:8px;background:var(--bg);border:1.5px solid var(--border);margin-bottom:.3rem">'
          + '<span style="font-size:.65rem;font-weight:700;color:var(--muted2);min-width:16px">' + (i+1) + '.</span>'
          + '<span style="font-size:.8rem;color:var(--text);font-weight:500">' + pasoText(p) + '</span>'
          + '</div>'
        ).join('')
      + '</div>';
  });

  const editBtn = document.createElement('button');
  editBtn.id = 'rutViewEditBtn';
  editBtn.title = 'Editar rutina';
  editBtn.textContent = '✏️';
  editBtn.style.cssText = 'position:absolute;top:.7rem;right:.7rem;background:var(--pink-light);border:none;border-radius:50%;width:32px;height:32px;font-size:1rem;cursor:pointer;display:flex;align-items:center;justify-content:center;';
  editBtn.onclick = () => { backdrop.remove(); openRutinaModal(templateId); };

  const inner = document.createElement('div');
  // Para rutinas de foto: mostrar imagen + casilla en vez de pasos
  var viewBodyHtml;
  if (tpl.tipo === 'foto' && tpl.foto) {
    var fotoCKeyV = tpl.id + '|' + dk + '|foto';
    var fotoDoneV = !!rutinaCompletions[fotoCKeyV];
    viewBodyHtml = '<div style="text-align:center;margin-bottom:.8rem">'
      + '<img src="' + tpl.foto + '" style="max-width:100%;max-height:240px;border-radius:12px;border:1.5px solid var(--border);box-shadow:0 2px 8px rgba(0,0,0,.08);" onerror="this.style.display=&quot;none&quot;">'
      + '</div>'
      + '<div id="rutViewCheckRow" style="display:flex;align-items:center;gap:.7rem;padding:.8rem 1rem;border-radius:12px;background:var(--bg);border:2px solid ' + (fotoDoneV ? 'var(--verde)' : 'var(--border)') + ';cursor:pointer;transition:all .2s;font-size:.95rem;font-weight:700;">'
      + '<span id="rutViewChk" style="width:26px;height:26px;min-width:26px;border-radius:50%;border:2px solid ' + (fotoDoneV ? 'var(--verde)' : 'var(--muted2)') + ';display:flex;align-items:center;justify-content:center;font-size:.8rem;background:' + (fotoDoneV ? 'var(--verde)' : 'transparent') + ';color:white;flex-shrink:0;transition:all .2s;">' + (fotoDoneV ? '✓' : '') + '</span>'
      + '<span id="rutViewLbl" style="color:var(--text);' + (fotoDoneV ? 'text-decoration:line-through;opacity:.6;' : '') + '">' + (fotoDoneV ? '¡Rutina completada hoy! 🎉' : '✅ Marcar como hecha hoy') + '</span>'
      + '</div>';
  } else {
    viewBodyHtml = pasosHtml || '<div style="color:var(--muted2);font-size:.8rem">Sin pasos registrados aún.</div>';
  }

  inner.innerHTML = '<div class="rutina-modal-title" style="padding-right:2.5rem">' + (tpl.emoji || '📸') + ' <em>' + tpl.name + '</em></div>'
    + '<div style="margin-top:.6rem">' + viewBodyHtml + '</div>'
    + '<div class="modal-btns" style="margin-top:1rem"><button class="modal-btn-cancel" id="rutViewCloseBtn">Cerrar</button></div>';

  box.appendChild(editBtn);
  box.appendChild(inner);
  inner.querySelector('#rutViewCloseBtn').onclick = () => backdrop.remove();

  // Si es rutina de foto, conectar el click de la casilla
  if (tpl.tipo === 'foto' && tpl.foto) {
    var checkRowEl = inner.querySelector('#rutViewCheckRow');
    if (checkRowEl) {
      checkRowEl.onclick = function() {
        var fotoCKeyV2 = tpl.id + '|' + dk + '|foto';
        rutinaCompletions[fotoCKeyV2] = !rutinaCompletions[fotoCKeyV2];
        saveRutinas();
        renderRutinas();
        backdrop.remove();
      };
    }
  }

  backdrop.appendChild(box);
  document.body.appendChild(backdrop);
}

// ── Modal para elegir tipo de rutina
function openRutinaTipoModal() {
  const backdrop = document.createElement('div');
  backdrop.className = 'rutina-modal-backdrop';
  backdrop.onclick = (e) => { if (e.target === backdrop) backdrop.remove(); };

  const box = document.createElement('div');
  box.className = 'rutina-modal-box';
  box.style.maxWidth = '400px';
  
  box.innerHTML = `
    <div class="rutina-modal-title">🐾 <em>¿Qué tipo de rutina?</em></div>
    <div style="display:flex; gap:1rem; margin-top:2rem;">
      <button class="modal-btn-save" style="flex:1;" onclick="openRutinaModal(null, 'texto')">📝 Texto con pasos</button>
      <button class="modal-btn-save" style="flex:1;" onclick="openRutinaModal(null, 'foto')">📸 Foto</button>
    </button>
    <div style="margin-top:1rem;">
      <button class="modal-btn-cancel" style="width:100%;" onclick="this.closest('.rutina-modal-backdrop').remove()">Cancelar</button>
    </div>
  `;

  backdrop.appendChild(box);
  document.body.appendChild(backdrop);
}

// ── Template editor modal
function openRutinaModal(templateId, tipo) {
  // Si no hay tipo, preguntamos
  if (!tipo && !templateId) {
    openRutinaTipoModal();
    return;
  }
  
  const existing = templateId ? rutinaTemplates.find(t => t.id === templateId) : null;
  const rutinaTipo = tipo || (existing ? existing.tipo : 'texto');
  const old = document.getElementById('rutinaEditModal');
  if (old) old.remove();

  const emoji  = existing ? existing.emoji : '🌸';
  const nombre = existing ? existing.name  : '';
  const foto   = existing ? existing.foto : '';
  const pasos  = existing ? JSON.parse(JSON.stringify(existing.pasos)) : { m:[], t:[], n:[] };

  const backdrop = document.createElement('div');
  backdrop.className = 'rutina-modal-backdrop';
  backdrop.id = 'rutinaEditModal';
  backdrop.onclick = (e) => { if (e.target === backdrop) backdrop.remove(); };

  const box = document.createElement('div');
  box.className = 'rutina-modal-box';

  // Build emoji picker
  const emojiPickerHtml = RUTINA_EMOJIS.map(e =>
    `<span class="emoji-opt${e === emoji ? ' selected' : ''}" data-emoji="${e}">${e}</span>`
  ).join('');

  // HTML diferente según tipo
  const htmlContenido = rutinaTipo === 'foto' ? `
    <div class="modal-field">
      <label class="modal-label">Nombre de la rutina</label>
      <input class="modal-input" id="rutNombre" placeholder="ej: Rutina full body..." value="${nombre.replace(/"/g,'&quot;')}">
    </div>

    <div class="modal-field">
      <label class="modal-label">URL de la imagen</label>
      <input type="url" class="modal-input" id="rutFotoUrl" placeholder="https://ejemplo.com/mi-rutina.jpg" value="${foto ? foto.replace(/"/g,'&quot;') : ''}">
      <div id="rutFotoPreview" style="margin-top:.5rem;text-align:center;">
        ${foto ? `<img src="${foto}" style="max-width:100%;max-height:200px;border-radius:10px;border:1.5px solid var(--border);">` : ''}
      </div>
    </div>
  ` : `
    <div class="modal-field">
      <label class="modal-label">Nombre</label>
      <input class="modal-input" id="rutNombre" placeholder="ej: Rutina de lunes, Día de descanso..." value="${nombre.replace(/"/g,'&quot;')}">
    </div>

    <div class="modal-field">
      <label class="modal-label">Emoji</label>
      <div class="emoji-picker-row" id="emojiPicker">${emojiPickerHtml}</div>
    </div>

    <div class="modal-field rutina-pasos-section">
      <label class="modal-label">Pasos por franja</label>
      ${RUTINA_FRANJAS.map(f => `
        <div class="rutina-pasos-franja">
          <div class="rutina-pasos-franja-title">${f.icon} ${f.name}</div>
          <div class="rutina-pasos-list" id="pasosList_${f.id}"></div>
          <button class="rutina-add-paso-btn" data-franja="${f.id}">＋ Agregar paso</button>
        </div>`).join('')}
    </div>
  `;

  box.innerHTML = `
    <div class="rutina-modal-title">🐾 <em>${existing ? 'Editar' : 'Nueva'} rutina ${rutinaTipo === 'foto' ? '📸' : '📝'}</em></div>
    ${htmlContenido}
    ${existing ? '<div style="margin-top:.8rem;padding-top:.8rem;border-top:1.5px solid var(--border)"><button class="modal-btn-delete" id="rutDelBtn" style="width:100%">🗑️ Eliminar rutina</button></div>' : ''}
    <div class="modal-btns" style="margin-top:.6rem">
      <button class="modal-btn-cancel" onclick="document.getElementById('rutinaEditModal').remove()">Cancelar</button>
      <button class="modal-btn-save" id="rutSaveBtn">Guardar 🐱</button>
    </div>`;

  backdrop.appendChild(box);
  document.body.appendChild(backdrop);

  // Emoji picker (solo para texto)
  if (rutinaTipo === 'texto') {
    let selectedEmoji = emoji;
  backdrop.querySelectorAll('.emoji-opt').forEach(opt => {
    opt.onclick = () => {
      backdrop.querySelectorAll('.emoji-opt').forEach(o => o.classList.remove('selected'));
      opt.classList.add('selected');
      selectedEmoji = opt.dataset.emoji;
    };
  });

  // Render steps per franja
  function renderPasos(franjaId) {
    const list = backdrop.querySelector(`#pasosList_${franjaId}`);
    list.innerHTML = '';
    (pasos[franjaId] || []).forEach((paso, idx) => {
      const row = document.createElement('div');
      row.className = 'rutina-paso-edit-row';
      row.innerHTML = `
        <input type="text" value="${pasoText(paso).replace(/"/g,'&quot;')}" placeholder="Nombre del paso...">
        <button class="rutina-paso-del" data-franja="${franjaId}" data-idx="${idx}">✕</button>`;
      row.querySelector('input').oninput = (e) => { pasos[franjaId][idx] = e.target.value; };
      row.querySelector('.rutina-paso-del').onclick = () => {
        pasos[franjaId].splice(idx, 1);
        renderPasos(franjaId);
      };
      list.appendChild(row);
    });
  }

  RUTINA_FRANJAS.forEach(f => renderPasos(f.id));

  // Add paso buttons
  backdrop.querySelectorAll('.rutina-add-paso-btn').forEach(btn => {
    btn.onclick = () => {
      const fId = btn.dataset.franja;
      if (!pasos[fId]) pasos[fId] = [];
      pasos[fId].push('');
      renderPasos(fId);
      // Focus last input
      const inputs = backdrop.querySelectorAll(`#pasosList_${fId} input`);
      if (inputs.length) inputs[inputs.length - 1].focus();
    };
  });

  // Preview de URL en tiempo real
  if (rutinaTipo === 'foto') {
    const urlInput = backdrop.querySelector('#rutFotoUrl');
    const preview  = backdrop.querySelector('#rutFotoPreview');
    if (urlInput) {
      urlInput.oninput = () => {
        const url = urlInput.value.trim();
        if (url) {
          preview.innerHTML = `<img src="${url}" onerror="this.style.display='none'" onload="this.style.display='block'" style="max-width:100%;max-height:200px;border-radius:10px;border:1.5px solid var(--border);">`;
        } else {
          preview.innerHTML = '';
        }
      };
    }
  }

  // Save
  box.querySelector('#rutSaveBtn').onclick = () => {
    const nombre = backdrop.querySelector('#rutNombre').value.trim();
    if (!nombre) { backdrop.querySelector('#rutNombre').focus(); return; }

    if (rutinaTipo === 'foto') {
      const urlInput = backdrop.querySelector('#rutFotoUrl');
      const fotoUrl  = urlInput ? urlInput.value.trim() : foto;

      if (!fotoUrl) {
        alert('Por favor ingresa la URL de la imagen 🐱');
        urlInput && urlInput.focus();
        return;
      }

      if (existing) {
        existing.name = nombre;
        existing.foto = fotoUrl;
        existing.tipo = 'foto';
        existing.emoji = '📸';
      } else {
        rutinaTemplates.push({
          id:   'rut_' + Date.now(),
          name: nombre,
          emoji: '📸',
          foto: fotoUrl,
          tipo: 'foto',
          pasos: { m:[], t:[], n:[] }
        });
      }
      saveRutinas();
      renderRutinas();
      backdrop.remove();
      return;
    }

    // Guardar rutina de texto
    // Clean empty pasos
    RUTINA_FRANJAS.forEach(f => {
      pasos[f.id] = (pasos[f.id] || []).filter(p => p.trim() !== '');
    });

    if (existing) {
      existing.name = nombre;
      existing.emoji = selectedEmoji;
      existing.pasos = pasos;
      existing.tipo = 'texto';
    } else {
      rutinaTemplates.push({
        id: 'rut_' + Date.now(),
        name: nombre,
        emoji: selectedEmoji,
        pasos,
        tipo: 'texto'
      });
    }

    saveRutinas();
    renderRutinas();
    backdrop.remove();
  };

  // Wire delete button if editing
  const rutDelBtn = backdrop.querySelector('#rutDelBtn');
  if (rutDelBtn) {
    rutDelBtn.onclick = () => {
      kittyConfirm('¿Eliminar la rutina "' + existing.name + '"?', function() {
        rutinaTemplates = rutinaTemplates.filter(t => t.id !== existing.id);
        Object.keys(rutinaAsignaciones).forEach(k => {
          if (rutinaAsignaciones[k] === existing.id) delete rutinaAsignaciones[k];
        });
        saveRutinas(); renderRutinas();
        backdrop.remove();
      });
    };
  }

  backdrop.querySelector('#rutNombre').focus();
}

// ══════════════════════════════════════════
// PROYECTOS ACADÉMICOS
// ══════════════════════════════════════════
window.univProyectos = [];
var univProyectos = window.univProyectos;

function saveProyectos() {
  try { localStorage.setItem('univ_proyectos', JSON.stringify(univProyectos)); } catch(e){}
  if (window.cloudSave) window.cloudSave('univ_proyectos', univProyectos);
}

function loadProyectos() {
  univProyectos = window._univProyectos || JSON.parse(localStorage.getItem('univ_proyectos') || '[]');
  window.univProyectos = univProyectos;
}

function renderProyectos() {
  const list = document.getElementById('univProyectosList');
  if (!list) return;
  list.innerHTML = '';
  if (univProyectos.length === 0) {
    list.innerHTML = '<div class="rutina-empty-state">🔬 Sin proyectos aún.<br>¡Crea tu primer proyecto académico!</div>';
    return;
  }
  univProyectos.forEach((proy, proyIdx) => {
    const total   = proy.pasos.length;
    const done    = (proy.completedSteps || []).length;
    const allDone = total > 0 && done === total;
    const pct     = total > 0 ? Math.round((done / total) * 100) : 0;
    const card = document.createElement('div');
    card.className = 'desglose-card';
    card.id = 'pcard_' + proy.id;
    card.innerHTML =
      '<div class="desglose-card-header">' +
        '<div class="desglose-card-main">' +
          '<div class="desglose-card-title">' + proy.title +
            (proy.tipo ? '<span class="desglose-recompensa-tag" style="margin-left:.4rem">🔬 ' + proy.tipo + '</span>' : '') +
          '</div>' +
          '<div class="desglose-card-meta">' + done + '/' + total + ' pasos completados</div>' +
        '</div>' +
        '<div class="desglose-progress-mini"><div class="desglose-progress-mini-fill" style="width:' + pct + '%"></div></div>' +
        '<div class="desglose-card-actions">' +
          '<button class="rut-action-btn" data-edit="' + proy.id + '">✏️</button>' +
          '<button class="rut-action-btn" data-del="' + proy.id + '">✕</button>' +
        '</div>' +
        '<span class="desglose-chevron">▼</span>' +
      '</div>' +
      '<div class="desglose-body">' +
        '<div class="desglose-steps" id="psteps_' + proy.id + '"></div>' +
        '<div class="desglose-congrats ' + (allDone ? 'show' : '') + '">🌟 ¡Proyecto completado! Eso se llama dedicación 🎓</div>' +
      '</div>';
    card.querySelector('.desglose-card-header').onclick = (e) => {
      if (e.target.closest('.desglose-card-actions')) return;
      card.classList.toggle('open');
      if (card.classList.contains('open')) renderProyectoSteps(proy, proyIdx);
    };
    card.querySelector('[data-edit]').onclick = (e) => { e.stopPropagation(); openProyectoModal(proy.id); };
    card.querySelector('[data-del]').onclick = (e) => {
      e.stopPropagation();
      kittyConfirm('¿Eliminar "' + proy.title + '"?', function() {
        univProyectos.splice(proyIdx, 1);
        saveProyectos(); renderProyectos();
      });
    };
    list.appendChild(card);
  });
}

function renderProyectoSteps(proy, proyIdx) {
  const stepsEl = document.getElementById('psteps_' + proy.id);
  if (!stepsEl) return;
  stepsEl.innerHTML = '';
  const completed = proy.completedSteps || [];
  proy.pasos.forEach((paso, idx) => {
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
      chk.onclick = (e) => { e.stopPropagation(); toggleProyectoStep(proy.id, idx); };
      row.onclick = () => toggleProyectoStep(proy.id, idx);
    }
    const txt = document.createElement('span');
    txt.className = 'desglose-step-text';
    txt.textContent = paso;
    row.appendChild(num); row.appendChild(chk); row.appendChild(txt);
    stepsEl.appendChild(row);
  });
}

function toggleProyectoStep(proyId, stepIdx) {
  const proy = univProyectos.find(p => p.id === proyId);
  if (!proy) return;
  if (!proy.completedSteps) proy.completedSteps = [];
  const already = proy.completedSteps.includes(stepIdx);
  if (already) {
    proy.completedSteps = proy.completedSteps.filter(i => i < stepIdx);
  } else {
    proy.completedSteps.push(stepIdx);
  }
  saveProyectos(); renderProyectos();
  setTimeout(() => {
    const card = document.getElementById('pcard_' + proyId);
    if (card) {
      card.classList.add('open');
      const proyIdx = univProyectos.findIndex(p => p.id === proyId);
      renderProyectoSteps(univProyectos[proyIdx], proyIdx);
    }
  }, 50);
}

window.openProyectoModal = function openProyectoModal(proyId) {
  const existing = proyId ? univProyectos.find(p => p.id === proyId) : null;
  const old = document.getElementById('proyectoModal');
  if (old) old.remove();
  const titleVal = existing ? existing.title : '';
  const tipoVal  = existing ? (existing.tipo || '') : '';
  const pasos    = existing ? [...existing.pasos] : [];
  const TIPOS = ['Maqueta','Investigación','Exposición','Trabajo escrito','Laboratorio','Otro'];

  const backdrop = document.createElement('div');
  backdrop.className = 'rutina-modal-backdrop';
  backdrop.id = 'proyectoModal';
  backdrop.onclick = (e) => { if (e.target === backdrop) backdrop.remove(); };
  const box = document.createElement('div');
  box.className = 'rutina-modal-box';

  box.innerHTML =
    '<div class="rutina-modal-title">🔬 <em>' + (existing ? 'Editar' : 'Nuevo') + ' proyecto</em></div>' +
    '<div class="modal-field"><label class="modal-label">Nombre del proyecto</label>' +
    '<input class="modal-input" id="pTitle" placeholder="ej: Maqueta del sistema solar..." value="' + titleVal.replace(/"/g,'&quot;') + '"></div>' +
    '<div class="modal-field"><label class="modal-label">Tipo de proyecto</label>' +
    '<div style="display:flex;flex-wrap:wrap;gap:.4rem;margin-top:.3rem" id="pTipoWrap">' +
    TIPOS.map(t => '<button class="proy-tipo-btn' + (tipoVal === t ? ' selected' : '') + '" data-tipo="' + t + '" style="padding:.3rem .7rem;border-radius:20px;border:1.5px solid var(--border);background:var(--bg);font-size:.72rem;font-weight:600;cursor:pointer;color:var(--text);transition:all .15s">' + t + '</button>').join('') +
    '</div></div>' +
    '<div class="modal-field"><label class="modal-label">Pasos en orden estricto 🔒</label>' +
    '<div id="pPasosList" class="rutina-pasos-list"></div>' +
    '<button class="rutina-add-paso-btn" id="pAddPasoBtn">＋ Agregar paso</button></div>' +
    (existing ? '<div style="margin-top:.8rem;padding-top:.8rem;border-top:1.5px solid var(--border)"><button class="modal-btn-delete" id="pDelBtn" style="width:100%">🗑️ Eliminar proyecto</button></div>' : '') +
    '<div class="modal-btns" style="margin-top:.6rem"><button class="modal-btn-cancel" id="pCancelBtn">Cancelar</button><button class="modal-btn-save" id="pSaveBtn">Guardar 🎓</button></div>';

  backdrop.appendChild(box);
  document.body.appendChild(backdrop);

  let selectedTipo = tipoVal;
  box.querySelectorAll('.proy-tipo-btn').forEach(btn => {
    btn.onclick = () => {
      box.querySelectorAll('.proy-tipo-btn').forEach(b => { b.style.background='var(--bg)'; b.style.borderColor='var(--border)'; b.style.color='var(--text)'; });
      btn.style.background='var(--rosa)'; btn.style.borderColor='var(--rosa)'; btn.style.color='white';
      selectedTipo = btn.dataset.tipo;
    };
    if (tipoVal === btn.dataset.tipo) {
      btn.style.background='var(--rosa)'; btn.style.borderColor='var(--rosa)'; btn.style.color='white';
    }
  });

  function renderModalPasos() {
    const list = box.querySelector('#pPasosList');
    list.innerHTML = '';
    pasos.forEach((paso, idx) => {
      const row = document.createElement('div');
      row.className = 'rutina-paso-edit-row';
      row.innerHTML = '<span style="font-size:.65rem;font-weight:700;color:var(--muted2);min-width:16px">' + (idx+1) + '.</span>' +
        '<input type="text" value="' + pasoText(paso).replace(/"/g,'&quot;') + '" placeholder="Paso ' + (idx+1) + '...">' +
        '<button class="rutina-paso-del">✕</button>';
      row.querySelector('input').oninput = (e) => { pasos[idx] = e.target.value; };
      row.querySelector('.rutina-paso-del').onclick = () => { pasos.splice(idx,1); renderModalPasos(); };
      list.appendChild(row);
    });
  }
  renderModalPasos();

  box.querySelector('#pAddPasoBtn').onclick = () => {
    pasos.push(''); renderModalPasos();
    const inputs = box.querySelectorAll('#pPasosList input');
    if (inputs.length) inputs[inputs.length-1].focus();
  };
  box.querySelector('#pCancelBtn').onclick = () => backdrop.remove();
  box.querySelector('#pSaveBtn').onclick = () => {
    const t = box.querySelector('#pTitle').value.trim();
    if (!t) { box.querySelector('#pTitle').focus(); return; }
    const cleanPasos = pasos.filter(p => p.trim() !== '');
    if (existing) {
      existing.title = t; existing.tipo = selectedTipo; existing.pasos = cleanPasos;
    } else {
      univProyectos.push({ id: 'proy_' + Date.now(), title: t, tipo: selectedTipo, pasos: cleanPasos, completedSteps: [] });
    }
    saveProyectos(); renderProyectos(); backdrop.remove();
  };
  const pDelBtn = box.querySelector('#pDelBtn');
  if (pDelBtn) {
    pDelBtn.onclick = () => {
      kittyConfirm('¿Eliminar "' + existing.title + '"?', function() {
        univProyectos = univProyectos.filter(p => p.id !== existing.id);
        saveProyectos(); renderProyectos(); backdrop.remove();
      });
    };
  }
  box.querySelector('#pTitle').focus();
}

loadProyectos();
renderProyectos();


// Nav buttons
var _rutPrev = document.getElementById('rutPrevDay'); if(_rutPrev) _rutPrev.onclick = () => { rutinaDateOffset--; renderRutinas(); };
var _rutNext = document.getElementById('rutNextDay'); if(_rutNext) _rutNext.onclick = () => { rutinaDateOffset++; renderRutinas(); };
var _rutNew = document.getElementById('rutNewBtn'); if(_rutNew) _rutNew.onclick = () => openRutinaModal(null);

// Patch cloud sync
const _origSync = window.syncFromCloud;
window.syncFromCloud = function() {
  if (window._rutinaTemplates)    rutinaTemplates    = window._rutinaTemplates;
  if (window._rutinaAsignaciones) rutinaAsignaciones = window._rutinaAsignaciones;
  if (window._rutinaCompletions)  rutinaCompletions  = window._rutinaCompletions;
  if (_origSync) _origSync();
  renderRutinas();
};

loadRutinas();
renderRutinas();
}
