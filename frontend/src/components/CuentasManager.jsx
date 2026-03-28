import React, { useState, useEffect } from 'react';
import { CreditCard, Save, X, RefreshCw } from 'lucide-react';

const API_URL = '/api/cuentas';

export default function CuentasManager() {
  const [cuentas, setCuentas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [errorText, setErrorText] = useState('');
  const [formData, setFormData] = useState({ numero_cuenta: '', saldo: '0', cupo_total: '0', usuario_id: '' });
  const [clientesList, setClientesList] = useState([]);

  const fetchCuentas = async () => {
    setLoading(true);
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      setCuentas(data);

      const resCli = await fetch('/api/clientes');
      const dataCli = await resCli.json();
      setClientesList(dataCli);
    } catch {
      setErrorText('Error al cargar cuentas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCuentas(); }, []);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Generar automáticamente un número de cuenta aleatorio estilo banco
      const cuentaAutogenerada = Math.floor(Math.random() * 900000000) + 100000000;
      const payload = { ...formData, numero_cuenta: cuentaAutogenerada.toString() };

      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setCuentas([data, ...cuentas]);
      setShowForm(false);
      setFormData({ numero_cuenta: '', saldo: '0', cupo_total: '0', usuario_id: '' });
    } catch (err) {
      setErrorText(err.message);
    }
  };

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2>Gestión de Cuentas</h2>
          <p style={{ color: 'var(--text-muted)' }}>Manejo de cuentas y saldos financieros.</p>
        </div>
        {!showForm && (
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            <CreditCard size={18} /> Nueva Cuenta
          </button>
        )}
      </div>

      {showForm && (
        <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <h3>Crear Cuenta</h3>
            <button className="btn btn-secondary" onClick={() => setShowForm(false)} style={{ padding: '0.4rem' }}><X size={18} /></button>
          </div>
          {errorText && <div style={{ color: '#d32f2f', padding: '1rem', background: '#ffebee', borderRadius: '8px', marginBottom: '1rem' }}>{errorText}</div>}

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
              <div className="form-group">
                 <label>Cliente Propietario</label>
                 <select name="usuario_id" value={formData.usuario_id} onChange={handleChange} required>
                    <option value="">Seleccione al Cliente</option>
                    {clientesList.map(cli => (
                       <option key={cli.id} value={cli.id}>{cli.nombre} {cli.apellido} (Cédula: {cli.numero_documento})</option>
                    ))}
                 </select>
              </div>
              <div className="form-group"><label>Saldo Inicial asignado ($)</label><input type="number" name="saldo" value={formData.saldo} onChange={handleChange} /></div>
            </div>
            <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button type="submit" className="btn btn-primary"><Save size={18} /> Guardar Banco</button>
            </div>
          </form>
        </div>
      )}

      <div className="glass-panel" style={{ padding: '0' }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}>
          <h3 style={{ margin: 0 }}>Cuentas Activas</h3>
          <button className="btn btn-secondary" onClick={fetchCuentas} disabled={loading} style={{ padding: '0.4rem' }}><RefreshCw size={18} /></button>
        </div>
        <table className="data-table">
          <thead><tr><th>ID</th><th>Cédula Dueño (ID)</th><th>Número Cuenta</th><th style={{ textAlign: 'right' }}>Saldo Total</th></tr></thead>
          <tbody>
            {cuentas.map(c => (
              <tr key={c.id}>
                <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>En sistema: {c.id}</td>
                <td>Dueño ID: <strong>{c.usuario_id}</strong></td>
                <td><strong>{c.numero_cuenta}</strong></td>
                <td style={{ textAlign: 'right', color: 'var(--success)', fontWeight: 'bold' }}>$ {parseFloat(c.saldo).toLocaleString('es-CO')}</td>
              </tr>
            ))}
            {cuentas.length === 0 && !loading && <tr><td colSpan="3" style={{textAlign:'center', padding:'2rem'}}>No hay cuentas disponibles</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
