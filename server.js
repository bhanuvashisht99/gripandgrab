require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');
const { sendWhatsAppBookingNotification, sendWhatsAppContactNotification, checkMessageStatus, sendWhatsAppConfirmation, sendContactFormConfirmation  } = require('./whatsapp');
console.log('Imported WhatsApp functions:', {
  sendWhatsAppBookingNotification: typeof sendWhatsAppBookingNotification,
  sendWhatsAppContactNotification: typeof sendWhatsAppContactNotification,
  checkMessageStatus: typeof checkMessageStatus,
  sendWhatsAppConfirmation: typeof sendWhatsAppConfirmation
});

function encodePassword(password) {
  return encodeURIComponent(password);
}

const username = process.env.MONGODB_USERNAME;
const password = encodePassword(process.env.MONGODB_PASSWORD);
const cluster = process.env.MONGODB_CLUSTER;

const uri = `mongodb+srv://${username}:${password}@${cluster}/?retryWrites=true&w=majority&appName=GripandGrab`;

const app = express();
app.use(cors({
  origin: 'http://127.0.0.1:5500'
}));
const port = process.env.PORT || 3000;


app.use(express.json());
app.use(express.static('public'));

const client = new MongoClient(uri);

async function connectToDatabase() {
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const database = client.db('gripandgrab');
    
    // Test route to check database connection
    app.get('/test-db', async (req, res) => {
      try {
        const collection = database.collection('test');
        await collection.insertOne({ test: 'data' });
        res.status(200).json({ message: 'Database connection successful' });
      } catch (error) {
        console.error('Error testing database:', error);
        res.status(500).json({ error: 'Database connection failed' });
      }
    });

    app.post('/api/contact', async (req, res) => {
      console.log('Received contact form submission:', req.body);
      try {
        const { name, email, message, phone } = req.body;
        
        // Validate input
        if (!name || !email || !message || !phone) {
          console.log('Missing required fields');
          return res.status(400).json({ error: 'Missing required fields' });
        }
        
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          console.log('Invalid email format');
          return res.status(400).json({ error: 'Invalid email format' });
        }
    
        // Validate phone number
        const phoneRegex = /^(\+?91|0)?[6789]\d{9}$/;
        if (!phoneRegex.test(phone)) {
          console.log('Invalid phone number format');
          return res.status(400).json({ error: 'Invalid phone number format' });
        }
    
        const collection = database.collection('contacts');
        console.log('Inserting contact into database');
        const result = await collection.insertOne({ name, email, message, phone, createdAt: new Date() });
        console.log('Contact inserted:', result.insertedId);
    
        // Send WhatsApp notification to business
        console.log('Sending WhatsApp notification to business');
        const businessSid = await sendWhatsAppContactNotification({ name, email, message });
    
        // Send WhatsApp confirmation to user
        console.log('Sending WhatsApp confirmation to user');
        const userSid = await sendContactFormConfirmation({ name, email, message, phone });
    
        res.status(200).json({ 
          message: 'Contact form submitted successfully', 
          id: result.insertedId,
          businessNotificationSid: businessSid,
          userConfirmationSid: userSid
        });
      } catch (error) {
        console.error('Error submitting contact form:', error);
        res.status(500).json({ error: error.message || 'An error occurred while submitting the form. Please try again.' });
      }
    });

    app.post('/api/book-session', async (req, res) => {
      console.log('Received booking request');
      console.log('Request body:', req.body);
      try {
        const { name, email, phone, preferredDate, preferredTime, location } = req.body;
        
        // Validate input
        const requiredFields = ['name', 'email', 'phone', 'preferredDate', 'preferredTime', 'location'];
        const missingFields = requiredFields.filter(field => !req.body[field]);
        if (missingFields.length > 0) {
          console.log('Missing required fields:', missingFields);
          return res.status(400).json({ error: `Missing required fields: ${missingFields.join(', ')}` });
        }
        
        // Basic phone number validation
        const phoneRegex = /^\+?[1-9]\d{1,14}$/;
        if (!phoneRegex.test(phone)) {
          console.log('Invalid phone number format');
          return res.status(400).json({ error: 'Invalid phone number format' });
        }
    
        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          console.log('Invalid email format');
          return res.status(400).json({ error: 'Invalid email format' });
        }
    
        // Validate date and time
        const bookingDate = new Date(`${preferredDate}T${preferredTime}`);
        if (isNaN(bookingDate.getTime())) {
          console.log('Invalid date or time format');
          return res.status(400).json({ error: 'Invalid date or time format' });
        }
    
        if (bookingDate < new Date()) {
          console.log('Booking date is in the past');
          return res.status(400).json({ error: 'Booking date must be in the future' });
        }
    
        const collection = database.collection('bookings');
        console.log('Inserting booking into database');
        const result = await collection.insertOne({ 
          name, email, phone, preferredDate, preferredTime, location, 
          createdAt: new Date() 
        });
        console.log('Booking inserted:', result.insertedId);
    
        // Send WhatsApp notification to business number
        console.log('Sending WhatsApp notification...');
        let messageSid;
        try {
          messageSid = await sendWhatsAppBookingNotification({ name, email, phone, preferredDate, preferredTime, location });
          console.log('WhatsApp notification sent successfully. SID:', messageSid);
        } catch (whatsappError) {
          console.error('Error sending WhatsApp notification:', whatsappError);
          // Don't throw error here, continue with the booking process
        }
    
         // Send WhatsApp confirmations
    console.log('Sending WhatsApp confirmations...');
    let messageSids;
    try {
      messageSids = await sendWhatsAppConfirmation({ name, email, phone, preferredDate, preferredTime, location });
      console.log('WhatsApp confirmations sent successfully. Business SID:', messageSids.businessSid, 'User SID:', messageSids.userSid);
    } catch (whatsappError) {
      console.error('Error sending WhatsApp confirmations:', whatsappError);
      // Don't throw error here, continue with the booking process
    }

       // Check message statuses after 10 seconds if messageSids exist
       if (messageSids) {
        setTimeout(async () => {
            try {
                if (messageSids.businessSid) {
                    const businessStatus = await checkMessageStatus(messageSids.businessSid);
                    console.log(`Business message status after 10 seconds: ${businessStatus}`);
                }
                if (messageSids.userSid) {
                    const userStatus = await checkMessageStatus(messageSids.userSid);
                    console.log(`User message status after 10 seconds: ${userStatus}`);
                }
            } catch (statusError) {
                console.error('Error checking message status:', statusError);
            }
        }, 10000);
    }
        
    res.status(200).json({ 
      message: 'Booking successful', 
      id: result.insertedId,
      whatsappMessageSids: messageSids || null
        });
      }
      catch (error) {
        console.error('Booking error:', error);
        console.error('Error stack:', error.stack);
        res.status(500).json({ 
          error: 'An unexpected error occurred while processing your booking. Please try again.',
          details: error.message
        });
      }
    });    
    // Start the server
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });

  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
  }
}

connectToDatabase();