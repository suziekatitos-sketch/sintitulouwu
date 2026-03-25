// ════════════════════════════════════════════════════════════════
// Yuki 🌸 — modules_42_50.js
// ════════════════════════════════════════════════════════════════


(function(){
  var THEMES = [
    { id:'rosa',    label:'Rosa 🌸',  vars:{ '--bg':'#fff0f5','--surface':'#fce4ee','--card':'#fff7fa','--border':'#f0c8d8','--rosa':'#f4a7c0','--rosa-soft':'#fde8f0','--text':'#5a2d4a','--muted':'#b07090','--muted2':'#d4a0b8' }},
    { id:'lila',    label:'Lila 💜',  vars:{ '--bg':'#f5f0ff','--surface':'#ede4fc','--card':'#faf7ff','--border':'#d4c8f0','--rosa':'#9b7fd4','--rosa-soft':'#ede4fc','--text':'#2d1a5a','--muted':'#7060a0','--muted2':'#b4a0d8' }},
    { id:'menta',   label:'Menta 🌿', vars:{ '--bg':'#f0fff5','--surface':'#e4fce8','--card':'#f7fff9','--border':'#c8f0d0','--rosa':'#5bbf7a','--rosa-soft':'#e4fce8','--text':'#1a4a2a','--muted':'#4a8a5a','--muted2':'#90c8a0' }},
    { id:'melocoton',label:'Durazno 🍑',vars:{ '--bg':'#fff5f0','--surface':'#fce8e0','--card':'#fffaf7','--border':'#f0d4c0','--rosa':'#e8906a','--rosa-soft':'#fce8e0','--text':'#5a2d1a','--muted':'#b07050','--muted2':'#d4b0a0' }},
    { id:'azul',    label:'Azul 🩵',  vars:{ '--bg':'#f0f5ff','--surface':'#e0eafc','--card':'#f7faff','--border':'#c0d4f0','--rosa':'#6a9fe8','--rosa-soft':'#e0eafc','--text':'#1a2d5a','--muted':'#5070a0','--muted2':'#a0b8d8' }},
    { id:'neutro',  label:'Neutro 🤍',vars:{ '--bg':'#fafafa','--surface':'#f0f0f0','--card':'#ffffff','--border':'#e0e0e0','--rosa':'#9e9e9e','--rosa-soft':'#f0f0f0','--text':'#2a2a2a','--muted':'#707070','--muted2':'#b0b0b0' }},
    { id:'noche',   label:'Noche 🌙', vars:{ '--bg':'#12121e','--surface':'#1a1a2e','--card':'#1e1e30','--border':'#2e2e48','--rosa':'#a78bfa','--rosa-soft':'#2a1f4a','--verde':'#c4b5fd','--verde-soft':'#2a1f4a','--pink-light':'#2a1f4a','--text':'#f0f0ff','--muted':'#a0a0c8','--muted2':'#606088','--manana-bg':'#1e1e30','--manana-border':'#3a2a18','--tarde-bg':'#1e1a2e','--tarde-border':'#3a1a2e','--noche-bg':'#1a1e2e','--noche-border':'#1a2040','--beige-soft':'#2a1f2e','--verde-soft':'#1a2a2a','--rosa-soft':'#2a1f4a' }},
    { id:'candy',   label:'Candy 🍬', vars:{ '--bg':'#fff0fb','--surface':'#fce4f8','--card':'#fff7fe','--border':'#f0c0e8','--rosa':'#e060c0','--rosa-soft':'#fce4f8','--text':'#5a0a4a','--muted':'#b040a0','--muted2':'#d890c8' }},
    { id:'formal', label:'Formal 🤍', vars:{ '--bg':'#ffffff','--surface':'#f7f7f7','--card':'#ffffff','--border':'#e8e8e8','--rosa':'#007aff','--rosa-soft':'#f0f5ff','--verde':'#34c759','--verde-soft':'#f0fff4','--beige':'#007aff','--beige-soft':'#f0f5ff','--pink-light':'#f0f5ff','--text':'#000000','--muted':'#8e8e93','--muted2':'#c7c7cc','--manana-bg':'#fffbf0','--manana-border':'#ffe5a0','--tarde-bg':'#fff0f0','--tarde-border':'#ffc0c0','--noche-bg':'#f0f0ff','--noche-border':'#c0c0f0' }},
    { id:'tierra', label:'Tierra 🪨', vars:{ '--bg':'#2e1f14','--surface':'#3d2a1a','--card':'#4a3322','--border':'#6b4a30','--rosa':'#c4845a','--rosa-soft':'#5a3520','--verde':'#a89060','--verde-soft':'#3a3020','--beige':'#c4845a','--beige-soft':'#5a3520','--pink-light':'#5a3520','--text':'#f2e0cc','--muted':'#c4a882','--muted2':'#8a6a50','--manana-bg':'#3d2e18','--manana-border':'#7a5a30','--tarde-bg':'#3d2418','--tarde-border':'#7a4030','--noche-bg':'#221a2e','--noche-border':'#4a3060' }},
  ];

  var currentTheme = localStorage.getItem('config_theme') || 'rosa';

  // Valores base de las variables para resetear al cambiar tema
  var BASE_VARS = { '--verde':'#b39ddb','--verde-soft':'#ede7f6','--pink-light':'#fde8f0','--beige-soft':'#fde8f0','--rosa-soft':'#fde8f0','--beige':'#f4a7c0','--beige-soft':'#fde8f0','--manana-bg':'#fff4e6','--manana-border':'#f9c580','--tarde-bg':'#fde8f0','--tarde-border':'#f4a7c0','--noche-bg':'#eef0fb','--noche-border':'#b0b8e8' };

  function applyTheme(themeId) {
    var t = THEMES.find(function(x){ return x.id===themeId; });
    if (!t) return;
    var root = document.documentElement;
    // Resetear vars base primero por si el tema anterior sobreescribió algo
    Object.keys(BASE_VARS).forEach(function(k){
      if (!t.vars[k]) root.style.setProperty(k, BASE_VARS[k]);
    });
    Object.keys(t.vars).forEach(function(k){ root.style.setProperty(k, t.vars[k]); });
    currentTheme = themeId;
    localStorage.setItem('config_theme', themeId);
    document.body.setAttribute('data-theme', themeId);
    renderThemeGrid();
  }

  function renderThemeGrid() {
    var grid = document.getElementById('themeGrid'); if(!grid) return;
    grid.innerHTML = '';
    THEMES.forEach(function(t) {
      var btn = document.createElement('button');
      btn.className = 'theme-btn' + (t.id === currentTheme ? ' active' : '');
      var swatch = document.createElement('div');
      swatch.className = 'theme-swatch';
      swatch.style.background = t.vars['--bg'];
      swatch.style.border = '2px solid ' + t.vars['--border'];
      swatch.style.boxShadow = '0 0 0 3px ' + t.vars['--rosa'] + '44';
      swatch.textContent = t.label.split(' ')[1];
      btn.appendChild(swatch);
      btn.appendChild(document.createTextNode(t.label.split(' ')[0]));
      btn.onclick = (function(id){ return function(){ applyTheme(id); }; })(t.id);
      grid.appendChild(btn);
    });
  }

  function configLoadProfile() {
    var user = window._currentUser;
    var customName = localStorage.getItem('config_display_name');
    var customAvatar = localStorage.getItem('config_avatar_url');

    var nameInp = document.getElementById('configDisplayName');
    var bigAvatar = document.getElementById('configAvatarBig');
    var bigName = document.getElementById('configAvatarName');
    var bigEmail = document.getElementById('configAvatarEmail');

    if (nameInp) nameInp.value = customName || (user ? (user.displayName||'') : '');
    if (bigName) bigName.textContent = customName || (user ? (user.displayName ? user.displayName.split(' ')[0] : 'tú') : 'tú');
    if (bigEmail) bigEmail.textContent = user ? (user.email||'') : '';
    if (bigAvatar) {
      var src = customAvatar || (user ? user.photoURL : '');
      if (src) bigAvatar.innerHTML = '<img src="'+src+'" style="width:100%;height:100%;object-fit:cover;border-radius:50%"><div class="config-avatar-overlay">📷</div>';
      else bigAvatar.innerHTML = '🌸<div class="config-avatar-overlay">📷</div>';
    }
  }

  window.configHandleAvatarUpload = function(input) {
    var file = input.files && input.files[0];
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function(e) {
      var base64 = e.target.result;
      localStorage.setItem('config_avatar_url', base64);
      if (window.cloudSave) window.cloudSave('config_avatar_url', base64);
      // Update avatar preview
      var bigAvatar = document.getElementById('configAvatarBig');
      if (bigAvatar) bigAvatar.innerHTML = '<img src="'+base64+'" style="width:100%;height:100%;object-fit:cover;border-radius:50%"><div class="config-avatar-overlay">📷</div>';
      // Update drawer and header
      var dai = document.getElementById('drawerAvatarImg');
      var dap = document.getElementById('drawerAvatarPlaceholder');
      var headerAvatar = document.getElementById('user-avatar');
      if (dai) { dai.src = base64; dai.style.display = ''; if (dap) dap.style.display = 'none'; }
      if (headerAvatar) headerAvatar.src = base64;
    };
    reader.readAsDataURL(file);
  };

  window.configSaveProfile = function() {
    var nameVal = (document.getElementById('configDisplayName')||{}).value || '';
    var avatarVal = localStorage.getItem('config_avatar_url') || '';
    localStorage.setItem('config_display_name', nameVal.trim());

    // Actualizar drawer y header
    var dn = document.getElementById('drawerProfileName');
    var dai = document.getElementById('drawerAvatarImg');
    var dap = document.getElementById('drawerAvatarPlaceholder');
    var headerName = document.getElementById('user-display-name');
    var headerAvatar = document.getElementById('user-avatar');
    if (dn) dn.textContent = nameVal.trim() || (window._currentUser ? (window._currentUser.displayName||'tú').split(' ')[0] : 'tú');
    if (headerName) headerName.textContent = nameVal.trim() || (window._currentUser ? (window._currentUser.displayName||'tú').split(' ')[0] : 'tú');
    if (avatarVal.trim()) {
      if (dai) { dai.src=avatarVal.trim(); dai.style.display=''; }
      if (dap) dap.style.display='none';
      if (headerAvatar) headerAvatar.src=avatarVal.trim();
    }
    configLoadProfile();
    var ok = document.getElementById('configProfileOk');
    if (ok) { ok.classList.add('show'); setTimeout(function(){ ok.classList.remove('show'); }, 2000); }
  };

  window.configExportData = function() {
    var keys = ['sem_data','sem_custom','recurring_tasks','completions','rutina_templates',
      'rutina_asignaciones','rutina_completions','gratitud_data','sueno_data','mens_data',
      'ej_templates','ej_registros','belleza_templates','belleza_registros','dios_data',
      'finanzas_data','limpieza_data','braindump_notes','mood_data','metas_data',
      'ql_lists','wl_items','wishlist_items','vb_items','config_display_name','config_avatar_url','config_theme','yuki_mascotas','yuki_plantas','yuki_biblioteca_playlists','yuki_biblioteca_dopamina','yuki_diario'];
    var data = { exportDate: new Date().toISOString(), version: '1.0' };
    keys.forEach(function(k){
      try { var v=localStorage.getItem(k); if(v) data[k]=JSON.parse(v); } catch(e){ data[k]=localStorage.getItem(k); }
    });
    var blob = new Blob([JSON.stringify(data, null, 2)], {type:'application/json'});
    var a = document.createElement('a'); a.href=URL.createObjectURL(blob);
    a.download = 'yuki-backup-'+new Date().toISOString().slice(0,10)+'.json';
    a.click();
  };

  // Init cuando se abre la página
  var _origShowPage = window.showPage;
  window.showPage = function(pageId) {
    if (_origShowPage) _origShowPage(pageId);
    if (pageId === 'page-config') { setTimeout(function(){ configLoadProfile(); renderThemeGrid(); configLoadExperience(); var imgBlock = document.getElementById('configImgBlock'); if(imgBlock) imgBlock.style.display = window.innerWidth >= 900 ? '' : 'none'; }, 50); }
    if (pageId === 'page-buscar') { setTimeout(function(){ if(window._buscarInit) window._buscarInit(); }, 150); }
  };

  // Guardar referencia al usuario actual
  var _origAuth = window._onAuthUser;
  window._onConfigUser = function(user) { window._currentUser = user; };

  // Aplicar tema guardado al cargar
  if (currentTheme !== 'rosa') applyTheme(currentTheme);
  else document.body.setAttribute('data-theme', 'rosa');
  setTimeout(function(){ renderThemeGrid(); configLoadProfile(); }, 300);
})();



// ============================================================
//  SISTEMA DE NOTIFICACIONES
// ============================================================

var _notifTimer = null;
var _notifFiredToday = {}; // key: avoid firing twice same notif

function notifSupported() {
  return 'Notification' in window;
}

function notifPermission() {
  return notifSupported() ? Notification.permission : 'denied';
}

window.notifRequestPermission = function() {
  if (!notifSupported()) {
    alert('Tu navegador no soporta notificaciones 😔');
    return;
  }
  Notification.requestPermission().then(function(perm) {
    notifUpdatePermBtn();
    if (perm === 'granted') {
      notifStart();
      new Notification('Yuki 🌸', {
        body: 'Notificaciones activadas ✦ Te avisaré cuando sea hora 🔔',
        icon: '/icon-192.png'
      });
    }
  });
};

function notifUpdatePermBtn() {
  var btn  = document.getElementById('notifPermBtn');
  var icon = document.getElementById('notifPermIcon');
  var text = document.getElementById('notifPermText');
  var sub  = document.getElementById('notifPermSub');
  if (!btn) return;
  var perm = notifPermission();
  if (perm === 'granted') {
    if (icon) icon.textContent = '✅';
    if (text) text.textContent = 'Notificaciones activas';
    if (sub)  sub.textContent  = 'Recibirás avisos mientras la app está abierta';
    btn.style.opacity = '.7'; btn.style.pointerEvents = 'none';
  } else if (perm === 'denied') {
    if (icon) icon.textContent = '🚫';
    if (text) text.textContent = 'Permiso denegado';
    if (sub)  sub.textContent  = 'Actívalo manualmente en la configuración del navegador';
    btn.style.opacity = '.7'; btn.style.pointerEvents = 'none';
  } else {
    if (icon) icon.textContent = '🔔';
    if (text) text.textContent = 'Activar notificaciones';
    if (sub)  sub.textContent  = 'El navegador pedirá permiso';
  }
}

window.notifSaveHabitoHora = function() {
  var val = (document.getElementById('notifHabitoHora') || {}).value || '08:00';
  localStorage.setItem('notif_habito_hora', val);
  var ok = document.getElementById('notifHabitoOk');
  if (ok) { ok.classList.add('show'); setTimeout(function(){ ok.classList.remove('show'); }, 2000); }
};

// ── Recordatorios personalizados ─────────────────────────
function customNotifLoad() {
  try { return JSON.parse(localStorage.getItem('custom_notifs') || '[]'); } catch(e) { return []; }
}
function customNotifSave(data) {
  localStorage.setItem('custom_notifs', JSON.stringify(data));
  if(window.cloudSave) window.cloudSave('custom_notifs', data);
}

window.customNotifAdd = function() {
  var text = (document.getElementById('customNotifText') || {}).value || '';
  var time = (document.getElementById('customNotifTime') || {}).value || '';
  text = text.trim();
  if (!text || !time) return;
  var data = customNotifLoad();
  data.push({ id: Date.now().toString(), text: text, time: time, active: true });
  customNotifSave(data);
  document.getElementById('customNotifText').value = '';
  document.getElementById('customNotifTime').value = '';
  customNotifRender();
};

window.customNotifDelete = function(id) {
  customNotifSave(customNotifLoad().filter(function(n) { return n.id !== id; }));
  customNotifRender();
};

window.customNotifToggle = function(id) {
  var data = customNotifLoad().map(function(n) {
    return n.id === id ? Object.assign({}, n, { active: !n.active }) : n;
  });
  customNotifSave(data);
  customNotifRender();
};

function customNotifRender() {
  var cont = document.getElementById('customNotifList');
  if (!cont) return;
  var data = customNotifLoad();
  if (!data.length) {
    cont.innerHTML = '<p style="font-size:.72rem;color:var(--muted2);font-weight:600">Aún no tienes recordatorios personalizados 🌸</p>';
    return;
  }
  cont.innerHTML = data.map(function(n) {
    return '<div style="display:flex;align-items:center;gap:.5rem;background:var(--surface);border-radius:10px;padding:.5rem .7rem;border:1px solid var(--border)">' +
      '<span style="font-size:.8rem;font-weight:800;color:var(--rosa)">' + n.time + '</span>' +
      '<span style="flex:1;font-size:.78rem;font-weight:600;color:' + (n.active ? 'var(--text)' : 'var(--muted2)') + ';text-decoration:' + (n.active ? 'none' : 'line-through') + '">' + n.text + '</span>' +
      '<button onclick="customNotifToggle(\'' + n.id + '\')" style="background:none;border:none;cursor:pointer;font-size:.75rem;color:var(--muted);padding:.1rem .3rem" title="' + (n.active ? 'Desactivar' : 'Activar') + '">' + (n.active ? '🔔' : '🔕') + '</button>' +
      '<button onclick="customNotifDelete(\'' + n.id + '\')" style="background:none;border:none;cursor:pointer;font-size:.75rem;color:var(--muted2);padding:.1rem .3rem">✕</button>' +
    '</div>';
  }).join('');
}

// Integrar con el setInterval de notificaciones existente
var _origNotifCheck = window._notifCheck;
window._customNotifFiredToday = window._customNotifFiredToday || {};

function checkCustomNotifs() {
  if (notifPermission() !== 'granted') return;
  var now = new Date();
  var hh = String(now.getHours()).padStart(2,'0');
  var mm = String(now.getMinutes()).padStart(2,'0');
  var nowStr = hh + ':' + mm;
  var data = customNotifLoad();
  data.forEach(function(n) {
    if (!n.active) return;
    if (n.time !== nowStr) return;
    var tag = 'custom_' + n.id + '_' + nowStr;
    if (_customNotifFiredToday[tag]) return;
    _customNotifFiredToday[tag] = true;
    try { new Notification('🌸 Yuki — Recordatorio', { body: n.text, tag: tag }); } catch(e) {}
  });
}

// Hook al setInterval existente
var _customNotifInterval = setInterval(checkCustomNotifs, 60000);

// Render al cargar config
document.addEventListener('DOMContentLoaded', function() {
  customNotifRender();
});
// También render cuando se abre la página de config
var _origShowForNotif = window.showPage;
window.showPage = function(pageId) {
  if (_origShowForNotif) _origShowForNotif(pageId);
  if (pageId === 'page-config') setTimeout(customNotifRender, 200);
};

function notifFire(title, body, tag) {
  if (notifPermission() !== 'granted') return;
  if (_notifFiredToday[tag]) return; // don't repeat same notif
  _notifFiredToday[tag] = true;
  try {
    new Notification(title, { body: body, icon: '/icon-192.png', tag: tag });
  } catch(e) {}
}

function notifCheck() {
  var now = new Date();
  var hh  = String(now.getHours()).padStart(2,'0');
  var mm  = String(now.getMinutes()).padStart(2,'0');
  var timeStr = hh + ':' + mm;
  var todayKey = now.getFullYear() + '-' + String(now.getMonth()+1).padStart(2,'0') + '-' + String(now.getDate()).padStart(2,'0');

  // Reset fired keys at midnight
  var lastReset = localStorage.getItem('notif_last_reset');
  if (lastReset !== todayKey) {
    _notifFiredToday = {};
    localStorage.setItem('notif_last_reset', todayKey);
  }

  // ── 1. Hábitos — hora configurable
  var habitoHora = localStorage.getItem('notif_habito_hora') || '08:00';
  if (timeStr === habitoHora) {
    if (typeof habitosData !== 'undefined' && habitosData.length) {
      var pendientes = habitosData.filter(function(h) { return !h.completions[todayKey]; });
      if (pendientes.length) {
        notifFire(
          'Yuki 🔥 Hábitos',
          'Tienes ' + pendientes.length + ' hábito' + (pendientes.length > 1 ? 's' : '') + ' pendiente' + (pendientes.length > 1 ? 's' : '') + ' hoy',
          'habitos_' + todayKey
        );
      }
    }
  }

  // ── 2. Rutinas del día — notificar a la hora de cada franja
  var FRANJAS = [
    { id:'m', label:'Mañana',  hora:'07:00' },
    { id:'t', label:'Tarde',   hora:'12:00' },
    { id:'n', label:'Noche',   hora:'19:00' },
  ];
  if (typeof rutinaTemplates !== 'undefined' && typeof rutinaAsignaciones !== 'undefined') {
    var dow = ['dom','lun','mar','mie','jue','vie','sab'][now.getDay()];
    FRANJAS.forEach(function(franja) {
      var horaNotif = localStorage.getItem('notif_rutina_' + franja.id) || franja.hora;
      if (timeStr === horaNotif) {
        var tag = 'rutina_' + franja.id + '_' + todayKey;
        var asig = rutinaAsignaciones[dow] && rutinaAsignaciones[dow][franja.id];
        if (asig) {
          var tpl = rutinaTemplates.find(function(t){ return t.id === asig; });
          if (tpl) {
            notifFire(
              'Yuki ' + (tpl.emoji || '🌸') + ' ' + franja.label,
              '¡Es hora de tu rutina: ' + tpl.name + '!',
              tag
            );
          }
        }
      }
    });
  }

  // ── 3. Exámenes de Universidad — aviso el día anterior
  if (typeof univData !== 'undefined' && univData.semestres) {
    var tomorrow = new Date(now); tomorrow.setDate(now.getDate() + 1);
    var tomorrowKey = tomorrow.getFullYear() + '-' + String(tomorrow.getMonth()+1).padStart(2,'0') + '-' + String(tomorrow.getDate()).padStart(2,'0');
    var examHora = localStorage.getItem('notif_examen_hora') || '20:00';
    if (timeStr === examHora) {
      var sem = univData.semestres.find(function(s){ return s.activo; });
      if (sem && sem.examenes) {
        sem.examenes.forEach(function(ex) {
          if (ex.fecha === tomorrowKey) {
            notifFire(
              'Yuki 📚 Examen mañana',
              (ex.materia || 'Tienes un examen') + ' mañana — ¡tú puedes! 💙',
              'examen_' + ex.id + '_' + todayKey
            );
          }
        });
      }
    }
  }
}

function notifStart() {
  if (_notifTimer) clearInterval(_notifTimer);
  _notifTimer = setInterval(notifCheck, 60000); // check every minute
  notifCheck(); // check immediately on start
}

// Init on load
document.addEventListener('DOMContentLoaded', function() {
  notifUpdatePermBtn();
  // Load habito hora input
  var horaInput = document.getElementById('notifHabitoHora');
  if (horaInput) horaInput.value = localStorage.getItem('notif_habito_hora') || '08:00';
  // Start if already granted
  if (notifPermission() === 'granted') notifStart();
});

// Also update btn when config page opens
var _origShowPageNotif = window.showPage;
window.showPage = function(pageId) {
  if (_origShowPageNotif) _origShowPageNotif(pageId);
  if (pageId === 'page-config') {
    setTimeout(function() {
      notifUpdatePermBtn();
      var horaInput = document.getElementById('notifHabitoHora');
      if (horaInput) horaInput.value = localStorage.getItem('notif_habito_hora') || '08:00';
    }, 60);
  }
};



// ── Historial de navegación interno (botón regresar)
(function(){
  var history = ['page-inicio'];
  var current = 'page-inicio';

  var _origShowBack = window.showPage;
  window.showPage = function(pageId) {
    if (_origShowBack) _origShowBack(pageId);
    if (pageId && pageId !== current) {
      history.push(pageId);
      if (history.length > 20) history.shift();
      current = pageId;
    }
    updateBackBtn();
  };

  window.yukiGoBack = function() {
    if (history.length <= 1) return;
    history.pop(); // quitar current
    var prev = history[history.length - 1] || 'page-inicio';
    current = prev;
    if (window.showPage) {
      // llamar el chain sin agregar al historial de nuevo
      var _temp = window.showPage;
      window.showPage = _origShowBack;
      if (_origShowBack) _origShowBack(prev);
      window.showPage = _temp;
    }
    updateBackBtn();
  };

  function updateBackBtn() {
    var btn = document.getElementById('backBtn');
    if (!btn) return;
    var onInicio = current === 'page-inicio' || history.length <= 1;
    btn.classList.toggle('visible', !onInicio);
  }

  updateBackBtn();
})();



// ============================================================
//  EXPORTAR A PDF
// ============================================================

function pdfOpenWindow(title, htmlContent) {
  var w = window.open('', '_blank');
  if (!w) { alert('Permite ventanas emergentes para exportar PDF'); return; }
  var nombre = localStorage.getItem('config_display_name') || 'kittyplan';
  var fecha  = new Date().toLocaleDateString('es-MX', { year:'numeric', month:'long', day:'numeric' });
  w.document.write(`<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>${title}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&family=Playfair+Display:ital@1&display=swap');
  * { box-sizing:border-box; margin:0; padding:0; }
  body { font-family:'Inter',Arial,sans-serif; color:#1a1a2e; background:#fff; padding:2.5rem 3rem; font-size:13px; line-height:1.6; }
  h1 { font-family:'Playfair Display',Georgia,serif; font-style:italic; color:#d4748a; font-size:2rem; margin-bottom:.2rem; }
  .subtitle { color:#888; font-size:.8rem; font-weight:600; margin-bottom:2rem; }
  h2 { font-size:1rem; font-weight:800; color:#1a1a2e; margin:1.6rem 0 .7rem; padding-bottom:.3rem; border-bottom:2px solid #f0e0e6; }
  h3 { font-size:.85rem; font-weight:700; color:#d4748a; margin:.9rem 0 .3rem; }
  table { width:100%; border-collapse:collapse; margin-bottom:1rem; }
  th { background:#fdf0f3; color:#d4748a; font-size:.72rem; font-weight:800; text-transform:uppercase; letter-spacing:.07em; padding:.5rem .7rem; text-align:left; border-bottom:2px solid #f0e0e6; }
  td { padding:.45rem .7rem; border-bottom:1px solid #f5f5f5; font-size:.82rem; vertical-align:top; }
  tr:last-child td { border-bottom:none; }
  .badge { display:inline-block; padding:.15rem .5rem; border-radius:20px; font-size:.68rem; font-weight:700; }
  .badge-rosa { background:#fdf0f3; color:#d4748a; }
  .badge-verde { background:#f0fdf4; color:#22a05a; }
  .badge-amber { background:#fffbeb; color:#b45309; }
  .badge-gray  { background:#f5f5f5; color:#888; }
  .stat-row { display:flex; gap:1.5rem; margin-bottom:1.2rem; flex-wrap:wrap; }
  .stat-box { background:#fdf0f3; border-radius:10px; padding:.7rem 1.1rem; min-width:110px; }
  .stat-val { font-size:1.4rem; font-weight:800; color:#d4748a; }
  .stat-label { font-size:.68rem; font-weight:700; color:#888; text-transform:uppercase; letter-spacing:.06em; }
  .footer { margin-top:2.5rem; padding-top:.8rem; border-top:1px solid #f0e0e6; color:#bbb; font-size:.72rem; text-align:right; }
  .empty { color:#bbb; font-style:italic; font-size:.8rem; padding:.5rem 0; }
  @media print {
    body { padding:1.5rem 2rem; }
    button { display:none !important; }
  }

  /* ── Tema Formal: sin cursivas, títulos en negrita con la fuente de la app ── */
  [data-theme="formal"] {
    --font-title: var(--font-body);
  }
  [data-theme="formal"] h1,
  [data-theme="formal"] h2,
  [data-theme="formal"] h3,
  [data-theme="formal"] h4,
  [data-theme="formal"] .section-title,
  [data-theme="formal"] .section-title em,
  [data-theme="formal"] .drawer-kittyplan,
  [data-theme="formal"] .page-title,
  [data-theme="formal"] .config-block-title {
    font-style: normal;
    font-family: var(--font-body);
  }
  [data-theme="formal"] .section-title,
  [data-theme="formal"] .section-title em,
  [data-theme="formal"] h1 {
    font-weight: 800;
    letter-spacing: -.01em;
  }
  [data-theme="formal"] h2,
  [data-theme="formal"] h3 { font-weight: 700; }
</style>
</head>
<body>
<h1>${title}</h1>
<div class="subtitle">${nombre} · ${fecha}</div>
${htmlContent}
<div class="footer">Generado por Yuki 🌸</div>
<script>setTimeout(function(){ window.print(); }, 400);<\/script>
</body></html>`);
  w.document.close();
}

// ── Universidad
window.pdfExportUniv = function() {
  var sem = null;
  if (typeof univData !== 'undefined' && univData.semestres) {
    sem = univData.semestres.find(function(s){ return s.activo; });
  }
  if (!sem) {
    // try localStorage
    try {
      var saved = JSON.parse(localStorage.getItem('univ_data') || 'null');
      if (saved && saved.semestres) sem = saved.semestres.find(function(s){ return s.activo; });
    } catch(e){}
  }
  if (!sem) { alert('No hay semestre activo en Universidad 😔'); return; }

  var html = '';

  // Materias
  html += '<h2>📚 Materias</h2>';
  if (sem.materias && sem.materias.length) {
    html += '<table><tr><th>Materia</th><th>Profesor</th><th>Calificación</th></tr>';
    sem.materias.forEach(function(m) {
      html += '<tr><td><strong>' + esc(m.nombre||m.name||'') + '</strong></td>'
            + '<td>' + esc(m.profesor||'—') + '</td>'
            + '<td>' + esc(m.calificacion||m.cal||'—') + '</td></tr>';
    });
    html += '</table>';
  } else { html += '<p class="empty">Sin materias registradas</p>'; }

  // Exámenes
  html += '<h2>📝 Exámenes</h2>';
  if (sem.examenes && sem.examenes.length) {
    var exams = sem.examenes.slice().sort(function(a,b){ return (a.fecha||'').localeCompare(b.fecha||''); });
    html += '<table><tr><th>Materia</th><th>Fecha</th><th>Tema</th><th>Estado</th></tr>';
    exams.forEach(function(ex) {
      var hoy = new Date().toISOString().slice(0,10);
      var estado = ex.done ? '<span class="badge badge-verde">✓ Listo</span>'
                 : ex.fecha < hoy ? '<span class="badge badge-gray">Pasado</span>'
                 : '<span class="badge badge-rosa">Pendiente</span>';
      var fechaFmt = ex.fecha ? new Date(ex.fecha+'T12:00').toLocaleDateString('es-MX',{day:'numeric',month:'short'}) : '—';
      html += '<tr><td><strong>' + esc(ex.materia||'—') + '</strong></td>'
            + '<td>' + fechaFmt + '</td>'
            + '<td>' + esc(ex.tema||ex.descripcion||'—') + '</td>'
            + '<td>' + estado + '</td></tr>';
    });
    html += '</table>';
  } else { html += '<p class="empty">Sin exámenes registrados</p>'; }

  // Proyectos
  var proyectos = [];
  if (typeof univProyectos !== 'undefined') proyectos = univProyectos;
  else { try { proyectos = JSON.parse(localStorage.getItem('univ_proyectos')||'[]'); } catch(e){} }

  html += '<h2>🔬 Proyectos</h2>';
  if (proyectos.length) {
    html += '<table><tr><th>Proyecto</th><th>Materia</th><th>Entrega</th><th>Progreso</th></tr>';
    proyectos.forEach(function(p) {
      var entrega = p.fecha_entrega ? new Date(p.fecha_entrega+'T12:00').toLocaleDateString('es-MX',{day:'numeric',month:'short'}) : '—';
      var pct = p.progreso != null ? p.progreso + '%' : '—';
      html += '<tr><td><strong>' + esc(p.nombre||p.name||'') + '</strong></td>'
            + '<td>' + esc(p.materia||'—') + '</td>'
            + '<td>' + entrega + '</td>'
            + '<td><span class="badge badge-rosa">' + pct + '</span></td></tr>';
    });
    html += '</table>';
  } else { html += '<p class="empty">Sin proyectos registrados</p>'; }

  pdfOpenWindow('Reporte Universidad', html);
};

// ── Finanzas
window.pdfExportFinanzas = function() {
  var movs = [], cats = [];
  if (typeof finMovimientos !== 'undefined') { movs = finMovimientos; cats = finCategorias || []; }
  else {
    try {
      var raw = JSON.parse(localStorage.getItem('finanzas_data')||'null');
      if (raw) { movs = raw.movimientos||[]; cats = raw.categorias||[]; }
    } catch(e){}
  }

  var now = new Date();
  var mes = now.toLocaleDateString('es-MX', { month:'long', year:'numeric' });
  var movsDelMes = movs.filter(function(m) {
    var d = new Date(m.fecha);
    return d.getFullYear()===now.getFullYear() && d.getMonth()===now.getMonth();
  });

  var ingresos = movsDelMes.filter(function(m){ return m.tipo==='ingreso'; }).reduce(function(s,m){ return s+(+m.monto||0); },0);
  var gastos   = movsDelMes.filter(function(m){ return m.tipo==='gasto';   }).reduce(function(s,m){ return s+(+m.monto||0); },0);
  var balance  = ingresos - gastos;

  // Group gastos by category
  var byCat = {};
  movsDelMes.filter(function(m){ return m.tipo==='gasto'; }).forEach(function(m) {
    var cat = m.categoria || 'Sin categoría';
    byCat[cat] = (byCat[cat]||0) + (+m.monto||0);
  });

  var fmt = function(n){ return '$' + n.toLocaleString('es-MX', {minimumFractionDigits:2,maximumFractionDigits:2}); };

  var html = '';

  // Stats
  html += '<div class="stat-row">'
        + '<div class="stat-box"><div class="stat-val">' + fmt(ingresos) + '</div><div class="stat-label">Ingresos</div></div>'
        + '<div class="stat-box" style="background:#fff5f5"><div class="stat-val" style="color:#e05a6a">' + fmt(gastos) + '</div><div class="stat-label">Gastos</div></div>'
        + '<div class="stat-box" style="background:' + (balance>=0?'#f0fdf4':'#fff5f5') + '"><div class="stat-val" style="color:' + (balance>=0?'#22a05a':'#e05a6a') + '">' + fmt(Math.abs(balance)) + '</div><div class="stat-label">Balance ' + (balance>=0?'positivo':'negativo') + '</div></div>'
        + '</div>';

  // Gastos por categoría
  html += '<h2>📊 Gastos por Categoría — ' + mes + '</h2>';
  var catEntries = Object.entries(byCat).sort(function(a,b){ return b[1]-a[1]; });
  if (catEntries.length) {
    html += '<table><tr><th>Categoría</th><th>Total</th><th>% del total</th></tr>';
    catEntries.forEach(function(e) {
      var pct = gastos > 0 ? Math.round(e[1]/gastos*100) : 0;
      html += '<tr><td>' + esc(e[0]) + '</td><td><strong>' + fmt(e[1]) + '</strong></td><td><span class="badge badge-rosa">' + pct + '%</span></td></tr>';
    });
    html += '</table>';
  } else { html += '<p class="empty">Sin gastos este mes</p>'; }

  // Movimientos detallados
  html += '<h2>💳 Movimientos del Mes</h2>';
  if (movsDelMes.length) {
    var sorted = movsDelMes.slice().sort(function(a,b){ return (b.fecha||'').localeCompare(a.fecha||''); });
    html += '<table><tr><th>Fecha</th><th>Descripción</th><th>Categoría</th><th>Tipo</th><th>Monto</th></tr>';
    sorted.forEach(function(m) {
      var fechaFmt = m.fecha ? new Date(m.fecha+'T12:00').toLocaleDateString('es-MX',{day:'numeric',month:'short'}) : '—';
      var tipoBadge = m.tipo==='ingreso'
        ? '<span class="badge badge-verde">Ingreso</span>'
        : '<span class="badge badge-amber">Gasto</span>';
      html += '<tr><td>' + fechaFmt + '</td>'
            + '<td>' + esc(m.descripcion||m.concepto||'—') + '</td>'
            + '<td>' + esc(m.categoria||'—') + '</td>'
            + '<td>' + tipoBadge + '</td>'
            + '<td><strong>' + fmt(+m.monto||0) + '</strong></td></tr>';
    });
    html += '</table>';
  } else { html += '<p class="empty">Sin movimientos este mes</p>'; }

  pdfOpenWindow('Reporte Finanzas — ' + mes, html);
};

function esc(str) {
  return String(str||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}



// ============================================================
//  LLUVIA DE ESTRELLAS ✨
// ============================================================
(function(){
  var STAR_EMOJIS = ['⭐','✨','🌟','💫','⭐','✨','🌟'];

  window.starBurst = function(originEl) {
    var count = 12;
    var rect = originEl ? originEl.getBoundingClientRect() : null;
    var cx = rect ? rect.left + rect.width/2  : window.innerWidth/2;
    var cy = rect ? rect.top  + rect.height/2 : window.innerHeight/2;

    for (var i = 0; i < count; i++) {
      (function(i){
        var star = document.createElement('div');
        star.textContent = STAR_EMOJIS[i % STAR_EMOJIS.length];
        var angle  = (360 / count) * i + Math.random() * 20;
        var dist   = 60 + Math.random() * 80;
        var size   = 1 + Math.random() * .8;
        var delay  = Math.random() * 120;
        var rad    = angle * Math.PI / 180;
        var tx     = Math.cos(rad) * dist;
        var ty     = Math.sin(rad) * dist;

        star.style.cssText = [
          'position:fixed',
          'left:' + cx + 'px',
          'top:'  + cy + 'px',
          'font-size:' + (16 * size) + 'px',
          'pointer-events:none',
          'z-index:9999',
          'user-select:none',
          'transform:translate(-50%,-50%)',
          'transition:transform ' + (500 + delay) + 'ms cubic-bezier(.2,1,.3,1) ' + delay + 'ms, opacity 400ms ease ' + (delay+200) + 'ms',
          'opacity:1',
        ].join(';');

        document.body.appendChild(star);

        // Trigger animation
        requestAnimationFrame(function(){
          requestAnimationFrame(function(){
            star.style.transform = 'translate(calc(-50% + ' + tx + 'px), calc(-50% + ' + ty + 'px)) scale(' + (size * .5) + ')';
            star.style.opacity = '0';
          });
        });

        setTimeout(function(){ 
          if (star.parentNode) star.parentNode.removeChild(star); 
        }, 700 + delay);
      })(i);
    }
  };
})();



// ============================================================
//  MODO ENFOQUE 🎯
// ============================================================
(function(){

  var MOTIVATORS = [
    'Lo hiciste. Eso se llama disciplina 💙',
    'Cada sesión te acerca a quien quieres ser ✨',
    'Tu cerebro acaba de hacer algo increíble 🌟',
    'Pequeños pasos, grandes resultados 🔥',
    'Orgullo se construye momento a momento ⭐',
    'Eres más capaz de lo que crees 💫',
    'Una sesión más. Sigue así 🌸',
    'La constancia es tu superpoder 🦋',
    'Hoy te elegiste a ti misma. Bien hecho 💜',
  ];

  var TOTAL_CIRC = 2 * Math.PI * 96; // r=96
  var focusDuration = 25; // minutes
  var focusSecondsLeft = focusDuration * 60;
  var focusTotalSeconds = focusDuration * 60;
  var focusRunning = false;
  var focusTimer = null;
  var focusSessions = 0;
  var focusOverlay = null;

  // Audio context for beep
  function playBeep(type) {
    try {
      var ctx = new (window.AudioContext || window.webkitAudioContext)();
      var osc = ctx.createOscillator();
      var gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      if (type === 'start') {
        osc.frequency.value = 520; gain.gain.setValueAtTime(.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(.001, ctx.currentTime + .4);
        osc.start(); osc.stop(ctx.currentTime + .4);
      } else {
        // End: two tones
        osc.frequency.value = 440; gain.gain.setValueAtTime(.3, ctx.currentTime);
        osc.start(); osc.stop(ctx.currentTime + .25);
        var osc2 = ctx.createOscillator(); var g2 = ctx.createGain();
        osc2.connect(g2); g2.connect(ctx.destination);
        osc2.frequency.value = 660; g2.gain.setValueAtTime(.3, ctx.currentTime + .3);
        g2.gain.exponentialRampToValueAtTime(.001, ctx.currentTime + .7);
        osc2.start(ctx.currentTime + .3); osc2.stop(ctx.currentTime + .7);
      }
    } catch(e) {}
  }

  function updateRing() {
    var prog = document.getElementById('focusProgCircle');
    var digits = document.getElementById('focusDigits');
    if (!prog || !digits) return;
    var ratio = focusSecondsLeft / focusTotalSeconds;
    prog.style.strokeDashoffset = TOTAL_CIRC * (1 - ratio);
    var m = Math.floor(focusSecondsLeft / 60);
    var s = focusSecondsLeft % 60;
    digits.textContent = String(m).padStart(2,'0') + ':' + String(s).padStart(2,'0');
  }

  function updateDurDisplay() {
    var el = document.getElementById('focusDurDisplay');
    if (el) el.textContent = focusDuration + ' min';
  }

  function tick() {
    if (!focusRunning) return;
    focusSecondsLeft--;
    updateRing();
    if (focusSecondsLeft <= 0) {
      focusRunning = false;
      clearInterval(focusTimer);
      focusSessions++;
      saveFocusSessions();
      playBeep('end');
      updateSessionsDisplay();
      // Show motivator
      var motEl = document.getElementById('focusMotivator');
      if (motEl) {
        motEl.textContent = MOTIVATORS[Math.floor(Math.random() * MOTIVATORS.length)];
        motEl.classList.add('show');
      }
      // Stars burst from center
      if (window.starBurst) {
        var ring = document.getElementById('focusTimerRing');
        window.starBurst(ring);
      }
      // Send notification
      if (window.notifPermission && window.notifPermission() === 'granted') {
        try { new Notification('Yuki 🎯 ¡Sesión completada!', { body: MOTIVATORS[focusSessions % MOTIVATORS.length] }); } catch(e){}
      }
      var playBtn = document.getElementById('focusPlayBtn');
      if (playBtn) playBtn.textContent = '▶';
    }
  }

  function saveFocusSessions() {
    var dk = new Date().toISOString().slice(0,10);
    var data = {};
    try { data = JSON.parse(localStorage.getItem('focus_sessions') || '{}'); } catch(e){}
    data[dk] = (data[dk] || 0) + 1;
    try { localStorage.setItem('focus_sessions', JSON.stringify(data)); } catch(e){}
  }

  function getTodaySessions() {
    var dk = new Date().toISOString().slice(0,10);
    try { var d = JSON.parse(localStorage.getItem('focus_sessions') || '{}'); return d[dk] || 0; } catch(e){ return 0; }
  }

  function updateSessionsDisplay() {
    var el = document.getElementById('focusSessionsCount');
    if (el) el.textContent = getTodaySessions() + focusSessions;
  }

  // ── MODO EMERGENCIA ──────────────────────────────────────
  window.openModoEmergencia = function() {
    var ov = document.getElementById('emergenciaOverlay');
    if (ov) { ov.style.display = 'flex'; return; }

    ov = document.createElement('div');
    ov.id = 'emergenciaOverlay';
    ov.style.cssText = [
      'position:fixed;inset:0;z-index:9000;display:flex;flex-direction:column;',
      'align-items:center;justify-content:center;padding:2rem;',
      'background:linear-gradient(-45deg,#f8d7e8,#e8d5f8,#d5e8f8,#d5f8e8);',
      'background-size:400% 400%;animation:emergGrad 8s ease infinite;'
    ].join('');

    // Inject keyframes once
    if (!document.getElementById('emergStyles')) {
      var st = document.createElement('style');
      st.id = 'emergStyles';
      st.textContent = [
        '@keyframes emergGrad{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}',
        '@keyframes emergFadeIn{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}',
        '.emerg-task-btn{display:flex;align-items:center;gap:.7rem;width:100%;padding:.75rem 1rem;',
        'border-radius:14px;border:1.5px solid rgba(167,139,250,.4);background:rgba(255,255,255,.5);',
        'color:#3d2060;font-family:var(--font-body);font-size:.88rem;font-weight:700;cursor:pointer;',
        'text-align:left;transition:all .18s;margin-bottom:.5rem}',
        '.emerg-task-btn:hover{background:rgba(255,255,255,.8);border-color:#a78bfa;transform:scale(1.01)}'
      ].join('');
      document.head.appendChild(st);
    }

    ov.innerHTML = [
      '<div style="max-width:400px;width:100%;animation:emergFadeIn .5s ease both">',
        // Header
        '<div style="text-align:center;margin-bottom:1.8rem">',
          '<p style="font-size:2.5rem;margin-bottom:.4rem">🫂</p>',
          '<h2 style="font-family:var(--font-title);font-size:1.4rem;color:#3d2060;font-style:italic;margin-bottom:.4rem">',
            'Modo Emergencia',
          '</h2>',
          '<p style="font-size:.78rem;font-weight:600;color:#6b4f8c;line-height:1.6">',
            'Respira. No tienes que hacer todo.<br>Solo una cosa. La más pequeña. 💙',
          '</p>',
        '</div>',

        // Selector de tarea
        '<div id="emergTareaWrap">',
          '<p style="font-size:.7rem;font-weight:800;color:#6b4f8c;text-transform:uppercase;letter-spacing:.08em;margin-bottom:.6rem">',
            '¿En qué cosa pequeña puedes enfocarte ahora?',
          '</p>',
          '<div id="emergTareasList"></div>',
          '<div style="display:flex;gap:.5rem;margin-top:.5rem">',
            '<input id="emergTareaInput" placeholder="O escríbela aquí…" style="flex:1;background:rgba(255,255,255,.6);border:1.5px solid rgba(167,139,250,.4);border-radius:12px;padding:.6rem .8rem;font-family:var(--font-body);font-size:.84rem;color:#3d2060;outline:none">',
            '<button onclick="emergConfirmarTarea()" style="padding:.6rem 1rem;border-radius:12px;border:none;background:#a78bfa;color:#fff;font-family:var(--font-body);font-weight:800;cursor:pointer;font-size:.84rem">→</button>',
          '</div>',
        '</div>',

        // Pantalla de tarea activa (hidden initially)
        '<div id="emergActivaWrap" style="display:none;text-align:center">',
          '<div style="background:rgba(255,255,255,.55);border-radius:20px;padding:1.6rem 1.4rem;margin-bottom:1.2rem">',
            '<p style="font-size:.65rem;font-weight:800;color:#a78bfa;text-transform:uppercase;letter-spacing:.1em;margin-bottom:.6rem">ahora mismo, solo esto</p>',
            '<p id="emergTareaActual" style="font-size:1.2rem;font-weight:800;color:#3d2060;line-height:1.4"></p>',
          '</div>',
          '<p style="font-size:.75rem;color:#6b4f8c;font-weight:600;line-height:1.6;margin-bottom:1.2rem">',
            'No hay prisa. Cuando termines, o cuando estés lista, puedes cerrar este modo. 🌸',
          '</p>',
          '<button onclick="emergListo()" style="width:100%;padding:.75rem;border-radius:14px;border:none;background:#a78bfa;color:#fff;font-family:var(--font-body);font-size:.9rem;font-weight:800;cursor:pointer;margin-bottom:.5rem">',
            '✓ ¡Lo hice!',
          '</button>',
          '<button onclick="emergCambiar()" style="width:100%;padding:.5rem;border-radius:14px;border:none;background:none;color:#a78bfa;font-family:var(--font-body);font-size:.78rem;font-weight:700;cursor:pointer">',
            'Elegir otra tarea',
          '</button>',
        '</div>',

        // Cerrar
        '<button onclick="cerrarModoEmergencia()" style="display:block;margin:1.2rem auto 0;background:none;border:none;color:#9b7cc8;font-family:var(--font-body);font-size:.75rem;font-weight:700;cursor:pointer">',
          'Salir del Modo Emergencia',
        '</button>',
      '</div>'
    ].join('');

    document.body.appendChild(ov);
    emergRenderTareas();
  };

  function emergRenderTareas() {
    var cont = document.getElementById('emergTareasList'); if (!cont) return;
    var tareas = [];
    try { tareas = JSON.parse(localStorage.getItem('tareas_v2') || '[]').filter(function(t){ return !t.done; }); } catch(e){}
    if (!tareas.length) { cont.innerHTML = ''; return; }
    // Mostrar max 5 tareas más recientes
    cont.innerHTML = tareas.slice(0,5).map(function(t) {
      return '<button class="emerg-task-btn" onclick="emergSeleccionarTarea(\'' + (t.text||t.titulo||'').replace(/'/g,"\\'") + '\')">' +
        '<span>' + (t.emoji||'📌') + '</span>' +
        '<span>' + (t.text||t.titulo||'') + '</span>' +
      '</button>';
    }).join('');
  }

  window.emergSeleccionarTarea = function(texto) {
    document.getElementById('emergTareaActual').textContent = texto;
    document.getElementById('emergTareaWrap').style.display = 'none';
    document.getElementById('emergActivaWrap').style.display = '';
  };

  window.emergConfirmarTarea = function() {
    var input = document.getElementById('emergTareaInput');
    var texto = (input ? input.value.trim() : '');
    if (!texto) return;
    emergSeleccionarTarea(texto);
  };

  window.emergListo = function() {
    if (window.starBurst) starBurst(document.getElementById('emergActivaWrap'));
    setTimeout(cerrarModoEmergencia, 800);
  };

  window.emergCambiar = function() {
    document.getElementById('emergTareaWrap').style.display = '';
    document.getElementById('emergActivaWrap').style.display = 'none';
    var input = document.getElementById('emergTareaInput');
    if (input) input.value = '';
    emergRenderTareas();
  };

  window.cerrarModoEmergencia = function() {
    var ov = document.getElementById('emergenciaOverlay');
    if (ov) { ov.style.opacity='0'; ov.style.transition='opacity .3s'; setTimeout(function(){ if(ov.parentNode) ov.parentNode.removeChild(ov); },300); }
  };

  window.openFocusMode = function() {
    focusTotalSeconds = focusDuration * 60;
    focusRunning = false;
    clearInterval(focusTimer);

    focusOverlay = document.createElement('div');
    focusOverlay.className = 'focus-overlay';
    focusOverlay.id = 'focusOverlay';

    var todaySess = getTodaySessions();

    focusOverlay.innerHTML = `
      <button class="focus-close-btn" id="focusCloseBtn" title="Cerrar">✕</button>

      <div class="focus-task-label">¿En qué vas a enfocarte?</div>
      <input class="focus-task-input" id="focusTaskInput" placeholder="escribe tu tarea…" maxlength="60">

      <div class="focus-timer-ring" id="focusTimerRing">
        <svg class="focus-timer-svg" width="220" height="220" viewBox="0 0 220 220">
          <circle class="focus-timer-track" cx="110" cy="110" r="96"/>
          <circle class="focus-timer-prog" id="focusProgCircle" cx="110" cy="110" r="96"
            stroke-dasharray="${TOTAL_CIRC}" stroke-dashoffset="0"/>
        </svg>
        <div class="focus-timer-text">
          <div class="focus-timer-digits" id="focusDigits">25:00</div>
          <div class="focus-timer-phase" id="focusPhase">listo</div>
        </div>
      </div>

      <div class="focus-duration-row">
        <button class="focus-dur-btn" id="focusDurMinus">−</button>
        <div class="focus-dur-display" id="focusDurDisplay">${focusDuration} min</div>
        <button class="focus-dur-btn" id="focusDurPlus">＋</button>
      </div>

      <div class="focus-controls">
        <button class="focus-reset-btn" id="focusResetBtn" title="Reiniciar">↺</button>
        <button class="focus-play-btn" id="focusPlayBtn">▶</button>
      </div>

      <div class="focus-sessions" id="focusSessionsDisplay">
        Sesiones hoy: <span id="focusSessionsCount">${todaySess}</span>
      </div>

      <div class="focus-motivator" id="focusMotivator"></div>
    `;

    document.body.appendChild(focusOverlay);

    // Wire events
    document.getElementById('focusCloseBtn').onclick = closeFocusMode;

    document.getElementById('focusPlayBtn').onclick = function() {
      if (focusSecondsLeft <= 0) {
        // Reset first
        focusSecondsLeft = focusDuration * 60;
        focusTotalSeconds = focusDuration * 60;
        var motEl = document.getElementById('focusMotivator');
        if (motEl) motEl.classList.remove('show');
        updateRing();
      }
      focusRunning = !focusRunning;
      var ph = document.getElementById('focusPhase');
      if (focusRunning) {
        clearInterval(focusTimer);
        focusTimer = setInterval(tick, 1000);
        this.textContent = '⏸';
        if (ph) ph.textContent = 'enfocada 🔥';
        playBeep('start');
        var motEl = document.getElementById('focusMotivator');
        if (motEl) motEl.classList.remove('show');
      } else {
        clearInterval(focusTimer);
        this.textContent = '▶';
        if (ph) ph.textContent = 'pausado';
      }
    };

    document.getElementById('focusResetBtn').onclick = function() {
      focusRunning = false; clearInterval(focusTimer);
      focusSecondsLeft = focusDuration * 60;
      focusTotalSeconds = focusDuration * 60;
      var ph = document.getElementById('focusPhase');
      if (ph) ph.textContent = 'listo';
      var pb = document.getElementById('focusPlayBtn');
      if (pb) pb.textContent = '▶';
      var motEl = document.getElementById('focusMotivator');
      if (motEl) motEl.classList.remove('show');
      updateRing();
    };

    document.getElementById('focusDurMinus').onclick = function() {
      if (focusRunning) return;
      focusDuration = Math.max(1, focusDuration - 5);
      focusSecondsLeft = focusDuration * 60;
      focusTotalSeconds = focusDuration * 60;
      updateDurDisplay(); updateRing();
    };

    document.getElementById('focusDurPlus').onclick = function() {
      if (focusRunning) return;
      focusDuration = Math.min(120, focusDuration + 5);
      focusSecondsLeft = focusDuration * 60;
      focusTotalSeconds = focusDuration * 60;
      updateDurDisplay(); updateRing();
    };

    updateRing();
  };

  function closeFocusMode() {
    focusRunning = false; clearInterval(focusTimer);
    if (focusOverlay) {
      focusOverlay.style.animation = 'none';
      focusOverlay.style.opacity = '0';
      focusOverlay.style.transition = 'opacity .2s';
      setTimeout(function() {
        if (focusOverlay && focusOverlay.parentNode) focusOverlay.parentNode.removeChild(focusOverlay);
        focusOverlay = null;
      }, 200);
    }
  }

})();



// ============================================================
//  BIENVENIDA — primera vez
// ============================================================
function checkWelcomeModal() {
  if (localStorage.getItem('yuki_welcomed')) return;
  openWelcomeModal();
}

function openWelcomeModal() {
  var ov = document.createElement('div');
  ov.id = 'welcomeOverlay';
  ov.style.cssText = [
    'position:fixed','inset:0','z-index:6000',
    'background:rgba(0,0,0,.45)',
    'display:flex','align-items:center','justify-content:center',
    'padding:1rem','animation:fadeIn .3s ease both',
  ].join(';');

  ov.innerHTML = `
    <div id="welcomeBox" style="
      background:var(--card);
      border-radius:24px;
      padding:2rem 1.8rem 1.6rem;
      max-width:480px; width:100%;
      max-height:90vh; overflow-y:auto;
      box-shadow:0 20px 60px rgba(0,0,0,.25);
      animation:slideUp .3s cubic-bezier(.4,0,.2,1) both;
      position:relative;
    ">
      <!-- Encabezado -->
      <div style="text-align:center;margin-bottom:1.4rem">
        <div style="font-size:2.8rem;line-height:1;margin-bottom:.6rem">🌸</div>
        <h2 style="font-family:var(--font-script);font-size:2rem;color:var(--rosa);margin-bottom:.3rem;font-weight:400">
          Yuki
        </h2>
        <div style="font-size:.7rem;font-weight:800;color:var(--muted);text-transform:uppercase;letter-spacing:.12em">
          Tu espacio personal ✦
        </div>
      </div>

      <!-- Mensaje de bienvenida -->
      <div style="
        background:var(--surface);border-radius:16px;
        padding:1.1rem 1.2rem;margin-bottom:1.2rem;
        border-left:3px solid var(--rosa);
      ">
        <p style="font-family:var(--font-title);font-style:italic;font-size:1rem;color:var(--rosa);margin-bottom:.6rem;line-height:1.4">
          Holiii 🌸
        </p>
        <p style="font-size:.82rem;font-weight:600;color:var(--text);line-height:1.65;margin-bottom:.7rem">
          Esta app fue creada por mí (una chica AuADHD) con mucho amor jiji 💙
        </p>
        <p style="font-size:.82rem;font-weight:600;color:var(--text);line-height:1.65;margin-bottom:.7rem">
          Yuki es para todas las mentes. Si la tuya es neurodivergente, tenemos un espacio especial llamado <strong>Calma</strong> hecho con mucho amor para ti! :3
        </p>
        <p style="font-size:.78rem;font-weight:600;color:var(--muted);line-height:1.6;margin-bottom:.8rem">
          Si quieres leer más sobre la funcionalidad de las diferentes partes de la app para las mentes neurodivergentes,
          <span onclick="closeWelcomeGoNeuro()" style="color:var(--rosa);cursor:pointer;text-decoration:underline;text-underline-offset:3px">haz click aquí</span> ✨
        </p>
        <div style="display:flex;flex-direction:column;gap:.45rem">
          <div style="background:var(--card);border-radius:10px;padding:.55rem .8rem;border-left:3px solid var(--rosa)">
            <p style="font-size:.75rem;font-weight:800;color:var(--rosa);margin-bottom:.2rem">🧩 Autismo (TEA)</p>
            <p style="font-size:.72rem;font-weight:600;color:var(--muted);line-height:1.5">Rutinas estructuradas, previsibilidad y sección Mi Semana para organizar tu día sin sorpresas.</p>
          </div>
          <div style="background:var(--card);border-radius:10px;padding:.55rem .8rem;border-left:3px solid var(--rosa)">
            <p style="font-size:.75rem;font-weight:800;color:var(--rosa);margin-bottom:.2rem">⚡ TDAH</p>
            <p style="font-size:.72rem;font-weight:600;color:var(--muted);line-height:1.5">Tareas Complejas para no perder los pasos, Braindump para soltar todos esos pensamientos que llegan cuando intentas concentrarte.</p>
          </div>
          <div style="background:var(--rosa-soft);border-radius:10px;padding:.55rem .8rem;border-left:3px solid var(--rosa)">
            <p style="font-size:.75rem;font-weight:800;color:var(--rosa);margin-bottom:.2rem">🌸 AuADHD (Autismo + TDAH)</p>
            <p style="font-size:.72rem;font-weight:600;color:var(--muted);line-height:1.5">Dos capitanes peleándose JSJS — la sección Rutinas te deja crear variedad de rutinas para que el autismo tenga estructura y el TDAH tenga novedad :3</p>
          </div>
        </div>
      </div>

      <!-- Mensaje de fe -->
      <div style="text-align:center;padding:.8rem .5rem;margin-bottom:1rem">
        <p style="font-size:.8rem;font-weight:600;color:var(--muted);line-height:1.7;font-style:italic">
          Seas como seas, Dios te ama y te creó a su imagen, tu existencia tiene un propósito (づ ᴗ _ᴗ)づ♡
        </p>
      </div>

      <!-- Botón -->
      <button id="welcomeConfigBtn" style="
        width:100%;padding:.75rem;border-radius:14px;border:none;
        background:var(--rosa);color:#fff;
        font-family:var(--font-body);font-size:.88rem;font-weight:800;
        cursor:pointer;margin-bottom:.6rem;
        box-shadow:0 4px 18px rgba(212,116,138,.35);
        transition:opacity .15s;
      ">
        ✦ Ir a Configuración y personalizar
      </button>
      <button id="welcomeSkipBtn" style="
        width:100%;padding:.5rem;border-radius:14px;border:none;
        background:none;color:var(--muted);
        font-family:var(--font-body);font-size:.78rem;font-weight:700;
        cursor:pointer;transition:color .15s;
      ">
        Explorar primero →
      </button>
    </div>
  `;

  document.body.appendChild(ov);

  function closeWelcome() {
    localStorage.setItem('yuki_welcomed', '1');
    ov.style.opacity = '0';
    ov.style.transition = 'opacity .25s';
    setTimeout(function(){ if(ov.parentNode) ov.parentNode.removeChild(ov); }, 250);
  }

  window.closeWelcomeGoNeuro = function() {
    closeWelcome();
    setTimeout(function(){
      if (window.showPage) window.showPage('page-config');
      setTimeout(function(){
        var neuroBox = document.getElementById('neuroInfoBox');
        if (neuroBox) {
          neuroBox.style.display = 'block';
          neuroBox.scrollIntoView({ behavior:'smooth', block:'center' });
        }
      }, 400);
    }, 300);
  };

  document.getElementById('welcomeConfigBtn').onclick = function() {
    closeWelcome();
    setTimeout(function(){
      if (window.showPage) window.showPage('page-config');
      setTimeout(function(){
        document.querySelectorAll('.config-block-title').forEach(function(t){
          if (t.textContent.includes('Perfil')) { t.click(); }
        });
      }, 400);
    }, 300);
  };

} // fin openWelcomeModal

setTimeout(function(){ if(typeof checkWelcomeModal==='function') checkWelcomeModal(); }, 900);
setTimeout(function(){ if(typeof recuperInit==='function') recuperInit(); }, 200);



// Desactivar autocompletado del navegador en todos los campos
document.addEventListener('DOMContentLoaded', function() {
  document.querySelectorAll('input, textarea').forEach(function(el) {
    if (!el.type || el.type === 'text' || el.type === 'search' || el.type === 'email') {
      el.setAttribute('autocomplete', 'new-password');
    }
    el.setAttribute('autocorrect', 'off');
    el.setAttribute('autocapitalize', 'off');
    el.setAttribute('spellcheck', 'false');
  });
});
var _origCreate = document.createElement.bind(document);
document.createElement = function(tag) {
  var el = _origCreate(tag);
  if (tag.toLowerCase() === 'input' || tag.toLowerCase() === 'textarea') {
    setTimeout(function(){ el.setAttribute('autocomplete','new-password'); }, 0);
  }
  return el;
};



// ── Mover modales estáticos al root del body para que position:fixed funcione correctamente en móvil
(function(){
  var modalIds = [
    'foodModalBackdrop','decViewBackdrop','rutinaHModalBackdrop',
    'petsModalBackdrop','plantsModalBackdrop','bibPlaylistModalBackdrop',
    'bibDopModalBackdrop','tiendaModalBackdrop','citaModalBackdrop'
  ];
  document.addEventListener('DOMContentLoaded', function(){
    modalIds.forEach(function(id){
      var el = document.getElementById(id);
      if (el && el.parentNode !== document.body) {
        document.body.appendChild(el);
      }
    });
  });
})();
