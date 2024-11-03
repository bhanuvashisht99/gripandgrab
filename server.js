require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { MongoClient } = require('mongodb');
const { 
  sendWhatsAppBookingNotification, 
  sendWhatsAppContactNotification, 
  checkMessageStatus, 
  sendWhatsAppConfirmation, 
  sendContactFormConfirmation 
} = require('./whatsapp');

// MongoDB Configuration
function encodePassword(password) {
  return encodeURIComponent(password);
}

const username = process.env.MONGODB_USERNAME;
const password = encodePassword(process.env.MONGODB_PASSWORD);
const cluster = process.env.MONGODB_CLUSTER;
const uri = `mongodb+srv://${username}:${password}@${cluster}/?retryWrites=true&w=majority&appName=GripandGrab`;

// Express Configuration
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// app.use(cors({
//   origin: process.env.NODE_ENV === 'production' 
//     ? 'https://gripandgrab.onrender.com'
//     : 'http://localhost:3000',
//   credentials: true
// }));
// Update CORS configuration
app.use(cors({
  origin: '*', // Temporarily allow all origins for testing
  methods: ['GET', 'POST'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Serve static files from root directory for now
app.use(express.static('./'));

// Database Connection
let database;
const client = new MongoClient(uri);

// API Routes
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
          return res.status(400).json({ error: 'Missing required fields' });
      }

      // Save to database
      const collection = database.collection('contacts');
      const result = await collection.insertOne({ 
          name, email, message, phone, 
          createdAt: new Date() 
      });

      // Send notifications (only once)
      const notifications = await sendWhatsAppContactNotification({ 
          name, email, message, phone 
      });

      res.status(200).json({ 
          success: true,
          message: 'Contact form submitted successfully',
          id: result.insertedId,
          notifications
      });
  } catch (error) {
      console.error('Error submitting contact form:', error);
      res.status(500).json({ error: error.message });
  }
});
app.post('/api/book-session', async (req, res) => {
  console.log('Received booking request:', req.body);
  try {
    const { name, email, phone, preferredDate, preferredTime, location } = req.body;
    
    // Validate required fields
    const requiredFields = ['name', 'email', 'phone', 'preferredDate', 'preferredTime', 'location'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    if (missingFields.length > 0) {
      return res.status(400).json({ 
        error: `Missing required fields: ${missingFields.join(', ')}` 
      });
    }
    
    // Validate phone and email
    if (!/^\+?[1-9]\d{1,14}$/.test(phone)) {
      return res.status(400).json({ error: 'Invalid phone number format' });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Validate booking date
    const bookingDate = new Date(`${preferredDate}T${preferredTime}`);
    if (isNaN(bookingDate.getTime()) || bookingDate < new Date()) {
      return res.status(400).json({ error: 'Invalid or past booking date' });
    }

    // Save booking
    const collection = database.collection('bookings');
    const result = await collection.insertOne({ 
      name, email, phone, preferredDate, preferredTime, location, 
      createdAt: new Date() 
    });

    // Send notifications
    const messageSids = await sendWhatsAppConfirmation({ 
      name, email, phone, preferredDate, preferredTime, location 
    });

    // Check message status after delay
    if (messageSids) {
      setTimeout(async () => {
        try {
          await Promise.all([
            checkMessageStatus(messageSids.businessSid),
            checkMessageStatus(messageSids.userSid)
          ]);
        } catch (error) {
          console.error('Error checking message status:', error);
        }
      }, 10000);
    }

    res.status(200).json({ 
      message: 'Booking successful', 
      id: result.insertedId,
      whatsappMessageSids: messageSids
    });
  } catch (error) {
    console.error('Booking error:', error);
    res.status(500).json({ 
      error: 'An error occurred while processing your booking. Please try again.' 
    });
  }
});

// Catch-all route to serve index.html
app.get('*', (req, res) => {
  res.sendFile('index.html', { root: './' });
});

// Initialize server
async function startServer() {
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    database = client.db('gripandgrab');

    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
      console.log('Environment:', process.env.NODE_ENV || 'development');
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Handle process termination
process.on('SIGINT', async () => {
  try {
    await client.close();
    console.log('MongoDB connection closed');
    process.exit(0);
  } catch (error) {
    console.error('Error closing MongoDB connection:', error);
    process.exit(1);
  }
});

// Start the server
startServer();