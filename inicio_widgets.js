// ════════════════════════════════════════════════════════════════
// Yuki 🌸 — inicio_widgets.js
// ════════════════════════════════════════════════════════════════


// ============================================================
//  WIDGETS DE RESUMEN — INICIO
// ============================================================
(function(){

  function dk(d) {
    d = d || new Date();
    return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
  }

  function makeWidget(icon, label, value, sub, pct, page, accent) {
    var card = document.createElement('div');
    card.className = 'widget-card';
    if (page) card.onclick = function(){ if(window.showPage) window.showPage(page); };
    card.innerHTML =
      '<div class="widget-icon">' + icon + '</div>' +
      '<div>' +
        '<div class="widget-value" style="color:' + (accent||'var(--text)') + '">' + value + '</div>' +
        '<div class="widget-sub">' + sub + '</div>' +
      '</div>' +
      '<div class="widget-label">' + label + '</div>' +
      (pct != null ? '<div class="widget-bar"><div class="widget-bar-fill" style="width:' + Math.min(100,Math.max(0,pct)) + '%;background:' + (accent||'var(--rosa)') + '"></div></div>' : '');
    return card;
  }

  window.renderWidgets = function() {
    var row = document.getElementById('widgetsRow');
    if (!row) return;
    row.innerHTML = '';
    var todayKey = dk();

    // ── 1. Tareas de hoy
    (function(){
      var total = 0, done = 0;
      try {
        var completions = JSON.parse(localStorage.getItem('completions') || '{}');
        var tasks = JSON.parse(localStorage.getItem('sem_data') || '[]');
        var now = new Date();
        var dow = ['dom','lun','mar','mie','jue','vie','sab'][now.getDay()];
        // Also check window globals if available
        if (window._completions) completions = window._completions;

        // Count today's tasks
        Object.keys(completions).forEach(function(k) {
          if (k.includes(todayKey)) { total++; if(completions[k]) done++; }
        });
        // fallback: count from sem_data
        if (total === 0 && window._data) {
          window._data.forEach(function(slot) {
            if (slot.day === dow) {
              total++;
              var cKey = slot.id + '_' + todayKey;
              if (completions[cKey]) done++;
            }
          });
        }
      } catch(e){}

      var pct = total > 0 ? Math.round(done/total*100) : 0;
      var accent = done === total && total > 0 ? 'var(--verde)' : 'var(--rosa)';
      row.appendChild(makeWidget(
        done === total && total > 0 ? '✅' : '📋',
        'Tareas hoy',
        done + '/' + total,
        total === 0 ? 'Sin tareas' : (done === total ? '¡Todo listo! 🌟' : (total - done) + ' pendiente' + (total-done!==1?'s':'')),
        pct, 'page-semana', accent
      ));
    })();

    // ── 2. Hábitos del día
    (function(){
      var habitos = [];
      try {
        habitos = window._habitosData || JSON.parse(localStorage.getItem('habitos_data') || '[]');
      } catch(e){}
      var total = habitos.length;
      var done  = habitos.filter(function(h){ return h.completions && h.completions[todayKey]; }).length;
      var pct   = total > 0 ? Math.round(done/total*100) : 0;
      var accent = done === total && total > 0 ? 'var(--verde)' : '#e8703a';
      row.appendChild(makeWidget(
        '🔥',
        'Hábitos',
        done + '/' + total,
        total === 0 ? 'Crea un hábito' : (done === total && total > 0 ? '¡Todos hechos! 🌟' : (total - done) + ' restante' + (total-done!==1?'s':'')),
        pct, 'page-habitos', accent
      ));
    })();

    // ── 3. Próximo examen
    (function(){
      var nextExam = null;
      try {
        var ud = window._univData || JSON.parse(localStorage.getItem('univ_data') || 'null');
        if (ud && ud.semestres) {
          var sem = ud.semestres.find(function(s){ return s.activo; });
          if (sem && sem.examenes) {
            var upcoming = sem.examenes
              .filter(function(e){ return e.fecha >= todayKey && !e.done; })
              .sort(function(a,b){ return a.fecha.localeCompare(b.fecha); });
            nextExam = upcoming[0] || null;
          }
        }
      } catch(e){}

      if (nextExam) {
        var d = new Date(nextExam.fecha + 'T12:00');
        var today = new Date(); today.setHours(0,0,0,0);
        var diff = Math.round((d - today) / 86400000);
        var diffStr = diff === 0 ? '¡Hoy! 😰' : diff === 1 ? 'Mañana' : 'En ' + diff + ' días';
        var accent = diff <= 1 ? '#e05a6a' : diff <= 3 ? '#e8703a' : 'var(--rosa)';
        row.appendChild(makeWidget(
          '📚',
          'Próximo examen',
          diffStr,
          nextExam.materia || 'Ver detalle',
          null, 'page-univ', accent
        ));
      } else {
        row.appendChild(makeWidget(
          '📚',
          'Próximo examen',
          '—',
          'Sin exámenes próximos',
          null, 'page-univ', 'var(--muted2)'
        ));
      }
    })();

    // ── 4. Balance del mes
    (function(){
      var ingresos = 0, gastos = 0;
      try {
        var fin = window._finanzasData || JSON.parse(localStorage.getItem('finanzas_data') || 'null');
        if (fin && fin.movimientos) {
          var now = new Date();
          fin.movimientos.forEach(function(m) {
            var d = new Date(m.fecha);
            if (d.getFullYear()===now.getFullYear() && d.getMonth()===now.getMonth()) {
              if (m.tipo==='ingreso') ingresos += (+m.monto||0);
              else gastos += (+m.monto||0);
            }
          });
        }
      } catch(e){}
      var balance = ingresos - gastos;
      var fmt = function(n){ return '$' + Math.abs(n).toLocaleString('es-MX',{minimumFractionDigits:0,maximumFractionDigits:0}); };
      var accent = balance >= 0 ? 'var(--verde)' : '#e05a6a';
      row.appendChild(makeWidget(
        '💸',
        'Balance del mes',
        (balance >= 0 ? '+' : '-') + fmt(balance),
        gastos > 0 ? fmt(gastos) + ' gastados' : 'Sin movimientos',
        ingresos > 0 ? Math.min(100, Math.round((ingresos-gastos)/ingresos*100)) : null,
        'page-finanzas', accent
      ));
    })();

    // ── XP Widget
    (function(){
      var xp = parseInt(localStorage.getItem('yuki_xp') || '0');
      var RANKS = window.YUKI_RANKS || [];
      var rank = RANKS[0] || { icon:'🌑', label:'Polvo Cósmico', next:500 };
      for (var i = RANKS.length-1; i >= 0; i--) {
        if (xp >= RANKS[i].min) { rank = RANKS[i]; break; }
      }
      var nextRank = RANKS[RANKS.indexOf(rank)+1];
      var pct = nextRank ? Math.round((xp - rank.min) / (nextRank.min - rank.min) * 100) : 100;
      row.appendChild(makeWidget(
        rank.icon,
        'Rango espacial',
        rank.label,
        xp.toLocaleString('es-MX') + ' EXP' + (nextRank ? ' · faltan ' + (nextRank.min - xp).toLocaleString('es-MX') : ' · ¡Máximo!'),
        pct,
        'page-logros', '#a78bfa'
      ));
    })();
  };

  // Render on load and refresh when returning to inicio
  setTimeout(window.renderWidgets, 300);

  // Hook showPage to re-render widgets when going to inicio
  var _origShow = window.showPage;
  window.showPage = function(pageId) {
    if (_origShow) _origShow(pageId);
    if (pageId === 'page-inicio') { setTimeout(window.renderWidgets, 350); setTimeout(function(){ if(window._renderCitaWidget) window._renderCitaWidget(); }, 400); }
    if (pageId === 'page-calma') setTimeout(function(){
      eventoRender();
      recuperInit();
    }, 200);
    if (pageId === 'page-intereses') setTimeout(function(){
      renderSparkCare();
      if (typeof loadSpark === 'function') loadSpark();
      if (typeof renderSparkHistorial === 'function') renderSparkHistorial();
      if (typeof loadSparkPins === 'function') { loadSparkPins(); renderSparkPins(); }
      if (typeof loadSparkTime === 'function') { loadSparkTime(); updateSparkTimeDisplay(); }
    }, 200);
    if (pageId === 'page-concentro') setTimeout(function(){
      utSetModo('escribir');
    }, 200);
  };

})();
