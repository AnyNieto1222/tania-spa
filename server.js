const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const db = new Database(path.join(__dirname, 'taniaspa.db'));
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(__dirname));

// Redirigir raíz al login
app.get('/', (req, res) => {
  res.redirect('/Login/Login.html');
});

// ── Inicializar tablas ──────────────────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS clientes (
    id INTEGER PRIMARY KEY,
    nombre TEXT, tel TEXT, email TEXT, alergias TEXT,
    tipo TEXT, esteticista TEXT, visitas INTEGER DEFAULT 0,
    proximaCita TEXT DEFAULT '', proxTrat TEXT DEFAULT ''
  );
  CREATE TABLE IF NOT EXISTS registros (
    id INTEGER PRIMARY KEY,
    fecha TEXT, clienteId INTEGER, clienteNombre TEXT, tipo TEXT,
    tratamiento TEXT, productos TEXT, notas TEXT,
    datosEspecificos TEXT,
    esteticista TEXT, proximaCita TEXT DEFAULT '', proxTrat TEXT DEFAULT ''
  );
  CREATE TABLE IF NOT EXISTS personal (
    id INTEGER PRIMARY KEY,
    nombre TEXT, cargo TEXT, tel TEXT, email TEXT,
    tratamientos INTEGER DEFAULT 0
  );
  CREATE TABLE IF NOT EXISTS citas (
    id INTEGER PRIMARY KEY,
    clienteNombre TEXT, clienteTel TEXT, clienteEmail TEXT,
    servicio TEXT, fecha TEXT, hora TEXT, esteticista TEXT,
    notas TEXT, estado TEXT DEFAULT 'programada'
  );
  CREATE TABLE IF NOT EXISTS inventario (
    id INTEGER PRIMARY KEY,
    idProducto TEXT, descripcion TEXT, marca TEXT, proveedor TEXT,
    cantidad INTEGER DEFAULT 0, puntoReposicion INTEGER DEFAULT 0,
    costoUnitario REAL DEFAULT 0, fechaVencimiento TEXT DEFAULT ''
  );
  CREATE TABLE IF NOT EXISTS comisiones (
    id INTEGER PRIMARY KEY,
    esteticista TEXT, periodo TEXT,
    servicios TEXT DEFAULT '[]',
    productos TEXT DEFAULT '[]',
    totalServicios REAL DEFAULT 0,
    totalProductos REAL DEFAULT 0,
    totalComisiones REAL DEFAULT 0,
    bonificaciones REAL DEFAULT 0,
    descuentos REAL DEFAULT 0,
    totalPagar REAL DEFAULT 0,
    estadoPago TEXT DEFAULT 'pendiente',
    metodoPago TEXT DEFAULT '',
    fechaPago TEXT DEFAULT '',
    observaciones TEXT DEFAULT '',
    fechaCreacion TEXT
  );
  CREATE TABLE IF NOT EXISTS historias_corporales (
    id INTEGER PRIMARY KEY,
    nombre TEXT, cedula TEXT, fechaNacimiento TEXT, genero TEXT,
    estadoCivil TEXT, eps TEXT, rh TEXT, celular TEXT, direccion TEXT,
    ocupacion TEXT, email TEXT,
    contactoNombre TEXT, contactoParentesco TEXT, contactoCelular TEXT, contactoDireccion TEXT,
    motivoConsulta TEXT,
    antecedentes TEXT DEFAULT '{}',
    habitos TEXT DEFAULT '{}',
    examenFisico TEXT DEFAULT '{}',
    semiologia TEXT DEFAULT '{}',
    mediciones TEXT DEFAULT '{}',
    planConsultorio TEXT DEFAULT '[]',
    planCasa TEXT DEFAULT '{}',
    tratamientoDescripcion TEXT DEFAULT '',
    numSesiones INTEGER DEFAULT 0,
    valorTotal REAL DEFAULT 0,
    abonos TEXT DEFAULT '[]',
    saldoPendiente REAL DEFAULT 0,
    observaciones TEXT DEFAULT '',
    firmaProfesional TEXT DEFAULT '',
    firmaPaciente TEXT DEFAULT '',
    esteticista TEXT,
    fechaCreacion TEXT
  );
`);

// ── CLIENTES ────────────────────────────────────────────────────
app.get('/api/clientes', (req, res) => {
  res.json(db.prepare('SELECT * FROM clientes').all());
});

app.post('/api/clientes', (req, res) => {
  const { id, nombre, tel, email, alergias, tipo, esteticista, visitas, proximaCita, proxTrat } = req.body;
  db.prepare('INSERT OR REPLACE INTO clientes VALUES (?,?,?,?,?,?,?,?,?,?)')
    .run(id, nombre, tel, email || '', alergias || 'Ninguna', tipo, esteticista, visitas || 0, proximaCita || '', proxTrat || '');
  res.json(req.body);
});

app.put('/api/clientes/:id', (req, res) => {
  const { nombre, tel, email, alergias, tipo, esteticista, visitas, proximaCita, proxTrat } = req.body;
  db.prepare('UPDATE clientes SET nombre=?,tel=?,email=?,alergias=?,tipo=?,esteticista=?,visitas=?,proximaCita=?,proxTrat=? WHERE id=?')
    .run(nombre, tel, email || '', alergias || 'Ninguna', tipo, esteticista, visitas || 0, proximaCita || '', proxTrat || '', req.params.id);
  res.json({ ok: true });
});

// ── REGISTROS ───────────────────────────────────────────────────
app.get('/api/registros', (req, res) => {
  const rows = db.prepare('SELECT * FROM registros').all();
  res.json(rows.map(r => ({
    ...r,
    datosEspecificos: r.datosEspecificos ? JSON.parse(r.datosEspecificos) : null,
  })));
});

app.post('/api/registros', (req, res) => {
  const { id, fecha, clienteId, clienteNombre, tipo, tratamiento, productos, notas, datosEspecificos, esteticista, proximaCita, proxTrat } = req.body;
  db.prepare('INSERT INTO registros VALUES (?,?,?,?,?,?,?,?,?,?,?,?)')
    .run(id, fecha, clienteId, clienteNombre, tipo, tratamiento, productos || '', notas || '',
        JSON.stringify(datosEspecificos || null), esteticista, proximaCita || '', proxTrat || '');
  res.json(req.body);
});

// ── PERSONAL ────────────────────────────────────────────────────
app.get('/api/personal', (req, res) => {
  res.json(db.prepare('SELECT * FROM personal').all());
});

app.post('/api/personal', (req, res) => {
  const { id, nombre, cargo, tel, email, tratamientos } = req.body;
  db.prepare('INSERT INTO personal VALUES (?,?,?,?,?,?)')
    .run(id, nombre, cargo, tel || '', email || '', tratamientos || 0);
  res.json(req.body);
});

app.delete('/api/personal/:id', (req, res) => {
  db.prepare('DELETE FROM personal WHERE id=?').run(req.params.id);
  res.json({ ok: true });
});

// ── CITAS ───────────────────────────────────────────────────────
app.get('/api/citas', (req, res) => {
  res.json(db.prepare('SELECT * FROM citas').all());
});

app.post('/api/citas', (req, res) => {
  const { id, clienteNombre, clienteTel, clienteEmail, servicio, fecha, hora, esteticista, notas, estado } = req.body;
  db.prepare('INSERT INTO citas VALUES (?,?,?,?,?,?,?,?,?,?)')
    .run(id, clienteNombre, clienteTel, clienteEmail || '', servicio, fecha, hora, esteticista, notas || '', estado || 'programada');
  res.json(req.body);
});

app.put('/api/citas/:id', (req, res) => {
  const { clienteNombre, clienteTel, clienteEmail, servicio, fecha, hora, esteticista, notas, estado } = req.body;
  db.prepare('UPDATE citas SET clienteNombre=?,clienteTel=?,clienteEmail=?,servicio=?,fecha=?,hora=?,esteticista=?,notas=?,estado=? WHERE id=?')
    .run(clienteNombre, clienteTel, clienteEmail || '', servicio, fecha, hora, esteticista, notas || '', estado, req.params.id);
  res.json({ ok: true });
});

app.delete('/api/citas/:id', (req, res) => {
  db.prepare('DELETE FROM citas WHERE id=?').run(req.params.id);
  res.json({ ok: true });
});

// ── INVENTARIO ──────────────────────────────────────────────────
app.get('/api/inventario', (req, res) => {
  res.json(db.prepare('SELECT * FROM inventario').all());
});

app.post('/api/inventario', (req, res) => {
  const { id, idProducto, descripcion, marca, proveedor, cantidad, puntoReposicion, costoUnitario, fechaVencimiento } = req.body;
  db.prepare('INSERT INTO inventario VALUES (?,?,?,?,?,?,?,?,?)')
    .run(id, idProducto, descripcion, marca, proveedor || '', cantidad || 0, puntoReposicion || 0, costoUnitario || 0, fechaVencimiento || '');
  res.json(req.body);
});

app.put('/api/inventario/:id', (req, res) => {
  const { idProducto, descripcion, marca, proveedor, cantidad, puntoReposicion, costoUnitario, fechaVencimiento } = req.body;
  db.prepare('UPDATE inventario SET idProducto=?,descripcion=?,marca=?,proveedor=?,cantidad=?,puntoReposicion=?,costoUnitario=?,fechaVencimiento=? WHERE id=?')
    .run(idProducto, descripcion, marca, proveedor || '', cantidad || 0, puntoReposicion || 0, costoUnitario || 0, fechaVencimiento || '', req.params.id);
  res.json({ ok: true });
});

app.delete('/api/inventario/:id', (req, res) => {
  db.prepare('DELETE FROM inventario WHERE id=?').run(req.params.id);
  res.json({ ok: true });
});

// ── COMISIONES ──────────────────────────────────────────────────
app.get('/api/comisiones', (req, res) => {
  const rows = db.prepare('SELECT * FROM comisiones').all();
  res.json(rows.map(r => ({
    ...r,
    servicios: r.servicios ? JSON.parse(r.servicios) : [],
    productos: r.productos ? JSON.parse(r.productos) : [],
  })));
});

app.post('/api/comisiones', (req, res) => {
  const { id, esteticista, periodo, servicios, productos, totalServicios, totalProductos,
    totalComisiones, bonificaciones, descuentos, totalPagar, estadoPago, metodoPago,
    fechaPago, observaciones, fechaCreacion } = req.body;
  db.prepare(`INSERT INTO comisiones VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`)
    .run(id, esteticista, periodo,
      JSON.stringify(servicios || []), JSON.stringify(productos || []),
      totalServicios || 0, totalProductos || 0, totalComisiones || 0,
      bonificaciones || 0, descuentos || 0, totalPagar || 0,
      estadoPago || 'pendiente', metodoPago || '', fechaPago || '',
      observaciones || '', fechaCreacion || '');
  res.json(req.body);
});

app.put('/api/comisiones/:id', (req, res) => {
  const { esteticista, periodo, servicios, productos, totalServicios, totalProductos,
    totalComisiones, bonificaciones, descuentos, totalPagar, estadoPago, metodoPago,
    fechaPago, observaciones } = req.body;
  db.prepare(`UPDATE comisiones SET esteticista=?,periodo=?,servicios=?,productos=?,
    totalServicios=?,totalProductos=?,totalComisiones=?,bonificaciones=?,descuentos=?,
    totalPagar=?,estadoPago=?,metodoPago=?,fechaPago=?,observaciones=? WHERE id=?`)
    .run(esteticista, periodo,
      JSON.stringify(servicios || []), JSON.stringify(productos || []),
      totalServicios || 0, totalProductos || 0, totalComisiones || 0,
      bonificaciones || 0, descuentos || 0, totalPagar || 0,
      estadoPago || 'pendiente', metodoPago || '', fechaPago || '',
      observaciones || '', req.params.id);
  res.json({ ok: true });
});

app.delete('/api/comisiones/:id', (req, res) => {
  db.prepare('DELETE FROM comisiones WHERE id=?').run(req.params.id);
  res.json({ ok: true });
});

// ── HISTORIAS CORPORALES ────────────────────────────────────────
app.get('/api/historias-corporales', (req, res) => {
  const rows = db.prepare('SELECT * FROM historias_corporales').all();
  const jsonFields = ['antecedentes','habitos','examenFisico','semiologia','mediciones','planConsultorio','planCasa','abonos'];
  res.json(rows.map(r => {
    const obj = { ...r };
    jsonFields.forEach(f => { try { obj[f] = JSON.parse(r[f]); } catch { obj[f] = r[f]; } });
    return obj;
  }));
});

app.post('/api/historias-corporales', (req, res) => {
  const r = req.body;
  const js = f => JSON.stringify(r[f] || (f === 'planConsultorio' || f === 'abonos' ? [] : {}));
  db.prepare(`INSERT INTO historias_corporales VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`)
    .run(r.id, r.nombre, r.cedula, r.fechaNacimiento, r.genero, r.estadoCivil, r.eps, r.rh,
      r.celular, r.direccion, r.ocupacion, r.email,
      r.contactoNombre, r.contactoParentesco, r.contactoCelular, r.contactoDireccion,
      r.motivoConsulta,
      js('antecedentes'), js('habitos'), js('examenFisico'), js('semiologia'),
      js('mediciones'), js('planConsultorio'), js('planCasa'),
      r.tratamientoDescripcion || '', r.numSesiones || 0,
      r.valorTotal || 0, js('abonos'),
      r.saldoPendiente || 0, r.observaciones || '',
      r.firmaProfesional || '', r.firmaPaciente || '',
      r.esteticista || '', r.fechaCreacion || '');
  res.json(req.body);
});

app.put('/api/historias-corporales/:id', (req, res) => {
  const r = req.body;
  const js = f => JSON.stringify(r[f] || (f === 'planConsultorio' || f === 'abonos' ? [] : {}));
  db.prepare(`UPDATE historias_corporales SET nombre=?,cedula=?,fechaNacimiento=?,genero=?,
    estadoCivil=?,eps=?,rh=?,celular=?,direccion=?,ocupacion=?,email=?,
    contactoNombre=?,contactoParentesco=?,contactoCelular=?,contactoDireccion=?,
    motivoConsulta=?,antecedentes=?,habitos=?,examenFisico=?,semiologia=?,mediciones=?,
    planConsultorio=?,planCasa=?,tratamientoDescripcion=?,numSesiones=?,
    valorTotal=?,abonos=?,saldoPendiente=?,observaciones=?,firmaProfesional=?,
    firmaPaciente=?,esteticista=? WHERE id=?`)
    .run(r.nombre, r.cedula, r.fechaNacimiento, r.genero, r.estadoCivil, r.eps, r.rh,
      r.celular, r.direccion, r.ocupacion, r.email,
      r.contactoNombre, r.contactoParentesco, r.contactoCelular, r.contactoDireccion,
      r.motivoConsulta,
      js('antecedentes'), js('habitos'), js('examenFisico'), js('semiologia'),
      js('mediciones'), js('planConsultorio'), js('planCasa'),
      r.tratamientoDescripcion || '', r.numSesiones || 0,
      r.valorTotal || 0, js('abonos'),
      r.saldoPendiente || 0, r.observaciones || '',
      r.firmaProfesional || '', r.firmaPaciente || '',
      r.esteticista || '', req.params.id);
  res.json({ ok: true });
});

app.delete('/api/historias-corporales/:id', (req, res) => {
  db.prepare('DELETE FROM historias_corporales WHERE id=?').run(req.params.id);
  res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`✿ Tania Spa — Servidor corriendo en http://localhost:${PORT}`);
});
