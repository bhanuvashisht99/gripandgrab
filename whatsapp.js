require('dotenv').config();
const twilio = require('twilio');

// Get environment variables
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

// Improved WhatsApp number formatting for Indian numbers
const formatWhatsAppNumber = (phone) => {
    // Remove all non-digits and any existing prefixes
    let cleaned = phone.replace(/\D/g, '');
    
    // Remove leading zeros
    cleaned = cleaned.replace(/^0+/, '');
    
    // Remove 'whatsapp:' or '+' if present
    cleaned = cleaned.replace(/(whatsapp:|\+)/g, '');
    
    // Ensure number starts with 91 for India
    if (!cleaned.startsWith('91')) {
        cleaned = '91' + cleaned;
    }
    
    // Format for WhatsApp API
    return `whatsapp:+${cleaned}`;
};

// Initialize Twilio client
const client = accountSid && authToken ? twilio(accountSid, authToken) : null;

// Format business numbers
const fromNumber = formatWhatsAppNumber('918700107977');  // Your Twilio WhatsApp number
const businessNumber = formatWhatsAppNumber('918448222454');  // Your business WhatsApp

// Debug logging
console.log('WhatsApp Numbers:', {
    fromNumber,
    businessNumber,
    twilioConfigured: !!client
});

const sendWhatsAppBookingNotification = async (bookingData) => {
    try {
        if (!client) {
            console.log('Twilio client not initialized');
            return null;
        }

        const { name, email, phone, preferredDate, preferredTime, location } = bookingData;
        
        console.log('Sending booking notification:', {
            from: fromNumber,
            to: businessNumber
        });

        const message = await client.messages.create({
            body: `New booking:\nName: ${name}\nEmail: ${email}\nPhone: ${phone}\nDate: ${preferredDate}\nTime: ${preferredTime}\nLocation: ${location}`,
            from: fromNumber,
            to: businessNumber
        });

        console.log('Booking notification sent:', message.sid);
        return message.sid;
    } catch (error) {
        console.error('Booking notification error:', error?.message || error);
        return null;
    }
};

const sendWhatsAppConfirmation = async (bookingData) => {
    try {
        if (!client) return { businessSid: null, userSid: null };

        const { name, phone, preferredDate, preferredTime, location } = bookingData;
        const userWhatsApp = formatWhatsAppNumber(phone);

        console.log('Sending confirmations:', {
            from: fromNumber,
            business: businessNumber,
            user: userWhatsApp
        });

        // Business notification
        const businessMsg = await client.messages.create({
            body: `New Booking!\nName: ${name}\nPhone: ${phone}\nDate: ${preferredDate}\nTime: ${preferredTime}\nLocation: ${location}`,
            from: fromNumber,
            to: businessNumber
        });

        console.log('Business notification sent:', businessMsg.sid);

        // User confirmation
        const userMsg = await client.messages.create({
            body: `Your Grip&Grab Fitness session is confirmed!\n\nDetails:\nDate: ${preferredDate}\nTime: ${preferredTime}\nLocation: ${location}\n\nSee you soon! 💪`,
            from: fromNumber,
            to: userWhatsApp
        });

        console.log('User confirmation sent:', userMsg.sid);

        return {
            businessSid: businessMsg.sid,
            userSid: userMsg.sid
        };
    } catch (error) {
        console.error('WhatsApp confirmation error:', {
            message: error?.message,
            code: error?.code,
            moreInfo: error?.moreInfo
        });
        return { businessSid: null, userSid: null };
    }
};

const sendWhatsAppContactNotification = async (contactData) => {
    try {
        if (!client) return null;

        const { name, email, message } = contactData;

        console.log('Sending contact notification:', {
            from: fromNumber,
            to: businessNumber
        });

        const msg = await client.messages.create({
            body: `📩 New Contact Form\n\nName: ${name}\nEmail: ${email}\nMessage: ${message}`,
            from: fromNumber,
            to: businessNumber
        });

        console.log('Contact notification sent:', msg.sid);
        return msg.sid;
    } catch (error) {
        console.error('Contact notification error:', error?.message || error);
        return null;
    }
};

module.exports = {
    sendWhatsAppBookingNotification,
    sendWhatsAppContactNotification,
    sendWhatsAppConfirmation
};