import React, { useState, useEffect } from 'react';
import Header from './Header';
import Footer from './Footer';
import settingsService from '../../services/settingsService';
import SEO from '../../components/SEO';

const LegalPage = ({ type, title }) => {
  const [content, setContent] = useState('Loading content...');

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await settingsService.getSettings();
        const data = (response && response.success && response.data) ? response.data : response;
        if (data?.legalPages?.[type]) {
          setContent(data.legalPages[type]);
        } else {
          setContent('Content is currently being updated. Please check back later.');
        }
      } catch (err) {
        setContent('Failed to load content.');
      }
    };
    fetchSettings();
  }, [type]);

  return (
    <div className="legal-page-container">
      <SEO title={title} description={`${title} for Sortify Stays`} />
      <Header />
      <main className="container py-5 mt-5" style={{ minHeight: '60vh' }}>
        <h1 className="mb-4 fw-bold">{title}</h1>
        <div className="bg-white p-4 p-md-5 rounded-4 shadow-sm border" style={{ whiteSpace: 'pre-wrap', lineHeight: '1.7', color: '#475569' }}>
          {content}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default LegalPage;
