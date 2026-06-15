const fs = require('fs');
const listing = fs.readFileSync('src/pages/User/ListingPage.jsx', 'utf8');
let pd = fs.readFileSync('src/pages/User/PropertyDetails.jsx', 'utf8');

const statesMatch = listing.match(/const \[showOtpModal, setShowOtpModal\].*?const \[stayDuration, setStayDuration\] = useState\(''\);/s);
const states = statesMatch ? statesMatch[0] : '';

const methodsMatch = listing.match(/const getPropertyMinPrice = .*?const handleResendOtp = \(\) => {.*?};/s);
const methods = methodsMatch ? methodsMatch[0] : '';

const modalMatch = listing.match(/<Modal show={showOtpModal}.*?<\/Modal>/s);
const modalJSX = modalMatch ? modalMatch[0] : '';

const styleMatch = listing.match(/\/\* --- Custom Modal Styling --- \*\/.*?<\/style>/s);
const modalStyle = styleMatch ? '<style>{`\n' + styleMatch[0] + '`}</style>' : '';

if(states && methods && modalJSX) {
    pd = pd.replace(/const \[showEnquiryModal, setShowEnquiryModal\] = useState\(false\);.*?const \[verifyingOtp, setVerifyingOtp\] = useState\(false\);/s, states + '\n' + methods.replace(/const fetchProperties = .*?}, \[otpTimer\]\);/s, ''));
    pd = pd.replace(/{\/\* OTP Verification Modal \*\/}.*?<\/Modal>/s, modalJSX + '\n      ' + modalStyle);
    pd = pd.replace(/<button className="btn btn-sm px-3 py-1 fw-bold" style={{fontSize: '0.8rem', background: 'white', color: '#ea580c', border: '1px solid #ea580c'}} onClick={() => setShowEnquiryModal\(true\)}>Enquire<\/button>/g, '<button className="btn btn-sm px-3 py-1 fw-bold" style={{fontSize: \'0.8rem\', background: \'white\', color: \'#ea580c\', border: \'1px solid #ea580c\'}} onClick={() => openOtpModal(property, \'enquiry\')}>Enquire</button>');
    pd = pd.replace(/<button className="btn btn-sm px-3 py-1 fw-bold text-white d-flex align-items-center shadow-sm" style={{fontSize: '0.8rem', background: '#ea580c', border: 'none'}} onClick={() => setShowEnquiryModal\(true\)}>/g, '<button className="btn btn-sm px-3 py-1 fw-bold text-white d-flex align-items-center shadow-sm" style={{fontSize: \'0.8rem\', background: \'#ea580c\', border: \'none\'}} onClick={() => openOtpModal(property, \'call\')}>');
    
    // add imports
    pd = pd.replace(/import { Spinner, Modal, Carousel } from 'react-bootstrap';/g, "import { Spinner, Modal, Carousel, Row, Col, Form } from 'react-bootstrap';");

    fs.writeFileSync('src/pages/User/PropertyDetails.jsx', pd);
    console.log('Success!');
} else {
    console.log('Failed to extract chunks.');
}
