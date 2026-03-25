// ════════════════════════════════════════════════════════════════
// Yuki 🌸 — Firebase / Auth module
// ════════════════════════════════════════════════════════════════


  import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
  import { getFirestore, doc, getDoc, setDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
  import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

  const firebaseConfig = {
    apiKey: "AIzaSyAW9BgISe_ZYipIA9sNBzYFtvnAwM8NCGQ",
    authDomain: "kittyplan-2c08d.firebaseapp.com",
    projectId: "kittyplan-2c08d",
    storageBucket: "kittyplan-2c08d.firebasestorage.app",
    messagingSenderId: "1036903357840",
    appId: "1:1036903357840:web:3c78cae6f9496ff417e715"
  };

  const app      = initializeApp(firebaseConfig);
  const db       = getFirestore(app);
  const auth     = getAuth(app);
  const provider = new GoogleAuthProvider();

  let currentUID = null;
  let unsubSnapshot = null;

  function getUserDoc(uid) {
    return doc(db, "kittyplan", uid);
  }

  function subscribeToUserDoc(uid) {
    if (unsubSnapshot) unsubSnapshot();
    unsubSnapshot = onSnapshot(getUserDoc(uid), (snap) => {
      if (!snap.exists()) return;
      const raw = snap.data();
      try {
        if (raw.sem_data)     { window._data        = JSON.parse(raw.sem_data);     }
        if (raw.sem_custom)   { window._customTasks  = JSON.parse(raw.sem_custom);   }
        if (raw.recurring_tasks)    { window._recurringTasks    = JSON.parse(raw.recurring_tasks);    }
        if (raw.completions)         { window._completions        = JSON.parse(raw.completions);         }
        if (raw.rutina_templates)    { window._rutinaTemplates    = JSON.parse(raw.rutina_templates);    }
        if (raw.rutina_asignaciones) { window._rutinaAsignaciones = JSON.parse(raw.rutina_asignaciones); }
        if (raw.rutina_completions)  { window._rutinaCompletions  = JSON.parse(raw.rutina_completions);  }
        if (raw.desglose_items)      { window._desgloseItems      = JSON.parse(raw.desglose_items);      }
        if (raw.gratitud_data)       { window._gratitudData       = JSON.parse(raw.gratitud_data);       }
        if (raw.sueno_data)          { window._suenoData          = JSON.parse(raw.sueno_data);          }
        if (raw.mens_data)           { window._mensData           = JSON.parse(raw.mens_data);           }
        if (raw.deco_imgs)           { window._decoImgs           = JSON.parse(raw.deco_imgs);           }
        if (raw.deco_interval)       { window._decoInterval       = raw.deco_interval;                            }
        if (raw.ej_templates)        { window._ejTemplates        = JSON.parse(raw.ej_templates);        }
        if (raw.ej_registros)        { window._ejRegistros        = JSON.parse(raw.ej_registros);        }
        if (raw.dios_data)           { window._diosData           = JSON.parse(raw.dios_data);           }
        if (raw.versiculos)          { window._versiculos         = JSON.parse(raw.versiculos);           }
        if (raw.univ_data)           { window._univData           = JSON.parse(raw.univ_data);           }
        if (raw.belleza_templates)   { window._bellezaTemplates   = JSON.parse(raw.belleza_templates);   }
        if (raw.belleza_registros)   { window._bellezaRegistros   = JSON.parse(raw.belleza_registros);   }
        if (raw.braindump_notes)    { window._braindumpNotes    = JSON.parse(raw.braindump_notes);    }
        if (raw.vb_items)         { window._vbItems         = JSON.parse(raw.vb_items);         }
        if (raw.metas_data)       { window._metasData       = JSON.parse(raw.metas_data);       }
        if (raw.mood_data)        { window._moodData        = JSON.parse(raw.mood_data);        }
        if (raw.metas_data)       { window._metasData       = JSON.parse(raw.metas_data);       }
        if (raw.ql_lists)         { window._qlLists         = JSON.parse(raw.ql_lists);         }
        if (raw.wl_items)         { window._wlItems         = JSON.parse(raw.wl_items);         }
        if (raw.wishlist_items)   { window._wishlistItems   = JSON.parse(raw.wishlist_items);   }
      if (raw.beauty_tips)      { window._beautyTips      = JSON.parse(raw.beauty_tips);        }
        if (raw.beauty_tips)      { window._beautyTips      = JSON.parse(raw.beauty_tips);        }
        if (raw.univ_links)          { window._univLinks          = JSON.parse(raw.univ_links);          }
        if (raw.univ_proyectos)      { window._univProyectos      = JSON.parse(raw.univ_proyectos);      }
        if (raw.spark_pins)          { window._sparkPins          = JSON.parse(raw.spark_pins);          }
        if (raw.spark_historial)     { window._sparkHistorial     = JSON.parse(raw.spark_historial);     }
        if (raw.spark_total_minutes) { window._sparkTotalMinutes  = parseInt(raw.spark_total_minutes);   }
        // Mirror Firebase → localStorage para todas las keys conocidas
        const mirrorKeys = ['sem_data','sem_custom','recurring_tasks','completions',
          'rutina_templates','rutina_asignaciones','rutina_completions','desglose_items',
          'gratitud_data','sueno_data','mens_data','deco_imgs','ej_templates','ej_registros','habitos_data','prompt_data',
          'dios_data','versiculos','univ_data','belleza_templates','belleza_registros',
          'braindump_notes','vb_items','metas_data','mood_data','ql_lists','wl_items','wishlist_items','beauty_tips',
          'ci_state','nd_state','calm_tools','water_goal','water_state','food_state',
          'logros_data','fortalezas','cambio_state','cambio_custom',
          'univ_links','univ_proyectos','spark_pins','spark_historial','spark_total_minutes',
          'trans_data','custom_notifs','eventos_prep','recuper_registros',
          'notas_intereses_data','notas_intereses_cats',
          'yuki_mascotas','yuki_plantas','yuki_biblioteca_playlists','yuki_biblioteca_dopamina','yuki_diario',
          'yuki_decisions','yuki_rutina_horarios',
          'yuki_xp','yuki_xp_streak','yuki_xp_last_date',
          'yuki_sakura','yuki_tienda_recompensas','yuki_compras_historial','yuki_study_minutes',
          'yuki_citas','yuki_citas_dias','yuki_citas_last','yuki_citas_idx'];
        mirrorKeys.forEach(function(k) {
          if (raw[k] !== undefined) {
            try { localStorage.setItem(k, raw[k]); } catch(e) {}
          }
        });
        if (raw.ci_state)     { window._checkinState = JSON.parse(raw.ci_state);     }
        if (raw.nd_state)     { window._needsState   = JSON.parse(raw.nd_state);     }
        if (raw.calm_tools)   { window._calmTools    = JSON.parse(raw.calm_tools);   }
        if (raw.water_goal)   { window._waterGoal    = parseInt(raw.water_goal);     }
        if (raw.water_state)  { window._waterState   = JSON.parse(raw.water_state);  }
        if (raw.food_state)   { window._foodState    = JSON.parse(raw.food_state);   }
        if (raw.logros_data)  { window._logrosData   = JSON.parse(raw.logros_data);  }
        if (raw.fortalezas)   { window._fortalezas   = JSON.parse(raw.fortalezas);   }
        if (raw.cambio_state) { window._cambioState  = JSON.parse(raw.cambio_state); }
        if (raw.cambio_custom){ window._cambioCustom = JSON.parse(raw.cambio_custom);}
        if (typeof window.syncFromCloud === 'function') window.syncFromCloud();
      } catch(e) { console.warn("sync parse error", e); }
    });
  }

  // Cola de guardado pendiente por si el usuario no está autenticado aún
  var _pendingSaves = {};

  // Debounce para cloudSave
  var _saveTimers = {};
  
  window.cloudSave = async function(key, value) {
    // Guardar siempre en la cola local por si falla
    _pendingSaves[key] = value;
    if (!currentUID) {
      console.log('cloudSave: sin usuario, guardado en cola →', key);
      return;
    }
    
    // Cancelar timer anterior si existe
    if (_saveTimers[key]) clearTimeout(_saveTimers[key]);
    
    // Debounce: esperar 500ms antes de guardar
    _saveTimers[key] = setTimeout(async () => {
      try {
        await setDoc(getUserDoc(currentUID), { [key]: JSON.stringify(_pendingSaves[key]) }, { merge: true });
        delete _pendingSaves[key]; // éxito, quitar de cola
      } catch(e) { console.warn("cloudSave error", e); }
      delete _saveTimers[key];
    }, 500);
  };

  // Cuando el usuario se autentica, enviar todo lo que estaba en cola
  async function flushPendingSaves() {
    var keys = Object.keys(_pendingSaves);
    if (!keys.length || !currentUID) return;
    console.log('Flushing', keys.length, 'saves pendientes...');
    for (var k of keys) {
      try {
        await setDoc(getUserDoc(currentUID), { [k]: JSON.stringify(_pendingSaves[k]) }, { merge: true });
        delete _pendingSaves[k];
      } catch(e) { console.warn('flush error', k, e); }
    }
  }

  window.cloudLoad = async function() {
    if (!currentUID) return {};
    try {
      const snap = await getDoc(getUserDoc(currentUID));
      return snap.exists() ? snap.data() : {};
    } catch(e) { console.warn("cloudLoad error", e); return {}; }
  };

  async function doSignIn() {
    const btn = document.getElementById('login-btn');
    if (!btn) return;
    try {
      btn.disabled = true;
      btn.innerHTML = '<span style="font-size:1.1rem;animation:pulse 1s infinite">🌙</span> Conectando...';
      await signInWithPopup(auth, provider);
    } catch(e) {
      console.warn("signIn error", e);
      btn.disabled = false;
      btn.innerHTML = '<img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" style="width:18px;height:18px;">Continuar con Google';
    }
  }

  async function doSignOut() {
    if (unsubSnapshot) unsubSnapshot();
    await signOut(auth);
    // Limpiar localStorage para que otra cuenta no vea datos de esta
    localStorage.clear();
    // Limpiar variables window de datos
    var windowKeys = Object.keys(window).filter(function(k){ return k.startsWith('_'); });
    windowKeys.forEach(function(k){ try { delete window[k]; } catch(e){} });
  }

  // Attach button listeners once DOM is ready
  document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('login-btn');
    if (btn) btn.addEventListener('click', doSignIn);
    const outBtn = document.getElementById('signout-btn');
    if (outBtn) outBtn.addEventListener('click', () => {
      kittyConfirm('¿Cerrar sesión?', doSignOut);
    });
  });

  // Also expose globally as fallback (for non-module contexts)
  window.signInWithGoogle = doSignIn;
  window.signOutUser = doSignOut;

  // Auth state observer
  onAuthStateChanged(auth, (user) => {
    const loginScreen = document.getElementById('login-screen');
    const appScreen   = document.getElementById('app-screen');
    if (user) {
      currentUID = user.uid;
      subscribeToUserDoc(user.uid);
      // Update user info in header
      const nameEl = document.getElementById('user-display-name');
      const avatarEl = document.getElementById('user-avatar');
      if (nameEl) nameEl.textContent = user.displayName ? user.displayName.split(' ')[0] : 'tú';
      if (avatarEl && user.photoURL) avatarEl.src = user.photoURL;
      window._currentUser = user;
      if (window._onConfigUser) window._onConfigUser(user);
      flushPendingSaves();
      // Botón drawer: Cerrar sesión
      var drawerAuthLabel = document.getElementById('drawerAuthLabel');
      var drawerAuthBtn = document.getElementById('drawerAuthBtn');
      if (drawerAuthLabel) drawerAuthLabel.textContent = 'Cerrar sesión';
      if (drawerAuthBtn) drawerAuthBtn.onclick = function() { if(window.kittyConfirm) kittyConfirm('¿Cerrar sesión?', window.signOutUser); else if(window.signOutUser) window.signOutUser(); }; // enviar datos que esperaban autenticación
      // Actualizar drawer perfil
      var dn = document.getElementById('drawerProfileName');
      var dai = document.getElementById('drawerAvatarImg');
      var dap = document.getElementById('drawerAvatarPlaceholder');
      var customName = localStorage.getItem('config_display_name');
      var customAvatar = localStorage.getItem('config_avatar_url');
      if (dn) dn.textContent = customName || (user.displayName ? user.displayName.split(' ')[0] : 'tú');
      if (dai) {
        var avatarSrc = customAvatar || user.photoURL || '';
        if (avatarSrc) { dai.src = avatarSrc; dai.style.display=''; if(dap) dap.style.display='none'; }
        else { dai.style.display='none'; if(dap) dap.style.display='flex'; }
      }
      // Show app, hide login
      if (loginScreen) loginScreen.style.display = 'none';
      if (appScreen)   appScreen.style.display   = '';
      // Signal ready
      window._firebaseReady = true;
      document.dispatchEvent(new Event('firebase-ready'));
    } else {
      currentUID = null;
      // Modo local — mostrar app sin login
      if (loginScreen) loginScreen.style.display = 'none';
      if (appScreen)   appScreen.style.display   = '';
      // Cambiar chip de salir por botón de iniciar sesión
      var chip = document.getElementById('signout-btn');
      if (chip) {
        chip.innerHTML = '☁️ <span style="font-size:.75rem;font-weight:700">Iniciar sesión</span>';
        chip.onclick = function(e){ e.stopPropagation(); if(window.signInWithGoogle) window.signInWithGoogle(); };
      }
      var dn = document.getElementById('drawerProfileName');
      if (dn) dn.textContent = 'tú';
      // Botón drawer: Iniciar sesión
      var drawerAuthBtn = document.getElementById('drawerAuthBtn');
      var drawerAuthLabel = document.getElementById('drawerAuthLabel');
      if (drawerAuthLabel) drawerAuthLabel.textContent = 'Iniciar sesión';
      if (drawerAuthBtn) drawerAuthBtn.onclick = function() { if(window.signInWithGoogle) window.signInWithGoogle(); };
      window._firebaseReady = true;
      document.dispatchEvent(new Event('firebase-ready'));
    }
  });
