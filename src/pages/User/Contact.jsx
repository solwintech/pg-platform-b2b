import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Accordion } from 'react-bootstrap';
import Header from './Header';
import Footer from './Footer';
import './Contact.css';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  
  const [formStatus, setFormStatus] = useState({
    submitted: false,
    loading: false,
    success: false,
    error: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormStatus({ ...formStatus, loading: true, submitted: true });
    
    // Simulate API call
    setTimeout(() => {
      console.log('Form submitted:', formData);
      setFormStatus({
        submitted: true,
        loading: false,
        success: true,
        error: ''
      });
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      });
      
      // Reset success message after 5 seconds
      setTimeout(() => {
        setFormStatus(prev => ({ ...prev, success: false, submitted: false }));
      }, 5000);
    }, 1500);
  };

  const contactInfo = [
    {
      icon: "fas fa-phone-alt",
      title: "Call Us",
      details: ["+91 98765 43210", "+91 98765 43211"]
    },
    {
      icon: "fas fa-envelope",
      title: "Email Us",
      details: ["contact@sortifystays.com", "sales@sortifystays.com"]
    },
    {
      icon: "fas fa-clock",
      title: "Working Hours",
      details: ["Monday - Friday: 9:00 AM - 8:00 PM", "Saturday: 10:00 AM - 6:00 PM", "Sunday: Closed"]
    }
  ];

  const faqs = [
    {
      question: "How do I list my property on StayNest?",
      answer: "Click on 'Post Property' button on the top right corner, fill in the property details, and our team will verify your listing within 24 hours."
    },
    {
      question: "Is there any brokerage fee?",
      answer: "No, StayNest is a zero-brokerage platform. We connect tenants directly with property owners."
    },
    {
      question: "How can I book a PG?",
      answer: "Browse through our listings, select your preferred PG, and click on 'Book Now'. You can also contact the owner directly through the provided contact details."
    },
    {
      question: "Are the listings verified?",
      answer: "Yes, all properties on StayNest go through a thorough verification process including document verification and site visits."
    },
    {
      question: "What is the minimum stay duration?",
      answer: "Minimum stay duration varies by property. Some offer daily rentals while others require 1-3 months commitment. Check individual property listings for details."
    }
  ];

  return (
    <div className="contact-page" style={{ fontSize: '0.9rem' }}>
      <Header />
      
      {/* Hero Section */}
      <section className="contact-hero">
        <Container>
          <Row className="justify-content-center text-center">
            <Col lg={8}>
              <h1 className="display-4 fw-bold mb-3">Get in Touch</h1>
              <p className="lead">We'd love to hear from you. Send us a message and we'll respond as soon as possible.</p>
            </Col>
          </Row>
        </Container>
      </section>

      <Container className="py-5">
        {/* Contact Content Grid */}
        <Row className="g-4 mt-2">
          {/* Left Column: Contact Info */}
          <Col lg={4} className="d-flex flex-column gap-3">
            {contactInfo.map((info, index) => (
              <Card key={index} className="h-100 text-start border-0 shadow-sm contact-info-card">
                <Card.Body className="p-4 d-flex align-items-center gap-4">
                  <div className="info-icon m-0 flex-shrink-0">
                    <i className={info.icon}></i>
                  </div>
                  <div>
                    <h3 className="h6 fw-bold mb-1">{info.title}</h3>
                    {info.details.map((detail, idx) => (
                      <p key={idx} className="text-muted mb-0" style={{ fontSize: '0.85rem' }}>{detail}</p>
                    ))}
                  </div>
                </Card.Body>
              </Card>
            ))}
          </Col>

          {/* Right Column: Form */}
          <Col lg={8}>
            <Card className="contact-form-card h-100">
              <Card.Body className="p-4 p-lg-5">
                <h2 className="h3 fw-bold mb-2">Send us a Message</h2>
                <p className="text-muted mb-4">Have questions? Fill out the form below and our team will get back to you within 24 hours.</p>
                
                {formStatus.success && (
                  <Alert variant="success" className="d-flex align-items-center gap-2">
                    <i className="fas fa-check-circle fs-5"></i>
                    <p className="mb-0">Thank you for contacting us! We'll get back to you soon.</p>
                  </Alert>
                )}
                
                <Form onSubmit={handleSubmit}>
                  <Row className="g-3">
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label className="fw-semibold">
                          <i className="fas fa-user contact-primary-text me-2"></i>Full Name *
                        </Form.Label>
                        <Form.Control
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          placeholder="Enter your full name"
                          className="py-2"
                        />
                      </Form.Group>
                    </Col>
                    
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label className="fw-semibold">
                          <i className="fas fa-envelope contact-primary-text me-2"></i>Email Address *
                        </Form.Label>
                        <Form.Control
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          placeholder="Enter your email"
                          className="py-2"
                        />
                      </Form.Group>
                    </Col>
                    
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label className="fw-semibold">
                          <i className="fas fa-phone contact-primary-text me-2"></i>Phone Number
                        </Form.Label>
                        <Form.Control
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="Enter your phone number"
                          className="py-2"
                        />
                      </Form.Group>
                    </Col>
                    
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label className="fw-semibold">
                          <i className="fas fa-tag contact-primary-text me-2"></i>Subject *
                        </Form.Label>
                        <Form.Control
                          type="text"
                          name="subject"
                          value={formData.subject}
                          onChange={handleChange}
                          required
                          placeholder="What is this regarding?"
                          className="py-2"
                        />
                      </Form.Group>
                    </Col>
                    
                    <Col xs={12}>
                      <Form.Group>
                        <Form.Label className="fw-semibold">
                          <i className="fas fa-comment contact-primary-text me-2"></i>Message *
                        </Form.Label>
                        <Form.Control
                          as="textarea"
                          name="message"
                          value={formData.message}
                          onChange={handleChange}
                          required
                          rows="3"
                          placeholder="Please provide details about your inquiry..."
                          className="py-2"
                        />
                      </Form.Group>
                    </Col>
                    
                    <Col xs={12}>
                      <Button 
                        type="submit" 
                        variant="light"
                        className="w-100 py-3 fw-semibold text-white submit-btn-orange"
                        disabled={formStatus.loading}
                      >
                        {formStatus.loading ? (
                          <>
                            <i className="fas fa-spinner fa-spin me-2"></i> Sending...
                          </>
                        ) : (
                          <>
                            <i className="fas fa-paper-plane me-2"></i> Send Message
                          </>
                        )}
                      </Button>
                    </Col>
                  </Row>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* FAQ Section */}
        <Row className="mt-5">
          <Col xs={12}>
            <div className="text-center mb-5">
              <h2 className="display-6 fw-bold mb-2">Frequently Asked Questions</h2>
              <p className="text-muted">Find quick answers to common questions about StayNest</p>
            </div>
          </Col>
        </Row>
        
        <Row className="g-4 justify-content-center">
          <Col lg={10}>
            <Accordion className="custom-accordion">
              {faqs.map((faq, index) => (
                <Accordion.Item key={index} eventKey={index.toString()} className="border-0 mb-3 shadow-sm faq-card overflow-hidden">
                  <Accordion.Header>
                    <div className="d-flex align-items-center gap-3 w-100">
                      <div className="icon-container" style={{ width: '35px', height: '35px', fontSize: '1rem' }}>
                        <i className="fas fa-question"></i>
                      </div>
                      <span className="fw-bold text-dark">{faq.question}</span>
                    </div>
                  </Accordion.Header>
                  <Accordion.Body className="text-muted bg-white border-top">
                    {faq.answer}
                  </Accordion.Body>
                </Accordion.Item>
              ))}
            </Accordion>
          </Col>
        </Row>


      </Container>
      
      <Footer />
    </div>
  );
};

export default ContactPage;