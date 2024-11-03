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

const sendWhatsAppBookingNotification = async (bookingData) => {
    try {
        if (!client) return null;

        const { name, preferredDate, preferredTime, location } = bookingData;

        // Using your approved template format
        const message = await client.messages.create({
            from: fromNumber,
            to: toNumber,
            body: `Your booking with Grip&Grab Fitness is confirmed!

Date: ${preferredDate}
Time: ${preferredTime}
Location: ${location}

What to bring:
- Comfortable workout clothes
- Water bottle
- Towel`
        });

        console.log('Booking notification sent:', message.sid);
        return message.sid;
    } catch (error) {
        console.error('Booking notification error:', error);
        if (error.code) {
            console.error('Twilio error code:', error.code);
            console.error('More info:', error.moreInfo);
        }
        return null;
    }
};

const sendWhatsAppContactNotification = async ({ name, email, message, phone }) => {
    try {
        if (!client) return null;

        // Using a similar format to the approved template
        const msg = await client.messages.create({
            from: fromNumber,
            to: toNumber,
            body: `New Contact Form Enquiry:

Name: ${name}
Email: ${email}
Phone: ${phone}
Message: ${message}

We will respond shortly.`
        });

        console.log('Contact notification sent:', msg.sid);
        return msg.sid;
    } catch (error) {
        console.error('Contact notification error:', error);
        if (error.code) {
            console.error('Twilio error code:', error.code);
        }
        return null;
    }
};

const sendWhatsAppConfirmation = async (bookingData) => {
    try {
        const notificationSid = await sendWhatsAppBookingNotification(bookingData);
        return {
            businessSid: notificationSid,
            userSid: null // We'll add user notification later if needed
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