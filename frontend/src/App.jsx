import React, { useState } from 'react';
import { Users, CreditCard, Activity, Database, LogOut } from 'lucide-react';
import ClientesManager from './components/ClientesManager';
import CuentasManager from './components/CuentasManager';
import MovimientosManager from './components/MovimientosManager';
import CatalogosManager from './components/CatalogosManager';

function App() {
  const [activeTab, setActiveTab] = useState('clientes');

  return (
    <div className="app-container">
      <aside className="sidebar">
        <div>
          <h1>Banco UM</h1>
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
          <a className="nav-link" style={{ color: '#d32f2f' }}>
            <LogOut size={18} /> Salir
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
