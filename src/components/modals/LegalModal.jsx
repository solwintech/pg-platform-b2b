import React from 'react';
import { Modal, Button } from 'react-bootstrap';

const LegalModal = ({ show, onHide, title, content }) => {
  return (
    <Modal show={show} onHide={onHide} size="lg" centered scrollable>
      <Modal.Header closeButton className="border-bottom-0">
        <Modal.Title className="fw-bold">{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {content ? (
          <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.7', color: '#475569' }}>
            {content}
          </div>
        ) : (
          <p className="text-muted">Content is currently being updated. Please check back later.</p>
        )}
      </Modal.Body>
      <Modal.Footer className="border-top-0 pt-0">
        <Button variant="secondary" onClick={onHide} className="rounded-pill px-4" style={{backgroundColor: '#e2e8f0', color: '#1e293b', border: 'none'}}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default LegalModal;
