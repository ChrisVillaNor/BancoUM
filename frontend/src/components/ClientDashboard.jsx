import React, { useState, useEffect } from 'react';
import { CreditCard, Send, Activity, User, LogOut, ShieldAlert, CheckCircle } from 'lucide-react';

export default function ClientDashboard({ userData, onLogout }) {
  const [cuentas, setCuentas] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Formulario Transferencias
  const [origenId, setOrigenId] = useState('');
  const [destinoId, setDestinoId] = useState('');
  const [monto, setMonto] = useState('');
  const [txStatus, setTxStatus] = useState({ state: 'idle', msg: '' });

  const loadCuentas = async () => {
    try {
      const resp = await fetch(`/api/cuentas/cliente/${userData.id}`);
      const data = await resp.json();
      setCuentas(data);
      if (data.length > 0 && !origenId) setOrigenId(data[0].id);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCuentas();
  }, [userData]);

  const handleTransfer = async (e) => {
    e.preventDefault();
    setTxStatus({ state: 'loading', msg: 'Aprobando transacción...' });
    
    try {
      const resp = await fetch('/api/movimientos/transferir', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cuenta_origen_id: origenId,
          cuenta_destino_id: destinoId,
          valor: parseFloat(monto),
          tipo_movimiento_id: 1 // Asumimos 1 es Transferencia
        })
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || 'Error transaccional.');
      
      setTxStatus({ state: 'success', msg: '¡Transferencia SQL Completada con Éxito!' });
      setDestinoId(''); setMonto('');
      loadCuentas(); // Recargar saldo
      setTimeout(() => setTxStatus({ state: 'idle', msg: '' }), 4000);
      
    } catch (err) {
      setTxStatus({ state: 'error', msg: err.message });
      setTimeout(() => setTxStatus({ state: 'idle', msg: '' }), 6000);
    }
  };

  return (
    <div className="app-container" style={{ background: 'var(--bg-color)', overflowY:'auto' }}>
      
      {/* Sidebar Lateral (Home Banking) */}
      <aside className="sidebar" style={{ background: '#121817', color: 'white', borderRight:'none' }}>
        <h1 style={{ color: 'var(--accent-color)' }}>UM Banking</h1>
        <div className="nav-links">
          <div className="nav-link active" style={{ background: 'rgba(255,255,255,0.1)' }}>
            <Activity size={18} /> Mis Productos
          </div>
          <div className="nav-link" style={{ color: 'rgba(255,255,255,0.6)'}}>
             <User size={18} /> {userData.nombre}
          </div>
        </div>
        <div style={{ marginTop: 'auto' }}>
          <button className="nav-link" style={{ background:'none', border:'none', color: '#ff8a80', width:'100%', textAlign:'left', cursor:'pointer' }} onClick={onLogout}>
            <LogOut size={18} /> Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Contenido Principal */}
      <main className="main-content" style={{ padding: '3rem 4rem' }}>
        <header style={{ marginBottom: '3rem' }}>
           <h2 style={{ fontSize: '2.5rem', color: 'var(--brand-dark)', fontWeight: '800' }}>
             Tu Bóveda, {userData.nombre.split(' ')[0]}
           </h2>
           <p style={{ color: 'var(--text-muted)' }}>Bienvenido a tu ecosistema financiero personal de BancoUM.</p>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '3rem' }}>
           
           {/* SECCION MIS CUENTAS */}
           <section>
              <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CreditCard size={20} className="icon-gold"/> Tus Productos Activos
              </h3>
              
              {loading ? (
                <p>Cargando encriptación...</p>
              ) : cuentas.length === 0 ? (
                <div style={{ padding: '2rem', background: 'white', borderRadius: '16px', textAlign: 'center', border: '1px solid var(--border)' }}>
                   No tienes cuentas activas. Solicita tu apertura en ventanilla.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                   {cuentas.map(c => (
                     <div key={c.id} style={{ 
                        background: 'linear-gradient(135deg, var(--brand-dark), #1A2421)', 
                        padding: '2rem', borderRadius: '20px', color: 'white', position: 'relative', overflow: 'hidden',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.15)'
                      }}>
                        {/* Glow Effect */}
                        <div style={{ position: 'absolute', top: '-50%', right: '-50%', width:'200px', height:'200px', background:'var(--accent-color)', opacity:'0.1', filter:'blur(40px)', borderRadius:'50%' }}></div>
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                           <span style={{ fontSize: '0.9rem', opacity: '0.7', letterSpacing: '2px' }}>CUENTA NUM: {c.numero_cuenta}</span>
                           <span style={{ color: 'var(--accent-color)', fontWeight: 'bold' }}>ACTIVA</span>
                        </div>
                        <h4 style={{ fontSize: '1rem', opacity: '0.8', marginBottom: '0.5rem', fontWeight:'500' }}>Saldo Disponible</h4>
                        <div style={{ fontSize: '2.8rem', fontWeight: '800', letterSpacing:'-1px' }}>
                           ${parseFloat(c.saldo).toLocaleString()} <span style={{fontSize:'1rem', opacity:'0.5'}}>USD</span>
                        </div>
                     </div>
                   ))}
                </div>
              )}
           </section>

           {/* SECCION TRANSFERENCIAS SQL */}
           <section>
               <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                 <Send size={20} className="icon-gold"/> Enviar Dinero (Transacción SQL)
               </h3>

               <div style={{ background: 'white', padding: '2.5rem', borderRadius: '24px', boxShadow: '0 10px 40px rgba(0,0,0,0.04)' }}>
                  {txStatus.state === 'error' && (
                     <div className="auth-alert" style={{ display:'flex', gap:'0.5rem', alignItems:'center', textAlign:'left' }}>
                        <ShieldAlert size={20}/> {txStatus.msg}
                     </div>
                  )}
                  {txStatus.state === 'success' && (
                     <div className="status-badge" style={{ padding:'1rem', marginBottom:'1.5rem', display:'flex', gap:'0.5rem', alignItems:'center', fontSize:'0.9rem' }}>
                        <CheckCircle size={20}/> {txStatus.msg}
                     </div>
                  )}

                  <form onSubmit={handleTransfer}>
                     <div className="form-group-gold">
                        <label>Selecciona tu cuenta origen</label>
                        <select value={origenId} onChange={e => setOrigenId(e.target.value)} required>
                           <option value="">(Selecciona una cuenta)</option>
                           {cuentas.map(c => (
                              <option key={c.id} value={c.id}>
                                Cuenta {c.numero_cuenta} (Saldo: ${c.saldo})
                              </option>
                           ))}
                        </select>
                     </div>

                     <div className="form-group-gold">
                        <label>ID Cuenta Destino</label>
                        <input 
                          type="number" placeholder="Ej. 104" 
                          value={destinoId} onChange={e => setDestinoId(e.target.value)} required
                        />
                     </div>

                     <div className="form-group-gold">
                        <label>Monto a transferir (USD)</label>
                        <input 
                          type="number" step="0.01" min="1" placeholder="Ej. 50000" 
                          value={monto} onChange={e => setMonto(e.target.value)} required
                        />
                     </div>

                     <button type="submit" className="btn-brand-gold width-100" style={{marginTop:'1.5rem', justifyContent:'center'}} disabled={txStatus.state === 'loading'}>
                        {txStatus.state === 'loading' ? 'Procesando ACID...' : 'Autorizar Transferencia Mágica'}
                     </button>
                  </form>
               </div>
           </section>

        </div>
      </main>
    </div>
  );
}
