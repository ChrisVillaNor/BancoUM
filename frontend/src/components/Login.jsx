import React, { useState } from 'react';
import { Lock, Mail, ArrowLeft, ShieldCheck } from 'lucide-react';

export default function Login({ onLogin, onBack, onGoRegister }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');
    
    // Simulación de "Authentication Wall" para proteger el Dashboard real
    // Solo permitiremos paso al Administrador Master en la presentación:
    if (email === 'admin@bancoum.edu' && password === 'admin123') {
      onLogin(); // Entra al ecosistema VIP (Dashboard)
    } else {
      setErrorMsg('Credenciales inválidas. Acceso denegado a la bóveda.');
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <button className="auth-back-btn" onClick={onBack}>
          <ArrowLeft size={20} /> Volver a Inicio
        </button>

        <div className="auth-header">
          <div className="auth-icon-gold">
             <ShieldCheck size={36} />
          </div>
          <h2>Bóveda de Acceso UM</h2>
          <p>Ingrese sus credenciales de administrador para acceder al ecosistema financiero.</p>
        </div>

        {errorMsg && <div className="auth-alert">{errorMsg}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group-gold">
            <label>Correo Electrónico Institucional</label>
            <div className="input-with-icon">
               <Mail size={18} className="input-icon" />
               <input 
                 type="email" 
                 value={email}
                 onChange={(e) => setEmail(e.target.value)}
                 placeholder="admin@bancoum.edu" 
                 required 
               />
            </div>
          </div>
          
          <div className="form-group-gold">
            <label>Código de Seguridad</label>
            <div className="input-with-icon">
               <Lock size={18} className="input-icon" />
               <input 
                 type="password" 
                 value={password}
                 onChange={(e) => setPassword(e.target.value)}
                 placeholder="••••••••" 
                 required 
               />
            </div>
          </div>

          <button type="submit" className="btn-brand-gold width-100" style={{justifyContent: 'center', marginTop: '1rem'}}>
            Autenticar Identidad
          </button>
        </form>

        <div className="auth-footer">
           <p>¿Aún no eres miembro del ecosistema? <br/><button onClick={onGoRegister} className="link-gold-btn">Aplica ahora para abrir tu primer producto</button></p>
        </div>
      </div>
    </div>
  );
}
