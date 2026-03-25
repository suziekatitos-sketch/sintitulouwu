// ════════════════════════════════════════════════════════════════
// Yuki 🌸 — modules_35_41.js
// ════════════════════════════════════════════════════════════════


(function(){
  // Tiempos configurables (en minutos)
  function pomLoadConfig() {
    try {
      var c = JSON.parse(localStorage.getItem('pom_config') || '{}');
      return { work: (c.work||25)*60, short: (c.short||5)*60, long: (c.long||15)*60 };
    } catch(e) { return { work:25*60, short:5*60, long:15*60 }; }
  }
  var POM_MODES = pomLoadConfig();
  var pomMode = 'work';
  var pomTimeLeft = POM_MODES.work;
  var pomRunning = false;
  var pomTimer = null;
  var pomSessionsDone = 0;

  function pomFmt(s) {
    var m = Math.floor(s/60);
    var sec = s % 60;
    return String(m).padStart(2,'0') + ':' + String(sec).padStart(2,'0');
  }

  function pomSetCatMode(mode) {
    var cat = document.getElementById('pomCat');
    if (!cat) return;
    cat.className = 'pom-cat-wrap mode-' + mode;
  }

  function pomBuildCat() {
    var cat = document.getElementById('pomCat');
    if (!cat || cat.querySelector('.cat-body')) return;
    cat.innerHTML =
      '<div class="pom-cat">' +
        '<div class="cat-head">' +
          '<div class="cat-ear-l"></div>' +
          '<div class="cat-ear-r"></div>' +
          '<div class="cat-eye-l"></div>' +
          '<div class="cat-eye-r"></div>' +
          '<div class="cat-nose"></div>' +
          '<div class="cat-wl"></div>' +
          '<div class="cat-wr"></div>' +
        '</div>' +
        '<div class="cat-body">' +
          '<div class="cat-tail"></div>' +
        '</div>' +
      '</div>';
  }

  function pomUpdateGif() {
    var wrap = document.getElementById('pomGifWrap');
    if (!wrap) return;
    pomBuildCat();
    if (pomRunning) {
      pomSetCatMode(pomMode);
      wrap.style.display = 'block';
    } else {
      wrap.style.display = 'none';
    }
  }

  function pomUpdateDisplay() {
    var disp = document.getElementById('pomDisplay');
    var btn = document.getElementById('pomStartBtn');
    if (!disp) return;
    disp.textContent = pomFmt(pomTimeLeft);
    disp.className = 'pomodoro-display' + (pomRunning ? (pomMode==='work' ? ' running' : ' break') : '');
    if (btn) btn.textContent = pomRunning ? '⏸ Pausar' : '▶ Iniciar';
    pomUpdateGif();
  }

  function pomUpdateSessions() {
    var el = document.getElementById('pomSessions');
    if (!el) return;
    var html = 'Sesiones: ';
    for (var i = 0; i < 4; i++) {
      html += '<span class="pom-tomato ' + (i < pomSessionsDone % 4 ? 'done' : 'pending') + '">🍅</span>';
    }
    el.innerHTML = html;
  }

  window.pomSetMode = function(mode) {
    pomMode = mode;
    pomRunning = false;
    clearInterval(pomTimer);
    pomTimeLeft = POM_MODES[mode];
    document.querySelectorAll('.pom-mode-btn').forEach(function(b, i) {
      b.classList.toggle('active', ['work','short','long'][i] === mode);
    });
    pomUpdateDisplay();
  };

  window.pomToggle = function() {
    if (pomRunning) {
      pomRunning = false;
      clearInterval(pomTimer);
      pomUpdateDisplay();
    } else {
      pomRunning = true;
      pomTimer = setInterval(function() {
        pomTimeLeft--;
        pomUpdateDisplay();
        if (pomTimeLeft <= 0) {
          clearInterval(pomTimer);
          pomRunning = false;
          if (pomMode === 'work') {
            pomSessionsDone++;
            pomUpdateSessions();
            pomNotify('¡Sesión completada! 🍅 Tómate un descanso.');
          } else {
            pomNotify('¡Descanso terminado! Vuelve al foco 💪');
          }
          // Gatito de celebración al terminar
          var wrap = document.getElementById('pomGifWrap');
          if (wrap) {
            pomBuildCat();
            pomSetCatMode('celebrate');
            wrap.style.display = 'block';
            setTimeout(function() { wrap.style.display = 'none'; }, 3500);
          }
        }
      }, 1000);
      pomUpdateDisplay();
    }
  };

  window.pomOpenConfig = function() {
    var old = document.getElementById('pomConfigModal'); if(old) old.remove();
    var cfg = {};
    try { cfg = JSON.parse(localStorage.getItem('pom_config')||'{}'); } catch(e){}

    var backdrop = document.createElement('div');
    backdrop.id = 'pomConfigModal';
    backdrop.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:2000;display:flex;align-items:center;justify-content:center;padding:1rem';
    backdrop.onclick = function(e){ if(e.target===backdrop) backdrop.remove(); };

    var box = document.createElement('div');
    box.style.cssText = 'background:var(--card);border-radius:24px;padding:1.4rem;max-width:320px;width:100%;box-shadow:0 12px 48px rgba(0,0,0,.2)';

    var title = document.createElement('div');
    title.style.cssText = "font-family:var(--font-title);font-size:1rem;font-style:italic;color:var(--rosa);margin-bottom:1.1rem";
    title.textContent = '⚙️ Configurar Pomodoro';
    box.appendChild(title);

    var fields = [
      { key:'work',  label:'🍅 Foco (minutos)',           def: cfg.work  || 25 },
      { key:'short', label:'☕ Descanso corto (minutos)', def: cfg.short || 5  },
      { key:'long',  label:'🛋️ Descanso largo (minutos)', def: cfg.long  || 15 },
    ];
    var inputs = {};
    fields.forEach(function(f) {
      var fieldDiv = document.createElement('div'); fieldDiv.style.marginBottom='.8rem';
      var lbl = document.createElement('label');
      lbl.style.cssText = "display:block;font-size:.68rem;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:var(--muted2);margin-bottom:.3rem;font-family:var(--font-body)";
      lbl.textContent = f.label;
      var inp = document.createElement('input');
      inp.type = 'number'; inp.min = '1'; inp.max = '120';
      inp.value = f.def;
      inp.style.cssText = "width:100%;border:1.5px solid var(--border);border-radius:12px;padding:.5rem .9rem;font-family:var(--font-body);font-size:.9rem;font-weight:700;color:var(--text);background:var(--bg);outline:none;box-sizing:border-box";
      inp.onfocus = function(){ this.style.borderColor='var(--rosa)'; };
      inp.onblur  = function(){ this.style.borderColor='var(--border)'; };
      inputs[f.key] = inp;
      fieldDiv.appendChild(lbl); fieldDiv.appendChild(inp);
      box.appendChild(fieldDiv);
    });

    var btns = document.createElement('div');
    btns.style.cssText = 'display:flex;gap:.6rem;margin-top:1rem;justify-content:flex-end';
    var cancelBtn = document.createElement('button');
    cancelBtn.className = 'modal-btn-cancel'; cancelBtn.textContent = 'Cancelar';
    cancelBtn.onclick = function(){ backdrop.remove(); };
    var saveBtn = document.createElement('button');
    saveBtn.className = 'modal-btn-save'; saveBtn.textContent = 'Guardar 🍅';
    saveBtn.onclick = function() {
      var w = parseInt(inputs.work.value)||25;
      var s = parseInt(inputs.short.value)||5;
      var l = parseInt(inputs.long.value)||15;
      var newCfg = { work: Math.min(120,Math.max(1,w)), short: Math.min(60,Math.max(1,s)), long: Math.min(60,Math.max(1,l)) };
      localStorage.setItem('pom_config', JSON.stringify(newCfg));
      POM_MODES.work  = newCfg.work  * 60;
      POM_MODES.short = newCfg.short * 60;
      POM_MODES.long  = newCfg.long  * 60;
      // Resetear al modo actual con nuevo tiempo
      pomRunning = false; clearInterval(pomTimer);
      pomTimeLeft = POM_MODES[pomMode];
      pomUpdateDisplay();
      backdrop.remove();
    };
    btns.appendChild(cancelBtn); btns.appendChild(saveBtn);
    box.appendChild(btns);
    backdrop.appendChild(box);
    document.body.appendChild(backdrop);
    inputs.work.focus();
  };

  window.pomReset = function() {
    pomRunning = false;
    clearInterval(pomTimer);
    pomTimeLeft = POM_MODES[pomMode];
    pomUpdateDisplay();
  };

  function pomNotify(msg) {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Yuki ⏱️', { body: msg });
    } else {
      alert(msg);
    }
  }

  setTimeout(function(){ pomUpdateDisplay(); pomUpdateSessions(); }, 200);
})();



(function(){
  var histView = 'mensual';
  var histMonthOffset = 0;
  var histWeekOffset = 0;
  var histSelectedDk = null;

  window.histMonthOffset = 0;
  window.histWeekOffset = 0;

  var DIAS_CORTO = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];
  var MESES_HIST = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

  function dkFromDate(d) {
    var y = d.getFullYear();
    var m = String(d.getMonth()+1).padStart(2,'0');
    var day = String(d.getDate()).padStart(2,'0');
    return y+'-'+m+'-'+day;
  }

  function todayDk() { return dkFromDate(new Date()); }

  function dateHasData(dk) {
    if (typeof completions !== 'undefined' && typeof recurringTasks !== 'undefined') {
      if (recurringTasks.some(function(t){ return completions[t.id+'|'+dk]; })) return true;
    }
    if (typeof ejRegistros !== 'undefined' && ejRegistros[dk] && ejRegistros[dk].length > 0) return true;
    if (typeof bellezaRegistros !== 'undefined' && bellezaRegistros[dk] && bellezaRegistros[dk].length > 0) return true;
    if (typeof gratitudData !== 'undefined' && gratitudData[dk] && gratitudData[dk].filter(function(g){return g&&g.trim();}).length > 0) return true;
    if (typeof suenoData !== 'undefined' && suenoData[dk] && (suenoData[dk].dormirse || suenoData[dk].despertar)) return true;
    if (typeof diosData !== 'undefined' && diosData[dk] && (diosData[dk].oracion || diosData[dk].intencion || diosData[dk].ore > 0)) return true;
    if (typeof finMovimientos !== 'undefined' && finMovimientos.some(function(m){ return m.fecha === dk; })) return true;
    if (typeof rutinaAsignaciones !== 'undefined') {
      var keys = Object.keys(rutinaAsignaciones);
      if (keys.some(function(k){ return k.split('|')[0] === dk; })) return true;
    }
    // Transiciones
    try { var td = JSON.parse(localStorage.getItem('trans_data')||'[]'); if(td.some(function(t){return t.fecha===dk;})) return true; } catch(e){}
    // Recuperación
    try { var rr = JSON.parse(localStorage.getItem('recuper_registros')||'{}'); if(rr[dk] && rr[dk].length>0) return true; } catch(e){}
    // Hábitos
    try { var hd = JSON.parse(localStorage.getItem('habitos_data')||'[]'); if(hd.some(function(h){return h.log&&h.log.indexOf(dk)>-1;})) return true; } catch(e){}
    return false;
  }

  window.histSetView = function(v) {
    histView = v;
    document.getElementById('histBtnMensual').classList.toggle('active', v==='mensual');
    document.getElementById('histBtnSemanal').classList.toggle('active', v==='semanal');
    document.getElementById('histViewMensual').style.display = v==='mensual' ? '' : 'none';
    document.getElementById('histViewSemanal').style.display = v==='semanal' ? '' : 'none';
    if (v==='mensual') renderHistCal();
    else renderHistWeek();
  };

  window.renderHistCal = function() {
    var mo = window.histMonthOffset;
    var now = new Date();
    var base = new Date(now.getFullYear(), now.getMonth() + mo, 1);
    var year = base.getFullYear();
    var month = base.getMonth();

    document.getElementById('histCalLabel').textContent = MESES_HIST[month] + ' ' + year;

    var grid = document.getElementById('histCalGrid');
    grid.innerHTML = '';

    // Day of week headers
    DIAS_CORTO.forEach(function(d) {
      var el = document.createElement('div');
      el.className = 'hist-cal-dow';
      el.textContent = d;
      grid.appendChild(el);
    });

    var firstDay = new Date(year, month, 1).getDay();
    var daysInMonth = new Date(year, month+1, 0).getDate();
    var todayStr = todayDk();

    // Empty cells before first day
    for (var i = 0; i < firstDay; i++) {
      var emp = document.createElement('div');
      emp.className = 'hist-cal-day empty-cell';
      grid.appendChild(emp);
    }

    for (var d = 1; d <= daysInMonth; d++) {
      var date = new Date(year, month, d);
      var dk = dkFromDate(date);
      var cell = document.createElement('div');
      var cls = 'hist-cal-day';
      if (dk === todayStr) cls += ' today';
      if (dk === histSelectedDk) cls += ' selected';
      if (dateHasData(dk)) cls += ' has-data';
      cell.className = cls;
      cell.textContent = d;
      cell.dataset.dk = dk;
      cell.onclick = function() { histSelectDay(this.dataset.dk); };
      grid.appendChild(cell);
    }
  };

  window.renderHistWeek = function() {
    var wo = window.histWeekOffset;
    var now = new Date();
    var day = now.getDay();
    var monday = new Date(now);
    monday.setDate(now.getDate() - day + (day===0 ? -6 : 1) + wo*7);

    var dates = [];
    for (var i = 0; i < 7; i++) {
      var d = new Date(monday);
      d.setDate(monday.getDate() + i);
      dates.push(d);
    }

    var fmt = function(d) { return d.getDate() + ' ' + MESES_HIST[d.getMonth()].slice(0,3); };
    document.getElementById('histWeekLabel').textContent = fmt(dates[0]) + ' – ' + fmt(dates[6]);

    var strip = document.getElementById('histWeekStrip');
    strip.innerHTML = '';
    var todayStr = todayDk();

    dates.forEach(function(date) {
      var dk = dkFromDate(date);
      var cell = document.createElement('div');
      var cls = 'hist-week-cell';
      if (dk === todayStr) cls += ' today';
      if (dk === histSelectedDk) cls += ' selected';
      if (dateHasData(dk)) cls += ' has-data';
      cell.className = cls;

      var dow = document.createElement('div');
      dow.className = 'hist-week-cell-dow';
      dow.textContent = DIAS_CORTO[date.getDay()];

      var num = document.createElement('div');
      num.className = 'hist-week-cell-num';
      num.textContent = date.getDate();

      cell.appendChild(dow);
      cell.appendChild(num);
      cell.dataset.dk = dk;
      cell.onclick = function() { histSelectDay(this.dataset.dk); };
      strip.appendChild(cell);
    });
  };

  function histSelectDay(dk) {
    histSelectedDk = dk;
    if (histView === 'mensual') renderHistCal();
    else renderHistWeek();
    renderHistPanel(dk);
  }

  function renderHistPanel(dk) {
    var panel = document.getElementById('histDayPanel');
    panel.innerHTML = '';

    var d = new Date(dk + 'T12:00:00');
    var label = DIAS_CORTO[d.getDay()] + ' ' + d.getDate() + ' de ' + MESES_HIST[d.getMonth()] + ' ' + d.getFullYear();

    var title = document.createElement('div');
    title.className = 'hist-day-panel-title';
    title.innerHTML = '📅 ' + label;
    panel.appendChild(title);

    var hasAnything = false;

    // ── Tareas completadas
    if (typeof completions !== 'undefined' && typeof recurringTasks !== 'undefined') {
      var doneTasks = recurringTasks.filter(function(t){ return completions[t.id+'|'+dk]; });
      if (doneTasks.length > 0) {
        hasAnything = true;
        var sec = document.createElement('div'); sec.className = 'hist-rec-section';
        sec.innerHTML = '<div class="hist-rec-title">✅ Tareas completadas</div>';
        doneTasks.forEach(function(t) {
          var it = document.createElement('div'); it.className = 'hist-rec-item done';
          it.textContent = '✓ ' + t.text; sec.appendChild(it);
        });
        panel.appendChild(sec);
      }
    }

    // ── Rutinas asignadas ese día
    if (typeof rutinaAsignaciones !== 'undefined' && typeof rutinaTemplates !== 'undefined') {
      var rutItems = [];
      Object.keys(rutinaAsignaciones).forEach(function(k) {
        var parts = k.split('|');
        if (parts[0] === dk) {
          var tpl = rutinaTemplates.find(function(r){ return r.id === rutinaAsignaciones[k]; });
          if (tpl) rutItems.push(tpl.emoji + ' ' + tpl.name);
        }
      });
      if (rutItems.length > 0) {
        hasAnything = true;
        var sec = document.createElement('div'); sec.className = 'hist-rec-section';
        sec.innerHTML = '<div class="hist-rec-title">🌸 Rutinas del día</div>';
        rutItems.forEach(function(r) {
          var it = document.createElement('div'); it.className = 'hist-rec-item';
          it.textContent = r; sec.appendChild(it);
        });
        panel.appendChild(sec);
      }
    }

    // ── Ejercicio
    if (typeof ejRegistros !== 'undefined' && ejRegistros[dk] && ejRegistros[dk].length > 0) {
      hasAnything = true;
      var sec = document.createElement('div'); sec.className = 'hist-rec-section';
      sec.innerHTML = '<div class="hist-rec-title">🏃 Ejercicio</div>';
      ejRegistros[dk].forEach(function(reg) {
        var tpl = typeof ejTemplates !== 'undefined' && ejTemplates.find(function(t){ return t.id===reg.templateId; });
        if (!tpl) return;
        var it = document.createElement('div'); it.className = 'hist-rec-item';
        it.textContent = tpl.emoji + ' ' + tpl.name + ' · ' + reg.completedSteps.length + '/' + tpl.pasos.length + ' ejercicios';
        sec.appendChild(it);
      });
      panel.appendChild(sec);
    }

    // ── Belleza / Selfcare
    if (typeof bellezaRegistros !== 'undefined' && bellezaRegistros[dk] && bellezaRegistros[dk].length > 0) {
      hasAnything = true;
      var sec = document.createElement('div'); sec.className = 'hist-rec-section';
      sec.innerHTML = '<div class="hist-rec-title">✨ Selfcare & Belleza</div>';
      bellezaRegistros[dk].forEach(function(reg) {
        var tpl = typeof bellezaTemplates !== 'undefined' && bellezaTemplates.find(function(t){ return t.id===reg.templateId; });
        if (!tpl) return;
        var it = document.createElement('div'); it.className = 'hist-rec-item';
        it.textContent = tpl.emoji + ' ' + tpl.name + ' · ' + reg.completedSteps.length + '/' + tpl.pasos.length + ' pasos';
        sec.appendChild(it);
      });
      panel.appendChild(sec);
    }

    // ── Fe / Espiritualidad
    if (typeof diosData !== 'undefined' && diosData[dk]) {
      var dd = diosData[dk];
      if (dd.oracion || dd.intencion || dd.ore > 0) {
        hasAnything = true;
        var sec = document.createElement('div'); sec.className = 'hist-rec-section';
        sec.innerHTML = '<div class="hist-rec-title">🙏 Fe & Espiritualidad</div>';
        if (dd.ore > 0) {
          var it = document.createElement('div'); it.className = 'hist-rec-item';
          it.textContent = '🙏 Oré ' + dd.ore + ' vez' + (dd.ore>1?'es':'') + ' ese día';
          sec.appendChild(it);
        }
        if (dd.oracion) {
          var it = document.createElement('div'); it.className = 'hist-rec-item';
          it.innerHTML = '<div><div class="hist-rec-meta">Oración / reflexión</div>' + dd.oracion + '</div>';
          sec.appendChild(it);
        }
        if (dd.intencion) {
          var it = document.createElement('div'); it.className = 'hist-rec-item';
          it.innerHTML = '<div><div class="hist-rec-meta">Intención / petición</div>' + dd.intencion + '</div>';
          sec.appendChild(it);
        }
        panel.appendChild(sec);
      }
    }

    // ── Agradecimiento / Journal
    if (typeof gratitudData !== 'undefined' && gratitudData[dk]) {
      var gr = gratitudData[dk].filter(function(g){ return g && g.trim(); });
      if (gr.length > 0) {
        hasAnything = true;
        var sec = document.createElement('div'); sec.className = 'hist-rec-section';
        sec.innerHTML = '<div class="hist-rec-title">🌸 Agradecimiento del día</div>';
        gr.forEach(function(g) {
          var it = document.createElement('div'); it.className = 'hist-rec-item';
          it.textContent = '✨ ' + g; sec.appendChild(it);
        });
        panel.appendChild(sec);
      }
    }

    // ── Sueño
    if (typeof suenoData !== 'undefined' && suenoData[dk]) {
      var sd = suenoData[dk];
      if (sd.dormirse || sd.despertar) {
        hasAnything = true;
        var sec = document.createElement('div'); sec.className = 'hist-rec-section';
        sec.innerHTML = '<div class="hist-rec-title">🌙 Sueño</div>';
        var it = document.createElement('div'); it.className = 'hist-rec-item';
        var txt = '';
        if (sd.dormirse) txt += '😴 Me dormí a las ' + sd.dormirse;
        if (sd.despertar) txt += (txt?' · ':'') + '☀️ Desperté a las ' + sd.despertar;
        if (sd.calidad) txt += ' · ' + sd.calidad;
        it.textContent = txt; sec.appendChild(it);
        panel.appendChild(sec);
      }
    }

    // ── Finanzas
    if (typeof finMovimientos !== 'undefined') {
      var movs = finMovimientos.filter(function(m){ return m.fecha === dk; });
      if (movs.length > 0) {
        hasAnything = true;
        var sec = document.createElement('div'); sec.className = 'hist-rec-section';
        sec.innerHTML = '<div class="hist-rec-title">💸 Finanzas</div>';
        movs.forEach(function(m) {
          var cat = typeof finCategorias !== 'undefined' && finCategorias.find(function(c){ return c.id===m.categoriaId; });
          var it = document.createElement('div'); it.className = 'hist-rec-item';
          var signo = m.tipo === 'ingreso' ? '+' : '-';
          var color = m.tipo === 'ingreso' ? 'var(--verde)' : 'var(--rosa)';
          it.innerHTML = '<span style="color:'+color+';font-weight:800">'+signo+'$'+Number(m.monto).toFixed(2)+'</span>'
            + '<span>' + (m.desc || '') + (cat ? ' <span style="color:var(--muted);font-size:.7rem">· '+cat.nombre+'</span>' : '') + '</span>';
          sec.appendChild(it);
        });
        panel.appendChild(sec);
      }
    }

    // ── Salud (logros/síntomas si los hay en mensData)
    if (typeof mensData !== 'undefined' && mensData[dk]) {
      var md = mensData[dk];
      if (md.fase || (md.sintomas && md.sintomas.length > 0)) {
        hasAnything = true;
        var sec = document.createElement('div'); sec.className = 'hist-rec-section';
        sec.innerHTML = '<div class="hist-rec-title">🍏 Salud</div>';
        if (md.fase) {
          var it = document.createElement('div'); it.className = 'hist-rec-item';
          it.textContent = '📍 Fase: ' + md.fase; sec.appendChild(it);
        }
        if (md.sintomas && md.sintomas.length > 0) {
          var it2 = document.createElement('div'); it2.className = 'hist-rec-item';
          it2.textContent = '🩺 ' + md.sintomas.join(', '); sec.appendChild(it2);
        }
        panel.appendChild(sec);
      }
    }

    // ── Transiciones del día
    try {
      var transData = JSON.parse(localStorage.getItem('trans_data') || '[]');
      var transDk = transData.filter(function(t){ return t.fecha === dk; });
      if (transDk.length > 0) {
        hasAnything = true;
        var sec = document.createElement('div'); sec.className = 'hist-rec-section';
        sec.innerHTML = '<div class="hist-rec-title">🔄 Transiciones</div>';
        transDk.forEach(function(t) {
          var it = document.createElement('div'); it.className = 'hist-rec-item';
          it.textContent = t.actual + ' → ' + t.siguiente + ' (' + t.hora + ')';
          sec.appendChild(it);
        });
        panel.appendChild(sec);
      }
    } catch(e) {}

    // ── Eventos preparados ese día
    try {
      var eventosData = JSON.parse(localStorage.getItem('eventos_prep') || '[]');
      var eventosDk = eventosData.filter(function(e){ return e.fecha && e.fecha.slice(0,10) === dk; });
      if (eventosDk.length > 0) {
        hasAnything = true;
        var sec = document.createElement('div'); sec.className = 'hist-rec-section';
        sec.innerHTML = '<div class="hist-rec-title">📅 Eventos</div>';
        eventosDk.forEach(function(e) {
          var it = document.createElement('div'); it.className = 'hist-rec-item';
          it.textContent = '📅 ' + e.nombre; sec.appendChild(it);
        });
        panel.appendChild(sec);
      }
    } catch(e) {}

    // ── Modo Recuperación — registros del día
    try {
      var recuperRegs = JSON.parse(localStorage.getItem('recuper_registros') || '{}');
      var regsHoy = recuperRegs[dk];
      if (regsHoy && regsHoy.length > 0) {
        hasAnything = true;
        var sec = document.createElement('div'); sec.className = 'hist-rec-section';
        sec.innerHTML = '<div class="hist-rec-title">🌿 Modo Recuperación</div>';
        regsHoy.forEach(function(r) {
          var it = document.createElement('div'); it.className = 'hist-rec-item';
          var txt = '';
          if (r.que) txt += r.que;
          if (r.ayudo) txt += (txt ? ' · Ayudó: ' : 'Ayudó: ') + r.ayudo;
          it.textContent = txt; sec.appendChild(it);
        });
        panel.appendChild(sec);
      }
    } catch(e) {}

    // ── Hábitos completados ese día
    try {
      var habitosData = JSON.parse(localStorage.getItem('habitos_data') || '[]');
      var habDone = habitosData.filter(function(h){
        return h.log && h.log.indexOf(dk) > -1;
      });
      if (habDone.length > 0) {
        hasAnything = true;
        var sec = document.createElement('div'); sec.className = 'hist-rec-section';
        sec.innerHTML = '<div class="hist-rec-title">🌱 Hábitos</div>';
        habDone.forEach(function(h) {
          var it = document.createElement('div'); it.className = 'hist-rec-item done';
          it.textContent = '✓ ' + (h.emoji||'') + ' ' + h.nombre; sec.appendChild(it);
        });
        panel.appendChild(sec);
      }
    } catch(e) {}

    // ── Comidas
    try {
      var fStateHist = JSON.parse(localStorage.getItem('food_state') || '{}');
      var qualityTxt = { '1':'😬 Poco saludable', '2':'😐 Regular', '3':'🙂 Bien', '4':'😋 Muy saludable' };
      var mealDefs = [
        { id:'desayuno', icon:'🌅', label:'Desayuno' },
        { id:'almuerzo', icon:'☀️', label:'Almuerzo' },
        { id:'cena',     icon:'🌙', label:'Cena' },
        { id:'snack',    icon:'🍎', label:'Snack' },
      ];
      var comidassec = null;
      mealDefs.forEach(function(meal) {
        var data = fStateHist['f_' + dk + '_' + meal.id];
        if (!data || !data.eaten) return;
        if (!comidassec) {
          comidassec = document.createElement('div');
          comidassec.className = 'hist-rec-section';
          comidassec.innerHTML = '<div class="hist-rec-title">🍽️ Comidas</div>';
        }
        var it = document.createElement('div');
        it.className = 'hist-rec-item';
        var html = '<span style="font-weight:800">' + meal.icon + ' ' + meal.label + '</span>';
        if (data.hora)    html += ' <span style="color:var(--muted);font-size:.75rem">· ' + data.hora + '</span>';
        if (data.texto)   html += '<div style="margin-top:.15rem;font-size:.82rem">' + data.texto + '</div>';
        if (data.quality) html += '<div style="font-size:.72rem;color:var(--muted);margin-top:.1rem">' + (qualityTxt[data.quality]||'') + '</div>';
        it.innerHTML = html;
        comidassec.appendChild(it);
      });
      if (comidassec) { hasAnything = true; panel.appendChild(comidassec); }
    } catch(e) {}

    if (!hasAnything) {
      var empty = document.createElement('div');
      empty.className = 'hist-no-data';
      empty.textContent = 'Sin registros para este día 🌙';
      panel.appendChild(empty);
    }
  }
  window._initHistorial = function() {
    window.histMonthOffset = 0;
    window.histWeekOffset = 0;
    renderHistCal();
  };

  // Hook into nav clicks to init when page becomes active
  var _origNav = window.showPage;
  window.showPage = function(pageId) {
    if (_origNav) _origNav(pageId);
    if (pageId === 'page-historial') {
      setTimeout(function(){ renderHistCal(); renderHistWeek(); }, 50);
    }
  };

  // Also render on DOMContentLoaded if already on this page
  document.addEventListener('DOMContentLoaded', function() {
    renderHistCal();
    renderHistWeek();
  });
  setTimeout(function(){ renderHistCal(); renderHistWeek(); }, 300);

})();



(function(){
  var BD_TAGS = [
    { id:'idea',       label:'💡 Idea'       },
    { id:'pendiente',  label:'📌 Pendiente'  },
    { id:'sentimiento',label:'💭 Sentimiento' },
    { id:'random',     label:'🌀 Random'     },
    { id:'sueno',      label:'🌙 Sueño'      },
  ];

  var bdNotes = [];
  var bdSelectedTag = 'random';
  var bdFilterTag = 'all';

  var MESES_BD = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];

  function bdSave() {
    try { localStorage.setItem('braindump_notes', JSON.stringify(bdNotes)); } catch(e){}
    if (window.cloudSave) window.cloudSave('braindump_notes', bdNotes);
  }

  function bdLoad() {
    if (window._braindumpNotes) { bdNotes = window._braindumpNotes; return; }
    try { bdNotes = JSON.parse(localStorage.getItem('braindump_notes') || '[]'); } catch(e){ bdNotes = []; }
  }

  function bdFmtDate(ts) {
    var d = new Date(ts);
    return d.getDate() + ' ' + MESES_BD[d.getMonth()] + ' · ' +
      String(d.getHours()).padStart(2,'0') + ':' + String(d.getMinutes()).padStart(2,'0');
  }

  function bdRenderTags() {
    var row = document.getElementById('bdTagRow');
    if (!row) return;
    row.innerHTML = '';
    BD_TAGS.forEach(function(t) {
      var btn = document.createElement('button');
      btn.className = 'braindump-tag-btn' + (t.id === bdSelectedTag ? ' selected' : '');
      btn.textContent = t.label;
      btn.onclick = function() { bdSelectedTag = t.id; bdRenderTags(); };
      row.appendChild(btn);
    });
  }

  function bdRenderFilters() {
    var row = document.getElementById('bdFilterRow');
    if (!row) return;
    row.innerHTML = '<span class="braindump-filter-label">Filtrar:</span>';
    var allBtn = document.createElement('button');
    allBtn.className = 'braindump-filter-btn' + (bdFilterTag === 'all' ? ' active' : '');
    allBtn.textContent = '✨ Todas';
    allBtn.onclick = function() { bdFilterTag = 'all'; bdRenderFilters(); bdRenderGrid(); };
    row.appendChild(allBtn);
    BD_TAGS.forEach(function(t) {
      var btn = document.createElement('button');
      btn.className = 'braindump-filter-btn' + (bdFilterTag === t.id ? ' active' : '');
      btn.textContent = t.label;
      btn.onclick = function() { bdFilterTag = t.id; bdRenderFilters(); bdRenderGrid(); };
      row.appendChild(btn);
    });
  }

  function bdRenderGrid() {
    var grid = document.getElementById('bdGrid');
    if (!grid) return;
    grid.innerHTML = '';
    var filtered = bdFilterTag === 'all' ? bdNotes : bdNotes.filter(function(n){ return n.tag === bdFilterTag; });
    // Newest first
    var sorted = filtered.slice().reverse();
    if (sorted.length === 0) {
      var emp = document.createElement('div');
      emp.className = 'braindump-empty';
      emp.textContent = bdFilterTag === 'all' ? 'Todavía no hay nada aquí… ¡suelta lo que tengas! 🌀' : 'Sin notas con esta etiqueta 🌸';
      grid.appendChild(emp);
      return;
    }
    sorted.forEach(function(note) {
      var tagObj = BD_TAGS.find(function(t){ return t.id === note.tag; }) || BD_TAGS[3];
      var card = document.createElement('div');
      card.className = 'braindump-card';

      var tagEl = document.createElement('div');
      tagEl.className = 'braindump-card-tag';
      tagEl.textContent = tagObj.label;

      var textEl = document.createElement('div');
      textEl.className = 'braindump-card-text';
      textEl.textContent = note.text;

      var dateEl = document.createElement('div');
      dateEl.className = 'braindump-card-date';
      dateEl.textContent = bdFmtDate(note.ts);

      var delBtn = document.createElement('button');
      delBtn.className = 'braindump-card-del';
      delBtn.textContent = '✕';
      delBtn.title = 'Borrar nota';
      delBtn.onclick = function() {
        kittyConfirm('¿Borrar esta nota?', function() {
          bdNotes = bdNotes.filter(function(n){ return n.ts !== note.ts; });
          bdSave();
          bdRenderGrid();
          bdRenderFilters();
        });
      };

      card.appendChild(delBtn);
      card.appendChild(tagEl);
      card.appendChild(textEl);
      card.appendChild(dateEl);
      grid.appendChild(card);
    });
  }

  window.bdAddNote = function() {
    var ta = document.getElementById('bdTextarea');
    if (!ta) return;
    var text = ta.value.trim();
    if (!text) { ta.focus(); return; }
    bdNotes.push({ ts: Date.now(), text: text, tag: bdSelectedTag });
    bdSave();
    ta.value = '';
    bdRenderGrid();
    bdRenderFilters();
  };

  // Enter + Ctrl/Cmd to submit
  document.addEventListener('DOMContentLoaded', function() {
    var ta = document.getElementById('bdTextarea');
    if (ta) {
      ta.addEventListener('keydown', function(e) {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { window.bdAddNote(); }
      });
    }
  });

  // Hook cloud sync
  var _origSyncBD = window.syncFromCloud;
  window.syncFromCloud = function() {
    if (_origSyncBD) _origSyncBD();
    // Braindump
    if (window._braindumpNotes) { bdNotes = window._braindumpNotes; bdRenderGrid(); }
    // Mood tracker
    if (window._moodData && typeof renderMoodWeek === 'function') renderMoodWeek();
    // Metas
    if (window._metasData && typeof renderMetas === 'function') renderMetas();
    // Vision Board
    if (window._vbItems && typeof vbRender === 'function') vbRender();
    // Listas rápidas
    if (window._qlLists && typeof renderQlLists === 'function') renderQlLists();
    // Watchlist
    if (window._wlItems && typeof renderWlGrid === 'function') renderWlGrid();
  };

  function bdInit() {
    bdLoad();
    bdRenderTags();
    bdRenderFilters();
    bdRenderGrid();
  }

  // Init
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bdInit);
  } else {
    setTimeout(bdInit, 100);
  }
})();



(function(){
  var PL_KEY  = 'yuki_biblioteca_playlists';
  var DOP_KEY = 'yuki_biblioteca_dopamina';
  var playlists = [], dopamina = [];
  var editingPlId = null, editingDopId = null;
  var activePlCat = 'todas', activeDopCat = 'todas';

  function loadPl()  { try { playlists = JSON.parse(localStorage.getItem(PL_KEY))  || []; } catch(e){ playlists=[]; } }
  function loadDop() { try { dopamina  = JSON.parse(localStorage.getItem(DOP_KEY)) || []; } catch(e){ dopamina=[]; } }
  function savePl()  { localStorage.setItem(PL_KEY,  JSON.stringify(playlists));  if(window.cloudSave) window.cloudSave(PL_KEY,  playlists); }
  function saveDop() { localStorage.setItem(DOP_KEY, JSON.stringify(dopamina));   if(window.cloudSave) window.cloudSave(DOP_KEY, dopamina); }

  // ── Tabs
  window.bibSwitchTab = function(tab, btn) {
    document.querySelectorAll('.bib-tab').forEach(function(b){ b.classList.remove('active'); });
    btn.classList.add('active');
    document.getElementById('bibPanelPlaylists').style.display = tab === 'playlists' ? '' : 'none';
    document.getElementById('bibPanelDopamina').style.display  = tab === 'dopamina'  ? '' : 'none';
  };

  // ── Mood picker
  window.bibPickMood = function(el, mood) {
    document.querySelectorAll('#bibPlMoodPicker .bib-mood-opt').forEach(function(o){ o.classList.remove('selected'); });
    el.classList.add('selected');
    document.getElementById('bibPlMood').value = mood;
  };

  // ── Render cats
  function renderPlCats() {
    var cats = ['todas'].concat([...new Set(playlists.map(function(p){ return p.cat; }).filter(Boolean))]);
    var el = document.getElementById('bibPlaylistCats');
    el.innerHTML = cats.map(function(c){
      return '<span class="bib-cat-chip'+(c===activePlCat?' active':'')+'" onclick="bibFilterPl(\''+c+'\')">'+c+'</span>';
    }).join('');
  }
  function renderDopCats() {
    var cats = ['todas'].concat([...new Set(dopamina.map(function(d){ return d.cat; }).filter(Boolean))]);
    var el = document.getElementById('bibDopCats');
    el.innerHTML = cats.map(function(c){
      return '<span class="bib-cat-chip'+(c===activeDopCat?' active':'')+'" onclick="bibFilterDop(\''+c+'\')">'+c+'</span>';
    }).join('');
  }

  window.bibFilterPl  = function(cat){ activePlCat  = cat; renderPlaylists(); };
  window.bibFilterDop = function(cat){ activeDopCat = cat; renderDopamina(); };

  // ── Render playlists
  function renderPlaylists() {
    loadPl();
    renderPlCats();
    var grid  = document.getElementById('bibPlaylistGrid');
    var empty = document.getElementById('bibPlaylistEmpty');
    Array.from(grid.querySelectorAll('.bib-card')).forEach(function(el){ el.remove(); });
    var filtered = activePlCat === 'todas' ? playlists : playlists.filter(function(p){ return p.cat === activePlCat; });
    if (filtered.length === 0) { empty.style.display='flex'; return; }
    empty.style.display = 'none';
    filtered.forEach(function(p) {
      var card = document.createElement('div');
      card.className = 'bib-card';
      card.innerHTML =
        '<div class="bib-card-top">'+
          (p.mood ? '<span class="bib-card-mood">'+p.mood+'</span>' : '')+
          '<span class="bib-card-name">'+p.nombre+'</span>'+
          '<div class="bib-card-btns">'+
            '<button class="bib-card-btn" onclick="bibOpenPlaylistModal(\''+p.id+'\')">✏️</button>'+
            '<button class="bib-card-btn" onclick="bibDeletePl(\''+p.id+'\')">🗑️</button>'+
          '</div>'+
        '</div>'+
        (p.cat ? '<span class="bib-card-cat">'+p.cat+'</span>' : '')+
        (p.notas ? '<div class="bib-card-notas">'+p.notas+'</div>' : '')+
        (p.link ? '<a class="bib-card-link" href="'+p.link+'" target="_blank" rel="noopener">🎵 abrir playlist</a>' : '');
      grid.appendChild(card);
    });
  }

  // ── Render dopamina
  function renderDopamina() {
    loadDop();
    renderDopCats();
    var grid  = document.getElementById('bibDopGrid');
    var empty = document.getElementById('bibDopEmpty');
    Array.from(grid.querySelectorAll('.bib-card')).forEach(function(el){ el.remove(); });
    var filtered = activeDopCat === 'todas' ? dopamina : dopamina.filter(function(d){ return d.cat === activeDopCat; });
    if (filtered.length === 0) { empty.style.display='flex'; return; }
    empty.style.display = 'none';
    filtered.forEach(function(d) {
      var card = document.createElement('div');
      card.className = 'bib-card dopamina';
      card.innerHTML =
        '<div class="bib-card-top">'+
          '<span class="bib-card-name">⚡ '+d.nombre+'</span>'+
          '<div class="bib-card-btns">'+
            '<button class="bib-card-btn" onclick="bibOpenDopModal(\''+d.id+'\')">✏️</button>'+
            '<button class="bib-card-btn" onclick="bibDeleteDop(\''+d.id+'\')">🗑️</button>'+
          '</div>'+
        '</div>'+
        (d.cat ? '<span class="bib-card-cat">'+d.cat+'</span>' : '')+
        (d.notas ? '<div class="bib-card-notas">'+d.notas+'</div>' : '')+
        (d.link ? '<a class="bib-card-link" href="'+d.link+'" target="_blank" rel="noopener">🔗 abrir</a>' : '');
      grid.appendChild(card);
    });
  }

  // ── Playlist modal
  window.bibOpenPlaylistModal = function(id) {
    loadPl();
    editingPlId = id || null;
    var p = id ? playlists.find(function(x){ return x.id===id; }) : null;
    document.getElementById('bibPlaylistModalTitle').textContent = p ? 'Editar playlist' : 'Nueva playlist';
    document.getElementById('bibPlNombre').value = p ? p.nombre : '';
    document.getElementById('bibPlCat').value    = p ? (p.cat||'') : '';
    document.getElementById('bibPlLink').value   = p ? (p.link||'') : '';
    document.getElementById('bibPlNotas').value  = p ? (p.notas||'') : '';
    document.getElementById('bibPlMood').value   = p ? (p.mood||'') : '';
    document.querySelectorAll('#bibPlMoodPicker .bib-mood-opt').forEach(function(o){
      o.classList.toggle('selected', o.textContent === (p ? p.mood : ''));
    });
    document.getElementById('bibPlaylistModalBackdrop').style.display = 'flex';
  };
  window.bibClosePlaylistModal = function(){ document.getElementById('bibPlaylistModalBackdrop').style.display='none'; };

  window.bibSavePlaylist = function() {
    var nombre = document.getElementById('bibPlNombre').value.trim();
    if (!nombre) { alert('El nombre es obligatorio 🎵'); return; }
    var p = {
      id: editingPlId || ('pl_'+Date.now()),
      nombre: nombre,
      cat:   document.getElementById('bibPlCat').value.trim(),
      link:  document.getElementById('bibPlLink').value.trim(),
      notas: document.getElementById('bibPlNotas').value.trim(),
      mood:  document.getElementById('bibPlMood').value,
    };
    if (editingPlId) {
      var idx = playlists.findIndex(function(x){ return x.id===editingPlId; });
      if (idx>=0) playlists[idx]=p;
    } else { playlists.push(p); }
    savePl(); bibClosePlaylistModal(); renderPlaylists();
  };

  window.bibDeletePl = function(id) {
    if (!confirm('¿Eliminar esta playlist?')) return;
    playlists = playlists.filter(function(p){ return p.id!==id; });
    savePl(); renderPlaylists();
  };

  // ── Dopamina modal
  window.bibOpenDopModal = function(id) {
    loadDop();
    editingDopId = id || null;
    var d = id ? dopamina.find(function(x){ return x.id===id; }) : null;
    document.getElementById('bibDopModalTitle').textContent = d ? 'Editar entrada' : 'Nueva entrada';
    document.getElementById('bibDopNombre').value = d ? d.nombre : '';
    document.getElementById('bibDopCat').value    = d ? (d.cat||'') : '';
    document.getElementById('bibDopLink').value   = d ? (d.link||'') : '';
    document.getElementById('bibDopNotas').value  = d ? (d.notas||'') : '';
    document.getElementById('bibDopModalBackdrop').style.display = 'flex';
  };
  window.bibCloseDopModal = function(){ document.getElementById('bibDopModalBackdrop').style.display='none'; };

  window.bibSaveDop = function() {
    var nombre = document.getElementById('bibDopNombre').value.trim();
    if (!nombre) { alert('El nombre es obligatorio ⚡'); return; }
    var d = {
      id: editingDopId || ('dop_'+Date.now()),
      nombre: nombre,
      cat:   document.getElementById('bibDopCat').value.trim(),
      link:  document.getElementById('bibDopLink').value.trim(),
      notas: document.getElementById('bibDopNotas').value.trim(),
    };
    if (editingDopId) {
      var idx = dopamina.findIndex(function(x){ return x.id===editingDopId; });
      if (idx>=0) dopamina[idx]=d;
    } else { dopamina.push(d); }
    saveDop(); bibCloseDopModal(); renderDopamina();
  };

  window.bibDeleteDop = function(id) {
    if (!confirm('¿Eliminar esta entrada?')) return;
    dopamina = dopamina.filter(function(d){ return d.id!==id; });
    saveDop(); renderDopamina();
  };

  // Init
  renderPlaylists();
  renderDopamina();

  if (window._watchCloud) {
    window._watchCloud(PL_KEY,  function(val){ playlists = val||[]; renderPlaylists(); });
    window._watchCloud(DOP_KEY, function(val){ dopamina  = val||[]; renderDopamina(); });
  }
})();



(function(){
  // ══ LISTAS RÁPIDAS ══
  var qlLists = [];
  var WL_CATS = [
    {id:'libro',  label:'📚 Libros'},
    {id:'serie',  label:'📺 Series'},
    {id:'anime',  label:'🌸 Animes'},
    {id:'kdrama', label:'🇰🇷 Kdramas'},
    {id:'pelicula',label:'🎬 Películas'},
  ];
  var WL_STATUSES = [
    {id:'pendiente', label:'⏳ Pendiente'},
    {id:'viendo',    label:'👀 Viendo/Leyendo'},
    {id:'terminado', label:'✅ Terminado'},
    {id:'abandonado',label:'🚫 Abandonado'},
  ];
  var wlItems = [];
  var wlCatFilter = 'all';
  var wlClasFilter = 'all';
  var wlClasificaciones = [];
  var wlStatusFilter = 'all';
  var listasTab = 'rapidas';

  function qlSave(){ try{localStorage.setItem('ql_lists',JSON.stringify(qlLists));}catch(e){} if(window.cloudSave) window.cloudSave('ql_lists',qlLists); }
  function qlLoad(){ if(window._qlLists){qlLists=window._qlLists;} else { try{qlLists=JSON.parse(localStorage.getItem('ql_lists')||'[]');}catch(e){qlLists=[];} } }
  function wlSave(){ try{localStorage.setItem('wl_items',JSON.stringify(wlItems));}catch(e){} if(window.cloudSave) window.cloudSave('wl_items',wlItems); }
  function wlLoad(){ if(window._wlItems){wlItems=window._wlItems;} else { try{wlItems=JSON.parse(localStorage.getItem('wl_items')||'[]');}catch(e){wlItems=[];} } }
  function wlClaSave(){ try{localStorage.setItem("wl_clas",JSON.stringify(wlClasificaciones));}catch(e){} if(window.cloudSave) window.cloudSave("wl_clas",wlClasificaciones); }
  function wlClaLoad(){ if(window._wlClas){wlClasificaciones=window._wlClas;} else { try{wlClasificaciones=JSON.parse(localStorage.getItem("wl_clas")||"[]");}catch(e){wlClasificaciones=[];} } }

  window.listasSetTab = function(tab) {
    listasTab = tab;
    document.querySelectorAll('.lista-tab').forEach(function(b,i){ b.classList.toggle('active',['rapidas','watchlist','wishlist'][i]===tab); });
    document.getElementById('listasTabRapidas').style.display = tab==='rapidas'?'':'none';
    document.getElementById('listasTabWatchlist').style.display = tab==='watchlist'?'':'none';
    document.getElementById('listasTabWishlist').style.display   = tab==='wishlist'  ?'':'none';
    if(tab==="watchlist"){ renderWlCatTabs(); renderWlStatusFilter(); renderWlClasFilter(); renderWlGrid(); }
    if(tab==='wishlist') { wshRenderFilters(); wshRenderGrid(); }
  };

  // ── Render listas rápidas
  function renderQlLists() {
    var container = document.getElementById('qlListsContainer'); if(!container) return;
    container.innerHTML='';
    if(qlLists.length===0){
      container.innerHTML='<div style="color:var(--muted2);font-size:.8rem;font-weight:600;text-align:center;padding:1.5rem 0">Crea tu primera lista rápida ⚡</div>';
      return;
    }
    qlLists.forEach(function(lst,lIdx){
      var card=document.createElement('div'); card.className='ql-list-card';
      // Header
      var hdrDiv = document.createElement('div'); hdrDiv.className='ql-list-header';
      var emojiSpan = document.createElement('span'); emojiSpan.style.fontSize='1.1rem'; emojiSpan.textContent=lst.emoji;
      var nameSpan = document.createElement('span'); nameSpan.className='ql-list-title'; nameSpan.textContent=lst.name;
      var actDiv = document.createElement('div'); actDiv.className='ql-list-actions';
      var editB = document.createElement('button'); editB.className='ql-action-btn'; editB.textContent='✏️';
      editB.onclick = (function(idx){ return function(){ openQlModal(idx); }; })(lIdx);
      var delB = document.createElement('button'); delB.className='ql-action-btn'; delB.textContent='🗑️';
      delB.onclick = (function(idx){ return function(){ qlDeleteList(idx); }; })(lIdx);
      actDiv.appendChild(editB); actDiv.appendChild(delB);
      hdrDiv.appendChild(emojiSpan); hdrDiv.appendChild(nameSpan); hdrDiv.appendChild(actDiv);
      card.appendChild(hdrDiv);

      // Items
      var itemsDiv = document.createElement('div'); itemsDiv.className='ql-items';
      (lst.items||[]).forEach(function(it,iIdx){
        var row = document.createElement('div');
        row.className = 'ql-item-row' + (it.done ? ' done' : '');
        var chk = document.createElement('div'); chk.className='ql-item-check'; chk.textContent = it.done ? '✓' : '';
        var txt = document.createElement('span'); txt.className='ql-item-text'; txt.textContent = it.text;
        var delI = document.createElement('button'); delI.className='ql-item-del'; delI.textContent='✕';
        delI.onclick = (function(l,i){ return function(e){ e.stopPropagation(); qlDeleteItem(l,i); }; })(lIdx,iIdx);
        row.onclick = (function(l,i){ return function(){ qlToggleItem(l,i); }; })(lIdx,iIdx);
        row.appendChild(chk); row.appendChild(txt); row.appendChild(delI);
        itemsDiv.appendChild(row);
      });
      card.appendChild(itemsDiv);

      // Add row
      var addRowDiv = document.createElement('div'); addRowDiv.className='ql-add-row';
      var addInp = document.createElement('input'); addInp.className='ql-add-input';
      addInp.id = 'qlInput_'+lIdx; addInp.placeholder='Agregar ítem…';
      addInp.onkeydown = (function(idx){ return function(e){ if(e.key==='Enter') window.qlAddItem(idx); }; })(lIdx);
      var addBtn = document.createElement('button'); addBtn.className='ql-add-btn'; addBtn.textContent='＋';
      addBtn.onclick = (function(idx){ return function(){ window.qlAddItem(idx); }; })(lIdx);
      addRowDiv.appendChild(addInp); addRowDiv.appendChild(addBtn);
      card.appendChild(addRowDiv);
      container.appendChild(card);
    });
  }

  window.qlInputKey=function(e,lIdx){ if(e.key==='Enter') window.qlAddItem(lIdx); };
  window.qlToggleItem=function(lIdx,iIdx){ qlLists[lIdx].items[iIdx].done=!qlLists[lIdx].items[iIdx].done; qlSave(); renderQlLists(); };
  window.qlDeleteItem=function(lIdx,iIdx){ qlLists[lIdx].items.splice(iIdx,1); qlSave(); renderQlLists(); };
  window.qlDeleteList=function(lIdx){ kittyConfirm('¿Eliminar la lista "' + qlLists[lIdx].name + '"?', function(){ qlLists.splice(lIdx,1); qlSave(); renderQlLists(); }); };
  window.qlAddItem=function(lIdx){ var inp=document.getElementById('qlInput_'+lIdx); if(!inp||!inp.value.trim()) return; qlLists[lIdx].items.push({text:inp.value.trim(),done:false}); inp.value=''; qlSave(); renderQlLists(); };

  var QL_EMOJIS=['📋','🛒','📌','💡','🎯','🌸','📦','🧴','🍕','✈️'];
  window.openQlModal=function(lIdx){
    var old=document.getElementById('qlModal'); if(old) old.remove();
    var existing=lIdx!==null?qlLists[lIdx]:null;
    var emoji=existing?existing.emoji:'📋'; var name=existing?existing.name:'';
    var backdrop=document.createElement('div'); backdrop.className='meta-modal-backdrop'; backdrop.id='qlModal';
    backdrop.onclick=function(e){if(e.target===backdrop)backdrop.remove();};
    var box=document.createElement('div'); box.className='meta-modal-box';
    var emojiOpts=QL_EMOJIS.map(function(e){return '<span class="mood-emoji-opt'+(e===emoji?' selected':'')+'" data-e="'+e+'" style="font-size:1.3rem">'+e+'</span>';}).join('');
    box.innerHTML='<div class="mood-modal-title">'+(existing?'Editar':'Nueva')+' lista</div>'
      +'<div class="mood-emoji-picker" id="qlEmojiPicker">'+emojiOpts+'</div>'
      +'<div class="modal-field"><label class="modal-label">Nombre</label>'
      +'<input class="modal-input" id="qlNameInput" placeholder="Ej: Lista del súper…" value="'+name.replace(/"/g,'&quot;')+'"></div>'
      +'<div class="modal-btns" style="margin-top:.8rem">'
      +'<button class="modal-btn-cancel" onclick="document.getElementById(&quot;qlModal&quot;).remove()">Cancelar</button>'
      +'<button class="modal-btn-save" id="qlSaveBtn">Guardar</button></div>';
    backdrop.appendChild(box); document.body.appendChild(backdrop);
    var selEmoji=emoji;
    backdrop.querySelectorAll('.mood-emoji-opt').forEach(function(o){
      o.onclick=function(){backdrop.querySelectorAll('.mood-emoji-opt').forEach(function(x){x.classList.remove('selected');});o.classList.add('selected');selEmoji=o.dataset.e;};
    });
    document.getElementById('qlSaveBtn').onclick=function(){
      var n=document.getElementById('qlNameInput').value.trim(); if(!n){document.getElementById('qlNameInput').focus();return;}
      if(existing){qlLists[lIdx].emoji=selEmoji;qlLists[lIdx].name=n;}
      else{qlLists.push({id:'ql_'+Date.now(),emoji:selEmoji,name:n,items:[]});}
      qlSave(); renderQlLists(); backdrop.remove();
    };
    document.getElementById('qlNameInput').focus();
  };

  // ── Watchlist
  function renderWlCatTabs(){
    var tabs=document.getElementById('wlCatTabs'); if(!tabs) return;
    tabs.innerHTML='';
    var all=document.createElement('button'); all.className='wl-cat-btn'+(wlCatFilter==='all'?' active':'');
    all.textContent='✨ Todas'; all.onclick=function(){wlCatFilter='all';renderWlCatTabs();renderWlGrid();};
    tabs.appendChild(all);
    WL_CATS.forEach(function(c){
      var btn=document.createElement('button'); btn.className='wl-cat-btn'+(wlCatFilter===c.id?' active':'');
      btn.textContent=c.label; btn.onclick=function(){wlCatFilter=c.id;renderWlCatTabs();renderWlGrid();};
      tabs.appendChild(btn);
    });
  }

  function renderWlStatusFilter(){
    var row=document.getElementById('wlStatusFilter'); if(!row) return;
    row.innerHTML='<span class="wl-status-label">Estado:</span>';
    var all=document.createElement('button'); all.className='wl-status-btn'+(wlStatusFilter==='all'?' active':'');
    all.textContent='Todos'; all.onclick=function(){wlStatusFilter='all';renderWlStatusFilter();renderWlGrid();};
    row.appendChild(all);
    WL_STATUSES.forEach(function(s){
      var btn=document.createElement('button'); btn.className='wl-status-btn'+(wlStatusFilter===s.id?' active':'');
      btn.textContent=s.label; btn.onclick=function(){wlStatusFilter=s.id;renderWlStatusFilter();renderWlGrid();};
      row.appendChild(btn);
    });
  }

  function renderWlClasFilter(){
    var row=document.getElementById('wlClasFilter'); if(!row) return;
    row.innerHTML='<span class="wl-clas-label">Clasificación:</span>';
    var all=document.createElement('button'); all.className='wl-status-btn'+(wlClasFilter==='all'?' active':'');
    all.textContent='Todas'; all.onclick=function(){wlClasFilter='all';renderWlClasFilter();renderWlGrid();};
    row.appendChild(all);
    wlClasificaciones.forEach(function(cl){
      var btn=document.createElement('button'); btn.className='wl-status-btn'+(wlClasFilter===cl?' active':'');
      btn.textContent='🏷 '+cl;
      btn.onclick=function(){wlClasFilter=cl;renderWlClasFilter();renderWlGrid();};
      row.appendChild(btn);
    });
    // Botón para agregar nueva clasificación
    var addBtn=document.createElement('button'); addBtn.className='wl-status-btn';
    addBtn.textContent='＋ Nueva'; addBtn.style.borderStyle='dashed';
    addBtn.onclick=function(){
      var nombre=prompt('Nombre de la clasificación:');
      if(!nombre||!nombre.trim()) return;
      nombre=nombre.trim();
      if(!wlClasificaciones.includes(nombre)){ wlClasificaciones.push(nombre); wlClaSave(); }
      renderWlClasFilter(); renderWlGrid();
    };
    row.appendChild(addBtn);
  }

  function renderWlGrid(){
    var grid=document.getElementById('wlGrid'); if(!grid) return;
    grid.innerHTML='';
    var filtered=wlItems.filter(function(it){
      return (wlCatFilter==='all'||it.cat===wlCatFilter)
          && (wlStatusFilter==='all'||it.status===wlStatusFilter)
          && (wlClasFilter==='all'||it.clasificacion===wlClasFilter);
    });
    if(filtered.length===0){
      var emp=document.createElement('div'); emp.className='wl-empty';
      emp.textContent='Nada aquí todavía 🌸'; grid.appendChild(emp); return;
    }
    filtered.slice().reverse().forEach(function(item){
      var cat=WL_CATS.find(function(c){return c.id===item.cat;})||WL_CATS[0];
      var card=document.createElement('div'); card.className='wl-card';

      // Delete btn
      var delBtn=document.createElement('button'); delBtn.className='wl-card-del'; delBtn.textContent='✕';
      delBtn.onclick=(function(id){return function(){wlDelete(id);};})(item.id);
      card.appendChild(delBtn);

      // Category
      var catEl=document.createElement('div'); catEl.className='wl-card-cat'; catEl.textContent=cat.label;
      card.appendChild(catEl);

      // Title
      var titleEl=document.createElement('div'); titleEl.className='wl-card-title'; titleEl.textContent=item.title;
      card.appendChild(titleEl);

      // Clasificación badge
      if(item.clasificacion){
        var clasEl=document.createElement('div'); clasEl.className='wl-card-clas'; clasEl.textContent='🏷 '+item.clasificacion;
        card.appendChild(clasEl);
      }

      // Status select
      var sel=document.createElement('select');
      sel.style.cssText='font-size:.65rem;border:1px solid var(--border);border-radius:8px;padding:.15rem .3rem;background:var(--bg);color:var(--text);font-family:var(--font-body);font-weight:700;cursor:pointer';
      WL_STATUSES.forEach(function(s){
        var opt=document.createElement('option'); opt.value=s.id; opt.textContent=s.label;
        if(item.status===s.id) opt.selected=true;
        sel.appendChild(opt);
      });
      sel.onchange=(function(id){return function(){wlSetStatus(id,sel.value);};})(item.id);
      card.appendChild(sel);

      // Stars (solo si terminado)
      if(item.status==='terminado'){
        var starsEl=document.createElement('div'); starsEl.className='wl-stars';
        for(var i=1;i<=5;i++){
          var star=document.createElement('span'); star.className='wl-star'+(i<=(item.rating||0)?' filled':'');
          star.textContent='★';
          star.onclick=(function(id,n){return function(){wlSetRating(id,n);};})(item.id,i);
          starsEl.appendChild(star);
        }
        card.appendChild(starsEl);
      }

      // Click para editar (excepto botón eliminar, select de status y estrellas)
      card.style.cursor = 'pointer';
      card.onclick = (function(id){ return function(e){
        if(e.target===delBtn || e.target===sel || e.target.classList.contains('wl-star')) return;
        window.openWlModal(id);
      };})(item.id);

      grid.appendChild(card);
    });
  }

  window.wlSetRating=function(id,r){
    var it=wlItems.find(function(x){return x.id===id;}); if(!it) return;
    it.rating=r; wlSave(); renderWlGrid();
  };
  window.wlSetStatus=function(id,s){
    var it=wlItems.find(function(x){return x.id===id;}); if(!it) return;
    it.status=s; wlSave(); renderWlGrid();
  };
  window.wlDelete=function(id){
    kittyConfirm('¿Eliminar esta entrada?', function(){ wlItems=wlItems.filter(function(x){return x.id!==id;}); wlSave(); renderWlGrid(); });
  };

  window.openWlModal=function(id){
    var old=document.getElementById('wlModal'); if(old) old.remove();
    var existing=id?wlItems.find(function(x){return x.id===id;}):null;
    var backdrop=document.createElement('div'); backdrop.className='meta-modal-backdrop'; backdrop.id='wlModal';
    backdrop.onclick=function(e){if(e.target===backdrop)backdrop.remove();};
    var box=document.createElement('div'); box.className='meta-modal-box';
    var catOpts=WL_CATS.map(function(c){return '<option value="'+c.id+'"'+(existing&&existing.cat===c.id?' selected':'')+'>'+c.label+'</option>';}).join('');
    var stOpts=WL_STATUSES.map(function(s){return '<option value="'+s.id+'"'+(existing&&existing.status===s.id?' selected':'')+'>'+s.label+'</option>';}).join('');
    var clasOpts='<option value="">— Sin clasificación —</option>'+wlClasificaciones.map(function(cl){return '<option value="'+cl+'"'+(existing&&existing.clasificacion===cl?' selected':'')+'>'+cl+'</option>';}).join('');
    box.innerHTML='<div class="mood-modal-title">'+(existing?'Editar entrada':'Nueva entrada 🎬')+'</div>'
      +'<div class="modal-field"><label class="modal-label">Título</label>'
      +'<input class="modal-input" id="wlTitleInput" placeholder="Ej: Attack on Titan…" value="'+(existing?existing.title.replace(/"/g,'&quot;'):'')+'" ></div>'
      +'<div class="modal-field"><label class="modal-label">Categoría</label>'
      +'<select class="modal-input" id="wlCatInput" style="cursor:pointer">'+catOpts+'</select></div>'
      +'<div class="modal-field"><label class="modal-label">Estado</label>'
      +'<select class="modal-input" id="wlStatusInput" style="cursor:pointer">'+stOpts+'</select></div>'
      +'<div class="modal-field"><label class="modal-label">Clasificación 🏷</label>'
      +'<select class="modal-input" id="wlClasInput" style="cursor:pointer">'+clasOpts+'</select>'
      +'<div style="display:flex;gap:.4rem;margin-top:.4rem">'
      +'<input class="modal-input" id="wlNewClasInput" placeholder="O escribe una nueva clasificación…" style="flex:1;font-size:.75rem">'
      +'<button type="button" class="modal-btn-save" id="wlAddClasBtn" style="padding:.35rem .7rem;font-size:.75rem">＋</button>'
      +'</div></div>'
      +'<div class="modal-btns" style="margin-top:.8rem">'
      +'<button class="modal-btn-cancel" onclick="document.getElementById(&quot;wlModal&quot;).remove()">Cancelar</button>'
      +'<button class="modal-btn-save" id="wlSaveBtn">Guardar</button></div>';
    backdrop.appendChild(box); document.body.appendChild(backdrop);
    // Agregar nueva clasificación desde el modal
    document.getElementById('wlAddClasBtn').onclick=function(){
      var nombre=document.getElementById('wlNewClasInput').value.trim(); if(!nombre) return;
      if(!wlClasificaciones.includes(nombre)){ wlClasificaciones.push(nombre); wlClaSave(); }
      var sel=document.getElementById('wlClasInput');
      if(!sel.querySelector('option[value="'+nombre+'"]')){
        var opt=document.createElement('option'); opt.value=nombre; opt.textContent=nombre; sel.appendChild(opt);
      }
      sel.value=nombre;
      document.getElementById('wlNewClasInput').value='';
    };
    document.getElementById('wlNewClasInput').onkeydown=function(e){ if(e.key==='Enter'){e.preventDefault();document.getElementById('wlAddClasBtn').click();} };
    document.getElementById('wlSaveBtn').onclick=function(){
      var t=document.getElementById('wlTitleInput').value.trim(); if(!t){document.getElementById('wlTitleInput').focus();return;}
      var c=document.getElementById('wlCatInput').value;
      var s=document.getElementById('wlStatusInput').value;
      var cl=document.getElementById('wlClasInput').value;
      if(existing){existing.title=t;existing.cat=c;existing.status=s;existing.clasificacion=cl;}
      else{wlItems.push({id:'wl_'+Date.now(),title:t,cat:c,status:s,clasificacion:cl,rating:0});}
      wlSave(); renderWlGrid(); renderWlClasFilter(); backdrop.remove();
    };
    document.getElementById('wlTitleInput').focus();
  };

  // ══ WISHLIST ══════════════════════════════════════════════
  var WSH_STATUSES = [
    { id:'por_comprar', label:'🛒 Por comprar',  color:'#a78bfa', bg:'rgba(167,139,250,.12)' },
    { id:'guardado',    label:'💾 Guardado',      color:'#6b7280', bg:'rgba(107,114,128,.1)'  },
    { id:'comprado',    label:'✅ Comprado',       color:'#22c55e', bg:'rgba(34,197,94,.12)'   },
    { id:'descartado',  label:'🚫 Descartado',    color:'#ef4444', bg:'rgba(239,68,68,.1)'    },
  ];
  var wshItems = [];
  var wshStatusFilter = 'all';
  var wshPrecioFilter = 'all';

  function wshSave(){ try{ localStorage.setItem('wishlist_items', JSON.stringify(wshItems)); }catch(e){} if(window.cloudSave) window.cloudSave('wishlist_items', wshItems); }
  function wshLoad(){ if(window._wishlistItems){ wshItems=window._wishlistItems; } else { try{ wshItems=JSON.parse(localStorage.getItem('wishlist_items')||'[]'); }catch(e){ wshItems=[]; } } }

  // Rangos de precio derivados de los items
  function wshGetRangos() {
    var rangos = {};
    wshItems.forEach(function(it){ if(it.rango) rangos[it.rango]=true; });
    return Object.keys(rangos).sort();
  }

  function wshRenderFilters() {
    // Estado
    var sf = document.getElementById('wshStatusFilter'); if(!sf) return;
    sf.innerHTML = '';
    var allBtn = document.createElement('button');
    allBtn.className = 'wl-cat-btn' + (wshStatusFilter==='all'?' active':'');
    allBtn.textContent = 'Todos';
    allBtn.onclick = function(){ wshStatusFilter='all'; wshRenderFilters(); wshRenderGrid(); };
    sf.appendChild(allBtn);
    WSH_STATUSES.forEach(function(s){
      var b = document.createElement('button');
      b.className = 'wl-cat-btn' + (wshStatusFilter===s.id?' active':'');
      b.textContent = s.label;
      b.style.cssText = wshStatusFilter===s.id ? 'background:'+s.color+';border-color:'+s.color+';color:#fff' : '';
      b.onclick = function(){ wshStatusFilter=s.id; wshRenderFilters(); wshRenderGrid(); };
      sf.appendChild(b);
    });

    // Precio
    var pf = document.getElementById('wshPrecioFilter'); if(!pf) return;
    pf.innerHTML = '';
    var allP = document.createElement('button');
    allP.className = 'wl-cat-btn' + (wshPrecioFilter==='all'?' active':'');
    allP.textContent = 'Todos';
    allP.onclick = function(){ wshPrecioFilter='all'; wshRenderFilters(); wshRenderGrid(); };
    pf.appendChild(allP);
    wshGetRangos().forEach(function(r){
      var b = document.createElement('button');
      b.className = 'wl-cat-btn' + (wshPrecioFilter===r?' active':'');
      b.textContent = '💰 '+r;
      b.onclick = function(){ wshPrecioFilter=r; wshRenderFilters(); wshRenderGrid(); };
      pf.appendChild(b);
    });
    // Botón para agregar rango personalizado
    var addR = document.createElement('button');
    addR.className = 'wl-cat-btn';
    addR.textContent = '＋ rango';
    addR.style.cssText = 'border-style:dashed;color:var(--muted)';
    addR.onclick = wshAgregarRango;
    pf.appendChild(addR);
  }

  function wshRenderGrid() {
    var grid = document.getElementById('wshGrid'); if(!grid) return;
    var items = wshItems.filter(function(it){
      if(wshStatusFilter!=='all' && it.status!==wshStatusFilter) return false;
      if(wshPrecioFilter!=='all' && it.rango!==wshPrecioFilter) return false;
      return true;
    });
    if(!items.length){
      grid.innerHTML = '<div style="color:var(--muted2);font-size:.8rem;font-weight:600;text-align:center;padding:2rem 0;grid-column:1/-1">'+
        (wshItems.length ? 'Ningún item con ese filtro 🌸' : 'Tu wishlist está vacía ✨<br><span style="font-size:.72rem">Agrega lo que sueñas tener</span>')+'</div>';
      return;
    }
    grid.innerHTML = items.map(function(it){
      var st = WSH_STATUSES.find(function(s){ return s.id===it.status; }) || WSH_STATUSES[0];
      return '<div style="background:var(--card);border:1.5px solid var(--border);border-radius:16px;padding:.9rem 1rem;display:flex;flex-direction:column;gap:.45rem;position:relative;transition:box-shadow .2s" onmouseover="this.style.boxShadow=\'0 4px 16px rgba(0,0,0,.08)\'" onmouseout="this.style.boxShadow=\'\'">'+
        // Delete btn
        '<button onclick="wshEliminar(\''+it.id+'\')" style="position:absolute;top:.5rem;right:.5rem;background:none;border:none;color:transparent;font-size:.75rem;cursor:pointer;padding:.1rem .3rem;border-radius:6px;transition:color .15s" onmouseover="this.style.color=\'var(--rosa)\'" onmouseout="this.style.color=\'transparent\'" class="wsh-del-btn">✕</button>'+
        // Status badge
        '<span style="font-size:.6rem;font-weight:800;letter-spacing:.07em;text-transform:uppercase;padding:.18rem .6rem;border-radius:20px;display:inline-block;width:fit-content;background:'+st.bg+';color:'+st.color+'">'+st.label+'</span>'+
        // Nombre
        '<p style="font-size:.88rem;font-weight:700;color:var(--text);line-height:1.3;margin:0;padding-right:.8rem">'+it.nombre+'</p>'+
        // Categoría + rango
        '<div style="display:flex;gap:.4rem;flex-wrap:wrap;align-items:center">'+
          (it.categoria ? '<span style="font-size:.65rem;font-weight:700;color:var(--muted2)">'+it.categoria+'</span>' : '')+
          (it.rango ? '<span style="font-size:.62rem;font-weight:800;padding:.12rem .5rem;border-radius:20px;background:var(--rosa-soft);color:var(--rosa)">💰 '+it.rango+'</span>' : '')+
        '</div>'+
        // Precio manual
        (it.precio ? '<p style="font-size:.75rem;font-weight:700;color:var(--muted);margin:0">'+it.precio+'</p>' : '')+
        // Nota
        (it.nota ? '<p style="font-size:.7rem;color:var(--muted2);font-weight:600;margin:0;line-height:1.4;font-style:italic">'+it.nota+'</p>' : '')+
        // Cambiar estado
        '<select onchange="wshCambiarStatus(\''+it.id+'\',this.value)" style="font-size:.68rem;font-weight:700;font-family:var(--font-body);color:var(--muted);border:1.5px solid var(--border);border-radius:8px;padding:.2rem .4rem;background:var(--surface);cursor:pointer;outline:none;margin-top:.2rem">'+
          WSH_STATUSES.map(function(s){ return '<option value="'+s.id+'"'+(it.status===s.id?' selected':'')+'>'+s.label+'</option>'; }).join('')+
        '</select>'+
      '</div>';
    }).join('');
    // Hover reveal delete btns via CSS override
    grid.querySelectorAll('.wsh-del-btn').forEach(function(b){
      b.closest('div').addEventListener('mouseenter',function(){ b.style.color='var(--muted2)'; });
      b.closest('div').addEventListener('mouseleave',function(){ b.style.color='transparent'; });
    });
  }

  window.wshCambiarStatus = function(id, status) {
    var it = wshItems.find(function(x){ return x.id===id; });
    if(it){ it.status=status; wshSave(); wshRenderFilters(); wshRenderGrid(); }
  };

  window.wshEliminar = function(id) {
    wshItems = wshItems.filter(function(x){ return x.id!==id; });
    wshSave(); wshRenderFilters(); wshRenderGrid();
  };

  window.wshAgregarRango = function() {
    var r = prompt('Nombre del rango de precio (ej: $0-$100, Barato, Caro…)');
    if(r && r.trim()) { wshPrecioFilter=r.trim(); wshRenderFilters(); wshRenderGrid(); }
  };

  // Modal agregar item
  window.openWshModal = function() {
    var rangos = wshGetRangos();
    var rangoOpts = rangos.map(function(r){ return '<option value="'+r+'">'+r+'</option>'; }).join('');
    var m = document.getElementById('wshModal');
    if(m) m.remove();
    m = document.createElement('div');
    m.id = 'wshModal';
    m.style.cssText = 'position:fixed;inset:0;z-index:6000;background:rgba(0,0,0,.5);display:flex;align-items:flex-start;justify-content:center;padding:1rem;overflow-y:auto';
    m.onclick = function(e){ if(e.target===m) m.remove(); };
    m.innerHTML = '<div style="background:var(--card);border-radius:20px;padding:1.5rem;max-width:420px;width:100%;margin:auto;box-shadow:0 20px 60px rgba(0,0,0,.3)" onclick="event.stopPropagation()">'+
      '<h3 style="font-family:var(--font-title);font-size:1.05rem;color:var(--rosa);margin-bottom:1.1rem;font-style:italic">✨ Añadir a Wishlist</h3>'+

      '<label style="font-size:.7rem;font-weight:800;color:var(--muted);text-transform:uppercase;letter-spacing:.07em">¿Qué quieres? *</label>'+
      '<input id="wshNombre" placeholder="Ej: Teclado mecánico, vestido, libro…" style="width:100%;box-sizing:border-box;margin:.3rem 0 .9rem;background:var(--surface);border:1.5px solid var(--border);border-radius:10px;padding:.6rem .8rem;font-family:var(--font-body);font-size:.84rem;color:var(--text);outline:none">'+

      '<label style="font-size:.7rem;font-weight:800;color:var(--muted);text-transform:uppercase;letter-spacing:.07em">Categoría (opcional)</label>'+
      '<input id="wshCategoria" placeholder="Ej: tecnología, ropa, libros, hogar…" style="width:100%;box-sizing:border-box;margin:.3rem 0 .9rem;background:var(--surface);border:1.5px solid var(--border);border-radius:10px;padding:.6rem .8rem;font-family:var(--font-body);font-size:.84rem;color:var(--text);outline:none">'+

      '<label style="font-size:.7rem;font-weight:800;color:var(--muted);text-transform:uppercase;letter-spacing:.07em">Precio aproximado (opcional)</label>'+
      '<input id="wshPrecio" placeholder="Ej: $350, ~$500, no sé…" style="width:100%;box-sizing:border-box;margin:.3rem 0 .9rem;background:var(--surface);border:1.5px solid var(--border);border-radius:10px;padding:.6rem .8rem;font-family:var(--font-body);font-size:.84rem;color:var(--text);outline:none">'+

      '<label style="font-size:.7rem;font-weight:800;color:var(--muted);text-transform:uppercase;letter-spacing:.07em">Rango de precio</label>'+
      '<div style="display:flex;gap:.5rem;margin:.3rem 0 .9rem">'+
        '<select id="wshRangoSel" style="flex:1;background:var(--surface);border:1.5px solid var(--border);border-radius:10px;padding:.6rem .8rem;font-family:var(--font-body);font-size:.82rem;color:var(--text);outline:none">'+
          '<option value="">Sin rango</option>'+rangoOpts+
          '<option value="__nuevo__">＋ Nuevo rango…</option>'+
        '</select>'+
      '</div>'+

      '<label style="font-size:.7rem;font-weight:800;color:var(--muted);text-transform:uppercase;letter-spacing:.07em">Estado</label>'+
      '<select id="wshStatusSel" style="width:100%;box-sizing:border-box;margin:.3rem 0 .9rem;background:var(--surface);border:1.5px solid var(--border);border-radius:10px;padding:.6rem .8rem;font-family:var(--font-body);font-size:.82rem;color:var(--text);outline:none">'+
        WSH_STATUSES.map(function(s){ return '<option value="'+s.id+'">'+s.label+'</option>'; }).join('')+
      '</select>'+

      '<label style="font-size:.7rem;font-weight:800;color:var(--muted);text-transform:uppercase;letter-spacing:.07em">Nota (opcional)</label>'+
      '<textarea id="wshNota" placeholder="Link, color, talla, tienda…" rows="2" style="width:100%;box-sizing:border-box;margin:.3rem 0 1.1rem;background:var(--surface);border:1.5px solid var(--border);border-radius:10px;padding:.6rem .8rem;font-family:var(--font-body);font-size:.84rem;color:var(--text);outline:none;resize:vertical"></textarea>'+

      '<div style="display:flex;gap:.6rem">'+
        '<button onclick="wshGuardar()" style="flex:1;padding:.65rem;border-radius:12px;border:none;background:var(--rosa);color:#fff;font-family:var(--font-body);font-size:.84rem;font-weight:800;cursor:pointer">Guardar ✨</button>'+
        '<button onclick="document.getElementById(\'wshModal\').remove()" style="padding:.65rem 1rem;border-radius:12px;border:1.5px solid var(--border);background:none;color:var(--muted);font-family:var(--font-body);font-size:.84rem;font-weight:700;cursor:pointer">Cancelar</button>'+
      '</div>'+
    '</div>';
    document.body.appendChild(m);

    // Manejar opción "nuevo rango"
    document.getElementById('wshRangoSel').onchange = function(){
      if(this.value==='__nuevo__'){
        var nr = prompt('Nombre del nuevo rango (ej: $0-$200, Económico, Caro…)');
        if(nr && nr.trim()){
          var opt = document.createElement('option');
          opt.value = nr.trim(); opt.textContent = nr.trim();
          this.insertBefore(opt, this.lastElementChild);
          this.value = nr.trim();
        } else { this.value=''; }
      }
    };
  };

  window.wshGuardar = function() {
    var nombre = (document.getElementById('wshNombre').value||'').trim();
    if(!nombre) return;
    var rango = document.getElementById('wshRangoSel').value;
    if(rango==='__nuevo__') rango='';
    wshItems.push({
      id: Date.now().toString(),
      nombre: nombre,
      categoria: (document.getElementById('wshCategoria').value||'').trim(),
      precio: (document.getElementById('wshPrecio').value||'').trim(),
      rango: rango,
      status: document.getElementById('wshStatusSel').value || 'por_comprar',
      nota: (document.getElementById('wshNota').value||'').trim(),
    });
    wshSave();
    var m = document.getElementById('wshModal'); if(m) m.remove();
    wshRenderFilters(); wshRenderGrid();
  };

  // Init
  qlLoad(); wlLoad(); wlClaLoad(); wshLoad();
  setTimeout(function(){ renderQlLists(); renderWlCatTabs(); renderWlStatusFilter(); renderWlClasFilter(); renderWlGrid(); }, 150);
})();



(function(){
  var buscarQuery = '';
  var buscarSeccion = 'all';

  var SECCIONES = [
    { id:'tareas',       label:'📝 Tareas',       page:'page-tareas' },
    { id:'journal',      label:'📓 Journal',      page:'page-journal' },
    { id:'rutinas',      label:'🌸 Rutinas',      page:'page-rutinas' },
    { id:'recetario',    label:'🍽️ Recetario',    page:'page-recetario' },
    { id:'watchlist',    label:'🎬 Watchlist',    page:'page-listas' },
    { id:'listas',       label:'⚡ Listas',       page:'page-listas' },
    { id:'finanzas',     label:'💸 Finanzas',     page:'page-finanzas' },
    { id:'braindump',    label:'🧠 Braindump',    page:'page-braindump' },
    { id:'intereses',    label:'🦄 Intereses',    page:'page-intereses' },
    { id:'calma',        label:'🌿 Calma',        page:'page-calma' },
    { id:'organización', label:'🔄 Organización', page:'page-transiciones' },
    { id:'univ',         label:'💙 Universidad',  page:'page-univ' },
  ];

  function renderFilters(){
    var wrap = document.getElementById('buscarFilters'); if(!wrap) return;
    wrap.innerHTML = '';
    var all = document.createElement('button');
    all.className = 'buscar-filter-btn' + (buscarSeccion==='all'?' active':'');
    all.textContent = '✨ Todas';
    all.onclick = function(){ buscarSeccion='all'; renderFilters(); doSearch(); };
    wrap.appendChild(all);
    SECCIONES.forEach(function(s){
      var btn = document.createElement('button');
      btn.className = 'buscar-filter-btn' + (buscarSeccion===s.id?' active':'');
      btn.textContent = s.label;
      btn.onclick = function(){ buscarSeccion=s.id; renderFilters(); doSearch(); };
      wrap.appendChild(btn);
    });
  }

  function highlight(text, q){
    if(!q) return escHtml(text);
    var escaped = q.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
    return escHtml(text).replace(new RegExp('('+escaped+')','gi'), '<mark>$1</mark>');
  }
  function escHtml(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
  function snippet(text, q, len){
    len = len || 100;
    if(!q) return text.slice(0,len)+(text.length>len?'…':'');
    var idx = text.toLowerCase().indexOf(q.toLowerCase());
    var start = Math.max(0, idx-40);
    var end = Math.min(text.length, start+len);
    var s = (start>0?'…':'')+text.slice(start,end)+(end<text.length?'…':'');
    return s;
  }

  function getResults(q){
    var results = [];
    var ql = q.toLowerCase();

    // ── TAREAS
    try {
      var tareas = JSON.parse(localStorage.getItem('tareas_v2')||'[]');
      tareas.forEach(function(t){
        var text = (t.text||t.title||'');
        if(text.toLowerCase().indexOf(ql)>=0){
          results.push({ seccion:'tareas', icon:'📝', title:text, snippet:'', page:'page-tareas' });
        }
      });
    } catch(e){}

    // ── JOURNAL (entradas)
    try {
      var jKeys = Object.keys(localStorage).filter(function(k){ return k.startsWith('journal_'); });
      jKeys.forEach(function(k){
        var entry = JSON.parse(localStorage.getItem(k)||'null');
        if(!entry) return;
        var titulo = entry.titulo||entry.title||k.replace('journal_','');
        var contenido = entry.contenido||entry.text||entry.content||'';
        var hayTitulo = titulo.toLowerCase().indexOf(ql)>=0;
        var hayContenido = contenido.toLowerCase().indexOf(ql)>=0;
        if(hayTitulo||hayContenido){
          results.push({ seccion:'journal', icon:'📓', title:titulo||'Entrada de journal', snippet: hayContenido?snippet(contenido,q):'', page:'page-journal' });
        }
      });
      // También formato array
      var journalArr = JSON.parse(localStorage.getItem('journal_entries')||'[]');
      journalArr.forEach(function(e){
        var titulo = e.titulo||e.title||e.date||'';
        var contenido = e.contenido||e.text||e.content||'';
        var hayTitulo = titulo.toLowerCase().indexOf(ql)>=0;
        var hayContenido = contenido.toLowerCase().indexOf(ql)>=0;
        if(hayTitulo||hayContenido){
          results.push({ seccion:'journal', icon:'📓', title:titulo||'Entrada de journal', snippet:hayContenido?snippet(contenido,q):'', page:'page-journal' });
        }
      });
    } catch(e){}

    // ── AGRADECIMIENTOS (gratitud_data)
    try {
      var gratData = JSON.parse(localStorage.getItem('gratitud_data')||'{}');
      Object.keys(gratData).forEach(function(dk){
        var arr = gratData[dk]||[];
        arr.forEach(function(texto, i){
          if(texto && texto.toLowerCase().indexOf(ql)>=0){
            results.push({ seccion:'journal', icon:'🙏', title:'Agradecimiento '+dk, snippet:snippet(texto,q,100), page:'page-journal' });
          }
        });
      });
    } catch(e){}

    // ── RUTINAS
    try {
      var rutinas = JSON.parse(localStorage.getItem('rutinas')||'[]');
      rutinas.forEach(function(r){
        var name = r.name||r.nombre||'';
        if(name.toLowerCase().indexOf(ql)>=0){
          results.push({ seccion:'rutinas', icon:'🌸', title:name, snippet:'', page:'page-rutinas' });
        }
        // pasos de rutina
        (r.pasos||r.steps||[]).forEach(function(p){
          var pt = p.text||p.nombre||p.title||'';
          if(pt.toLowerCase().indexOf(ql)>=0){
            results.push({ seccion:'rutinas', icon:'🌸', title:pt, snippet:'En rutina: '+name, page:'page-rutinas' });
          }
        });
      });
    } catch(e){}

    // ── RECETARIO
    try {
      var recetas = JSON.parse(localStorage.getItem('recetario')||'[]');
      recetas.forEach(function(r){
        var name = r.nombre||r.name||r.title||'';
        var ing = (r.ingredientes||[]).join(' ');
        var hayNombre = name.toLowerCase().indexOf(ql)>=0;
        var hayIng = ing.toLowerCase().indexOf(ql)>=0;
        if(hayNombre||hayIng){
          results.push({ seccion:'recetario', icon:'🍽️', title:name, snippet:hayIng?'Ingrediente: '+snippet(ing,q,60):'', page:'page-recetario' });
        }
      });
    } catch(e){}

    // ── WATCHLIST
    try {
      var wlItems = JSON.parse(localStorage.getItem('wl_items')||'[]');
      wlItems.forEach(function(it){
        var title = it.title||'';
        var clas = it.clasificacion||'';
        if(title.toLowerCase().indexOf(ql)>=0 || clas.toLowerCase().indexOf(ql)>=0){
          results.push({ seccion:'watchlist', icon:'🎬', title:title, snippet:clas?'Clasificación: '+clas:'', page:'page-listas', tabHint:'watchlist' });
        }
      });
    } catch(e){}

    // ── LISTAS RÁPIDAS
    try {
      var qlLists = JSON.parse(localStorage.getItem('ql_lists')||'[]');
      qlLists.forEach(function(lst){
        var lname = lst.name||'';
        (lst.items||[]).forEach(function(it){
          var t = it.text||'';
          if(t.toLowerCase().indexOf(ql)>=0 || lname.toLowerCase().indexOf(ql)>=0){
            results.push({ seccion:'listas', icon:'⚡', title:t||lname, snippet:'Lista: '+lname, page:'page-listas', tabHint:'rapidas' });
          }
        });
        if(lname.toLowerCase().indexOf(ql)>=0 && !(lst.items||[]).length){
          results.push({ seccion:'listas', icon:'⚡', title:lname, snippet:'Lista vacía', page:'page-listas', tabHint:'rapidas' });
        }
      });
    } catch(e){}

    // ── FINANZAS (movimientos)
    try {
      var movs = JSON.parse(localStorage.getItem('finanzas_movimientos')||'[]');
      movs.forEach(function(m){
        var desc = m.desc||m.descripcion||m.note||'';
        if(desc.toLowerCase().indexOf(ql)>=0){
          results.push({ seccion:'finanzas', icon:'💸', title:desc, snippet:(m.tipo||'')+(m.monto?' — $'+m.monto:''), page:'page-finanzas' });
        }
      });
    } catch(e){}

    // ── BRAINDUMP
    try {
      var bd = localStorage.getItem('braindump_text')||localStorage.getItem('braindump')||'';
      if(bd.toLowerCase().indexOf(ql)>=0){
        results.push({ seccion:'braindump', icon:'🧠', title:'Braindump', snippet:snippet(bd,q,100), page:'page-braindump' });
      }
      // Ideas spark
      var ideas = JSON.parse(localStorage.getItem('spark_ideas')||'[]');
      ideas.forEach(function(idea){
        var t = idea.text||idea.titulo||idea.title||'';
        if(t.toLowerCase().indexOf(ql)>=0){
          results.push({ seccion:'braindump', icon:'💡', title:t, snippet:'Idea guardada', page:'page-braindump' });
        }
      });
    } catch(e){}

    // ── INTERESES (hiperfoco archivado)
    try {
      var ints = JSON.parse(localStorage.getItem('intereses')||'[]');
      ints.forEach(function(i){
        var name = i.name||i.nombre||i.title||'';
        var desc = i.desc||i.descripcion||'';
        if(name.toLowerCase().indexOf(ql)>=0||desc.toLowerCase().indexOf(ql)>=0){
          results.push({ seccion:'intereses', icon:'🦄', title:name, snippet:desc?snippet(desc,q,80):'', page:'page-intereses' });
        }
      });
    } catch(e){}

    // ── HIPERFOCOS ARCHIVADOS
    try {
      var sparkHist = JSON.parse(localStorage.getItem('spark_historial')||'[]');
      sparkHist.forEach(function(h){
        var title = h.title||'';
        var notes = h.notes||'';
        var notaCierre = h.notaCierre||'';
        if(title.toLowerCase().indexOf(ql)>=0||notes.toLowerCase().indexOf(ql)>=0||notaCierre.toLowerCase().indexOf(ql)>=0){
          results.push({ seccion:'intereses', icon:'✦', title: (h.icon||'⭐')+' '+title,
            snippet: h.fechaInicio ? h.fechaInicio+(h.fechaFin&&h.fechaFin!==h.fechaInicio?' → '+h.fechaFin:'') : (h.date||''),
            page:'page-intereses' });
        }
      });
    } catch(e){}

    // ── WISHLIST
    try {
      var wshItems = JSON.parse(localStorage.getItem('wishlist_items')||'[]');
      wshItems.forEach(function(it){
        var nombre = it.nombre||'';
        var nota = it.nota||'';
        var cat = it.categoria||'';
        if(nombre.toLowerCase().indexOf(ql)>=0||nota.toLowerCase().indexOf(ql)>=0||cat.toLowerCase().indexOf(ql)>=0){
          results.push({ seccion:'listas', icon:'✨', title:nombre,
            snippet:(it.rango?'💰 '+it.rango+' · ':'')+( it.status||''), page:'page-listas', tabHint:'wishlist' });
        }
      });
    } catch(e){}

    // ── TRANSICIONES
    try {
      var transItems = JSON.parse(localStorage.getItem('trans_data')||'[]');
      transItems.forEach(function(t){
        var txt = (t.actual||'')+' → '+(t.siguiente||'');
        if(txt.toLowerCase().indexOf(ql)>=0){
          results.push({ seccion:'organización', icon:'🔄', title:txt, snippet:'Transición · '+t.hora, page:'page-transiciones' });
        }
      });
    } catch(e){}

    // ── EVENTOS PREPARADOS
    try {
      var eventosItems = JSON.parse(localStorage.getItem('eventos_prep')||'[]');
      eventosItems.forEach(function(e){
        var nombre = e.nombre||'';
        var queVaApasar = e.queVaApasar||'';
        if(nombre.toLowerCase().indexOf(ql)>=0||queVaApasar.toLowerCase().indexOf(ql)>=0){
          results.push({ seccion:'calma', icon:'📅', title:nombre,
            snippet:queVaApasar?snippet(queVaApasar,q,80):'', page:'page-calma' });
        }
      });
    } catch(e){}

    // ── MODO RECUPERACIÓN (registros)
    try {
      var recuperRegs = JSON.parse(localStorage.getItem('recuper_registros')||'{}');
      Object.keys(recuperRegs).forEach(function(fecha){
        (recuperRegs[fecha]||[]).forEach(function(r){
          var txt = (r.que||'')+' '+(r.ayudo||'');
          if(txt.toLowerCase().indexOf(ql)>=0){
            results.push({ seccion:'calma', icon:'🌿', title:'Recuperación · '+fecha,
              snippet:r.que?snippet(r.que,q,80):'', page:'page-calma' });
          }
        });
      });
    } catch(e){}

    // ── UNIVERSIDAD (motivación + materias)
    try {
      var univ = JSON.parse(localStorage.getItem('univ_data')||'{}');
      var mot = univ.motivacion||'';
      if(mot.toLowerCase().indexOf(ql)>=0){
        results.push({ seccion:'univ', icon:'💙', title:'Motivación personal', snippet:snippet(mot,q,100), page:'page-univ' });
      }
      (univ.materias||[]).forEach(function(m){
        var mn = m.nombre||m.name||'';
        if(mn.toLowerCase().indexOf(ql)>=0){
          results.push({ seccion:'univ', icon:'💙', title:mn, snippet:'Materia', page:'page-univ' });
        }
      });
    } catch(e){}

    // filtrar por sección activa
    if(buscarSeccion!=='all'){
      results = results.filter(function(r){ return r.seccion===buscarSeccion; });
    }

    // deduplicar títulos iguales por sección
    var seen = {};
    results = results.filter(function(r){
      var key = r.seccion+'::'+r.title;
      if(seen[key]) return false;
      seen[key] = true;
      return true;
    });

    return results;
  }

  function doSearch(){
    var q = buscarQuery.trim();
    var resultsEl = document.getElementById('buscarResults');
    var countEl = document.getElementById('buscarCount');
    if(!resultsEl) return;
    if(!q){
      countEl.style.display='none';
      resultsEl.innerHTML='<div class="buscar-empty">Escribe algo para empezar a buscar 🌸</div>';
      return;
    }
    var results = getResults(q);
    countEl.style.display='block';
    countEl.textContent = results.length===0 ? '' : results.length+' resultado'+(results.length!==1?'s':'')+' encontrado'+(results.length!==1?'s':'');
    if(results.length===0){
      resultsEl.innerHTML='<div class="buscar-empty">Sin resultados para "'+escHtml(q)+'" 🐱</div>';
      return;
    }
    resultsEl.innerHTML='';
    var secLabel = {};
    SECCIONES.forEach(function(s){ secLabel[s.id]=s.label; });
    results.forEach(function(r){
      var card = document.createElement('div'); card.className='buscar-result-card';
      card.onclick = function(){
        if(window.showPage) window.showPage(r.page);
        if(r.tabHint==='watchlist' && window.listasSetTab) setTimeout(function(){ window.listasSetTab('watchlist'); },200);
        if(r.tabHint==='rapidas' && window.listasSetTab) setTimeout(function(){ window.listasSetTab('rapidas'); },200);
        if(r.tabHint==='wishlist' && window.listasSetTab) setTimeout(function(){ window.listasSetTab('wishlist'); },200);
      };
      var meta = document.createElement('div'); meta.className='buscar-result-meta';
      var sec = document.createElement('span'); sec.className='buscar-result-section';
      sec.textContent = (secLabel[r.seccion]||r.seccion);
      meta.appendChild(sec);
      card.appendChild(meta);
      var title = document.createElement('div'); title.className='buscar-result-title';
      title.innerHTML = highlight(r.title, q);
      card.appendChild(title);
      if(r.snippet){
        var snip = document.createElement('div'); snip.className='buscar-result-snippet';
        snip.innerHTML = highlight(r.snippet, q);
        card.appendChild(snip);
      }
      resultsEl.appendChild(card);
    });
  }

  window.buscarClear = function(){
    var inp = document.getElementById('buscarInput'); if(inp) inp.value='';
    document.getElementById('buscarClear').classList.remove('visible');
    buscarQuery=''; doSearch();
    if(inp) inp.focus();
  };

  document.addEventListener('DOMContentLoaded', function(){
    var inp = document.getElementById('buscarInput');
    var clearBtn = document.getElementById('buscarClear');
    if(!inp) return;
    inp.addEventListener('input', function(){
      buscarQuery = inp.value;
      clearBtn.classList.toggle('visible', !!inp.value);
      doSearch();
    });
    renderFilters();
  });

  // También init cuando se muestre la página
  window._buscarInit = function(){
    renderFilters();
    var inp = document.getElementById('buscarInput');
    if(inp){
      inp.focus({ preventScroll: true });
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  };
})();



(function(){
  var CITAS_KEY = 'yuki_citas';
  var CITAS_DIAS_KEY = 'yuki_citas_dias';
  var CITAS_LAST_KEY = 'yuki_citas_last';
  var CITAS_IDX_KEY  = 'yuki_citas_idx';

  function getCitas()   { try { return JSON.parse(localStorage.getItem(CITAS_KEY)||'[]'); } catch(e){ return []; } }
  function getDias()    { return parseInt(localStorage.getItem(CITAS_DIAS_KEY)||'1'); }

  function saveCitas(v) { localStorage.setItem(CITAS_KEY, JSON.stringify(v)); if(window.cloudSave) window.cloudSave(CITAS_KEY, v); }

  // ── Obtener cita actual (rota cada N días)
  window.citaActual = function() {
    var citas = getCitas();
    if (!citas.length) return null;
    var dias  = getDias();
    var today = new Date();
    var dk    = today.getFullYear()+'-'+String(today.getMonth()+1).padStart(2,'0')+'-'+String(today.getDate()).padStart(2,'0');
    var last  = localStorage.getItem(CITAS_LAST_KEY) || '';
    var idx   = parseInt(localStorage.getItem(CITAS_IDX_KEY)||'0');

    // calcular días desde last
    if (last) {
      var lastD = new Date(last+'T12:00:00');
      var diff  = Math.floor((today - lastD) / 86400000);
      if (diff >= dias) {
        idx = (idx + 1) % citas.length;
        localStorage.setItem(CITAS_IDX_KEY, idx);
        localStorage.setItem(CITAS_LAST_KEY, dk);
        if(window.cloudSave){ window.cloudSave(CITAS_IDX_KEY, idx); window.cloudSave(CITAS_LAST_KEY, dk); }
      }
    } else {
      localStorage.setItem(CITAS_LAST_KEY, dk);
      if(window.cloudSave) window.cloudSave(CITAS_LAST_KEY, dk);
    }
    if (idx >= citas.length) idx = 0;
    return citas[idx];
  };

  // ── Cambiar manualmente
  window.citaSiguiente = function() {
    var citas = getCitas();
    if (!citas.length) return;
    var idx = (parseInt(localStorage.getItem(CITAS_IDX_KEY)||'0') + 1) % citas.length;
    var dk = new Date();
    var dkStr = dk.getFullYear()+'-'+String(dk.getMonth()+1).padStart(2,'0')+'-'+String(dk.getDate()).padStart(2,'0');
    localStorage.setItem(CITAS_IDX_KEY, idx);
    localStorage.setItem(CITAS_LAST_KEY, dkStr);
    if(window.cloudSave){ window.cloudSave(CITAS_IDX_KEY, idx); window.cloudSave(CITAS_LAST_KEY, dkStr); }
    renderCitaWidget();
  };

  // ── Config: guardar días
  window.citasGuardarDias = function(v) {
    var n = parseInt(v);
    if (n < 1 || isNaN(n)) return;
    localStorage.setItem(CITAS_DIAS_KEY, n);
    if(window.cloudSave) window.cloudSave(CITAS_DIAS_KEY, n);
  };

  // ── Modal agregar
  window.citasAbrirAdd = function() {
    document.getElementById('citaTexto').value = '';
    document.getElementById('citaLibro').value = '';
    document.getElementById('citaModalBackdrop').style.display = 'flex';
    setTimeout(function(){ document.getElementById('citaTexto').focus(); }, 100);
  };
  window.citasCerrarAdd = function() {
    document.getElementById('citaModalBackdrop').style.display = 'none';
  };
  window.citasGuardarNueva = function() {
    var texto = document.getElementById('citaTexto').value.trim();
    var libro = document.getElementById('citaLibro').value.trim();
    if (!texto) { alert('Escribe la cita 📚'); return; }
    var citas = getCitas();
    citas.push({ id:'cita_'+Date.now(), texto:texto, libro:libro });
    saveCitas(citas);
    citasCerrarAdd();
    renderCitasConfig();
    renderCitaWidget();
  };
  window.citasEliminar = function(id) {
    if (!confirm('¿Eliminar esta cita?')) return;
    var citas = getCitas().filter(function(c){ return c.id !== id; });
    saveCitas(citas);
    renderCitasConfig();
    renderCitaWidget();
  };

  // ── Render lista en config
  function renderCitasConfig() {
    var el = document.getElementById('citasListaConfig');
    if (!el) return;
    var citas = getCitas();
    var diasInput = document.getElementById('citasDias');
    if (diasInput) diasInput.value = getDias();
    el.innerHTML = '';
    if (!citas.length) {
      el.innerHTML = '<p style="font-size:.78rem;color:var(--muted);font-style:italic">Aún no tienes citas. ¡Agrega las que más te gusten! 📚</p>';
      return;
    }
    citas.forEach(function(c) {
      var row = document.createElement('div');
      row.style.cssText = 'background:var(--surface);border:1.5px solid var(--border);border-radius:10px;padding:.65rem .9rem;margin-bottom:.5rem;display:flex;align-items:flex-start;gap:.6rem';
      row.innerHTML =
        '<div style="flex:1">' +
          '<div style="font-size:.82rem;color:var(--text);font-style:italic;margin-bottom:.2rem">"'+c.texto+'"</div>' +
          (c.libro ? '<div style="font-size:.68rem;color:var(--muted);font-weight:700">— '+c.libro+'</div>' : '') +
        '</div>' +
        '<button onclick="citasEliminar(\''+c.id+'\')" style="background:none;border:none;cursor:pointer;color:var(--muted2);font-size:.85rem;flex-shrink:0;padding:.1rem .2rem">🗑️</button>';
      el.appendChild(row);
    });
  }

  // ── Widget en inicio
  function renderCitaWidget() {
    var el = document.getElementById('citaWidgetHome');
    if (!el) return;
    var cita = window.citaActual();
    if (!cita) {
      el.style.display = 'none';
      return;
    }
    el.style.display = '';
    el.innerHTML =
      '<div style="font-size:.62rem;font-weight:800;color:var(--rosa);text-transform:uppercase;letter-spacing:.08em;margin-bottom:.5rem">📚 Cita del momento</div>' +
      '<div style="font-size:.85rem;color:var(--text);font-style:italic;line-height:1.55;margin-bottom:.5rem">"'+cita.texto+'"</div>' +
      (cita.libro ? '<div style="font-size:.72rem;color:var(--muted);font-weight:700;margin-bottom:.5rem">— '+cita.libro+'</div>' : '') +
      '<button onclick="citaSiguiente()" style="background:none;border:1.5px solid var(--border);border-radius:20px;padding:.25rem .7rem;font-size:.68rem;font-weight:700;color:var(--muted);cursor:pointer;font-family:var(--font-body)">siguiente →</button>';
  }

  // Init
  renderCitasConfig();
  renderCitaWidget();

  // Re-render al entrar config
  var _origShowCitas = window.showPage;
  window.showPage = function(pageId) {
    if (_origShowCitas) _origShowCitas(pageId);
    if (pageId === 'page-config') setTimeout(renderCitasConfig, 100);
  };

  // Exponer para mirrorKeys
  window._renderCitaWidget = renderCitaWidget;
})();
