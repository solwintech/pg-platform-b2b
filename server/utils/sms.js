const axios = require('axios');

/**
 * Send OTP via SMS API
 * @param {string} mobile - Mobile number with +91 prefix
 * @param {string} otp - 6-digit OTP
 * @returns {Promise<boolean>}
 */
const sendOtpSms = async (mobile, otp) => {
  const templateID = "1207172320580702956";
  const entityID = "1201159343808967090";
  const apikey = "1a50b0f7-dc27-4cb1-8b29-9ff7cf3108c9";
  const message = `Dear User, Your login code is- ${otp}. Valid for 30 minutes. Please do not share. Solwin`;

  try {
    const url = `http://88.198.65.19/v2/sendSMS`;
    const response = await axios.get(url, {
      params: {
        username: 'amitabh verma',
        message: message,
        sendername: 'TANSMS',
        smstype: 'TRANS',
        numbers: mobile,
        apikey: apikey,
        peid: entityID,
        templateid: templateID
      }
    });

    // Check if the response was successful (you might need to adjust this based on the actual API response format)
    if (response.status === 200) {
      return true;
    }

    console.error('SMS API Error Response:', response.data);
    return false;
  } catch (error) {
    console.error('SMS API Exception:', error.message);
    return false;
  }
};

module.exports = { sendOtpSms };
