// ============================================================
//  USUARIOS POR DEFECTO
// ============================================================
const USUARIOS_DEFAULT = [
  { usuario: 'Tania.Admin',     password: 'Admin@2026',              rol: 'administradora', nombre: 'Tania Rodríguez' },
  { usuario: 'Tania.Arias',     password: 'Tania@2026',              rol: 'gerente',        nombre: 'Tania Arias' },
  { usuario: 'Valentina.Quintero', password: 'Valentina.Quintero2026', rol: 'esteticista',    nombre: 'Valentina Quintero' },
  { usuario: 'Daniela.Camargo', password: 'Daniela.Camargo2026',     rol: 'esteticista',    nombre: 'Daniela Camargo' }, 
];

// ============================================================
//  HASH SHA-256
// ============================================================
async function sha256(texto) {
  const limpio = texto.trim(); 
  const datos  = new TextEncoder().encode(limpio);
  const buffer = await crypto.subtle.digest('SHA-256', datos);

  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// ============================================================
//  INICIALIZAR USUARIOS
// ============================================================
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

// ============================================================
//  OBTENER USUARIOS
// ============================================================
async function obtenerUsuarios() {
  const res = await fetch('/api/usuarios');
  return res.json();
}

// ============================================================
//  LOGIN
// ============================================================
async function handleLogin() {
  const usuarioEl  = document.getElementById('usuario');
  const passwordEl = document.getElementById('password');
  const recordarme = document.getElementById('remember');
  const btn        = document.getElementById('btn-login');

  const usuario  = usuarioEl ? usuarioEl.value.trim() : '';
  const password = passwordEl ? passwordEl.value.trim() : ''; 
  let valid = true;

  if (usuario.length < 3) {
    setFieldError('usuario', 'usuario-error', true);
    valid = false;
  } else {
    setFieldError('usuario', 'usuario-error', false);
  }

  if (!validatePassword(password)) {
    setFieldError('password', 'password-error', true);
    valid = false;
  } else {
    setFieldError('password', 'password-error', false);
  }

  // 👇 Validación extra contra espacios
  if (password !== password.trim()) {
    showToast('La contraseña no debe tener espacios al inicio o final');
    return;
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

  setTimeout(() => {
    window.location.href = '../Home/Home.html';
  }, 1000);
}