// frontend/src/components/ClientesManager.jsx
import React, { useState, useEffect } from 'react';
import { UserPlus, Save, X, RefreshCw } from 'lucide-react';

const API_URL = 'http://localhost:3000/api/clientes';

export default function ClientesManager() {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [errorText, setErrorText] = useState('');
  const [formData, setFormData] = useState({
    tipo_documento: 'CC',
    numero_documento: '',
    nombre: '',
    apellido: '',
    fecha_nacimiento: '',
    telefono: '',
    email: '',
    direccion: '',
    comuna: ''
  });

  const fetchClientes = async () => {
    setLoading(true);
    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error('Error de red');
      const data = await res.json();
      setClientes(data);
    } catch (err) {
      console.error(err);
      setErrorText('Error al cargar clientes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClientes();
  }, []);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorText('');
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          comuna: formData.comuna ? parseInt(formData.comuna) : null,
          fecha_nacimiento: formData.fecha_nacimiento || null
        })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al guardar');
      
      // Añadir al principio de la lista y cerrar
      setClientes([data, ...clientes]);
      setShowForm(false);
      setFormData({...formData, numero_documento: '', nombre: '', apellido: ''}); // reset
    } catch (err) {
      setErrorText(err.message);
    }
  };

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2>Gestión de Clientes</h2>
          <p style={{ color: 'var(--text-muted)' }}>Administre la información de los usuarios del banco.</p>
        </div>
        {!showForm && (
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            <UserPlus size={18} /> Nuevo Cliente
          </button>
        )}
      </div>

      {showForm && (
        <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <h3>Registrar Nuevo Cliente</h3>
            <button className="btn btn-secondary" onClick={() => setShowForm(false)} style={{ padding: '0.4rem' }}>
              <X size={18} />
            </button>
          </div>
          
          {errorText && <div style={{ color: '#d32f2f', padding: '1rem', background: '#ffebee', borderRadius: '8px', marginBottom: '1rem' }}>{errorText}</div>}

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
              <div className="form-group">
                <label>Tipo Documento</label>
                <select name="tipo_documento" value={formData.tipo_documento} onChange={handleChange} required>
                  <option value="CC">CC - Cédula</option>
                  <option value="CE">CE - Extranjería</option>
                  <option value="TI">TI - Tarjeta Id.</option>
                  <option value="PAS">PAS - Pasaporte</option>
                </select>
              </div>
              <div className="form-group">
                <label>Número de Documento</label>
                <input type="text" name="numero_documento" value={formData.numero_documento} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Nombres</label>
                <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Apellidos</label>
                <input type="text" name="apellido" value={formData.apellido} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Fecha de Nacimiento</label>
                <input type="date" name="fecha_nacimiento" value={formData.fecha_nacimiento} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Teléfono</label>
                <input type="tel" name="telefono" value={formData.telefono} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Dirección</label>
                <input type="text" name="direccion" value={formData.direccion} onChange={handleChange} />
              </div>
            </div>
            
            <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancelar</button>
              <button type="submit" className="btn btn-primary"><Save size={18} /> Guardar Cliente</button>
            </div>
          </form>
        </div>
      )}

      <div className="glass-panel" style={{ padding: '0' }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0 }}>Listado de Clientes</h3>
          <button className="btn btn-secondary" onClick={fetchClientes} disabled={loading} style={{ padding: '0.4rem' }}>
            <RefreshCw size={18} />
          </button>
        </div>
        
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Documento</th>
                <th>Nombre Completo</th>
                <th>Contacto</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan="4" style={{ textAlign: 'center', padding: '2rem' }}>Cargando clientes...</td></tr>}
              {!loading && clientes.length === 0 && <tr><td colSpan="4" style={{ textAlign: 'center', padding: '2rem' }}>No hay clientes registrados.</td></tr>}
              {clientes.map(cli => (
                <tr key={cli.id}>
                  <td><strong>{cli.tipo_documento}</strong> {cli.numero_documento}</td>
                  <td>{cli.nombre} {cli.apellido}</td>
                  <td>
                    <div>{cli.telefono || 'Sin tel.'}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{cli.email || 'Sin email'}</div>
                  </td>
                  <td>
                    <span className="status-badge" style={{ background: cli.activo ? '#e8f5e9' : '#ffebee', color: cli.activo ? 'var(--success)' : '#d32f2f' }}>
                      {cli.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
