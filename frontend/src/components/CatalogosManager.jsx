import React, { useState, useEffect } from 'react';
import { Database, Save, X, RefreshCw, FolderOpen } from 'lucide-react';

const API_URL = '/api/catalogos';
const TABLES = [
  { id: 'tipo_cuenta', label: 'Tipos de Cuenta' },
  { id: 'tipo_movimiento', label: 'Tipos de Movimiento' },
  { id: 'sede', label: 'Sedes del Banco' },
  { id: 'empleado', label: 'Personal / Empleados' },
  { id: 'punto_atencion', label: 'Puntos de Atención' },
  { id: 'departamento', label: 'Departamentos Geog.' },
  { id: 'municipio', label: 'Municipios Geog.' },
  { id: 'comuna', label: 'Comunas' },
  { id: 'barrio', label: 'Barrios' }
];

export default function CatalogosManager() {
  const [activeTable, setActiveTable] = useState('tipo_cuenta');
  const [dataList, setDataList] = useState([]);
  const [schema, setSchema] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [errorText, setErrorText] = useState('');
  const [formData, setFormData] = useState({});

  const loadData = async (table) => {
    setLoading(true);
    setErrorText('');
    try {
      // Pedir al servidor que le pregunte a PostgreSQL qué columnas existen
      const schemaRes = await fetch(`${API_CATALOGOS}/schema/${table}`);
      const schemaData = await schemaRes.json();
      if (!schemaRes.ok) throw new Error(schemaData.error);
      
      const cols = schemaData.filter(c => c.column_name !== 'id');
      setSchema(cols);
      
      const initialForm = {};
      cols.forEach(c => initialForm[c.column_name] = '');
      setFormData(initialForm);

      const dfRes = await fetch(`${API_CATALOGOS}/${table}`);
      const df = await dfRes.json();
      setDataList(df);
    } catch (err) {
      setErrorText(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(activeTable);
    setShowForm(false);
  }, [activeTable]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_CATALOGOS}/${activeTable}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error);
      
      setDataList([resData, ...dataList]);
      setShowForm(false);
      
      const resetForm = {};
      schema.forEach(c => resetForm[c.column_name] = '');
      setFormData(resetForm);
    } catch (err) {
      setErrorText(err.message);
    }
  };

  const renderInput = (col) => {
    const isNum = col.data_type.includes('integer') || col.data_type.includes('numeric');
    const isDate = col.data_type.includes('date') || col.data_type.includes('timestamp');
    const isBool = col.data_type.includes('boolean');
    
    // Convertir guion bajo a etiqueta leíble
    const label = col.column_name.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    
    let inputEl = <input type={isNum ? "number" : "text"} name={col.column_name} value={formData[col.column_name] || ''} onChange={handleChange} required={col.is_nullable === 'NO'} />;
    if (isDate) inputEl = <input type="date" name={col.column_name} value={formData[col.column_name] || ''} onChange={handleChange} required={col.is_nullable === 'NO'} />;
    if (isBool) inputEl = (
        <select name={col.column_name} value={formData[col.column_name] || 'true'} onChange={handleChange}>
          <option value="true">Sí (Booleano)</option>
          <option value="false">No (Booleano)</option>
        </select>
    );

    return (
      <div className="form-group" key={col.column_name}>
        <label>{label} {col.is_nullable === 'NO' && <span style={{color:'#d32f2f'}}>*</span>}</label>
        {inputEl}
      </div>
    );
  };

  return (
    <div>
      <div className="page-header">
        <h2>Catálogos y Parámetros</h2>
        <p style={{ color: 'var(--text-muted)' }}>Módulo "Magic CRUD" que detecta y lee la base de datos mágicamente sin código estático.</p>
      </div>

      <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border)', marginBottom: '1.5rem' }}>
        {TABLES.map(t => (
          <button 
            key={t.id} 
            className={`btn ${activeTable === t.id ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '0.5rem 0.8rem', fontSize: '0.8rem' }}
            onClick={() => setActiveTable(t.id)}
          >
            <FolderOpen size={14} /> {t.label}
          </button>
        ))}
      </div>

      <div className="glass-panel" style={{ padding: '0' }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, textTransform: 'capitalize' }}>Listado de '{activeTable.replace(/_/g, ' ')}'</h3>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn btn-secondary" onClick={() => loadData(activeTable)} disabled={loading} style={{ padding: '0.4rem' }}>
              <RefreshCw size={18} />
            </button>
            {!showForm && (
              <button className="btn btn-primary" onClick={() => setShowForm(true)}>Generar Formulario y Añadir</button>
            )}
          </div>
        </div>

        {showForm && (
          <div style={{ padding: '2rem', borderBottom: '1px solid var(--border)', background: 'rgba(0,0,0,0.02)' }}>
            <h4>Ingresar a PostgreSQL ({activeTable})</h4>
            {errorText && <div style={{ color: '#d32f2f', padding: '1rem', background: '#ffebee', borderRadius: '8px', margin: '1rem 0' }}>{errorText}</div>}
            
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginTop: '1rem' }}>
                {schema.map(col => renderInput(col))}
              </div>
              <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cerrar Formulario</button>
                <button type="submit" className="btn btn-primary"><Database size={18}/> Insertar en PostgreSQL</button>
              </div>
            </form>
          </div>
        )}

        <div style={{ overflowX: 'auto', padding: '1.5rem', zoom: 0.9 }}>
          {loading ? (
            <p>Generando esquema de la base de datos para la interfaz...</p>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID Primario</th>
                  {schema.map(c => <th key={c.column_name}>{c.column_name.replace(/_/g, ' ')}</th>)}
                </tr>
              </thead>
              <tbody>
                {dataList.map(row => (
                  <tr key={row.id}>
                    <td><strong>#{row.id}</strong></td>
                    {schema.map(c => (
                      <td key={c.column_name}>{row[c.column_name] !== null ? String(row[c.column_name]) : '-'}</td>
                    ))}
                  </tr>
                ))}
                {dataList.length === 0 && <tr><td colSpan={schema.length + 1}>No existen datos guardados.</td></tr>}
              </tbody>
            </table>
          )}
        </div>

      </div>
    </div>
  );
}
