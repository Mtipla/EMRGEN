
import { Link } from 'react-router-dom'

export function Home() {
    return (
        <div className="home-page">
            <nav className="navbar">
                <a href="#inicio" className="nav-logo">
                    <span className="location-icon">📍</span>
                    EMERGEN
                </a>

                <a href="#como-funciona" className="nav-link">
                    ¿Cómo Funciona?
                </a>

                <a href="#descargar" className="nav-link">
                    Descargar App
                </a>

                <a href="#preguntas" className="nav-link">
                    Preguntas Frecuentes
                </a>

                <a href="#premium" className="nav-link">
                    Comprar Premium
                </a>

                <div className="nav-spacer"></div>

                <Link to="/login" className="login-button">
                    <span className="user-icon">👤</span>
                    Inicio Sesión
                </Link>
            </nav>

            {/* Contenido principal */}
            <main className="home-content" id="inicio">
                <h1 className="app-title">Emergen</h1>

                <section className="hero-section">
                    <article className="app-description">
                        <h2>Descripción de la App</h2>

                        <p>
                            Emergen es una aplicación diseñada para ayudarte
                            en situaciones de emergencia. Permite compartir
                            tu ubicación y enviar mensajes personalizados
                            a tus contactos de emergencia cuando más lo
                            necesitas.
                        </p>
                    </article>

                    {/* Espacio para una imagen o video */}
                    <div className="hero-image">
                        {/* Reemplaza este contenido por una imagen cuando
                            tengas el recurso disponible */}
                        <div className="image-placeholder">
                            <span>Imagen o video de Emergen</span>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}
