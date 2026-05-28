import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Form, Button, InputGroup } from 'react-bootstrap';
import logo from '../../assets/logo-white.png';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [newsletterEmail, setNewsletterEmail] = useState('');

  const exploreLinks = [
    { path: '/listings', label: 'PGs in Bangalore' },
    { path: '/listings', label: 'Hostels in Delhi' },
    { path: '/listings', label: 'Home Stays in Mumbai' },
    { path: '/listings', label: 'PGs in Pune' },
    { path: '/listings', label: 'Hostels in Hyderabad' }
  ];

  const supportLinks = [
    { label: 'About Us', action: () => alert('Coming soon!') },
    { label: 'Contact Support', action: () => alert('Coming soon!') },
    { label: 'Privacy Policy', action: () => alert('Coming soon!') },
    { label: 'Terms of Service', action: () => alert('Coming soon!') },
    { label: 'List your Property', action: () => alert('Coming soon!') }
  ];

  const socialLinks = [
    { icon: 'fab fa-facebook-f', name: 'Facebook', url: 'https://facebook.com', color: '#1877f2' },
    { icon: 'fab fa-twitter', name: 'Twitter', url: 'https://twitter.com', color: '#1da1f2' },
    { icon: 'fab fa-instagram', name: 'Instagram', url: 'https://instagram.com', color: '#e4405f' },
    { icon: 'fab fa-linkedin-in', name: 'LinkedIn', url: 'https://linkedin.com', color: '#0077b5' },
    { icon: 'fab fa-youtube', name: 'YouTube', url: 'https://youtube.com', color: '#ff0000' }
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
    <footer className="footer-modern mt-1">
      <div className="footer-top-accent"></div>
      
      {/* Top Banner (App Download & Newsletter) */}
      <div className="footer-cta-bar">
        <Container>
          <Row className="align-items-center justify-content-between g-4">
            <Col lg={6}>
              <div className="d-flex flex-column flex-sm-row align-items-center gap-3">
                <div className="app-icon">
                  <i className="fas fa-mobile-alt"></i>
                </div>
                <div className="app-text text-center text-sm-start">
                  <h4 className="mb-1">Get the StayNest App</h4>
                  <p className="mb-0">Find your next home directly from your phone</p>
                </div>
                <div className="d-flex gap-2 ms-sm-auto mt-3 mt-sm-0">
                  <button className="store-badge border-0 rounded">
                    <i className="fab fa-apple fs-4"></i>
                    <div className="text-start ms-2">
                      <small style={{fontSize: '0.6rem', display: 'block', lineHeight: 1}}>Download on the</small>
                      <strong style={{fontSize: '0.9rem', lineHeight: 1}}>App Store</strong>
                    </div>
                  </button>
                  <button className="store-badge border-0 rounded">
                    <i className="fab fa-google-play fs-4"></i>
                    <div className="text-start ms-2">
                      <small style={{fontSize: '0.6rem', display: 'block', lineHeight: 1}}>GET IT ON</small>
                      <strong style={{fontSize: '0.9rem', lineHeight: 1}}>Google Play</strong>
                    </div>
                  </button>
                </div>
              </div>
            </Col>
            
            <Col lg={5}>
              <div className="newsletter-box">
                <Form onSubmit={handleNewsletterSubmit} className="d-flex align-items-center w-100 bg-white rounded-pill p-1 shadow-sm">
                  <i className="fas fa-envelope text-muted ms-3 me-2"></i>
                  <Form.Control
                    type="email"
                    placeholder="Subscribe to our newsletter..."
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    className="border-0 shadow-none bg-transparent"
                  />
                  <Button type="submit" className="newsletter-btn-modern rounded-pill px-4">
                    Subscribe
                  </Button>
                </Form>
              </div>
            </Col>
          </Row>
        </Container>
      </div>

      {/* Main Footer Links */}
      <div className="footer-links-section py-5">
        <Container>
          <Row className="g-5">
            <Col lg={4} md={12}>
              <div className="footer-brand mb-4">
                <div className="mb-3">
                  <img src={logo} alt="StayNest Logo" height="55" style={{ objectFit: 'contain' }} />
                </div>
              </div>
              <p className="text-footer-desc mb-4">
                StayNest connects tenants to verified PG accommodations and Hostels across India. We ensure safety, proper amenities, and transparent pricing to give you peace of mind when looking for your home away from home.
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
                    <a href="#" onClick={(e) => { e.preventDefault(); link.action(); }}>
                      {link.label}
                    </a>
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
              &copy; {currentYear} StayNest Ltd. All rights reserved.
            </p>
            <div className="small text-muted mt-2 mt-md-0 d-flex gap-3">
               <span>Designed for a better stay experience.</span>
            </div>
          </div>
        </Container>
      </div>
    </footer>
  );
};

export default Footer;