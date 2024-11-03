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
    // For User Notifications
    USER_BOOKING_CONFIRMATION: 'HX3101ba5ae07c7fd8478bc5766354f2ec',  // booking form submission
    USER_CONTACT_CONFIRMATION: 'HX8ca8967632645b3c9e201960c099707e',  // contact form submission
    
    // For Business Notifications
    BUSINESS_BOOKING_NOTIFICATION: 'HXab7321e2c1c7461bcf6e5a72025c0504',  // booking notifications
    BUSINESS_CONTACT_NOTIFICATION: 'HXf43e9657305d6c0cdc046e92f62491ac'   // contact notifications
};

// Single function to handle all contact form notifications
async function sendWhatsAppContactNotification(contactData) {
    const { name, email, phone, message } = contactData;
    const formattedPhone = formatPhoneNumber(phone);

    console.log('Processing contact form:', { name, email, formattedPhone });

    try {
        // Send user confirmation first
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

        // Only send one business notification
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

        // Return both message SIDs
        return { 
            businessSid: businessMsg.sid, 
            userSid: userMsg.sid 
        };
    } catch (error) {
        console.error('Contact notification error:', error);
        throw error;
    }
}

async function sendWhatsAppConfirmation(bookingData) {
    const { name, email, phone, preferredDate, preferredTime, location } = bookingData;

    const formattedPhone = phone.startsWith('+') ? phone : 
                          phone.startsWith('91') ? '+' + phone :
                          '+91' + phone.replace(/^0+/, '');

    console.log('Processing booking:', {
        customer: { name, phone: formattedPhone },
        session: { date: preferredDate, time: preferredTime, location }
    });

    try {
        // 1. Send booking confirmation to user
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
        console.log('Booking confirmation sent to user:', userMsg.sid);

        // 2. Send booking notification to business
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
        console.log('Booking notification sent to business:', businessMsg.sid);
        
        return { userSid: userMsg.sid, businessSid: businessMsg.sid };
    } catch (error) {
        console.error('Booking notification error:', {
            code: error.code,
            message: error.message,
            details: error.moreInfo
        });
        throw error;
    }
}


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
    sendContactFormConfirmation,
    checkMessageStatus,
    sendWhatsAppContactNotification
};