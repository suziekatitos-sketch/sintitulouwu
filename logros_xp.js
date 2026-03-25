// ════════════════════════════════════════════════════════════════
// Yuki 🌸 — logros_xp.js
// ════════════════════════════════════════════════════════════════


(function(){
  var vbItems = [];

  function vbSave(){ try{localStorage.setItem('vb_items',JSON.stringify(vbItems));}catch(e){} if(window.cloudSave) window.cloudSave('vb_items',vbItems); }
  function vbLoad(forceCloud){ if((forceCloud||true) && window._vbItems){vbItems=window._vbItems;return;} try{vbItems=JSON.parse(localStorage.getItem('vb_items')||'[]');}catch(e){vbItems=[];} }

  // posX/posY: '0% 0%' = arriba-izq, '50% 50%' = centro, '100% 100%' = abajo-der
  var POS_OPTS = [
    {label:'↖', x:'0%',   y:'0%',   name:'Arriba izq'},
    {label:'⬆', x:'50%',  y:'0%',   name:'Arriba centro'},
    {label:'↗', x:'100%', y:'0%',   name:'Arriba der'},
    {label:'⬅', x:'0%',   y:'50%',  name:'Centro izq'},
    {label:'⊙', x:'50%',  y:'50%',  name:'Centro'},
    {label:'➡', x:'100%', y:'50%',  name:'Centro der'},
    {label:'↙', x:'0%',   y:'100%', name:'Abajo izq'},
    {label:'⬇', x:'50%',  y:'100%', name:'Abajo centro'},
    {label:'↘', x:'100%', y:'100%', name:'Abajo der'},
  ];

  window.vbRender = function vbRender(){
    var grid = document.getElementById('vbGrid'); if(!grid) return;
    grid.innerHTML = '';
    if(vbItems.length===0){
      var emp = document.createElement('div');
      emp.className='vb-card vb-empty-card';
      emp.innerHTML='<span style="font-size:1.5rem">🌟</span>Agrega imágenes que te inspiren';
      grid.appendChild(emp);
      return;
    }
    vbItems.forEach(function(item, idx){
      var card = document.createElement('div'); card.className='vb-card';
      var img = document.createElement('img'); img.src=item.url; img.alt=item.label||'';
      var px = item.posX||'50%'; var py = item.posY||'50%';
      img.style.objectPosition = px+' '+py;
      img.onerror=function(){ card.style.background='var(--surface)'; img.style.display='none'; };
      card.appendChild(img);
      if(item.label){
        var lbl=document.createElement('div'); lbl.className='vb-card-label'; lbl.textContent=item.label;
        card.appendChild(lbl);
      }
      var del=document.createElement('button'); del.className='vb-card-del'; del.textContent='✕';
      del.onclick=(function(i){return function(e){e.stopPropagation();vbDelete(i);};})(idx);
      card.appendChild(del);
      card.onclick=(function(i){return function(e){ if(e.target===del) return; vbOpenEdit(i); };})(idx);
      grid.appendChild(card);
    });
  }

  window.vbOpenEdit = function(idx) {
    var old = document.getElementById('vbEditModal'); if(old) old.remove();
    var item = vbItems[idx];
    var selX = item.posX||'50%'; var selY = item.posY||'50%';

    var backdrop = document.createElement('div');
    backdrop.className='vb-modal-backdrop'; backdrop.id='vbEditModal';
    backdrop.onclick=function(e){if(e.target===backdrop)backdrop.remove();};

    var box = document.createElement('div'); box.className='vb-modal-box';

    // Título
    var title = document.createElement('div'); title.className='vb-modal-title';
    title.textContent='✨ Editar imagen';
    box.appendChild(title);

    // Preview
    var prevWrap = document.createElement('div'); prevWrap.className='vb-preview-wrap';
    var prevImg = document.createElement('img'); prevImg.className='vb-preview-img';
    prevImg.src=item.url; prevImg.style.objectPosition=selX+' '+selY;
    prevWrap.appendChild(prevImg); box.appendChild(prevWrap);

    // Hint
    var hint = document.createElement('div'); hint.className='vb-focus-hint';
    hint.textContent='Elige el área que quieres mostrar en la tarjeta 👇';
    box.appendChild(hint);

    // Grid de posiciones
    var posGrid = document.createElement('div'); posGrid.className='vb-pos-grid';
    POS_OPTS.forEach(function(opt){
      var btn = document.createElement('button'); btn.className='vb-pos-btn';
      if(opt.x===selX && opt.y===selY) btn.classList.add('selected');
      btn.textContent=opt.label; btn.title=opt.name;
      btn.onclick=function(){
        selX=opt.x; selY=opt.y;
        prevImg.style.objectPosition=selX+' '+selY;
        posGrid.querySelectorAll('.vb-pos-btn').forEach(function(b){b.classList.remove('selected');});
        btn.classList.add('selected');
      };
      posGrid.appendChild(btn);
    });
    box.appendChild(posGrid);

    // Campo etiqueta
    var lblField = document.createElement('div'); lblField.className='config-field';
    var lblLabel = document.createElement('label'); lblLabel.className='config-label'; lblLabel.textContent='Etiqueta';
    var lblInp = document.createElement('input'); lblInp.className='config-input';
    lblInp.value=item.label||''; lblInp.placeholder='Ej: mis metas, viajes, amor propio…';
    lblField.appendChild(lblLabel); lblField.appendChild(lblInp); box.appendChild(lblField);

    // Botones
    var btns = document.createElement('div'); btns.className='modal-btns'; btns.style.marginTop='.8rem';
    var cancelBtn = document.createElement('button'); cancelBtn.className='modal-btn-cancel';
    cancelBtn.textContent='Cancelar'; cancelBtn.onclick=function(){backdrop.remove();};
    var saveBtn = document.createElement('button'); saveBtn.className='modal-btn-save';
    saveBtn.textContent='Guardar 🌸';
    saveBtn.onclick=function(){
      vbItems[idx].posX=selX; vbItems[idx].posY=selY;
      vbItems[idx].label=lblInp.value.trim();
      vbSave(); vbRender(); backdrop.remove();
    };
    btns.appendChild(cancelBtn); btns.appendChild(saveBtn);
    box.appendChild(btns);

    backdrop.appendChild(box);
    document.body.appendChild(backdrop);
  };

  window.vbAdd = function(){
    var url=document.getElementById('vbUrlInput'); var lbl=document.getElementById('vbLabelInput');
    if(!url||!url.value.trim()) return;
    vbItems.push({url:url.value.trim(), label:lbl.value.trim(), posX:'50%', posY:'50%'});
    url.value=''; lbl.value='';
    vbSave(); vbRender();
  };
  window.vbDelete = function(idx){ vbItems.splice(idx,1); vbSave(); vbRender(); };

  document.addEventListener('DOMContentLoaded', function(){
    var inp=document.getElementById('vbUrlInput');
    if(inp) inp.addEventListener('keydown',function(e){if(e.key==='Enter') window.vbAdd();});
  });

  vbLoad();
  setTimeout(vbRender, 100);
})();

// ══ METAS ══
(function(){
  var metas = [];

  function metaSave() {
    try { localStorage.setItem('metas_data', JSON.stringify(metas)); } catch(e){}
    if (window.cloudSave) window.cloudSave('metas_data', metas);
  }
  function metaLoad(forceCloud) {
    if (forceCloud && window._metasData) { metas = window._metasData; return; }
    if (window._metasData) { metas = window._metasData; return; }
    try { metas = JSON.parse(localStorage.getItem('metas_data') || '[]'); } catch(e){ metas=[]; }
  }
  window.renderMetas = function(){ metaLoad(true); renderMetasInner(); };

  function metaProgress(meta) {
    if (!meta.pasos || meta.pasos.length === 0) return 0;
    var done = meta.pasos.filter(function(p){return p.done;}).length;
    return Math.round(done / meta.pasos.length * 100);
  }

  function renderMetasInner() {
    var list = document.getElementById('metasList');
    if (!list) return;
    list.innerHTML = '';
    if (metas.length === 0) {
      list.innerHTML = '<div style="color:var(--muted2);font-size:.8rem;font-weight:600;text-align:center;padding:1.5rem 0">Todavía no tienes metas 🌱 ¡Agrega tu primera!</div>';
      return;
    }
    metas.forEach(function(meta, mIdx) {
      var pct = metaProgress(meta);
      var card = document.createElement('div'); card.className='meta-card';

      var hdrEl = document.createElement('div'); hdrEl.className='meta-card-header';
      hdrEl.innerHTML = '<span class="meta-card-emoji">'+meta.emoji+'</span>'
        + '<span class="meta-card-name">'+meta.name+'</span>'
        + '<span class="meta-card-prog">'+pct+'%</span>';
      card.appendChild(hdrEl);

      var barEl = document.createElement('div'); barEl.className='meta-progress-bar';
      var fillEl = document.createElement('div'); fillEl.className='meta-progress-fill';
      fillEl.style.width = pct+'%'; barEl.appendChild(fillEl); card.appendChild(barEl);

      var pasosEl = document.createElement('div'); pasosEl.className='meta-pasos-list';
      (meta.pasos||[]).forEach(function(p, pIdx) {
        var row = document.createElement('div');
        row.className = 'meta-paso-row' + (p.done ? ' done' : '');
        var chk = document.createElement('div'); chk.className='meta-paso-check'; chk.textContent = p.done ? '✓' : '';
        var txt = document.createElement('span'); txt.className='meta-paso-text'; txt.textContent = p.text;
        row.appendChild(chk); row.appendChild(txt);
        row.onclick = (function(m,p){return function(){metaTogglePaso(m,p);};})(mIdx,pIdx);
        pasosEl.appendChild(row);
      });
      card.appendChild(pasosEl);

      var actEl = document.createElement('div'); actEl.className='meta-card-actions';
      var editBtn = document.createElement('button'); editBtn.className='meta-action-btn'; editBtn.textContent='✏️ Editar';
      editBtn.onclick = (function(m){return function(){openMetaModal(m);};})(mIdx);
      actEl.appendChild(editBtn); card.appendChild(actEl);
      list.appendChild(card);
    });
  };

  window.metaTogglePaso = function(mIdx, pIdx) {
    metas[mIdx].pasos[pIdx].done = !metas[mIdx].pasos[pIdx].done;
    metaSave(); renderMetas();
  };

  window.metaDelete = function(mIdx) {
    kittyConfirm('¿Eliminar la meta "' + metas[mIdx].name + '"?', function(){ metas.splice(mIdx,1); metaSave(); renderMetas(); });
  };

  var META_EMOJIS = ['🎯','🌟','💪','📚','✨','🚀','🌸','💡','🏆','❤️','🎨','🌱'];

  window.openMetaModal = function(mIdx) {
    var old = document.getElementById('metaModal'); if(old) old.remove();
    var existing = mIdx !== null ? metas[mIdx] : null;
    var emoji = existing ? existing.emoji : '🎯';
    var name = existing ? existing.name : '';
    var pasos = existing ? JSON.parse(JSON.stringify(existing.pasos||[])) : [];

    var backdrop = document.createElement('div');
    backdrop.className='meta-modal-backdrop'; backdrop.id='metaModal';
    backdrop.onclick=function(e){if(e.target===backdrop)backdrop.remove();};

    var box = document.createElement('div'); box.className='meta-modal-box';
    var emojiOpts = META_EMOJIS.map(function(e){ return '<span class="mood-emoji-opt'+(e===emoji?' selected':'')+'" data-e="'+e+'" style="font-size:1.3rem">'+e+'</span>'; }).join('');

    box.innerHTML = '<div class="mood-modal-title">'+(existing?'Editar':'Nueva')+' meta 🎯</div>'
      + '<div class="mood-emoji-picker" id="metaEmojiPicker">'+emojiOpts+'</div>'
      + '<div class="modal-field"><label class="modal-label">Nombre de la meta</label>'
      + '<input class="modal-input" id="metaNameInput" placeholder="Ej: Terminar mi portafolio…" value="'+name.replace(/"/g,'&quot;')+'"></div>'
      + '<div class="modal-field"><label class="modal-label">Pasos</label><div id="metaPasosList"></div>'
      + '<button class="rutina-add-paso-btn" onclick="metaAddPasoRow()" style="margin-top:.3rem">＋ Agregar paso</button></div>'
      + '<div class="modal-btns" style="margin-top:.8rem">'
      + '<button class="modal-btn-cancel" onclick="document.getElementById(&quot;metaModal&quot;).remove()">Cancelar</button>'
      + '<button class="modal-btn-save" id="metaSaveBtn">Guardar 🌟</button></div>';

    backdrop.appendChild(box);
    document.body.appendChild(backdrop);

    var selEmoji = emoji;
    backdrop.querySelectorAll('.mood-emoji-opt').forEach(function(opt){
      opt.onclick=function(){
        backdrop.querySelectorAll('.mood-emoji-opt').forEach(function(o){o.classList.remove('selected');});
        opt.classList.add('selected'); selEmoji=opt.dataset.e;
      };
    });

    function renderPasos() {
      var list = document.getElementById('metaPasosList'); list.innerHTML='';
      pasos.forEach(function(p,i){
        var row=document.createElement('div'); row.className='meta-paso-edit-row';
        var inp=document.createElement('input'); inp.className='meta-paso-edit-input';
        inp.type='text'; inp.value=p.text; inp.placeholder='Paso '+(i+1)+'…';
        inp.oninput=function(){pasos[i].text=inp.value;};
        var del=document.createElement('button'); del.className='meta-paso-edit-del'; del.textContent='✕';
        del.onclick=function(){pasos.splice(i,1);renderPasos();};
        row.appendChild(inp); row.appendChild(del); list.appendChild(row);
      });
    }
    renderPasos();

    window.metaAddPasoRow = function() {
      pasos.push({text:'',done:false}); renderPasos();
      var inputs=document.querySelectorAll('.meta-paso-edit-input');
      if(inputs.length) inputs[inputs.length-1].focus();
    };

    document.getElementById('metaSaveBtn').onclick = function() {
      var nameVal = document.getElementById('metaNameInput').value.trim();
      if (!nameVal) { document.getElementById('metaNameInput').focus(); return; }
      var cleanPasos = pasos.filter(function(p){return p.text.trim();}).map(function(p){return{text:p.text.trim(),done:p.done||false};});
      if (existing) {
        metas[mIdx].emoji=selEmoji; metas[mIdx].name=nameVal; metas[mIdx].pasos=cleanPasos;
      } else {
        metas.push({id:'meta_'+Date.now(),emoji:selEmoji,name:nameVal,pasos:cleanPasos});
      }
      metaSave(); renderMetas(); backdrop.remove();
    };

    // Botón eliminar solo al editar, discreto al fondo con doble confirmación
    if (existing) {
      var delZone = document.createElement('div');
      delZone.style.cssText = 'margin-top:1rem;padding-top:.8rem;border-top:1px solid var(--border);text-align:center';
      var delBtn = document.createElement('button');
      delBtn.style.cssText = "background:none;border:none;font-family:var(--font-body);font-size:.7rem;font-weight:700;color:var(--muted2);cursor:pointer;padding:.3rem .6rem;border-radius:8px";
      delBtn.textContent = '🗑️ Eliminar meta';
      delBtn.onmouseover = function(){ this.style.color='#c0392b'; };
      delBtn.onmouseout  = function(){ this.style.color='var(--muted2)'; };
      delBtn.onclick = function() {
        kittyConfirm('¿Segura? Esta acción no se puede deshacer 💔', function(){
            metas.splice(mIdx,1); metaSave(); renderMetas(); backdrop.remove();
          });
      };
      delZone.appendChild(delBtn);
      box.appendChild(delZone);
    }

    document.getElementById('metaNameInput').focus();
  };

  metaLoad();
  setTimeout(renderMetas, 150);
})();



(function(){
  var XP_KEY     = 'yuki_xp';
  var STREAK_KEY = 'yuki_xp_streak';
  var LAST_KEY   = 'yuki_xp_last_date';

  var RANKS = [
    { icon:'🌑', label:'Polvo Cósmico',        min:0 },
    { icon:'⭐', label:'Estrella Naciente',     min:500 },
    { icon:'🌟', label:'Enana Amarilla',        min:2000 },
    { icon:'💫', label:'Gigante Brillante',     min:6000 },
    { icon:'🌠', label:'Supernova',             min:15000 },
    { icon:'🪐', label:'Nebulosa',              min:35000 },
    { icon:'🌌', label:'Galaxia',               min:80000 },
    { icon:'🚀', label:'Viajera Interestelar',  min:200000 },
  ];
  window.YUKI_RANKS = RANKS;

  function getXP()     { return parseInt(localStorage.getItem(XP_KEY) || '0'); }
  function getStreak() { return parseInt(localStorage.getItem(STREAK_KEY) || '0'); }
  function saveXP(v)   { localStorage.setItem(XP_KEY, v); if(window.cloudSave) window.cloudSave(XP_KEY, v); }
  function saveStreak(v){ localStorage.setItem(STREAK_KEY, v); if(window.cloudSave) window.cloudSave(STREAK_KEY, v); }

  function todayStr() {
    var d = new Date();
    return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
  }

  function getCurrentRank(xp) {
    var rank = RANKS[0];
    for (var i = RANKS.length-1; i >= 0; i--) { if (xp >= RANKS[i].min) { rank = RANKS[i]; break; } }
    return rank;
  }

  // ── Ganar EXP
  window.yukiAddXP = function(amount, reason) {
    var xp = getXP() + amount;
    saveXP(xp);
    if (window.renderWidgets) window.renderWidgets();
    renderLogrosPage();
  };

  // ── Racha diaria: llamar una vez al día cuando se completa algo
  window.yukiCheckStreak = function() {
    var today = todayStr();
    var last  = localStorage.getItem(LAST_KEY) || '';
    if (last === today) return; // ya se contó hoy
    var streak = getStreak();
    // ¿Fue ayer?
    var yesterday = new Date(); yesterday.setDate(yesterday.getDate()-1);
    var yStr = yesterday.getFullYear()+'-'+String(yesterday.getMonth()+1).padStart(2,'0')+'-'+String(yesterday.getDate()).padStart(2,'0');
    if (last === yStr) {
      streak++;
    } else if (last !== today) {
      streak = 1; // racha rota
    }
    saveStreak(streak);
    localStorage.setItem(LAST_KEY, today);
    if(window.cloudSave) window.cloudSave(LAST_KEY, today);
    if(window.cloudSave) window.cloudSave(STREAK_KEY, streak);
    // EXP por racha
    window.yukiAddXP(15 * streak, 'Racha día '+streak);
  };

  function renderLogrosPage() {
    // Siempre leer fresco del localStorage por si cambió desde otra sección
    var xp     = parseInt(localStorage.getItem(XP_KEY) || '0');
    var streak = getStreak();
    var rank   = getCurrentRank(xp);
    var rankIdx = RANKS.indexOf(rank);
    var nextRank = RANKS[rankIdx+1] || null;
    var pct = nextRank ? Math.min(100, Math.round((xp-rank.min)/(nextRank.min-rank.min)*100)) : 100;

    // Tarjeta de rango
    var rankCard = document.getElementById('xpRankCard');
    if (rankCard) {
      var stars = '';
      for (var i=0;i<12;i++) {
        var top=Math.random()*100, left=Math.random()*100, delay=Math.random()*3;
        stars += '<div class="xp-star" style="top:'+top+'%;left:'+left+'%;animation-delay:'+delay+'s">✦</div>';
      }
      rankCard.innerHTML =
        '<div class="xp-rank-card">' +
          '<div class="xp-stars">'+stars+'</div>' +
          '<div class="xp-rank-icon">'+rank.icon+'</div>' +
          '<div class="xp-rank-name">'+rank.label+'</div>' +
          '<div class="xp-rank-xp">'+xp.toLocaleString('es-MX')+' EXP totales</div>' +
          '<div class="xp-bar-wrap"><div class="xp-bar-fill" style="width:'+pct+'%"></div></div>' +
          '<div class="xp-bar-labels"><span>'+(rank.min).toLocaleString('es-MX')+'</span><span>'+(nextRank?nextRank.min.toLocaleString('es-MX'):'∞')+'</span></div>' +
          (nextRank ? '<div class="xp-next-rank">Faltan '+(nextRank.min-xp).toLocaleString('es-MX')+' EXP para '+nextRank.icon+' '+nextRank.label+'</div>' : '<div class="xp-next-rank">🌌 ¡Rango máximo alcanzado!</div>') +
        '</div>';
    }

    // Racha
    var streakCard = document.getElementById('xpStreakCard');
    if (streakCard) {
      streakCard.innerHTML =
        '<div class="xp-streak-card">' +
          '<div class="xp-streak-fire">🔥</div>' +
          '<div>' +
            '<div class="xp-streak-num">'+streak+'</div>' +
            '<div class="xp-streak-label">días de racha consecutiva</div>' +
          '</div>' +
          '<div style="margin-left:auto;font-size:.75rem;color:var(--muted);font-weight:700;text-align:right">+'+( 15*streak).toLocaleString('es-MX')+'<br>EXP/día</div>' +
        '</div>';
    }

    // Lista de rangos
    var ranksList = document.getElementById('xpRanksList');
    if (ranksList) {
      ranksList.innerHTML = '';
      RANKS.forEach(function(r, i) {
        var row = document.createElement('div');
        var achieved = xp >= r.min;
        var isCurrent = rank === r;
        row.className = 'xp-rank-row' + (isCurrent?' current':achieved?' achieved':'');
        row.innerHTML =
          '<div class="xp-rank-row-icon">'+r.icon+'</div>' +
          '<div class="xp-rank-row-info">' +
            '<div class="xp-rank-row-name">'+r.label+'</div>' +
            '<div class="xp-rank-row-req">'+r.min.toLocaleString('es-MX')+' EXP</div>' +
          '</div>' +
          (isCurrent ? '<div class="xp-rank-row-badge">✦ Actual</div>' : achieved ? '<div class="xp-rank-row-badge" style="color:var(--verde)">✓</div>' : '');
        ranksList.appendChild(row);
      });
    }
  }

  // ── Hook: completar tarea → +5 EXP
  var _origComplete = window.toggleComplete;
  window.toggleComplete = function(taskId, date) {
    if (_origComplete) _origComplete(taskId, date);
    try {
      var completions = JSON.parse(localStorage.getItem('completions')||'{}');
      var key = taskId + '|' + date;
      // Solo sumar si se acaba de marcar (no desmarcar)
      if (completions[key]) {
        window.yukiAddXP(5, 'Tarea');
        window.yukiCheckStreak();
      }
    } catch(e){}
  };

  // ── Hook: completar hábito → +8 EXP
  var _origHabitoLog = window.habitoToggleLog;
  window.habitoToggleLog = function(id, dk) {
    if (_origHabitoLog) _origHabitoLog(id, dk);
    try {
      var habitos = JSON.parse(localStorage.getItem('habitos_data')||'[]');
      var h = habitos.find(function(x){ return x.id===id; });
      if (h && h.log && h.log.indexOf(dk) > -1) {
        window.yukiAddXP(8, 'Hábito');
        window.yukiCheckStreak();
      }
    } catch(e){}
  };

  // Render al cargar
  renderLogrosPage();
  if (window.cloudSave) {
    // También agregar a mirrorKeys dinámicamente si no está
  }

  // Re-render al entrar a la página
  var _origShowXP = window.showPage;
  window.showPage = function(pageId) {
    if (_origShowXP) _origShowXP(pageId);
    if (pageId === 'page-logros') {
      setTimeout(renderLogrosPage, 100);
      setTimeout(renderLogrosPage, 800); // por si Firebase carga tarde
    }
  };
})();



// ── FLORES DE SAKURA 🌸 + TIENDA
(function(){
  var SAKURA_KEY   = 'yuki_sakura';
  var TIENDA_KEY   = 'yuki_tienda_recompensas';
  var COMPRAS_KEY  = 'yuki_compras_historial';
  var STUDY_KEY    = 'yuki_study_minutes'; // minutos acumulados de estudio

  function getSakura()  { return parseInt(localStorage.getItem(SAKURA_KEY)  || '0'); }
  function getTienda()  { try { return JSON.parse(localStorage.getItem(TIENDA_KEY)  || '[]'); } catch(e){ return []; } }
  function getCompras() { try { return JSON.parse(localStorage.getItem(COMPRAS_KEY) || '[]'); } catch(e){ return []; } }
  function getStudyMin(){ return parseInt(localStorage.getItem(STUDY_KEY) || '0'); }

  function saveSakura(v)  { localStorage.setItem(SAKURA_KEY, v);  if(window.cloudSave) window.cloudSave(SAKURA_KEY, v); }
  function saveTienda(v)  { localStorage.setItem(TIENDA_KEY, JSON.stringify(v));  if(window.cloudSave) window.cloudSave(TIENDA_KEY, v); }
  function saveCompras(v) { localStorage.setItem(COMPRAS_KEY, JSON.stringify(v)); if(window.cloudSave) window.cloudSave(COMPRAS_KEY, v); }
  function saveStudyMin(v){ localStorage.setItem(STUDY_KEY, v); if(window.cloudSave) window.cloudSave(STUDY_KEY, v); }

  // ── Ganar flores
  window.yukiAddSakura = function(amount) {
    var s = getSakura() + amount;
    saveSakura(s);
    renderTiendaPage();
    if (window.renderWidgets) window.renderWidgets();
  };

  // ── Horas de estudio → cada 3h acumuladas = +10 🌸
  window.yukiAddStudyMinutes = function(mins) {
    var prev = getStudyMin();
    var next = prev + mins;
    var prevBlocks = Math.floor(prev / 180);
    var nextBlocks = Math.floor(next / 180);
    if (nextBlocks > prevBlocks) {
      var earned = (nextBlocks - prevBlocks) * 10;
      window.yukiAddSakura(earned);
    }
    saveStudyMin(next);
  };

  // Enganchar también flores a tareas/hábitos/racha
  var _origAddXP = window.yukiAddXP;
  window.yukiAddXP = function(amount, reason) {
    if (_origAddXP) _origAddXP(amount, reason);
    if (reason === 'Tarea')   window.yukiAddSakura(1);
    if (reason === 'Hábito')  window.yukiAddSakura(2);
    if (reason && reason.indexOf('Racha') === 0) window.yukiAddSakura(3);
  };

  // ── Tienda
  window.tiendaOpenAdd = function() {
    document.getElementById('tiendaNombre').value = '';
    document.getElementById('tiendaPrecio').value = '';
    var bd = document.getElementById('tiendaModalBackdrop');
    bd.style.display = 'flex';
  };
  window.tiendaCloseAdd = function() {
    document.getElementById('tiendaModalBackdrop').style.display = 'none';
  };
  window.tiendaConfirmarAdd = function() {
    var nombre = document.getElementById('tiendaNombre').value.trim();
    var precio = parseInt(document.getElementById('tiendaPrecio').value);
    if (!nombre) { alert('Ponle un nombre a la recompensa 🌸'); return; }
    if (!precio || precio < 1) { alert('El precio debe ser al menos 1 🌸'); return; }
    if (!confirm('¿Confirmas agregar "'+nombre+'" por '+precio+' 🌸?\n\nRecuerda: no podrás editarla ni eliminarla después.')) return;
    var tienda = getTienda();
    tienda.push({ id:'tr_'+Date.now(), nombre:nombre, precio:precio });
    saveTienda(tienda);
    tiendaCloseAdd();
    renderTiendaPage();
  };

  window.tiendaComprar = function(id) {
    var tienda  = getTienda();
    var item    = tienda.find(function(x){ return x.id===id; });
    if (!item) return;
    var sakura  = getSakura();
    if (sakura < item.precio) { alert('No tienes suficientes flores 🌸\nNecesitas '+item.precio+' y tienes '+sakura); return; }
    if (!confirm('¿Canjear "'+item.nombre+'" por '+item.precio+' 🌸?')) return;
    saveSakura(sakura - item.precio);
    var compras = getCompras();
    compras.unshift({ nombre:item.nombre, precio:item.precio, fecha: new Date().toLocaleDateString('es-MX') });
    saveCompras(compras);
    renderTiendaPage();
    if (window.renderWidgets) window.renderWidgets();
    alert('¡Disfrutalo mucho! 🌸✨\n"'+item.nombre+'" es tuyo.');
  };

  function renderTiendaPage() {
    var sakura  = getSakura();
    var tienda  = getTienda();
    var compras = getCompras();

    // Balance sakura
    var balCard = document.getElementById('sakuraBalanceCard');
    if (balCard) {
      balCard.innerHTML =
        '<div class="sakura-balance-card">' +
          '<div class="sakura-balance-icon">🌸</div>' +
          '<div>' +
            '<div class="sakura-balance-num">'+sakura.toLocaleString('es-MX')+'</div>' +
            '<div class="sakura-balance-label">Flores de Sakura disponibles</div>' +
            '<div class="sakura-earn-info">Ganas flores completando tareas, hábitos y rachas 🌸</div>' +
          '</div>' +
        '</div>';
    }

    // Tienda grid
    var grid = document.getElementById('tiendaGrid');
    if (grid) {
      grid.innerHTML = '';
      if (tienda.length === 0) {
        grid.innerHTML = '<div class="tienda-empty">Aún no tienes recompensas. ¡Agrega las cosas que te gustan! 🌸</div>';
      } else {
        tienda.forEach(function(item) {
          var canBuy = sakura >= item.precio;
          var card = document.createElement('div');
          card.className = 'tienda-card';
          card.innerHTML =
            '<div class="tienda-card-info">' +
              '<div class="tienda-card-nombre">'+item.nombre+'</div>' +
              '<div class="tienda-card-precio">'+item.precio+' 🌸</div>' +
            '</div>' +
            '<button class="tienda-card-comprar" '+(canBuy?'':'disabled')+' onclick="tiendaComprar(\''+item.id+'\')">'+
              (canBuy ? 'Canjear' : 'Faltan '+(item.precio-sakura)+'🌸') +
            '</button>';
          grid.appendChild(card);
        });
      }
    }

    // Historial
    var hist = document.getElementById('comprasHistorial');
    var title = document.getElementById('comprasTitle');
    if (hist) {
      hist.innerHTML = '';
      if (compras.length > 0) {
        if (title) title.style.display = '';
        compras.slice(0,10).forEach(function(c) {
          var item = document.createElement('div');
          item.className = 'compra-item';
          item.innerHTML =
            '<span class="compra-item-nombre">🌸 '+c.nombre+'</span>' +
            '<span class="compra-item-fecha">'+c.fecha+'</span>' +
            '<span class="compra-item-precio">-'+c.precio+' 🌸</span>';
          hist.appendChild(item);
        });
      } else {
        if (title) title.style.display = 'none';
      }
    }
  }

  // Widget de flores en inicio
  var _origRW = window.renderWidgets;
  window.renderWidgets = function() {
    if (_origRW) _origRW();
    var row = document.getElementById('widgetsRow');
    if (!row) return;
    var sakura = getSakura();
    var card = document.createElement('div');
    card.className = 'widget-card';
    card.onclick = function(){ if(window.showPage) window.showPage('page-logros'); };
    card.innerHTML =
      '<div class="widget-icon">🌸</div>' +
      '<div>' +
        '<div class="widget-value" style="color:var(--rosa)">'+sakura.toLocaleString('es-MX')+'</div>' +
        '<div class="widget-sub">flores de Sakura</div>' +
      '</div>' +
      '<div class="widget-label">Tienda de recompensas</div>';
    row.appendChild(card);
  };

  renderTiendaPage();
})();
