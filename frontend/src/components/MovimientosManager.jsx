import React, { useState, useEffect } from 'react';
import { Send, RefreshCw, Activity } from 'lucide-react';

const API_MOVIMIENTOS = 'http://localhost:3000/api/movimientos';

export default function MovimientosManager() {
  const [movimientos, setMovimientos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorText, setErrorText] = useState('');
  const [successText, setSuccessText] = useState('');
  const [formData, setFormData] = useState({
    cuenta_origen_id: '',
    cuenta_destino_id: '',
    valor: ''
  });

  const fetchMovimientos = async () => {
    setLoading(true);
    try {
      const res = await fetch(API_MOVIMIENTOS);
      const data = await res.json();
      setMovimientos(data);
    } catch {
      setErrorText('Error al cargar historial');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMovimientos(); }, []);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleTransfer = async (e) => {
    e.preventDefault();
    setErrorText('');
    setSuccessText('');
    try {
      const res = await fetch(`${API_MOVIMIENTOS}/transferir`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          valor: parseFloat(formData.valor)
        })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al procesar transferencia');
      
      setSuccessText(`¡Transferencia de $${parseFloat(formData.valor).toLocaleString('es-CO')} realizada con éxito!`);
      setFormData({ cuenta_origen_id: '', cuenta_destino_id: '', valor: '' });
      fetchMovimientos(); // Refresh after transfer
      setTimeout(() => setSuccessText(''), 5000);
    } catch (err) {
      setErrorText(err.message);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h2>Movimientos y Transferencias</h2>
        <p style={{ color: 'var(--text-muted)' }}>Mueve el dinero con seguridad utilizando Transacciones SQL bloqueadas.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
        
        {/* Transfer Section */}
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Send size={20} color="var(--accent-color)" /> Realizar Transferencia
          </h3>

          {errorText && <div style={{ color: '#d32f2f', padding: '1rem', background: '#ffebee', borderRadius: '8px', marginBottom: '1rem' }}>{errorText}</div>}
          {successText && <div style={{ color: 'var(--success)', padding: '1rem', background: '#e8f5e9', borderRadius: '8px', marginBottom: '1rem', fontWeight: 'bold' }}>{successText}</div>}

          <form onSubmit={handleTransfer}>
            <div className="form-group">
              <label>ID Cuenta de Retiro (Origen)</label>
              <input type="number" name="cuenta_origen_id" value={formData.cuenta_origen_id} onChange={handleChange} required />
            </div>
            
            <div className="form-group">
              <label>ID Cuenta de Depósito (Destino)</label>
              <input type="number" name="cuenta_destino_id" value={formData.cuenta_destino_id} onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label>Valor a transferir ($)</label>
              <input type="number" name="valor" value={formData.valor} onChange={handleChange} min="1" required />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '1rem', marginTop: '1rem' }}>
              Confirmar Transferencia
            </button>
          </form>
        </div>

        {/* History Section */}
        <div className="glass-panel" style={{ padding: '0', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}>
            <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Activity size={20} color="var(--text-main)" /> Historial General
            </h3>
            <button className="btn btn-secondary" onClick={fetchMovimientos} disabled={loading} style={{ padding: '0.4rem' }}>
              <RefreshCw size={18} />
            </button>
          </div>
          
          <div style={{ overflowY: 'auto', flex: 1, maxHeight: '500px' }}>
            <table className="data-table" style={{ marginTop: 0 }}>
              <thead><tr><th>Fecha</th><th>De ➜ Para</th><th style={{ textAlign: 'right' }}>Valor</th></tr></thead>
              <tbody>
                {movimientos.map(m => (
                  <tr key={m.id}>
                    <td style={{ fontSize: '0.85rem' }}>{new Date(m.fecha).toLocaleString()}</td>
                    <td><strong style={{color:'#d32f2f'}}>#{m.cuenta_origen_id}</strong> ➜ <strong style={{color:'var(--success)'}}>#{m.cuenta_destino_id}</strong></td>
                    <td style={{ textAlign: 'right', fontWeight: 'bold' }}>
                      ${parseFloat(m.valor).toLocaleString('es-CO')}
                    </td>
                  </tr>
                ))}
                {movimientos.length === 0 && !loading && <tr><td colSpan="3" style={{textAlign:'center', padding:'2rem'}}>No hay movimientos.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
