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

    // Format the phone number for WhatsApp
    const formattedPhone = phone.startsWith('+') ? phone : 
                           phone.startsWith('91') ? '+' + phone :
                           '+91' + phone.replace(/^0+/, '');

    try {
        console.log(`Attempting to send WhatsApp booking notification to business number: ${businessNumber}`);
        
        // Send booking notification to the business
        const businessMsg = await client.messages.create({
            body: `New booking:\nName: ${name}\nEmail: ${email}\nPhone: ${formattedPhone}\nDate: ${preferredDate}\nTime: ${preferredTime}\nLocation: ${location}`,
            from: fromNumber,
            to: businessNumber
        });
        console.log('WhatsApp booking notification sent successfully:', businessMsg.sid);
        
        // Send booking confirmation to the user
        const userMsg = await client.messages.create({
            body: `Dear ${name}, your booking is confirmed for ${preferredDate} at ${preferredTime} in ${location}.`,
            from: fromNumber,
            to: `whatsapp:${formattedPhone}`
        });
        console.log('User confirmation sent successfully:', userMsg.sid);

        return { userSid: userMsg.sid, businessSid: businessMsg.sid };
    } catch (error) {
        console.error('Error sending WhatsApp booking notification:', error);
        throw error;
    }
}

async function sendWhatsAppContactNotification(contactData) {
    const { name, email, message, phone } = contactData;

    if (!businessNumber) {
        throw new Error('Business WhatsApp number is not defined in environment variables');
    }

    // Format the phone number for WhatsApp
    const formattedPhone = phone.startsWith('+') ? phone : 
                           phone.startsWith('91') ? '+' + phone :
                           '+91' + phone.replace(/^0+/, '');

    try {
        console.log(`Attempting to send WhatsApp contact notification to business number: ${businessNumber}`);
        
        // Send contact notification to the business
        const businessMsg = await client.messages.create({
            body: `New contact form submission:\nName: ${name}\nEmail: ${email}\nMessage: ${message}`,
            from: fromNumber,
            to: businessNumber
        });
        console.log('WhatsApp contact notification sent successfully:', businessMsg.sid);

        // Send confirmation to the user
        const userMsg = await client.messages.create({
            body: `Dear ${name}, we have received your query. Our team will get back to you shortly. Thank you for contacting Grip&Grab Fitness.`,
            from: fromNumber,
            to: `whatsapp:${formattedPhone}`
        });
        console.log('Contact form confirmation sent to user successfully:', userMsg.sid);

        return { userSid: userMsg.sid, businessSid: businessMsg.sid };
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
            body: `Dear ${name}, we have received your query. Our team will get back to you shortly. Thank you for contacting Grip&Grab Fitness.`,
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
            from: process.env.TWILIO_WHATSAPP_NUMBER,
            to: `whatsapp:${formattedPhone}`,
            contentSid: 'HX049fbd59ead54ed9423ab93d883806f1', // Your Content SID for customer message
            contentVariables: JSON.stringify({
                1: preferredDate,
                2: preferredTime,
                3: location
            })
        });

        console.log('User confirmation sent successfully using contentSid');

        // Send booking notification to the business using the new template Content SID
        const businessMsg = await client.messages.create({
            from: process.env.TWILIO_WHATSAPP_NUMBER,
            to: `whatsapp:${process.env.BUSINESS_WHATSAPP_NUMBER}`,
            contentSid: 'HXb9a7cefdc2649bfd1f04c02d4690b05e', // Your new Content SID for business message
            contentVariables: JSON.stringify({
                1: name,
                2: email,
                3: formattedPhone,
                4: preferredDate,
                5: preferredTime,
                6: location
            })
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

