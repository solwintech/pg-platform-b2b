import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';

const MultiStepForm = ({ steps, onSubmit, initialData = {} }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState(initialData);
  const [error, setError] = useState(null);

  React.useEffect(() => {
    if (Object.keys(initialData).length > 0) {
      setFormData(initialData);
    }
  }, [initialData]);
  
  const updateFormData = (data) => {
    // Check if propertyType is being changed
    if (data.propertyType && formData.propertyType && data.propertyType !== formData.propertyType) {
      // Clear property-specific fields to ensure data consistency
      setFormData({
        ...formData,
        ...data,
        roomTypes: [],
        amenities: [],
        roomAmenities: [],
        genderAllowed: '',
        totalBeds: '',
        propertySubCategory: '',
        // Add other fields that should be reset
      });
      setError("Property type changed. Property-specific details have been reset for accuracy.");
      return;
    }

    setFormData({ ...formData, ...data });
    if (error) setError(null); // Clear error when user starts typing
  };

  const nextStep = () => {
    const currentStepConfig = steps[currentStep];
    if (currentStepConfig.validate) {
      const validationError = currentStepConfig.validate(formData);
      if (validationError) {
        setError(validationError);
        return;
      }
    }

    if (currentStep < steps.length - 1) {
      setError(null);
      setCurrentStep(currentStep + 1);
    } else {
      onSubmit(formData);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setError(null);
      setCurrentStep(currentStep - 1);
    }
  };

  const CurrentStepComponent = steps[currentStep].component;

  return (
    <div className="multi-step-form">
      <div className="progress-bar-container mb-4">
        <div className="d-flex justify-content-between">
          {steps.map((step, index) => (
            <div key={index} className="text-center flex-grow-1">
              <div className={`step-circle mx-auto mb-2 d-flex align-items-center justify-content-center
                ${index < currentStep ? 'completed' : ''}
                ${index === currentStep ? 'active' : ''}
                ${index > currentStep ? 'pending' : ''}`}
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  backgroundColor: index < currentStep ? '#4caf50' : 
                                 index === currentStep ? '#4361ee' : '#e0e0e0',
                  color: 'white',
                  fontWeight: 'bold'
                }}>
                {index < currentStep ? <Check size={20} /> : index + 1}
              </div>
              <div className="step-label">
                <small className={index === currentStep ? 'text-primary fw-bold' : 'text-muted'}>
                  {step.title}
                </small>
              </div>
            </div>
          ))}
        </div>
        <div className="progress mt-3" style={{ height: '4px' }}>
          <div 
            className="progress-bar" 
            style={{ 
              width: `${((currentStep) / (steps.length - 1)) * 100}%`,
              backgroundColor: '#4361ee',
              transition: 'width 0.3s'
            }}
          />
        </div>
      </div>

      <div className="step-content">
        <CurrentStepComponent 
          data={formData} 
          updateData={updateFormData}
        />
        
        {error && (
          <div className="mt-3 p-2 bg-danger bg-opacity-10 border border-danger border-opacity-25 rounded d-flex align-items-center gap-2 slide-in">
            <span className="text-danger" style={{ fontSize: '18px' }}>⚠️</span>
            <span className="text-danger small fw-medium">{error}</span>
          </div>
        )}
      </div>

      <div className="step-actions" style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem', gap: '1rem' }}>
        <button 
          className="btn-prev"
          onClick={prevStep}
          disabled={currentStep === 0}
          style={{
            padding: '8px 24px',
            fontSize: '13px',
            fontWeight: '500',
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
            background: 'white',
            color: '#4b5563',
            cursor: currentStep === 0 ? 'not-allowed' : 'pointer',
            opacity: currentStep === 0 ? 0.5 : 1,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            if (currentStep !== 0) {
              e.target.style.background = '#f9fafb';
              e.target.style.borderColor = '#d1d5db';
            }
          }}
          onMouseLeave={(e) => {
            if (currentStep !== 0) {
              e.target.style.background = 'white';
              e.target.style.borderColor = '#e2e8f0';
            }
          }}
        >
          <ChevronLeft size={14} /> Previous
        </button>
        <button 
          className="btn-next"
          onClick={nextStep}
          style={{
            padding: '8px 24px',
            fontSize: '13px',
            fontWeight: '500',
            borderRadius: '8px',
            border: 'none',
            background: 'linear-gradient(135deg, #4361ee, #3f37c9)',
            color: 'white',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-1px)';
            e.target.style.boxShadow = '0 4px 12px rgba(67, 97, 238, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = 'none';
          }}
        >
          {currentStep === steps.length - 1 ? 'Submit' : 'Next'}
          {currentStep !== steps.length - 1 && <ChevronRight size={14} />}
        </button>
      </div>
    </div>
  );
};

export default MultiStepForm;