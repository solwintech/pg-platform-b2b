const sendEmail = require('../utils/sendEmail');

exports.submitChatbotInquiry = async (req, res) => {
  try {
    const { type, city, locality, name, mobile, email } = req.body;

    const emailHtml = `
      <h2>New Chatbot Inquiry</h2>
      <p><strong>Accommodation Type:</strong> ${type || 'N/A'}</p>
      <p><strong>City:</strong> ${city || 'N/A'}</p>
      <p><strong>Locality:</strong> ${locality || 'N/A'}</p>
      <p><strong>Name:</strong> ${name || 'N/A'}</p>
      <p><strong>Mobile Number:</strong> ${mobile || 'N/A'}</p>
      <p><strong>Email Address:</strong> ${email || 'N/A'}</p>
      <br />
      <p>Submitted via Chatbot Help Pop-up.</p>
    `;

    // Send email to the specified addresses
    await sendEmail({
      email: 'sales@sortifystays.com, tushar@sortifystay.com',
      subject: 'New Inquiry from Support Chatbot',
      html: emailHtml
    });

    res.status(200).json({
      success: true,
      message: 'Inquiry submitted successfully. Confirmation sent via email.'
    });

  } catch (err) {
    console.error('Error in submitChatbotInquiry:', err);
    res.status(500).json({
      success: false,
      message: 'Server Error. Failed to submit inquiry.'
    });
  }
};
