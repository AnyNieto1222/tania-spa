const { createClient } = require('@libsql/client');
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

const db = createClient({
  url: process.env.TURSO_DATABASE_URL || 'file:taniaspa.db',
  authToken: process.env.TURSO_AUTH_TOKEN,
});

app.use(express.json());
app.use(express.static(__dirname));

app.get('/', (req, res) => {
  res.redirect('/Login/Login.html');
});

async function initDB() {
  await db.batch([
    `CREATE TABLE IF NOT EXISTS clientes (
      id INTEGER PRIMARY KEY, nombre TEXT, tel TEXT, email TEXT, alergias TEXT,
      tipo TEXT, esteticista TEXT, visitas INTEGER DEFAULT 0,
      proximaCita TEXT DEFAULT '', proxTrat TEXT DEFAULT ''
    )`,
    `CREATE TABLE IF NOT EXISTS registros (
      id INTEGER PRIMARY KEY, fecha TEXT, clienteId INTEGER, clienteNombre TEXT, tipo TEXT,
      tratamiento TEXT, productos TEXT, notas TEXT, datosEspecificos TEXT,
      esteticista TEXT, proximaCita TEXT DEFAULT '', proxTrat TEXT DEFAULT ''
    )`,
    `CREATE TABLE IF NOT EXISTS personal (
      id INTEGER PRIMARY KEY, nombre TEXT, cargo TEXT, tel TEXT, email TEXT,
      tratamientos INTEGER DEFAULT 0
    )`,
    `CREATE TABLE IF NOT EXISTS citas (
      id INTEGER PRIMARY KEY, clienteNombre TEXT, clienteTel TEXT, clienteEmail TEXT,
      servicio TEXT, fecha TEXT, hora TEXT, esteticista TEXT,
      notas TEXT, estado TEXT DEFAULT 'programada'
    )`,
    `CREATE TABLE IF NOT EXISTS inventario (
      id INTEGER PRIMARY KEY, idProducto TEXT, descripcion TEXT, marca TEXT, proveedor TEXT,
      cantidad INTEGER DEFAULT 0, puntoReposicion INTEGER DEFAULT 0,
      costoUnitario REAL DEFAULT 0, fechaVencimiento TEXT DEFAULT ''
    )`,
    `CREATE TABLE IF NOT EXISTS comisiones (
      id INTEGER PRIMARY KEY, esteticista TEXT, periodo TEXT,
      servicios TEXT DEFAULT '[]', productos TEXT DEFAULT '[]',
      totalServicios REAL DEFAULT 0, totalProductos REAL DEFAULT 0,
      totalComisiones REAL DEFAULT 0, bonificaciones REAL DEFAULT 0,
      descuentos REAL DEFAULT 0, totalPagar REAL DEFAULT 0,
      estadoPago TEXT DEFAULT 'pendiente', metodoPago TEXT DEFAULT '',
      fechaPago TEXT DEFAULT '', observaciones TEXT DEFAULT '',
      fechaCreacion TEXT
    )`,
    `CREATE TABLE IF NOT EXISTS historias_corporales (
      id INTEGER PRIMARY KEY, nombre TEXT, cedula TEXT, fechaNacimiento TEXT, genero TEXT,
      estadoCivil TEXT, eps TEXT, rh TEXT, celular TEXT, direccion TEXT,
      ocupacion TEXT, email TEXT,
      contactoNombre TEXT, contactoParentesco TEXT, contactoCelular TEXT, contactoDireccion TEXT,
      motivoConsulta TEXT, antecedentes TEXT DEFAULT '{}', habitos TEXT DEFAULT '{}',
      examenFisico TEXT DEFAULT '{}', semiologia TEXT DEFAULT '{}', mediciones TEXT DEFAULT '{}',
      planConsultorio TEXT DEFAULT '[]', planCasa TEXT DEFAULT '{}',
      tratamientoDescripcion TEXT DEFAULT '', numSesiones INTEGER DEFAULT 0,
      valorTotal REAL DEFAULT 0, abonos TEXT DEFAULT '[]', saldoPendiente REAL DEFAULT 0,
      observaciones TEXT DEFAULT '', firmaProfesional TEXT DEFAULT '', firmaPaciente TEXT DEFAULT '',
      esteticista TEXT, fechaCreacion TEXT, tipo TEXT DEFAULT 'corporal',
      datosFacial TEXT DEFAULT '{}', datosCapilar TEXT DEFAULT '{}'
    )`,
  ], 'write');

  // Migraciones para columnas nuevas en tablas existentes (seguras si ya existen)
  const migrations = [
    `ALTER TABLE historias_corporales ADD COLUMN tipo TEXT DEFAULT 'corporal'`,
    `ALTER TABLE historias_corporales ADD COLUMN datosFacial TEXT DEFAULT '{}'`,
    `ALTER TABLE historias_corporales ADD COLUMN datosCapilar TEXT DEFAULT '{}'`,
  ];
  for (const sql of migrations) {
    try { await db.execute(sql); } catch (_) { /* columna ya existe */ }
  }
}

// ── CLIENTES ────────────────────────────────────────────────────
app.get('/api/clientes', async (req, res) => {
  const result = await db.execute('SELECT * FROM clientes');
  res.json(result.rows);
});

app.post('/api/clientes', async (req, res) => {
  const { id, nombre, tel, email, alergias, tipo, esteticista, visitas, proximaCita, proxTrat } = req.body;
  await db.execute({
    sql: 'INSERT OR REPLACE INTO clientes VALUES (?,?,?,?,?,?,?,?,?,?)',
    args: [id, nombre, tel, email || '', alergias || 'Ninguna', tipo, esteticista, visitas || 0, proximaCita || '', proxTrat || ''],
  });
  res.json(req.body);
});

app.put('/api/clientes/:id', async (req, res) => {
  const { nombre, tel, email, alergias, tipo, esteticista, visitas, proximaCita, proxTrat } = req.body;
  await db.execute({
    sql: 'UPDATE clientes SET nombre=?,tel=?,email=?,alergias=?,tipo=?,esteticista=?,visitas=?,proximaCita=?,proxTrat=? WHERE id=?',
    args: [nombre, tel, email || '', alergias || 'Ninguna', tipo, esteticista, visitas || 0, proximaCita || '', proxTrat || '', req.params.id],
  });
  res.json({ ok: true });
});

// ── REGISTROS ───────────────────────────────────────────────────
app.get('/api/registros', async (req, res) => {
  const result = await db.execute('SELECT * FROM registros');
  res.json(result.rows.map(r => ({
    ...r,
    datosEspecificos: r.datosEspecificos ? JSON.parse(r.datosEspecificos) : null,
  })));
});

app.post('/api/registros', async (req, res) => {
  const { id, fecha, clienteId, clienteNombre, tipo, tratamiento, productos, notas, datosEspecificos, esteticista, proximaCita, proxTrat } = req.body;
  await db.execute({
    sql: 'INSERT INTO registros VALUES (?,?,?,?,?,?,?,?,?,?,?,?)',
    args: [id, fecha, clienteId, clienteNombre, tipo, tratamiento, productos || '', notas || '',
      JSON.stringify(datosEspecificos || null), esteticista, proximaCita || '', proxTrat || ''],
  });
  res.json(req.body);
});

// ── PERSONAL ────────────────────────────────────────────────────
app.get('/api/personal', async (req, res) => {
  const result = await db.execute('SELECT * FROM personal');
  res.json(result.rows);
});

app.post('/api/personal', async (req, res) => {
  const { id, nombre, cargo, tel, email, tratamientos } = req.body;
  await db.execute({
    sql: 'INSERT INTO personal VALUES (?,?,?,?,?,?)',
    args: [id, nombre, cargo, tel || '', email || '', tratamientos || 0],
  });
  res.json(req.body);
});

app.delete('/api/personal/:id', async (req, res) => {
  await db.execute({ sql: 'DELETE FROM personal WHERE id=?', args: [req.params.id] });
  res.json({ ok: true });
});

// ── CITAS ───────────────────────────────────────────────────────
app.get('/api/citas', async (req, res) => {
  const result = await db.execute('SELECT * FROM citas');
  res.json(result.rows);
});

app.post('/api/citas', async (req, res) => {
  const { id, clienteNombre, clienteTel, clienteEmail, servicio, fecha, hora, esteticista, notas, estado } = req.body;
  await db.execute({
    sql: 'INSERT INTO citas VALUES (?,?,?,?,?,?,?,?,?,?)',
    args: [id, clienteNombre, clienteTel, clienteEmail || '', servicio, fecha, hora, esteticista, notas || '', estado || 'programada'],
  });
  res.json(req.body);
});

app.put('/api/citas/:id', async (req, res) => {
  const { clienteNombre, clienteTel, clienteEmail, servicio, fecha, hora, esteticista, notas, estado } = req.body;
  await db.execute({
    sql: 'UPDATE citas SET clienteNombre=?,clienteTel=?,clienteEmail=?,servicio=?,fecha=?,hora=?,esteticista=?,notas=?,estado=? WHERE id=?',
    args: [clienteNombre, clienteTel, clienteEmail || '', servicio, fecha, hora, esteticista, notas || '', estado, req.params.id],
  });
  res.json({ ok: true });
});

app.delete('/api/citas/:id', async (req, res) => {
  await db.execute({ sql: 'DELETE FROM citas WHERE id=?', args: [req.params.id] });
  res.json({ ok: true });
});

// ── INVENTARIO ──────────────────────────────────────────────────
app.get('/api/inventario', async (req, res) => {
  const result = await db.execute('SELECT * FROM inventario');
  res.json(result.rows);
});

app.post('/api/inventario', async (req, res) => {
  const { id, idProducto, descripcion, marca, proveedor, cantidad, puntoReposicion, costoUnitario, fechaVencimiento } = req.body;
  await db.execute({
    sql: 'INSERT INTO inventario VALUES (?,?,?,?,?,?,?,?,?)',
    args: [id, idProducto, descripcion, marca, proveedor || '', cantidad || 0, puntoReposicion || 0, costoUnitario || 0, fechaVencimiento || ''],
  });
  res.json(req.body);
});

app.put('/api/inventario/:id', async (req, res) => {
  const { idProducto, descripcion, marca, proveedor, cantidad, puntoReposicion, costoUnitario, fechaVencimiento } = req.body;
  await db.execute({
    sql: 'UPDATE inventario SET idProducto=?,descripcion=?,marca=?,proveedor=?,cantidad=?,puntoReposicion=?,costoUnitario=?,fechaVencimiento=? WHERE id=?',
    args: [idProducto, descripcion, marca, proveedor || '', cantidad || 0, puntoReposicion || 0, costoUnitario || 0, fechaVencimiento || '', req.params.id],
  });
  res.json({ ok: true });
});

app.delete('/api/inventario/:id', async (req, res) => {
  await db.execute({ sql: 'DELETE FROM inventario WHERE id=?', args: [req.params.id] });
  res.json({ ok: true });
});

// ── COMISIONES ──────────────────────────────────────────────────
app.get('/api/comisiones', async (req, res) => {
  const result = await db.execute('SELECT * FROM comisiones');
  res.json(result.rows.map(r => ({
    ...r,
    servicios: r.servicios ? JSON.parse(r.servicios) : [],
    productos: r.productos ? JSON.parse(r.productos) : [],
  })));
});

app.post('/api/comisiones', async (req, res) => {
  const { id, esteticista, periodo, servicios, productos, totalServicios, totalProductos,
    totalComisiones, bonificaciones, descuentos, totalPagar, estadoPago, metodoPago,
    fechaPago, observaciones, fechaCreacion } = req.body;
  await db.execute({
    sql: 'INSERT INTO comisiones VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
    args: [id, esteticista, periodo,
      JSON.stringify(servicios || []), JSON.stringify(productos || []),
      totalServicios || 0, totalProductos || 0, totalComisiones || 0,
      bonificaciones || 0, descuentos || 0, totalPagar || 0,
      estadoPago || 'pendiente', metodoPago || '', fechaPago || '',
      observaciones || '', fechaCreacion || ''],
  });
  res.json(req.body);
});

app.put('/api/comisiones/:id', async (req, res) => {
  const { esteticista, periodo, servicios, productos, totalServicios, totalProductos,
    totalComisiones, bonificaciones, descuentos, totalPagar, estadoPago, metodoPago,
    fechaPago, observaciones } = req.body;
  await db.execute({
    sql: `UPDATE comisiones SET esteticista=?,periodo=?,servicios=?,productos=?,
      totalServicios=?,totalProductos=?,totalComisiones=?,bonificaciones=?,descuentos=?,
      totalPagar=?,estadoPago=?,metodoPago=?,fechaPago=?,observaciones=? WHERE id=?`,
    args: [esteticista, periodo,
      JSON.stringify(servicios || []), JSON.stringify(productos || []),
      totalServicios || 0, totalProductos || 0, totalComisiones || 0,
      bonificaciones || 0, descuentos || 0, totalPagar || 0,
      estadoPago || 'pendiente', metodoPago || '', fechaPago || '',
      observaciones || '', req.params.id],
  });
  res.json({ ok: true });
});

app.delete('/api/comisiones/:id', async (req, res) => {
  await db.execute({ sql: 'DELETE FROM comisiones WHERE id=?', args: [req.params.id] });
  res.json({ ok: true });
});

// ── HISTORIAS CORPORALES ────────────────────────────────────────
app.get('/api/historias-corporales', async (req, res) => {
  const result = await db.execute('SELECT * FROM historias_corporales');
  const jsonFields = ['antecedentes', 'habitos', 'examenFisico', 'semiologia', 'mediciones', 'planConsultorio', 'planCasa', 'abonos', 'datosFacial', 'datosCapilar'];
  res.json(result.rows.map(r => {
    const obj = { ...r };
    jsonFields.forEach(f => { try { obj[f] = JSON.parse(r[f]); } catch { obj[f] = r[f]; } });
    return obj;
  }));
});

app.post('/api/historias-corporales', async (req, res) => {
  const r = req.body;
  const js = f => JSON.stringify(r[f] || (f === 'planConsultorio' || f === 'abonos' ? [] : {}));
  await db.execute({
    sql: 'INSERT INTO historias_corporales VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
    args: [r.id, r.nombre, r.cedula, r.fechaNacimiento, r.genero, r.estadoCivil, r.eps, r.rh,
      r.celular, r.direccion, r.ocupacion, r.email,
      r.contactoNombre, r.contactoParentesco, r.contactoCelular, r.contactoDireccion,
      r.motivoConsulta,
      js('antecedentes'), js('habitos'), js('examenFisico'), js('semiologia'),
      js('mediciones'), js('planConsultorio'), js('planCasa'),
      r.tratamientoDescripcion || '', r.numSesiones || 0,
      r.valorTotal || 0, js('abonos'),
      r.saldoPendiente || 0, r.observaciones || '',
      r.firmaProfesional || '', r.firmaPaciente || '',
      r.esteticista || '', r.fechaCreacion || '',
      r.tipo || 'corporal', js('datosFacial'), js('datosCapilar')],
  });
  res.json(req.body);
});

app.put('/api/historias-corporales/:id', async (req, res) => {
  const r = req.body;
  const js = f => JSON.stringify(r[f] || (f === 'planConsultorio' || f === 'abonos' ? [] : {}));
  await db.execute({
    sql: `UPDATE historias_corporales SET nombre=?,cedula=?,fechaNacimiento=?,genero=?,
      estadoCivil=?,eps=?,rh=?,celular=?,direccion=?,ocupacion=?,email=?,
      contactoNombre=?,contactoParentesco=?,contactoCelular=?,contactoDireccion=?,
      motivoConsulta=?,antecedentes=?,habitos=?,examenFisico=?,semiologia=?,mediciones=?,
      planConsultorio=?,planCasa=?,tratamientoDescripcion=?,numSesiones=?,
      valorTotal=?,abonos=?,saldoPendiente=?,observaciones=?,firmaProfesional=?,
      firmaPaciente=?,esteticista=?,tipo=?,datosFacial=?,datosCapilar=? WHERE id=?`,
    args: [r.nombre, r.cedula, r.fechaNacimiento, r.genero, r.estadoCivil, r.eps, r.rh,
      r.celular, r.direccion, r.ocupacion, r.email,
      r.contactoNombre, r.contactoParentesco, r.contactoCelular, r.contactoDireccion,
      r.motivoConsulta,
      js('antecedentes'), js('habitos'), js('examenFisico'), js('semiologia'),
      js('mediciones'), js('planConsultorio'), js('planCasa'),
      r.tratamientoDescripcion || '', r.numSesiones || 0,
      r.valorTotal || 0, js('abonos'),
      r.saldoPendiente || 0, r.observaciones || '',
      r.firmaProfesional || '', r.firmaPaciente || '',
      r.esteticista || '', r.tipo || 'corporal', js('datosFacial'), js('datosCapilar'),
      req.params.id],
  });
  res.json({ ok: true });
});

app.delete('/api/historias-corporales/:id', async (req, res) => {
  await db.execute({ sql: 'DELETE FROM historias_corporales WHERE id=?', args: [req.params.id] });
  res.json({ ok: true });
});

initDB()
  .then(() => app.listen(PORT, () => console.log(`✿ Tania Spa — Servidor corriendo en http://localhost:${PORT}`)))
  .catch(err => { console.error('Error inicializando BD:', err); process.exit(1); });
