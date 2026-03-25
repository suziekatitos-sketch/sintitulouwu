// ════════════════════════════════════════════════════════════════
// Yuki 🌸 — navigation.js
// ════════════════════════════════════════════════════════════════


// Flat list of all pages (used for showPage lookups)
const NAV_PAGES = [
  { icon:'🏠', label:'Inicio',      page:'page-inicio'    },
  { icon:'🚀', label:'Logros',      page:'page-logros'    },
  { icon:'🐱', label:'Mi Semana',   page:'page-semana'    },
  { icon:'🔍', label:'Buscar',      page:'page-buscar'    },
  { icon:'🙏', label:'Fe',          page:'page-fe'        },
  { icon:'💙', label:'Universidad', page:'page-univ'      },
  { icon:'📓', label:'Journal',     page:'page-journal'   },
  { icon:'🦄', label:'Intereses',   page:'page-intereses' },
  { icon:'🧠', label:'Braindump',   page:'page-braindump' },
  { icon:'🍏', label:'Salud',       page:'page-salud'     },
  { icon:'✨', label:'Selfcare',    page:'page-selfcare'  },
  { icon:'🌿', label:'Calma',       page:'page-calma'     },
  { icon:'🍽️', label:'Recetario',   page:'page-recetario' },
  { icon:'🧹', label:'Limpieza',    page:'page-limpieza'  },
  { icon:'📋', label:'Listas',      page:'page-listas'    },
  { icon:'💸', label:'Finanzas',    page:'page-finanzas'  },
  { icon:'📝', label:'Tareas',      page:'page-tareas'    },
  { icon:'🌸', label:'Rutinas',     page:'page-rutinas'   },
  { icon:'📅', label:'Historial',   page:'page-historial' },
  { icon:'⚙️', label:'Config',      page:'page-config'    },
];

// Drawer structure: top items, groups, bottom items
const DRAWER_STRUCTURE = {
  top: [
    { icon:'🏠', label:'Inicio',    page:'page-inicio' },
    { icon:'🐱', label:'Mi Semana', page:'page-semana' },
    { icon:'🔍', label:'Buscar',    page:'page-buscar' },
  ],
  groups: [
    { id:'personal', icon:'🌸', label:'Personal', items: [
      { icon:'', label:'Fe',          page:'page-fe'        },
      { icon:'', label:'Universidad', page:'page-univ'      },
      { icon:'', label:'Journal',     page:'page-journal'   },
      { icon:'', label:'Diario',      page:'page-diario'    },
      { icon:'', label:'Intereses',   page:'page-intereses' },
      { icon:'', label:'Braindump',   page:'page-braindump' },
      { icon:'', label:'Biblioteca',  page:'page-biblioteca'},
    ]},
    { id:'bienestar', icon:'🌱', label:'Bienestar', items: [
      { icon:'', label:'Salud',    page:'page-salud'    },
      { icon:'', label:'Selfcare', page:'page-selfcare' },
      { icon:'', label:'Calma',    page:'page-calma'    },
      { icon:'', label:'Hábitos',  page:'page-habitos'  },
    ]},
    { id:'hogar', icon:'⭐', label:'Hogar', items: [
      { icon:'', label:'Recetario', page:'page-recetario' },
      { icon:'', label:'Limpieza',  page:'page-limpieza'  },
      { icon:'', label:'Listas',    page:'page-listas'    },
      { icon:'', label:'Finanzas',  page:'page-finanzas'  },
      { icon:'', label:'Mascotas',  page:'page-mascotas'  },
      { icon:'', label:'Plantas',   page:'page-plantas'   },
    ]},
    { id:'organizacion', icon:'📌', label:'Organización', items: [
      { icon:'', label:'Tareas',  page:'page-tareas'  },
      { icon:'', label:'Rutinas', page:'page-rutinas' },
      { icon:'', label:'Me concentro', page:'page-concentro' },
      { icon:'', label:'Transiciones', page:'page-transiciones' },
    ]},
  ],
  bottom: [
    { icon:'📅', label:'Historial', page:'page-historial' },
    { icon:'⚙️', label:'Config',    page:'page-config'    },
  ]
};

let activePage = 'page-inicio';

function showPage(pageId) {
  if (activePage === pageId) { closeDrawer(); return; }

  var prevEl = document.getElementById(activePage);
  var nextEl = document.getElementById(pageId);

  activePage = pageId;

  // Update drawer items immediately
  document.querySelectorAll('.drawer-item').forEach(function(btn) {
    btn.classList.toggle('active', btn.dataset.page === pageId);
  });
  document.querySelectorAll('.drawer-group').forEach(function(group) {
    var hasActive = group.querySelector('.drawer-item.active');
    if (hasActive) {
      var hdr = group.querySelector('.drawer-group-header');
      var itms = group.querySelector('.drawer-group-items');
      if (hdr && itms && !itms.classList.contains('open')) {
        hdr.classList.add('open'); itms.classList.add('open');
      }
    }
  });
  closeDrawer();

  function enterNext() {
    if (!nextEl) return;
    window.scrollTo({ top: 0, behavior: 'instant' });
    nextEl.style.display = 'block';
    void nextEl.offsetWidth; // force reflow
    nextEl.classList.add('active');
    setTimeout(syncImgColHeight, 300);
  }

  if (prevEl && prevEl.classList.contains('active')) {
    prevEl.classList.add('page-exit');
    prevEl.classList.remove('active');
    setTimeout(function() {
      prevEl.classList.remove('page-exit');
      prevEl.style.display = '';
      enterNext();
    }, 160);
  } else {
    enterNext();
  }
}

function syncImgColHeight() {
  var activePg = document.querySelector('.page-section.active');
  var layout = document.querySelector('.app-layout');
  if (!activePg || !layout) return;
  // Use a small delay to let page render first
  setTimeout(function() {
    var h = Math.max(activePg.scrollHeight, window.innerHeight);
    layout.style.minHeight = h + 'px';
    // Also set column height so images fill it
    ['imgColLeft','imgColRight'].forEach(function(id) {
      var col = document.getElementById(id);
      if (col) col.style.minHeight = h + 'px';
    });
  }, 50);
}

function makeDrawerItem(item) {
  var btn = document.createElement('button');
  btn.className = 'drawer-item' + (activePage === item.page ? ' active' : '');
  btn.dataset.page = item.page;
  var iconHtml = item.icon
    ? '<span class="drawer-item-icon">' + item.icon + '</span>'
    : '<span class="drawer-item-indent"></span>';
  btn.innerHTML = iconHtml + '<span class="drawer-item-label">' + item.label + '</span>';
  btn.onclick = function() { showPage(item.page); };
  return btn;
}

// Track which groups are open (persist in sessionStorage)
function getGroupState(id) {
  try { return sessionStorage.getItem('dg_' + id) === '1'; } catch(e) { return false; }
}
function setGroupState(id, open) {
  try { sessionStorage.setItem('dg_' + id, open ? '1' : '0'); } catch(e) {}
}

function renderDrawerNav() {
  var wrap = document.getElementById('drawerNav');
  if (!wrap) return;
  wrap.innerHTML = '';

  // Top items (always visible)
  DRAWER_STRUCTURE.top.forEach(function(item) {
    wrap.appendChild(makeDrawerItem(item));
  });

  // Divider
  var div1 = document.createElement('div');
  div1.className = 'drawer-divider';
  div1.style.margin = '.4rem 0';
  wrap.appendChild(div1);

  // Groups
  DRAWER_STRUCTURE.groups.forEach(function(group) {
    var groupEl = document.createElement('div');
    groupEl.className = 'drawer-group';

    // Check if any item in this group is active → auto-open
    var hasActive = group.items.some(function(i) { return i.page === activePage; });
    var isOpen = hasActive || getGroupState(group.id);

    var header = document.createElement('button');
    header.className = 'drawer-group-header' + (isOpen ? ' open' : '');
    header.innerHTML =
      '<span class="dg-icon">' + group.icon + '</span>' +
      '<span>' + group.label + '</span>' +
      '<span class="dg-arrow">▾</span>';

    var items = document.createElement('div');
    items.className = 'drawer-group-items' + (isOpen ? ' open' : '');

    group.items.forEach(function(item) {
      items.appendChild(makeDrawerItem(item));
    });

    header.onclick = function() {
      var open = items.classList.toggle('open');
      header.classList.toggle('open', open);
      setGroupState(group.id, open);
    };

    groupEl.appendChild(header);
    groupEl.appendChild(items);
    wrap.appendChild(groupEl);
  });

  // Divider
  var div2 = document.createElement('div');
  div2.className = 'drawer-divider';
  div2.style.margin = '.4rem 0';
  wrap.appendChild(div2);

  // Focus mode button
  var focusBtn = document.createElement('button');
  focusBtn.className = 'drawer-focus-btn';
  focusBtn.innerHTML = '🎯 Modo Enfoque';
  focusBtn.onclick = function() { closeDrawer(); openFocusMode(); };
  wrap.appendChild(focusBtn);

  // Emergencia button
  var emergBtn = document.createElement('button');
  emergBtn.className = 'drawer-focus-btn';
  emergBtn.innerHTML = '🆘 Modo Emergencia';
  emergBtn.style.cssText = 'margin-top:.4rem;background:linear-gradient(135deg,#e8703a22,#a78bfa22);border-color:#a78bfa;color:#a78bfa';
  emergBtn.onclick = function() { closeDrawer(); openModoEmergencia(); };
  wrap.appendChild(emergBtn);

  // Bottom items (always visible)
  DRAWER_STRUCTURE.bottom.forEach(function(item) {
    wrap.appendChild(makeDrawerItem(item));
  });
}

function openDrawer() {
  document.getElementById('drawer').classList.add('open');
  document.getElementById('drawerOverlay').classList.add('open');
  document.getElementById('hamburgerBtn').classList.add('open');
}

function closeDrawer() {
  document.getElementById('drawer').classList.remove('open');
  document.getElementById('drawerOverlay').classList.remove('open');
  document.getElementById('hamburgerBtn').classList.remove('open');
}

document.addEventListener('DOMContentLoaded', function() {
  var hbBtn = document.getElementById('hamburgerBtn');
  if (hbBtn) hbBtn.onclick = function() {
    document.getElementById('drawer').classList.contains('open') ? closeDrawer() : openDrawer();
  };
  var overlay = document.getElementById('drawerOverlay');
  if (overlay) overlay.onclick = closeDrawer;
  renderDrawerNav();
  showPage('page-inicio');
  syncImgColHeight();
  configApplyExperience();
  // Show welcome modal on first visit — se llama al final del archivo cuando ya está definida
});
