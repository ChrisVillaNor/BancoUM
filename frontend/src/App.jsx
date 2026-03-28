import React, { useState } from 'react';
import { Users, CreditCard, Activity, Database, LogOut } from 'lucide-react';
import ClientesManager from './components/ClientesManager';
import CuentasManager from './components/CuentasManager';
import MovimientosManager from './components/MovimientosManager';
import CatalogosManager from './components/CatalogosManager';
import LandingPage from './components/LandingPage';

function App() {
  const [view, setView] = useState('landing');
  const [activeTab, setActiveTab] = useState('clientes');

  if (view === 'landing') {
    return <LandingPage onViewChange={setView} />;
  }

  return (
    <div className="app-container">
      <aside className="sidebar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', cursor: 'pointer' }} onClick={() => setView('landing')}>
          <div style={{ backgroundColor: 'var(--brand-dark)', color: 'white', padding: '6px', borderRadius: '6px' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22v-7l-2-2"></path><path d="m17 8-5-5-5 5"></path><path d="M12 15V3"></path></svg>
          </div>
          <h1 style={{ color: 'var(--brand-dark)', margin: 0 }}>BancoUM</h1>
        </div>
        
        <nav className="nav-links">
          <a className={`nav-link ${activeTab === 'clientes' ? 'active' : ''}`} onClick={() => setActiveTab('clientes')}>
            <Users size={18} /> Clientes
          </a>
          <a className={`nav-link ${activeTab === 'cuentas' ? 'active' : ''}`} onClick={() => setActiveTab('cuentas')}>
            <CreditCard size={18} /> Cuentas
          </a>
          <a className={`nav-link ${activeTab === 'movimientos' ? 'active' : ''}`} onClick={() => setActiveTab('movimientos')}>
            <Activity size={18} /> Movimientos
          </a>
          <a className={`nav-link ${activeTab === 'catalogos' ? 'active' : ''}`} onClick={() => setActiveTab('catalogos')}>
            <Database size={18} /> Catálogos Base
          </a>
        </nav>

        <div style={{ marginTop: 'auto' }}>
          <a className="nav-link" style={{ color: '#d32f2f' }} onClick={() => setView('landing')}>
            <LogOut size={18} /> Salir (Inicio)
          </a>
        </div>
      </aside>

      <main className="main-content">
        {activeTab === 'clientes' && <ClientesManager />}
        {activeTab === 'cuentas' && <CuentasManager />}
        {activeTab === 'movimientos' && <MovimientosManager />}
        {activeTab === 'catalogos' && <CatalogosManager />}
      </main>
    </div>
  );
}

export default App;
