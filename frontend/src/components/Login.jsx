import React, { useState } from 'react';
import { Lock, Mail, ArrowLeft, ShieldCheck } from 'lucide-react';

export default function Login({ onLogin, onBack, onGoRegister }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [failedAttempts, setFailedAttempts] = useState(0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    
    if (failedAttempts >= 3) {
      setErrorMsg('Acceso bloqueado por exceso de intentos fallidos. Contacte a soporte.');
      return;
    }
    
    // Simulación de "Authentication Wall" para proteger el Dashboard real
    // Solo permitiremos paso al Administrador Master en la presentación:
    if (email === 'admin@bancoum.edu' && password === 'admin123') {
      setFailedAttempts(0); // Reset on success
      onLogin({ role: 'admin', nombre: 'Admin Master' }); // Entra al ecosistema VIP (Dashboard)
      return;
    }

    // SI NO ES ADMIN, tratar de loguear como Cliente Normal de PostgreSQL
    try {
      const resp = await fetch('/api/clientes/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, contrasena: password })
      });
      const data = await resp.json();
      if (!resp.ok) {
        throw new Error(data.error || 'Credenciales inválidas.');
      }
      setFailedAttempts(0); // Reset on success
      onLogin(data.user); // data.user trae id, nombre, email, role: 'client'
    } catch(err) {
      const newAttempts = failedAttempts + 1;
      setFailedAttempts(newAttempts);
      if (newAttempts >= 3) {
        setErrorMsg('Acceso bloqueado por exceso de intentos fallidos. Contacte a soporte.');
      } else {
        setErrorMsg(`${err.message} (Intentos restantes: ${3 - newAttempts})`);
      }
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
            <label>Correo Electrónico</label>
            <div className="input-with-icon">
               <Mail size={18} className="input-icon" />
               <input 
                 type="email" 
                 value={email}
                 onChange={(e) => setEmail(e.target.value)}
                 placeholder="ejemplo@correo.com" 
                 required 
               />
            </div>
          </div>
          
          <div className="form-group-gold">
            <label>Contraseña</label>
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
