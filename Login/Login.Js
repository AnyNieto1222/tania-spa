// ============================================================
//  USUARIOS POR DEFECTO — las contraseñas se hashean con
//  SHA-256 en el primer arranque y NUNCA se guardan en texto
//  plano en localStorage.  Cambiar las contraseñas desde aquí
//  sólo aplica en instalaciones nuevas (borrar ts_usuarios_v2
//  de localStorage para forzar la reinicialización).
// ============================================================
// ── Formato de usuario: Nombre.Apellido  ──────────────────────
// Para agregar una persona: agrega un objeto con estos 4 campos.
// Tras agregar, el usuario debe borrar 'ts_usuarios_v2' de localStorage una vez.
// ──────────────────────────────────────────────────────────────
const USUARIOS_DEFAULT = [
  { usuario: 'Tania.Admin',     password: 'Admin@2026',              rol: 'administradora', nombre: 'Tania Rodríguez' },
  { usuario: 'Tania.Arias',     password: 'Tania@2026',              rol: 'gerente',        nombre: 'Tania Arias' },
  { usuario: 'Valentina.Quintero', password: 'Valentina.Quintero2026', rol: 'esteticista',    nombre: 'Valentina Quintero' },
  { usuario: 'Daniela.Camargo', password: 'Daniela.Camargo2026',     rol: 'esteticista',    nombre: 'Daniela Camargo' }, // 👈 CORREGIDO
];


async function sha256(texto) {
  const datos  = new TextEncoder().encode(texto);
  const buffer = await crypto.subtle.digest('SHA-256', datos);
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

async function inicializarUsuarios() {
  const res   = await fetch('/api/usuarios');
  const lista = await res.json();

  await Promise.all(
    USUARIOS_DEFAULT.map(async u => {
      const existe = lista.find(x => x.usuario === u.usuario);
      if (existe) return;

      const hash = await sha256(u.password);

      await fetch('/api/usuarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usuario: u.usuario,
          hash,
          rol: u.rol,
          nombre: u.nombre
        }),
      });
    })
  );
}

async function obtenerUsuarios() {
  const res = await fetch('/api/usuarios');
  return res.json();
}

// ============================================================
//  NAVEGACIÓN DE SECCIONES
// ============================================================
function show(sectionId, clickedLink) {
  document.querySelectorAll('section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-links a').forEach(a => a.classList.remove('active'));
  const target = document.getElementById(sectionId);
  if (target) target.classList.add('active');
  if (clickedLink && clickedLink.classList) clickedLink.classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function toggleAccordion(card) {
  const isOpen = card.classList.contains('open');
  document.querySelectorAll('.accordion-card.open').forEach(c => c.classList.remove('open'));
  if (!isOpen) card.classList.add('open');
}

function toggleAcc(btn) {
  const item = btn.closest('.acc-item');
  const isOpen = item.classList.contains('open');
  document.querySelectorAll('.acc-item.open').forEach(i => i.classList.remove('open'));
  if (!isOpen) item.classList.add('open');
}

function initSliders() {
  document.querySelectorAll('.acc-body').forEach(body => {
    const grid = body.querySelector('.svc-card-grid');
    if (!grid) return;

    const wrap = document.createElement('div');
    wrap.className = 'svc-slider-wrap';
    body.insertBefore(wrap, grid);
    wrap.appendChild(grid);

    const controls = document.createElement('div');
    controls.className = 'svc-slider-controls';

    const prev = document.createElement('button');
    prev.className = 'svc-slider-btn';
    prev.innerHTML = '&#8249;';
    prev.setAttribute('aria-label', 'Anterior');
    prev.addEventListener('click', () => grid.scrollBy({ left: -260, behavior: 'smooth' }));

    const next = document.createElement('button');
    next.className = 'svc-slider-btn';
    next.innerHTML = '&#8250;';
    next.setAttribute('aria-label', 'Siguiente');
    next.addEventListener('click', () => grid.scrollBy({ left: 260, behavior: 'smooth' }));

    controls.appendChild(prev);
    controls.appendChild(next);
    wrap.insertBefore(controls, grid);
  });
}

function showToast(message, duration = 3000) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), duration);
}

// ============================================================
//  VALIDACIONES
// ============================================================
function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePassword(password) {
  return password.length >= 6;
}

function setFieldError(inputId, errorId, mostrar) {
  const input = document.getElementById(inputId);
  const error = document.getElementById(errorId);
  if (!input || !error) return;
  if (mostrar) {
    input.classList.add('error');
    error.classList.add('visible');
  } else {
    input.classList.remove('error');
    error.classList.remove('visible');
  }
}

// ============================================================
//  LOGIN
// ============================================================
async function handleLogin() {
  const usuarioEl  = document.getElementById('usuario');
  const passwordEl = document.getElementById('password');
  const recordarme = document.getElementById('remember');
  const btn        = document.getElementById('btn-login');

  const usuario  = usuarioEl  ? usuarioEl.value.trim()  : '';
  const password = passwordEl ? passwordEl.value         : '';

  let valid = true;

  if (usuario.length < 3) {
    setFieldError('usuario', 'usuario-error', true); valid = false;
  } else {
    setFieldError('usuario', 'usuario-error', false);
  }

  if (!validatePassword(password)) {
    setFieldError('password', 'password-error', true); valid = false;
  } else {
    setFieldError('password', 'password-error', false);
  }

  if (!valid) return;

  const inputHash  = await sha256(password);
  const usuarios   = await obtenerUsuarios();
  const encontrado = usuarios.find(u =>
    u.usuario.toLowerCase() === usuario.toLowerCase() &&
    u.hash === inputHash
  );

  if (!encontrado) {
    showToast('Usuario o contraseña incorrectos');
    return;
  }

  btn.disabled    = true;
  btn.textContent = 'Ingresando...';

  const sesion = JSON.stringify({
    usuario: encontrado.usuario,
    nombre:  encontrado.nombre,
    rol:     encontrado.rol,
  });

  if (recordarme && recordarme.checked) {
    localStorage.setItem('ts_sesion', sesion);
  } else {
    sessionStorage.setItem('ts_sesion', sesion);
  }

  setTimeout(() => { window.location.href = '../Home/Home.html'; }, 1000);
}

function clearErrorOnInput(inputId, errorId) {
  const input = document.getElementById(inputId);
  if (!input) return;
  input.addEventListener('input', () => setFieldError(inputId, errorId, false));
}

// ============================================================
//  INIT
// ============================================================
document.addEventListener('DOMContentLoaded', async () => {
  await inicializarUsuarios();

  // Si ya hay sesión activa, ir directo al panel
  const sesionActiva = sessionStorage.getItem('ts_sesion') || localStorage.getItem('ts_sesion');
  if (sesionActiva) {
    window.location.href = '../Home/Home.html';
    return;
  }

  const loginBtn = document.getElementById('btn-login');
  if (loginBtn) loginBtn.addEventListener('click', handleLogin);

  clearErrorOnInput('usuario',  'usuario-error');
  clearErrorOnInput('password', 'password-error');

  const passwordInput = document.getElementById('password');
  if (passwordInput) {
    passwordInput.addEventListener('keydown', e => { if (e.key === 'Enter') handleLogin(); });
  }

  const usuarioInput = document.getElementById('usuario');
  if (usuarioInput) {
    usuarioInput.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        const pwd = document.getElementById('password');
        if (pwd) pwd.focus();
      }
    });
  }

  const logo = document.querySelector('.logo');
  if (logo) {
    logo.addEventListener('click', () => {
      show('hero', null);
      const links = document.querySelectorAll('.nav-links a');
      if (links[0]) links[0].classList.add('active');
    });
  }

  initSliders();
  console.log('✿ Tania Spa — Cargado correctamente');
});
