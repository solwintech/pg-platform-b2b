import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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

const EditPG = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [initialData, setInitialData] = useState(null);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [pendingFormData, setPendingFormData] = useState(null);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const response = await propertyService.getPropertyById(id);
        if (response.success) {
          setInitialData(response.data);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching property:', error);
        alert('Failed to load property data');
        const isAdmin = window.location.pathname.includes('/admin');
        navigate(isAdmin ? '/admin/properties' : '/b2b/listings');
      }
    };

    fetchProperty();
  }, [id, navigate]);

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
    const formData = pendingFormData;
    const isAdmin = window.location.pathname.includes('/admin');

    try {
      // Define restricted fields that require admin re-approval
      const restrictedFields = ['pgName', 'address', 'area', 'city', 'pinCode', 'landmark', 'latitude', 'longitude'];
      
      let needsReapproval = false;
      
      // Check if any restricted field has changed compared to initialData
      if (!isAdmin) {
        for (const field of restrictedFields) {
          if (formData[field] !== initialData[field]) {
            needsReapproval = true;
            break;
          }
        }
      }

      // Prepare final data
      const updateData = { ...formData };
      if (needsReapproval) {
        updateData.status = 'pending';
      }

      await propertyService.updateProperty(id, updateData);
      setSubmitting(false);
      
      if (needsReapproval) {
        alert('Your property has been updated. Since critical details (Name or Location) were changed, it is now pending admin re-approval.');
      } else {
        alert('Success! Property details have been updated.');
      }
      
      if (isAdmin) {
        navigate('/admin/properties');
      } else {
        navigate('/b2b/listings');
      }
    } catch (error) {
      console.error('Error updating property:', error);
      setSubmitting(false);
      alert('Error updating property. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2">Loading property data...</p>
      </div>
    );
  }

  return (
    <div className="add-pg-page">
      <div className="card">
        <div className="card-header bg-white py-3">
          <h5 className="mb-0 fw-bold text-primary">Edit Property: {initialData?.pgName}</h5>
        </div>
        <div className="card-body p-4">
          {submitting ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary mb-3" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p>Updating your listing...</p>
            </div>
          ) : (
            <MultiStepForm steps={steps} onSubmit={handleSubmit} initialData={initialData} />
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

export default EditPG;
