import React from 'react';
import { ShieldAlert, Fingerprint, Banknote, Sparkles, Building2, Smartphone, ArrowRight, Check, Zap } from 'lucide-react';

export default function LandingPage({ onViewChange }) {
  return (
    <div className="landing-container">
      {/* NAVBAR: Elegante, fondos limpios */}
      <nav className="landing-navbar">
        <div className="landing-logo">
          <div className="landing-logo-icon">
             <Building2 size={24} />
          </div>
          BancoUM
        </div>
        <div className="landing-nav-links">
          <a className="landing-nav-link" href="#inicio">La Bóveda</a>
          <a className="landing-nav-link" href="#productos">Portafolio</a>
          <a className="landing-nav-link" href="#nosotros">Sede Virtual</a>
        </div>
        <div className="landing-actions">
           {/* El botón Iniciar sesión es ahora sutil dorado */}
          <button className="landing-nav-link btn-text-gold" onClick={() => onViewChange('login')}>
            Acceso Clientes
          </button>
          <button className="btn-brand-gold" onClick={() => onViewChange('register')}>
            Únete a UM
          </button>
        </div>
      </nav>

      {/* HERO SECTION: Fuerte identidad Beige/Arena */}
      <header className="hero-section" id="inicio">
        <div className="hero-content">
          <div className="hero-badge">
             <Sparkles size={14} className="icon-gold" /> Excelencia Financiera Universitaria
          </div>
          <h1 className="hero-title">
            Construimos el <span>respaldo absoluto</span> de tus grandes ideas.
          </h1>
          <p className="hero-subtitle">
            Banco UM no es una simple caja fuerte; es un ecosistema financiero inteligente, transparente y diseñado sin letra pequeña. Protegemos tu esfuerzo hoy para multiplicar tus oportunidades de mañana.
          </p>
          <div className="hero-buttons">
            <button className="btn-brand-gold" onClick={() => onViewChange('register')}>
               Descubrir la bóveda <ArrowRight size={18} style={{marginLeft: '8px'}} />
            </button>
          </div>
        </div>

        {/* VIP GLASS CARD: Completamente distinto al verde original */}
        <div className="hero-visual">
          <div className="css-vip-card">
            {/* Efecto de cristal detrás de la tarjeta */}
            <div className="css-vip-glow"></div>
            
            <div className="vip-card-top">
               <span className="vip-card-logo"><Building2 size={20}/> BancoUM</span>
               <div className="vip-card-type">PLATINUM</div>
            </div>
            
            <div className="vip-card-middle">
               <div className="vip-chip"></div>
               <div className="vip-contactless">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 13a10 10 0 0 1 14 0"/><path d="M8.5 16.5a5 5 0 0 1 7 0"/><path d="M2 8.82a15 15 0 0 1 20 0"/></svg>
               </div>
            </div>
            
            <div className="vip-card-number">
               <span>1048</span>
               <span>3492</span>
               <span>••••</span>
               <span>UM24</span>
            </div>
            
            <div className="vip-card-bottom">
               <div className="vip-user">
                  <small>MIEMBRO EXCLUSIVO</small>
                  <strong>NUEVO SOCIO UM</strong>
               </div>
               <div className="vip-date">
                  <small>VALID THRU</small>
                  <strong>∞ / ∞</strong>
               </div>
            </div>
          </div>
        </div>
      </header>

      {/* PRODUCTS GRID: Fondo blanco o beige con los Toques Dorados de UM */}
      <section className="products-section" id="productos">
        <div className="products-header">
           <h2>Portafolio UM de Alto Valor</h2>
           <p>Herramientas financieras sofisticadas disfrazadas de simplicidad absoluta. Elige el motor que impulsará tu capital.</p>
        </div>
        
        <div className="products-grid">
          {/* Fondo UM Crecimiento */}
          <div className="product-card-gold">
            <div className="product-icon-box bg-gold-light">
              <Banknote size={26} className="icon-gold-solid"/>
            </div>
            <h3>Fondo UM Crecimiento</h3>
            <p>Tu dinero no duerme. Mantén liquidez total mientras tus ahorros generan rendimientos diarios. Cero comisiones ocultas.</p>
            <ul className="product-features">
              <li><Check size={18} className="icon-gold" /> Rentabilidad automática</li>
              <li><Check size={18} className="icon-gold" /> Exento de cuotas de sostenimiento</li>
              <li><Check size={18} className="icon-gold" /> Disposición inmediata 24/7</li>
            </ul>
          </div>
          
          {/* Tarjeta Black UM */}
          <div className="product-card-gold">
            <div className="product-icon-box bg-dark-light">
               <Fingerprint size={26} className="icon-dark-solid"/>
            </div>
            <h3>Crédito Black UM</h3>
            <p>La llave maestra para tus proyectos. Un cupo rotativo inteligente que aprende de tus hábitos y recompensa tu lealtad.</p>
            <ul className="product-features">
              <li><Check size={18} className="icon-gold" /> Tasa preferencial para comunidad UM</li>
              <li><Check size={18} className="icon-gold" /> Casillero virtual en el extranjero</li>
              <li><Check size={18} className="icon-gold" /> Control de tope mediante App</li>
            </ul>
          </div>

          {/* Ecosistema Total */}
          <div className="product-card-gold featured-card">
            <div className="featured-badge">Más Elegido</div>
            <div className="product-icon-box bg-white">
               <Smartphone size={26} className="icon-gold-solid"/>
            </div>
            <h3 style={{color: 'white'}}>Ecosistema UM Total</h3>
            <p style={{color: 'rgba(255,255,255,0.8)'}}>Fusionamos la liquidez del fondo de ahorros con el músculo financiero de la tarjeta Black. Todo en un solo panel de control.</p>
            <ul className="product-features featured-list">
              <li><Check size={18} color="white" /> Sin cobros entre cuentas UM</li>
              <li><Check size={18} color="white" /> Aprobación instantánea en 5 mins</li>
              <li><Check size={18} color="white" /> Asesoría humana prioritaria</li>
            </ul>
          </div>
        </div>
      </section>

      {/* UNIQUE BENEFITS */}
      <section className="benefits-section-gold" id="nosotros">
         <h2>El ADN de BancoUM</h2>
         <div className="benefits-wrapper">
            <div className="benefit-gold-card">
               <ShieldAlert size={34} strokeWidth={1.5} className="icon-gold" />
               <h4>Bóveda Encriptada</h4>
               <p>Tu paz mental no es negociable. Monitoreo por IA que paraliza fraudes antes de que sucedan.</p>
            </div>
            <div className="benefit-gold-card">
               <Zap size={34} strokeWidth={1.5} className="icon-gold" />
               <h4>Cero Burocracia</h4>
               <p>Las filas son cosa del pasado. Autoriza tus transbordos de capital desde un toque en tu pantalla.</p>
            </div>
         </div>
      </section>

      {/* FOOTER EXCLUSIVO UM (Adiós 4 columnas genéricas) */}
      <footer className="landing-footer-gold">
         <div className="footer-gold-content">
            <div className="footer-main-brand">
               <div className="footer-brand-title">
                 <Building2 size={28} /> BancoUM
               </div>
               <p className="mission-statement">
                 No es lo que guardas, es lo que construyes. BancoUM se erige como el primer nodo financiero diseñado para acompañarte hasta la cima.
               </p>
            </div>
            
            <div className="footer-links-gold">
               <div className="footer-col-gold">
                  <h4>Sede Principal</h4>
                  <p>Campus Universidad</p>
                  <p>Torre de Innovación, Piso 12</p>
                  <p>Abierto: Lun - Vie (8am - 6pm)</p>
               </div>
               <div className="footer-col-gold">
                  <h4>Línea Dorada</h4>
                  <p style={{fontWeight:'bold'}}>01 8000 BANCOUM</p>
                  <p>consultas@bancoum.edu</p>
                  <p>Atención continua y humana</p>
               </div>
            </div>
         </div>
         
         <div className="footer-bottom-gold">
            &copy; {new Date().getFullYear()} BancoUM Corporativo. Privacidad de Datos y Respaldo Fiduciario garantizado.
         </div>
      </footer>
    </div>
  );
}
