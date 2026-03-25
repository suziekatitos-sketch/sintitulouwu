// ════════════════════════════════════════════════════════════════
// Yuki 🌸 — misc_tabs.js
// ════════════════════════════════════════════════════════════════


document.addEventListener('DOMContentLoaded', function() {
  var ejPrev = document.getElementById('ejPrevDay');
  var ejNext = document.getElementById('ejNextDay');
  var ejNew  = document.getElementById('ejNewBtn');
  if (ejPrev) ejPrev.onclick = function() { ejDateOffset--; renderEjercicio(); };
  if (ejNext) ejNext.onclick = function() { ejDateOffset++; renderEjercicio(); };
  if (ejNew)  ejNew.onclick  = function() { openEjModal(null); };
  renderEjercicio();
});




// ============================================================
//  RELACIÓN CON DIOS
// ============================================================

var diosData = {};
// { 'YYYY-MM-DD': { ore: 0 (count), oracion: '', intencion: '' } }
var versiculos = [];
// [{ texto, referencia }]

function saveDios() {
  try { localStorage.setItem('dios_data',    JSON.stringify(diosData));    } catch(e){}
  try { localStorage.setItem('versiculos',   JSON.stringify(versiculos));  } catch(e){}
  if (window.cloudSave) {
    window.cloudSave('dios_data',  diosData);
    window.cloudSave('versiculos', versiculos);
  }
}

function loadDios() {
  diosData   = window._diosData   || JSON.parse(localStorage.getItem('dios_data')  || '{}');
  versiculos = window._versiculos || JSON.parse(localStorage.getItem('versiculos') || '[]');
}

function renderDios() {
  var card = document.getElementById('diosCard');
  if (!card) return;
  card.innerHTML = '';

  var tdk = dateKey(new Date());
  if (!diosData[tdk]) diosData[tdk] = { ore: 0, oracion: '', intencion: '' };
  var entry = diosData[tdk];

  // 1. Tracker de oración
  var oreCount = typeof entry.ore === 'number' ? entry.ore : 0;
  var oreRow = document.createElement('div');
  oreRow.className = 'dios-ore-tracker';

  var oreInfo = document.createElement('div');
  oreInfo.className = 'dios-ore-info';

  var oreLabel = document.createElement('span');
  oreLabel.className = 'dios-ore-label';
  oreLabel.textContent = '🙏 Oraciones de hoy';
  oreInfo.appendChild(oreLabel);

  // 3 dots indicator
  var oreDots = document.createElement('div');
  oreDots.className = 'dios-ore-dots';
  for (var di = 0; di < 3; di++) {
    var dot = document.createElement('div');
    dot.className = 'dios-ore-dot' + (di < oreCount ? ' filled' : '');
    oreDots.appendChild(dot);
  }
  oreInfo.appendChild(oreDots);

  var oreCounter = document.createElement('div');
  oreCounter.className = 'dios-ore-counter';

  var oreMinus = document.createElement('button');
  oreMinus.className = 'dios-ore-minus';
  oreMinus.textContent = '-';
  oreMinus.onclick = function() {
    if (diosData[tdk].ore > 0) { diosData[tdk].ore--; saveDios(); renderDios(); }
  };

  var oreNum = document.createElement('span');
  oreNum.className = 'dios-ore-num';
  oreNum.textContent = oreCount;

  var orePlus = document.createElement('button');
  orePlus.className = 'dios-ore-plus';
  orePlus.textContent = '+';
  orePlus.onclick = function() {
    diosData[tdk].ore = (diosData[tdk].ore || 0) + 1;
    saveDios(); renderDios();
  };

  oreCounter.appendChild(oreMinus);
  oreCounter.appendChild(oreNum);
  oreCounter.appendChild(orePlus);

  oreRow.appendChild(oreInfo);
  oreRow.appendChild(oreCounter);
  card.appendChild(oreRow);

  card.appendChild(document.createElement('hr')).className = 'dios-divider';

  // 2. Oración / reflexión del día
  var orLabel = document.createElement('span');
  orLabel.className = 'dios-field-label';
  orLabel.textContent = '✨ Oracion o reflexion del dia';
  card.appendChild(orLabel);

  var orInput = document.createElement('textarea');
  orInput.className = 'modal-input';
  orInput.rows = 3;
  orInput.placeholder = 'Escribe tu oracion, lo que sientes, lo que quieres decirle a Dios hoy...';
  orInput.value = entry.oracion || '';
  orInput.style.cssText = 'width:100%;resize:vertical;margin-bottom:.4rem';
  orInput.oninput = function() {
    diosData[tdk].oracion = orInput.value;
    saveDios();
  };
  card.appendChild(orInput);

  card.appendChild(document.createElement('hr')).className = 'dios-divider';

  // 3. Intención / petición del día
  var intLabel = document.createElement('span');
  intLabel.className = 'dios-field-label';
  intLabel.textContent = '🕊 Intencion o peticion de hoy';
  card.appendChild(intLabel);

  var intInput = document.createElement('textarea');
  intInput.className = 'modal-input';
  intInput.rows = 2;
  intInput.placeholder = 'Por quien o que quieres orar hoy...';
  intInput.value = entry.intencion || '';
  intInput.style.cssText = 'width:100%;resize:vertical;margin-bottom:.4rem';
  intInput.oninput = function() {
    diosData[tdk].intencion = intInput.value;
    saveDios();
  };
  card.appendChild(intInput);

  card.appendChild(document.createElement('hr')).className = 'dios-divider';

  // 4. Versículos favoritos
  var verLabel = document.createElement('span');
  verLabel.className = 'dios-field-label';
  verLabel.textContent = '📖 Versiculos favoritos';
  card.appendChild(verLabel);

  var verList = document.createElement('div');
  verList.className = 'dios-versiculos-list';

  if (versiculos.length === 0) {
    var empty = document.createElement('div');
    empty.style.cssText = 'font-size:.72rem;color:var(--muted2);font-weight:600;padding:.3rem 0';
    empty.textContent = 'Guarda aqui tus versiculos favoritos 🌟';
    verList.appendChild(empty);
  } else {
    versiculos.forEach(function(ver, vi) {
      var item = document.createElement('div');
      item.className = 'dios-versiculo-item';

      var textWrap = document.createElement('div');
      textWrap.style.flex = '1';

      var verText = document.createElement('div');
      verText.className = 'dios-versiculo-text';
      verText.textContent = '"' + ver.texto + '"';

      var verRef = document.createElement('div');
      verRef.className = 'dios-versiculo-ref';
      verRef.textContent = ver.referencia || '';

      textWrap.appendChild(verText);
      if (ver.referencia) textWrap.appendChild(verRef);

      item.appendChild(textWrap);
      verList.appendChild(item);
    });
  }

  card.appendChild(verList);

  var addVerBtn = document.createElement('button');
  addVerBtn.className = 'dios-add-btn';
  addVerBtn.textContent = '＋ Agregar versiculo';
  addVerBtn.onclick = function() { openVersiculoModal(); };
  card.appendChild(addVerBtn);
}

function openVersiculoModal() {
  var old = document.getElementById('versiculoModal');
  if (old) old.remove();

  var back = document.createElement('div');
  back.className = 'rutina-modal-backdrop';
  back.id = 'versiculoModal';
  back.onclick = function(e) { if (e.target === back) back.remove(); };

  var box = document.createElement('div');
  box.className = 'rutina-modal-box';
  box.innerHTML = '<div class="rutina-modal-title">📖 <em>Agregar versiculo</em></div>' +
    '<div class="modal-field">' +
      '<label class="modal-label">Texto del versiculo</label>' +
      '<textarea class="modal-input" id="verTexto" rows="3" placeholder="Escribe el versiculo..." style="width:100%;resize:vertical"></textarea>' +
    '</div>' +
    '<div class="modal-field" style="margin-top:.8rem">' +
      '<label class="modal-label">Referencia (opcional)</label>' +
      '<input class="modal-input" id="verRef" placeholder="ej: Juan 3:16, Salmos 23:1..." style="width:100%">' +
    '</div>' +
    '<div class="modal-btns" style="margin-top:1.2rem">' +
      '<button class="modal-btn-cancel" id="verCancelBtn">Cancelar</button>' +
      '<button class="modal-btn-save" id="verSaveBtn">Guardar 🌟</button>' +
    '</div>';

  back.appendChild(box);
  document.body.appendChild(back);

  document.getElementById('verCancelBtn').onclick = function() { back.remove(); };
  document.getElementById('verSaveBtn').onclick = function() {
    var texto = document.getElementById('verTexto').value.trim();
    var ref   = document.getElementById('verRef').value.trim();
    if (!texto) { document.getElementById('verTexto').focus(); return; }
    versiculos.push({ texto: texto, referencia: ref });
    saveDios(); renderDios();
    back.remove();
  };

  document.getElementById('verTexto').focus();
}

// Patch cloud sync
var _origSyncDios = window.syncFromCloud;
window.syncFromCloud = function() {
  if (window._diosData)   diosData   = window._diosData;
  if (window._versiculos) versiculos = window._versiculos;
  if (_origSyncDios) _origSyncDios();
  renderDios();
};

loadDios();
document.addEventListener('DOMContentLoaded', function() {
  renderDios();
});




window.calmaShowTab = function(idx) {
  for (var i=0; i<5; i++) {
    var btn = document.getElementById('calmaTab'+i);
    var el  = document.getElementById('calmaTabContent'+i);
    if (btn) btn.classList.toggle('active', i===idx);
    if (el)  el.style.display = (i===idx) ? '' : 'none';
  }
};
