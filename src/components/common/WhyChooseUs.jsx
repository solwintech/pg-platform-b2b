import React from 'react';
import { ShieldCheck, Home, Lock, Headset } from 'lucide-react';
import './WhyChooseUs.css';

const features = [
  {
    icon: <ShieldCheck size={24} color="#10b981" />,
    bg: '#d1fae5',
    title: 'Verified Properties',
    desc: 'We verify every property for your safety.'
  },
  {
    icon: <Home size={24} color="#f59e0b" />,
    bg: '#fef3c7',
    title: 'No Brokerage',
    desc: 'Deal directly with owners. Save your money.'
  },
  {
    icon: <Lock size={24} color="#3b82f6" />,
    bg: '#dbeafe',
    title: 'Safe & Secure',
    desc: 'Your privacy and security are our priority.'
  },
  {
    icon: <Headset size={24} color="#10b981" />,
    bg: '#d1fae5',
    title: '24x7 Support',
    desc: 'We are here to help you anytime.'
  }
];

const WhyChooseUs = () => {
  return (
    <div className="why-choose-us-section">
      <div className="container">
        <h3 className="why-choose-title">Why Choose Sortify Stays?</h3>
        <div className="why-choose-card">
          {features.map((feature, idx) => (
            <div key={idx} className="why-choose-item">
              <div className="why-choose-icon" style={{ backgroundColor: feature.bg }}>
                {feature.icon}
              </div>
              <div className="why-choose-text">
                <h5 className="why-choose-item-title">{feature.title}</h5>
                <p className="why-choose-item-desc">{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WhyChooseUs;
