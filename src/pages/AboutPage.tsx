import { useEffect, useState } from 'react'
import { useLanguage } from '../context/LanguageContext'
import { Footer } from '../components/Footer'
import { Building2, Target, Settings2, Users, Star, Eye, Lightbulb, CheckCircle, ChevronRight } from 'lucide-react'
import './AboutPage.css'

export const AboutPage = () => {
  const { t } = useLanguage()
  const [activeSection, setActiveSection] = useState('')
  const [scrollProgress, setScrollProgress] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      setScrollProgress(docHeight > 0 ? (scrollTop / docHeight) * 100 : 0)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const sections = [
    { id: 'whoWeAre', key: 'whoWeAre', icon: Building2, label: 'Who We Are' },
    { id: 'ourMission', key: 'ourMission', icon: Target, label: 'Our Mission' },
    { id: 'whatWeDo', key: 'whatWeDo', icon: Settings2, label: 'What We Do' },
    { id: 'ourUsers', key: 'ourUsers', icon: Users, label: 'Our Users' },
    { id: 'whyChooseUs', key: 'whyChooseUs', icon: Star, label: 'Why Choose Us' },
    { id: 'ourVision', key: 'ourVision', icon: Eye, label: 'Our Vision' }
  ]

  return (
    <div className="page about-page">
      <div className="scroll-progress-bar" style={{ width: `${scrollProgress}%` }} />

      <div className="about-hero">
        <div className="container">
          <h1>{t('aboutUs') || 'AboutUs'}</h1>
          <p className="about-subtitle">{t('aboutSubtitle') || 'MCC System'}</p>
          <div className="hero-buttons">
            <a href="#whoWeAre" className="btn btn-primary">Learn More</a>
            <a href="#ourVision" className="btn btn-secondary">Our Vision</a>
          </div>
        </div>
      </div>

      <nav className="about-nav">
        <div className="container">
          {sections.map(section => {
            const Icon = section.icon
            return (
              <a
                key={section.id}
                href={`#${section.id}`}
                className={`about-nav-item ${activeSection === section.id ? 'active' : ''}`}
                onClick={() => setActiveSection(section.id)}
              >
                <Icon size={18} strokeWidth={2.5} />
                <span>{t(section.key) || section.label}</span>
              </a>
            )
          })}
        </div>
      </nav>

      <div className="container about-content-flex">
        <section id="whoWeAre" className="about-section fade-in">
          <div className="section-header">
            <div className="section-icon-wrapper">
              <Building2 size={32} strokeWidth={2} />
            </div>
            <h2>{t('whoWeAre') || 'Who We Are'}</h2>
          </div>
          <p className="lead-text">MCC System is a modern Milk Collection Center (MCC) Management System designed to digitize and improve milk collection, quality control, payment processing, product sales management, communication, and reporting activities within Milk Collection Centers.</p>
          <p>The system was developed to address the challenges faced by traditional paper-based management methods and to provide a secure, efficient, and reliable platform for managing dairy operations.</p>
          <div className="highlight-box">
            <Lightbulb size={24} />
            <span>Transforming dairy management through innovative technology</span>
          </div>
        </section>

        <section id="ourMission" className="about-section fade-in">
          <div className="section-header">
            <div className="section-icon-wrapper">
              <Target size={32} strokeWidth={2} />
            </div>
            <h2>{t('ourMission') || 'Our Mission'}</h2>
          </div>
          <p className="lead-text">To improve the efficiency, transparency, and productivity of Milk Collection Centers through innovative digital solutions that support farmers, operators, and managers.</p>
          <div className="mission-grid">
            <div className="mission-item">
              <CheckCircle size={22} />
              <span>Efficiency</span>
            </div>
            <div className="mission-item">
              <CheckCircle size={22} />
              <span>Transparency</span>
            </div>
            <div className="mission-item">
              <CheckCircle size={22} />
              <span>Productivity</span>
            </div>
          </div>
        </section>

        <section id="whatWeDo" className="about-section fade-in">
          <div className="section-header">
            <div className="section-icon-wrapper">
              <Settings2 size={32} strokeWidth={2} />
            </div>
            <h2>{t('whatWeDo') || 'What We Do'}</h2>
          </div>
          <p className="lead-text">The system provides a centralized platform for:</p>
          <div className="services-grid">
            {[
              'Milk reception and delivery recording',
              'Milk quality testing and monitoring',
              'Farmer management',
              'Payment processing and balance tracking',
              'Product sales management',
              'Milk tank monitoring',
              'Communication and announcements',
              'Automated reporting and analytics'
            ].map((service, idx) => (
              <div key={idx} className="service-card">
                <span className="service-number">{idx + 1}</span>
                <ChevronRight size={18} className="service-arrow" />
                <span>{service}</span>
              </div>
            ))}
          </div>
        </section>

        <section id="ourUsers" className="about-section fade-in">
          <div className="section-header">
            <div className="section-icon-wrapper">
              <Users size={32} strokeWidth={2} />
            </div>
            <h2>{t('ourUsers') || 'Our Users'}</h2>
          </div>
          <div className="user-roles">
            <div className="role-card" tabIndex={0}>
              <div className="role-icon">
                <Users size={40} strokeWidth={1.5} />
              </div>
              <h3>Farmers</h3>
              <ul>
                <li><CheckCircle size={16} /> View milk delivery records</li>
                <li><CheckCircle size={16} /> Track payments and balances</li>
                <li><CheckCircle size={16} /> Receive announcements</li>
                <li><CheckCircle size={16} /> Communicate with management</li>
              </ul>
            </div>

            <div className="role-card" tabIndex={0}>
              <div className="role-icon">
                <Settings2 size={40} strokeWidth={1.5} />
              </div>
              <h3>Operators</h3>
              <ul>
                <li><CheckCircle size={16} /> Register milk deliveries</li>
                <li><CheckCircle size={16} /> Perform quality testing</li>
                <li><CheckCircle size={16} /> Manage sales transactions</li>
                <li><CheckCircle size={16} /> Monitor milk storage tanks</li>
                <li><CheckCircle size={16} /> Generate operational reports</li>
              </ul>
            </div>

            <div className="role-card" tabIndex={0}>
              <div className="role-icon">
                <Target size={40} strokeWidth={1.5} />
              </div>
              <h3>Managers</h3>
              <ul>
                <li><CheckCircle size={16} /> Monitor center operations</li>
                <li><CheckCircle size={16} /> Process farmer payments</li>
                <li><CheckCircle size={16} /> Manage products and prices</li>
                <li><CheckCircle size={16} /> Manage users</li>
                <li><CheckCircle size={16} /> Generate reports and analytics</li>
                <li><CheckCircle size={16} /> Send announcements and notifications</li>
              </ul>
            </div>
          </div>
        </section>

        <section id="whyChooseUs" className="about-section fade-in">
          <div className="section-header">
            <div className="section-icon-wrapper">
              <Star size={32} strokeWidth={2} />
            </div>
            <h2>{t('whyChooseUs') || 'Why Choose Us?'}</h2>
          </div>
          <div className="features-grid">
            {[
              'Accurate milk recording and tracking',
              'Improved milk quality management',
              'Faster and transparent payment processing',
              'Reduced paperwork and manual errors',
              'Secure data management',
              'Better communication among stakeholders',
              'Real-time monitoring and reporting',
              'Scalable and user-friendly platform'
            ].map((feature, idx) => (
              <div key={idx} className="feature-item">
                <div className="feature-icon-circle">
                  <Star size={18} fill="white" />
                </div>
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </section>

        <section id="ourVision" className="about-section fade-in vision-section">
          <div className="section-header">
            <div className="section-icon-wrapper vision-icon-wrapper">
              <Eye size={32} strokeWidth={2} />
            </div>
            <h2>{t('ourVision') || 'Our Vision'}</h2>
          </div>
          <p className="lead-text">To become a leading digital solution for Milk Collection Centers by promoting efficient dairy management, data-driven decision-making, and sustainable agricultural development.</p>
          <div className="vision-stats">
            <div className="vision-stat">
              <span className="stat-number">100%</span>
              <span className="stat-label">Digital</span>
            </div>
            <div className="vision-stat">
              <span className="stat-number">24/7</span>
              <span className="stat-label">Support</span>
            </div>
            <div className="vision-stat">
              <span className="stat-number">∞</span>
              <span className="stat-label">Scalable</span>
            </div>
          </div>
        </section>

        <div className="about-footer-note">
          <p>Together, we are transforming milk collection management through technology.</p>
        </div>
      </div>
      <Footer />
    </div>
  )
}
