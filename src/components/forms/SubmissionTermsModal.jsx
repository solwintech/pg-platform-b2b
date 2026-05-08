import React, { useState } from 'react';
import { X, FileText, CheckCircle, Shield, User, Info, AlertTriangle, ArrowRight } from 'lucide-react';

const SubmissionTermsModal = ({ isOpen, onConfirm, onCancel, isSubmitting }) => {
  const [agreed, setAgreed] = useState(false);

  if (!isOpen) return null;

  const termsPoints = [
    { title: "Acceptance of Terms", content: "By submitting a property listing on SORTIFY Stays, you (“Property Owner/Host”) agree to comply with these Terms & Conditions. If you do not agree, you should not proceed with listing your property." },
    { title: "Platform Role", content: "SORTIFY Stays acts only as an aggregator platform that connects property owners with potential tenants. The platform only provides discovery, listing visibility, and lead generation services. SORTIFY Stays does not own, manage, operate, or control any property." },
    { title: "No Rental Agreement Involvement", content: "SORTIFY Stays is not a party to any rental agreement, lease, or contract between property owner and tenant. All agreements are directly executed between the Property Owner and the Tenant." },
    { title: "Listing Authorization", content: "By submitting your property, you grant SORTIFY Stays the right to publish, display, and promote your property details, images/videos, pricing, and location across our website, app, and marketing channels." },
    { title: "Accuracy of Information", content: "You confirm that all information provided is true, accurate, and complete. SORTIFY Stays is not responsible for incorrect or outdated information provided by owners." },
    { title: "Owner Responsibility", content: "The entire responsibility lies solely with the Property Owner, including property condition, maintenance, tenant safety, rent agreements, and services like food/cleaning." },
    { title: "Dispute Resolution", content: "All disputes must be resolved directly between the Property Owner and the Tenant. SORTIFY Stays will not mediate or be held liable for payment issues, refunds, or behavioral disputes." },
    { title: "No Control Over Listings", content: "SORTIFY Stays does not control real-time availability or pricing. Owners are fully responsible for managing availability and tenant communication." },
    { title: "Verification Disclaimer", content: "While SORTIFY Stays may perform basic checks, verification is limited and not a legal certification. It does not guarantee authenticity or compliance." },
    { title: "Payments & Plans", content: "SORTIFY Stays may offer paid subscription plans for visibility. All payments are non-refundable unless explicitly stated. We are not responsible for rent transactions." },
    { title: "Content Rights", content: "You confirm that you own all uploaded content. SORTIFY Stays may edit listings for optimization and use content for marketing." },
    { title: "Prohibited Listings", content: "You must NOT list illegal properties, misleading information, or properties without necessary approvals." },
    { title: "Suspension / Removal", content: "SORTIFY Stays reserves the right to remove or suspend listings without notice if terms are violated or complaints arise." },
    { title: "Limitation of Liability", content: "SORTIFY Stays shall not be liable for business loss, tenant disputes, property-related incidents, or any indirect damages." },
    { title: "Indemnification", content: "You agree to indemnify and hold SORTIFY Stays harmless from legal claims or damages arising from your property, listing, or services." },
    { title: "Modifications", content: "SORTIFY Stays may update these Terms at any time. Continued use implies acceptance." },
    { title: "Governing Law", content: "These terms shall be governed by the laws of India." }
  ];

  const summaryPoints = [
    { icon: <Shield size={18} className="text-primary" />, text: "SORTIFY Stays is only a discovery and lead generation platform." },
    { icon: <User size={18} className="text-primary" />, text: "SORTIFY Stays is not a party to any rental agreement." },
    { icon: <FileText size={18} className="text-primary" />, text: "All agreements and disputes are handled directly between you and the tenant." },
    { icon: <AlertTriangle size={18} className="text-primary" />, text: "You accept full responsibility for property condition and tenant interactions." }
  ];

  return (
    <div className="submission-modal-overlay">
      <div className="submission-modal-container">
        <button className="modal-top-close" onClick={onCancel} disabled={isSubmitting}>
          <X size={20} />
        </button>

        <div className="modal-header-centered">
          <div className="icon-badge-outer">
            <div className="icon-badge-inner">
              <FileText size={32} className="text-success" />
              <div className="check-sub-badge">
                <CheckCircle size={14} className="text-success fill-white" />
              </div>
            </div>
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
            <h6 className="fw-bold mb-3">Key Summary</h6>
            <div className="summary-list">
              {summaryPoints.map((p, i) => (
                <div key={i} className="summary-item d-flex align-items-center gap-3 mb-3">
                  <div className="summary-icon-box">
                    {p.icon}
                  </div>
                  <p className="small mb-0 text-dark fw-medium">{p.text}</p>
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
            <label className="form-check-label small fw-semibold text-dark" htmlFor="acceptTerms">
              I acknowledge and agree
              <span className="d-block text-muted x-small fw-normal mt-1">I have read, understood, and agree to the SORTIFY Stays Property Owner Terms & Conditions.</span>
            </label>
          </div>

          <button
            className={`btn-submit-premium ${(!agreed || isSubmitting) ? 'disabled' : ''}`}
            onClick={onConfirm}
            disabled={!agreed || isSubmitting}
          >
            {isSubmitting ? (
              <span className="spinner-border spinner-border-sm me-2"></span>
            ) : null}
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </button>


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
          padding: 20px 32px 8px;
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
          max-height: 300px;
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
        }

        .summary-icon-box {
          width: 32px;
          height: 32px;
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
