import React from 'react';
import { Search, Layers, MessageCircle, Home } from 'lucide-react';
import './HowItWorks.css';

const steps = [
  {
    icon: <Search size={28} color="#f97316" />,
    bg: '#ffedd5',
    title: 'Search',
    desc: 'Find PGs/Hostels using smart filters'
  },
  {
    icon: <Layers size={28} color="#3b82f6" />,
    bg: '#dbeafe',
    title: 'Compare',
    desc: 'Compare prices, amenities & reviews'
  },
  {
    icon: <MessageCircle size={28} color="#f97316" />,
    bg: '#ffedd5',
    title: 'Connect',
    desc: 'Contact owners directly'
  },
  {
    icon: <Home size={28} color="#ef4444" />,
    bg: '#fee2e2',
    title: 'Move In',
    desc: 'Visit, book & move in easily'
  }
];

const HowItWorks = () => {
  return (
    <div className="how-it-works-section h-100 d-flex flex-column justify-content-center">
      <h3 className="how-it-works-title mb-4">How it Works?</h3>
      <div className="row g-3">
        {steps.map((step, idx) => (
          <div className="col-sm-6" key={idx}>
            <div className="d-flex align-items-center gap-3 p-3 rounded-4 transition-all h-100 how-it-works-card" style={{ background: '#f8fafc', border: '1px solid #f1f5f9' }}>
              <div className="how-it-works-icon flex-shrink-0" style={{ backgroundColor: step.bg, width: '56px', height: '56px' }}>
                {React.cloneElement(step.icon, { size: 24 })}
              </div>
              <div>
                <h6 className="fw-bold mb-1" style={{ color: '#1e293b' }}>{step.title}</h6>
                <p className="text-muted mb-0" style={{ fontSize: '0.85rem', lineHeight: '1.3' }}>{step.desc}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HowItWorks;
