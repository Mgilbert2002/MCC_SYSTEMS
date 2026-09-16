import { useEffect, useState } from 'react'

export const Footer = () => {
  const [time, setTime] = useState(new Date().toLocaleTimeString())

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date().toLocaleTimeString())
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <footer id="footer" className="app-footer">
      <div className="footer-content">
        <div className="footer-section footer-brand">
          <h4>MCC System</h4>
          <p className="footer-description">
            Milk Collection Center Management System, A comprehensive solution for managing milk collection,
            quality testing, processing, and distribution operations.
          </p>
          <div className="social-links">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="social-link-item">
              <i className="fab fa-facebook-f"></i> Facebook
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="social-link-item">
              <i className="fab fa-twitter"></i> Twitter
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="social-link-item">
              <i className="fab fa-instagram"></i> Instagram
            </a>
            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="social-link-item">
              <i className="fab fa-youtube"></i> YouTube
            </a>
          </div>
        </div>

        <div className="footer-section">
          <h4>Quick Links</h4>
          <ul className="footer-links">
            <li><a href="#home">Home</a></li>
            <li><a href="/about">About Us</a></li>
            <li><a href="/">Quality Standards</a></li>
            <li><a href="/">Sustainability</a></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>Our Services</h4>
          <ul className="footer-links">
            <li><a href="/">Milk Reception</a></li>
            <li><a href="/">Quality Control</a></li>
            <li><a href="/">Processing & Packaging</a></li>
            <li><a href="/">Distribution & Sales</a></li>
            <li><a href="/">Farmer Support</a></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>Support</h4>
          <ul className="footer-links">
            <li><a href="/">Help Center</a></li>
            <li><a href="/">Contact Us</a></li>
            <li><a href="/">Report an Issue</a></li>
            <li><a href="/">Feedback</a></li>
          </ul>
        </div>

        <div className="footer-section footer-contact">
          <h4>Contact Us</h4>
          <div className="contact-item">
            <i className="fas fa-map-marker-alt"></i>
            <span>Kigali,Rwanda</span>
          </div>
          <div className="contact-item">
            <i className="fas fa-phone"></i>
            <span>+250798849526</span>
          </div>
          <div className="contact-item">
            <i className="fas fa-envelope"></i>
            <span>info@mcc.rw</span>
          </div>
          <div className="contact-item">
            <i className="fas fa-clock"></i>
            <span>Current Time: {time}</span>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="footer-bottom-content">
          <p className="copyright">&copy; 2026 MCC System. All rights reserved.</p>
          <div className="footer-bottom-links">
            <a href="/">Privacy Policy</a>
            <a href="/">Terms of Service</a>
            <a href="/">Cookie Policy</a>
            <a href="/">Sitemap</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
