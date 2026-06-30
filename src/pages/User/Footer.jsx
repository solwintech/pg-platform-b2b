import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';
import settingsService from '../../services/settingsService';
import LegalModal from '../../components/modals/LegalModal';
import logo from '../../assets/logo-white.png';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [legalData, setLegalData] = useState(null);
  const [modalState, setModalState] = useState({ show: false, title: '', content: '' });
  
  const [socialLinks, setSocialLinks] = useState([
    { id: 'facebook', icon: 'fab fa-facebook-f', name: 'Facebook', url: 'https://facebook.com', color: '#1877f2' },
    { id: 'twitter', icon: 'fab fa-twitter', name: 'Twitter', url: 'https://twitter.com', color: '#1da1f2' },
    { id: 'instagram', icon: 'fab fa-instagram', name: 'Instagram', url: 'https://instagram.com', color: '#e4405f' },
    { id: 'linkedin', icon: 'fab fa-linkedin-in', name: 'LinkedIn', url: 'https://linkedin.com', color: '#0077b5' },
    { id: 'youtube', icon: 'fab fa-youtube', name: 'YouTube', url: 'https://youtube.com', color: '#ff0000' }
  ]);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await settingsService.getSettings();
        const data = (response && response.success && response.data) ? response.data : response;
        
        if (data) {
          if (data.legalPages) {
            setLegalData(data.legalPages);
          }
          if (data.socialLinks) {
            setSocialLinks(prevLinks => prevLinks.map(link => ({
              ...link,
              url: data.socialLinks[link.id] || link.url
            })));
          }
        }
      } catch (err) {
        console.error("Failed to load settings:", err);
      }
    };
    fetchSettings();
  }, []);

  const openLegalModal = (title, key) => {
    const content = legalData ? legalData[key] : 'Loading content...';
    setModalState({ show: true, title, content });
  };

  const exploreLinks = [
    { path: '/listings', label: 'PGs in Bangalore' },
    { path: '/listings', label: 'Hostels in Delhi' },
    { path: '/listings', label: 'Home Stays in Mumbai' },
    { path: '/listings', label: 'PGs in Pune' },
    { path: '/listings', label: 'Hostels in Hyderabad' }
  ];

  const supportLinks = [
    { label: 'About Us', path: '/about-us' },
    // { label: 'Contact Support', path: '/contact' },
    { label: 'Privacy Policy', path: '/privacy-policy' },
    { label: 'Terms of Service', path: '/terms-of-service' },
  ];

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (newsletterEmail) {
      alert(`Thanks for subscribing with ${newsletterEmail}! You'll receive updates soon.`);
      setNewsletterEmail('');
    } else {
      alert('Please enter your email address');
    }
  };

  return (
    <footer className="footer-modern ">
      
      <div className="footer-links-section pt-5 pb-4 mt-4">
        <Container>
          <Row className="g-5">
            <Col lg={4} md={12}>
              <div className="footer-brand mb-4">
                <div className="mb-3">
                  <img src={logo} alt="Sortify Stays Logo" height="55" style={{ objectFit: 'contain' }} />
                </div>
              </div>
              <p className="text-footer-desc mb-4">
                Sortify Stays connects tenants to verified PG accommodations and Hostels across India. We ensure safety, proper amenities, and transparent pricing to give you peace of mind when looking for your home away from home.
              </p>
              
              <div className="contact-pills d-flex flex-column gap-3">
                <div className="contact-pill d-flex align-items-center bg-dark bg-opacity-25 p-2 px-3 rounded-pill" style={{maxWidth: 'fit-content'}}>
                  <div className="icon-circle bg-orange me-3"><i className="fas fa-phone-alt"></i></div>
                  <div>
                    <small className="d-block text-muted" style={{lineHeight: 1}}>Toll Free Support</small>
                    <strong className="text-white">+91 1800-123-4567</strong>
                  </div>
                </div>
              </div>
            </Col>

            <Col lg={3} md={6}>
              <h5 className="footer-col-title text-white">Explore Cities</h5>
              <div className="fancy-divider mb-4"></div>
              <ul className="modern-link-list list-unstyled">
                {exploreLinks.map((link, index) => (
                  <li key={index}>
                    <Link to={link.path}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </Col>

            <Col lg={2} md={6}>
              <h5 className="footer-col-title text-white">Support</h5>
              <div className="fancy-divider mb-4"></div>
              <ul className="modern-link-list list-unstyled">
                {supportLinks.map((link, index) => (
                  <li key={index}>
                    <Link to={link.path}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </Col>

            <Col lg={3} md={12}>
              <h5 className="footer-col-title text-white">Follow Us</h5>
              <div className="fancy-divider mb-4"></div>
              <p className="text-footer-desc mb-3">
                Join our community and follow our latest properties!
              </p>
              <div className="social-grid">
                {socialLinks.map((social, index) => (
                  <a 
                    key={index}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="modern-social-btn"
                    title={social.name}
                    style={{'--hover-color': social.color}}
                  >
                    <i className={social.icon}></i>
                  </a>
                ))}
              </div>
            </Col>
          </Row>
        </Container>
      </div>

      {/* Deep Footer Bottom */}
      <div className="footer-deep-bottom py-3">
        <Container>
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-center text-center">
            <p className="mb-0 text-muted small">
              &copy; {currentYear} Sortify Stays Ltd. All rights reserved.
            </p>
            <div className="small text-muted mt-2 mt-md-0 d-flex gap-3">
               <span>Designed for a better stay experience.</span>
            </div>
          </div>
        </Container>
      </div>

      <LegalModal 
        show={modalState.show} 
        onHide={() => setModalState({ ...modalState, show: false })} 
        title={modalState.title} 
        content={modalState.content} 
      />
    </footer>
  );
};

export default Footer;