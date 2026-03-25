// ════════════════════════════════════════════════════════════════
// Yuki 🌸 — selfcare.js
// ════════════════════════════════════════════════════════════════


(function(){
  var KEY = 'yuki_diario';
  var entries = [];
  var calYear, calMonth, selectedDate, editingId;

  function load() { try { entries = JSON.parse(localStorage.getItem(KEY)) || []; } catch(e){ entries=[]; } }
  function save() { localStorage.setItem(KEY, JSON.stringify(entries)); if(window.cloudSave) window.cloudSave(KEY, entries); }

  function dateKey(d) {
    return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');
  }
  function todayKey() { return dateKey(new Date()); }
  function fmtDate(dk) {
    var p = dk.split('-');
    var d = new Date(+p[0], +p[1]-1, +p[2]);
    return d.toLocaleDateString('es-MX', {weekday:'long', day:'numeric', month:'long', year:'numeric'});
  }

  // ── Calendario
  function renderCal() {
    var now = new Date();
    if (calYear === undefined) { calYear = now.getFullYear(); calMonth = now.getMonth(); }
    var monthName = new Date(calYear, calMonth, 1).toLocaleDateString('es-MX', {month:'long', year:'numeric'});
    document.getElementById('diarioCalMonth').textContent = monthName;

    var grid = document.getElementById('diarioCalGrid');
    grid.innerHTML = '';
    var days = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];
    days.forEach(function(d){
      var el = document.createElement('div');
      el.className = 'diario-cal-dayname';
      el.textContent = d;
      grid.appendChild(el);
    });

    var firstDay = new Date(calYear, calMonth, 1).getDay();
    var daysInMonth = new Date(calYear, calMonth+1, 0).getDate();
    var todayDk = todayKey();
    var entryKeys = new Set(entries.map(function(e){ return e.fecha; }));

    // Celdas vacías inicio
    for (var i = 0; i < firstDay; i++) {
      var el = document.createElement('div');
      el.className = 'diario-cal-cell empty';
      grid.appendChild(el);
    }

    for (var day = 1; day <= daysInMonth; day++) {
      var dk = calYear + '-' + String(calMonth+1).padStart(2,'0') + '-' + String(day).padStart(2,'0');
      var el = document.createElement('div');
      var cls = 'diario-cal-cell';
      if (dk === todayDk) cls += ' today';
      if (dk === selectedDate) cls += ' selected';
      if (entryKeys.has(dk)) cls += ' has-entry';
      el.className = cls;
      el.textContent = day;
      el.onclick = (function(d){ return function(){ diarioSelectDate(d); }; })(dk);
      grid.appendChild(el);
    }
  }

  window.diarioSelectDate = function diarioSelectDate(dk) {
    selectedDate = dk;
    renderCal();
    // Cambiar a pestaña de entradas
    if (window.diarioShowTab) window.diarioShowTab('entradas');
    var entry = entries.find(function(e){ return e.fecha === dk; });
    if (entry) {
      showEntryView(entry);
    } else {
      diarioCloseView();
      var d = new Date(dk.replace(/-/g,'/')); 
      var hoy = new Date(); hoy.setHours(0,0,0,0);
      if (d <= hoy) diarioOpenEntry(dk);
    }
  }

  function showEntryView(entry) {
    var view = document.getElementById('diarioEntryView');
    document.getElementById('diarioEntryViewDate').textContent = fmtDate(entry.fecha);
    document.getElementById('diarioEntryViewTitle').textContent = entry.titulo || '';
    document.getElementById('diarioEntryViewTitle').style.display = entry.titulo ? '' : 'none';

    // Tags + mood
    var tagsEl = document.getElementById('diarioEntryViewTags');
    tagsEl.innerHTML = '';
    if (entry.mood) {
      var m = document.createElement('span');
      m.className = 'diario-entry-view-mood';
      m.textContent = entry.mood;
      tagsEl.appendChild(m);
    }
    (entry.tags||[]).forEach(function(t){
      var chip = document.createElement('span');
      chip.className = 'diario-entry-view-tag';
      chip.textContent = t;
      tagsEl.appendChild(chip);
    });

    // Foto
    var photoEl = document.getElementById('diarioEntryViewPhoto');
    photoEl.innerHTML = entry.foto ? '<img src="'+entry.foto+'" alt="foto del día">' : '';

    // Texto
    document.getElementById('diarioEntryViewText').textContent = entry.texto || '';
    view.style.display = '';
    view.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  window.diarioCloseView = function() {
    document.getElementById('diarioEntryView').style.display = 'none';
  };

  window.diarioCalPrev = function() { calMonth--; if(calMonth<0){ calMonth=11; calYear--; } renderCal(); };
  window.diarioCalNext = function() { calMonth++; if(calMonth>11){ calMonth=0; calYear++; } renderCal(); };

  // ── Quick write flow
  var currentTags = [];

  window.diarioQuickTyping = function() {
    var txt = document.getElementById('diarioQuickTexto').value.trim();
    document.getElementById('diarioQuickActions').style.display = txt ? 'flex' : 'none';
  };

  window.diarioQuickContinue = function() {
    // Mostrar panel de opciones extra
    document.getElementById('diarioExtraPanel').style.display = '';
    document.getElementById('diarioQuickWrap').style.display = 'none';
    // Resetear campos extra
    document.getElementById('diarioTitulo').value = '';
    document.getElementById('diarioMood').value = '';
    document.querySelectorAll('.diario-mood-opt').forEach(function(o){ o.classList.remove('selected'); });
    currentTags = []; renderTagChips();
    document.getElementById('diarioPhotoData').value = '';
    document.getElementById('diarioPhotoImg').style.display='none';
    document.getElementById('diarioPhotoPlaceholder').style.display='';
    document.getElementById('diarioPhotoRemove').style.display='none';
    editingId = null;
    selectedDate = todayKey();
  };

  window.diarioQuickCancel = function() {
    document.getElementById('diarioExtraPanel').style.display = 'none';
    document.getElementById('diarioQuickWrap').style.display = '';
    document.getElementById('diarioQuickTexto').value = '';
    document.getElementById('diarioQuickActions').style.display = 'none';
    currentTags = [];
  };

  window.diarioOpenEntry = function(fecha) {
    load();
    var dk = fecha || todayKey();
    var existing = entries.find(function(e){ return e.fecha === dk; });
    editingId = existing ? existing.id : null;
    selectedDate = dk;

    // Populate quick textarea with existing text
    document.getElementById('diarioQuickTexto').value = existing ? (existing.texto||'') : '';
    document.getElementById('diarioQuickActions').style.display = existing ? 'flex' : 'none';

    // Populate extra fields
    document.getElementById('diarioTitulo').value = existing ? (existing.titulo||'') : '';
    document.getElementById('diarioMood').value = existing ? (existing.mood||'') : '';
    document.querySelectorAll('.diario-mood-opt').forEach(function(o){
      o.classList.toggle('selected', o.textContent === (existing ? existing.mood : ''));
    });
    currentTags = existing ? (existing.tags||[]).slice() : [];
    renderTagChips();
    var img = document.getElementById('diarioPhotoImg');
    var ph = document.getElementById('diarioPhotoPlaceholder');
    var rmv = document.getElementById('diarioPhotoRemove');
    if (existing && existing.foto) {
      img.src = existing.foto; img.style.display=''; ph.style.display='none'; rmv.style.display='';
      document.getElementById('diarioPhotoData').value = existing.foto;
    } else {
      img.style.display='none'; ph.style.display=''; rmv.style.display='none';
      document.getElementById('diarioPhotoData').value = '';
    }

    // Show extra panel directly when editing
    if (existing) {
      document.getElementById('diarioExtraPanel').style.display = '';
      document.getElementById('diarioQuickWrap').style.display = 'none';
    } else {
      document.getElementById('diarioExtraPanel').style.display = 'none';
      document.getElementById('diarioQuickWrap').style.display = '';
      setTimeout(function(){ document.getElementById('diarioQuickTexto').focus(); }, 100);
    }
  };

  window.diarioCloseModal = function() {
    // compatibility shim — reset to quick write
    window.diarioQuickCancel();
  };

  window.diarioEditEntry = function() {
    var entry = entries.find(function(e){ return e.fecha === selectedDate; });
    if (entry) diarioOpenEntry(entry.fecha);
  };

  window.diarioDeleteEntry = function() {
    if (!confirm('¿Eliminar esta entrada del diario?')) return;
    entries = entries.filter(function(e){ return e.fecha !== selectedDate; });
    save(); diarioCloseView(); renderCal(); renderList();
  };

  // Tags
  function renderTagChips() {
    var wrap = document.getElementById('diarioTagsChips');
    wrap.innerHTML = '';
    currentTags.forEach(function(t, i) {
      var chip = document.createElement('span');
      chip.className = 'diario-tags-chip';
      chip.innerHTML = t + '<button onclick="diarioRemoveTag('+i+')">✕</button>';
      wrap.appendChild(chip);
    });
  }
  window.diarioRemoveTag = function(i) { currentTags.splice(i,1); renderTagChips(); };
  window.diarioTagKeydown = function(e) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      var val = e.target.value.trim().replace(',','');
      if (val && !currentTags.includes(val)) { currentTags.push(val); renderTagChips(); }
      e.target.value = '';
    }
  };

  window.diarioPickMood = function(el, mood) {
    document.querySelectorAll('.diario-mood-opt').forEach(function(o){ o.classList.remove('selected'); });
    el.classList.add('selected');
    document.getElementById('diarioMood').value = mood;
  };

  window.diarioHandlePhoto = function(input) {
    var file = input.files && input.files[0];
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function(e) {
      document.getElementById('diarioPhotoData').value = e.target.result;
      var img = document.getElementById('diarioPhotoImg');
      img.src = e.target.result; img.style.display='';
      document.getElementById('diarioPhotoPlaceholder').style.display='none';
      document.getElementById('diarioPhotoRemove').style.display='';
    };
    reader.readAsDataURL(file);
  };

  window.diarioRemovePhoto = function() {
    document.getElementById('diarioPhotoData').value = '';
    document.getElementById('diarioPhotoImg').style.display='none';
    document.getElementById('diarioPhotoPlaceholder').style.display='';
    document.getElementById('diarioPhotoRemove').style.display='none';
  };

  window.diarioSave = function() {
    var texto = document.getElementById('diarioQuickTexto').value.trim();
    var titulo = document.getElementById('diarioTitulo').value.trim();
    if (!texto && !titulo) { alert('Escribe algo antes de guardar 🌸'); return; }

    // Flush tag input si quedó algo sin Enter
    var tagInp = document.getElementById('diarioTagInp').value.trim();
    if (tagInp && !currentTags.includes(tagInp)) currentTags.push(tagInp);
    document.getElementById('diarioTagInp').value = '';

    var entry = {
      id: editingId || ('diario_' + Date.now()),
      fecha: selectedDate || todayKey(),
      titulo: titulo,
      mood: document.getElementById('diarioMood').value,
      tags: currentTags.slice(),
      foto: document.getElementById('diarioPhotoData').value,
      texto: texto,
    };

    if (editingId) {
      var idx = entries.findIndex(function(e){ return e.id===editingId; });
      if (idx>=0) entries[idx] = entry; else entries.push(entry);
    } else {
      var existIdx = entries.findIndex(function(e){ return e.fecha===entry.fecha; });
      if (existIdx>=0) entries[existIdx] = entry; else entries.push(entry);
    }

    entries.sort(function(a,b){ return b.fecha.localeCompare(a.fecha); });
    save(); renderCal(); renderList();

    // Volver al estado inicial
    document.getElementById('diarioExtraPanel').style.display = 'none';
    document.getElementById('diarioQuickWrap').style.display = '';
    document.getElementById('diarioQuickTexto').value = '';
    document.getElementById('diarioQuickActions').style.display = 'none';
    currentTags = []; editingId = null;

    showEntryView(entry);
  };

  // ── Lista reciente
  function renderList() {
    load();
    var el = document.getElementById('diarioList');
    if (!el) return;
    if (entries.length === 0) { el.innerHTML = ''; return; }
    var recent = entries.slice(0, 10);
    var html = '<div class="diario-list-title">Entradas recientes</div>';
    recent.forEach(function(e) {
      var tagsHtml = (e.tags||[]).map(function(t){ return '<span class="diario-card-tag">'+t+'</span>'; }).join('');
      html +=
        '<div class="diario-card" onclick="diarioSelectDate(\''+e.fecha+'\')">' +
          '<div class="diario-card-top">' +
            (e.mood ? '<span class="diario-card-mood">'+e.mood+'</span>' : '') +
            '<span class="diario-card-date">'+fmtDate(e.fecha)+'</span>' +
          '</div>' +
          (e.titulo ? '<div class="diario-card-title">'+e.titulo+'</div>' : '') +
          (e.texto ? '<div class="diario-card-preview">'+e.texto+'</div>' : '') +
          (tagsHtml ? '<div class="diario-card-tags">'+tagsHtml+'</div>' : '') +
        '</div>';
    });
    el.innerHTML = html;
  }

  // Init
  load(); renderCal(); renderList();

  window.diarioShowTab = function(tab) {
    var tabEntradas = document.getElementById('diarioTabEntradas');
    var tabCal = document.getElementById('diarioTabCalendario');
    var btnEntradas = document.getElementById('tabEntradas');
    var btnCal = document.getElementById('tabCalendario');
    if (tab === 'entradas') {
      tabEntradas.style.display = '';
      tabCal.style.display = 'none';
      btnEntradas.classList.add('active');
      btnCal.classList.remove('active');
    } else {
      tabEntradas.style.display = 'none';
      tabCal.style.display = '';
      btnEntradas.classList.remove('active');
      btnCal.classList.add('active');
      renderCal();
    }
  };

  if (window._watchCloud) window._watchCloud(KEY, function(val){
    entries = val||[]; renderCal(); renderList();
  });
})();



(function(){
  var btips = [];
  var btipCatFilter = 'all';

  var BTIP_CATS = [
    { id:'receta', label:'🧴 Receta casera' },
    { id:'tip',    label:'✨ Tip de belleza' },
  ];

  function btipSave(){
    try{ localStorage.setItem('beauty_tips', JSON.stringify(btips)); }catch(e){}
    if(window.cloudSave) window.cloudSave('beauty_tips', btips);
  }
  function btipLoad(){
    if(window._beautyTips){ btips = window._beautyTips; return; }
    try{ btips = JSON.parse(localStorage.getItem('beauty_tips')||'[]'); }catch(e){ btips=[]; }
  }

  function renderBtipsFilter(){
    var row = document.getElementById('btipsFilterRow'); if(!row) return;
    row.innerHTML = '';
    var all = document.createElement('button');
    all.className = 'btips-filter-btn' + (btipCatFilter==='all'?' active':'');
    all.textContent = '✨ Todas';
    all.onclick = function(){ btipCatFilter='all'; renderBtipsFilter(); renderBtipsGrid(); };
    row.appendChild(all);
    BTIP_CATS.forEach(function(c){
      var btn = document.createElement('button');
      btn.className = 'btips-filter-btn' + (btipCatFilter===c.id?' active':'');
      btn.textContent = c.label;
      btn.onclick = function(){ btipCatFilter=c.id; renderBtipsFilter(); renderBtipsGrid(); };
      row.appendChild(btn);
    });
  }

  function renderBtipsGrid(){
    var grid = document.getElementById('btipsGrid'); if(!grid) return;
    grid.innerHTML = '';
    var filtered = btipCatFilter==='all' ? btips : btips.filter(function(t){ return t.cat===btipCatFilter; });
    if(filtered.length===0){
      var emp = document.createElement('div'); emp.className='btip-empty';
      emp.textContent = btipCatFilter==='all' ? 'Aún no hay nada guardado 🌸' : 'Sin resultados en esta categoría';
      grid.appendChild(emp); return;
    }
    filtered.slice().reverse().forEach(function(tip){
      var card = document.createElement('div'); card.className='btip-card';
      card.onclick = function(){ openBtipDetail(tip.id); };

      // Imagen o placeholder
      if(tip.img){
        var img = document.createElement('img'); img.className='btip-card-img'; img.src=tip.img; img.alt=tip.title;
        img.onerror=function(){ img.style.display='none'; var ph=document.createElement('div'); ph.className='btip-card-img-placeholder'; ph.textContent='🌿'; img.parentNode.insertBefore(ph,img); };
        card.appendChild(img);
      } else {
        var ph = document.createElement('div'); ph.className='btip-card-img-placeholder';
        ph.textContent = tip.cat==='receta'?'🧴':'✨'; card.appendChild(ph);
      }

      var body = document.createElement('div'); body.className='btip-card-body';
      var cat = document.createElement('span'); cat.className='btip-card-cat '+(tip.cat||'tip');
      cat.textContent = tip.cat==='receta'?'Receta':'Tip';
      var title = document.createElement('div'); title.className='btip-card-title'; title.textContent=tip.title;
      var desc = document.createElement('div'); desc.className='btip-card-desc'; desc.textContent=tip.desc||'';
      body.appendChild(cat); body.appendChild(title); if(tip.desc) body.appendChild(desc);
      card.appendChild(body);
      grid.appendChild(card);
    });
  }

  // ── Modal de detalle (solo lectura)
  window.openBtipDetail = function(id){
    var tip = btips.find(function(t){ return t.id===id; }); if(!tip) return;
    var old = document.getElementById('btipDetailModal'); if(old) old.remove();
    var backdrop = document.createElement('div'); backdrop.className='meta-modal-backdrop'; backdrop.id='btipDetailModal';
    backdrop.onclick = function(e){ if(e.target===backdrop) backdrop.remove(); };
    var box = document.createElement('div'); box.className='meta-modal-box'; box.style.maxWidth='420px';

    var html = '';
    if(tip.img) html += '<img class="btip-modal-img" src="'+tip.img+'" alt="'+tip.title+'" onerror="this.style.display=\'none\'">';
    html += '<span class="btip-modal-cat-badge '+(tip.cat||'tip')+'">'+(tip.cat==='receta'?'🧴 Receta casera':'✨ Tip de belleza')+'</span>';
    html += '<div class="btip-modal-title">'+escBtip(tip.title)+'</div>';
    if(tip.desc) html += '<div class="btip-modal-desc">'+escBtip(tip.desc)+'</div>';
    html += '<div class="modal-btns" style="margin-top:1rem">'
      +'<button class="modal-btn-cancel" onclick="document.getElementById(\'btipDetailModal\').remove()">Cerrar</button>'
      +'<button class="modal-btn-save" onclick="document.getElementById(\'btipDetailModal\').remove();openBtipModal(\''+id+'\')">✏️ Editar</button>'
      +'</div>';

    box.innerHTML = html;
    backdrop.appendChild(box); document.body.appendChild(backdrop);
  };

  function escBtip(s){ return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

  // ── Modal de crear/editar
  window.openBtipModal = function(id){
    var existing = id ? btips.find(function(t){ return t.id===id; }) : null;
    var old = document.getElementById('btipEditModal'); if(old) old.remove();
    var backdrop = document.createElement('div'); backdrop.className='meta-modal-backdrop'; backdrop.id='btipEditModal';
    backdrop.onclick = function(e){ if(e.target===backdrop) backdrop.remove(); };
    var box = document.createElement('div'); box.className='meta-modal-box'; box.style.maxWidth='420px';

    var catOpts = BTIP_CATS.map(function(c){
      return '<option value="'+c.id+'"'+(existing&&existing.cat===c.id?' selected':'')+'>'+c.label+'</option>';
    }).join('');

    var currentImg = existing ? (existing.img||'') : '';
    var imgMode = (currentImg && !currentImg.startsWith('data:')) ? 'url' : 'upload';

    box.innerHTML = '<div class="mood-modal-title">'+(existing?'Editar':'Nueva')+' receta / tip 💄</div>'
      +'<div class="modal-field"><label class="modal-label">Categoría</label>'
      +'<select class="modal-input" id="btipCatInput" style="cursor:pointer">'+catOpts+'</select></div>'
      +'<div class="modal-field"><label class="modal-label">Nombre</label>'
      +'<input class="modal-input" id="btipTitleInput" placeholder="Ej: Mascarilla de miel y avena…" value="'+(existing?existing.title.replace(/"/g,'&quot;'):'')+'" ></div>'
      +'<div class="modal-field"><label class="modal-label">Descripción / pasos</label>'
      +'<textarea class="modal-input" id="btipDescInput" rows="4" style="resize:vertical;min-height:80px" placeholder="Ingredientes, pasos, instrucciones…">'+(existing?existing.desc||'':'')+'</textarea></div>'
      +'<div class="modal-field"><label class="modal-label">Foto (opcional)</label>'
      +'<div class="btip-img-upload-row" id="btipImgTabs">'
      +'<button type="button" class="btip-img-tab'+(imgMode==='url'?' active':'')+'" id="btipTabUrl" onclick="btipSwitchImgTab(\'url\')">🔗 URL</button>'
      +'<button type="button" class="btip-img-tab'+(imgMode==='upload'?' active':'')+'" id="btipTabUpload" onclick="btipSwitchImgTab(\'upload\')">📁 Subir foto</button>'
      +'</div>'
      +'<div id="btipImgUrlWrap" style="margin-top:.4rem;'+(imgMode==='url'?'':'display:none')+'">'
      +'<input class="modal-input" id="btipImgUrlInput" placeholder="https://…" value="'+(currentImg&&!currentImg.startsWith('data:')?currentImg:'')+'" style="font-size:.75rem"></div>'
      +'<div id="btipImgUploadWrap" style="margin-top:.4rem;'+(imgMode==='upload'?'':'display:none')+'">'
      +'<input type="file" id="btipImgFileInput" accept="image/*" style="font-size:.75rem;width:100%"></div>'
      +'<div id="btipImgPreview" style="margin-top:.5rem">'+(currentImg?'<img src="'+currentImg+'" style="max-width:100%;max-height:160px;border-radius:10px;border:1.5px solid var(--border);" onerror="this.style.display=\'none\'">':'')+'</div>'
      +'</div>'
      +'<div class="modal-btns" style="margin-top:.8rem">'
      +(existing?'<button type="button" class="modal-btn-cancel" style="color:#e53935;border-color:#e53935" onclick="btipDelete(\''+id+'\')">🗑 Eliminar</button>':'')
      +'<button type="button" class="modal-btn-cancel" onclick="document.getElementById(\'btipEditModal\').remove()">'+(existing?'Cancelar':'Cancelar')+'</button>'
      +'<button type="button" class="modal-btn-save" id="btipSaveBtn">Guardar</button>'
      +'</div>';

    backdrop.appendChild(box); document.body.appendChild(backdrop);

    // Preview on URL input
    var urlInp = document.getElementById('btipImgUrlInput');
    if(urlInp) urlInp.oninput = function(){
      var prev = document.getElementById('btipImgPreview');
      if(urlInp.value.trim()) prev.innerHTML='<img src="'+urlInp.value.trim()+'" style="max-width:100%;max-height:160px;border-radius:10px;border:1.5px solid var(--border);" onerror="this.style.display=\'none\'">';
      else prev.innerHTML='';
    };

    // Preview on file upload
    var fileInp = document.getElementById('btipImgFileInput');
    if(fileInp) fileInp.onchange = function(){
      var file = fileInp.files[0]; if(!file) return;
      var reader = new FileReader();
      reader.onload = function(e){
        var prev = document.getElementById('btipImgPreview');
        prev.innerHTML='<img src="'+e.target.result+'" style="max-width:100%;max-height:160px;border-radius:10px;border:1.5px solid var(--border);">';
        prev.dataset.base64 = e.target.result;
      };
      reader.readAsDataURL(file);
    };

    document.getElementById('btipSaveBtn').onclick = function(){
      var title = document.getElementById('btipTitleInput').value.trim();
      if(!title){ document.getElementById('btipTitleInput').focus(); return; }
      var cat = document.getElementById('btipCatInput').value;
      var desc = document.getElementById('btipDescInput').value.trim();

      // Resolve image
      var imgVal = '';
      var urlWrap = document.getElementById('btipImgUrlWrap');
      var prev = document.getElementById('btipImgPreview');
      if(urlWrap && urlWrap.style.display!=='none'){
        imgVal = document.getElementById('btipImgUrlInput').value.trim();
      } else if(prev && prev.dataset.base64){
        imgVal = prev.dataset.base64;
      } else if(existing && existing.img){
        imgVal = existing.img; // keep existing if no new upload
      }

      if(existing){
        existing.title=title; existing.cat=cat; existing.desc=desc; existing.img=imgVal;
      } else {
        btips.push({ id:'btip_'+Date.now(), title:title, cat:cat, desc:desc, img:imgVal });
      }
      btipSave(); renderBtipsGrid(); backdrop.remove();
    };

    document.getElementById('btipTitleInput').focus();
  };

  window.btipSwitchImgTab = function(mode){
    document.getElementById('btipTabUrl').classList.toggle('active', mode==='url');
    document.getElementById('btipTabUpload').classList.toggle('active', mode==='upload');
    document.getElementById('btipImgUrlWrap').style.display = mode==='url'?'':'none';
    document.getElementById('btipImgUploadWrap').style.display = mode==='upload'?'':'none';
  };

  window.btipDelete = function(id){
    kittyConfirm('¿Eliminar esta receta/tip?', function(){
      btips = btips.filter(function(t){ return t.id!==id; });
      btipSave(); renderBtipsGrid();
      var m = document.getElementById('btipEditModal'); if(m) m.remove();
    });
  };

  // Cloud sync hook
  var _origSyncBtips = window.syncFromCloud;
  window.syncFromCloud = function(){
    if(window._beautyTips) btips = window._beautyTips;
    if(_origSyncBtips) _origSyncBtips();
    renderBtipsGrid();
  };

  // Init
  btipLoad();
  setTimeout(function(){ renderBtipsFilter(); renderBtipsGrid(); }, 200);

  window.loadBtips = btipLoad;
  window.renderBtips = function(){ renderBtipsFilter(); renderBtipsGrid(); };
})();



window.saludShowTab = function(tab) {
  ['registros','rutina','estadisticas'].forEach(function(t) {
    var el  = document.getElementById('saludTab' + t.charAt(0).toUpperCase() + t.slice(1) + '-content');
    var btn = document.getElementById('saludTab' + t.charAt(0).toUpperCase() + t.slice(1));
    if (el)  el.style.display = (t === tab) ? '' : 'none';
    if (btn) btn.classList.toggle('active', t === tab);
  });
  if (tab === 'estadisticas' && window.renderResumenSalud) window.renderResumenSalud();
};
