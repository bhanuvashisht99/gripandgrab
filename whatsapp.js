require('dotenv').config();
const twilio = require('twilio');

// Get environment variables
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`;
const businessNumber = `whatsapp:${process.env.BUSINESS_WHATSAPP_NUMBER}`;

// Debug log environment variables
console.log('WhatsApp Configuration:', {
    fromNumber,
    businessNumber,
    hasAccountSid: !!accountSid,
    hasAuthToken: !!authToken
});

// Initialize Twilio client if credentials are available
const client = accountSid && authToken ? twilio(accountSid, authToken) : null;

const formatPhoneForWhatsApp = (phone) => {
    const cleaned = phone.replace(/\D/g, '');
    return `whatsapp:+${cleaned.startsWith('91') ? cleaned : '91' + cleaned}`;
};

const sendWhatsAppBookingNotification = async (bookingData) => {
    try {
        if (!client) {
            console.log('Twilio client not initialized - missing credentials');
            return null;
        }

        const { name, email, phone, preferredDate, preferredTime, location } = bookingData;
        
        const message = await client.messages.create({
            body: `New booking:\nName: ${name}\nEmail: ${email}\nPhone: ${phone}\nDate: ${preferredDate}\nTime: ${preferredTime}\nLocation: ${location}`,
            from: fromNumber,
            to: businessNumber
        });

        console.log('Booking notification sent:', message.sid);
        return message.sid;
    } catch (error) {
        console.error('Error sending booking notification:', error);
        return null;
    }
};

const sendWhatsAppConfirmation = async (bookingData) => {
    try {
        if (!client) return { businessSid: null, userSid: null };

        const { name, email, phone, preferredDate, preferredTime, location } = bookingData;
        const userWhatsApp = formatPhoneForWhatsApp(phone);

        // Send to business
        const businessMsg = await client.messages.create({
            body: `New booking:\nName: ${name}\nEmail: ${email}\nPhone: ${phone}\nDate: ${preferredDate}\nTime: ${preferredTime}\nLocation: ${location}`,
            from: fromNumber,
            to: businessNumber
        });

        // Send to customer
        const userMsg = await client.messages.create({
            body: `Your Grip&Grab Fitness session is confirmed!\nDate: ${preferredDate}\nTime: ${preferredTime}\nLocation: ${location}\n\nWe're excited to see you!`,
            from: fromNumber,
            to: userWhatsApp
        });

        return { 
            businessSid: businessMsg.sid, 
            userSid: userMsg.sid 
        };
    } catch (error) {
        console.error('WhatsApp confirmation error:', error);
        return { businessSid: null, userSid: null };
    }
};

const sendWhatsAppContactNotification = async (contactData) => {
    try {
        if (!client) return null;

        const { name, email, message } = contactData;
        
        const msg = await client.messages.create({
            body: `New Contact Form:\nName: ${name}\nEmail: ${email}\nMessage: ${message}`,
            from: fromNumber,
            to: businessNumber
        });

        return msg.sid;
    } catch (error) {
        console.error('Contact notification error:', error);
        return null;
    }
};

const checkMessageStatus = async (messageSid) => {
    try {
        if (!client || !messageSid) return null;
        const message = await client.messages(messageSid).fetch();
        return message.status;
    } catch (error) {
        console.error('Status check error:', error);
        return null;
    }
};

module.exports = {
    sendWhatsAppBookingNotification,
    sendWhatsAppContactNotification,
    checkMessageStatus,
    sendWhatsAppConfirmation
};