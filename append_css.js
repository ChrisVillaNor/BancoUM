const fs = require('fs');

const css = `
/* ==============================================================
   ESTILOS DE AUTENTICACION Y SEGURIDAD (AUTH WALL)
   ============================================================== */
.auth-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: var(--sidebar-bg);
  background-image: radial-gradient(circle at 50% 50%, #fffbf2 0%, var(--border) 100%);
}

.auth-card {
  background: white;
  width: 100%;
  max-width: 450px;
  padding: 3rem 2.5rem;
  border-radius: 20px;
  box-shadow: 0 15px 40px rgba(0,0,0,0.06);
  border: 1px solid var(--border);
  position: relative;
}

.register-card {
  max-width: 700px; /* Registro ocupa 2 columnas */
}

.auth-back-btn {
  position: absolute;
  top: 1.5rem;
  left: 1.5rem;
  background: none;
  border: none;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-muted);
  cursor: pointer;
  font-weight: 500;
  font-size: 0.85rem;
  transition: color 0.2s;
}
.auth-back-btn:hover {
  color: var(--brand-dark);
}

.auth-icon-gold {
  display: inline-flex;
  background: linear-gradient(135deg, var(--accent-color), var(--accent-hover));
  color: white;
  padding: 1.2rem;
  border-radius: 16px;
  margin-bottom: 1.5rem;
  box-shadow: 0 10px 20px rgba(163, 127, 93, 0.2);
}

.auth-header {
  text-align: center;
  margin-bottom: 2rem;
  margin-top: 1rem;
}
.auth-header h2 {
  font-size: 1.8rem;
  font-weight: 800;
  color: var(--brand-dark);
  margin-bottom: 0.5rem;
}
.auth-header p {
  color: var(--text-muted);
  font-size: 0.95rem;
  line-height: 1.5;
}

.auth-alert {
  background-color: #ffebee;
  color: #c62828;
  padding: 1rem;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 500;
  margin-bottom: 1.5rem;
  text-align: center;
  border: 1px solid #ffcdd2;
}

.form-group-gold {
  margin-bottom: 1.5rem;
  text-align: left;
}
.form-group-gold label {
  display: block;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--brand-dark);
  margin-bottom: 0.5rem;
}

.input-with-icon {
  position: relative;
}
.input-with-icon .input-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-muted);
}
.input-with-icon input {
  padding-left: 3rem;
}

.two-cols {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0 1.5rem;
}
@media(min-width: 600px) {
  .two-cols { grid-template-columns: 1fr 1fr; }
}
.col-span-2 {
  grid-column: 1 / -1;
}

.width-100 { width: 100%; }

.link-gold-btn {
  background: none;
  border: none;
  color: var(--accent-hover);
  font-weight: 600;
  cursor: pointer;
  text-decoration: underline;
  margin-top: 0.5rem;
}
.link-gold-btn:hover {
  text-decoration: none;
}
`;

fs.appendFileSync('./frontend/src/index.css', css);
console.log("CSS appended.");
