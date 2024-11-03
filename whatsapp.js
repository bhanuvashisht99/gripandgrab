require('dotenv').config();
const twilio = require('twilio');

// Get environment variables
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

// Single verified WhatsApp number for all communications
const twilioNumber = 'whatsapp:+918700107977';

// Initialize Twilio client
const client = accountSid && authToken ? twilio(accountSid, authToken) : null;

console.log('WhatsApp Configuration:', {
    twilioNumber,
    hasClient: !!client
});

const sendWhatsAppBookingNotification = async (bookingData) => {
    try {
        if (!client) return null;

        const { name, email, phone, preferredDate, preferredTime, location } = bookingData;
        
        const message = await client.messages.create({
            body: `🏋️‍♂️ New Booking!\n\nName: ${name}\nEmail: ${email}\nPhone: ${phone}\nDate: ${preferredDate}\nTime: ${preferredTime}\nLocation: ${location}`,
            from: twilioNumber,
            to: twilioNumber  // Send to same number
        });

        console.log('Booking notification sent:', message.sid);
        return message.sid;
    } catch (error) {
        console.error('Booking notification error:', error?.message || error);
        return null;
    }
};

const sendWhatsAppContactNotification = async (contactData) => {
    try {
        if (!client) return null;

        const { name, email, message } = contactData;

        const msg = await client.messages.create({
            body: `📩 New Contact Form\n\nName: ${name}\nEmail: ${email}\nMessage: ${message}`,
            from: twilioNumber,
            to: twilioNumber
        });

        console.log('Contact notification sent:', msg.sid);
        return msg.sid;
    } catch (error) {
        console.error('Contact notification error:', error?.message || error);
        return null;
    }
};

const sendWhatsAppConfirmation = async (bookingData) => {
    try {
        if (!client) return { businessSid: null, userSid: null };

        const { name, phone, preferredDate, preferredTime, location } = bookingData;

        // Send notification to business number
        const businessMsg = await client.messages.create({
            body: `🎯 New Booking Confirmation!\n\nDetails:\nName: ${name}\nPhone: ${phone}\nDate: ${preferredDate}\nTime: ${preferredTime}\nLocation: ${location}`,
            from: twilioNumber,
            to: twilioNumber
        });

        console.log('Booking confirmation sent:', businessMsg.sid);

        return {
            businessSid: businessMsg.sid,
            userSid: null  // Not sending to user for now
        };
    } catch (error) {
        console.error('WhatsApp confirmation error:', error?.message || error);
        return { businessSid: null, userSid: null };
    }
};

module.exports = {
    sendWhatsAppBookingNotification,
    sendWhatsAppContactNotification,
    sendWhatsAppConfirmation
};