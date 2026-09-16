import { useState } from 'react'
import { useLanguage } from '../context/LanguageContext'

export const NavigationHeader = () => {
  const [menuOpen, setMenuOpen] = useState(false)
  const [langOpen, setLangOpen] = useState(false)
  const { setLanguage, t } = useLanguage()

  return (
    <header className="navigation-header">
      <div className="container navbar-container">
        <div className="logo">
          <img src="/system_image.png" alt="System Logo" />
        </div>
        <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
          <i className="fas fa-bars"></i>
        </button>
        <nav className={`nav-menu ${menuOpen ? 'open' : ''}`}>
          <a href="/#home">{t('home')}</a>
          <a href="/about">{t('about')}</a>
          <a href="/#features">{t('features')}</a>
          <a href="/#stats">{t('statistics')}</a>
          <a href="/#auth">{t('loginRegister')}</a>
          <a href="/#footer">{t('contact')}</a>
        </nav>
        <div className="user-info">
          <div className="language-selector">
            <button className="lang-toggle" onClick={() => setLangOpen(!langOpen)} aria-label="Toggle language">
              <i className="fas fa-globe"></i>
            </button>
            <div className={`lang-dropdown ${langOpen ? 'open' : ''}`}>
              <button onClick={() => setLanguage('en')}>{t('english')}</button>
              <button onClick={() => setLanguage('rw')}>{t('kinyarwanda')}</button>
              <button onClick={() => setLanguage('fr')}>{t('french')}</button>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
