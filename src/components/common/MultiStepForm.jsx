import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';

const MultiStepForm = ({ steps, onSubmit, initialData = {} }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState(initialData);
  const [error, setError] = useState(null);
  const [showImageWarning, setShowImageWarning] = useState(false);
  const [showUploadWarning, setShowUploadWarning] = useState(false);

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
      if (validationError === "SHOW_IMAGE_WARNING") {
        setShowImageWarning(true);
        return;
      }
      if (validationError === "SHOW_UPLOAD_WARNING") {
        setShowUploadWarning(true);
        return;
      }
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

  const handleAcceptImageWarning = () => {
    setShowImageWarning(false);
    setFormData({ ...formData, imageWarningAccepted: true });
    if (currentStep < steps.length - 1) {
      setError(null);
      setCurrentStep(currentStep + 1);
    } else {
      onSubmit({ ...formData, imageWarningAccepted: true });
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
        
        {steps[currentStep].title === "Uploads" ? (
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button 
              className="btn-skip"
              onClick={() => setShowImageWarning(true)}
              style={{
                padding: '8px 24px',
                fontSize: '13px',
                fontWeight: '500',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                background: 'white',
                color: '#4b5563',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#f9fafb';
                e.target.style.borderColor = '#d1d5db';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'white';
                e.target.style.borderColor = '#e2e8f0';
              }}
            >
              Skip
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
        ) : (
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
        )}
      </div>

      {showImageWarning && (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden position-relative">
              <button 
                className="btn-close position-absolute top-0 end-0 m-3" 
                onClick={() => setShowImageWarning(false)}
                style={{ zIndex: 10 }}
              ></button>
              <div className="modal-body p-4 text-center mt-2">
                <div className="d-flex justify-content-center align-items-center mb-4">
                  <div className="rounded-circle d-flex justify-content-center align-items-center" style={{ width: '60px', height: '60px', backgroundColor: '#eef2ff' }}>
                    <i className="fas fa-exclamation-triangle" style={{ fontSize: '28px', color: '#4361ee' }}></i>
                  </div>
                  <h4 className="ms-3 mb-0 fw-bold" style={{ fontSize: '1.2rem', textAlign: 'left', flex: 1 }}>We'll upload some default images on your behalf.</h4>
                </div>
                
                <div className="text-start mb-4">
                  <div className="d-flex align-items-start mb-3">
                    <i className="far fa-calendar-alt mt-1 me-3" style={{ color: '#4361ee', fontSize: '20px' }}></i>
                    <p className="mb-0" style={{ fontSize: '0.95rem' }}>You must upload the actual images of your property <span style={{ color: '#4361ee', fontWeight: 'bold' }}>within 7 days.</span></p>
                  </div>
                  <div className="d-flex align-items-start mb-3">
                    <i className="fas fa-exclamation-triangle mt-1 me-3" style={{ color: '#4361ee', fontSize: '20px' }}></i>
                    <p className="mb-0" style={{ fontSize: '0.95rem' }}>If you don't upload within 7 days, your property will be <span style={{ color: '#4361ee', fontWeight: 'bold' }}>delisted.</span></p>
                  </div>
                  <div className="d-flex align-items-start">
                    <i className="fas fa-pencil-alt mt-1 me-3" style={{ color: '#4361ee', fontSize: '20px' }}></i>
                    <p className="mb-0" style={{ fontSize: '0.95rem' }}>You can upload your photos anytime by editing the property from your Sortify login.</p>
                  </div>
                </div>

                <button 
                  className="btn text-white fw-bold px-5 py-2 rounded-3" 
                  style={{ backgroundColor: '#4361ee', fontSize: '1.1rem' }}
                  onClick={handleAcceptImageWarning}
                >
                  Okay, Got It
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showUploadWarning && (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
              <div className="modal-body p-4 text-center">
                <div className="d-flex justify-content-center align-items-center mb-4">
                  <div className="rounded-circle d-flex justify-content-center align-items-center" style={{ width: '60px', height: '60px', backgroundColor: '#e0f2fe' }}>
                    <i className="fas fa-images" style={{ fontSize: '28px', color: '#0ea5e9' }}></i>
                  </div>
                  <h4 className="ms-3 mb-0 fw-bold" style={{ fontSize: '1.2rem', textAlign: 'left', flex: 1 }}>Minimum 3 images recommended</h4>
                </div>
                
                <p className="text-start mb-4" style={{ fontSize: '0.95rem', color: '#4b5563' }}>
                  You have not uploaded at least 3 images. It is highly recommended to provide minimum 3 images for a better property listing. Do you want to skip or upload more?
                </p>

                <div className="d-flex justify-content-center gap-3">
                  <button 
                    className="btn btn-outline-secondary px-4 py-2 rounded-3 fw-bold" 
                    onClick={() => {
                      setShowUploadWarning(false);
                      setShowImageWarning(true);
                    }}
                  >
                    Skip this step
                  </button>
                  <button 
                    className="btn text-white px-4 py-2 rounded-3 fw-bold" 
                    style={{ backgroundColor: '#0ea5e9' }}
                    onClick={() => setShowUploadWarning(false)}
                  >
                    Upload Images
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MultiStepForm;