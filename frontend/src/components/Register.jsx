import React, { useState } from 'react';
import { ArrowLeft, UserPlus, CheckCircle } from 'lucide-react';

export default function Register({ onBack, onSuccess, onGoLogin }) {
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    tipo_documento: 'CC',
    numero_documento: '',
    fecha_nacimiento: '',
    telefono: '',
    email: '',
    direccion: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      // Usamos el endpoint real para intentar insertar en la DB Neon
      const response = await fetch('/api/clientes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) {
        throw new Error('El documento o correo ya está registrado en nuestra bóveda.');
      }
      
      // Si salió bien
      setSuccess(true);
      // Tras 3 segundos enviarlo de vuelta:
      setTimeout(() => {
        onSuccess();
      }, 3000);

    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="auth-wrapper">
        <div className="auth-card text-center">
           <CheckCircle size={60} className="icon-gold" style={{margin:'0 auto 2rem'}}/>
           <h2>¡Bienvenido al Ecosistema UM!</h2>
           <p style={{marginTop: '1rem', color: 'var(--text-muted)'}}>
             Tu cuenta ha sido creada exitosamente. Redirigiendo a la pantalla de acceso...
           </p>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-wrapper">
      <div className="auth-card register-card">
        <button className="auth-back-btn" onClick={onBack}>
          <ArrowLeft size={20} /> Volver a Inicio
        </button>

        <div className="auth-header text-center">
          <div className="auth-icon-gold" style={{margin:'0 auto 1.5rem'}}>
             <UserPlus size={32} />
          </div>
          <h2>Conviértete en Socio UM</h2>
          <p>Llena tus datos para abrir tu Fondo Inteligente o solicitar una Tarjeta Black.</p>
        </div>

        {errorMsg && <div className="auth-alert">{errorMsg}</div>}

        <form onSubmit={handleSubmit} className="auth-form two-cols">
          <div className="form-group-gold">
            <label>Nombres</label>
            <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} required />
          </div>
          <div className="form-group-gold">
            <label>Apellidos</label>
            <input type="text" name="apellido" value={formData.apellido} onChange={handleChange} required />
          </div>
          
          <div className="form-group-gold">
            <label>Tipo Documento</label>
            <select name="tipo_documento" value={formData.tipo_documento} onChange={handleChange} required>
              <option value="CC">Cédula de Ciudadanía</option>
              <option value="CE">Cédula Extranjería</option>
              <option value="PAS">Pasaporte</option>
            </select>
          </div>
          <div className="form-group-gold">
            <label>N° Documento</label>
            <input type="text" name="numero_documento" value={formData.numero_documento} onChange={handleChange} required />
          </div>

          <div className="form-group-gold">
            <label>Fecha de Nacimiento</label>
            <input type="date" name="fecha_nacimiento" value={formData.fecha_nacimiento} onChange={handleChange} required />
          </div>
          <div className="form-group-gold">
            <label>Teléfono</label>
            <input type="text" name="telefono" value={formData.telefono} onChange={handleChange} required />
          </div>

          <div className="form-group-gold col-span-2">
            <label>Correo Electrónico</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} required />
          </div>
          
          <div className="form-group-gold col-span-2">
            <label>Dirección de Residencia</label>
            <input type="text" name="direccion" value={formData.direccion} onChange={handleChange} required />
          </div>

          <button type="submit" className="btn-brand-gold col-span-2" style={{justifyContent: 'center', marginTop: '1rem'}} disabled={loading}>
            {loading ? 'Procesando en Bóveda...' : 'Comenzar a Construir Futuro'}
          </button>
        </form>

        <div className="auth-footer text-center" style={{marginTop: '2rem'}}>
           <p>¿Ya eres parte de nosotros? <br/><button onClick={onGoLogin} className="link-gold-btn">Accede ahora a tus cuentas</button></p>
        </div>
      </div>
    </div>
  );
}
