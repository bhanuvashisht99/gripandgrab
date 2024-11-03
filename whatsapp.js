const twilio = require('twilio');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);
console.log('Account SID:', accountSid);
console.log('Auth Token:', authToken.substring(0, 5) + '...'); // Only log the first 5 characters for security

const fromNumber = process.env.TWILIO_WHATSAPP_NUMBER;
const businessNumber = process.env.BUSINESS_WHATSAPP_NUMBER;

console.log('From Number:', fromNumber);
console.log('Business Number:', businessNumber);
// Make sure these environment variables are set in your .env file


async function sendWhatsAppBookingNotification(bookingData) {
    const { name, email, phone, preferredDate, preferredTime, location } = bookingData;

    if (!businessNumber) {
        throw new Error('Business WhatsApp number is not defined in environment variables');
    }

    try {
        console.log(`Attempting to send WhatsApp booking notification to business number: ${businessNumber}`);
        const twilioMessage = await client.messages.create({
            contentSid: 'HX8f95c5e296590140df87c567dbe30953', // Your approved template for booking notifications to the business
            contentVariables: JSON.stringify({
                1: name,
                2: email,
                3: phone,
                4: preferredDate,
                5: preferredTime,
                6: location
            }),
            from: fromNumber,
            to: businessNumber // This sends to your business WhatsApp number
        });
        console.log('WhatsApp booking notification sent successfully:', twilioMessage.sid);
        return twilioMessage.sid;
    } catch (error) {
        console.error('Error sending WhatsApp booking notification:', error);
        throw error;
    }
}

async function sendWhatsAppContactNotification(contactData) {
    const { name, email, message } = contactData;

    if (!businessNumber) {
        throw new Error('Business WhatsApp number is not defined in environment variables');
    }

    try {
        console.log(`Attempting to send WhatsApp contact notification to business number: ${businessNumber}`);
        const twilioMessage = await client.messages.create({
            contentSid: 'HX229d54afb0afcefe7dcf774e3a1b2fc4', // Your approved template for contact notifications to the business
            contentVariables: JSON.stringify({
                1: name,
                2: email,
                3: message
            }),
            from: fromNumber,
            to: businessNumber
        });
        console.log('WhatsApp contact notification sent successfully:', twilioMessage.sid);
        return twilioMessage.sid;
    } catch (error) {
        console.error('Error sending WhatsApp contact notification:', error);
        throw error;
    }
}

async function checkMessageStatus(messageSid) {
    try {
        const message = await client.messages(messageSid).fetch();
        console.log(`Message ${messageSid} status: ${message.status}`);
        return message.status;
    } catch (error) {
        console.error('Error checking message status:', error);
        throw error;
    }
}

async function sendContactFormConfirmation(contactData) {
    const { name, email, message, phone } = contactData;

    // Ensure the phone number is in the correct format for Indian numbers
    const formattedPhone = phone.startsWith('+') ? phone : 
                           phone.startsWith('91') ? '+' + phone :
                           '+91' + phone.replace(/^0+/, '');

    console.log('Sending contact form confirmation to:', formattedPhone);

    try {
        // Send confirmation to the user
        const userMsg = await client.messages.create({
            contentSid: 'HXba0a8fc878d0f09b487b4d9ba288e1c2', // Your approved template for user confirmation
            contentVariables: JSON.stringify({
                1: name
            }),
            from: process.env.TWILIO_WHATSAPP_NUMBER,
            to: `whatsapp:${formattedPhone}`
        });

        console.log('Contact form confirmation sent successfully');
        return userMsg.sid;
    } catch (error) {
        console.error('Error sending contact form confirmation:', error);
        console.error('Error details:', error.message);
        if (error.code) {
            console.error('Twilio error code:', error.code);
        }
        throw error;
    }
}

async function sendWhatsAppConfirmation(bookingData) {
    const { name, email, phone, preferredDate, preferredTime, location } = bookingData;

    const formattedPhone = phone.startsWith('+') ? phone : 
                           phone.startsWith('91') ? '+' + phone :
                           '+91' + phone.replace(/^0+/, '');

    console.log('Formatted phone number:', formattedPhone);

    try {
        // Send booking confirmation to the user using Content SID
        const userMsg = await client.messages.create({
            contentSid: 'HX049fbd59ead54ed9423ab93d883806f1', // Your approved template for user booking confirmation
            contentVariables: JSON.stringify({
                1: preferredDate,
                2: preferredTime,
                3: location
            }),
            from: process.env.TWILIO_WHATSAPP_NUMBER,
            to: `whatsapp:${formattedPhone}`
        });

        console.log('User confirmation sent successfully using contentSid');

        // Send booking notification to the business using the new template Content SID
        const businessMsg = await client.messages.create({
            contentSid: 'HX8f95c5e296590140df87c567dbe30953', // Your approved template for business booking notifications
            contentVariables: JSON.stringify({
                1: name,
                2: email,
                3: formattedPhone,
                4: preferredDate,
                5: preferredTime,
                6: location
            }),
            from: process.env.TWILIO_WHATSAPP_NUMBER,
            to: `whatsapp:${process.env.BUSINESS_WHATSAPP_NUMBER}`
        });

        console.log('Business notification sent successfully:', businessMsg.sid);
        
        return { userSid: userMsg.sid, businessSid: businessMsg.sid };
    } catch (error) {
        console.error('Error sending WhatsApp confirmation or business notification:', error);
        if (error.code) {
            console.error('Twilio error code:', error.code);
        }
        throw new Error(`An error occurred while processing your booking. Twilio response: ${error.message}`);
    }
}

module.exports = { sendWhatsAppBookingNotification, sendWhatsAppContactNotification, checkMessageStatus, sendWhatsAppConfirmation,sendContactFormConfirmation };

