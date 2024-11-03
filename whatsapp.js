require('dotenv').config();
const twilio = require('twilio');

// Initialize Twilio client
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = accountSid && authToken ? twilio(accountSid, authToken) : null;

// WhatsApp numbers (with proper formatting)
const fromNumber = 'whatsapp:+918700107977';    // Twilio number for sending
const toNumber = 'whatsapp:+918448222454';      // Your number for receiving

// Debug log the numbers
console.log('WhatsApp Numbers:', {
    from: fromNumber,
    to: toNumber,
    hasClient: !!client
});

const sendContactFormConfirmation = async ({ name, email, message, phone }) => {
    try {
        if (!client) return null;
        
        const msg = await client.messages.create({
            body: `New Contact Form:\nName: ${name}\nEmail: ${email}\nPhone: ${phone}\nMessage: ${message}`,
            from: fromNumber,
            to: toNumber  // Send to your business number
        });

        console.log('Contact form confirmation sent:', msg.sid);
        return msg.sid;
    } catch (error) {
        console.error('Contact form confirmation error:', error);
        return null;
    }
};

const sendWhatsAppContactNotification = async ({ name, email, message }) => {
    try {
        if (!client) return null;

        const msg = await client.messages.create({
            body: `📩 New Contact Form:\nName: ${name}\nEmail: ${email}\nMessage: ${message}`,
            from: fromNumber,
            to: toNumber  // Send to your business number
        });

        console.log('Contact notification sent:', msg.sid);
        return msg.sid;
    } catch (error) {
        console.error('Contact notification error:', error);
        return null;
    }
};

const sendWhatsAppBookingNotification = async (bookingData) => {
    try {
        if (!client) return null;

        const { name, email, phone, preferredDate, preferredTime, location } = bookingData;
        
        const message = await client.messages.create({
            body: `🏋️‍♂️ New Booking!\n\nName: ${name}\nEmail: ${email}\nPhone: ${phone}\nDate: ${preferredDate}\nTime: ${preferredTime}\nLocation: ${location}`,
            from: fromNumber,
            to: toNumber  // Send to your business number
        });

        console.log('Booking notification sent:', message.sid);
        return message.sid;
    } catch (error) {
        console.error('Booking notification error:', error);
        return null;
    }
};

const sendWhatsAppConfirmation = async (bookingData) => {
    try {
        if (!client) return { businessSid: null, userSid: null };

        const { name, phone, preferredDate, preferredTime, location } = bookingData;

        const businessMsg = await client.messages.create({
            body: `🎯 New Booking!\nName: ${name}\nDate: ${preferredDate}\nTime: ${preferredTime}\nLocation: ${location}`,
            from: fromNumber,
            to: toNumber  // Send to your business number
        });

        console.log('Business notification sent:', businessMsg.sid);

        return {
            businessSid: businessMsg.sid,
            userSid: null // We'll implement user notification later
        };
    } catch (error) {
        console.error('WhatsApp confirmation error:', error);
        return { businessSid: null, userSid: null };
    }
};

module.exports = {
    sendWhatsAppBookingNotification,
    sendWhatsAppContactNotification,
    sendWhatsAppConfirmation,
    sendContactFormConfirmation
};