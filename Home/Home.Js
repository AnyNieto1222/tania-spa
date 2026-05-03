
// ============================================================
//  PRECIOS POR TRATAMIENTO (para calcular ingresos reales)
// ============================================================
const PRECIOS = {
  // Faciales
  'Limpieza Facial Básica':          60000,
  'Limpieza Facial Profunda':        80000,
  'Limpieza Facial Premium':        120000,
  'Hidratación Facial Profunda':     90000,
  'Masaje Craneofacial':             70000,
  'Spa Facial':                     100000,
  'Plasma Básico':                  180000,
  'Plasma Plus':                    250000,
  'Exosomas':                       350000,
  'Rejuveness':                     280000,
  'Botox':                          400000,
  'Rinomodelación':                 500000,
  'Hidralips':                      350000,
  'Relleno Ácido Hialurónico':      450000,
  'Dermapen':                       200000,
  'Radiofrecuencia Facial':         150000,
  // Capilares
  'Plasma Capilar':                 200000,
  'Ampollas Capilares':              80000,
  'Tónico Capilar':                  60000,
  // Corporales
  'Sesión Detox':                    90000,
  'Maderoterapia':                  100000,
  'Hidrolipocavitación':            150000,
  'Tensamax':                       180000,
  'Levantamiento de Glúteos':       130000,
  'Plan Premium (8 sesiones)':      700000,
  'Body Redux Full (10 sesiones)':  900000,
  'Full Body 2 (12 sesiones)':     1000000,
  // Terapias Alternativas
  'Acupuntura':                      80000,
  'Auriculoterapia':                 70000,
  'Desintoxicación Iónica':          90000,
  'Sueroterapia':                   120000,
  'Carboxiterapia':                 150000,
  'Fototerapia LED':                 70000,
  // Masajes y Rituales
  'Masaje Cuerpo Completo':          90000,
  'Masaje Descontracturante':       100000,
  'Masaje Deportivo':                95000,
  'Masaje para Embarazadas':         90000,
  'Chocolaterapia':                 130000,
  'Ritual de Espalda':               80000,
  'Ritual Relajación Total':        160000,
  'Ritual Consiéntete':             180000,
  'Ritual Renacer':                 200000,
  'Ritual Paraíso':                 220000,
  // Especiales
  'Kids Spa':                        60000,
  'Fiestas Infantiles':             800000,
  'Estética Gestacional':           100000,
  // Depilación
  'Depilación con Cera Facial':      25000,
  'Depilación con Cera Corporal':    45000,
  'Depilación Láser Facial':        120000,
  'Depilación Láser Corporal':      250000,
  // Post Operatorios
  'Post Operatorio':                150000,
};

// ============================================================
//  ESTADO — datos iniciales (se persisten en localStorage)
// ============================================================
const state = {
  clientes:   [],
  registros:  [],
  personal:   [],
  citas:      [],
  inventario: [],
  comisiones: [],
  historiasCorporales: [],
  sesionActual: null,
};

// ============================================================
//  PERSISTENCIA — API REST
// ============================================================
async function cargarState() {
  try {
    const [clientes, registros, personal, citas, inventario, comisiones, historiasCorporales] = await Promise.all([
      fetch('/api/clientes').then(r => r.json()),
      fetch('/api/registros').then(r => r.json()),
      fetch('/api/personal').then(r => r.json()),
      fetch('/api/citas').then(r => r.json()),
      fetch('/api/inventario').then(r => r.json()),
      fetch('/api/comisiones').then(r => r.json()),
      fetch('/api/historias-corporales').then(r => r.json()),
    ]);
    state.clientes   = clientes;
    state.registros  = registros;
    state.personal   = personal;
    state.citas      = citas;
    state.inventario = inventario;
    state.comisiones = comisiones;
    state.historiasCorporales = historiasCorporales;
  } catch {
    showToast('⚠ Error conectando con el servidor');
  }
}

// ============================================================
//  SESIÓN
// ============================================================
function obtenerSesion() {
  const raw = sessionStorage.getItem('ts_sesion') || localStorage.getItem('ts_sesion');
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

function verificarSesion() {
  const sesion = obtenerSesion();
  if (!sesion) {
    window.location.href = '../Login/Login.html';
    return null;
  }
  return sesion;
}

// ============================================================
//  UTILIDADES
// ============================================================
function initiales(nombre) {
  return nombre.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
}

function formatFecha(iso) {
  if (!iso) return '—';
  const [y, m, d] = iso.split('-');
  const meses = ['','Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
  return `${d} ${meses[+m]} ${y}`;
}

function formatCOP(valor) {
  if (!valor) return '$0';
  if (valor >= 1000000) return `$${(valor / 1000000).toFixed(1).replace('.', ',')}M`;
  return `$${valor.toLocaleString('es-CO')}`;
}

function saludoHora() {
  const h = new Date().getHours();
  if (h < 12) return 'Buenos días';
  if (h < 19) return 'Buenas tardes';
  return 'Buenas noches';
}

function fechaHoy() {
  const dias  = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
  const meses = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
  const hoy   = new Date();
  return `${dias[hoy.getDay()]}, ${hoy.getDate()} ${meses[hoy.getMonth()]} ${hoy.getFullYear()}`;
}

function showToast(msg, dur = 3000) {
  const t = document.getElementById('toast-dash');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), dur);
}

// ============================================================
//  SHA-256 (para hashear contraseñas de acceso)
// ============================================================
async function sha256(texto) {
  const datos  = new TextEncoder().encode(texto);
  const buffer = await crypto.subtle.digest('SHA-256', datos);
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0')).join('');
}

function obtenerUsuariosApp() {
  return JSON.parse(localStorage.getItem('ts_usuarios_v2') || '[]');
}

function togglePwd(inputId, btn) {
  const el = document.getElementById(inputId);
  if (!el) return;
  el.type = el.type === 'password' ? 'text' : 'password';
  btn.textContent = el.type === 'password' ? '👁' : '🙈';
}

// ============================================================
//  COLORES Y REGISTRO DE GRÁFICAS
// ============================================================
const CHART_COLORS = [
  '#c06080','#7c4d8a','#d4a843','#4a7c59','#5a7fa8',
  '#c17f6c','#9b6b8e','#6a9e8a','#b05050','#8c7a5a',
];

const chartInstances = {};

// ============================================================
//  NAVEGACIÓN ENTRE TABS
// ============================================================
function showTab(dash, tab, link) {
  document.querySelectorAll(`#dash-${dash} .tab-content`).forEach(t => t.classList.remove('active'));
  document.querySelectorAll(`#dash-${dash} .nav-item`).forEach(n => n.classList.remove('active'));
  const target = document.getElementById(`${dash}-${tab}`);
  if (target) target.classList.add('active');
  if (link && link.classList) link.classList.add('active');
  if (dash === 'gerente' && tab === 'resumen') { actualizarStatsGerente(); renderResumenRecientes(); renderResumenNuevos(); renderPersonalActividad(); }
  if (dash === 'gerente' && tab === 'estadisticas') renderEstadisticas();
  if (dash === 'gerente' && tab === 'clientes') renderMisClientesGerente();
  if (dash === 'esteticista' && tab === 'resumen') { actualizarStatsEsteticista(); renderResumenEstRecientes(); }
  if (dash === 'gerente' && tab === 'citas') { renderEstadosCitas(); renderTablaCitas(); }
  if (dash === 'gerente' && tab === 'inventario') { renderEstadosInventario(); renderTablaInventario(); }
  if (dash === 'gerente' && tab === 'comisiones') { renderStatsComisiones(); renderTablaComisiones(); }
  if (dash === 'gerente' && tab === 'historia-corporal') renderTablaHistoriasCorporales();
  if (dash === 'esteticista' && tab === 'mis-comisiones') renderMisComisiones();
  if (dash === 'esteticista' && tab === 'hc-corporal') renderTablaHCEsteticista();
  if (dash === 'esteticista' && tab === 'nuevo-registro') renderCitasHoyEsteticista();
}

// ============================================================
//  INICIO DE DASHBOARD SEGÚN ROL
// ============================================================
function iniciarDashboard(sesion) {
  state.sesionActual = sesion;
  const esGerente = sesion.rol === 'gerente' || sesion.rol === 'administradora';

  document.getElementById('dash-gerente').classList.toggle('active', esGerente);
  document.getElementById('dash-esteticista').classList.toggle('active', !esGerente);

  if (esGerente) {
    actualizarSidebarGerente(sesion);
    cargarGerente();
  } else {
    actualizarSidebarEsteticista(sesion);
    cargarEsteticista();
  }
}

function actualizarSidebarGerente(sesion) {
  const rolesLabel = { gerente: 'Gerente', administradora: 'Administradora' };
  document.getElementById('g-avatar').textContent        = initiales(sesion.nombre);
  document.getElementById('g-nombre-sidebar').textContent = sesion.nombre;
  document.getElementById('g-rol-sidebar').textContent    = rolesLabel[sesion.rol] || 'Gerente';
  document.getElementById('g-saludo').innerHTML =
    `${saludoHora()}, <em>${sesion.nombre.split(' ')[0]}</em> 🌺`;
  document.getElementById('g-fecha').textContent = fechaHoy();
}

function actualizarSidebarEsteticista(sesion) {
  const roles = { esteticista: 'Esteticista' };
  document.getElementById('est-avatar').textContent        = initiales(sesion.nombre);
  document.getElementById('est-nombre-sidebar').textContent = sesion.nombre;
  document.getElementById('est-rol-sidebar').textContent    = roles[sesion.rol] || sesion.rol;
}

// ============================================================
//  LOGOUT
// ============================================================
function salir() {
  if (!confirm('¿Deseas cerrar sesión?')) return;
  sessionStorage.removeItem('ts_sesion');
  localStorage.removeItem('ts_sesion');
  state.sesionActual = null;
  window.location.href = '../Login/Login.html';
}

// ============================================================
//  MODALES
// ============================================================
function abrirModal(id)  { document.getElementById(id).classList.add('open'); }
function cerrarModal(id) { document.getElementById(id).classList.remove('open'); }
document.addEventListener('click', e => {
  if (e.target.classList.contains('modal-overlay')) e.target.classList.remove('open');
});

// ============================================================
//  GERENTE — carga general
// ============================================================
function cargarGerente() {
  actualizarStatsGerente();
  renderResumenRecientes();
  renderResumenNuevos();
  renderPersonalActividad();
  renderTablaClientes();
  renderMisClientesGerente();
  renderHistorialGlobal();
  renderPersonalGrid();
  renderSelectEsteticistas();
  renderIngresos();
  renderEstadosCitas();
  renderTablaCitas();
  renderEstadosInventario();
  renderTablaInventario();
  renderSelectEsteticistasComision();
}

function renderMisClientesGerente() {
  const sec  = document.getElementById('g-mis-clientes-section');
  const cont = document.getElementById('g-mis-clientes-cards');
  if (!sec || !cont || !state.sesionActual) return;
  const miNombre = state.sesionActual.nombre;
  const lista    = state.clientes.filter(c => c.esteticista === miNombre);
  if (!lista.length) { sec.style.display = 'none'; return; }
  sec.style.display = 'block';
  cont.innerHTML = lista.map(c => `
    <div class="cliente-card">
      <div class="cc-top">
        <div class="cc-avatar">${initiales(c.nombre)}</div>
        <div>
          <p class="cc-nombre">${c.nombre}</p>
          <div class="cc-tipo"><span class="badge-${c.tipo}">${c.tipo === 'nuevo' ? 'Cliente nuevo' : 'Cliente antiguo'}</span></div>
        </div>
      </div>
      <div class="cc-datos">
        <span>📞 ${c.tel}</span>
        <span>✉ ${c.email || '—'}</span>
        <span>Visitas: ${c.visitas}</span>
      </div>
      ${c.alergias && c.alergias !== 'Ninguna' ? `<div class="cc-alergias">⚠ Alergias: ${c.alergias}</div>` : ''}
      ${c.proximaCita ? `<div class="cc-prox">📅 Próx. cita: ${formatFecha(c.proximaCita)} — ${c.proxTrat || ''}</div>` : ''}
    </div>`).join('');
}

function actualizarStatsGerente() {
  document.getElementById('stat-total-clientes').textContent = state.clientes.length;
  document.getElementById('stat-total-registros').textContent = state.registros.length;
  document.getElementById('stat-personal').textContent        = state.personal.length;

  const ahora   = new Date();
  const totalMes = state.registros
    .filter(r => {
      const d = new Date(r.fecha);
      return d.getMonth() === ahora.getMonth() && d.getFullYear() === ahora.getFullYear();
    })
    .reduce((s, r) => s + (PRECIOS[r.tratamiento] || 0), 0);

  document.getElementById('stat-ingresos-resumen').textContent = formatCOP(totalMes);
}

function renderResumenRecientes() {
  const cont   = document.getElementById('resumen-registros-recientes');
  const ultimos = [...state.registros].reverse().slice(0, 4);
  if (!ultimos.length) { cont.innerHTML = '<p class="empty-msg">Aún no hay registros.</p>'; return; }
  cont.innerHTML = ultimos.map(r => `
    <div class="reg-rec-item">
      <div class="reg-rec-dot"></div>
      <div class="reg-rec-info">
        <p class="reg-rec-nombre">${r.clienteNombre} — ${r.tratamiento}</p>
        <p class="reg-rec-det">${formatFecha(r.fecha)} · ${r.esteticista}</p>
      </div>
      <span class="badge-${r.tipo}">${r.tipo === 'nuevo' ? 'Nuevo' : 'Antiguo'}</span>
    </div>`).join('');
}

function renderResumenNuevos() {
  const cont   = document.getElementById('resumen-clientes-nuevos');
  const nuevos = state.clientes.filter(c => c.tipo === 'nuevo');
  if (!nuevos.length) { cont.innerHTML = '<p class="empty-msg">Sin clientes nuevos aún.</p>'; return; }
  cont.innerHTML = nuevos.map(c => `
    <div class="mini-item">
      <div class="mini-avatar">${initiales(c.nombre)}</div>
      <div><p class="mini-nombre">${c.nombre}</p><p class="mini-sub">${c.esteticista}</p></div>
    </div>`).join('');
}

function renderPersonalActividad() {
  const cont = document.getElementById('resumen-personal-actividad');
  cont.innerHTML = state.personal.map(p => `
    <div class="mini-item">
      <div class="mini-avatar">${initiales(p.nombre)}</div>
      <div><p class="mini-nombre">${p.nombre}</p><p class="mini-sub">${p.tratamientos} tratamientos este mes</p></div>
    </div>`).join('');
}

function renderTablaClientes(filtro = '') {
  const tbody = document.getElementById('tbody-clientes');
  const lista = state.clientes.filter(c =>
    c.nombre.toLowerCase().includes(filtro.toLowerCase()) ||
    c.tipo.toLowerCase().includes(filtro.toLowerCase())
  );
  tbody.innerHTML = lista.length
    ? lista.map(c => `
      <tr>
        <td><strong>${c.nombre}</strong></td>
        <td><span class="badge-${c.tipo}">${c.tipo === 'nuevo' ? 'Nuevo' : 'Antiguo'}</span></td>
        <td>${c.tel}</td>
        <td>${c.alergias}</td>
        <td>${c.esteticista}</td>
        <td>${c.visitas}</td>
        <td>${formatFecha(c.proximaCita)}</td>
      </tr>`).join('')
    : '<tr><td colspan="7" style="text-align:center;color:var(--text-soft);padding:1.5rem">Sin resultados</td></tr>';
}

function filtrarTablaClientes(v) { renderTablaClientes(v); }

function renderHistorialGlobal(filtro = '') {
  const tbody = document.getElementById('tbody-historial-global');
  const lista = state.registros.filter(r =>
    r.clienteNombre.toLowerCase().includes(filtro.toLowerCase()) ||
    r.tratamiento.toLowerCase().includes(filtro.toLowerCase())
  );
  tbody.innerHTML = lista.length
    ? [...lista].reverse().map(r => `
      <tr>
        <td>${formatFecha(r.fecha)}</td>
        <td><strong>${r.clienteNombre}</strong></td>
        <td><span class="badge-${r.tipo}">${r.tipo === 'nuevo' ? 'Nuevo' : 'Antiguo'}</span></td>
        <td>${r.tratamiento}</td>
        <td style="font-size:.74rem">${r.productos}</td>
        <td class="td-notas">${r.notas}</td>
        <td>${r.esteticista}</td>
        <td>${formatFecha(r.proximaCita)}</td>
      </tr>`).join('')
    : '<tr><td colspan="8" style="text-align:center;color:var(--text-soft);padding:1.5rem">Sin resultados</td></tr>';
}

function filtrarHistorialGlobal(v) { renderHistorialGlobal(v); }

function renderPersonalGrid() {
  const grid = document.getElementById('personal-grid');
  grid.innerHTML = state.personal.map(p => `
    <div class="personal-card">
      <div class="pc-avatar">${initiales(p.nombre)}</div>
      <p class="pc-nombre">${p.nombre}</p>
      <p class="pc-cargo">${p.cargo}</p>
      <p class="pc-contacto">${p.tel ? `📞 ${p.tel}` : ''}</p>
      ${p.email ? `<span class="pc-usuario">@${p.email}</span>` : ''}
      <span class="pc-tratamientos">${p.tratamientos} tratamientos este mes</span>
      <button class="pc-btn-eliminar" onclick="eliminarPersonal(${p.id})">Eliminar</button>
    </div>`).join('');
}

async function eliminarPersonal(id) {
  if (!confirm('¿Eliminar este miembro del personal? También se eliminará su acceso al sistema.')) return;
  const miembro = state.personal.find(p => p.id === id);
  await fetch(`/api/personal/${id}`, { method: 'DELETE' });
  state.personal = state.personal.filter(p => p.id !== id);

  if (miembro && miembro.email) {
    const usuarios  = obtenerUsuariosApp();
    const filtrados = usuarios.filter(u => u.usuario.toLowerCase() !== miembro.email.toLowerCase());
    localStorage.setItem('ts_usuarios_v2', JSON.stringify(filtrados));
  }

  renderPersonalGrid();
  actualizarStatsGerente();
  renderSelectEsteticistas();
  showToast('Personal eliminado correctamente');
}

// Devuelve todos los usuarios del sistema con sus nombres exactos (igual que sesion.nombre)
function obtenerPersonalAsignable() {
  try {
    const raw = localStorage.getItem('ts_usuarios_v2');
    if (raw) return JSON.parse(raw).map(u => ({ nombre: u.nombre, cargo: u.rol }));
  } catch {}
  return state.personal.map(p => ({ nombre: p.nombre, cargo: p.cargo }));
}

function renderSelectEsteticistas() {
  const sel = document.getElementById('g-esteticista');
  if (!sel) return;
  sel.innerHTML = obtenerPersonalAsignable()
    .map(p => `<option value="${p.nombre}">${p.nombre}</option>`)
    .join('');
}

async function agregarClienteGerente() {
  const nombre       = document.getElementById('g-nombre').value.trim();
  const tel          = document.getElementById('g-tel').value.trim();
  const email        = document.getElementById('g-email').value.trim();
  const alergias     = document.getElementById('g-alergias').value.trim() || 'Ninguna';
  const esteticista  = document.getElementById('g-esteticista').value;
  const citaFecha    = document.getElementById('g-cita-fecha').value;
  const citaHora     = document.getElementById('g-cita-hora').value;
  const citaServicio = document.getElementById('g-cita-servicio').value;
  if (!nombre || !tel) { showToast('⚠ Nombre y teléfono son obligatorios'); return; }
  const nuevoCliente = {
    id: Date.now(), nombre, tel, email, alergias, tipo: 'nuevo', esteticista, visitas: 0,
    proximaCita: citaFecha || '', proxTrat: citaServicio || '',
  };
  await fetch('/api/clientes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(nuevoCliente) });
  state.clientes.push(nuevoCliente);
  if (citaFecha && citaHora && citaServicio) {
    const nuevaCita = {
      id: Date.now() + 1, clienteNombre: nombre, clienteTel: tel, clienteEmail: email,
      servicio: citaServicio, fecha: citaFecha, hora: citaHora, esteticista,
      notas: '', estado: 'programada', clienteId: nuevoCliente.id,
    };
    await fetch('/api/citas', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(nuevaCita) });
    state.citas.push(nuevaCita);
    renderEstadosCitas();
    renderTablaCitas();
  }
  cerrarModal('modal-nuevo-cliente');
  ['g-nombre','g-tel','g-email','g-alergias','g-cita-fecha','g-cita-hora'].forEach(id => { document.getElementById(id).value = ''; });
  document.getElementById('g-cita-servicio').value = '';
  actualizarStatsGerente();
  renderTablaClientes();
  renderMisClientesGerente();
  renderResumenNuevos();
  showToast(`✦ Cliente "${nombre}" agregado${citaFecha && citaHora ? ` · Cita el ${formatFecha(citaFecha)}` : ''}`);
}

async function agregarPersonal() {
  const nombre   = document.getElementById('p-nombre').value.trim();
  const cargo    = document.getElementById('p-cargo').value;
  const tel      = document.getElementById('p-tel').value.trim();
  const usuario  = document.getElementById('p-usuario').value.trim();
  const password = document.getElementById('p-password').value;
  const confirm  = document.getElementById('p-confirm').value;

  if (!nombre)   { showToast('⚠ El nombre es obligatorio'); return; }
  if (!usuario)  { showToast('⚠ El usuario es obligatorio'); return; }
  if (/\s/.test(usuario)) { showToast('⚠ El usuario no puede tener espacios'); return; }
  if (!password || password.length < 6) { showToast('⚠ La contraseña debe tener al menos 6 caracteres'); return; }
  if (password !== confirm) { showToast('⚠ Las contraseñas no coinciden'); return; }

  const usuarios = obtenerUsuariosApp();
  if (usuarios.some(u => u.usuario.toLowerCase() === usuario.toLowerCase())) {
    showToast('⚠ Ese nombre de usuario ya está en uso'); return;
  }

  const nuevo = { id: Date.now(), nombre, cargo, tel, email: usuario, tratamientos: 0 };
  await fetch('/api/personal', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(nuevo) });
  state.personal.push(nuevo);

  const hash = await sha256(password);
  const rol  = cargo === 'Gerente' ? 'gerente' : 'esteticista';
  usuarios.push({ usuario, hash, rol, nombre });
  localStorage.setItem('ts_usuarios_v2', JSON.stringify(usuarios));

  cerrarModal('modal-nuevo-personal');
  ['p-nombre','p-tel','p-usuario','p-password','p-confirm'].forEach(id => { document.getElementById(id).value = ''; });
  actualizarStatsGerente();
  renderPersonalGrid();
  renderPersonalActividad();
  renderSelectEsteticistas();
  showToast(`✦ "${nombre}" agregado al equipo · usuario: ${usuario}`);
}

// ============================================================
//  FORMULARIOS CLÍNICOS POR TERAPIA
// ============================================================

// — Helpers de lectura —
function gVal(id)    { const el = document.getElementById(id); return el ? el.value.trim() : ''; }
function gChecked(n) { return [...document.querySelectorAll(`input[name="${n}"]:checked`)].map(c => c.value).join(', '); }

// — Helpers de construcción de HTML —
function mkSelect(id, label, opts, ph = 'Selecciona...') {
  return `<div class="form-group"><label>${label}</label><select id="${id}">
    <option value="">${ph}</option>
    ${opts.map(o => `<option>${o}</option>`).join('')}
  </select></div>`;
}
function mkText(id, label, ph = '') {
  return `<div class="form-group"><label>${label}</label>
    <input type="text" id="${id}" placeholder="${ph}"></div>`;
}
function mkNumber(id, label, min = 1, max = 30, val = 1) {
  return `<div class="form-group"><label>${label}</label>
    <input type="number" id="${id}" min="${min}" max="${max}" value="${val}" class="num-input"></div>`;
}
function mkTextarea(id, label, ph = '') {
  return `<div class="form-group"><label>${label}</label>
    <textarea id="${id}" placeholder="${ph}"></textarea></div>`;
}
function mkChecks(name, label, opts) {
  return `<div class="form-group"><label>${label}</label>
    <div class="checkbox-group">${opts.map(o =>
      `<label class="checkbox-label"><input type="checkbox" name="${name}" value="${o}"><span>${o}</span></label>`
    ).join('')}</div></div>`;
}
function mkRango(id, label) {
  return `<div class="form-group"><label>${label}</label>
    <div class="rango-wrap">
      <input type="range" id="${id}" min="1" max="10" value="5" class="rango-input"
             oninput="document.getElementById('${id}-lbl').textContent=this.value">
      <span class="rango-val" id="${id}-lbl">5</span>
    </div>
    <div class="rango-labels"><span>1 — Mínimo</span><span>10 — Máximo</span></div>
  </div>`;
}
function mkSub(t) { return `<p class="ficha-subtitulo">${t}</p>`; }
function mkRow(...fields) { return `<div class="form-row-2">${fields.join('')}</div>`; }

// ── MASAJE (Relajante Sueco / Descontracturante) ──────────────
function htmlMasaje() {
  return mkSub('Zonas y técnica')
    + mkRow(
        mkSelect('masaje-presion','Presión aplicada',['Suave','Media','Intensa','Muy intensa']),
        mkSelect('masaje-respuesta','Respuesta del cliente',['Muy satisfactoria','Satisfactoria','Requirió ajuste de presión','Sin respuesta esperada'])
      )
    + mkChecks('masaje-zonas','Zonas corporales tratadas',['Espalda completa','Cuello y hombros','Piernas','Brazos y manos','Cabeza','Cuerpo completo','Glúteos','Pies'])
    + mkRow(mkRango('masaje-tini','Nivel de tensión inicial (1–10)'), mkRango('masaje-tfin','Nivel de tensión al finalizar (1–10)'))
    + mkSub('Productos y hallazgos clínicos')
    + mkText('masaje-aceites','Aceites / cremas utilizados','Ej: Aceite de argán, loción relajante de lavanda...')
    + mkTextarea('masaje-contracturas','Contracturas o puntos de tensión detectados','Describe zonas con contracturas, nódulos o tensión especial...')
    + mkTextarea('masaje-notas','Observaciones clínicas adicionales','Evolución, recomendaciones post-masaje...');
}
function recogerMasaje() {
  const zonas    = gChecked('masaje-zonas');
  const presion  = gVal('masaje-presion');
  const aceites  = gVal('masaje-aceites');
  const tIni     = document.getElementById('masaje-tini')?.value || '5';
  const tFin     = document.getElementById('masaje-tfin')?.value || '5';
  const contract = gVal('masaje-contracturas');
  const resp     = gVal('masaje-respuesta');
  const notas    = gVal('masaje-notas');
  const resumen  = [`Zonas: ${zonas||'—'}`, `Presión: ${presion||'—'}`, `Tensión: ${tIni}/10 → ${tFin}/10`,
                    contract ? `Contracturas: ${contract}` : null, `Respuesta: ${resp||'—'}`, notas||null]
                   .filter(Boolean).join(' | ');
  return { productos: aceites||'—', notas: resumen, datosEspecificos: { zonas,presion,aceites,tIni,tFin,contract,resp,notas } };
}

// ── FACIAL (Hidratante / Lifting) ─────────────────────────────
function htmlFacial() {
  return mkSub('Diagnóstico de piel')
    + mkRow(
        mkSelect('facial-tipo','Tipo de piel',['Seca','Mixta','Grasa','Sensible','Normal','Deshidratada','Madura']),
        mkSelect('facial-reaccion','Reacción post-tratamiento',['Sin reacción — Muy bien tolerado','Leve enrojecimiento (normal)','Enrojecimiento moderado','Irritación leve'])
      )
    + mkChecks('facial-cond','Condiciones actuales',['Manchas / hiperpigmentación','Acné activo','Acné comedonal','Rosácea','Flacidez','Líneas de expresión','Poros dilatados','Deshidratación','Sensibilidad'])
    + mkRow(mkRango('facial-hini','Nivel de hidratación inicial (1–10)'), mkRango('facial-hfin','Nivel de hidratación al finalizar (1–10)'))
    + mkSub('Protocolo aplicado')
    + mkChecks('facial-prot','Pasos del protocolo realizados',['Limpieza profunda','Exfoliación suave','Extracción','Mascarilla hidratante','Mascarilla antioxidante','Sérum activo','Contorno de ojos','Crema hidratante','Protector solar'])
    + mkText('facial-productos','Marcas / productos específicos','Ej: Bioderma, La Roche-Posay, sérum vitamina C...')
    + mkTextarea('facial-obs','Resultados y recomendaciones','Estado post-facial, cambios notados, cuidados para casa...');
}
function recogerFacial() {
  const tipo    = gVal('facial-tipo');
  const cond    = gChecked('facial-cond');
  const prot    = gChecked('facial-prot');
  const prods   = gVal('facial-productos');
  const hIni    = document.getElementById('facial-hini')?.value || '5';
  const hFin    = document.getElementById('facial-hfin')?.value || '5';
  const reac    = gVal('facial-reaccion');
  const obs     = gVal('facial-obs');
  const resumen = [`Piel: ${tipo||'—'}`, cond ? `Condiciones: ${cond}` : null, `Protocolo: ${prot||'—'}`,
                   `Hidratación: ${hIni}/10 → ${hFin}/10`, `Reacción: ${reac||'—'}`, obs||null]
                  .filter(Boolean).join(' | ');
  return { productos: prods||'—', notas: resumen, datosEspecificos: { tipo,cond,prot,prods,hIni,hFin,reac,obs } };
}

// ── RITUAL DE LUJO ────────────────────────────────────────────
function htmlRitual() {
  return mkSub('Fases del ritual')
    + mkChecks('ritual-fases','Fases realizadas',['Bienvenida y ritual de apertura','Exfoliación corporal','Envoltura / mascarilla','Masaje corporal','Ritual facial','Aromaterapia integrada','Baño de pies / hierbas','Hidratación corporal final','Ritual de cierre'])
    + mkRow(
        mkSelect('ritual-dur','Duración total',['60 minutos','90 minutos','120 minutos','150 minutos','180 minutos']),
        mkSelect('ritual-exp','Experiencia del cliente',['Excepcional — Superó expectativas','Muy buena','Buena','Regular — Revisar protocolo'])
      )
    + mkSub('Productos y ambiente')
    + mkText('ritual-prods','Productos y elementos utilizados','Ej: Barro volcánico, aceite de rosa, velas aromáticas...')
    + mkSelect('ritual-aroma','Aromaterapia incluida',['Sí — Lavanda (relajación)','Sí — Eucalipto (energía)','Sí — Rosa (lujo)','Sí — Cítricos (vitalidad)','No incluida'])
    + mkTextarea('ritual-obs','Observaciones del ritual','Cómo se sintió el cliente, elementos más disfrutados, ajustes realizados...');
}
function recogerRitual() {
  const fases  = gChecked('ritual-fases');
  const dur    = gVal('ritual-dur');
  const exp    = gVal('ritual-exp');
  const prods  = gVal('ritual-prods');
  const aroma  = gVal('ritual-aroma');
  const obs    = gVal('ritual-obs');
  const resumen = [`Fases: ${fases||'—'}`, `Duración: ${dur||'—'}`, `Aromaterapia: ${aroma||'—'}`,
                   `Experiencia: ${exp||'—'}`, obs||null].filter(Boolean).join(' | ');
  return { productos: prods||'—', notas: resumen, datosEspecificos: { fases,dur,exp,prods,aroma,obs } };
}

// ── FOTOTERAPIA LED ───────────────────────────────────────────
function htmlFototerapia() {
  return mkSub('Configuración del equipo')
    + mkRow(
        mkSelect('foto-color','Color LED aplicado',['Rojo — Antiedad / Circulación','Azul — Acné / Antibacteriano','Verde — Manchas / Pigmentación','Naranja — Vitalidad / Luminosidad','Infrarrojo — Dolor / Inflamación','Combinado (multi-color)']),
        mkSelect('foto-obj','Objetivo del tratamiento',['Antiedad y firmeza','Tratamiento del acné','Reducción de manchas','Cicatrización','Luminosidad','Dolor muscular / articular'])
      )
    + mkRow(
        mkNumber('foto-tiempo','Tiempo de exposición (min)',5,60,20),
        mkSelect('foto-reac','Respuesta durante la sesión',['Sin sensación — Normal','Leve calor (normal)','Sensación agradable','Sensación intensa — Reducir tiempo'])
      )
    + mkChecks('foto-area','Áreas tratadas',['Rostro completo','Frente','Mejillas','Nariz','Mentón','Escote','Espalda / cuello','Manos'])
    + mkSub('Plan de sesiones')
    + mkRow(mkNumber('foto-num',  'Número de sesión (en el plan)',1,30,1),
            mkNumber('foto-total','Total de sesiones planificadas',1,30,10))
    + mkTextarea('foto-cambios','Cambios o mejoras observados','Evolución respecto a sesiones anteriores, cambios en la piel...');
}
function recogerFototerapia() {
  const color   = gVal('foto-color');
  const obj     = gVal('foto-obj');
  const tiempo  = document.getElementById('foto-tiempo')?.value || '';
  const area    = gChecked('foto-area');
  const num     = document.getElementById('foto-num')?.value || '';
  const total   = document.getElementById('foto-total')?.value || '';
  const reac    = gVal('foto-reac');
  const cambios = gVal('foto-cambios');
  const resumen = [`LED: ${color||'—'}`, `Objetivo: ${obj||'—'}`, `${tiempo} min`,
                   `Áreas: ${area||'—'}`, `Sesión ${num} de ${total}`, `Reacción: ${reac||'—'}`, cambios||null]
                  .filter(Boolean).join(' | ');
  return { productos: `LED ${color||'—'}`, notas: resumen, datosEspecificos: { color,obj,tiempo,area,num,total,reac,cambios } };
}

// ── AROMATERAPIA ──────────────────────────────────────────────
function htmlAromaterapia() {
  return mkSub('Aceites y objetivo')
    + mkText('aroma-aceites','Aceites esenciales utilizados','Ej: Lavanda, eucalipto, bergamota, ylang-ylang...')
    + mkRow(
        mkSelect('aroma-obj','Objetivo principal',['Relajación profunda','Equilibrio emocional','Energización','Desintoxicación','Alivio del dolor muscular','Mejora del sueño','Reducción de ansiedad']),
        mkSelect('aroma-sens','Sensibilidad detectada',['Sin sensibilidad','Leve — Un aceite específico','Moderada — Ajustar dosis','Alta — Cambiar aceite'])
      )
    + mkChecks('aroma-metodo','Método(s) de aplicación',['Difusión ambiental','Masaje terapéutico','Inhalación directa','Baño aromático de pies','Compresas aromáticas','Mezcla en crema base'])
    + mkSub('Estado emocional del cliente')
    + mkRow(
        mkSelect('aroma-ini','Estado al inicio',['Muy estresado/a','Estresado/a','Neutro/a','Levemente relajado/a','Ansioso/a']),
        mkSelect('aroma-fin','Estado al finalizar',['Muy relajado/a','Relajado/a','En paz y equilibrado/a','Energizado/a','Renovado/a'])
      )
    + mkTextarea('aroma-obs','Observaciones de la sesión','Respuesta del cliente, sensaciones referidas, recomendaciones...');
}
function recogerAromaterapia() {
  const aceites = gVal('aroma-aceites');
  const obj     = gVal('aroma-obj');
  const metodo  = gChecked('aroma-metodo');
  const sens    = gVal('aroma-sens');
  const ini     = gVal('aroma-ini');
  const fin     = gVal('aroma-fin');
  const obs     = gVal('aroma-obs');
  const resumen = [`Aceites: ${aceites||'—'}`, `Objetivo: ${obj||'—'}`, `Método: ${metodo||'—'}`,
                   `Estado: ${ini||'—'} → ${fin||'—'}`,
                   sens && sens !== 'Sin sensibilidad' ? `Sensibilidad: ${sens}` : null, obs||null]
                  .filter(Boolean).join(' | ');
  return { productos: aceites||'—', notas: resumen, datosEspecificos: { aceites,obj,metodo,sens,ini,fin,obs } };
}

// ── EXFOLIACIÓN CORPORAL ──────────────────────────────────────
function htmlExfoliacion() {
  return mkSub('Tipo y zonas')
    + mkRow(
        mkSelect('exfol-tipo','Tipo de exfoliante',['Sal marina (mecánico)','Azúcar morena (suave)','Scrub enzimático (papaya/piña)','Café (estimulante)','Mecánico con guante','Químico AHA','Químico BHA']),
        mkSelect('exfol-estado','Estado de la piel al inicio',['Muy rugosa / opaca','Rugosa con células muertas','Normal / leve acumulación','Sensible — exfoliación suave'])
      )
    + mkChecks('exfol-zonas','Zonas exfoliadas',['Brazos','Piernas','Espalda','Abdomen','Glúteos','Cuerpo completo','Pies','Escote / cuello'])
    + mkSub('Productos y resultado')
    + mkText('exfol-prods','Productos utilizados','Ej: Sal del Mar Muerto, aceite de coco base...')
    + mkText('exfol-hidrat','Hidratante aplicado post-exfoliación','Ej: Manteca de karité, crema nutritiva corporal...')
    + mkSelect('exfol-result','Resultado post-tratamiento',['Excelente — Piel muy suave y luminosa','Muy bueno — Gran mejora','Bueno — Mejora notable','Piel levemente sensible post-tratamiento'])
    + mkTextarea('exfol-obs','Observaciones y cuidados recomendados','Estado final de la piel, recomendaciones para casa...');
}
function recogerExfoliacion() {
  const tipo    = gVal('exfol-tipo');
  const estado  = gVal('exfol-estado');
  const zonas   = gChecked('exfol-zonas');
  const prods   = gVal('exfol-prods');
  const hidrat  = gVal('exfol-hidrat');
  const result  = gVal('exfol-result');
  const obs     = gVal('exfol-obs');
  const resumen = [`Exfoliante: ${tipo||'—'}`, `Zonas: ${zonas||'—'}`, `Estado inicial: ${estado||'—'}`,
                   hidrat ? `Post-tratamiento: ${hidrat}` : null, `Resultado: ${result||'—'}`, obs||null]
                  .filter(Boolean).join(' | ');
  return { productos: [prods,hidrat].filter(Boolean).join(', ')||'—', notas: resumen,
           datosEspecificos: { tipo,estado,zonas,prods,hidrat,result,obs } };
}

// ── WELLNESS & YOGA ───────────────────────────────────────────
function htmlWellness() {
  return mkSub('Tipo de práctica')
    + mkRow(
        mkSelect('well-tipo','Tipo de práctica',['Hatha Yoga','Yoga Restaurativo','Yin Yoga','Yoga Flow / Vinyasa','Meditación guiada','Pranayama (respiración)','Pilates suelo','Estiramientos terapéuticos']),
        mkSelect('well-nivel','Nivel del cliente',['Principiante — Primera vez','Principiante — Pocas sesiones','Intermedio','Avanzado'])
      )
    + mkChecks('well-enfoque','Enfoque principal de la sesión',['Relajación y alivio del estrés','Flexibilidad','Fuerza y tono muscular','Equilibrio y concentración','Respiración y control mental','Recuperación / rehabilitación','Energización'])
    + mkSub('Desarrollo de la sesión')
    + mkTextarea('well-ejercicios','Posturas / ejercicios / secuencias realizados','Ej: Balasana, Savasana, saludo al sol...')
    + mkRow(
        mkSelect('well-ini','Estado al inicio',['Muy tenso / estresado','Moderadamente estresado','Neutro','Algo cansado','Con molestias físicas']),
        mkSelect('well-fin','Estado al finalizar',['Muy relajado y en paz','Relajado','Energizado','Equilibrado','Con mayor conciencia corporal'])
      )
    + mkTextarea('well-logros','Logros o mejoras observadas','Progreso en posturas, cambios en respiración, bienestar emocional...');
}
function recogerWellness() {
  const tipo     = gVal('well-tipo');
  const nivel    = gVal('well-nivel');
  const enfoque  = gChecked('well-enfoque');
  const ejers    = gVal('well-ejercicios');
  const ini      = gVal('well-ini');
  const fin      = gVal('well-fin');
  const logros   = gVal('well-logros');
  const resumen  = [`Práctica: ${tipo||'—'}`, `Nivel: ${nivel||'—'}`, `Enfoque: ${enfoque||'—'}`,
                    ejers ? `Ejercicios: ${ejers}` : null, `Estado: ${ini||'—'} → ${fin||'—'}`, logros||null]
                   .filter(Boolean).join(' | ');
  return { productos: '—', notas: resumen, datosEspecificos: { tipo,nivel,enfoque,ejers,ini,fin,logros } };
}

// ── MAPA DE FORMULARIOS ───────────────────────────────────────
const FORMULARIOS = {
  masaje: {
    match: ['Masaje Cuerpo Completo','Masaje Descontracturante','Masaje Deportivo','Masaje para Embarazadas'],
    titulo: 'Ficha Clínica — Masaje Terapéutico', html: htmlMasaje, recoger: recogerMasaje,
  },
  facial: {
    match: ['Limpieza Facial Básica','Limpieza Facial Profunda','Limpieza Facial Premium',
            'Hidratación Facial Profunda','Masaje Craneofacial','Spa Facial','Plasma Básico',
            'Plasma Plus','Exosomas','Rejuveness','Botox','Rinomodelación','Hidralips',
            'Relleno Ácido Hialurónico','Dermapen','Radiofrecuencia Facial'],
    titulo: 'Ficha Clínica — Tratamiento Facial', html: htmlFacial, recoger: recogerFacial,
  },
  ritual: {
    match: ['Chocolaterapia','Ritual de Espalda','Ritual Relajación Total','Ritual Consiéntete','Ritual Renacer','Ritual Paraíso'],
    titulo: 'Ficha Clínica — Ritual Spa', html: htmlRitual, recoger: recogerRitual,
  },
  fototerapia: {
    match: ['Fototerapia LED','Carboxiterapia'],
    titulo: 'Ficha Clínica — Fototerapia LED', html: htmlFototerapia, recoger: recogerFototerapia,
  },
  alternativas: {
    match: ['Acupuntura','Auriculoterapia','Desintoxicación Iónica','Sueroterapia'],
    titulo: 'Ficha Clínica — Terapia Alternativa', html: htmlAromaterapia, recoger: recogerAromaterapia,
  },
  corporal: {
    match: ['Sesión Detox','Maderoterapia','Hidrolipocavitación','Tensamax','Levantamiento de Glúteos',
            'Plan Premium (8 sesiones)','Body Redux Full (10 sesiones)','Full Body 2 (12 sesiones)',
            'Estética Gestacional','Kids Spa'],
    titulo: 'Ficha Clínica — Tratamiento Corporal', html: htmlExfoliacion, recoger: recogerExfoliacion,
  },
};

function cambiarFormTratamiento() {
  const trat = document.getElementById('reg-tratamiento').value;
  const fecha = document.getElementById('reg-fecha').value;
  const cont = document.getElementById('form-terapia-container');

  if (!trat) {
    cont.innerHTML = '<p class="form-placeholder-msg">↑ Selecciona un tratamiento para ver la ficha clínica</p>';
    return;
  }
  if (!fecha) {
    cont.innerHTML = '<p class="form-placeholder-msg">📅 Selecciona también la fecha de la sesión</p>';
    return;
  }
  const key = Object.keys(FORMULARIOS).find(k => FORMULARIOS[k].match.includes(trat));
  if (!key) {
    cont.innerHTML = '<p class="form-placeholder-msg">Este tratamiento no requiere ficha clínica adicional</p>';
    return;
  }
  const form = FORMULARIOS[key];
  cont.innerHTML = `<div class="form-divider"></div>
    <p class="form-section-title">${form.titulo}</p>
    ${form.html()}`;
}

function irPaso(n) {
  if (n === 2) {
    const tipo = document.getElementById('tipo-cliente').value;
    if (tipo === 'antiguo' && !document.getElementById('select-cliente-reg').value) {
      showToast('⚠ Selecciona un cliente para continuar'); return;
    }
    if (tipo === 'nuevo' && !document.getElementById('nuevo-nombre').value.trim()) {
      showToast('⚠ Ingresa el nombre del cliente'); return;
    }
  }
  if (n === 3) {
    const trat  = document.getElementById('reg-tratamiento').value;
    const fecha = document.getElementById('reg-fecha').value;
    if (!trat || !fecha) { showToast('⚠ Selecciona tratamiento y fecha'); return; }
  }
  [1, 2, 3].forEach(i => {
    document.getElementById(`form-step-${i}`).classList.toggle('active', i === n);
    const ind = document.getElementById(`step-ind-${i}`);
    ind.classList.toggle('active', i === n);
    ind.classList.toggle('done', i < n);
  });
  [1, 2].forEach(i => {
    document.getElementById(`step-conn-${i}`).classList.toggle('done', i < n);
  });
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function toggleTip(card) {
  const isOpen = card.classList.contains('open');
  document.querySelectorAll('.tip-card.open').forEach(c => c.classList.remove('open'));
  if (!isOpen) card.classList.add('open');
}

function recogerDatosEspecificos() {
  const trat = document.getElementById('reg-tratamiento').value;
  const key  = Object.keys(FORMULARIOS).find(k => FORMULARIOS[k].match.includes(trat));
  return key ? FORMULARIOS[key].recoger() : null;
}

// ============================================================
//  GRÁFICAS POR PROFESIONAL
// ============================================================
function renderEstadisticas() {
  // Destruir instancias anteriores para evitar conflictos
  Object.keys(chartInstances).forEach(k => {
    chartInstances[k].destroy();
    delete chartInstances[k];
  });

  const cont = document.getElementById('estadisticas-personal');

  cont.innerHTML = state.personal.map(p => {
    const regs  = state.registros.filter(r => r.esteticista === p.nombre);
    const total = regs.length;
    return `
      <div class="est-card">
        <div class="est-card-header">
          <div class="est-card-avatar">${initiales(p.nombre)}</div>
          <div>
            <p class="est-card-nombre">${p.nombre}</p>
            <p class="est-card-cargo">${p.cargo}</p>
            <span class="est-card-badge">${total} tratamiento${total !== 1 ? 's' : ''} registrado${total !== 1 ? 's' : ''}</span>
          </div>
        </div>
        ${total === 0
          ? `<div class="est-empty">Sin registros aún</div>`
          : `<div class="est-chart-wrap">
               <canvas id="chart-${p.id}"></canvas>
               <div class="est-chart-center">
                 <span class="est-chart-num">${total}</span>
                 <span class="est-chart-label">sesiones</span>
               </div>
             </div>
             <div class="est-legend" id="legend-${p.id}"></div>`
        }
      </div>`;
  }).join('');

  // Construir cada gráfica Chart.js
  state.personal.forEach(p => {
    const regs = state.registros.filter(r => r.esteticista === p.nombre);
    if (!regs.length) return;

    const counts = {};
    regs.forEach(r => { counts[r.tratamiento] = (counts[r.tratamiento] || 0) + 1; });

    const labels = Object.keys(counts);
    const data   = Object.values(counts);
    const colors = labels.map((_, i) => CHART_COLORS[i % CHART_COLORS.length]);

    const canvas = document.getElementById(`chart-${p.id}`);
    if (!canvas) return;

    chartInstances[p.id] = new Chart(canvas.getContext('2d'), {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{
          data,
          backgroundColor: colors,
          borderWidth: 3,
          borderColor: '#fff',
          hoverOffset: 10,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        cutout: '68%',
        animation: { animateRotate: true, duration: 800 },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: ctx => ` ${ctx.label}: ${ctx.raw} sesión${ctx.raw !== 1 ? 'es' : ''}`,
            },
          },
        },
      },
    });

    // Leyenda personalizada con colores del spa
    const legend = document.getElementById(`legend-${p.id}`);
    if (legend) {
      legend.innerHTML = labels.map((label, i) => `
        <div class="est-legend-item">
          <div class="est-legend-dot" style="background:${colors[i]}"></div>
          <span class="est-legend-name">${label}</span>
          <span class="est-legend-count">${data[i]}</span>
        </div>`).join('');
    }
  });
}

// ============================================================
//  ESTETICISTA
// ============================================================
function cargarEsteticista() {
  poblarSelectClientes();
  actualizarStatsEsteticista();
  renderResumenEstRecientes();
  renderMisClientes();
  renderMiHistorial();
  renderCitasHoyEsteticista();
}

function actualizarStatsEsteticista() {
  if (!state.sesionActual) return;
  const miNombre = state.sesionActual.nombre;
  const misClientes    = state.clientes.filter(c => c.esteticista === miNombre).length;
  const misTratamientos = state.registros.filter(r => r.esteticista === miNombre).length;
  const elStat = document.getElementById('est-stat-clientes');
  const trStat = document.getElementById('est-stat-tratamientos');
  if (elStat) elStat.textContent = misClientes;
  if (trStat) trStat.textContent = misTratamientos;
  const saludo = document.getElementById('est-saludo');
  if (saludo) {
    const h = new Date().getHours();
    const txt = h < 12 ? 'Buenos días' : h < 18 ? 'Buenas tardes' : 'Buenas noches';
    saludo.innerHTML = `${txt}, <em>${miNombre.split(' ')[0]}</em>`;
  }
}

function renderResumenEstRecientes() {
  const cont = document.getElementById('est-resumen-recientes');
  if (!cont || !state.sesionActual) return;
  const miNombre = state.sesionActual.nombre;
  const ultimos  = state.registros.filter(r => r.esteticista === miNombre).reverse().slice(0, 5);
  if (!ultimos.length) { cont.innerHTML = '<p class="empty-msg">Aún no hay registros.</p>'; return; }
  cont.innerHTML = ultimos.map(r => `
    <div class="reg-rec-item">
      <div class="reg-rec-dot"></div>
      <div class="reg-rec-info">
        <p class="reg-rec-nombre">${r.clienteNombre} — ${r.tratamiento}</p>
        <p class="reg-rec-det">${formatFecha(r.fecha)}</p>
      </div>
      <span class="badge-${r.tipo}">${r.tipo === 'nuevo' ? 'Nuevo' : 'Antiguo'}</span>
    </div>`).join('');
}

function poblarSelectClientes() {
  const sel = document.getElementById('select-cliente-reg');
  sel.innerHTML = '<option value="">-- Elige un cliente --</option>' +
    state.clientes.map(c => `<option value="${c.id}">${c.nombre}</option>`).join('');
}

function renderMisClientes(filtro = '') {
  const cont     = document.getElementById('mis-clientes-cards');
  const miNombre = state.sesionActual ? state.sesionActual.nombre : '';
  const lista    = state.clientes.filter(c =>
    c.esteticista === miNombre &&
    c.nombre.toLowerCase().includes(filtro.toLowerCase())
  );
  if (!lista.length) { cont.innerHTML = '<p class="empty-msg">Sin clientes asignados.</p>'; return; }
  cont.innerHTML = lista.map(c => `
    <div class="cliente-card">
      <div class="cc-top">
        <div class="cc-avatar">${initiales(c.nombre)}</div>
        <div>
          <p class="cc-nombre">${c.nombre}</p>
          <div class="cc-tipo"><span class="badge-${c.tipo}">${c.tipo === 'nuevo' ? 'Cliente nuevo' : 'Cliente antiguo'}</span></div>
        </div>
      </div>
      <div class="cc-datos">
        <span>📞 ${c.tel}</span>
        <span>✉ ${c.email || '—'}</span>
        <span>Visitas: ${c.visitas}</span>
      </div>
      ${c.alergias && c.alergias !== 'Ninguna' ? `<div class="cc-alergias">⚠ Alergias: ${c.alergias}</div>` : ''}
      ${c.proximaCita ? `<div class="cc-prox">📅 Próx. cita: ${formatFecha(c.proximaCita)} — ${c.proxTrat || ''}</div>` : ''}
      <button class="cc-btn" onclick="preseleccionarCliente(${c.id})">Registrar nuevo tratamiento →</button>
    </div>`).join('');
}

function filtrarMisClientes(v) { renderMisClientes(v); }

function preseleccionarCliente(id) {
  showTab('esteticista', 'nuevo-registro', document.querySelectorAll('#dash-esteticista .nav-item')[2]);
  document.getElementById('tipo-cliente').value = 'antiguo';
  toggleClienteNuevo();
  document.getElementById('select-cliente-reg').value = id;
}

function toggleClienteNuevo() {
  const tipo = document.getElementById('tipo-cliente').value;
  document.getElementById('campos-cliente-nuevo').style.display  = tipo === 'nuevo'   ? 'block' : 'none';
  document.getElementById('grupo-select-cliente').style.display  = tipo === 'antiguo' ? 'block' : 'none';
  const btn = document.getElementById('btn-paso1-siguiente');
  if (!btn) return;
  if (tipo === 'nuevo') {
    btn.textContent = 'Programar Cita →';
    btn.onclick = programarCitaNuevoCliente;
  } else {
    btn.textContent = 'Siguiente →';
    btn.onclick = () => irPaso(2);
  }
}

async function programarCitaNuevoCliente() {
  const nombre   = document.getElementById('nuevo-nombre').value.trim();
  const tel      = document.getElementById('nuevo-tel').value.trim();
  const emailEl  = document.getElementById('nuevo-email');
  const email    = emailEl ? emailEl.value.trim() : '';
  const alergias = document.getElementById('nuevo-alergias').value.trim() || 'Ninguna';
  const fecha    = document.getElementById('nuevo-cita-fecha').value;
  const hora     = document.getElementById('nuevo-cita-hora').value;
  const servicio = document.getElementById('nuevo-cita-servicio').value;
  const miNombre = state.sesionActual ? state.sesionActual.nombre : 'Esteticista';

  if (!nombre || !tel)              { showToast('⚠ Nombre y teléfono son obligatorios'); return; }
  if (!fecha || !hora || !servicio) { showToast('⚠ Completa la fecha, hora y servicio de la cita'); return; }

  const nuevoCliente = {
    id: Date.now(), nombre, tel, email, alergias,
    tipo: 'nuevo', esteticista: miNombre, visitas: 0,
    proximaCita: fecha, proxTrat: servicio,
  };
  await fetch('/api/clientes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(nuevoCliente) });
  state.clientes.push(nuevoCliente);
  poblarSelectClientes();

  const nuevaCita = {
    id: Date.now() + 1, clienteNombre: nombre, clienteTel: tel, clienteEmail: email,
    servicio, fecha, hora, esteticista: miNombre,
    notas: '', estado: 'programada', clienteId: nuevoCliente.id,
  };
  await fetch('/api/citas', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(nuevaCita) });
  state.citas.push(nuevaCita);

  ['nuevo-nombre','nuevo-tel','nuevo-email','nuevo-alergias','nuevo-cita-fecha','nuevo-cita-hora'].forEach(id => {
    const el = document.getElementById(id); if (el) el.value = '';
  });
  const servEl = document.getElementById('nuevo-cita-servicio');
  if (servEl) servEl.value = '';

  renderMisClientes();
  renderCitasHoyEsteticista();
  showToast(`✦ ${nombre} registrada · Cita el ${formatFecha(fecha)} a las ${hora}`);
}

function renderCitasHoyEsteticista() {
  const cont = document.getElementById('citas-hoy-esteticista');
  if (!cont) return;
  const hoy      = new Date().toISOString().split('T')[0];
  const miNombre = state.sesionActual ? state.sesionActual.nombre : '';
  const citasHoy = state.citas.filter(c =>
    c.fecha === hoy && c.esteticista === miNombre && c.estado === 'programada'
  );
  if (!citasHoy.length) { cont.innerHTML = ''; return; }
  cont.innerHTML = `
    <div class="citas-hoy-card">
      <div class="citas-hoy-titulo">Citas para hoy (${citasHoy.length})</div>
      <div class="citas-hoy-lista">
        ${citasHoy.map(c => `
          <div class="cita-hoy-item">
            <div class="cita-hoy-info">
              <strong>${c.clienteNombre}</strong>
              <span class="cita-hoy-det">${c.hora} · ${c.servicio}</span>
            </div>
            <button class="btn-atender-cita" onclick="atenderCita(${c.id})">Atender →</button>
          </div>`).join('')}
      </div>
    </div>`;
}

async function atenderCita(citaId) {
  const cita = state.citas.find(c => c.id === citaId);
  if (!cita) return;
  window.citaEnAtencion = citaId;

  let cliente = state.clientes.find(c =>
    (cita.clienteId && c.id === cita.clienteId) ||
    c.nombre.toLowerCase() === cita.clienteNombre.toLowerCase()
  );

  if (!cliente) {
    const nuevo = {
      id: Date.now(), nombre: cita.clienteNombre, tel: cita.clienteTel || '',
      email: cita.clienteEmail || '', alergias: 'Ninguna',
      tipo: 'nuevo', esteticista: cita.esteticista, visitas: 0,
      proximaCita: '', proxTrat: '',
    };
    await fetch('/api/clientes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(nuevo) });
    state.clientes.push(nuevo);
    poblarSelectClientes();
    cliente = nuevo;
  }

  document.getElementById('tipo-cliente').value = 'antiguo';
  toggleClienteNuevo();
  document.getElementById('select-cliente-reg').value = cliente.id;
  document.getElementById('reg-tratamiento').value = cita.servicio;
  document.getElementById('reg-fecha').value = cita.fecha;
  cambiarFormTratamiento();
  irPaso(2);
}

async function guardarRegistro() {
  const tipo        = document.getElementById('tipo-cliente').value;
  const tratamiento = document.getElementById('reg-tratamiento').value;
  const fecha       = document.getElementById('reg-fecha').value;
  const proxFecha   = document.getElementById('reg-proxima').value;
  const proxTrat    = document.getElementById('reg-prox-trat').value.trim();
  const miNombre    = state.sesionActual ? state.sesionActual.nombre : 'Esteticista';

  if (!tratamiento || !fecha) { showToast('⚠ Selecciona tratamiento y fecha'); return; }

  const datosForm = recogerDatosEspecificos();
  if (!datosForm) { showToast('⚠ Completa el formulario clínico del tratamiento'); return; }
  const { productos, notas, datosEspecificos } = datosForm;

  let clienteNombre, clienteId, clienteTipo;

  if (tipo === 'antiguo') {
    const selId = parseInt(document.getElementById('select-cliente-reg').value);
    if (!selId) { showToast('⚠ Selecciona un cliente'); return; }
    const cliente = state.clientes.find(c => c.id === selId);
    if (!cliente) return;
    clienteNombre = cliente.nombre;
    clienteId     = cliente.id;
    clienteTipo   = 'antiguo';
    cliente.visitas++;
    if (proxFecha) cliente.proximaCita = proxFecha;
    if (proxTrat)  cliente.proxTrat    = proxTrat;
    await fetch(`/api/clientes/${cliente.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(cliente) });
  } else {
    clienteNombre  = document.getElementById('nuevo-nombre').value.trim();
    const tel      = document.getElementById('nuevo-tel').value.trim();
    const email    = document.getElementById('nuevo-email').value.trim();
    const alergias = document.getElementById('nuevo-alergias').value.trim() || 'Ninguna';
    if (!clienteNombre || !tel) { showToast('⚠ Nombre y teléfono son obligatorios'); return; }
    const nuevoCliente = {
      id: Date.now(), nombre: clienteNombre, tel, email, alergias,
      tipo: 'nuevo', esteticista: miNombre, visitas: 1,
      proximaCita: proxFecha || '', proxTrat: proxTrat || '',
    };
    await fetch('/api/clientes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(nuevoCliente) });
    state.clientes.push(nuevoCliente);
    clienteId   = nuevoCliente.id;
    clienteTipo = 'nuevo';
    poblarSelectClientes();
  }

  const nuevoRegistro = {
    id: Date.now(), fecha, clienteId, clienteNombre, tipo: clienteTipo,
    tratamiento, productos, notas, datosEspecificos, esteticista: miNombre,
    proximaCita: proxFecha, proxTrat,
  };
  await fetch('/api/registros', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(nuevoRegistro) });
  state.registros.push(nuevoRegistro);

  ['reg-tratamiento','reg-fecha','reg-proxima','reg-prox-trat',
   'nuevo-nombre','nuevo-tel','nuevo-email','nuevo-alergias'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  document.getElementById('tipo-cliente').value = 'antiguo';
  toggleClienteNuevo();
  cambiarFormTratamiento();
  irPaso(1);

  renderMisClientes();
  renderMiHistorial();
  actualizarStatsEsteticista();
  renderResumenEstRecientes();
  if (window.citaEnAtencion) {
    const citaAtendida = state.citas.find(c => c.id === window.citaEnAtencion);
    if (citaAtendida) {
      citaAtendida.estado = 'completada';
      await fetch(`/api/citas/${citaAtendida.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(citaAtendida) });
    }
    window.citaEnAtencion = null;
    renderCitasHoyEsteticista();
    renderEstadosCitas();
  }
  // Actualizar stats gerente si está logueada (tratamiento registrado desde panel gerente)
  const esGer = state.sesionActual?.rol === 'gerente' || state.sesionActual?.rol === 'administradora';
  if (esGer) { actualizarStatsGerente(); renderResumenRecientes(); }
  showToast(`✦ Registro guardado para ${clienteNombre}`);
  showTab('esteticista', 'mi-historial', document.querySelectorAll('#dash-esteticista .nav-item')[3]);
}

function renderMiHistorial() {
  const tbody    = document.getElementById('tbody-mi-historial');
  const miNombre = state.sesionActual ? state.sesionActual.nombre : '';
  const misReg   = state.registros.filter(r => r.esteticista === miNombre);
  tbody.innerHTML = misReg.length
    ? [...misReg].reverse().map(r => `
      <tr>
        <td>${formatFecha(r.fecha)}</td>
        <td><strong>${r.clienteNombre}</strong></td>
        <td><span class="badge-${r.tipo}">${r.tipo === 'nuevo' ? 'Nuevo' : 'Antiguo'}</span></td>
        <td>${r.tratamiento}</td>
        <td style="font-size:.74rem">${r.productos}</td>
        <td class="td-notas">${r.notas}</td>
        <td>${formatFecha(r.proximaCita)}</td>
      </tr>`).join('')
    : '<tr><td colspan="7" style="text-align:center;color:var(--text-soft);padding:1.5rem">Sin registros aún</td></tr>';
}

// ============================================================
//  INIT
// ============================================================
document.addEventListener('DOMContentLoaded', async () => {
  const sesion = verificarSesion();
  if (!sesion) return;
  await cargarState();
  const fechaEl = document.getElementById('reg-fecha');
  if (fechaEl) fechaEl.valueAsDate = new Date();
  iniciarDashboard(sesion);
  console.log('✿ Tania Spa — Panel interno cargado');
});
function renderIngresos() {
  const ahora = new Date();
  const mA = ahora.getMonth(), aA = ahora.getFullYear();
  const mP = mA === 0 ? 11 : mA - 1;
  const aP = mA === 0 ? aA - 1 : aA;

  const regsMes      = state.registros.filter(r => { const d = new Date(r.fecha); return d.getMonth()===mA && d.getFullYear()===aA; });
  const regsAnterior = state.registros.filter(r => { const d = new Date(r.fecha); return d.getMonth()===mP && d.getFullYear()===aP; });

  const totalMes      = regsMes.reduce((s,r) => s + (PRECIOS[r.tratamiento]||0), 0);
  const totalAnterior = regsAnterior.reduce((s,r) => s + (PRECIOS[r.tratamiento]||0), 0);

  let crecimientoStr = '—';
  let crecPorcentaje = null;
  if (totalAnterior > 0) {
    crecPorcentaje = ((totalMes - totalAnterior) / totalAnterior * 100).toFixed(1);
    crecimientoStr = `${+crecPorcentaje >= 0 ? '+' : ''}${crecPorcentaje}%`;
  }

  // Stats cards con hint y cursor
  document.getElementById('stat-ingresos-mes').textContent        = formatCOP(totalMes);
  document.getElementById('stat-ingresos-anterior').textContent   = formatCOP(totalAnterior);
  document.getElementById('stat-ingresos-crecimiento').textContent = crecimientoStr;

  // Agregar hints y cursor a las tarjetas
  const cards = document.querySelectorAll('#gerente-ingresos .stat-card');
  cards.forEach(c => {
    if (!c.querySelector('.stat-hint')) {
      const hint = document.createElement('p');
      hint.className = 'stat-hint';
      hint.textContent = '↓ Ver detalle';
      c.querySelector('div:last-child').appendChild(hint);
    }
  });

  // Asignar clicks
  if (cards[0]) cards[0].onclick = () => toggleIngresosPanel('panel-ingresos-mes');
  if (cards[1]) cards[1].onclick = () => toggleIngresosPanel('panel-ingresos-anterior');
  if (cards[2]) cards[2].onclick = () => toggleIngresosPanel('panel-ingresos-crec');

  // Nombres de meses
  const nombresMes = ['Enero','Febrero','Marzo','Abril','Mayo','Junio',
                      'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

  // ── Función reutilizable para tabla de desglose ──
  function tablaDesglose(regs) {
    const total = regs.reduce((s,r) => s + (PRECIOS[r.tratamiento]||0), 0);
    if (!regs.length) return '<p class="empty-msg">Sin registros en este período.</p>';
    const porTrat = {};
    regs.forEach(r => { porTrat[r.tratamiento] = (porTrat[r.tratamiento]||0)+1; });
    const filas = Object.entries(porTrat).map(([trat, count]) => {
      const precio = PRECIOS[trat]||0;
      return `<tr><td>${trat}</td><td>${count}</td><td>${formatCOP(precio)}</td><td>${formatCOP(precio*count)}</td></tr>`;
    }).join('');
    return `<table class="dash-table">
      <thead><tr><th>Tratamiento</th><th>Sesiones</th><th>Valor unit.</th><th>Total</th></tr></thead>
      <tbody>${filas}
        <tr class="total-row"><td colspan="3"><strong>Total</strong></td><td><strong>${formatCOP(total)}</strong></td></tr>
      </tbody></table>`;
  }

  // ── Panel: Este mes ──
  injectPanel('panel-ingresos-mes',
    `Desglose — ${nombresMes[mA]} ${aA}`,
    tablaDesglose(regsMes)
  );

  // ── Panel: Mes anterior ──
  injectPanel('panel-ingresos-anterior',
    `Desglose — ${nombresMes[mP]} ${aP}`,
    tablaDesglose(regsAnterior)
  );

  // ── Panel: Crecimiento ──
  const promedio = regsMes.length ? Math.round(totalMes / regsMes.length) : 0;
  const badgeCrec = crecPorcentaje !== null
    ? (+crecPorcentaje >= 0
        ? `<span style="background:rgba(209,250,229,.5);color:#065f46;border:1px solid rgba(110,231,183,.4);font-size:.72rem;padding:.2rem .6rem;border-radius:20px">+${crecPorcentaje}%</span>`
        : `<span style="background:rgba(252,231,231,.5);color:#9b1c1c;border:1px solid rgba(248,180,180,.4);font-size:.72rem;padding:.2rem .6rem;border-radius:20px">${crecPorcentaje}%</span>`)
    : `<span style="color:var(--text-soft);font-size:.8rem">Sin datos del mes anterior</span>`;

  injectPanel('panel-ingresos-crec',
    'Análisis de crecimiento',
    `<div class="crec-detalle">
      <div class="crec-fila"><span class="crec-fila-label">${nombresMes[mA]} ${aA}</span><span class="crec-fila-val">${formatCOP(totalMes)}</span></div>
      <div class="crec-fila"><span class="crec-fila-label">${nombresMes[mP]} ${aP}</span><span class="crec-fila-val">${formatCOP(totalAnterior)}</span></div>
      <div class="crec-fila"><span class="crec-fila-label">Variación</span>${badgeCrec}</div>
      <div class="crec-fila"><span class="crec-fila-label">Sesiones este mes</span><span class="crec-fila-val">${regsMes.length}</span></div>
      <div class="crec-fila"><span class="crec-fila-label">Promedio por sesión</span><span class="crec-fila-val">${formatCOP(promedio)}</span></div>
    </div>`
  );

  // Tabla principal (debajo de los paneles — existente en el HTML)
  document.getElementById('ingresos-titulo-mes').textContent =
    `Ingresos por tratamiento — ${nombresMes[mA]} ${aA}`;

  const tbody = document.getElementById('tbody-ingresos');
  const porTrat = {};
  regsMes.forEach(r => { porTrat[r.tratamiento] = (porTrat[r.tratamiento]||0)+1; });
  const filas = Object.entries(porTrat).map(([trat, count]) => {
    const precio = PRECIOS[trat]||0;
    return `<tr><td>${trat}</td><td>${count}</td><td>${formatCOP(precio)}</td><td>${formatCOP(precio*count)}</td></tr>`;
  });
  tbody.innerHTML = filas.length
    ? filas.join('') + `<tr class="total-row"><td colspan="3"><strong>Total</strong></td><td><strong>${formatCOP(totalMes)}</strong></td></tr>`
    : '<tr><td colspan="4" style="text-align:center;color:var(--text-soft);padding:1.5rem">Sin registros este mes</td></tr>';
}

// ── Helpers de paneles desplegables ──
function injectPanel(id, titulo, contenido) {
  const ingresos = document.getElementById('gerente-ingresos');
  let panel = document.getElementById(id);
  if (!panel) {
    panel = document.createElement('div');
    panel.id = id;
    panel.className = 'ingreso-panel';
    // Insertar antes del section-block existente
    const seccion = ingresos.querySelector('.section-block');
    ingresos.querySelector('.dash-main > div') // fallback
    ingresos.insertBefore(panel, ingresos.querySelector('.section-block'));
  }
  panel.innerHTML = `<div class="ingreso-panel-inner">
    <div class="ingreso-panel-title">
      ${titulo}
      <button class="ingreso-panel-close" onclick="toggleIngresosPanel('${id}')">✕</button>
    </div>
    ${contenido}
  </div>`;
}

function toggleIngresosPanel(idTarget) {
  const todos = ['panel-ingresos-mes','panel-ingresos-anterior','panel-ingresos-crec'];
  const cards = document.querySelectorAll('#gerente-ingresos .stat-card');
  const estaAbierto = document.getElementById(idTarget)?.classList.contains('open');
  todos.forEach(id => document.getElementById(id)?.classList.remove('open'));
  cards.forEach(c => c.classList.remove('active'));
  if (!estaAbierto) {
    document.getElementById(idTarget)?.classList.add('open');
    const idx = todos.indexOf(idTarget);
    if (cards[idx]) cards[idx].classList.add('active');
  }
}

// ============================================================
//  CITAS — CRUD COMPLETO
// ============================================================
const SERVICIOS_CITA = [
  // Faciales
  'Limpieza Facial Básica','Limpieza Facial Profunda','Limpieza Facial Premium',
  'Hidratación Facial Profunda','Masaje Craneofacial','Spa Facial','Plasma Básico','Plasma Plus',
  'Exosomas','Rejuveness','Botox','Rinomodelación','Hidralips','Relleno Ácido Hialurónico','Dermapen','Radiofrecuencia Facial',
  // Capilares
  'Plasma Capilar','Ampollas Capilares','Tónico Capilar',
  // Corporales
  'Sesión Detox','Maderoterapia','Hidrolipocavitación','Tensamax','Levantamiento de Glúteos',
  'Plan Premium (8 sesiones)','Body Redux Full (10 sesiones)','Full Body 2 (12 sesiones)',
  // Terapias Alternativas
  'Acupuntura','Auriculoterapia','Desintoxicación Iónica','Sueroterapia','Carboxiterapia','Fototerapia LED',
  // Masajes y Rituales
  'Masaje Cuerpo Completo','Masaje Descontracturante','Masaje Deportivo','Masaje para Embarazadas',
  'Chocolaterapia','Ritual de Espalda','Ritual Relajación Total','Ritual Consiéntete','Ritual Renacer','Ritual Paraíso',
  // Especiales
  'Kids Spa','Fiestas Infantiles','Estética Gestacional',
  // Depilación
  'Depilación con Cera Facial','Depilación con Cera Corporal','Depilación Láser Facial','Depilación Láser Corporal',
  // Post Operatorios
  'Post Operatorio',
];

function renderEstadosCitas() {
  const hoy = new Date().toISOString().split('T')[0];
  document.getElementById('stat-citas-programadas').textContent =
    state.citas.filter(c => c.estado === 'programada').length;
  document.getElementById('stat-citas-completadas').textContent =
    state.citas.filter(c => c.estado === 'completada').length;
  document.getElementById('stat-citas-canceladas').textContent  =
    state.citas.filter(c => c.estado === 'cancelada').length;
  document.getElementById('stat-citas-hoy').textContent =
    state.citas.filter(c => c.fecha === hoy && c.estado === 'programada').length;
}

function renderTablaCitas(filtro = '', estadoFiltro = '') {
  const tbody = document.getElementById('tbody-citas');
  let lista = state.citas.filter(c => {
    const matchTexto = !filtro ||
      c.clienteNombre.toLowerCase().includes(filtro.toLowerCase()) ||
      c.servicio.toLowerCase().includes(filtro.toLowerCase()) ||
      c.esteticista.toLowerCase().includes(filtro.toLowerCase());
    const matchEstado = !estadoFiltro || c.estado === estadoFiltro;
    return matchTexto && matchEstado;
  });
  lista = [...lista].sort((a, b) =>
    (a.fecha + 'T' + a.hora) < (b.fecha + 'T' + b.hora) ? 1 : -1
  );
  const badges = {
    programada: '<span class="badge-programada">Programada</span>',
    completada:  '<span class="badge-completada">Completada</span>',
    cancelada:   '<span class="badge-cancelada">Cancelada</span>',
  };
  tbody.innerHTML = lista.length
    ? lista.map(c => {
        const acciones = c.estado === 'programada'
          ? `<div class="acciones-cell">
               <button class="btn-accion btn-completar" title="Completar" onclick="cambiarEstadoCita(${c.id},'completada')">✓</button>
               <button class="btn-accion btn-editar"    title="Editar"    onclick="editarCita(${c.id})">✎</button>
               <button class="btn-accion btn-cancelar"  title="Cancelar"  onclick="cambiarEstadoCita(${c.id},'cancelada')">✕</button>
             </div>`
          : `<button class="btn-accion btn-eliminar-inv" title="Eliminar" onclick="eliminarCita(${c.id})">🗑</button>`;
        return `<tr>
          <td><strong>${c.clienteNombre}</strong></td>
          <td style="font-size:.75rem">${c.clienteTel}<br><span style="color:var(--text-soft)">${c.clienteEmail||'—'}</span></td>
          <td>${c.servicio}</td>
          <td>${formatFecha(c.fecha)}</td>
          <td>${c.hora}</td>
          <td>${c.esteticista}</td>
          <td>${badges[c.estado] || ''}</td>
          <td>${acciones}</td>
        </tr>`;
      }).join('')
    : '<tr><td colspan="8" style="text-align:center;color:var(--text-soft);padding:1.5rem">Sin citas registradas</td></tr>';
}

function filtrarCitasTexto(v) {
  const est = document.getElementById('filtro-estado-citas')?.value || '';
  renderTablaCitas(v, est);
}
function filtrarCitasEstado(v) {
  const txt = document.querySelector('#gerente-citas .search-bar input')?.value || '';
  renderTablaCitas(txt, v);
}

function verificarDisponibilidad(fecha, hora, esteticista, excludeId = null) {
  return !state.citas.some(c =>
    c.id !== excludeId &&
    c.fecha === fecha &&
    c.hora  === hora  &&
    c.esteticista === esteticista &&
    c.estado !== 'cancelada'
  );
}

function poblarSelectsEsteticistaCita(selectId) {
  const sel = document.getElementById(selectId);
  if (!sel) return;
  const rolesLabel = { esteticista: 'Esteticista', gerente: 'Gerente', administradora: 'Administradora' };
  sel.innerHTML = '<option value="">-- Selecciona --</option>' +
    obtenerPersonalAsignable()
      .map(p => `<option value="${p.nombre}">${p.nombre} (${rolesLabel[p.cargo] || p.cargo})</option>`)
      .join('');
}

function iniciarFormCita() {
  poblarSelectsEsteticistaCita('cita-esteticista');
  const hoy = new Date().toISOString().split('T')[0];
  document.getElementById('cita-fecha').min = hoy;
  abrirModal('modal-nueva-cita');
}

async function guardarCita() {
  const nombre      = document.getElementById('cita-nombre').value.trim();
  const tel         = document.getElementById('cita-tel').value.trim();
  const email       = document.getElementById('cita-email').value.trim();
  const servicio    = document.getElementById('cita-servicio').value;
  const fecha       = document.getElementById('cita-fecha').value;
  const hora        = document.getElementById('cita-hora').value;
  const esteticista = document.getElementById('cita-esteticista').value;
  const notas       = document.getElementById('cita-notas').value.trim();

  if (!nombre || !tel || !servicio || !fecha || !hora || !esteticista) {
    showToast('⚠ Completa todos los campos obligatorios'); return;
  }
  if (!verificarDisponibilidad(fecha, hora, esteticista)) {
    showToast(`⚠ ${esteticista} ya tiene una cita a las ${hora} el ${formatFecha(fecha)}`); return;
  }

  const nuevaCita = {
    id: Date.now(), clienteNombre: nombre, clienteTel: tel, clienteEmail: email,
    servicio, fecha, hora, esteticista, notas, estado: 'programada',
  };
  await fetch('/api/citas', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(nuevaCita) });
  state.citas.push(nuevaCita);
  cerrarModal('modal-nueva-cita');
  ['cita-nombre','cita-tel','cita-email','cita-fecha','cita-hora','cita-notas'].forEach(id => {
    const el = document.getElementById(id); if (el) el.value = '';
  });
  renderEstadosCitas();
  renderTablaCitas();
  showToast(`✦ Cita de ${nombre} agendada`);
}

function editarCita(id) {
  const cita = state.citas.find(c => c.id === id);
  if (!cita) return;
  document.getElementById('edit-cita-id').value          = id;
  document.getElementById('edit-cita-nombre').value      = cita.clienteNombre;
  document.getElementById('edit-cita-tel').value         = cita.clienteTel;
  document.getElementById('edit-cita-email').value       = cita.clienteEmail || '';
  document.getElementById('edit-cita-servicio').value    = cita.servicio;
  document.getElementById('edit-cita-fecha').value       = cita.fecha;
  document.getElementById('edit-cita-hora').value        = cita.hora;
  document.getElementById('edit-cita-notas').value       = cita.notas || '';
  poblarSelectsEsteticistaCita('edit-cita-esteticista');
  document.getElementById('edit-cita-esteticista').value = cita.esteticista;
  const btnReg = document.getElementById('btn-registrar-desde-cita');
  if (btnReg) btnReg.style.display = cita.estado === 'programada' ? 'inline-flex' : 'none';
  abrirModal('modal-editar-cita');
}

async function iniciarRegistroDesdeCita() {
  const id = parseInt(document.getElementById('edit-cita-id').value);
  cerrarModal('modal-editar-cita');
  const esEsteticista = state.sesionActual && state.sesionActual.rol === 'esteticista';
  if (esEsteticista) {
    await atenderCita(id);
  } else {
    const cita = state.citas.find(c => c.id === id);
    if (!cita) return;
    if (!confirm(`¿Registrar tratamiento para ${cita.clienteNombre}?\nEsto abrirá el formulario de la esteticista.`)) return;
    document.getElementById('dash-gerente').classList.remove('active');
    document.getElementById('dash-esteticista').classList.add('active');
    showTab('esteticista', 'nuevo-registro', document.querySelectorAll('#dash-esteticista .nav-item')[2]);
    await atenderCita(id);
  }
}

async function actualizarCita() {
  const id          = parseInt(document.getElementById('edit-cita-id').value);
  const nombre      = document.getElementById('edit-cita-nombre').value.trim();
  const tel         = document.getElementById('edit-cita-tel').value.trim();
  const email       = document.getElementById('edit-cita-email').value.trim();
  const servicio    = document.getElementById('edit-cita-servicio').value;
  const fecha       = document.getElementById('edit-cita-fecha').value;
  const hora        = document.getElementById('edit-cita-hora').value;
  const esteticista = document.getElementById('edit-cita-esteticista').value;
  const notas       = document.getElementById('edit-cita-notas').value.trim();

  if (!nombre || !tel || !servicio || !fecha || !hora || !esteticista) {
    showToast('⚠ Completa todos los campos obligatorios'); return;
  }
  if (!verificarDisponibilidad(fecha, hora, esteticista, id)) {
    showToast(`⚠ ${esteticista} ya tiene una cita a las ${hora} el ${formatFecha(fecha)}`); return;
  }

  const cita = state.citas.find(c => c.id === id);
  if (!cita) return;
  Object.assign(cita, { clienteNombre: nombre, clienteTel: tel, clienteEmail: email,
                         servicio, fecha, hora, esteticista, notas });
  await fetch(`/api/citas/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(cita) });
  cerrarModal('modal-editar-cita');
  renderEstadosCitas();
  renderTablaCitas();
  showToast(`✦ Cita de ${nombre} actualizada`);
}

async function cambiarEstadoCita(id, estado) {
  const cita = state.citas.find(c => c.id === id);
  if (!cita) return;
  const msgs = { completada: '¿Marcar esta cita como completada?', cancelada: '¿Cancelar esta cita?' };
  if (!confirm(msgs[estado])) return;
  cita.estado = estado;
  await fetch(`/api/citas/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(cita) });
  renderEstadosCitas();
  renderTablaCitas();
  showToast(`✦ Cita ${estado}`);
}

async function eliminarCita(id) {
  if (!confirm('¿Eliminar esta cita del historial?')) return;
  await fetch(`/api/citas/${id}`, { method: 'DELETE' });
  state.citas = state.citas.filter(c => c.id !== id);
  renderEstadosCitas();
  renderTablaCitas();
  showToast('Cita eliminada');
}

// ============================================================
//  INVENTARIO — CRUD COMPLETO
// ============================================================
function renderEstadosInventario() {
  const hoy   = new Date();
  const en30  = new Date(hoy); en30.setDate(hoy.getDate() + 30);

  const bajoStock = state.inventario.filter(p => p.cantidad <= p.puntoReposicion);
  const porVencer = state.inventario.filter(p => {
    if (!p.fechaVencimiento) return false;
    const fv = new Date(p.fechaVencimiento);
    return fv >= hoy && fv <= en30;
  });
  const valorTotal = state.inventario.reduce((s, p) => s + (p.cantidad * p.costoUnitario), 0);

  document.getElementById('stat-inv-total').textContent      = state.inventario.length;
  document.getElementById('stat-inv-bajo-stock').textContent = bajoStock.length;
  document.getElementById('stat-inv-por-vencer').textContent = porVencer.length;
  document.getElementById('stat-inv-valor').textContent      = formatCOP(valorTotal);

  const alertaEl = document.getElementById('alerta-bajo-stock');
  if (bajoStock.length > 0) {
    alertaEl.style.display = 'block';
    alertaEl.innerHTML = `<div class="stock-alert">
      <span class="stock-alert-icon">⚠</span>
      <div>
        <strong>${bajoStock.length} producto${bajoStock.length > 1 ? 's' : ''} con bajo stock:</strong>
        <span>${bajoStock.map(p => p.descripcion).join(', ')}</span>
      </div>
    </div>`;
  } else {
    alertaEl.style.display = 'none';
  }
}

function renderTablaInventario(filtro = '') {
  const tbody = document.getElementById('tbody-inventario');
  const lista = state.inventario.filter(p =>
    !filtro ||
    p.descripcion.toLowerCase().includes(filtro.toLowerCase()) ||
    p.marca.toLowerCase().includes(filtro.toLowerCase()) ||
    p.proveedor.toLowerCase().includes(filtro.toLowerCase()) ||
    p.idProducto.toLowerCase().includes(filtro.toLowerCase())
  );
  const hoy = new Date();
  const en30 = new Date(hoy); en30.setDate(hoy.getDate() + 30);

  tbody.innerHTML = lista.length
    ? lista.map(p => {
        const bajo      = p.cantidad <= p.puntoReposicion;
        const fv        = p.fechaVencimiento ? new Date(p.fechaVencimiento) : null;
        const vencido   = fv && fv < hoy;
        const proxVenc  = fv && !vencido && fv <= en30;
        const estadoBdg = bajo
          ? '<span class="badge-bajo-stock">Bajo stock</span>'
          : '<span class="badge-stock-ok">Stock OK</span>';
        const vencLabel = !p.fechaVencimiento ? '—'
          : vencido   ? `<span class="badge-vencido">${formatFecha(p.fechaVencimiento)}</span>`
          : proxVenc  ? `<span class="badge-prox-vencer">${formatFecha(p.fechaVencimiento)}</span>`
          : formatFecha(p.fechaVencimiento);

        return `<tr class="${bajo ? 'row-alerta' : ''}">
          <td><code style="font-size:.73rem;color:var(--plum)">${p.idProducto}</code></td>
          <td><strong>${p.descripcion}</strong></td>
          <td>${p.marca}</td>
          <td>${p.proveedor || '—'}</td>
          <td><strong style="${bajo ? 'color:#dc2626' : ''}">${p.cantidad}</strong></td>
          <td>${p.puntoReposicion}</td>
          <td>${formatCOP(p.costoUnitario)}</td>
          <td>${vencLabel}</td>
          <td>${estadoBdg}</td>
          <td>
            <div class="acciones-cell">
              <button class="btn-accion btn-editar"     title="Editar"         onclick="editarProducto(${p.id})">✎</button>
              <button class="btn-accion btn-ajustar"    title="Ajustar stock"  onclick="abrirAjusteStock(${p.id})">±</button>
              <button class="btn-accion btn-eliminar-inv" title="Eliminar"     onclick="eliminarProducto(${p.id})">🗑</button>
            </div>
          </td>
        </tr>`;
      }).join('')
    : '<tr><td colspan="10" style="text-align:center;color:var(--text-soft);padding:1.5rem">Sin productos registrados</td></tr>';
}

function filtrarInventario(v) { renderTablaInventario(v); }

async function guardarProducto() {
  const idProducto      = document.getElementById('inv-id').value.trim();
  const descripcion     = document.getElementById('inv-desc').value.trim();
  const marca           = document.getElementById('inv-marca').value.trim();
  const proveedor       = document.getElementById('inv-proveedor').value.trim();
  const cantidad        = parseInt(document.getElementById('inv-cantidad').value)     || 0;
  const puntoReposicion = parseInt(document.getElementById('inv-punto-repos').value)  || 0;
  const costoUnitario   = parseFloat(document.getElementById('inv-costo').value)      || 0;
  const fechaVencimiento= document.getElementById('inv-vencimiento').value;

  if (!idProducto || !descripcion || !marca) {
    showToast('⚠ ID, nombre del producto y marca son obligatorios'); return;
  }
  if (state.inventario.some(p => p.idProducto === idProducto)) {
    showToast('⚠ Ya existe un producto con ese ID'); return;
  }

  const nuevoProducto = {
    id: Date.now(), idProducto, descripcion, marca, proveedor,
    cantidad, puntoReposicion, costoUnitario, fechaVencimiento,
  };
  await fetch('/api/inventario', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(nuevoProducto) });
  state.inventario.push(nuevoProducto);
  cerrarModal('modal-nuevo-producto');
  ['inv-id','inv-desc','inv-marca','inv-proveedor','inv-cantidad','inv-punto-repos','inv-costo','inv-vencimiento']
    .forEach(i => { const el = document.getElementById(i); if (el) el.value = ''; });
  renderEstadosInventario();
  renderTablaInventario();
  showToast(`✦ Producto "${descripcion}" agregado al inventario`);
}

function editarProducto(id) {
  const prod = state.inventario.find(p => p.id === id);
  if (!prod) return;
  document.getElementById('edit-inv-id-hidden').value  = id;
  document.getElementById('edit-inv-id').value          = prod.idProducto;
  document.getElementById('edit-inv-desc').value        = prod.descripcion;
  document.getElementById('edit-inv-marca').value       = prod.marca;
  document.getElementById('edit-inv-proveedor').value   = prod.proveedor || '';
  document.getElementById('edit-inv-cantidad').value    = prod.cantidad;
  document.getElementById('edit-inv-punto-repos').value = prod.puntoReposicion;
  document.getElementById('edit-inv-costo').value       = prod.costoUnitario;
  document.getElementById('edit-inv-vencimiento').value = prod.fechaVencimiento || '';
  abrirModal('modal-editar-producto');
}

async function actualizarProducto() {
  const id              = parseInt(document.getElementById('edit-inv-id-hidden').value);
  const idProducto      = document.getElementById('edit-inv-id').value.trim();
  const descripcion     = document.getElementById('edit-inv-desc').value.trim();
  const marca           = document.getElementById('edit-inv-marca').value.trim();
  const proveedor       = document.getElementById('edit-inv-proveedor').value.trim();
  const cantidad        = parseInt(document.getElementById('edit-inv-cantidad').value)     || 0;
  const puntoReposicion = parseInt(document.getElementById('edit-inv-punto-repos').value)  || 0;
  const costoUnitario   = parseFloat(document.getElementById('edit-inv-costo').value)      || 0;
  const fechaVencimiento= document.getElementById('edit-inv-vencimiento').value;

  if (!idProducto || !descripcion || !marca) {
    showToast('⚠ ID, nombre del producto y marca son obligatorios'); return;
  }
  if (state.inventario.some(p => p.idProducto === idProducto && p.id !== id)) {
    showToast('⚠ Ya existe otro producto con ese ID'); return;
  }

  const prod = state.inventario.find(p => p.id === id);
  if (!prod) return;
  Object.assign(prod, { idProducto, descripcion, marca, proveedor, cantidad, puntoReposicion, costoUnitario, fechaVencimiento });
  await fetch(`/api/inventario/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(prod) });
  cerrarModal('modal-editar-producto');
  renderEstadosInventario();
  renderTablaInventario();
  showToast(`✦ "${descripcion}" actualizado`);
}

function abrirAjusteStock(id) {
  const prod = state.inventario.find(p => p.id === id);
  if (!prod) return;
  document.getElementById('ajuste-inv-id').value              = id;
  document.getElementById('ajuste-inv-nombre').textContent    = prod.descripcion;
  document.getElementById('ajuste-inv-actual').textContent    = prod.cantidad;
  document.getElementById('ajuste-inv-cantidad').value        = '';
  document.getElementById('ajuste-inv-motivo').selectedIndex  = 0;
  abrirModal('modal-ajuste-stock');
}

async function confirmarAjusteStock() {
  const id    = parseInt(document.getElementById('ajuste-inv-id').value);
  const delta = parseInt(document.getElementById('ajuste-inv-cantidad').value);

  if (isNaN(delta)) { showToast('⚠ Ingresa una cantidad válida'); return; }

  const prod = state.inventario.find(p => p.id === id);
  if (!prod) return;

  const nueva = prod.cantidad + delta;
  if (nueva < 0) { showToast('⚠ La cantidad no puede quedar negativa'); return; }

  prod.cantidad = nueva;
  await fetch(`/api/inventario/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(prod) });
  cerrarModal('modal-ajuste-stock');
  renderEstadosInventario();
  renderTablaInventario();
  showToast(`✦ Stock de "${prod.descripcion}" ajustado a ${nueva} unidades`);
}

async function eliminarProducto(id) {
  const prod = state.inventario.find(p => p.id === id);
  if (!prod) return;
  if (!confirm(`¿Eliminar "${prod.descripcion}" del inventario?`)) return;
  await fetch(`/api/inventario/${id}`, { method: 'DELETE' });
  state.inventario = state.inventario.filter(p => p.id !== id);
  renderEstadosInventario();
  renderTablaInventario();
  showToast('Producto eliminado del inventario');
}

// ============================================================
//  MÓDULO COMISIONES
// ============================================================

let filasServiciosComision = [];
let filasProductosComision = [];

function renderSelectEsteticistasComision() {
  const sel = document.getElementById('com-esteticista');
  if (!sel) return;
  // Combina personal de la BD + usuarios del localStorage para no quedar vacío
  const deDB    = state.personal.map(p => p.nombre);
  const deLocal = obtenerUsuariosApp()
    .filter(u => u.rol !== 'administradora')
    .map(u => u.nombre);
  const nombres = [...new Set([...deDB, ...deLocal])].filter(Boolean);
  sel.innerHTML = '<option value="">-- Selecciona --</option>' +
    nombres.map(n => `<option value="${n}">${n}</option>`).join('');
}

function abrirModalComision(id = null) {
  const editing   = id !== null;
  const esGerente = state.sesionActual?.rol === 'gerente' || state.sesionActual?.rol === 'administradora';

  document.getElementById('modal-comision-titulo').textContent = editing ? 'Editar Comisión' : 'Nueva Comisión';
  document.getElementById('com-id').value = id || '';
  filasServiciosComision = [];
  filasProductosComision = [];

  // Poblar selector siempre (para gerente y esteticista)
  renderSelectEsteticistasComision();

  if (editing) {
    const com = state.comisiones.find(c => c.id === id);
    if (!com) return;
    document.getElementById('com-esteticista').value = com.esteticista;
    document.getElementById('com-periodo').value = com.periodo;
    document.getElementById('com-bonificaciones').value = com.bonificaciones || 0;
    document.getElementById('com-descuentos').value = com.descuentos || 0;
    document.getElementById('com-estado').value = com.estadoPago;
    document.getElementById('com-metodo').value = com.metodoPago || '';
    document.getElementById('com-fecha-pago').value = com.fechaPago || '';
    document.getElementById('com-observaciones').value = com.observaciones || '';
    filasServiciosComision = (com.servicios || []).map(s => ({ ...s }));
    filasProductosComision = (com.productos || []).map(p => ({ ...p }));
  } else {
    document.getElementById('com-esteticista').value = esGerente ? '' : (state.sesionActual?.nombre || '');
    document.getElementById('com-periodo').value = new Date().toISOString().slice(0, 7);
    document.getElementById('com-bonificaciones').value = 0;
    document.getElementById('com-descuentos').value = 0;
    document.getElementById('com-estado').value = 'pendiente';
    document.getElementById('com-metodo').value = '';
    document.getElementById('com-fecha-pago').value = '';
    document.getElementById('com-observaciones').value = '';
  }

  // ── Selector esteticista ──────────────────────────────────
  const sel = document.getElementById('com-esteticista');
  if (!esGerente) {
    const nombreProp = state.sesionActual?.nombre || '';
    if (nombreProp && !sel.querySelector(`option[value="${nombreProp}"]`)) {
      const opt = document.createElement('option');
      opt.value = opt.textContent = nombreProp;
      sel.appendChild(opt);
    }
    sel.value    = nombreProp;
    sel.disabled = true;
  } else {
    sel.disabled = false;
  }

  // ── Encabezados de tabla según rol ───────────────────────
  const thServ = document.getElementById('thead-com-servicios-row');
  const thProd = document.getElementById('thead-com-productos-row');
  if (thServ) thServ.innerHTML = esGerente
    ? '<th>Fecha</th><th>Cliente</th><th>Servicio</th><th>Valor ($)</th><th>% Comisión</th><th>Comisión ($)</th><th></th>'
    : '<th>Fecha</th><th>Cliente</th><th>Servicio</th><th></th>';
  if (thProd) thProd.innerHTML = esGerente
    ? '<th>Producto</th><th>Cant.</th><th>Precio unit. ($)</th><th>% Comisión</th><th>Comisión ($)</th><th></th>'
    : '<th>Producto</th><th>Cant.</th><th></th>';

  // ── Resumen y control de pago: solo gerente ───────────────
  const resumen  = document.getElementById('com-resumen-box');
  const ctrlPago = document.getElementById('com-control-pago');
  if (resumen)  resumen.style.display  = esGerente ? '' : 'none';
  if (ctrlPago) ctrlPago.style.display = esGerente ? '' : 'none';

  renderFilasServiciosComision();
  renderFilasProductosComision();
  recalcularComision();
  abrirModal('modal-comision');
}

function addFilaServicioComision() {
  filasServiciosComision.push({ fecha: '', cliente: '', servicio: '', valor: 0, pct: 30, comision: 0 });
  renderFilasServiciosComision();
}

function addFilaProductoComision() {
  filasProductosComision.push({ producto: '', cantidad: 1, precio: 0, pct: 15, comision: 0 });
  renderFilasProductosComision();
}

function renderFilasServiciosComision() {
  const esGerente = state.sesionActual?.rol === 'gerente' || state.sesionActual?.rol === 'administradora';
  const tbody = document.getElementById('tbody-com-servicios');
  if (!tbody) return;
  const cols = esGerente ? 7 : 4;
  tbody.innerHTML = filasServiciosComision.map((f, i) => `
    <tr>
      <td><input type="date" class="td-input" value="${f.fecha}" onchange="updateFilaServicio(${i},'fecha',this.value)"></td>
      <td><input type="text" class="td-input" value="${f.cliente}" placeholder="Cliente" onchange="updateFilaServicio(${i},'cliente',this.value)"></td>
      <td><input type="text" class="td-input" value="${f.servicio}" placeholder="Servicio" onchange="updateFilaServicio(${i},'servicio',this.value)" oninput="autoValorServicio(${i},this.value)"></td>
      ${esGerente ? `
      <td><input type="number" class="td-input td-num" min="0" value="${f.valor}" onchange="updateFilaServicio(${i},'valor',+this.value)"></td>
      <td><input type="number" class="td-input td-num" min="0" max="100" value="${f.pct}" onchange="updateFilaServicio(${i},'pct',+this.value)"></td>
      <td class="td-comision">${formatCOP(f.comision)}</td>` : ''}
      <td><button class="btn-accion btn-cancelar" onclick="eliminarFilaServicio(${i})" title="Eliminar">✕</button></td>
    </tr>`).join('') || `<tr><td colspan="${cols}" style="text-align:center;color:var(--text-soft);padding:1rem;font-size:.8rem">Sin servicios aún — pulsa "+ Agregar servicio"</td></tr>`;
}

function renderFilasProductosComision() {
  const esGerente = state.sesionActual?.rol === 'gerente' || state.sesionActual?.rol === 'administradora';
  const tbody = document.getElementById('tbody-com-productos');
  if (!tbody) return;
  const cols = esGerente ? 6 : 3;
  tbody.innerHTML = filasProductosComision.map((f, i) => `
    <tr>
      <td><input type="text" class="td-input" value="${f.producto}" placeholder="Producto" onchange="updateFilaProducto(${i},'producto',this.value)"></td>
      <td><input type="number" class="td-input td-num" min="1" value="${f.cantidad}" onchange="updateFilaProducto(${i},'cantidad',+this.value)"></td>
      ${esGerente ? `
      <td><input type="number" class="td-input td-num" min="0" value="${f.precio}" onchange="updateFilaProducto(${i},'precio',+this.value)"></td>
      <td><input type="number" class="td-input td-num" min="0" max="100" value="${f.pct}" onchange="updateFilaProducto(${i},'pct',+this.value)"></td>
      <td class="td-comision">${formatCOP(f.comision)}</td>` : ''}
      <td><button class="btn-accion btn-cancelar" onclick="eliminarFilaProducto(${i})" title="Eliminar">✕</button></td>
    </tr>`).join('') || `<tr><td colspan="${cols}" style="text-align:center;color:var(--text-soft);padding:1rem;font-size:.8rem">Sin productos aún</td></tr>`;
}

function updateFilaServicio(i, campo, valor) {
  filasServiciosComision[i][campo] = valor;
  const f = filasServiciosComision[i];
  f.comision = Math.round((+f.valor) * (+f.pct) / 100);
  renderFilasServiciosComision();
  recalcularComision();
}

function autoValorServicio(i, servicio) {
  if (PRECIOS[servicio]) {
    filasServiciosComision[i].valor = PRECIOS[servicio];
    filasServiciosComision[i].servicio = servicio;
    filasServiciosComision[i].comision = Math.round(PRECIOS[servicio] * filasServiciosComision[i].pct / 100);
    renderFilasServiciosComision();
    recalcularComision();
  }
}

function updateFilaProducto(i, campo, valor) {
  filasProductosComision[i][campo] = valor;
  const f = filasProductosComision[i];
  f.comision = Math.round((+f.precio) * (+f.cantidad) * (+f.pct) / 100);
  renderFilasProductosComision();
  recalcularComision();
}

function eliminarFilaServicio(i) {
  filasServiciosComision.splice(i, 1);
  renderFilasServiciosComision();
  recalcularComision();
}

function eliminarFilaProducto(i) {
  filasProductosComision.splice(i, 1);
  renderFilasProductosComision();
  recalcularComision();
}

function recalcularComision() {
  const totalServ = filasServiciosComision.reduce((s, f) => s + (f.comision || 0), 0);
  const totalProd = filasProductosComision.reduce((s, f) => s + (f.comision || 0), 0);
  const totalCom  = totalServ + totalProd;
  const bonif     = Math.max(0, +document.getElementById('com-bonificaciones').value || 0);
  const desc      = Math.max(0, +document.getElementById('com-descuentos').value || 0);
  const totalPagar = Math.max(0, totalCom + bonif - desc);
  document.getElementById('com-res-servicios').textContent = formatCOP(totalServ);
  document.getElementById('com-res-productos').textContent = formatCOP(totalProd);
  document.getElementById('com-res-total').textContent     = formatCOP(totalCom);
  document.getElementById('com-res-pagar').textContent     = formatCOP(totalPagar);
}

async function guardarComision() {
  const esteticista = document.getElementById('com-esteticista').value;
  const periodo     = document.getElementById('com-periodo').value;
  if (!esteticista || !periodo) { showToast('⚠ Esteticista y período son obligatorios'); return; }

  const totalServicios  = filasServiciosComision.reduce((s, f) => s + (f.comision || 0), 0);
  const totalProductos  = filasProductosComision.reduce((s, f) => s + (f.comision || 0), 0);
  const totalComisiones = totalServicios + totalProductos;
  const bonificaciones  = Math.max(0, +document.getElementById('com-bonificaciones').value || 0);
  const descuentos      = Math.max(0, +document.getElementById('com-descuentos').value || 0);
  const totalPagar      = Math.max(0, totalComisiones + bonificaciones - descuentos);

  const payload = {
    esteticista, periodo,
    servicios: filasServiciosComision,
    productos: filasProductosComision,
    totalServicios, totalProductos, totalComisiones,
    bonificaciones, descuentos, totalPagar,
    estadoPago:    document.getElementById('com-estado').value,
    metodoPago:    document.getElementById('com-metodo').value,
    fechaPago:     document.getElementById('com-fecha-pago').value,
    observaciones: document.getElementById('com-observaciones').value,
  };

  const idRaw = document.getElementById('com-id').value;
  if (idRaw) {
    payload.id = +idRaw;
    await fetch(`/api/comisiones/${idRaw}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    const idx = state.comisiones.findIndex(c => c.id === +idRaw);
    if (idx >= 0) state.comisiones[idx] = payload;
    showToast('✦ Comisión actualizada');
  } else {
    payload.id = Date.now();
    payload.fechaCreacion = new Date().toISOString().slice(0, 10);
    await fetch('/api/comisiones', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    state.comisiones.push(payload);
    showToast('✦ Comisión guardada correctamente');
  }
  cerrarModal('modal-comision');
  renderStatsComisiones();
  renderTablaComisiones();
  renderMisComisiones();
}

function renderStatsComisiones() {
  const total     = state.comisiones.reduce((s, c) => s + (c.totalPagar || 0), 0);
  const pendiente = state.comisiones.filter(c => c.estadoPago === 'pendiente').reduce((s, c) => s + (c.totalPagar || 0), 0);
  const pagado    = state.comisiones.filter(c => c.estadoPago === 'pagado').reduce((s, c) => s + (c.totalPagar || 0), 0);
  const el = id => document.getElementById(id);
  if (el('stat-com-total'))     el('stat-com-total').textContent     = formatCOP(total);
  if (el('stat-com-pendiente')) el('stat-com-pendiente').textContent = formatCOP(pendiente);
  if (el('stat-com-pagado'))    el('stat-com-pagado').textContent    = formatCOP(pagado);
  if (el('stat-com-registros')) el('stat-com-registros').textContent = state.comisiones.length;
}

function renderTablaComisiones(filtro = '') {
  const estadoFiltro = document.getElementById('filtro-estado-comision')?.value || '';
  const tbody = document.getElementById('tbody-comisiones');
  if (!tbody) return;
  const esGerente = state.sesionActual?.rol === 'gerente' || state.sesionActual?.rol === 'administradora';
  let lista = [...state.comisiones].reverse();
  if (filtro) lista = lista.filter(c => c.esteticista.toLowerCase().includes(filtro.toLowerCase()) || c.periodo.includes(filtro));
  if (estadoFiltro) lista = lista.filter(c => c.estadoPago === estadoFiltro);
  tbody.innerHTML = lista.length ? lista.map(c => `
    <tr>
      <td><strong>${c.esteticista}</strong></td>
      <td>${c.periodo}</td>
      <td>${formatCOP(c.totalServicios)}</td>
      <td>${formatCOP(c.totalProductos)}</td>
      <td>${formatCOP(c.totalComisiones)}</td>
      <td>${formatCOP(c.bonificaciones)}</td>
      <td>${formatCOP(c.descuentos)}</td>
      <td><strong>${formatCOP(c.totalPagar)}</strong></td>
      <td><span class="badge-estado-com badge-com-${c.estadoPago}">${c.estadoPago === 'pagado' ? 'Pagado' : 'Pendiente'}</span></td>
      <td>
        <div class="acciones-cell">
          ${esGerente ? `<button class="btn-accion btn-editar" onclick="abrirModalComision(${c.id})" title="Editar">✎</button>` : ''}
          ${esGerente ? `<button class="btn-accion btn-cancelar" onclick="eliminarComision(${c.id})" title="Eliminar">✕</button>` : ''}
        </div>
      </td>
    </tr>`).join('')
    : '<tr><td colspan="10" style="text-align:center;color:var(--text-soft);padding:1.5rem">Sin registros de comisiones</td></tr>';
}

function filtrarComisiones(v) { renderTablaComisiones(v); }

async function eliminarComision(id) {
  if (!confirm('¿Eliminar este registro de comisión?')) return;
  await fetch(`/api/comisiones/${id}`, { method: 'DELETE' });
  state.comisiones = state.comisiones.filter(c => c.id !== id);
  renderStatsComisiones();
  renderTablaComisiones();
  showToast('Comisión eliminada');
}

function renderMisComisiones() {
  const tbody = document.getElementById('tbody-mis-comisiones');
  if (!tbody || !state.sesionActual) return;
  const nombre = state.sesionActual.nombre;
  const lista  = state.comisiones.filter(c => c.esteticista === nombre);
  tbody.innerHTML = lista.length ? [...lista].reverse().map(c => `
    <tr>
      <td>${c.periodo}</td>
      <td>${formatCOP(c.totalServicios)}</td>
      <td>${formatCOP(c.totalProductos)}</td>
      <td>${formatCOP(c.totalComisiones)}</td>
      <td><strong>${formatCOP(c.totalPagar)}</strong></td>
      <td><span class="badge-estado-com badge-com-${c.estadoPago}">${c.estadoPago === 'pagado' ? 'Pagado' : 'Pendiente'}</span></td>
      <td>
        <div class="acciones-cell">
          <button class="btn-accion btn-editar" onclick="abrirModalComision(${c.id})" title="Editar">✎</button>
        </div>
      </td>
    </tr>`).join('')
    : '<tr><td colspan="7" style="text-align:center;color:var(--text-soft);padding:1.5rem">Aún no tienes comisiones registradas — pulsa "+ Nueva comisión" para crear una</td></tr>';
}

// ============================================================
//  MÓDULO HISTORIA CLÍNICA CORPORAL
// ============================================================

let filasPlanConsultorio   = [];
let filasPlanConsultorioFC = [];
let hcEditandoId = null;
window.hcTipoActual = 'corporal';

// ── poblar select de clientes para paso 0 ──────────────────────
function hcPoblarSelectClientes() {
  const sel = document.getElementById('hc-select-cliente');
  if (!sel) return;
  sel.innerHTML = '<option value="">-- Elige un cliente --</option>' +
    state.clientes.map(c => `<option value="${c.id}">${c.nombre}</option>`).join('');
}

function hcSeleccionarTipo() {
  const tipo = document.querySelector('input[name="hc-tipo-radio"]:checked')?.value || 'corporal';
  window.hcTipoActual = tipo;
  ['corporal','facial'].forEach(t => {
    const card = document.getElementById(`hc-card-${t}`);
    if (card) card.classList.toggle('selected', t === tipo);
  });
}

function hcToggleCliente() {
  const tipo = document.getElementById('hc-tipo-cliente').value;
  document.getElementById('hc-campos-cliente-nuevo').style.display  = tipo === 'nuevo'   ? 'block' : 'none';
  document.getElementById('hc-grupo-select-cliente').style.display  = tipo === 'antiguo' ? 'block' : 'none';
}

async function hcContinuarPaso0() {
  const tipoCliente = document.getElementById('hc-tipo-cliente').value;
  if (tipoCliente === 'antiguo') {
    const selId = document.getElementById('hc-select-cliente').value;
    if (!selId) { showToast('⚠ Selecciona un cliente para continuar'); return; }
    const cliente = state.clientes.find(c => String(c.id) === String(selId));
    if (cliente) {
      const set = (elId, val) => { const e = document.getElementById(elId); if (e && val !== undefined && val !== null) e.value = val; };
      set('hc-nombre',  cliente.nombre);
      set('hc-celular', cliente.tel);
      set('hc-email',   cliente.email || '');
    }
  } else {
    const nombre = document.getElementById('hc-nuevo-nombre').value.trim();
    const tel    = document.getElementById('hc-nuevo-tel').value.trim();
    if (!nombre || !tel) { showToast('⚠ Nombre y teléfono son obligatorios para el nuevo cliente'); return; }
    document.getElementById('hc-nombre').value  = nombre;
    document.getElementById('hc-celular').value = tel;
    document.getElementById('hc-email').value   = document.getElementById('hc-nuevo-email').value.trim();
  }
  hcIrPaso(1);
}

function abrirModalHistoriaCorporal(id = null) {
  hcEditandoId = id;
  filasPlanConsultorio   = [];
  filasPlanConsultorioFC = [];
  window.hcTipoActual    = 'corporal';

  document.getElementById('modal-hc-titulo').textContent = id ? 'Editar Historia Clínica' : 'Nueva Historia Clínica';
  document.getElementById('hc-id').value = id || '';

  // Limpiar todos los campos
  const campos = ['hc-nombre','hc-cedula','hc-fecha-nac','hc-edad','hc-genero','hc-estado-civil',
    'hc-eps','hc-rh','hc-celular','hc-direccion','hc-ocupacion','hc-email',
    'hc-cont-nombre','hc-cont-parentesco','hc-cont-cel','hc-cont-dir','hc-motivo',
    'hc-fur','hc-partos','hc-planificacion','hc-actividad','hc-estado-nervioso',
    'hc-hora-despertar','hc-hora-dormir','hc-estado-general','hc-peso','hc-estatura',
    'hc-imc','hc-imc-ideal','hc-calorias','hc-edad-metabolica','hc-grasa-total',
    'hc-musculo-total','hc-grasa-visceral','med-espalda-alta','med-espalda-baja',
    'med-supra-iliaco','med-adipo-total','med-abdomen-bajo','med-cadera','med-muslo-alto',
    'med-muslo-medio','med-derrier','med-caida','med-volumen','med-total',
    'hc-cosme','hc-aliment','hc-activ-casa','hc-otros-casa','hc-trat-desc','hc-num-sesiones',
    'hc-valor-total','hc-abono-nuevo','hc-saldo','hc-observaciones','hc-firma-prof','hc-firma-pac',
    'hc-nuevo-nombre','hc-nuevo-tel','hc-nuevo-email','hc-nuevo-alergias',
    'fc-antecedentes','fc-tratamientos-previos','fc-alergias-meds','fc-cosme','fc-observaciones',
    'fc-num-sesiones','fc-valor-total','fc-abono-nuevo','fc-saldo','fc-firma-prof','fc-firma-pac',
  ];
  campos.forEach(c => { const el = document.getElementById(c); if (el) el.value = ''; });

  document.querySelectorAll('input[name^="antec-"]').forEach(r => { if (r.value === 'no') r.checked = true; });
  document.querySelectorAll('input[name="hc-sistemas"]').forEach(c => c.checked = false);
  document.querySelectorAll('input[name^="fc-"]').forEach(c => { if (c.type === 'checkbox') c.checked = false; });

  const setDef = (id, v) => { const e = document.getElementById(id); if (e) e.value = v; };
  setDef('hc-partos', 0); setDef('hc-num-sesiones', 1);
  setDef('hc-valor-total', 0); setDef('hc-abono-nuevo', 0);
  setDef('fc-num-sesiones', 1); setDef('fc-valor-total', 0); setDef('fc-abono-nuevo', 0);

  // Resetear radio de tipo
  const radioCorporal = document.querySelector('input[name="hc-tipo-radio"][value="corporal"]');
  if (radioCorporal) { radioCorporal.checked = true; hcSeleccionarTipo(); }

  hcPoblarSelectClientes();

  if (id) {
    const h = state.historiasCorporales.find(x => x.id === id);
    if (!h) return;
    window.hcTipoActual = h.tipo || 'corporal';

    // Marcar tipo correcto
    const radioTipo = document.querySelector(`input[name="hc-tipo-radio"][value="${window.hcTipoActual}"]`);
    if (radioTipo) { radioTipo.checked = true; hcSeleccionarTipo(); }

    const set = (elId, val) => { const e = document.getElementById(elId); if (e && val !== undefined && val !== null) e.value = val; };
    set('hc-nombre', h.nombre); set('hc-cedula', h.cedula);
    set('hc-fecha-nac', h.fechaNacimiento); set('hc-edad', h.edad);
    set('hc-genero', h.genero); set('hc-estado-civil', h.estadoCivil);
    set('hc-eps', h.eps); set('hc-rh', h.rh); set('hc-celular', h.celular);
    set('hc-direccion', h.direccion); set('hc-ocupacion', h.ocupacion); set('hc-email', h.email);
    set('hc-cont-nombre', h.contactoNombre); set('hc-cont-parentesco', h.contactoParentesco);
    set('hc-cont-cel', h.contactoCelular); set('hc-cont-dir', h.contactoDireccion);
    set('hc-motivo', h.motivoConsulta);

    if (window.hcTipoActual === 'corporal') {
      const ant = h.antecedentes || {};
      ['derm','pato','est','alerg','tabaco','alcohol'].forEach(k => {
        const r = document.querySelector(`input[name="antec-${k}"][value="${ant[k] || 'no'}"]`);
        if (r) r.checked = true;
        const desc = document.getElementById(`antec-${k}-desc`);
        if (desc) desc.value = ant[`${k}Desc`] || '';
      });
      ['medicamentos','suplementos','cosmetologicos','liquido'].forEach(k => set(`antec-${k}`, ant[k] || ''));
      const hab = h.habitos || {};
      set('hc-fur', hab.fur); set('hc-partos', hab.partos || 0); set('hc-planificacion', hab.planificacion);
      set('hc-actividad', hab.actividad); set('hc-estado-nervioso', hab.estadoNervioso);
      set('hc-hora-despertar', hab.horaDespertar); set('hc-hora-dormir', hab.horaDormir);
      (hab.sistemas || []).forEach(v => { const c = document.querySelector(`input[name="hc-sistemas"][value="${v}"]`); if (c) c.checked = true; });
      const exam = h.examenFisico || {};
      set('hc-estado-general', exam.estadoGeneral);
      const sem = h.semiologia || {};
      set('hc-peso', sem.peso); set('hc-estatura', sem.estatura); set('hc-imc', sem.imc);
      set('hc-imc-ideal', sem.imcIdeal); set('hc-calorias', sem.calorias);
      set('hc-edad-metabolica', sem.edadMetabolica); set('hc-grasa-total', sem.grasaTotal);
      set('hc-musculo-total', sem.musculoTotal); set('hc-grasa-visceral', sem.grasaVisceral);
      const med = h.mediciones || {};
      Object.entries(med).forEach(([k, v]) => set(`med-${k}`, v));
      filasPlanConsultorio = (h.planConsultorio || []).map(x => ({ ...x }));
      const planC = h.planCasa || {};
      set('hc-cosme', planC.cosme); set('hc-aliment', planC.aliment);
      set('hc-activ-casa', planC.activCasa); set('hc-otros-casa', planC.otrosCasa);
      set('hc-trat-desc', h.tratamientoDescripcion); set('hc-num-sesiones', h.numSesiones);
      set('hc-valor-total', h.valorTotal); set('hc-saldo', formatCOP(h.saldoPendiente));
      set('hc-observaciones', h.observaciones);
      set('hc-firma-prof', h.firmaProfesional); set('hc-firma-pac', h.firmaPaciente);
    } else if (window.hcTipoActual === 'facial') {
      const df = h.datosFacial || {};
      set('fc-tipo-piel', df.tipoPiel); set('fc-fototipo', df.fototipo);
      (df.estadoPiel || []).forEach(v => { const c = document.querySelector(`input[name="fc-estado-piel"][value="${v}"]`); if (c) c.checked = true; });
      (df.patologias || []).forEach(v => { const c = document.querySelector(`input[name="fc-patologias"][value="${v}"]`); if (c) c.checked = true; });
      set('fc-antecedentes', df.antecedentes); set('fc-tratamientos-previos', df.tratamientosPrevios);
      set('fc-alergias-meds', df.alergiasMeds);
      filasPlanConsultorioFC = (h.planConsultorio || []).map(x => ({ ...x }));
      set('fc-cosme', df.cosme); set('fc-observaciones', df.observaciones);
      set('fc-num-sesiones', h.numSesiones); set('fc-valor-total', h.valorTotal);
      set('fc-saldo', formatCOP(h.saldoPendiente));
      set('fc-firma-prof', h.firmaProfesional); set('fc-firma-pac', h.firmaPaciente);
    }

    // Al editar: saltar paso 0
    hcIrPaso(1, true);
  } else {
    hcIrPaso(0);
  }

  renderFilasPlanConsultorio();
  renderFilasPlanConsultorioFC();
  calcularSaldoHC();
  calcularSaldoFC();
  abrirModal('modal-historia-corporal');
}

function hcIrPaso(n, esEdicion = false) {
  const tipo = window.hcTipoActual || 'corporal';
  const maxPaso = tipo === 'corporal' ? 4 : 3;

  // Actualizar indicador de pasos
  const totalIndicadores = tipo === 'corporal' ? 5 : 4; // 0..4 o 0..3
  for (let i = 0; i <= 4; i++) {
    const ind  = document.getElementById(`hc-step-ind-${i}`);
    const conn = document.getElementById(`hc-conn-${i}`);
    if (ind) {
      const visible = (tipo === 'corporal') ? (i <= 4) : (i <= 3);
      ind.style.display  = visible ? '' : 'none';
      ind.classList.toggle('active', i === n);
      ind.classList.toggle('done',   i < n);
    }
    if (conn) {
      const visible = (tipo === 'corporal') ? (i <= 3) : (i <= 2);
      conn.style.display = visible ? '' : 'none';
      conn.classList.toggle('done', i < n);
    }
  }

  // Actualizar etiquetas dinámicas
  const lbl2 = document.getElementById('hc-label-paso2');
  const lbl3 = document.getElementById('hc-label-paso3');
  if (tipo === 'corporal') {
    if (lbl2) lbl2.textContent = 'Antecedentes';
    if (lbl3) lbl3.textContent = 'Semiología';
  } else if (tipo === 'facial') {
    if (lbl2) lbl2.textContent = 'Análisis Facial';
    if (lbl3) lbl3.textContent = 'Plan Tratamiento';
  }

  // Ocultar todos los pasos
  const allSteps = ['hc-step-0','hc-step-1',
    'hc-step-2-corporal','hc-step-2-facial',
    'hc-step-3-corporal','hc-step-3-plan','hc-step-4'];
  allSteps.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.remove('active');
  });

  // Mostrar paso correcto
  if (n === 0) {
    document.getElementById('hc-step-0')?.classList.add('active');
  } else if (n === 1) {
    document.getElementById('hc-step-1')?.classList.add('active');
    const btnAnt = document.getElementById('hc-btn-1-ant');
    if (btnAnt) btnAnt.style.display = esEdicion ? 'none' : '';
  } else if (n === 2) {
    if (tipo === 'corporal')    document.getElementById('hc-step-2-corporal')?.classList.add('active');
    else                        document.getElementById('hc-step-2-facial')?.classList.add('active');
  } else if (n === 3) {
    if (tipo === 'corporal')      document.getElementById('hc-step-3-corporal')?.classList.add('active');
    else                          document.getElementById('hc-step-3-plan')?.classList.add('active');
  } else if (n === 4) {
    document.getElementById('hc-step-4')?.classList.add('active');
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function calcularEdadHC() {
  const fn = document.getElementById('hc-fecha-nac').value;
  if (!fn) return;
  const hoy   = new Date();
  const nac   = new Date(fn);
  let edad    = hoy.getFullYear() - nac.getFullYear();
  const m     = hoy.getMonth() - nac.getMonth();
  if (m < 0 || (m === 0 && hoy.getDate() < nac.getDate())) edad--;
  document.getElementById('hc-edad').value = edad >= 0 ? edad : '';
}

function calcularIMC() {
  const peso = parseFloat(document.getElementById('hc-peso').value);
  const alt  = parseFloat(document.getElementById('hc-estatura').value);
  if (peso > 0 && alt > 0) {
    document.getElementById('hc-imc').value = (peso / (alt * alt)).toFixed(1);
  }
}

function calcularSaldoHC() {
  const total  = parseFloat(document.getElementById('hc-valor-total').value) || 0;
  const abono  = parseFloat(document.getElementById('hc-abono-nuevo').value) || 0;
  const saldo  = Math.max(0, total - abono);
  document.getElementById('hc-saldo').value = formatCOP(saldo);
}

function calcularSaldoFC() {
  const el1 = document.getElementById('fc-valor-total');
  const el2 = document.getElementById('fc-abono-nuevo');
  const el3 = document.getElementById('fc-saldo');
  if (!el1 || !el2 || !el3) return;
  const total = parseFloat(el1.value) || 0;
  const abono = parseFloat(el2.value) || 0;
  el3.value = formatCOP(Math.max(0, total - abono));
}

function addFilaPlanConsultorio() {
  filasPlanConsultorio.push({ fecha: '', procedimiento: '', equipos: '', tipoTerapia: '', firma: '' });
  renderFilasPlanConsultorio();
}

function renderFilasPlanConsultorio() {
  const tbody = document.getElementById('tbody-hc-plan-consultorio');
  if (!tbody) return;
  tbody.innerHTML = filasPlanConsultorio.map((f, i) => `
    <tr>
      <td><input type="date" class="td-input" value="${f.fecha}" onchange="updateFilaPlan(${i},'fecha',this.value)"></td>
      <td><input type="text" class="td-input" value="${f.procedimiento}" placeholder="Procedimiento" onchange="updateFilaPlan(${i},'procedimiento',this.value)"></td>
      <td><input type="text" class="td-input" value="${f.equipos}" placeholder="Equipos" onchange="updateFilaPlan(${i},'equipos',this.value)"></td>
      <td><input type="text" class="td-input" value="${f.tipoTerapia}" placeholder="Tipo terapia" onchange="updateFilaPlan(${i},'tipoTerapia',this.value)"></td>
      <td><input type="text" class="td-input" value="${f.firma}" placeholder="Firma" onchange="updateFilaPlan(${i},'firma',this.value)"></td>
      <td><button class="btn-accion btn-cancelar" onclick="eliminarFilaPlan(${i})" title="Eliminar">✕</button></td>
    </tr>`).join('') || '<tr><td colspan="6" style="text-align:center;color:var(--text-soft);padding:.75rem;font-size:.8rem">Sin sesiones aún</td></tr>';
}

function updateFilaPlan(i, campo, valor) { filasPlanConsultorio[i][campo] = valor; }
function eliminarFilaPlan(i) { filasPlanConsultorio.splice(i, 1); renderFilasPlanConsultorio(); }

// ── Tabla dinámica para plan de Facial ───────────────
function addFilaPlanConsultorioFC() {
  filasPlanConsultorioFC.push({ fecha: '', procedimiento: '', equipos: '', tipoTerapia: '', firma: '' });
  renderFilasPlanConsultorioFC();
}

function renderFilasPlanConsultorioFC() {
  const tbody = document.getElementById('tbody-hc-plan-consultorio-fc');
  if (!tbody) return;
  tbody.innerHTML = filasPlanConsultorioFC.map((f, i) => `
    <tr>
      <td><input type="date" class="td-input" value="${f.fecha}" onchange="updateFilaPlanFC(${i},'fecha',this.value)"></td>
      <td><input type="text" class="td-input" value="${f.procedimiento}" placeholder="Procedimiento" onchange="updateFilaPlanFC(${i},'procedimiento',this.value)"></td>
      <td><input type="text" class="td-input" value="${f.equipos}" placeholder="Equipos" onchange="updateFilaPlanFC(${i},'equipos',this.value)"></td>
      <td><input type="text" class="td-input" value="${f.tipoTerapia}" placeholder="Tipo terapia" onchange="updateFilaPlanFC(${i},'tipoTerapia',this.value)"></td>
      <td><input type="text" class="td-input" value="${f.firma}" placeholder="Firma" onchange="updateFilaPlanFC(${i},'firma',this.value)"></td>
      <td><button class="btn-accion btn-cancelar" onclick="eliminarFilaPlanFC(${i})" title="Eliminar">✕</button></td>
    </tr>`).join('') || '<tr><td colspan="6" style="text-align:center;color:var(--text-soft);padding:.75rem;font-size:.8rem">Sin sesiones aún</td></tr>';
}

function updateFilaPlanFC(i, campo, valor) { filasPlanConsultorioFC[i][campo] = valor; }
function eliminarFilaPlanFC(i) { filasPlanConsultorioFC.splice(i, 1); renderFilasPlanConsultorioFC(); }

function leerAntecedentes() {
  const get = k => document.querySelector(`input[name="antec-${k}"]:checked`)?.value || 'no';
  const desc = k => document.getElementById(`antec-${k}-desc`)?.value || '';
  return {
    derm: get('derm'), dermDesc: desc('derm'),
    pato: get('pato'), patoDesc: desc('pato'),
    est:  get('est'),  estDesc:  desc('est'),
    alerg: get('alerg'), alergDesc: desc('alerg'),
    tabaco: get('tabaco'), alcohol: get('alcohol'),
    medicamentos: document.getElementById('antec-medicamentos')?.value || '',
    suplementos:  document.getElementById('antec-suplementos')?.value || '',
    cosmetologicos: document.getElementById('antec-cosmetologicos')?.value || '',
    liquido: document.getElementById('antec-liquido')?.value || '',
  };
}

function leerDatosFacial() {
  return {
    tipoPiel:            gVal('fc-tipo-piel'),
    fototipo:            gVal('fc-fototipo'),
    estadoPiel:          [...document.querySelectorAll('input[name="fc-estado-piel"]:checked')].map(c => c.value),
    patologias:          [...document.querySelectorAll('input[name="fc-patologias"]:checked')].map(c => c.value),
    antecedentes:        gVal('fc-antecedentes'),
    tratamientosPrevios: gVal('fc-tratamientos-previos'),
    alergiasMeds:        gVal('fc-alergias-meds'),
    cosme:               gVal('fc-cosme'),
    observaciones:       gVal('fc-observaciones'),
  };
}


async function guardarHistoriaCorporal() {
  const nombre  = document.getElementById('hc-nombre').value.trim();
  const cedula  = document.getElementById('hc-cedula').value.trim();
  const celular = document.getElementById('hc-celular').value.trim();
  if (!nombre || !cedula || !celular) { showToast('⚠ Nombre, cédula y celular son obligatorios'); return; }

  const tipo = window.hcTipoActual || 'corporal';

  // Si cliente nuevo: crear en la BD primero
  const tipoCliente = document.getElementById('hc-tipo-cliente')?.value || 'antiguo';
  if (!hcEditandoId && tipoCliente === 'nuevo') {
    const nuevoNombre   = document.getElementById('hc-nuevo-nombre').value.trim();
    const nuevoTel      = document.getElementById('hc-nuevo-tel').value.trim();
    const nuevoEmail    = document.getElementById('hc-nuevo-email').value.trim();
    const nuevoAlergias = document.getElementById('hc-nuevo-alergias').value.trim() || 'Ninguna';
    if (nuevoNombre && nuevoTel) {
      const nuevoCliente = {
        id: Date.now(), nombre: nuevoNombre, tel: nuevoTel, email: nuevoEmail,
        alergias: nuevoAlergias, tipo: 'nuevo',
        esteticista: state.sesionActual?.nombre || '', visitas: 0, proximaCita: '', proxTrat: '',
      };
      await fetch('/api/clientes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(nuevoCliente) });
      state.clientes.push(nuevoCliente);
    }
  }

  let valorTotal, abono, saldoPendiente, numSesiones, planConsultorio, observaciones, firmaProfesional, firmaPaciente;
  let datosFacial = {};
  let antecedentes = {}, habitos = {}, examenFisico = {}, semiologia = {}, mediciones = {}, planCasa = {};
  let tratamientoDescripcion = '';

  if (tipo === 'corporal') {
    valorTotal = parseFloat(document.getElementById('hc-valor-total').value) || 0;
    abono      = parseFloat(document.getElementById('hc-abono-nuevo').value) || 0;
    saldoPendiente = Math.max(0, valorTotal - abono);
    numSesiones = parseInt(document.getElementById('hc-num-sesiones').value) || 0;
    planConsultorio = filasPlanConsultorio;
    tratamientoDescripcion = document.getElementById('hc-trat-desc').value;
    observaciones    = document.getElementById('hc-observaciones').value;
    firmaProfesional = document.getElementById('hc-firma-prof').value;
    firmaPaciente    = document.getElementById('hc-firma-pac').value;
    antecedentes = leerAntecedentes();
    habitos = {
      fur: document.getElementById('hc-fur').value,
      partos: parseInt(document.getElementById('hc-partos').value) || 0,
      planificacion: document.getElementById('hc-planificacion').value,
      actividad: document.getElementById('hc-actividad').value,
      estadoNervioso: document.getElementById('hc-estado-nervioso').value,
      horaDespertar: document.getElementById('hc-hora-despertar').value,
      horaDormir: document.getElementById('hc-hora-dormir').value,
      sistemas: [...document.querySelectorAll('input[name="hc-sistemas"]:checked')].map(c => c.value),
    };
    examenFisico = { estadoGeneral: document.getElementById('hc-estado-general').value };
    semiologia = {
      peso: document.getElementById('hc-peso').value,
      estatura: document.getElementById('hc-estatura').value,
      imc: document.getElementById('hc-imc').value,
      imcIdeal: document.getElementById('hc-imc-ideal').value,
      calorias: document.getElementById('hc-calorias').value,
      edadMetabolica: document.getElementById('hc-edad-metabolica').value,
      grasaTotal: document.getElementById('hc-grasa-total').value,
      musculoTotal: document.getElementById('hc-musculo-total').value,
      grasaVisceral: document.getElementById('hc-grasa-visceral').value,
    };
    mediciones = {
      'espalda-alta': document.getElementById('med-espalda-alta').value,
      'espalda-baja': document.getElementById('med-espalda-baja').value,
      'supra-iliaco': document.getElementById('med-supra-iliaco').value,
      'adipo-total':  document.getElementById('med-adipo-total').value,
      'abdomen-bajo': document.getElementById('med-abdomen-bajo').value,
      cadera:         document.getElementById('med-cadera').value,
      'muslo-alto':   document.getElementById('med-muslo-alto').value,
      'muslo-medio':  document.getElementById('med-muslo-medio').value,
      derrier: document.getElementById('med-derrier').value,
      caida:   document.getElementById('med-caida').value,
      volumen: document.getElementById('med-volumen').value,
      total:   document.getElementById('med-total').value,
    };
    planCasa = {
      cosme:      document.getElementById('hc-cosme').value,
      aliment:    document.getElementById('hc-aliment').value,
      activCasa:  document.getElementById('hc-activ-casa').value,
      otrosCasa:  document.getElementById('hc-otros-casa').value,
    };
  } else {
    // Facial
    valorTotal = parseFloat(document.getElementById('fc-valor-total').value) || 0;
    abono      = parseFloat(document.getElementById('fc-abono-nuevo').value) || 0;
    saldoPendiente = Math.max(0, valorTotal - abono);
    numSesiones = parseInt(document.getElementById('fc-num-sesiones').value) || 0;
    planConsultorio = filasPlanConsultorioFC;
    observaciones    = document.getElementById('fc-observaciones').value;
    firmaProfesional = document.getElementById('fc-firma-prof').value;
    firmaPaciente    = document.getElementById('fc-firma-pac').value;
    if (tipo === 'facial')  datosFacial = leerDatosFacial();
  }

  const payload = {
    nombre, cedula,
    fechaNacimiento:    document.getElementById('hc-fecha-nac').value,
    edad:               parseInt(document.getElementById('hc-edad').value) || 0,
    genero:             document.getElementById('hc-genero').value,
    estadoCivil:        document.getElementById('hc-estado-civil').value,
    eps:                document.getElementById('hc-eps').value,
    rh:                 document.getElementById('hc-rh').value,
    celular,
    direccion:          document.getElementById('hc-direccion').value,
    ocupacion:          document.getElementById('hc-ocupacion').value,
    email:              document.getElementById('hc-email').value,
    contactoNombre:     document.getElementById('hc-cont-nombre').value,
    contactoParentesco: document.getElementById('hc-cont-parentesco').value,
    contactoCelular:    document.getElementById('hc-cont-cel').value,
    contactoDireccion:  document.getElementById('hc-cont-dir').value,
    motivoConsulta:     document.getElementById('hc-motivo').value,
    tipo,
    antecedentes, habitos, examenFisico, semiologia, mediciones, planCasa,
    planConsultorio,
    tratamientoDescripcion,
    numSesiones,
    valorTotal,
    abonos: abono > 0 && !hcEditandoId ? [{ monto: abono, fecha: new Date().toISOString().slice(0, 10) }] : [],
    saldoPendiente,
    observaciones,
    firmaProfesional,
    firmaPaciente,
    datosFacial,
    esteticista: state.sesionActual?.nombre || '',
  };

  const idRaw = document.getElementById('hc-id').value;
  if (idRaw) {
    payload.id = +idRaw;
    await fetch(`/api/historias-corporales/${idRaw}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    const idx = state.historiasCorporales.findIndex(h => h.id === +idRaw);
    if (idx >= 0) state.historiasCorporales[idx] = payload;
    showToast('✦ Historia clínica actualizada');
  } else {
    payload.id = Date.now();
    payload.fechaCreacion = new Date().toISOString().slice(0, 10);
    await fetch('/api/historias-corporales', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    state.historiasCorporales.push(payload);
    showToast('✦ Historia clínica guardada correctamente');
  }
  cerrarModal('modal-historia-corporal');
  renderTablaHistoriasCorporales();
  renderTablaHCEsteticista();
}

function badgeHCTipo(tipo) {
  const map = {
    corporal: '<span class="badge-hc-corporal">Corporal</span>',
    facial:   '<span class="badge-hc-facial">Facial</span>',
  };
  return map[tipo] || map.corporal;
}

function renderTablaHistoriasCorporales(filtro = '') {
  const tbody = document.getElementById('tbody-historias-corporales');
  if (!tbody) return;
  let lista = [...state.historiasCorporales].reverse();
  if (filtro) lista = lista.filter(h => h.nombre.toLowerCase().includes(filtro.toLowerCase()) || h.cedula.includes(filtro));
  tbody.innerHTML = lista.length ? lista.map(h => `
    <tr>
      <td><strong>${h.nombre}</strong></td>
      <td>${badgeHCTipo(h.tipo)}</td>
      <td>${h.cedula}</td>
      <td>${h.edad || '—'}</td>
      <td>${h.celular}</td>
      <td>${h.eps || '—'} / ${h.rh || '—'}</td>
      <td>${h.esteticista || '—'}</td>
      <td>${h.numSesiones || 0}</td>
      <td>${formatCOP(h.saldoPendiente)}</td>
      <td>${formatFecha(h.fechaCreacion)}</td>
      <td>
        <div class="acciones-cell">
          <button class="btn-accion btn-completar" onclick="verHistoriaCorporal(${h.id})" title="Ver">👁</button>
          <button class="btn-accion btn-editar" onclick="abrirModalHistoriaCorporal(${h.id})" title="Editar">✎</button>
          <button class="btn-accion btn-cancelar" onclick="eliminarHistoriaCorporal(${h.id})" title="Eliminar">✕</button>
        </div>
      </td>
    </tr>`).join('')
    : '<tr><td colspan="11" style="text-align:center;color:var(--text-soft);padding:1.5rem">Sin historias clínicas registradas</td></tr>';
}

function filtrarHistoriasCorporales(v) {
  renderTablaHistoriasCorporales(v);
  renderTablaHCEsteticista(v);
}

function renderTablaHCEsteticista(filtro = '') {
  const tbody = document.getElementById('tbody-hc-corporal-est');
  if (!tbody || !state.sesionActual) return;
  const nombre = state.sesionActual.nombre;
  let lista = state.historiasCorporales.filter(h => h.esteticista === nombre);
  if (filtro) lista = lista.filter(h => h.nombre.toLowerCase().includes(filtro.toLowerCase()) || h.cedula.includes(filtro));
  tbody.innerHTML = lista.length ? [...lista].reverse().map(h => `
    <tr>
      <td><strong>${h.nombre}</strong></td>
      <td>${badgeHCTipo(h.tipo)}</td>
      <td>${h.cedula}</td>
      <td>${h.edad || '—'}</td>
      <td>${h.celular}</td>
      <td>${h.numSesiones || 0}</td>
      <td>${formatCOP(h.saldoPendiente)}</td>
      <td>${formatFecha(h.fechaCreacion)}</td>
      <td>
        <div class="acciones-cell">
          <button class="btn-accion btn-completar" onclick="verHistoriaCorporal(${h.id})" title="Ver">👁</button>
          <button class="btn-accion btn-editar" onclick="abrirModalHistoriaCorporal(${h.id})" title="Editar">✎</button>
        </div>
      </td>
    </tr>`).join('')
    : '<tr><td colspan="9" style="text-align:center;color:var(--text-soft);padding:1.5rem">Sin historias clínicas aún</td></tr>';
}

function verHistoriaCorporal(id) {
  const h = state.historiasCorporales.find(x => x.id === id);
  if (!h) return;
  const tipo  = h.tipo || 'corporal';
  const plan  = (h.planConsultorio || []);
  const tipoLabel = { corporal: 'Corporal', facial: 'Facial' }[tipo] || tipo;

  const titModal = document.getElementById('modal-ver-hc-titulo');
  if (titModal) titModal.textContent = `Historia Clínica — ${tipoLabel}`;

  const seccionPlan = plan.length ? `<div class="hc-view-section"><h4>Plan en consultorio (${plan.length} sesiones)</h4>
    <div class="tabla-wrap"><table class="dash-table"><thead><tr><th>Fecha</th><th>Procedimiento</th><th>Equipos</th><th>Tipo</th><th>Firma</th></tr></thead>
    <tbody>${plan.map(p => `<tr><td>${p.fecha}</td><td>${p.procedimiento}</td><td>${p.equipos}</td><td>${p.tipoTerapia}</td><td>${p.firma}</td></tr>`).join('')}</tbody></table></div></div>` : '';

  const seccionPagos = `<div class="hc-view-section"><h4>Control de pagos</h4>
    <div class="hc-view-grid">
      <div><label>Valor total</label><p>${formatCOP(h.valorTotal)}</p></div>
      <div><label>Saldo pendiente</label><p style="color:${h.saldoPendiente > 0 ? '#dc2626' : '#065f46'}">${formatCOP(h.saldoPendiente)}</p></div>
      <div><label>N° sesiones</label><p>${h.numSesiones || 0}</p></div>
      <div><label>Esteticista</label><p>${h.esteticista || '—'}</p></div>
    </div></div>`;

  const seccionBase = `<div class="hc-view-section"><h4>Datos del paciente</h4>
    <div class="hc-view-grid">
      <div><label>Nombre</label><p>${h.nombre}</p></div><div><label>Cédula</label><p>${h.cedula}</p></div>
      <div><label>Edad</label><p>${h.edad || '—'}</p></div><div><label>Género</label><p>${h.genero || '—'}</p></div>
      <div><label>EPS</label><p>${h.eps || '—'}</p></div><div><label>RH</label><p>${h.rh || '—'}</p></div>
      <div><label>Celular</label><p>${h.celular}</p></div><div><label>Email</label><p>${h.email || '—'}</p></div>
    </div></div>`;

  let seccionEspecifica = '';
  if (tipo === 'corporal') {
    const s = h.semiologia || {};
    seccionEspecifica = `<div class="hc-view-section"><h4>Semiología corporal</h4>
      <div class="hc-view-grid">
        <div><label>Peso</label><p>${s.peso || '—'} kg</p></div><div><label>Estatura</label><p>${s.estatura || '—'} m</p></div>
        <div><label>IMC</label><p>${s.imc || '—'}</p></div><div><label>Grasa total</label><p>${s.grasaTotal || '—'}%</p></div>
        <div><label>Músculo total</label><p>${s.musculoTotal || '—'}%</p></div><div><label>Grasa visceral</label><p>${s.grasaVisceral || '—'}</p></div>
      </div></div>`;
  } else if (tipo === 'facial') {
    const df = h.datosFacial || {};
    seccionEspecifica = `<div class="hc-view-section"><h4>Análisis Facial</h4>
      <div class="hc-view-grid">
        <div><label>Tipo de piel</label><p>${df.tipoPiel || '—'}</p></div>
        <div><label>Fototipo</label><p>${df.fototipo || '—'}</p></div>
        <div><label>Estado piel</label><p>${(df.estadoPiel || []).join(', ') || '—'}</p></div>
        <div><label>Patologías</label><p>${(df.patologias || []).join(', ') || '—'}</p></div>
      </div>
      ${df.antecedentes ? `<p style="font-size:.8rem;margin-top:.5rem"><strong>Antecedentes:</strong> ${df.antecedentes}</p>` : ''}
      ${df.alergiasMeds ? `<p style="font-size:.8rem"><strong>Alergias/Medicamentos:</strong> ${df.alergiasMeds}</p>` : ''}
    </div>`;
  }

  const seccionObs = h.observaciones ? `<div class="hc-view-section"><h4>Observaciones</h4><p style="font-size:.85rem;color:var(--text-mid)">${h.observaciones}</p></div>` : '';

  document.getElementById('modal-ver-hc-content').innerHTML =
    seccionBase + seccionEspecifica + seccionPlan + seccionPagos + seccionObs;
  abrirModal('modal-ver-hc');
}

async function eliminarHistoriaCorporal(id) {
  const h = state.historiasCorporales.find(x => x.id === id);
  if (!h || !confirm(`¿Eliminar la historia de "${h.nombre}"?`)) return;
  await fetch(`/api/historias-corporales/${id}`, { method: 'DELETE' });
  state.historiasCorporales = state.historiasCorporales.filter(x => x.id !== id);
  renderTablaHistoriasCorporales();
  showToast('Historia clínica eliminada');
}