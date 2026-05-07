import React, { useState } from 'react';
import { Lock, Mail, ArrowLeft, ShieldCheck, Key } from 'lucide-react';

export default function Login({ onLogin, onBack, onGoRegister }) {
  const [mode, setMode] = useState('login'); // 'login' | 'forgot_email' | 'forgot_code'
  
  // Login states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [failedAttempts, setFailedAttempts] = useState(0);

  // Forgot password states
  const [resetOtp, setResetOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    
    if (failedAttempts >= 3) {
      setErrorMsg('Acceso bloqueado por exceso de intentos fallidos. Contacte a soporte.');
      return;
    }
    
    // Simulación de "Authentication Wall" para proteger el Dashboard real
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

  const handleForgotEmailSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const resp = await fetch('/api/clientes/forgot-password-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || 'Error al solicitar el código.');
      
      setSuccessMsg(data.message);
      setMode('forgot_code');
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const resp = await fetch('/api/clientes/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: resetOtp, nueva_contrasena: newPassword })
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || 'Error al restablecer contraseña.');
      
      setSuccessMsg('Contraseña actualizada con éxito en la base de datos. Ya puedes iniciar sesión.');
      setMode('login');
      setPassword('');
      setResetOtp('');
      setNewPassword('');
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <button className="auth-back-btn" onClick={() => {
          if (mode === 'login') onBack();
          else { setMode('login'); setErrorMsg(''); setSuccessMsg(''); }
        }}>
          <ArrowLeft size={20} /> {mode === 'login' ? 'Volver a Inicio' : 'Volver al Login'}
        </button>

        <div className="auth-header">
          <div className="auth-icon-gold">
             <ShieldCheck size={36} />
          </div>
          <h2>Bóveda de Acceso UM</h2>
          <p>
            {mode === 'login' ? 'Ingrese sus credenciales de administrador para acceder al ecosistema financiero.' : 
             mode === 'forgot_email' ? 'Recuperación de credenciales. Ingrese su correo electrónico.' :
             'Ingrese el código recibido y su nueva contraseña.'}
          </p>
        </div>

        {errorMsg && <div className="auth-alert">{errorMsg}</div>}
        {successMsg && <div className="auth-alert" style={{ background: '#e8f5e9', color: '#2e7d32', borderLeft: '4px solid #2e7d32' }}>{successMsg}</div>}

        {mode === 'login' && (
          <form onSubmit={handleLoginSubmit} className="auth-form">
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

            <div style={{ textAlign: 'center', marginTop: '1rem' }}>
              <button type="button" onClick={() => { setMode('forgot_email'); setErrorMsg(''); setSuccessMsg(''); }} className="link-gold-btn" style={{ fontSize: '0.9rem' }}>
                ¿Olvidaste tu contraseña?
              </button>
            </div>
          </form>
        )}

        {mode === 'forgot_email' && (
          <form onSubmit={handleForgotEmailSubmit} className="auth-form">
            <div className="form-group-gold">
              <label>Correo Electrónico</label>
              <div className="input-with-icon">
                 <Mail size={18} className="input-icon" />
                 <input 
                   type="email" 
                   value={email}
                   onChange={(e) => setEmail(e.target.value)}
                   placeholder="Ingresa tu correo" 
                   required 
                 />
              </div>
            </div>
            
            <button type="submit" className="btn-brand-gold width-100" style={{justifyContent: 'center', marginTop: '1rem'}}>
              Enviar Código de Recuperación
            </button>
          </form>
        )}

        {mode === 'forgot_code' && (
          <form onSubmit={handleResetPasswordSubmit} className="auth-form">
            <div className="form-group-gold">
              <label>Código de Verificación</label>
              <div className="input-with-icon">
                 <Key size={18} className="input-icon" />
                 <input 
                   type="text" 
                   value={resetOtp}
                   onChange={(e) => setResetOtp(e.target.value)}
                   placeholder="Ingresa el código de 6 dígitos" 
                   required 
                 />
              </div>
            </div>

            <div className="form-group-gold">
              <label>Nueva Contraseña</label>
              <div className="input-with-icon">
                 <Lock size={18} className="input-icon" />
                 <input 
                   type="password" 
                   value={newPassword}
                   onChange={(e) => setNewPassword(e.target.value)}
                   placeholder="Nueva contraseña" 
                   required 
                 />
              </div>
            </div>
            
            <button type="submit" className="btn-brand-gold width-100" style={{justifyContent: 'center', marginTop: '1rem'}}>
              Actualizar Contraseña
            </button>
          </form>
        )}

        {mode === 'login' && (
          <div className="auth-footer">
             <p>¿Aún no eres miembro del ecosistema? <br/><button onClick={onGoRegister} className="link-gold-btn">Aplica ahora para abrir tu primer producto</button></p>
          </div>
        )}
      </div>
    </div>
  );
}
