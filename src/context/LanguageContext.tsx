import { createContext, useContext, useState } from 'react'
import type { ReactNode } from 'react'

type Language = 'en' | 'rw' | 'fr'

type LanguageContextType = {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const translations = {
  en: {
    home: 'Home',
    about: 'About Us',
    features: 'Features',
    statistics: 'Statistics',
    loginRegister: 'Login/Register',
    contact: 'Contact Us',
    english: 'English',
    kinyarwanda: 'Kinyarwanda',
    french: 'French',
    aboutUs: 'About Us',
    aboutSubtitle: 'MCC System',
    whoWeAre: 'Who We Are',
    ourMission: 'Our Mission',
    whatWeDo: 'What We Do',
    ourUsers: 'Our Users',
    whyChooseUs: 'Why Choose MCC System?',
    ourVision: 'Our Vision',
    contactUs: 'Contact Us'
  },
  rw: {
    home: 'Ahabanza',
    about: 'Ibidukikije',
    features: 'Ibice',
    statistics: 'Imibare',
    loginRegister: 'Ikwinjira/Kuyinjwa',
    contact: 'Twandikire',
    english: 'English',
    kinyarwanda: 'Ikinyarwanda',
    french: 'Ikifaransa',
    aboutUs: 'Ibidukikije',
    aboutSubtitle: 'Sisitemu ya MCC',
    whoWeAre: 'Turi Ba nde?',
    ourMission: 'Intego Yacu',
    whatWeDo: 'Icyo Dukora',
    ourUsers: 'Abakoresha Sisitemu Yacu',
    whyChooseUs: 'Kuki Muherereza Sisitemu ya MCC?',
    ourVision: 'Ijambo Ryo Kureba',
    contactUs: 'Twandikire'
  },
  fr: {
    home: 'Accueil',
    about: 'À Propos',
    features: 'Fonctionnalités',
    statistics: 'Statistiques',
    loginRegister: 'Connexion/Inscription',
    contact: 'Contact',
    english: 'Anglais',
    kinyarwanda: 'Kinyarwanda',
    french: 'Français',
    aboutUs: 'À Propos',
    aboutSubtitle: 'Système MCC',
    whoWeAre: 'Qui Sommes-Nous',
    ourMission: 'Notre Mission',
    whatWeDo: 'Ce Que Nous Faisons',
    ourUsers: 'Nos Utilisateurs',
    whyChooseUs: 'Pourquoi Choisir le Système MCC ?',
    ourVision: 'Notre Vision',
    contactUs: 'Contactez-Nous'
  }
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>('en')

  const t = (key: string) => {
    return translations[language][key as keyof typeof translations[typeof language]] || key
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export const useLanguage = () => {
  const context = useContext(LanguageContext)
  if (!context) throw new Error('useLanguage must be used within LanguageProvider')
  return context
}