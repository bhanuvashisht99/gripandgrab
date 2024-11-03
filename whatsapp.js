require('dotenv').config();
const twilio = require('twilio');

// Initialize Twilio
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

// WhatsApp numbers
const fromNumber = process.env.TWILIO_WHATSAPP_NUMBER;
const businessNumber = process.env.BUSINESS_WHATSAPP_NUMBER;

// Template IDs
const TEMPLATES = {
    USER_BOOKING_CONFIRMATION: 'HX3101ba5ae07c7fd8478bc5766354f2ec',    // User booking template
    USER_CONTACT_CONFIRMATION: 'HX8ca8967632645b3c9e201960c099707e',    // User contact template
    BUSINESS_BOOKING_NOTIFICATION: 'HXab7321e2c1c7461bcf6e5a72025c0504', // Business booking template
    BUSINESS_CONTACT_NOTIFICATION: 'HXf43e9657305d6c0cdc046e92f62491ac'  // Business contact template
};

// Format phone number helper
function formatPhoneNumber(phone) {
    return phone.startsWith('+') ? phone : 
           phone.startsWith('91') ? '+' + phone :
           '+91' + phone.replace(/^0+/, '');
}

// Contact form notifications
async function sendWhatsAppContactNotification(contactData) {
    const { name, email, phone, message } = contactData;
    const formattedPhone = formatPhoneNumber(phone);

    console.log('Processing contact form:', { name, email, formattedPhone });

    try {
        // Send to business
        const businessMsg = await client.messages.create({
            contentSid: TEMPLATES.BUSINESS_CONTACT_NOTIFICATION,
            contentVariables: JSON.stringify({
                1: name,
                2: email,
                3: formattedPhone,
                4: message
            }),
            from: fromNumber,
            to: businessNumber
        });
        console.log('Business contact notification sent:', businessMsg.sid);

        // Send to user
        const userMsg = await client.messages.create({
            contentSid: TEMPLATES.USER_CONTACT_CONFIRMATION,
            contentVariables: JSON.stringify({
                1: name,
                2: message
            }),
            from: fromNumber,
            to: `whatsapp:${formattedPhone}`
        });
        console.log('User contact confirmation sent:', userMsg.sid);

        return {
            businessSid: businessMsg.sid,
            userSid: userMsg.sid
        };
    } catch (error) {
        console.error('Contact notification error:', error);
        throw error;
    }
}

// Booking notifications
async function sendWhatsAppConfirmation(bookingData) {
    const { name, email, phone, preferredDate, preferredTime, location } = bookingData;
    const formattedPhone = formatPhoneNumber(phone);

    console.log('Processing booking:', { name, date: preferredDate, time: preferredTime });

    try {
        // Send to user
        const userMsg = await client.messages.create({
            contentSid: TEMPLATES.USER_BOOKING_CONFIRMATION,
            contentVariables: JSON.stringify({
                1: preferredDate,
                2: preferredTime,
                3: location
            }),
            from: fromNumber,
            to: `whatsapp:${formattedPhone}`
        });
        console.log('User booking confirmation sent:', userMsg.sid);

        // Send to business
        const businessMsg = await client.messages.create({
            contentSid: TEMPLATES.BUSINESS_BOOKING_NOTIFICATION,
            contentVariables: JSON.stringify({
                1: name,
                2: email,
                3: formattedPhone,
                4: preferredDate,
                5: preferredTime,
                6: location
            }),
            from: fromNumber,
            to: businessNumber
        });
        console.log('Business booking notification sent:', businessMsg.sid);

        return { 
            userSid: userMsg.sid,
            businessSid: businessMsg.sid 
        };
    } catch (error) {
        console.error('Booking notification error:', error);
        throw error;
    }
}

// Message status checker
async function checkMessageStatus(messageSid) {
    try {
        const message = await client.messages(messageSid).fetch();
        console.log(`Message ${messageSid} status: ${message.status}`);
        return message.status;
    } catch (error) {
        console.error('Status check error:', error);
        return null;
    }
}

module.exports = {
    sendWhatsAppConfirmation,
    sendWhatsAppContactNotification,
    checkMessageStatus
};