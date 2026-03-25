// ════════════════════════════════════════════════════════════════
// Yuki 🌸 — mood_prompts.js
// ════════════════════════════════════════════════════════════════


// ══ MOOD TRACKER ══
(function(){
  var MOOD_EMOJIS = ['😭','😢','😔','😐','🙂','😊','😄','🥰','✨','🌟'];
  var DIAS_MOOD = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];
  var moodData = {};

  function moodSave() {
    try { localStorage.setItem('mood_data', JSON.stringify(moodData)); } catch(e){}
    if (window.cloudSave) window.cloudSave('mood_data', moodData);
  }
  function moodLoad(forceCloud) {
    if (forceCloud && window._moodData) { moodData = window._moodData; return; }
    if (window._moodData) { moodData = window._moodData; return; }
    try { moodData = JSON.parse(localStorage.getItem('mood_data') || '{}'); } catch(e){ moodData={}; }
  }
  window.renderMoodWeek = function(){ moodLoad(true); renderWeek(); };

  function getWeekDays() {
    var today = new Date();
    var day = today.getDay();
    var monday = new Date(today);
    monday.setDate(today.getDate() - (day === 0 ? 6 : day - 1));
    var days = [];
    for (var i = 0; i < 7; i++) {
      var d = new Date(monday);
      d.setDate(monday.getDate() + i);
      days.push(d);
    }
    return days;
  }

  function dkOf(d) {
    return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
  }

  window.renderMoodGrid = function() {
    var grid = document.getElementById('moodWeekGrid');
    if (!grid) return;
    grid.innerHTML = '';
    var days = getWeekDays();
    var todayDk = dkOf(new Date());
    days.forEach(function(d) {
      var dk = dkOf(d);
      var entry = moodData[dk] || {};
      var card = document.createElement('div');
      card.className = 'mood-day-card' + (dk === todayDk ? ' today-cell' : '');

      var name = document.createElement('div'); name.className='mood-day-name'; name.textContent=DIAS_MOOD[d.getDay()]+' '+d.getDate();
      var emoji = document.createElement('div'); emoji.className='mood-emoji-display'; emoji.textContent=entry.emoji||'·';
      var score = document.createElement('div'); score.className='mood-score-display'; score.textContent=entry.score ? entry.score+'/10' : '';
      var note = document.createElement('div'); note.className='mood-note-preview'; note.textContent=entry.note||'';

      card.appendChild(name); card.appendChild(emoji); card.appendChild(score); card.appendChild(note);
      card.onclick = function(){ openMoodModal(dk, d); };
      grid.appendChild(card);
    });
  };

  function openMoodModal(dk, d) {
    var old = document.getElementById('moodModal'); if(old) old.remove();
    var entry = moodData[dk] || {};
    var selEmoji = entry.emoji || '🙂';
    var selScore = entry.score || 5;

    var backdrop = document.createElement('div');
    backdrop.className='mood-modal-backdrop'; backdrop.id='moodModal';
    backdrop.onclick = function(e){ if(e.target===backdrop) backdrop.remove(); };

    var box = document.createElement('div'); box.className='mood-modal-box';
    var label = DIAS_MOOD[d.getDay()]+' '+d.getDate()+' · ¿Cómo estás?';
    box.innerHTML = '<div class="mood-modal-title">'+label+'</div>'
      + '<div class="mood-emoji-picker" id="moodEmojiPicker"></div>'
      + '<div class="mood-scale-row" id="moodScaleRow"></div>'
      + '<textarea class="mood-note-input" id="moodNoteInput" placeholder="Nota opcional… ¿qué pasó hoy?">'+(entry.note||'')+'</textarea>'
      + '<div class="modal-btns" style="margin-top:.8rem">'
      + '<button class="modal-btn-cancel" onclick="document.getElementById(&quot;moodModal&quot;).remove()">Cancelar</button>'
      + '<button class="modal-btn-save" id="moodSaveBtn">Guardar 🌟</button></div>';

    backdrop.appendChild(box);
    document.body.appendChild(backdrop);

    // Emoji picker
    var picker = document.getElementById('moodEmojiPicker');
    MOOD_EMOJIS.forEach(function(em) {
      var opt = document.createElement('span'); opt.className='mood-emoji-opt'+(em===selEmoji?' selected':'');
      opt.textContent=em;
      opt.onclick=function(){ document.querySelectorAll('.mood-emoji-opt').forEach(function(o){o.classList.remove('selected');}); opt.classList.add('selected'); selEmoji=em; };
      picker.appendChild(opt);
    });

    // Scale 1-10
    var scaleRow = document.getElementById('moodScaleRow');
    for (var i=1;i<=10;i++) {
      (function(n){
        var btn = document.createElement('button'); btn.className='mood-scale-btn'+(n===selScore?' selected':'');
        btn.textContent=n;
        btn.onclick=function(){
          document.querySelectorAll('.mood-scale-btn').forEach(function(b){b.classList.remove('selected');});
          btn.classList.add('selected'); selScore=n;
        };
        scaleRow.appendChild(btn);
      })(i);
    }

    document.getElementById('moodSaveBtn').onclick = function() {
      var note = document.getElementById('moodNoteInput').value.trim();
      moodData[dk] = { emoji: selEmoji, score: selScore, note: note };
      moodSave();
      renderMoodGrid();
      backdrop.remove();
    };
  }

  moodLoad();
  setTimeout(renderMoodGrid, 150);
})();





// ══ PROMPTS DEL DÍA ══
(function(){
  var PROMPTS = [
    '¿Qué fue lo más significativo que sentiste hoy?',
    '¿Qué es algo que aprendiste sobre ti misma esta semana?',
    '¿Qué te está costando soltar últimamente?',
    '¿De qué momento de hoy te sientes más orgullosa?',
    '¿Qué necesitas escuchar hoy que nadie te ha dicho?',
    '¿Qué emoción has evitado sentir esta semana? ¿Por qué?',
    '¿Cómo describiste hoy con una sola palabra?',
    '¿Qué te da más miedo en este momento de tu vida?',
    '¿Qué le dirías a la versión de ti de hace un año?',
    '¿Qué pequeña cosa te hizo sonreír hoy?',
    '¿Hay algo que necesitas perdonarte a ti misma?',
    '¿Qué desafío enfrentaste hoy y cómo lo manejaste?',
    '¿Qué es lo que más valoras de cómo eres?',
    '¿Qué estás evitando hacer y por qué?',
    '¿Qué te recargó la energía hoy?',
    '¿Qué hábito o pensamiento te está frenando?',
    '¿Cómo puedes ser más amable contigo misma mañana?',
    '¿Qué persona te inspiró esta semana y por qué?',
    '¿Qué necesitas más en este momento: descanso, conexión o aventura?',
    '¿Qué parte de tu historia merece ser celebrada?',
    '¿Qué te hace sentir más tú misma?',
    '¿Hay una conversación pendiente que necesitas tener?',
    '¿Qué creencia sobre ti misma quisieras cambiar?',
    '¿Qué te da más paz en este momento de tu vida?',
    '¿Cómo te sientes con respecto a donde estás en tu camino?',
  ];

  var todayKey = (function(){
    var d = new Date();
    return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
  })();

  var STORAGE_KEY = 'prompt_data'; // { 'YYYY-MM-DD': { idx, text } }
  var promptData = {};

  function loadPrompts() {
    try { promptData = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); } catch(e){ promptData={}; }
    if (window._promptData) promptData = window._promptData;
  }

  function savePrompts() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(promptData)); } catch(e){}
    if (window.cloudSave) window.cloudSave('prompt_data', promptData);
  }

  function getTodayEntry() {
    if (!promptData[todayKey]) {
      // Assign a deterministic prompt based on date, but user can shuffle
      var seed = todayKey.replace(/-/g,'');
      var idx = parseInt(seed) % PROMPTS.length;
      promptData[todayKey] = { idx: idx, text: '' };
      savePrompts();
    }
    return promptData[todayKey];
  }

  function renderPrompt() {
    var entry = getTodayEntry();
    var qEl = document.getElementById('promptQuestion');
    var tEl = document.getElementById('promptTextarea');
    if (qEl) qEl.textContent = '✦ ' + PROMPTS[entry.idx];
    if (tEl) tEl.value = entry.text || '';
  }

  var _saveTimer = null;
  function wireEvents() {
    var ta = document.getElementById('promptTextarea');
    var ok = document.getElementById('promptSaveOk');
    if (ta) {
      ta.oninput = function() {
        promptData[todayKey].text = ta.value;
        clearTimeout(_saveTimer);
        _saveTimer = setTimeout(function(){
          savePrompts();
          if (ok) { ok.classList.add('show'); setTimeout(function(){ ok.classList.remove('show'); }, 1500); }
        }, 800);
      };
    }
    var shuffleBtn = document.getElementById('promptShuffleBtn');
    if (shuffleBtn) {
      shuffleBtn.onclick = function() {
        var entry = getTodayEntry();
        var newIdx = (entry.idx + 1 + Math.floor(Math.random() * (PROMPTS.length - 1))) % PROMPTS.length;
        promptData[todayKey].idx = newIdx;
        promptData[todayKey].text = '';
        savePrompts();
        renderPrompt();
      };
    }
  }

  loadPrompts();
  setTimeout(function(){ renderPrompt(); wireEvents(); }, 100);

  // Expose for cloud sync
  window._promptRender = renderPrompt;
})();
