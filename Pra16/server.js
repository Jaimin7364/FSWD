const express = require('express');
const nodemailer = require('nodemailer');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3005;

// Set EJS as the template engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));

// Configure NodeMailer transporter
let transporter;
let emailStatus = '❌ Not configured';

try {
    // Check if required email credentials are provided
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.log('⚠️  Email credentials missing in .env file');
        emailStatus = '❌ Missing credentials';
    } else {
        transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: parseInt(process.env.SMTP_PORT) || 587,
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            },
            tls: {
                rejectUnauthorized: false 
            }
        });
        
        emailStatus = '🔄 Configured (verifying...)';
        console.log('📧 Email transporter configured successfully');
    }
} catch (error) {
    console.error('❌ Error configuring email transporter:', error.message);
    console.log('⚠️  Email functionality will be disabled. Please check your .env configuration.');
    emailStatus = '❌ Configuration error';
}

// Verify email configuration on startup
if (transporter) {
    transporter.verify((error, success) => {
        if (error) {
            console.error('❌ Email verification failed:', error.message);
            console.log('⚠️  Please check your email credentials in .env file');
            emailStatus = '❌ Verification failed';
        } else {
            console.log('✅ Email server is ready to send messages');
            emailStatus = '✅ Ready to send';
        }
    });
}

// Helper function to validate email
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Helper function to sanitize input
function sanitizeInput(input) {
    if (typeof input !== 'string') return '';
    return input.trim().replace(/[<>]/g, ''); // Basic XSS prevention
}

// Helper function to format the email HTML
function generateEmailHTML(formData) {
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; }
                .content { padding: 20px; }
                .field { margin-bottom: 15px; }
                .label { font-weight: bold; color: #2c3e50; }
                .value { margin-top: 5px; padding: 10px; background: #f8f9fa; border-radius: 5px; }
                .message-content { background: #e7f3ff; padding: 15px; border-radius: 8px; border-left: 4px solid #667eea; }
                .footer { background: #f8f9fa; padding: 15px; text-align: center; color: #6c757d; }
            </style>
        </head>
        <body>
            <div class="header">
                <h2>💼 New Portfolio Contact Message</h2>
                <p>You've received a new message through your portfolio contact form</p>
            </div>
            
            <div class="content">
                <div class="field">
                    <div class="label">👤 From:</div>
                    <div class="value">${formData.name}</div>
                </div>
                
                <div class="field">
                    <div class="label">📧 Email:</div>
                    <div class="value">${formData.email}</div>
                </div>
                
                ${formData.phone ? `
                <div class="field">
                    <div class="label">📱 Phone:</div>
                    <div class="value">${formData.phone}</div>
                </div>
                ` : ''}
                
                <div class="field">
                    <div class="label">📋 Subject:</div>
                    <div class="value">${formData.subject}</div>
                </div>
                
                <div class="field">
                    <div class="label">💬 Message:</div>
                    <div class="message-content">${formData.message.replace(/\n/g, '<br>')}</div>
                </div>
                
                <div class="field">
                    <div class="label">⏰ Received:</div>
                    <div class="value">${new Date().toLocaleString()}</div>
                </div>
            </div>
            
            <div class="footer">
                <p>📬 This message was sent through your portfolio contact form</p>
                <p>Reply directly to ${formData.email} to respond to this inquiry</p>
            </div>
        </body>
        </html>
    `;
}

// Route to serve the main portfolio page
app.get('/', (req, res) => {
    res.render('index');
});

// Route to handle contact form submission
app.post('/send-message', async (req, res) => {
    try {
        // Extract and sanitize form data
        const formData = {
            name: sanitizeInput(req.body.name),
            email: sanitizeInput(req.body.email),
            phone: sanitizeInput(req.body.phone),
            subject: sanitizeInput(req.body.subject),
            message: sanitizeInput(req.body.message)
        };

        console.log('📬 Received contact form submission:', {
            name: formData.name,
            email: formData.email,
            subject: formData.subject,
            timestamp: new Date().toISOString()
        });

        // Validate required fields
        if (!formData.name || !formData.email || !formData.subject || !formData.message) {
            return res.status(400).json({
                error: 'Please fill in all required fields (name, email, subject, and message).'
            });
        }

        // Validate name length
        if (formData.name.length < 2 || formData.name.length > 50) {
            return res.status(400).json({
                error: 'Name must be between 2 and 50 characters long.'
            });
        }

        // Validate email format
        if (!isValidEmail(formData.email)) {
            return res.status(400).json({
                error: 'Please enter a valid email address.'
            });
        }

        // Validate subject length
        if (formData.subject.length > 100) {
            return res.status(400).json({
                error: 'Subject must be 100 characters or less.'
            });
        }

        // Validate message length
        if (formData.message.length < 10 || formData.message.length > 1000) {
            return res.status(400).json({
                error: 'Message must be between 10 and 1000 characters long.'
            });
        }

        // Check if email transporter is configured
        if (!transporter) {
            console.error('❌ Email transporter not configured');
            return res.status(500).json({
                error: 'Email service is not configured. Please contact the administrator.'
            });
        }

        // Configure email options
        const mailOptions = {
            from: {
                name: 'Portfolio Contact Form',
                address: process.env.EMAIL_FROM || process.env.SMTP_USER
            },
            to: process.env.EMAIL_TO || process.env.SMTP_USER,
            replyTo: formData.email,
            subject: `Portfolio Contact: ${formData.subject}`,
            text: `
Name: ${formData.name}
Email: ${formData.email}
Phone: ${formData.phone || 'Not provided'}
Subject: ${formData.subject}

Message:
${formData.message}

---
Sent from your portfolio contact form at ${new Date().toLocaleString()}
            `,
            html: generateEmailHTML(formData)
        };

        // Send email
        const info = await transporter.sendMail(mailOptions);
        
        console.log('✅ Email sent successfully:', {
            messageId: info.messageId,
            to: mailOptions.to,
            from: formData.email,
            subject: formData.subject
        });

        // Send success response
        res.json({
            message: `Thank you, ${formData.name}! Your message has been sent successfully. I'll get back to you soon at ${formData.email}.`
        });

    } catch (error) {
        console.error('❌ Error sending email:', error);
        
        // Check for specific email errors
        if (error.code === 'EAUTH') {
            res.status(500).json({
                error: 'Email authentication failed. Please try again later or contact me directly.'
            });
        } else if (error.code === 'ECONNECTION') {
            res.status(500).json({
                error: 'Unable to connect to email service. Please try again later.'
            });
        } else {
            res.status(500).json({
                error: 'Failed to send message. Please try again or contact me directly via email.'
            });
        }
    }
});

// Route to test email configuration (for development)
app.get('/test-email', async (req, res) => {
    if (process.env.NODE_ENV === 'production') {
        return res.status(404).json({ error: 'Not found' });
    }

    try {
        if (!transporter) {
            return res.json({ 
                status: 'error', 
                message: 'Email transporter not configured' 
            });
        }

        const testMailOptions = {
            from: process.env.EMAIL_FROM || process.env.SMTP_USER,
            to: process.env.EMAIL_TO || process.env.SMTP_USER,
            subject: 'Portfolio Contact Form - Test Email',
            text: 'This is a test email to verify the email configuration is working correctly.',
            html: `
                <h2>📧 Test Email</h2>
                <p>This is a test email to verify the email configuration is working correctly.</p>
                <p><strong>Timestamp:</strong> ${new Date().toLocaleString()}</p>
                <p><strong>Status:</strong> Email service is functioning properly ✅</p>
            `
        };

        const info = await transporter.sendMail(testMailOptions);
        
        res.json({
            status: 'success',
            message: 'Test email sent successfully',
            messageId: info.messageId
        });

    } catch (error) {
        console.error('Test email error:', error);
        res.json({
            status: 'error',
            message: error.message
        });
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        service: 'Portfolio Contact Form with Email',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        email: {
            configured: !!transporter,
            host: process.env.SMTP_HOST || 'Not configured',
            port: process.env.SMTP_PORT || 'Not configured'
        }
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    
    res.status(500).json({
        error: 'An unexpected server error occurred. Please try again later.'
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Endpoint not found'
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`💼 Portfolio Contact Form is running on http://localhost:${PORT}`);
    
    // Display configuration after a short delay to allow email verification
    setTimeout(() => {
        console.log(`
🔧 Configuration:
- Email Host: ${process.env.SMTP_HOST || 'smtp.gmail.com'}
- Email Port: ${process.env.SMTP_PORT || '587'}
- Email From: ${process.env.EMAIL_FROM || 'contact@yoranza.tech'}
- Email To: ${process.env.EMAIL_TO || 'jaiminraval100@gmail.com'}

📧 Email Status: ${emailStatus}


🚀 Ready to receive contact form submissions!
        `);
    }, 1000); // Wait 1 second for email verification to complete
});

module.exports = app;