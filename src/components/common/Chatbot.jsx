import React, { useState, useEffect, useRef } from 'react';
import './Chatbot.css';
import api from '../../services/api';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState([
    { sender: 'bot', text: 'Hi there! 👋 What are you looking for today?' }
  ]);
  const [inputValue, setInputValue] = useState('');
  
  const [formData, setFormData] = useState({
    type: '',
    location: '',
    name: '',
    mobile: ''
  });

  const [contactForm, setContactForm] = useState({
    name: '',
    mobile: ''
  });

  const chatEndRef = useRef(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory, step]);

  const handleOpen = () => {
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const checkUserLoggedIn = () => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (e) {
        return null;
      }
    }
    return null;
  };

  const handleQuickReply = (type) => {
    const newHistory = [...chatHistory, { sender: 'user', text: type }];
    setFormData({ ...formData, type });
    newHistory.push({ sender: 'bot', text: 'Excellent! And in which location or city?' });
    setChatHistory(newHistory);
    setStep(2);
  };

  const handleNextStep = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() && step !== 4) return;

    let nextStep = step + 1;
    let nextBotMessage = '';
    const newHistory = [...chatHistory, { sender: 'user', text: inputValue }];
    const newFormData = { ...formData };

    if (step === 2) {
      newFormData.location = inputValue;
      const user = checkUserLoggedIn();
      if (user && user.name && user.phone) {
        newFormData.name = user.name;
        newFormData.mobile = user.phone;
        nextStep = 4;
      } else {
        nextBotMessage = 'Almost done! Please provide your contact details:';
      }
    }

    if (nextBotMessage) {
      newHistory.push({ sender: 'bot', text: nextBotMessage });
    }

    setChatHistory(newHistory);
    setFormData(newFormData);
    setStep(nextStep);
    setInputValue('');

    if (nextStep === 4) {
      submitInquiry(newFormData);
    }
  };

  const handleContactSubmit = (e) => {
    e.preventDefault();
    if (!contactForm.name.trim() || !contactForm.mobile.trim()) return;

    const newHistory = [...chatHistory, { sender: 'user', text: `${contactForm.name}, ${contactForm.mobile}` }];
    const newFormData = { ...formData, name: contactForm.name, mobile: contactForm.mobile };
    
    setChatHistory(newHistory);
    setFormData(newFormData);
    setStep(4);
    submitInquiry(newFormData);
  };

  const submitInquiry = async (data) => {
    setLoading(true);
    try {
      await api.post('/support/chatbot', data);
      setChatHistory(prev => [
        ...prev,
        { 
          sender: 'bot', 
          text: 'Thank you! 🎉 One of our executives will contact you shortly. For immediate assistance, call us at +91 98937 58477.' 
        }
      ]);
    } catch (error) {
      console.error('Error submitting chatbot inquiry:', error);
      setChatHistory(prev => [
        ...prev,
        { sender: 'bot', text: 'Oops! There was an error submitting your request. Please call us at +91 98937 58477.' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const resetChat = () => {
    setStep(1);
    setFormData({ type: '', location: '', name: '', mobile: '' });
    setContactForm({ name: '', mobile: '' });
    setChatHistory([{ sender: 'bot', text: 'Hi there! 👋 What are you looking for today?' }]);
    setInputValue('');
  };

  return (
    <div className="chatbot-fancy-container">
      {!isOpen && (
        <div className="chatbot-launcher-tab" onClick={handleOpen}>
          <span className="tab-online-indicator"></span>
          <span className="tab-text">Chat with us</span>
        </div>
      )}

      {isOpen && (
        <div className="chatbot-fancy-window">
          <div className="chatbot-fancy-header">
            <div className="header-bg-shapes">
              <div className="shape shape-1"></div>
              <div className="shape shape-2"></div>
            </div>
            <div className="chatbot-header-content">
              <div className="header-agent-info">
                <div className="agent-avatar-wrapper">
                  <div className="agent-avatar">S</div>
                  <span className="agent-status-dot"></span>
                </div>
                <div className="agent-text">
                  <span className="agent-name">Sortify Assistant</span>
                  <span className="agent-status">Replies instantly</span>
                </div>
              </div>
              <button className="chatbot-fancy-close" onClick={handleClose}>
                <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            <svg className="header-wave" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
              <path fill="#ffffff" fillOpacity="1" d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,122.7C672,117,768,139,864,149.3C960,160,1056,160,1152,138.7C1248,117,1344,75,1392,53.3L1440,32L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
            </svg>
          </div>
          
          <div className="chatbot-fancy-body">
            {chatHistory.map((msg, idx) => (
              <div key={idx} className={`message-row ${msg.sender === 'bot' ? 'bot-row' : 'user-row'}`}>
                {msg.sender === 'bot' && (
                  <div className="mini-bot-avatar">S</div>
                )}
                <div className={`fancy-bubble ${msg.sender === 'bot' ? 'bot-bubble' : 'user-bubble'}`}>
                  {msg.text}
                </div>
              </div>
            ))}

            {step === 1 && (
              <div className="fancy-quick-replies">
                <button onClick={() => handleQuickReply('PG')}>🏠 PG</button>
                <button onClick={() => handleQuickReply('Service Apartment')}>🏢 Service Apartment</button>
                <button onClick={() => handleQuickReply('Flat')}>🔑 Flat</button>
                <button onClick={() => handleQuickReply('Other')}>✨ Other</button>
              </div>
            )}

            {step === 3 && (
              <div className="fancy-contact-card">
                <div className="contact-card-header">Your Details</div>
                <form onSubmit={handleContactSubmit}>
                  <div className="fancy-input-group">
                    <input 
                      type="text" 
                      placeholder="Full Name" 
                      value={contactForm.name}
                      onChange={(e) => setContactForm({...contactForm, name: e.target.value})}
                      required
                    />
                  </div>
                  <div className="fancy-input-group">
                    <input 
                      type="tel" 
                      placeholder="Mobile Number" 
                      value={contactForm.mobile}
                      onChange={(e) => setContactForm({...contactForm, mobile: e.target.value})}
                      required
                    />
                  </div>
                  <button type="submit" className="fancy-submit-btn">Continue ➔</button>
                </form>
              </div>
            )}
            
            {loading && (
              <div className="message-row bot-row">
                <div className="mini-bot-avatar">S</div>
                <div className="fancy-bubble bot-bubble typing-bubble">
                  <div className="dot"></div><div className="dot"></div><div className="dot"></div>
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          <div className="chatbot-fancy-footer">
            {step === 2 && (
              <form onSubmit={handleNextStep} className="fancy-input-wrapper">
                <input
                  type="text"
                  className="fancy-chat-input"
                  placeholder="Type location or city..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  autoFocus
                />
                <button type="submit" className="fancy-send-btn">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13"></line>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                  </svg>
                </button>
              </form>
            )}
            {step === 4 && !loading && (
              <div className="restart-wrapper">
                <button className="fancy-restart-btn" onClick={resetChat}>
                  ↻ Start New Conversation
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Chatbot;
