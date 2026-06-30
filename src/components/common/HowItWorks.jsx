import React from 'react';
import { Search, Layers, MessageCircle, Home, ArrowRight } from 'lucide-react';
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
    desc: 'Compare prices & amenities'
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
      <div className="how-it-works-row">
        {steps.map((step, idx) => (
          <React.Fragment key={idx}>
            <div className="how-it-works-step-card text-center">
              <div className="how-it-works-icon mx-auto mb-3" style={{ backgroundColor: step.bg, width: '64px', height: '64px' }}>
                {React.cloneElement(step.icon, { size: 32 })}
              </div>
              <h6 className="fw-bold mb-2" style={{ color: '#1e293b' }}>{step.title}</h6>
              <p className="text-muted mb-0" style={{ fontSize: '0.8rem', lineHeight: '1.4' }}>{step.desc}</p>
            </div>
            {idx < steps.length - 1 && (
              <div className="how-it-works-arrow d-flex align-items-center justify-content-center">
                <ArrowRight size={32} color="#cbd5e1" />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default HowItWorks;
