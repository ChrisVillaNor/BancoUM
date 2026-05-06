import React, { useState, useEffect } from 'react';
import { CreditCard, Send, Activity, User, LogOut, ShieldAlert, CheckCircle, Plus, Clock, Trash2 } from 'lucide-react';
import ChatNL2SQL from './ChatNL2SQL';

export default function ClientDashboard({ userData, onLogout }) {
  const [cuentas, setCuentas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newProductType, setNewProductType] = useState('1');
  const [newPocketAlias, setNewPocketAlias] = useState('');
  // Tabs: 'inicio', 'transferir'
  const [activeTab, setActiveTab] = useState('inicio');

  // Formulario Transferencias
  const [origenId, setOrigenId] = useState('');
  const [destinoId, setDestinoId] = useState('');
  const [monto, setMonto] = useState('');
  const [txStatus, setTxStatus] = useState({ state: 'idle', msg: '' });

  // Perfil
  const [profileData, setProfileData] = useState(null);
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    telefono: '',
    direccion: '',
    comuna: '',
    email: '',
    currentPassword: ''
  });
  const [profileStatus, setProfileStatus] = useState({ state: 'idle', msg: '' });

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

  const loadProfile = async () => {
    try {
      const resp = await fetch(`/api/clientes/${userData.id}`);
      const data = await resp.json();
      if (resp.ok) {
        setProfileData(data);
        setProfileForm({
          telefono: data.telefono || '',
          direccion: data.direccion || '',
          comuna: data.comuna || '',
          email: data.email || '',
          currentPassword: ''
        });
      }
    } catch (e) {
      console.error('Error loading profile:', e);
    }
  };

  useEffect(() => {
    loadCuentas();
    loadProfile();
  }, [userData]);

  const handleCreateAccount = async () => {
    setCreating(true);
    try {
      const randomAccountNum = Math.floor(1000000000 + Math.random() * 9000000000).toString();
      const resp = await fetch('/api/cuentas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usuario_id: userData.id,
          tipo_cuenta_id: parseInt(newProductType), 
          numero_cuenta: randomAccountNum,
          saldo: 0, 
          cupo_total: 0,
          alias: newProductType === '4' ? newPocketAlias : null
        })
      });
      if (resp.ok) {
        setNewPocketAlias('');
        await loadCuentas();
      } else {
        alert("Error al abrir la cuenta");
      }
    } catch (e) {
      console.error("Error creating account:", e);
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteAccount = async (id) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este producto?')) return;
    try {
      const resp = await fetch(`/api/cuentas/${id}`, { method: 'DELETE' });
      if (resp.ok) {
        await loadCuentas();
      } else {
        const data = await resp.json();
        alert(data.error || "Error al eliminar la cuenta");
      }
    } catch (e) {
      console.error("Error deleting account:", e);
    }
  };

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
          tipo_movimiento_id: 1 
        })
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || 'Error transaccional.');
      
      setTxStatus({ state: 'success', msg: '¡Transferencia Completada con Éxito!' });
      setDestinoId(''); setMonto('');
      loadCuentas(); 
      setTimeout(() => {
         setTxStatus({ state: 'idle', msg: '' });
         setActiveTab('inicio');
      }, 3000);
      
    } catch (err) {
      setTxStatus({ state: 'error', msg: err.message });
      setTimeout(() => setTxStatus({ state: 'idle', msg: '' }), 5000);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setProfileStatus({ state: 'loading', msg: 'Verificando credenciales y actualizando...' });
    try {
      const resp = await fetch(`/api/clientes/${userData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileForm)
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || 'Error al actualizar.');
      
      setProfileData(data);
      setProfileStatus({ state: 'success', msg: '¡Perfil actualizado correctamente!' });
      setEditingProfile(false);
      setProfileForm({ ...profileForm, currentPassword: '' });
      setTimeout(() => setProfileStatus({ state: 'idle', msg: '' }), 4000);
    } catch (err) {
      setProfileStatus({ state: 'error', msg: err.message });
      setTimeout(() => setProfileStatus({ state: 'idle', msg: '' }), 5000);
    }
  };


  return (
    <div style={{ background: '#f8f9fa', minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: 'system-ui, sans-serif' }}>
      
      {/* NAVBAR SUPERIOR MEJOR DISTRIBUIDO */}
      <nav style={{ 
          background: 'var(--brand-dark)', 
          padding: '1rem 5%', 
          display: 'grid', 
          gridTemplateColumns: '1fr auto 1fr', 
          alignItems: 'center', 
          color: 'white',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          position: 'sticky',
          top: 0,
          zIndex: 100
      }}>
        {/* Lado Izquierdo: Logo */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
           <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '800', letterSpacing: '-0.5px' }}>
              <span style={{ background: 'white', color: 'var(--brand-dark)', padding: '4px 8px', borderRadius: '8px', marginRight: '8px' }}>UM</span>
              BancoUM
           </h1>
        </div>
           
        {/* Centro: Navegación */}
        <div style={{ display: 'flex', gap: '2.5rem', justifyContent: 'center' }}>
           <button onClick={() => setActiveTab('inicio')} style={{ 
              background: 'none', border: 'none', color: activeTab === 'inicio' ? 'white' : 'rgba(255,255,255,0.6)', 
              cursor: 'pointer', fontSize: '1rem', fontWeight: activeTab === 'inicio' ? '600' : '400',
              borderBottom: activeTab === 'inicio' ? '2px solid var(--accent-color)' : '2px solid transparent',
              paddingBottom: '0.4rem', transition: 'all 0.2s'
           }}>
              Mis Productos
           </button>
           <button onClick={() => setActiveTab('bolsillos')} style={{ 
              background: 'none', border: 'none', color: activeTab === 'bolsillos' ? 'white' : 'rgba(255,255,255,0.6)', 
              cursor: 'pointer', fontSize: '1rem', fontWeight: activeTab === 'bolsillos' ? '600' : '400',
              borderBottom: activeTab === 'bolsillos' ? '2px solid var(--accent-color)' : '2px solid transparent',
              paddingBottom: '0.4rem', transition: 'all 0.2s'
           }}>
              Bolsillos
           </button>
           <button onClick={() => setActiveTab('transferir')} style={{ 
              background: 'none', border: 'none', color: activeTab === 'transferir' ? 'white' : 'rgba(255,255,255,0.6)', 
              cursor: 'pointer', fontSize: '1rem', fontWeight: activeTab === 'transferir' ? '600' : '400',
              borderBottom: activeTab === 'transferir' ? '2px solid var(--accent-color)' : '2px solid transparent',
              paddingBottom: '0.4rem', transition: 'all 0.2s'
           }}>
              Transferencias
           </button>
           <button onClick={() => setActiveTab('retiros')} style={{ 
              background: 'none', border: 'none', color: activeTab === 'retiros' ? 'white' : 'rgba(255,255,255,0.6)', 
              cursor: 'pointer', fontSize: '1rem', fontWeight: activeTab === 'retiros' ? '600' : '400',
              borderBottom: activeTab === 'retiros' ? '2px solid var(--accent-color)' : '2px solid transparent',
              paddingBottom: '0.4rem', transition: 'all 0.2s'
           }}>
              Retiros
           </button>
           <button onClick={() => setActiveTab('perfil')} style={{ 
              background: 'none', border: 'none', color: activeTab === 'perfil' ? 'white' : 'rgba(255,255,255,0.6)', 
              cursor: 'pointer', fontSize: '1rem', fontWeight: activeTab === 'perfil' ? '600' : '400',
              borderBottom: activeTab === 'perfil' ? '2px solid var(--accent-color)' : '2px solid transparent',
              paddingBottom: '0.4rem', transition: 'all 0.2s'
           }}>
              Mi Perfil
           </button>
        </div>

        {/* Lado Derecho: Usuario */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', justifyContent: 'flex-end' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.1)', padding: '0.4rem 1rem', borderRadius: '20px' }}>
             <User size={16} /> <span style={{ fontSize: '0.9rem', fontWeight: '500' }}>{userData.nombre.split(' ')[0]}</span>
          </div>
          <button style={{ 
             background:'none', border:'none', color: '#ff8a80', cursor:'pointer', 
             display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem', fontWeight: '500' 
          }} onClick={onLogout}>
            <LogOut size={16} /> Salir
          </button>
        </div>
      </nav>

      {/* CONTENIDO PRINCIPAL */}
      <main style={{ padding: '3rem 5%', flex: 1, maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
        
        {/* ENCABEZADO DE BIENVENIDA */}
        <header style={{ marginBottom: '2.5rem' }}>
           <h2 style={{ fontSize: '2.2rem', color: '#1f2937', fontWeight: '700', marginBottom: '0.5rem' }}>
             Hola, {userData.nombre.split(' ')[0]} 👋
           </h2>
           <p style={{ color: '#6b7280', fontSize: '1.1rem' }}>Bienvenido de vuelta a BancoUM</p>
        </header>

                 {activeTab === 'inicio' && (
            <div style={{ maxWidth: '600px' }}>
               {loading ? (
                 <p>Cargando tus productos...</p>
               ) : (
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    {cuentas.filter(c => c.tipo_cuenta_id !== 4).length === 0 && (
                      <div style={{ padding: '2.5rem', background: 'white', borderRadius: '20px', textAlign: 'center', border: '1px solid #e5e7eb' }}>
                         <div style={{ background: '#f3f4f6', padding: '1rem', borderRadius: '50%', display: 'inline-block', marginBottom: '1rem' }}>
                           <CreditCard size={40} color="#9ca3af" />
                         </div>
                         <h4 style={{ fontSize: '1.2rem', color: '#1f2937', fontWeight: 'bold' }}>Aún no tienes cuentas</h4>
                         <p style={{ color: '#6b7280', fontSize: '0.95rem', margin: '1rem 0 2rem' }}>Abre tu primera cuenta ahora mismo.</p>
                      </div>
                    )}
                    
                    {cuentas.filter(c => c.tipo_cuenta_id !== 4).map(c => (
                      <div key={c.id}>
                          {/* TARJETA TIPO BANCO */}
                          <div style={{ 
                             background: c.tipo_cuenta_id === 2 ? '#1e3a8a' : '#455048',
                             borderRadius: '24px', 
                             padding: '2.5rem 2rem', 
                             color: 'white', 
                             boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                             position: 'relative',
                             marginBottom: '1rem'
                           }}>
                             <button 
                               onClick={() => handleDeleteAccount(c.id)}
                               style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'rgba(255,0,0,0.2)', border: 'none', color: '#ff8a80', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: '0.2s' }}
                               title="Eliminar Producto"
                             >
                               <Trash2 size={18} />
                             </button>
                             <div style={{ fontSize: '0.85rem', fontWeight: '600', letterSpacing: '1px', opacity: 0.9, marginBottom: '0.5rem', textTransform: 'uppercase' }}>
                                {c.tipo_cuenta_id === 2 ? 'Cuenta Corriente' : 'Cuenta de Ahorros'}
                             </div>
                             <div style={{ fontSize: '1.1rem', letterSpacing: '2px', opacity: 0.9, marginBottom: '2.5rem', fontFamily: 'monospace' }}>
                                N° {c.numero_cuenta}
                             </div>
                             
                             <div style={{ fontSize: '0.8rem', fontWeight: '600', opacity: 0.8, marginBottom: '0.3rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                Saldo Disponible
                             </div>
                             <div style={{ fontSize: '3rem', fontWeight: '700', letterSpacing: '-1px' }}>
                                ${parseFloat(c.saldo).toLocaleString('es-CO')}
                             </div>
                          </div>
                      </div>
                    ))}

                    {/* Formulario para agregar nuevo producto */}
                    <div style={{ padding: '2rem', background: 'white', borderRadius: '24px', border: '1px dashed #d1d5db', textAlign: 'center' }}>
                       <h4 style={{ fontSize: '1.1rem', color: '#374151', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                         <Plus size={18}/> Abrir Nuevo Producto
                       </h4>
                       <div style={{ display: 'flex', gap: '1rem', flexDirection: 'column', alignItems: 'center' }}>
                          <select 
                            value={newProductType} 
                            onChange={(e) => setNewProductType(e.target.value)}
                            style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid #d1d5db', width: '100%', maxWidth: '300px' }}
                          >
                            <option value="1">Cuenta de Ahorros</option>
                            <option value="2">Cuenta Corriente</option>
                          </select>

                          <button onClick={handleCreateAccount} disabled={creating} className="btn-brand-gold" style={{ width: '100%', maxWidth: '300px', justifyContent: 'center' }}>
                            {creating ? 'Abriendo...' : 'Confirmar Apertura'}
                          </button>
                       </div>
                    </div>
                 </div>
               )}
            </div>
         )}

         {/* PESTAÑA DE BOLSILLOS */}
         {activeTab === 'bolsillos' && (
            <div style={{ maxWidth: '600px' }}>
               {loading ? (
                 <p>Cargando tus bolsillos...</p>
               ) : (
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    {cuentas.filter(c => c.tipo_cuenta_id === 4).length === 0 && (
                      <div style={{ padding: '2.5rem', background: 'white', borderRadius: '20px', textAlign: 'center', border: '1px solid #e5e7eb' }}>
                         <div style={{ background: '#fef3c7', padding: '1rem', borderRadius: '50%', display: 'inline-block', marginBottom: '1rem' }}>
                           <CreditCard size={40} color="#d97706" />
                         </div>
                         <h4 style={{ fontSize: '1.2rem', color: '#1f2937', fontWeight: 'bold' }}>Aún no tienes bolsillos</h4>
                         <p style={{ color: '#6b7280', fontSize: '0.95rem', margin: '1rem 0 2rem' }}>Crea un bolsillo para separar tu dinero.</p>
                      </div>
                    )}
                    
                    {cuentas.filter(c => c.tipo_cuenta_id === 4).map(c => (
                      <div key={c.id}>
                          {/* TARJETA TIPO BANCO */}
                          <div style={{ 
                             background: '#b45309', 
                             borderRadius: '24px', 
                             padding: '2.5rem 2rem', 
                             color: 'white', 
                             boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                             position: 'relative',
                             marginBottom: '1rem'
                           }}>
                             <button 
                               onClick={() => handleDeleteAccount(c.id)}
                               style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'rgba(255,0,0,0.2)', border: 'none', color: '#ff8a80', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: '0.2s' }}
                               title="Eliminar Bolsillo"
                             >
                               <Trash2 size={18} />
                             </button>
                             <div style={{ fontSize: '0.85rem', fontWeight: '600', letterSpacing: '1px', opacity: 0.9, marginBottom: '0.5rem', textTransform: 'uppercase' }}>
                                Bolsillo: {c.alias || 'Ahorro'}
                             </div>
                             <div style={{ fontSize: '1.1rem', letterSpacing: '2px', opacity: 0.9, marginBottom: '2.5rem', fontFamily: 'monospace' }}>
                                Ahorro Seguro
                             </div>
                             
                             <div style={{ fontSize: '0.8rem', fontWeight: '600', opacity: 0.8, marginBottom: '0.3rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                Dinero Guardado
                             </div>
                             <div style={{ fontSize: '3rem', fontWeight: '700', letterSpacing: '-1px' }}>
                                ${parseFloat(c.saldo).toLocaleString('es-CO')}
                             </div>
                          </div>
                      </div>
                    ))}

                    {/* Formulario para agregar nuevo bolsillo */}
                    <div style={{ padding: '2rem', background: 'white', borderRadius: '24px', border: '1px dashed #d1d5db', textAlign: 'center' }}>
                       <h4 style={{ fontSize: '1.1rem', color: '#374151', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                         <Plus size={18}/> Crear Nuevo Bolsillo
                       </h4>
                       <div style={{ display: 'flex', gap: '1rem', flexDirection: 'column', alignItems: 'center' }}>
                          <input 
                            type="text" 
                            placeholder="Nombre del Bolsillo (Ej. Viaje)" 
                            value={newPocketAlias}
                            onChange={(e) => setNewPocketAlias(e.target.value)}
                            style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid #d1d5db', width: '100%', maxWidth: '300px' }}
                            required
                          />
                          <button onClick={() => { setNewProductType('4'); setTimeout(() => handleCreateAccount(), 10); }} disabled={creating || !newPocketAlias.trim()} className="btn-brand-gold" style={{ width: '100%', maxWidth: '300px', justifyContent: 'center' }}>
                            {creating ? 'Creando...' : 'Confirmar Creación'}
                          </button>
                       </div>
                    </div>
                 </div>
               )}
            </div>
         )}

         {/* PESTAÑA DE TRANSFERENCIAS */}
        {activeTab === 'transferir' && (
           <section style={{ maxWidth: '600px' }}>
               <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#1f2937' }}>
                 <Send size={20} color="var(--accent-color)"/> Realizar Transferencia
               </h3>

               <div style={{ background: 'white', padding: '2.5rem', borderRadius: '24px', border: '1px solid #e5e7eb', boxShadow: '0 10px 30px rgba(0,0,0,0.03)' }}>
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
                        <label>Cuenta de Origen</label>
                        <select value={origenId} onChange={e => { setOrigenId(e.target.value); setDestinoId(''); }} required style={{ background: '#f9fafb' }}>
                           <option value="">(Selecciona una cuenta)</option>
                           {cuentas.map(c => (
                              <option key={c.id} value={c.id}>
                                {c.tipo_cuenta_id === 4 ? `Bolsillo: ${c.alias}` : `Cuenta **${c.numero_cuenta.slice(-4)}`} (Saldo: ${parseFloat(c.saldo).toLocaleString()})
                              </option>
                           ))}
                        </select>
                     </div>

                     <div className="form-group-gold">
                        <label>Cuenta Destino</label>
                        {cuentas.find(c => c.id.toString() === origenId)?.tipo_cuenta_id === 4 ? (
                           <select value={destinoId} onChange={e => setDestinoId(e.target.value)} required style={{ background: '#f9fafb' }}>
                              <option value="">(Selecciona tu cuenta destino)</option>
                              {cuentas.filter(c => c.tipo_cuenta_id !== 4).map(c => (
                                 <option key={c.id} value={c.id}>
                                   Mi Cuenta {c.tipo_cuenta_id === 2 ? 'Corriente' : 'Ahorros'} **{c.numero_cuenta.slice(-4)}
                                 </option>
                              ))}
                           </select>
                        ) : (
                           <div style={{ display: 'flex', gap: '0.5rem', flexDirection: 'column' }}>
                              <select value={destinoId} onChange={e => setDestinoId(e.target.value)} style={{ background: '#f9fafb' }}>
                                 <option value="">(Escribe el número de la cuenta destino abajo)</option>
                                 {cuentas.filter(c => c.id.toString() !== origenId).map(c => (
                                    <option key={c.id} value={c.id}>
                                      Mi Producto: {c.tipo_cuenta_id === 4 ? `Bolsillo ${c.alias}` : `Cuenta **${c.numero_cuenta.slice(-4)}`}
                                    </option>
                                 ))}
                              </select>
                              <input 
                                type="text" placeholder="O escribe el ID/Número de cuenta externo" 
                                value={destinoId} onChange={e => setDestinoId(e.target.value)} required
                                style={{ background: '#f9fafb' }}
                              />
                           </div>
                        )}
                     </div>

                     <div className="form-group-gold">
                        <label>Monto a transferir (COP)</label>
                        <input 
                          type="number" step="0.01" min="1" placeholder="Ej. 50000" 
                          value={monto} onChange={e => setMonto(e.target.value)} required
                          style={{ background: '#f9fafb' }}
                        />
                     </div>

                     <button type="submit" className="btn-brand-gold width-100" style={{marginTop:'1.5rem', justifyContent:'center', padding: '1rem'}} disabled={txStatus.state === 'loading'}>
                        {txStatus.state === 'loading' ? 'Procesando...' : 'Autorizar Transferencia'}
                     </button>
                  </form>
               </div>
           </section>
        )}

        {/* PESTAÑA DE RETIROS */}
        {activeTab === 'retiros' && (
           <section style={{ maxWidth: '600px' }}>
               <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#1f2937' }}>
                 <CreditCard size={20} color="var(--accent-color)"/> Retiro de Efectivo sin Tarjeta
               </h3>
               <div style={{ background: 'white', padding: '2.5rem', borderRadius: '24px', border: '1px solid #e5e7eb', boxShadow: '0 10px 30px rgba(0,0,0,0.03)', textAlign: 'center' }}>
                  <div style={{ background: '#f3f4f6', padding: '1rem', borderRadius: '50%', display: 'inline-block', marginBottom: '1rem' }}>
                     <Clock size={40} color="#9ca3af" />
                  </div>
                  <h4 style={{ fontSize: '1.2rem', color: '#1f2937', fontWeight: 'bold' }}>Función Próximamente</h4>
                  <p style={{ color: '#6b7280', fontSize: '0.95rem', margin: '1rem 0' }}>La red de cajeros automáticos UM está en mantenimiento. Muy pronto podrás generar códigos de retiro sin tarjeta desde aquí.</p>
               </div>
           </section>
        )}

        {/* PESTAÑA DE PERFIL */}
        {activeTab === 'perfil' && (
           <section style={{ maxWidth: '600px' }}>
               <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#1f2937' }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <User size={20} color="var(--accent-color)"/> Información Personal
                 </div>
                 {!editingProfile && (
                    <button onClick={() => setEditingProfile(true)} className="link-gold-btn" style={{ fontSize: '0.9rem' }}>
                       Editar Datos
                    </button>
                 )}
               </h3>

               {profileStatus.state === 'error' && (
                  <div className="auth-alert" style={{ display:'flex', gap:'0.5rem', alignItems:'center', textAlign:'left', marginBottom: '1rem' }}>
                     <ShieldAlert size={20}/> {profileStatus.msg}
                  </div>
               )}
               {profileStatus.state === 'success' && (
                  <div className="status-badge" style={{ padding:'1rem', marginBottom:'1rem', display:'flex', gap:'0.5rem', alignItems:'center', fontSize:'0.9rem' }}>
                     <CheckCircle size={20}/> {profileStatus.msg}
                  </div>
               )}

               <div style={{ background: 'white', padding: '2.5rem', borderRadius: '24px', border: '1px solid #e5e7eb', boxShadow: '0 10px 30px rgba(0,0,0,0.03)' }}>
                  {editingProfile ? (
                     <form onSubmit={handleProfileUpdate} style={{ display: 'grid', gap: '1.5rem' }}>
                        <div className="form-group-gold">
                           <label>Teléfono</label>
                           <input type="text" value={profileForm.telefono} onChange={e => setProfileForm({...profileForm, telefono: e.target.value})} />
                        </div>
                        <div className="form-group-gold">
                           <label>Dirección</label>
                           <input type="text" value={profileForm.direccion} onChange={e => setProfileForm({...profileForm, direccion: e.target.value})} />
                        </div>
                        <div className="form-group-gold">
                           <label>Comuna</label>
                           <input type="text" value={profileForm.comuna} onChange={e => setProfileForm({...profileForm, comuna: e.target.value})} />
                        </div>
                        <div className="form-group-gold">
                           <label>Correo Electrónico</label>
                           <input type="email" value={profileForm.email} onChange={e => setProfileForm({...profileForm, email: e.target.value})} />
                        </div>
                        
                        <div style={{ background: '#fffbeb', padding: '1.5rem', borderRadius: '12px', border: '1px solid #fde68a', marginTop: '1rem' }}>
                           <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#b45309', marginBottom: '1rem', fontSize: '1rem' }}>
                              <ShieldAlert size={18}/> Verificación de Seguridad
                           </h4>
                           <div className="form-group-gold">
                              <label>Contraseña (Tu cédula para confirmar)</label>
                              <input type="password" required value={profileForm.currentPassword} onChange={e => setProfileForm({...profileForm, currentPassword: e.target.value})} placeholder="••••••••" style={{ background: 'white' }}/>
                           </div>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                           <button type="button" onClick={() => { setEditingProfile(false); setProfileForm({...profileForm, currentPassword: ''}); }} style={{ flex: 1, padding: '1rem', borderRadius: '12px', border: '1px solid #d1d5db', background: 'transparent', cursor: 'pointer' }}>
                              Cancelar
                           </button>
                           <button type="submit" disabled={profileStatus.state === 'loading'} className="btn-brand-gold" style={{ flex: 1, justifyContent: 'center' }}>
                              {profileStatus.state === 'loading' ? 'Guardando...' : 'Guardar Cambios'}
                           </button>
                        </div>
                     </form>
                  ) : (
                     <div style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: '1fr 1fr' }}>
                        <div style={{ gridColumn: 'span 2' }}>
                           <div style={{ fontSize: '0.85rem', color: '#6b7280', fontWeight: '600', marginBottom: '0.3rem' }}>NOMBRE COMPLETO</div>
                           <div style={{ fontSize: '1.1rem', color: '#1f2937', fontWeight: '500' }}>{profileData?.nombre || userData.nombre} {profileData?.apellido || userData.apellido || ''}</div>
                        </div>
                        <div>
                           <div style={{ fontSize: '0.85rem', color: '#6b7280', fontWeight: '600', marginBottom: '0.3rem' }}>CORREO ELECTRÓNICO</div>
                           <div style={{ fontSize: '1.1rem', color: '#1f2937', fontWeight: '500' }}>{profileData?.email || userData.email}</div>
                        </div>
                        <div>
                           <div style={{ fontSize: '0.85rem', color: '#6b7280', fontWeight: '600', marginBottom: '0.3rem' }}>CÉDULA / ID</div>
                           <div style={{ fontSize: '1.1rem', color: '#1f2937', fontWeight: '500' }}>{profileData?.numero_documento || userData.cedula || userData.numero_documento || 'No registrado'}</div>
                        </div>
                        <div>
                           <div style={{ fontSize: '0.85rem', color: '#6b7280', fontWeight: '600', marginBottom: '0.3rem' }}>TELÉFONO</div>
                           <div style={{ fontSize: '1.1rem', color: '#1f2937', fontWeight: '500' }}>{profileData?.telefono || 'No registrado'}</div>
                        </div>
                        <div>
                           <div style={{ fontSize: '0.85rem', color: '#6b7280', fontWeight: '600', marginBottom: '0.3rem' }}>DIRECCIÓN</div>
                           <div style={{ fontSize: '1.1rem', color: '#1f2937', fontWeight: '500' }}>{profileData?.direccion || 'No registrada'}</div>
                        </div>
                        <div>
                           <div style={{ fontSize: '0.85rem', color: '#6b7280', fontWeight: '600', marginBottom: '0.3rem' }}>COMUNA</div>
                           <div style={{ fontSize: '1.1rem', color: '#1f2937', fontWeight: '500' }}>{profileData?.comuna || 'No registrada'}</div>
                        </div>
                        <div>
                           <div style={{ fontSize: '0.85rem', color: '#6b7280', fontWeight: '600', marginBottom: '0.3rem' }}>FECHA NACIMIENTO</div>
                           <div style={{ fontSize: '1.1rem', color: '#1f2937', fontWeight: '500' }}>
                             {profileData?.fecha_nacimiento ? new Date(profileData.fecha_nacimiento).toLocaleDateString() : 'No registrada'}
                           </div>
                        </div>
                        <div style={{ gridColumn: 'span 2', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #f3f4f6' }}>
                           <div style={{ fontSize: '0.85rem', color: '#6b7280', fontWeight: '600', marginBottom: '0.3rem' }}>ESTADO DE CUENTA</div>
                           <div style={{ fontSize: '1.1rem', color: 'var(--success)', fontWeight: 'bold' }}>ACTIVO Y VERIFICADO</div>
                        </div>
                     </div>
                  )}
               </div>
           </section>
        )}
        
        {/* Floating Chat Widget */}
        <ChatNL2SQL userData={userData} />
      </main>
    </div>
  );
}
