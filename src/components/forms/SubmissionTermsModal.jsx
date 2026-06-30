import React, { useState } from 'react';
import { X, FileText, CheckCircle, Shield, User, Info, AlertTriangle, ArrowRight } from 'lucide-react';

const SubmissionTermsModal = ({ isOpen, onConfirm, onCancel, isSubmitting }) => {
  const [agreed, setAgreed] = useState(false);

  if (!isOpen) return null;

  const termsPoints = [
    {
      title: "Acceptance of Terms",
      content: "By submitting a property listing on SORTIFY Stays, you (“Property Owner/Host”) agree to comply with these Terms & Conditions. If you do not agree, you should not proceed with listing your property."
    },
    {
      title: "Platform Role",
      content: "SORTIFY Stays acts only as an aggregator platform that connects property owners with potential tenants.\nThe platform only provides discovery, listing visibility, and lead generation services\nSORTIFY Stays does not own, manage, operate, or control any property\nSORTIFY Stays is not involved in the stay experience or service delivery"
    },
    {
      title: "No Rental Agreement Involvement",
      content: "SORTIFY Stays is not a party to any rental agreement, lease, or contract between property owner and tenant\nAll agreements are directly executed between the Property Owner and the Tenant\nSORTIFY Stays has no role in drafting, enforcing, or monitoring such agreements"
    },
    {
      title: "Listing Authorization",
      content: "By submitting your property:\nYou grant SORTIFY Stays the right to publish, display, and promote your property\nThis includes:\nProperty details\nImages/videos\nPricing and amenities\nLocation information\nAcross:\nWebsite\nMobile app\nMarketing and promotional channels"
    },
    {
      title: "Accuracy of Information",
      content: "You confirm that:\nAll information provided is true, accurate, and complete\nImages represent the actual property condition\nPricing, facilities, and policies are correct and regularly updated\nSORTIFY Stays is not responsible for incorrect or outdated information"
    },
    {
      title: "Owner Responsibility",
      content: "The entire responsibility lies solely with the Property Owner, including:\nProperty condition & maintenance\nTenant safety & security\nLegal compliance (licenses, permissions, local laws)\nRent agreements and enforcement\nServices like food, cleaning, utilities\nSORTIFY Stays has no responsibility for:\nProperty quality or services\nTenant satisfaction or complaints\nAny damages, losses, or incidents"
    },
    {
      title: "Dispute Resolution",
      content: "All disputes must be resolved directly between the Property Owner and the Tenant\nSORTIFY Stays will not mediate, intervene, or be held liable for:\nPayment issues\nRefunds\nService complaints\nBehavioral disputes"
    },
    {
      title: "No Control Over Listings",
      content: "SORTIFY Stays:\nDoes not control real-time availability, pricing, or updates\nDoes not guarantee:\nOccupancy\nBookings\nTenant quality\nOwners are fully responsible for managing:\nAvailability\nPricing\nTenant communication"
    },
    {
      title: "Verification Disclaimer",
      content: "While SORTIFY Stays may perform basic checks:\nVerification is limited and not a legal certification\nIt does not guarantee:\nAuthenticity\nQuality\nCompliance"
    },
    {
      title: "Payments & Plans",
      content: "SORTIFY Stays may offer paid subscription plans for visibility and features\nAll payments are non-refundable unless explicitly stated\nSORTIFY Stays is not responsible for any rent/payment transactions between owner and tenant"
    },
    {
      title: "Content Rights",
      content: "You confirm that:\nYou own or have rights to all uploaded content\nContent does not violate third-party rights\nSORTIFY Stays may:\nEdit listings for optimization\nUse content for marketing"
    },
    {
      title: "Prohibited Listings",
      content: "You must NOT list:\nIllegal or unauthorized properties\nMisleading or false information\nProperties without necessary approvals\nDiscriminatory or unethical conditions"
    },
    {
      title: "Suspension / Removal",
      content: "SORTIFY Stays reserves the right to:\nRemove or suspend listings without prior notice if:\nTerms are violated\nComplaints arise\nInformation is misleading"
    },
    {
      title: "Limitation of Liability",
      content: "SORTIFY Stays shall not be liable for:\nBusiness loss or revenue loss\nTenant disputes or damages\nProperty-related incidents\nAny indirect or consequential damages"
    },
    {
      title: "Indemnification",
      content: "You agree to indemnify and hold SORTIFY Stays harmless from:\nLegal claims\nDisputes\nDamages\narising from:\nYour property\nYour listing\nYour services"
    },
    {
      title: "Modifications",
      content: "SORTIFY Stays may update these Terms at any time. Continued use implies acceptance."
    },
    {
      title: "Governing Law",
      content: "These terms shall be governed by the laws of India."
    },
    {
      title: "Additional Listing Condition",
      content: "By listing your property on SORTIFY Stays, you agree that the same property shall not be actively listed, promoted, or published on competing property listing platforms or portals during the active subscription/listing period with SORTIFY Stays, unless otherwise approved in writing by SORTIFY Stays."
    }
  ];

  const summaryPoints = [
    { icon: <Shield size={18} className="text-primary" />, text: "SORTIFYStays is only a discovery and lead generation platform" },
    { icon: <User size={18} className="text-primary" />, text: "SORTIFYStays is not a party to any rental agreement" },
    { icon: <FileText size={18} className="text-primary" />, text: "All agreements are directly between you and the tenant" },
    { icon: <Shield size={18} className="text-primary" />, text: "You allow us to publish and promote your property details" },
    { icon: <AlertTriangle size={18} className="text-primary" />, text: "You confirm that this property will not be actively listed on other competing portals during the active listing period on SORTIFY Stays" },
    { icon: <Shield size={18} className="text-primary" />, text: "You confirm all information provided is accurate and genuine" },
    { icon: <User size={18} className="text-primary" />, text: "You accept full responsibility for:\n• Property condition\n• Services\n• Tenant interactions" },
    { icon: <FileText size={18} className="text-primary" />, text: "All disputes will be handled directly between you and the tenant" }
  ];

  return (
    <div className="submission-modal-overlay">
      <div className="submission-modal-container">
        <button className="modal-top-close" onClick={onCancel} disabled={isSubmitting}>
          <X size={20} />
        </button>

        <div className="modal-header-centered">
          <div className="icon-badge-outer">
            
          </div>
          <h4 className="mt-3 fw-bold text-dark">Review & Accept Our Terms</h4>
          <p className="text-muted small">Please read the terms carefully before continuing.</p>
        </div>

        <div className="modal-scroll-wrapper">
          <div className="terms-container">
            <div className="d-flex align-items-center gap-2 mb-3">
              <FileText size={18} className="text-primary" />
              <h6 className="fw-bold mb-0">SORTIFY Stays – Property Owner Terms & Conditions</h6>
            </div>

            <div className="full-terms-box">
              {termsPoints.map((point, index) => (
                <div key={index} className="term-point-item mb-3">
                  <div className="d-flex gap-2">
                    <span className="term-point-index">{index + 1}.</span>
                    <div>
                      <span className="fw-bold d-block mb-1">{point.title}</span>
                      <p className="text-muted small mb-0">{point.content}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <hr className="my-1 opacity-25" />

          <div className="summary-section mt-4">
            <h6 className="fw-bold mb-2">Key Summary</h6>
            <p className="text-muted small mb-3">Before proceeding, please confirm:</p>
            <div className="summary-list">
              {summaryPoints.map((p, i) => (
                <div key={i} className="summary-item d-flex align-items-center gap-3 mb-1">
                  <div className="summary-icon-box">
                    {p.icon}
                  </div>
                  <p className="small mb-0 text-dark fw-medium" style={{ whiteSpace: 'pre-line' }}>{p.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="modal-actions-area">
          
          <div className="form-check custom-terms-check mb-4">
            <input
              className="form-check-input"
              type="checkbox"
              id="acceptTerms"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
            />
            <label className="form-check-label small fw-semibold text-dark" htmlFor="acceptTerms" style={{ cursor: 'pointer' }}>
              I agree to the Terms & Conditions and confirm the above
            </label>
          </div>

          <div className="d-flex justify-content-end">
            <button
              className={`btn btn-primary btn-sm px-4 rounded-pill shadow-sm ${(!agreed || isSubmitting) ? 'disabled' : ''}`}
              onClick={onConfirm}
              disabled={!agreed || isSubmitting}
              style={{ minWidth: '100px' }}
            >
              {isSubmitting ? (
                <span className="spinner-border spinner-border-sm me-2"></span>
              ) : null}
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </button>
          </div>


        </div>
      </div>

      <style>{`
        .submission-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(15, 23, 42, 0.6);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          padding: 20px;
        }

        .submission-modal-container {
          background: white;
          width: 100%;
          max-width: 850px;
          border-radius: 28px;
          position: relative;
          display: flex;
          flex-direction: column;
          max-height: 98vh;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          animation: modalPop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        @keyframes modalPop {
          from { transform: scale(0.9); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }

        .modal-top-close {
          position: absolute;
          top: 20px;
          right: 20px;
          border: none;
          background: #f8fafc;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #94a3b8;
          transition: all 0.2s;
          z-index: 10;
        }

        .modal-top-close:hover {
          background: #fee2e2;
          color: #ef4444;
          transform: rotate(90deg);
        }

        .modal-header-centered {
          // padding: 20px 32px 8px;
          text-align: center;
        }

        .modal-header-centered h4 {
          font-size: 18px;
          margin-bottom: 2px;
        }

        .modal-header-centered p {
          margin-bottom: 0;
          font-size: 11px;
        }

        .icon-badge-outer {
          display: inline-flex;
          padding: 8px;
          background: #f0fdf4;
          border-radius: 16px;
          margin-bottom: 2px;
        }

        .icon-badge-inner {
          width: 44px;
          height: 44px;
          background: #dcfce7;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }

        .check-sub-badge {
          position: absolute;
          bottom: -4px;
          right: -4px;
          background: white;
          border-radius: 50%;
          padding: 2px;
        }

        .fill-white {
          fill: #22c55e;
          color: white !important;
        }

        .modal-scroll-wrapper {
          padding: 10px 32px;
          overflow-y: auto;
          flex: 1;
        }

        .modal-scroll-wrapper h6 {
          font-size: 14px;
        }

        /* Custom Scrollbar */
        .modal-scroll-wrapper::-webkit-scrollbar {
          width: 5px;
        }
        .modal-scroll-wrapper::-webkit-scrollbar-track {
          background: transparent;
        }
        .modal-scroll-wrapper::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }

        .full-terms-box {
          border: 1px solid #f1f5f9;
          border-radius: 12px;
          padding: 12px;
          background: #fafafa;
          max-height: 230px;
          overflow-y: auto;
        }

        .full-terms-box::-webkit-scrollbar {
          width: 4px;
        }
        .full-terms-box::-webkit-scrollbar-thumb {
          background: #94a3b8;
          border-radius: 10px;
        }

        .term-point-index {
          font-weight: 800;
          color: #1e293b;
          font-size: 11px;
        }

        .term-point-item span.fw-bold {
          font-size: 12px;
        }

        .term-point-item p {
          font-size: 11px;
          line-height: 1.4;
          white-space: pre-line;
        }

        .summary-icon-box {
          width: 20px;
          height: 18px;
          background: #f1f5f9;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .summary-section {
          margin-top: 10px !important;
        }

        .summary-item {
          margin-bottom: 8px !important;
        }

        .summary-item p {
          font-size: 11px;
        }

        .modal-actions-area {
          padding: 16px 32px 8px;
          border-top: 1px solid #f1f5f9;
        }

        .custom-terms-check {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding-left: 0;
        }

        .custom-terms-check .form-check-input {
          width: 18px;
          height: 18px;
          margin-top: 3px;
          border-radius: 6px;
          border: 2px solid #cbd5e1;
          cursor: pointer;
        }

        .custom-terms-check .form-check-input:checked {
          background-color: #4361ee;
          border-color: #4361ee;
        }

        .btn-submit-premium {
          width: 100%;
          padding: 12px;
          border-radius: 12px;
          border: none;
          background: linear-gradient(135deg, #1e293b, #0f172a);
          color: white;
          font-weight: 700;
          font-size: 15px;
          transition: all 0.3s;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        }

        .btn-submit-premium:hover:not(.disabled) {
          transform: translateY(-2px);
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.2);
          opacity: 0.9;
        }

        .btn-submit-premium.disabled {
          background: #cbd5e1;
          color: #94a3b8;
          box-shadow: none;
          cursor: not-allowed;
        }

        .x-small {
          font-size: 10px;
        }
      `}</style>
    </div>
  );
};

export default SubmissionTermsModal;
