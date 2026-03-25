// ════════════════════════════════════════════════════════════════
// Yuki 🌸 — modules_21_25.js
// ════════════════════════════════════════════════════════════════


(function(){
  var DEC_KEY = 'yuki_decisions';
  var decisions = [];
  var editingDecId = null;

  var IMPORTANCIA_LABELS = { trivial:'🤏 Trivial', worthwhile:'👍 Vale la pena', weighty:'⚖️ Importante', lifechanging:'🌟 Cambia mi vida' };
  var INDECISION_LABELS  = { wishy:'🌊 Muy indecisa', neutral:'😐 Neutral', partisan:'🤔 Casi decidida', mindmadeup:'✅ Ya sé qué quiero' };

  function load() { try { decisions = JSON.parse(localStorage.getItem(DEC_KEY)) || []; } catch(e){ decisions=[]; } }
  function save() {
    localStorage.setItem(DEC_KEY, JSON.stringify(decisions));
    if (window.cloudSave) window.cloudSave(DEC_KEY, decisions);
    if (window.cloudSave) window.cloudSave(DEC_KEY, decisions);
  }

  // ── Chips toggle
  function initChips(containerId, hidden) {
    document.querySelectorAll('#' + containerId + ' .dec-chip').forEach(function(btn) {
      btn.onclick = function() {
        document.querySelectorAll('#' + containerId + ' .dec-chip').forEach(function(b){ b.classList.remove('active'); });
        btn.classList.add('active');
      };
    });
  }
  function getChipVal(containerId) {
    var active = document.querySelector('#' + containerId + ' .dec-chip.active');
    return active ? active.dataset.val : '';
  }
  function setChipVal(containerId, val) {
    document.querySelectorAll('#' + containerId + ' .dec-chip').forEach(function(b){
      b.classList.toggle('active', b.dataset.val === val);
    });
  }

  // ── Pros/Cons
  window.decAddPro = function(val) {
    var row = document.createElement('div'); row.className = 'dec-proscons-item';
    row.innerHTML = '<span class="dec-sign pro">+</span><input placeholder="Un pro…" value="'+(val||'')+'"><button onclick="this.parentElement.remove()">✕</button>';
    document.getElementById('decProsList').appendChild(row);
  };
  window.decAddCon = function(val) {
    var row = document.createElement('div'); row.className = 'dec-proscons-item';
    row.innerHTML = '<span class="dec-sign con">−</span><input placeholder="Un contra…" value="'+(val||'')+'"><button onclick="this.parentElement.remove()">✕</button>';
    document.getElementById('decConsList').appendChild(row);
  };

  // ── Steps
  window.decAddStep = function(val) {
    var row = document.createElement('div'); row.className = 'dec-step-row';
    row.innerHTML = '<input placeholder="Paso a seguir…" value="'+(val||'')+'"><button onclick="this.parentElement.remove()">✕</button>';
    document.getElementById('decStepsList').appendChild(row);
  };

  function clearForm() {
    document.getElementById('decDilema').value = '';
    document.getElementById('decFecha').value = new Date().toISOString().slice(0,10);
    document.getElementById('decDeadline').value = '';
    document.getElementById('decMejor').value = '';
    document.getElementById('decPeor').value = '';
    document.getElementById('decGut').value = '';
    document.getElementById('decConcIntuitiva').value = '';
    document.getElementById('decConcRacional').value = '';
    document.getElementById('decJesus').value = '';
    document.getElementById('decBiblia').value = '';
    document.getElementById('decDecision').value = '';
    document.getElementById('decPipedream').checked = false;
    document.getElementById('decApocalypse').checked = false;
    document.getElementById('decForToday').checked = false;
    document.getElementById('decProsList').innerHTML = '';
    document.getElementById('decConsList').innerHTML = '';
    document.getElementById('decStepsList').innerHTML = '';
    setChipVal('decImportancia', '');
    setChipVal('decIndecision', '');
    // Start with 3 empty pros/cons
    decAddPro(); decAddPro(); decAddPro();
    decAddCon(); decAddCon(); decAddCon();
    decAddStep();
  }

  document.getElementById('decisionNewBtn').onclick = function() {
    editingDecId = null;
    clearForm();
    document.getElementById('decisionForm').style.display = '';
    document.getElementById('decisionForm').scrollIntoView({ behavior:'smooth', block:'start' });
    setTimeout(function(){ document.getElementById('decDilema').focus(); }, 200);
  };

  window.decCancelForm = function() {
    document.getElementById('decisionForm').style.display = 'none';
    editingDecId = null;
  };

  window.decSave = function() {
    var dilema = document.getElementById('decDilema').value.trim();
    if (!dilema) { alert('Describe el dilema primero 💭'); return; }

    var pros = Array.from(document.querySelectorAll('#decProsList input')).map(function(i){ return i.value.trim(); }).filter(Boolean);
    var cons = Array.from(document.querySelectorAll('#decConsList input')).map(function(i){ return i.value.trim(); }).filter(Boolean);
    var steps = Array.from(document.querySelectorAll('#decStepsList input')).map(function(i){ return i.value.trim(); }).filter(Boolean);

    var dec = {
      id: editingDecId || ('dec_' + Date.now()),
      fecha: document.getElementById('decFecha').value,
      deadline: document.getElementById('decDeadline').value,
      dilema: dilema,
      importancia: getChipVal('decImportancia'),
      indecision: getChipVal('decIndecision'),
      mejor: document.getElementById('decMejor').value.trim(),
      pipedream: document.getElementById('decPipedream').checked,
      peor: document.getElementById('decPeor').value.trim(),
      apocalypse: document.getElementById('decApocalypse').checked,
      gut: document.getElementById('decGut').value.trim(),
      pros: pros,
      cons: cons,
      concIntuitiva: document.getElementById('decConcIntuitiva').value.trim(),
      concRacional: document.getElementById('decConcRacional').value.trim(),
      jesus: document.getElementById('decJesus').value.trim(),
      biblia: document.getElementById('decBiblia').value.trim(),
      decision: document.getElementById('decDecision').value.trim(),
      forToday: document.getElementById('decForToday').checked,
      steps: steps,
    };

    load();
    if (editingDecId) {
      var idx = decisions.findIndex(function(d){ return d.id === editingDecId; });
      if (idx >= 0) decisions[idx] = dec; else decisions.unshift(dec);
    } else {
      decisions.unshift(dec);
    }
    save();
    editingDecId = null;
    document.getElementById('decisionForm').style.display = 'none';
    render();
  };

  function render() {
    load();
    var list = document.getElementById('decisionList');
    list.innerHTML = '';
    if (decisions.length === 0) {
      list.innerHTML = '<div class="dec-empty">Aún no tienes decisiones guardadas 💭<br><span style="font-size:.75rem">Cuando tengas un dilema, ¡escríbelo aquí antes de actuar!</span></div>';
      return;
    }
    decisions.forEach(function(dec) {
      var card = document.createElement('div'); card.className = 'dec-card';
      var chips = '';
      if (dec.importancia) chips += '<span class="dec-card-chip">' + (IMPORTANCIA_LABELS[dec.importancia]||dec.importancia) + '</span>';
      if (dec.indecision)  chips += '<span class="dec-card-chip verde">' + (INDECISION_LABELS[dec.indecision]||dec.indecision) + '</span>';
      card.innerHTML =
        '<div class="dec-card-top">' +
          '<div class="dec-card-dilema">' + dec.dilema + '</div>' +
          '<div class="dec-card-date">' + (dec.fecha || '') + (dec.deadline ? '<br>📅 ' + dec.deadline : '') + '</div>' +
        '</div>' +
        (chips ? '<div class="dec-card-chips">' + chips + '</div>' : '') +
        (dec.decision ? '<div class="dec-card-decision">🎯 ' + dec.decision + '</div>' : '') +
        '<div class="dec-card-footer">' +
          '<button class="dec-card-btn" onclick="decEdit(\'' + dec.id + '\');event.stopPropagation()">✏️</button>' +
          '<button class="dec-card-btn" onclick="decDelete(\'' + dec.id + '\');event.stopPropagation()">🗑️</button>' +
        '</div>';
      card.onclick = function(){ decOpenView(dec.id); };
      list.appendChild(card);
    });
  }

  window.decDelete = function(id) {
    if (!confirm('¿Eliminar esta decisión?')) return;
    load();
    decisions = decisions.filter(function(d){ return d.id !== id; });
    save(); render();
  };

  window.decEdit = function(id) {
    load();
    var dec = decisions.find(function(d){ return d.id === id; });
    if (!dec) return;
    editingDecId = id;
    clearForm();
    document.getElementById('decDilema').value = dec.dilema || '';
    document.getElementById('decFecha').value = dec.fecha || '';
    document.getElementById('decDeadline').value = dec.deadline || '';
    document.getElementById('decMejor').value = dec.mejor || '';
    document.getElementById('decPeor').value = dec.peor || '';
    document.getElementById('decGut').value = dec.gut || '';
    document.getElementById('decConcIntuitiva').value = dec.concIntuitiva || '';
    document.getElementById('decConcRacional').value = dec.concRacional || '';
    document.getElementById('decJesus').value = dec.jesus || '';
    document.getElementById('decBiblia').value = dec.biblia || '';
    document.getElementById('decDecision').value = dec.decision || '';
    document.getElementById('decPipedream').checked = !!dec.pipedream;
    document.getElementById('decApocalypse').checked = !!dec.apocalypse;
    document.getElementById('decForToday').checked = !!dec.forToday;
    setChipVal('decImportancia', dec.importancia || '');
    setChipVal('decIndecision', dec.indecision || '');
    document.getElementById('decProsList').innerHTML = '';
    document.getElementById('decConsList').innerHTML = '';
    document.getElementById('decStepsList').innerHTML = '';
    (dec.pros || []).forEach(function(p){ decAddPro(p); });
    (dec.cons || []).forEach(function(c){ decAddCon(c); });
    (dec.steps || []).forEach(function(s){ decAddStep(s); });
    if (!dec.pros || dec.pros.length === 0) { decAddPro(); decAddPro(); }
    if (!dec.cons || dec.cons.length === 0) { decAddCon(); decAddCon(); }
    if (!dec.steps || dec.steps.length === 0) { decAddStep(); }
    document.getElementById('decisionForm').style.display = '';
    document.getElementById('decisionForm').scrollIntoView({ behavior:'smooth', block:'start' });
  };

  // ── Vista de solo lectura
  window.decOpenView = function(id) {
    load();
    var dec = decisions.find(function(d){ return d.id === id; });
    if (!dec) return;
    document.getElementById('decViewTitle').textContent = '💭 ' + dec.dilema;
    var body = document.getElementById('decViewBody');
    body.innerHTML = '';

    function row(lbl, val) {
      if (!val) return;
      var d = document.createElement('div'); d.className = 'dec-view-row';
      d.innerHTML = '<div class="dec-view-lbl">'+lbl+'</div><div class="dec-view-val">'+val+'</div>';
      body.appendChild(d);
    }

    // Chips
    if (dec.importancia || dec.indecision) {
      var cr = document.createElement('div'); cr.className = 'dec-view-chips';
      if (dec.importancia) cr.innerHTML += '<span class="dec-view-chip rosa">'+(IMPORTANCIA_LABELS[dec.importancia]||dec.importancia)+'</span>';
      if (dec.indecision)  cr.innerHTML += '<span class="dec-view-chip verde">'+(INDECISION_LABELS[dec.indecision]||dec.indecision)+'</span>';
      body.appendChild(cr);
    }

    if (dec.fecha || dec.deadline) row('Fecha / Deadline', (dec.fecha||'') + (dec.deadline ? ' → decidir antes del ' + dec.deadline : ''));
    if (dec.mejor) row('🌈 Mejor escenario' + (dec.pipedream ? ' (pipe dream 😅)' : ''), dec.mejor);
    if (dec.peor)  row('⛈️ Peor escenario' + (dec.apocalypse ? ' (apocalíptico 😱)' : ''), dec.peor);

    // Gut + pros/cons en dos columnas
    if (dec.gut || (dec.pros && dec.pros.length) || (dec.cons && dec.cons.length)) {
      var two = document.createElement('div'); two.className = 'dec-view-two';
      if (dec.gut) {
        var g = document.createElement('div'); g.className = 'dec-view-row';
        g.innerHTML = '<div class="dec-view-lbl">💭 Gut feeling</div><div class="dec-view-val">'+dec.gut+'</div>';
        two.appendChild(g);
      }
      if ((dec.pros && dec.pros.length) || (dec.cons && dec.cons.length)) {
        var pc = document.createElement('div'); pc.className = 'dec-view-row';
        pc.innerHTML = '<div class="dec-view-lbl">⚖️ Pros y contras</div>';
        var ul = document.createElement('ul'); ul.className = 'dec-view-pros';
        (dec.pros||[]).forEach(function(p){ ul.innerHTML += '<li><span class="s p">+</span>'+p+'</li>'; });
        (dec.cons||[]).forEach(function(c){ ul.innerHTML += '<li><span class="s c">−</span>'+c+'</li>'; });
        pc.appendChild(ul); two.appendChild(pc);
      }
      body.appendChild(two);
    }

    // Conclusiones
    if (dec.concIntuitiva || dec.concRacional) {
      var two2 = document.createElement('div'); two2.className = 'dec-view-two';
      if (dec.concIntuitiva) { var r = document.createElement('div'); r.className='dec-view-row'; r.innerHTML='<div class="dec-view-lbl">❤️ ¿Qué dice mi corazón?</div><div class="dec-view-val">'+dec.concIntuitiva+'</div>'; two2.appendChild(r); }
      if (dec.concRacional)  { var r2 = document.createElement('div'); r2.className='dec-view-row'; r2.innerHTML='<div class="dec-view-lbl">🧠 ¿Qué dice mi mente?</div><div class="dec-view-val">'+dec.concRacional+'</div>'; two2.appendChild(r2); }
      body.appendChild(two2);
    }

    if (dec.jesus || dec.biblia) {
      var two3 = document.createElement('div'); two3.className = 'dec-view-two';
      if (dec.jesus)  { var r3 = document.createElement('div'); r3.className='dec-view-row'; r3.innerHTML='<div class="dec-view-lbl">✝️ ¿Qué haría Jesús?</div><div class="dec-view-val">'+dec.jesus+'</div>'; two3.appendChild(r3); }
      if (dec.biblia) { var r4 = document.createElement('div'); r4.className='dec-view-row'; r4.innerHTML='<div class="dec-view-lbl">📖 ¿Qué dice la Biblia?</div><div class="dec-view-val">'+dec.biblia+'</div>'; two3.appendChild(r4); }
      body.appendChild(two3);
    }

    if (dec.decision) row('🎯 Mi decisión' + (dec.forToday ? ' (solo por hoy)' : ''), dec.decision);

    if (dec.steps && dec.steps.length) {
      var sr = document.createElement('div'); sr.className = 'dec-view-row';
      sr.innerHTML = '<div class="dec-view-lbl">👣 Próximos pasos</div>';
      var sl = document.createElement('ul'); sl.className = 'dec-view-steps';
      dec.steps.forEach(function(s){ sl.innerHTML += '<li>'+s+'</li>'; });
      sr.appendChild(sl); body.appendChild(sr);
    }

    document.getElementById('decViewBackdrop').style.display = 'flex';
    window._viewingDecId = id;
  };

  window.decCloseView = function() {
    document.getElementById('decViewBackdrop').style.display = 'none';
  };

  window.decEditFromView = function() {
    decCloseView();
    if (window._viewingDecId) decEdit(window._viewingDecId);
  };

  initChips('decImportancia');
  initChips('decIndecision');
  render();
})();



(function(){
  var resumenTab = 'semanal';

  function getDateRange(tab) {
    var today = new Date(); today.setHours(0,0,0,0);
    var dates = [];
    if (tab === 'semanal') {
      // Lun a hoy de la semana actual
      var dow = today.getDay(); var lun = new Date(today);
      lun.setDate(today.getDate() - (dow === 0 ? 6 : dow - 1));
      for (var d = new Date(lun); d <= today; d.setDate(d.getDate()+1)) dates.push(fmt(new Date(d)));
    } else {
      // Días del mes hasta hoy
      var y = today.getFullYear(), m = today.getMonth();
      for (var day = 1; day <= today.getDate(); day++) {
        dates.push(fmt(new Date(y, m, day)));
      }
    }
    return dates;
  }

  function fmt(d) {
    return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
  }

  function calcHorasSueno(dorm, desp) {
    if (!dorm || !desp) return null;
    var h1=parseInt(dorm), m1=parseInt(dorm.split(':')[1]||0);
    var h2=parseInt(desp), m2=parseInt(desp.split(':')[1]||0);
    var mins = (h2*60+m2) - (h1*60+m1);
    if (mins < 0) mins += 24*60;
    return Math.round(mins/60*10)/10;
  }

  function renderResumen() {
    var dates = getDateRange(resumenTab);
    var n = dates.length;
    var content = document.getElementById('resumenContent');
    content.innerHTML = '';

    // — Cargar datos
    var waterGoal  = parseInt(localStorage.getItem('water_goal')||'8');
    var waterState = {}; try { waterState = JSON.parse(localStorage.getItem('water_state')||'{}'); } catch(e){}
    var foodState  = {}; try { foodState  = JSON.parse(localStorage.getItem('food_state') ||'{}'); } catch(e){}
    var suenoData  = {}; try { suenoData  = JSON.parse(localStorage.getItem('sueno_data') ||'{}'); } catch(e){}
    var ciState    = {}; try { ciState    = JSON.parse(localStorage.getItem('ci_state')   ||'{}'); } catch(e){}
    var ndState    = {}; try { ndState    = JSON.parse(localStorage.getItem('nd_state')   ||'{}'); } catch(e){}
    var moodData   = {}; try { moodData   = JSON.parse(localStorage.getItem('mood_data')  ||'{}'); } catch(e){}
    var ejRegs     = {}; try { ejRegs     = JSON.parse(localStorage.getItem('ej_registros')||'{}'); } catch(e){}
    var habitosArr = []; try { habitosArr = JSON.parse(localStorage.getItem('habitos_data')||'[]'); } catch(e){}

    var MEALS = [{id:'desayuno',icon:'🌅',label:'Desa.'},{id:'almuerzo',icon:'☀️',label:'Alm.'},{id:'cena',icon:'🌙',label:'Cena'},{id:'snack',icon:'🍎',label:'Snack'}];
    var QUALITY = {'1':'😬','2':'😐','3':'🙂','4':'😋'};
    var NEEDS_DEF = [
      {id:'silencio',icon:'🔇',label:'Silencio'},
      {id:'manta',icon:'🛋️',label:'Manta/peso'},
      {id:'soledad',icon:'🚪',label:'Espacio solo'},
      {id:'musica',icon:'🎵',label:'Música'},
      {id:'mover',icon:'🚶',label:'Moverme'},
      {id:'comer',icon:'🍵',label:'Algo rico'},
    ];

    // — Calcular métricas
    // Agua
    var totalAgua = 0, diasConAgua = 0;
    dates.forEach(function(dk){ var v = waterState['w_'+dk]||0; totalAgua+=v; if(v>0) diasConAgua++; });
    var promedioAgua = n > 0 ? Math.round(totalAgua/n*10)/10 : 0;

    // Comidas
    var comidasPorMeal = {}; var qualitySum = 0, qualityCount = 0;
    MEALS.forEach(function(m){ comidasPorMeal[m.id]=0; });
    dates.forEach(function(dk){
      MEALS.forEach(function(m){
        var d = foodState['f_'+dk+'_'+m.id];
        if (d && d.eaten) {
          comidasPorMeal[m.id]++;
          if (d.quality) { qualitySum+=parseInt(d.quality); qualityCount++; }
        }
      });
    });
    var promedioQuality = qualityCount > 0 ? Math.round(qualitySum/qualityCount*10)/10 : null;

    // Sueño
    var horasSueno = [], totalSueno = 0, diasSueno = 0;
    dates.forEach(function(dk){
      var s = suenoData[dk];
      if (s && s.dormirse && s.despertar) {
        var h = calcHorasSueno(s.dormirse, s.despertar);
        if (h) { horasSueno.push(h); totalSueno+=h; diasSueno++; }
      }
    });
    var promedioSueno = diasSueno > 0 ? Math.round(totalSueno/diasSueno*10)/10 : null;

    // Mood del Journal (emoji + puntuación)
    var moods = [];
    var scoreSum = 0, scoreCount = 0;
    dates.forEach(function(dk){
      var m = moodData[dk];
      if (m && m.emoji) { moods.push({ emoji: m.emoji, score: m.score }); if(m.score) { scoreSum+=m.score; scoreCount++; } }
    });

    // Check-in sensorial (Calma)
    var diasCheckin = 0;
    var checkInEmojis = [];
    dates.forEach(function(dk){
      var em = ciState['ci_'+dk];
      if (em) { diasCheckin++; checkInEmojis.push(em); }
    });

    // Necesidades más activadas (Calma)
    var needsCount = {};
    NEEDS_DEF.forEach(function(nd){ needsCount[nd.id] = 0; });
    dates.forEach(function(dk){
      NEEDS_DEF.forEach(function(nd){
        if (ndState['nd_'+dk+'_'+nd.id]) needsCount[nd.id]++;
      });
    });
    var needsStats = NEEDS_DEF.map(function(nd){
      return { icon:nd.icon, label:nd.label, count:needsCount[nd.id], pct: n>0 ? Math.round(needsCount[nd.id]/n*100):0 };
    }).filter(function(nd){ return nd.count > 0; }).sort(function(a,b){ return b.count-a.count; });

    // Ejercicio
    var diasEjercicio = 0;
    dates.forEach(function(dk){ if(ejRegs[dk] && ejRegs[dk].length>0) diasEjercicio++; });

    // Hábitos
    var habitosStats = habitosArr.map(function(h){
      var done = dates.filter(function(dk){ return h.log && h.log.indexOf(dk)>-1; }).length;
      return { nombre:h.nombre, emoji:h.emoji||'', done:done, total:n, pct:n>0?Math.round(done/n*100):0 };
    }).filter(function(h){ return h.done > 0; }).slice(0,5);

    // — Render grid
    var grid = document.createElement('div'); grid.className = 'resumen-grid';

    // AGUA
    var cardAgua = document.createElement('div'); cardAgua.className = 'resumen-card';
    var pctAgua = Math.min(100, Math.round(promedioAgua/waterGoal*100));
    cardAgua.innerHTML =
      '<div class="resumen-card-title">💧 Agua</div>' +
      '<div class="resumen-stat-big">'+promedioAgua+'<span style="font-size:1rem;font-weight:600;color:var(--muted)"> / '+waterGoal+'</span></div>' +
      '<div class="resumen-stat-sub">vasos promedio por día · '+diasConAgua+'/'+n+' días registrados</div>' +
      '<div class="resumen-bar-wrap"><div class="resumen-bar-row">' +
        '<div class="resumen-bar-track" style="margin-top:.4rem"><div class="resumen-bar-fill" style="width:'+pctAgua+'%;background:var(--azul,#7ec8e3)"></div></div>' +
      '</div></div>';
    grid.appendChild(cardAgua);

    // SUEÑO
    var cardSueno = document.createElement('div'); cardSueno.className = 'resumen-card';
    if (promedioSueno) {
      var pctSueno = Math.min(100, Math.round(promedioSueno/9*100));
      var suenoColor = promedioSueno >= 7 ? 'var(--verde)' : promedioSueno >= 5 ? '#f0c060' : 'var(--rosa)';
      cardSueno.innerHTML =
        '<div class="resumen-card-title">🌙 Sueño</div>' +
        '<div class="resumen-stat-big" style="color:'+suenoColor+'">'+promedioSueno+'h</div>' +
        '<div class="resumen-stat-sub">promedio por noche · '+diasSueno+' noches registradas</div>' +
        '<div class="resumen-bar-wrap"><div class="resumen-bar-row">' +
          '<div class="resumen-bar-track" style="margin-top:.4rem"><div class="resumen-bar-fill" style="width:'+pctSueno+'%;background:'+suenoColor+'"></div></div>' +
        '</div></div>';
    } else {
      cardSueno.innerHTML = '<div class="resumen-card-title">🌙 Sueño</div><div class="resumen-empty">Sin registros aún</div>';
    }
    grid.appendChild(cardSueno);

    // EJERCICIO
    var cardEj = document.createElement('div'); cardEj.className = 'resumen-card';
    var pctEj = n > 0 ? Math.round(diasEjercicio/n*100) : 0;
    var ejColor = pctEj >= 60 ? 'var(--verde)' : pctEj >= 30 ? '#f0c060' : 'var(--rosa)';
    cardEj.innerHTML =
      '<div class="resumen-card-title">🏃 Ejercicio</div>' +
      '<div class="resumen-stat-big" style="color:'+ejColor+'">'+diasEjercicio+'<span style="font-size:1rem;font-weight:600;color:var(--muted)"> / '+n+'</span></div>' +
      '<div class="resumen-stat-sub">días activos · '+pctEj+'% del período</div>' +
      '<div class="resumen-bar-wrap"><div class="resumen-bar-row">' +
        '<div class="resumen-bar-track" style="margin-top:.4rem"><div class="resumen-bar-fill" style="width:'+pctEj+'%;background:'+ejColor+'"></div></div>' +
      '</div></div>';
    grid.appendChild(cardEj);

    // MOOD
    var cardMood = document.createElement('div'); cardMood.className = 'resumen-card';
    cardMood.innerHTML = '<div class="resumen-card-title">😊 Mood del Journal</div>';
    if (moods.length > 0) {
      var avgScore = scoreCount > 0 ? Math.round(scoreSum/scoreCount*10)/10 : null;
      cardMood.innerHTML += '<div class="resumen-stat-sub" style="margin-bottom:.4rem">'+moods.length+' / '+n+' días registrados'+(avgScore?' · Promedio: '+avgScore+'/10':'')+'</div>';
      var moodRow = document.createElement('div'); moodRow.className = 'resumen-mood-row';
      moods.forEach(function(m){ var s=document.createElement('span'); s.className='resumen-mood-item'; s.textContent=m.emoji; moodRow.appendChild(s); });
      cardMood.appendChild(moodRow);
    } else {
      cardMood.innerHTML += '<div class="resumen-mood-empty">Sin registros aún</div>';
    }
    grid.appendChild(cardMood);

    // CHECK-IN SENSORIAL (Calma)
    var cardCheckin = document.createElement('div'); cardCheckin.className = 'resumen-card';
    cardCheckin.innerHTML = '<div class="resumen-card-title">🧠 Check-in Sensorial</div>';
    if (diasCheckin > 0) {
      cardCheckin.innerHTML += '<div class="resumen-stat-big">'+diasCheckin+'<span style="font-size:1rem;font-weight:600;color:var(--muted)"> / '+n+'</span></div>';
      cardCheckin.innerHTML += '<div class="resumen-stat-sub">días con check-in registrado</div>';
      var ciRow = document.createElement('div'); ciRow.className = 'resumen-mood-row'; ciRow.style.marginTop='.5rem';
      checkInEmojis.forEach(function(e){ var s=document.createElement('span'); s.className='resumen-mood-item'; s.textContent=e; ciRow.appendChild(s); });
      cardCheckin.appendChild(ciRow);
    } else {
      cardCheckin.innerHTML += '<div class="resumen-mood-empty">Sin registros aún</div>';
    }
    grid.appendChild(cardCheckin);

    // NECESIDADES más activadas (Calma) — ancho completo
    if (needsStats.length > 0) {
      var cardNeeds = document.createElement('div'); cardNeeds.className = 'resumen-card resumen-full-card';
      cardNeeds.innerHTML = '<div class="resumen-card-title">🛋️ Necesidades sensoriales más frecuentes</div>';
      var needsBars = document.createElement('div'); needsBars.className = 'resumen-habitos-list';
      needsStats.forEach(function(nd){
        var row = document.createElement('div'); row.className = 'resumen-habito-row';
        row.innerHTML =
          '<span style="font-size:.85rem">'+nd.icon+'</span>' +
          '<span style="flex:1;font-size:.78rem;color:var(--text)">'+nd.label+'</span>' +
          '<div class="resumen-habito-bar-track"><div class="resumen-habito-bar-fill" style="width:'+nd.pct+'%;background:var(--beige,#e8c89a)"></div></div>' +
          '<div class="resumen-habito-pct">'+nd.count+'d</div>';
        needsBars.appendChild(row);
      });
      cardNeeds.appendChild(needsBars);
      grid.appendChild(cardNeeds);
    }

    // COMIDAS — ancho completo
    var cardComidas = document.createElement('div'); cardComidas.className = 'resumen-card resumen-full-card';
    var totalComidas = Object.values(comidasPorMeal).reduce(function(a,b){return a+b;},0);
    cardComidas.innerHTML = '<div class="resumen-card-title">🍽️ Comidas</div>';
    if (totalComidas > 0) {
      cardComidas.innerHTML += '<div class="resumen-stat-sub" style="margin-bottom:.5rem">'+totalComidas+' comidas registradas en '+n+' días'+(promedioQuality?' · Calidad promedio: '+(QUALITY[String(Math.round(promedioQuality))]||''):'')+'</div>';
      var barsWrap = document.createElement('div'); barsWrap.className = 'resumen-bar-wrap';
      MEALS.forEach(function(m){
        var pct = n > 0 ? Math.round(comidasPorMeal[m.id]/n*100) : 0;
        var row = document.createElement('div'); row.className = 'resumen-bar-row';
        row.innerHTML =
          '<div class="resumen-bar-label">'+m.icon+'</div>' +
          '<div class="resumen-bar-track"><div class="resumen-bar-fill" style="width:'+pct+'%;background:var(--verde)"></div></div>' +
          '<div class="resumen-bar-val">'+comidasPorMeal[m.id]+'d</div>';
        barsWrap.appendChild(row);
      });
      cardComidas.appendChild(barsWrap);
    } else {
      cardComidas.innerHTML += '<div class="resumen-empty">Sin registros aún</div>';
    }
    grid.appendChild(cardComidas);

    // HÁBITOS — ancho completo
    if (habitosStats.length > 0) {
      var cardHab = document.createElement('div'); cardHab.className = 'resumen-card resumen-full-card';
      cardHab.innerHTML = '<div class="resumen-card-title">🌱 Hábitos</div>';
      var habList = document.createElement('div'); habList.className = 'resumen-habitos-list';
      habitosStats.forEach(function(h){
        var row = document.createElement('div'); row.className = 'resumen-habito-row';
        row.innerHTML =
          '<span style="font-size:.85rem">'+h.emoji+'</span>' +
          '<span style="flex:1;font-size:.78rem;color:var(--text)">'+h.nombre+'</span>' +
          '<div class="resumen-habito-bar-track"><div class="resumen-habito-bar-fill" style="width:'+h.pct+'%"></div></div>' +
          '<div class="resumen-habito-pct">'+h.pct+'%</div>';
        habList.appendChild(row);
      });
      cardHab.appendChild(habList);
      grid.appendChild(cardHab);
    }

    content.appendChild(grid);
  }

  window.resumenShowTab = function(tab) {
    resumenTab = tab;
    document.getElementById('resTabSemanal').classList.toggle('active', tab==='semanal');
    document.getElementById('resTabMensual').classList.toggle('active', tab==='mensual');
    renderResumen();
  };

  window.renderResumenSalud = renderResumen;

  // Re-render cuando se vuelve a la página de salud
  var _origShowPage = window.showPage;
  window.showPage = function(pageId) {
    if (_origShowPage) _origShowPage(pageId);
    if (pageId === 'page-salud') setTimeout(renderResumen, 80);
  };

  setTimeout(renderResumen, 400);
})();



(function(){
  var RH_KEY = 'yuki_rutina_horarios';
  var horarios = [];
  var editingId = null;
  var notifTimers = [];

  function load() { try { horarios = JSON.parse(localStorage.getItem(RH_KEY)) || []; } catch(e){ horarios=[]; } }
  function save() {
    horarios.sort(function(a,b){ return a.hora.localeCompare(b.hora); });
    localStorage.setItem(RH_KEY, JSON.stringify(horarios));
    if (window.cloudSave) window.cloudSave(RH_KEY, horarios);
    if (window.cloudSave) window.cloudSave(RH_KEY, horarios);
  }

  function render() {
    load();
    var list = document.getElementById('rutinaHList');
    if (!list) return;
    list.innerHTML = '';
    if (horarios.length === 0) {
      list.innerHTML = '<div class="rutina-h-empty">Aún no tienes horarios. Agrega tus horas de sueño, comidas y más 🌸</div>';
      return;
    }
    horarios.forEach(function(h) {
      var card = document.createElement('div');
      card.className = 'rutina-h-card';
      card.innerHTML =
        '<div class="rutina-h-time">'+h.hora+'</div>' +
        '<div class="rutina-h-body">' +
          '<div class="rutina-h-label">'+h.label+'</div>' +
          (h.nota ? '<div class="rutina-h-note">'+h.nota+'</div>' : '') +
        '</div>' +
        '<div class="rutina-h-notif-dot">'+(h.notif ? '🔔' : '')+'</div>' +
        '<div class="rutina-h-actions">' +
          '<button class="rutina-h-btn" onclick="rutinaHorariosEdit(\''+h.id+'\')">✏️</button>' +
          '<button class="rutina-h-btn" onclick="rutinaHorariosDelete(\''+h.id+'\')">🗑️</button>' +
        '</div>';
      list.appendChild(card);
    });
  }

  // Notificaciones
  function checkNotifPermission() {
    if (!('Notification' in window)) return;
    var banner = document.getElementById('rutinaHNotifBanner');
    if (!banner) return;
    if (Notification.permission === 'default') {
      banner.style.display = 'flex';
    } else {
      banner.style.display = 'none';
    }
  }

  window.rutinaHorariosRequestNotif = function() {
    if (!('Notification' in window)) { alert('Tu navegador no soporta notificaciones'); return; }
    Notification.requestPermission().then(function(p) {
      checkNotifPermission();
      if (p === 'granted') scheduleAll();
    });
  };

  function scheduleAll() {
    notifTimers.forEach(clearTimeout);
    notifTimers = [];
    if (!('Notification' in window) || Notification.permission !== 'granted') return;
    load();
    horarios.forEach(function(h) {
      if (!h.notif) return;
      var parts = h.hora.split(':');
      var now = new Date();
      var target = new Date();
      target.setHours(parseInt(parts[0]), parseInt(parts[1]), 0, 0);
      if (target <= now) target.setDate(target.getDate() + 1);
      var ms = target - now;
      var t = setTimeout(function() {
        new Notification('⏰ ' + h.label, {
          body: h.nota || 'Es hora — ' + h.hora,
          icon: ''
        });
        scheduleAll(); // reprogramar para el día siguiente
      }, ms);
      notifTimers.push(t);
    });
  }

  window.rutinaHorariosAdd = function() {
    editingId = null;
    document.getElementById('rutinaHModalTitle').textContent = 'Nuevo horario';
    document.getElementById('rutinaHHora').value = '';
    document.getElementById('rutinaHLabel').value = '';
    document.getElementById('rutinaHNota').value = '';
    document.getElementById('rutinaHNotifCheck').checked = true;
    document.getElementById('rutinaHModalBackdrop').style.display = 'flex';
    setTimeout(function(){ document.getElementById('rutinaHHora').focus(); }, 100);
  };

  window.rutinaHorariosEdit = function(id) {
    load();
    var h = horarios.find(function(x){ return x.id === id; });
    if (!h) return;
    editingId = id;
    document.getElementById('rutinaHModalTitle').textContent = 'Editar horario';
    document.getElementById('rutinaHHora').value = h.hora;
    document.getElementById('rutinaHLabel').value = h.label;
    document.getElementById('rutinaHNota').value = h.nota || '';
    document.getElementById('rutinaHNotifCheck').checked = !!h.notif;
    document.getElementById('rutinaHModalBackdrop').style.display = 'flex';
  };

  window.rutinaHorariosCloseModal = function() {
    document.getElementById('rutinaHModalBackdrop').style.display = 'none';
    editingId = null;
  };

  window.rutinaHorariosGuardar = function() {
    var hora  = document.getElementById('rutinaHHora').value;
    var label = document.getElementById('rutinaHLabel').value.trim();
    if (!hora || !label) { alert('Pon la hora y el nombre 🌸'); return; }
    load();
    var h = {
      id: editingId || ('rh_' + Date.now()),
      hora: hora,
      label: label,
      nota: document.getElementById('rutinaHNota').value.trim(),
      notif: document.getElementById('rutinaHNotifCheck').checked,
    };
    if (editingId) {
      var idx = horarios.findIndex(function(x){ return x.id === editingId; });
      if (idx >= 0) horarios[idx] = h; else horarios.push(h);
    } else {
      horarios.push(h);
      // 🎮 Nuevo horario de ritmo circadiano → EXP + flores
      if (window.yukiAddXP) window.yukiAddXP(10, 'Ritmo Circadiano');
      if (window.yukiAddSakura) window.yukiAddSakura(3);
    }
    save(); rutinaHorariosCloseModal(); render(); scheduleAll();
    // Pedir permiso si tiene notif activada y no hay permiso
    if (h.notif && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then(function(p){ checkNotifPermission(); if(p==='granted') scheduleAll(); });
    }
  };

  window.rutinaHorariosDelete = function(id) {
    if (!confirm('¿Eliminar este horario?')) return;
    load();
    horarios = horarios.filter(function(x){ return x.id !== id; });
    save(); render(); scheduleAll();
  };

  load(); render(); checkNotifPermission(); scheduleAll();

  // 🎮 Verificar horarios cumplidos al abrir la app
  // Si la hora actual está dentro de ±15 min de un horario y no se ha dado XP hoy por ese horario
  window.yukiCheckCircadiano = function() {
    load();
    if (horarios.length === 0) return;
    var now = new Date();
    var todayStr = now.getFullYear()+'-'+String(now.getMonth()+1).padStart(2,'0')+'-'+String(now.getDate()).padStart(2,'0');
    var xpKey = 'yuki_circ_xp_' + todayStr;
    var dado = {};
    try { dado = JSON.parse(localStorage.getItem(xpKey)||'{}'); } catch(e){}
    var nowMins = now.getHours()*60 + now.getMinutes();
    var earned = false;
    horarios.forEach(function(h) {
      if (dado[h.id]) return; // ya se dio hoy
      var parts = h.hora.split(':');
      var hMins = parseInt(parts[0])*60 + parseInt(parts[1]);
      if (Math.abs(nowMins - hMins) <= 15) {
        dado[h.id] = true;
        earned = true;
        if (window.yukiAddXP) window.yukiAddXP(10, 'Circadiano');
        if (window.yukiAddSakura) window.yukiAddSakura(3);
      }
    });
    if (earned) {
      localStorage.setItem(xpKey, JSON.stringify(dado));
      if (window.cloudSave) window.cloudSave(xpKey, dado);
    }
  };

  // Verificar al cargar
  setTimeout(window.yukiCheckCircadiano, 500);
})();



(function(){
  var PETS_KEY = 'yuki_mascotas';
  var pets = [];
  var editingId = null;

  function load() {
    try { pets = JSON.parse(localStorage.getItem(PETS_KEY)) || []; } catch(e){ pets=[]; }
  }
  function save() {
    localStorage.setItem(PETS_KEY, JSON.stringify(pets));
    if (window.cloudSave) window.cloudSave(PETS_KEY, pets);
  }

  function calcEdad(fechaNac) {
    if (!fechaNac) return '';
    var hoy = new Date(), nac = new Date(fechaNac);
    var anos = hoy.getFullYear() - nac.getFullYear();
    var meses = hoy.getMonth() - nac.getMonth();
    if (meses < 0) { anos--; meses += 12; }
    if (anos > 0) return anos + (anos === 1 ? ' año' : ' años');
    if (meses > 0) return meses + (meses === 1 ? ' mes' : ' meses');
    return 'recién llegado 🐣';
  }

  function render() {
    load();
    var grid = document.getElementById('petsGrid');
    var empty = document.getElementById('petsEmpty');
    if (!grid) return;
    // Clear cards but keep empty
    Array.from(grid.querySelectorAll('.pets-card')).forEach(el => el.remove());
    if (pets.length === 0) { if(empty) empty.style.display='flex'; return; }
    if(empty) empty.style.display='none';
    pets.forEach(function(pet) {
      var card = document.createElement('div');
      card.className = 'pets-card';
      var photoHtml = pet.foto
        ? '<img src="'+pet.foto+'" style="width:100%;height:100%;object-fit:cover">'
        : (pet.especie ? especieEmoji(pet.especie) : '🐾');
      var cuidadosHtml = (pet.cuidados||[]).map(function(c){
        var cls = getCuidadoStatus(c);
        return '<span class="pets-card-cuidado-chip '+cls+'">'+c.nombre+'</span>';
      }).join('');
      card.innerHTML =
        '<div class="pets-card-top">'+
          '<div class="pets-card-photo">'+photoHtml+'</div>'+
          '<div class="pets-card-info">'+
            '<div class="pets-card-name">'+pet.nombre+'</div>'+
            '<div class="pets-card-especie">'+(pet.especie||'')+(pet.raza?' · '+pet.raza:'')+'</div>'+
            (pet.fechaNac?'<div class="pets-card-edad">'+calcEdad(pet.fechaNac)+'</div>':'')+
          '</div>'+
        '</div>'+
        '<div class="pets-card-body">'+
          (pet.notas?'<div class="pets-card-notas">'+pet.notas+'</div>':'')+
          (cuidadosHtml?'<div class="pets-card-cuidados">'+cuidadosHtml+'</div>':'')+
        '</div>'+
        '<div class="pets-card-footer">'+
          '<button class="pets-card-btn" title="Editar" onclick="petsOpenModal(\''+pet.id+'\');event.stopPropagation()">✏️</button>'+
          '<button class="pets-card-btn" title="Eliminar" onclick="petsDelete(\''+pet.id+'\');event.stopPropagation()">🗑️</button>'+
        '</div>';
      card.onclick = (function(pid){ return function(){ petsOpenModal(pid); }; })(pet.id);
      grid.appendChild(card);
    });
  }

  function especieEmoji(esp) {
    esp = esp.toLowerCase();
    if (esp.includes('perro') || esp.includes('dog')) return '🐶';
    if (esp.includes('gato') || esp.includes('cat')) return '🐱';
    if (esp.includes('conejo')) return '🐰';
    if (esp.includes('pez') || esp.includes('peces')) return '🐠';
    if (esp.includes('ave') || esp.includes('pájaro') || esp.includes('pajaro') || esp.includes('loro')) return '🦜';
    if (esp.includes('hamster') || esp.includes('hámster')) return '🐹';
    if (esp.includes('tortuga')) return '🐢';
    return '🐾';
  }

  function getCuidadoStatus(c) {
    if (!c.fecha) return '';
    var hoy = new Date(); hoy.setHours(0,0,0,0);
    var f = new Date(c.fecha); f.setHours(0,0,0,0);
    if (f < hoy) return 'vencido';
    if (f.getTime() === hoy.getTime()) return 'vence-hoy';
    return '';
  }

  window.petsOpenModal = function(id) {
    load();
    editingId = id ? id : null;
    var pet = id ? pets.find(function(p){ return p.id===id; }) : null;
    document.getElementById('petsModalTitle').textContent = pet ? 'Editar mascota' : 'Nueva mascota';
    document.getElementById('petsNombre').value = pet ? pet.nombre : '';
    document.getElementById('petsEspecie').value = pet ? (pet.especie||'') : '';
    document.getElementById('petsRaza').value = pet ? (pet.raza||'') : '';
    document.getElementById('petsFechaNac').value = pet ? (pet.fechaNac||'') : '';
    document.getElementById('petsColor').value = pet ? (pet.color||'') : '';
    document.getElementById('petsNotas').value = pet ? (pet.notas||'') : '';
    document.getElementById('petsPhotoData').value = pet ? (pet.foto||'') : '';
    // Resetear file input para evitar bugs en móvil
    var fileInp = document.getElementById('petsPhotoInput');
    fileInp.value = '';
    var img = document.getElementById('petsPhotoImg');
    var ph = document.getElementById('petsPhotoPlaceholder');
    if (pet && pet.foto) { img.src = pet.foto; img.style.display=''; ph.style.display='none'; }
    else { img.src=''; img.style.display='none'; ph.style.display=''; }
    // Cuidados
    var cl = document.getElementById('petsCuidadosList'); cl.innerHTML='';
    (pet ? pet.cuidados||[] : []).forEach(function(c){ addCuidadoRow(c); });
    // Diario
    var dl = document.getElementById('petsDiarioList'); dl.innerHTML='';
    (pet ? pet.diario||[] : []).forEach(function(d){ addDiarioRow(d); });
    document.getElementById('petsModalBackdrop').style.display='flex';
  };

  window.petsCloseModal = function() {
    document.getElementById('petsModalBackdrop').style.display='none';
    // Limpiar file input siempre al cerrar
    var fileInp = document.getElementById('petsPhotoInput');
    if (fileInp) fileInp.value = '';
    editingId = null;
  };

  window.petsHandlePhoto = function(input) {
    var file = input.files && input.files[0];
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function(e) {
      document.getElementById('petsPhotoData').value = e.target.result;
      var img = document.getElementById('petsPhotoImg');
      var ph = document.getElementById('petsPhotoPlaceholder');
      img.src = e.target.result; img.style.display=''; ph.style.display='none';
    };
    reader.readAsDataURL(file);
  };

  // Asignar onchange por JS para evitar problemas al mover el modal al body
  var petsPhotoInp = document.getElementById('petsPhotoInput');
  if (petsPhotoInp) petsPhotoInp.onchange = function(){ window.petsHandlePhoto(this); };

  function addCuidadoRow(c) {
    c = c || { nombre:'', fecha:'' };
    var row = document.createElement('div');
    row.className = 'pets-cuidado-row';
    row.innerHTML =
      '<input class="pets-input" placeholder="Ej: Vacuna rabia, desparasitar…" value="'+(c.nombre||'')+'" style="font-size:.78rem">'+
      '<input class="pets-input" type="date" value="'+(c.fecha||'')+'" style="font-size:.78rem">'+
      '<button class="pets-remove-btn" onclick="this.parentElement.remove()">✕</button>';
    document.getElementById('petsCuidadosList').appendChild(row);
  }

  function addDiarioRow(d) {
    d = d || { fecha: new Date().toISOString().slice(0,10), texto:'' };
    var row = document.createElement('div');
    row.className = 'pets-diario-row';
    row.innerHTML =
      '<input class="pets-input" type="date" value="'+(d.fecha||'')+'" style="font-size:.78rem;width:130px">'+
      '<input class="pets-input" placeholder="¿Qué pasó hoy?" value="'+(d.texto||'')+'" style="font-size:.78rem">'+
      '<button class="pets-remove-btn" onclick="this.parentElement.remove()">✕</button>';
    document.getElementById('petsDiarioList').appendChild(row);
  }

  window.petsAddCuidado = function() { addCuidadoRow(); };
  window.petsAddDiario  = function() { addDiarioRow(); };

  window.petsSave = function() {
    var nombre = document.getElementById('petsNombre').value.trim();
    if (!nombre) { alert('El nombre es obligatorio 🐾'); return; }
    var cuidados = Array.from(document.querySelectorAll('#petsCuidadosList .pets-cuidado-row')).map(function(row){
      var inputs = row.querySelectorAll('input');
      return { nombre: inputs[0].value.trim(), fecha: inputs[1].value };
    }).filter(function(c){ return c.nombre; });
    var diario = Array.from(document.querySelectorAll('#petsDiarioList .pets-diario-row')).map(function(row){
      var inputs = row.querySelectorAll('input');
      return { fecha: inputs[0].value, texto: inputs[1].value.trim() };
    }).filter(function(d){ return d.texto; });
    var pet = {
      id: editingId || ('pet_' + Date.now()),
      nombre: nombre,
      especie: document.getElementById('petsEspecie').value.trim(),
      raza: document.getElementById('petsRaza').value.trim(),
      fechaNac: document.getElementById('petsFechaNac').value,
      color: document.getElementById('petsColor').value.trim(),
      notas: document.getElementById('petsNotas').value.trim(),
      foto: document.getElementById('petsPhotoData').value,
      cuidados: cuidados,
      diario: diario,
    };
    if (editingId) {
      var idx = pets.findIndex(function(p){ return p.id===editingId; });
      if (idx >= 0) pets[idx] = pet;
    } else {
      pets.push(pet);
    }
    editingId = null;
    save(); petsCloseModal(); render();
  };

  window.petsDelete = function(id) {
    if (!confirm('¿Eliminar esta mascota?')) return;
    pets = pets.filter(function(p){ return p.id!==id; });
    save(); render();
  };

  // Init
  load(); render();

  // Cloud sync
  if (window._watchCloud) window._watchCloud(PETS_KEY, function(val){ pets = val||[]; render(); });
})();



(function(){
  var PLANTS_KEY = 'yuki_plantas';
  var plants = [];
  var editingId = null;

  function load() {
    try { plants = JSON.parse(localStorage.getItem(PLANTS_KEY)) || []; } catch(e){ plants=[]; }
  }
  function save() {
    localStorage.setItem(PLANTS_KEY, JSON.stringify(plants));
    if (window.cloudSave) window.cloudSave(PLANTS_KEY, plants);
  }

  function getRiegoBadge(proximoRiego) {
    if (!proximoRiego) return '';
    var hoy = new Date(); hoy.setHours(0,0,0,0);
    var prox = new Date(proximoRiego); prox.setHours(0,0,0,0);
    var diff = Math.round((prox - hoy) / 86400000);
    if (diff < 0) return '<span class="plants-riego-badge vencido">💧 regar hace '+Math.abs(diff)+' día'+(Math.abs(diff)===1?'':'s')+'</span>';
    if (diff === 0) return '<span class="plants-riego-badge hoy">💧 regar hoy!</span>';
    if (diff <= 2) return '<span class="plants-riego-badge pronto">💧 regar en '+diff+' día'+(diff===1?'':'s')+'</span>';
    return '<span class="plants-riego-badge ok">💧 próximo riego: '+prox.toLocaleDateString('es-MX',{day:'numeric',month:'short'})+'</span>';
  }

  function render() {
    load();
    var grid = document.getElementById('plantsGrid');
    var empty = document.getElementById('plantsEmpty');
    if (!grid) return;
    Array.from(grid.querySelectorAll('.plants-card')).forEach(el => el.remove());
    if (plants.length === 0) { if(empty) empty.style.display='flex'; return; }
    if(empty) empty.style.display='none';
    plants.forEach(function(plant) {
      var card = document.createElement('div');
      card.className = 'plants-card';
      var photoHtml = plant.foto
        ? '<img src="'+plant.foto+'" style="width:100%;height:100%;object-fit:cover">'
        : '🪴';
      card.innerHTML =
        '<div class="plants-card-top">'+
          '<div class="plants-card-photo">'+photoHtml+'</div>'+
          '<div class="plants-card-info">'+
            '<div class="plants-card-name">'+plant.nombre+'</div>'+
            '<div class="plants-card-especie">'+(plant.especie||'')+(plant.ubicacion?' · '+plant.ubicacion:'')+'</div>'+
            (plant.frecuencia?'<div class="plants-card-riego">🚿 '+plant.frecuencia+'</div>':'')+
          '</div>'+
        '</div>'+
        '<div class="plants-card-body">'+
          (plant.notas?'<div class="plants-card-notas">'+plant.notas+'</div>':'')+
          getRiegoBadge(plant.proximoRiego)+
        '</div>'+
        '<div class="plants-card-footer">'+
          '<button class="plants-card-btn" title="Editar" onclick="plantsOpenModal(\''+plant.id+'\');event.stopPropagation()">✏️</button>'+
          '<button class="plants-card-btn" title="Eliminar" onclick="plantsDelete(\''+plant.id+'\');event.stopPropagation()">🗑️</button>'+
        '</div>';
      card.onclick = function(){ plantsOpenModal(plant.id); };
      grid.appendChild(card);
    });
  }

  window.plantsOpenModal = function(id) {
    load();
    editingId = id ? id : null;
    var plant = id ? plants.find(function(p){ return p.id===id; }) : null;
    document.getElementById('plantsModalTitle').textContent = plant ? 'Editar planta' : 'Nueva planta';
    document.getElementById('plantsNombre').value = plant ? plant.nombre : '';
    document.getElementById('plantsEspecie').value = plant ? (plant.especie||'') : '';
    document.getElementById('plantsUbicacion').value = plant ? (plant.ubicacion||'') : '';
    document.getElementById('plantsFrecuencia').value = plant ? (plant.frecuencia||'') : '';
    document.getElementById('plantsUltimoRiego').value = plant ? (plant.ultimoRiego||'') : '';
    document.getElementById('plantsProximoRiego').value = plant ? (plant.proximoRiego||'') : '';
    document.getElementById('plantsNotas').value = plant ? (plant.notas||'') : '';
    document.getElementById('plantsPhotoData').value = plant ? (plant.foto||'') : '';
    var img = document.getElementById('plantsPhotoImg');
    var ph = document.getElementById('plantsPhotoPlaceholder');
    if (plant && plant.foto) { img.src = plant.foto; img.style.display=''; ph.style.display='none'; }
    else { img.style.display='none'; ph.style.display=''; }
    var dl = document.getElementById('plantsDiarioList'); dl.innerHTML='';
    (plant ? plant.diario||[] : []).forEach(function(d){ addDiarioRow(d); });
    document.getElementById('plantsModalBackdrop').style.display='flex';
  };

  window.plantsCloseModal = function() {
    document.getElementById('plantsModalBackdrop').style.display='none';
  };

  window.plantsHandlePhoto = function(input) {
    var file = input.files && input.files[0];
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function(e) {
      document.getElementById('plantsPhotoData').value = e.target.result;
      var img = document.getElementById('plantsPhotoImg');
      var ph = document.getElementById('plantsPhotoPlaceholder');
      img.src = e.target.result; img.style.display=''; ph.style.display='none';
    };
    reader.readAsDataURL(file);
  };

  function addDiarioRow(d) {
    d = d || { fecha: new Date().toISOString().slice(0,10), texto:'' };
    var row = document.createElement('div');
    row.className = 'plants-diario-row';
    row.innerHTML =
      '<input class="plants-input" type="date" value="'+(d.fecha||'')+'" style="font-size:.78rem;width:130px">'+
      '<input class="plants-input" placeholder="¿Qué hiciste hoy?" value="'+(d.texto||'')+'" style="font-size:.78rem">'+
      '<button class="plants-remove-btn" onclick="this.parentElement.remove()">✕</button>';
    document.getElementById('plantsDiarioList').appendChild(row);
  }

  window.plantsAddDiario = function() { addDiarioRow(); };

  window.plantsSave = function() {
    var nombre = document.getElementById('plantsNombre').value.trim();
    if (!nombre) { alert('El nombre es obligatorio 🪴'); return; }
    var diario = Array.from(document.querySelectorAll('#plantsDiarioList .plants-diario-row')).map(function(row){
      var inputs = row.querySelectorAll('input');
      return { fecha: inputs[0].value, texto: inputs[1].value.trim() };
    }).filter(function(d){ return d.texto; });
    var plant = {
      id: editingId || ('plant_' + Date.now()),
      nombre: nombre,
      especie: document.getElementById('plantsEspecie').value.trim(),
      ubicacion: document.getElementById('plantsUbicacion').value.trim(),
      frecuencia: document.getElementById('plantsFrecuencia').value.trim(),
      ultimoRiego: document.getElementById('plantsUltimoRiego').value,
      proximoRiego: document.getElementById('plantsProximoRiego').value,
      notas: document.getElementById('plantsNotas').value.trim(),
      foto: document.getElementById('plantsPhotoData').value,
      diario: diario,
    };
    if (editingId) {
      var idx = plants.findIndex(function(p){ return p.id===editingId; });
      if (idx >= 0) plants[idx] = plant;
    } else {
      plants.push(plant);
    }
    editingId = null;
    save(); plantsCloseModal(); render();
  };

  window.plantsDelete = function(id) {
    if (!confirm('¿Eliminar esta planta?')) return;
    plants = plants.filter(function(p){ return p.id!==id; });
    save(); render();
  };

  load(); render();

  if (window._watchCloud) window._watchCloud(PLANTS_KEY, function(val){ plants = val||[]; render(); });
})();
