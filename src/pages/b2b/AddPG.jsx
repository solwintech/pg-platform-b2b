import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MultiStepForm from '../../components/common/MultiStepForm';
import StepBasicInfo from '../../components/forms/StepBasicInfo';
import StepLocation from '../../components/forms/StepLocation';
import StepPropertyDetails from '../../components/forms/StepPropertyDetails';
import StepRoomTypes from '../../components/forms/StepRoomTypes';
import StepPricing from '../../components/forms/StepPricing';
import StepAmenities from '../../components/forms/StepAmenities';
import StepUploads from '../../components/forms/StepUploads';
import StepReview from '../../components/forms/StepReview';
import propertyService from '../../services/propertyService';
import SubmissionTermsModal from '../../components/forms/SubmissionTermsModal';

const AddPG = () => {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [pendingFormData, setPendingFormData] = useState(null);

  const steps = [
    { 
      title: "Basic Info", 
      component: StepBasicInfo,
      validate: (data) => {
        if (!data.propertyType) return "Please select a Property Type";
        if (!data.pgName) return "Please enter the Property Name";
        if (!data.managerName) return "Please enter the Manager Name";
        if (!data.managerPhone || data.managerPhone.length !== 10) return "Please enter a valid 10-digit Manager Phone Number";
        return null;
      }
    },
    { 
      title: "Location", 
      component: StepLocation,
      validate: (data) => {
        if (!data.area) return "Please enter the Area/Sector";
        if (!data.address) return "Please enter the Full Address";
        if (!data.city) return "Please enter the City";
        if (!data.pinCode) return "Please enter the PIN Code";
        return null;
      }
    },
    { 
      title: "Property Details", 
      component: StepPropertyDetails,
      validate: (data) => {
        if (!data.genderAllowed) return "Please select Gender Allowed";
        if (!data.totalBeds) return "Please enter Total No of Beds";
        return null;
      }
    },
    { 
      title: "Room Types", 
      component: StepRoomTypes,
      validate: (data) => {
        if (!data.roomTypes || data.roomTypes.length === 0) return "Please add at least one Room Type";
        return null;
      }
    },
    { 
      title: "Common Amenities", 
      component: StepAmenities,
      validate: (data) => {
        if (!data.amenities || data.amenities.length === 0) return "Please select at least one Amenity";
        return null;
      }
    },
    { 
      title: "Common Charges", 
      component: StepPricing,
      validate: (data) => {
        if (!data.depositType) return "Please select Security Deposit type";
        if (!data.paymentCycle) return "Please select Payment Cycle";
        if (!data.foodOption) return "Please select Food Option";
        if (!data.electricityCharges) return "Please select Electricity Charges option";
        if (!data.minLocking) return "Please select Minimum Locking period";
        return null;
      }
    },
    { 
      title: "Uploads", 
      component: StepUploads,
      validate: (data) => {
        if (!data.coverImage) return "Please upload the Main Property Photo";
        return null;
      }
    },
    { title: "Review", component: StepReview }
  ];

  const handleSubmit = (formData) => {
    setPendingFormData(formData);
    setShowTermsModal(true);
  };

  const handleFinalSubmit = async () => {
    setSubmitting(true);
    setShowTermsModal(false);
    try {
      await propertyService.createProperty(pendingFormData);
      setSubmitting(false);
      alert('Success! Your property has been submitted and is pending admin approval.');
      navigate('/b2b/listings');
    } catch (error) {
      console.error('Error submitting property:', error);
      setSubmitting(false);
      alert('Error submitting property. Please try again.');
    }
  };

  return (
    <div className="add-pg-page">
      <div className="card">
        <div className="card-body p-4">
          {submitting ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary mb-3" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p>Submitting your listing...</p>
            </div>
          ) : (
            <MultiStepForm steps={steps} onSubmit={handleSubmit} />
          )}
        </div>
      </div>

      <SubmissionTermsModal 
        isOpen={showTermsModal}
        onConfirm={handleFinalSubmit}
        onCancel={() => setShowTermsModal(false)}
        isSubmitting={submitting}
      />
    </div>
  );
};

export default AddPG;