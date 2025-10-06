const express = require('express');
const session = require('express-session');
const path = require('path');

const app = express();
const PORT = 3004;

// Set EJS as the template engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));

// Session configuration
app.use(session({
    secret: 'library-portal-secret-key-2024', // In production, use environment variable
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // Set to true when using HTTPS
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Helper function to format date
function formatDate(date) {
    return new Date(date).toLocaleString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
}

// Helper function to calculate session duration
function calculateSessionDuration(loginTime) {
    const now = new Date();
    const login = new Date(loginTime);
    const diffMs = now - login;
    
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
    
    if (hours > 0) {
        return `${hours}h ${minutes}m ${seconds}s`;
    } else if (minutes > 0) {
        return `${minutes}m ${seconds}s`;
    } else {
        return `${seconds}s`;
    }
}

// Make helper functions available in templates
app.locals.formatDate = formatDate;

// Middleware to check if user is authenticated
function requireAuth(req, res, next) {
    if (req.session && req.session.user) {
        return next();
    } else {
        return res.redirect('/');
    }
}

// Middleware to redirect authenticated users away from login
function redirectIfAuthenticated(req, res, next) {
    if (req.session && req.session.user) {
        return res.redirect('/profile');
    } else {
        return next();
    }
}

// Route to serve the login page
app.get('/', redirectIfAuthenticated, (req, res) => {
    res.render('login', { error: null });
});

// Route to handle user login
app.post('/login', redirectIfAuthenticated, (req, res) => {
    const { name, email } = req.body;
    
    console.log('Login attempt:', { name, email });
    
    // Validate input
    if (!name || !email) {
        return res.render('login', {
            error: 'Please fill in all fields.'
        });
    }
    
    // Basic name validation
    if (name.length < 2 || name.length > 50) {
        return res.render('login', {
            error: 'Name must be between 2 and 50 characters.'
        });
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.render('login', {
            error: 'Please enter a valid email address.'
        });
    }
    
    // Create user session
    const loginTime = new Date();
    req.session.user = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        loginTime: loginTime,
        sessionStarted: loginTime.toISOString()
    };
    
    console.log('User logged in successfully:', {
        name: req.session.user.name,
        email: req.session.user.email,
        sessionId: req.session.id,
        loginTime: loginTime
    });
    
    res.redirect('/profile');
});

// Route to serve the profile page (protected)
app.get('/profile', requireAuth, (req, res) => {
    const user = req.session.user;
    const sessionDuration = calculateSessionDuration(user.loginTime);
    
    console.log('Profile page accessed:', {
        user: user.name,
        sessionDuration: sessionDuration,
        sessionId: req.session.id
    });
    
    res.render('profile', {
        user: user,
        sessionDuration: sessionDuration,
        sessionId: req.session.id
    });
});

// Route to handle user logout
app.get('/logout', requireAuth, (req, res) => {
    const userName = req.session.user.name;
    const sessionDuration = calculateSessionDuration(req.session.user.loginTime);
    
    console.log('User logging out:', {
        name: userName,
        sessionDuration: sessionDuration,
        sessionId: req.session.id
    });
    
    // Destroy the session
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err);
            return res.status(500).send(`
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Logout Error</title>
                    <style>
                        body {
                            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                            min-height: 100vh;
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            padding: 20px;
                        }
                        .error-container {
                            background: white;
                            border-radius: 20px;
                            padding: 40px;
                            text-align: center;
                            max-width: 500px;
                            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
                        }
                        .error-icon { font-size: 3em; margin-bottom: 20px; }
                        .error-title { color: #e74c3c; font-size: 2em; margin-bottom: 10px; }
                        .error-message { color: #7f8c8d; margin-bottom: 20px; }
                        .back-btn {
                            background: #667eea;
                            color: white;
                            padding: 15px 30px;
                            border: none;
                            border-radius: 10px;
                            text-decoration: none;
                            display: inline-block;
                            transition: all 0.3s ease;
                        }
                        .back-btn:hover { transform: translateY(-2px); }
                    </style>
                </head>
                <body>
                    <div class="error-container">
                        <div class="error-icon">⚠️</div>
                        <h1 class="error-title">Logout Error</h1>
                        <p class="error-message">There was an error logging you out. Please try again.</p>
                        <a href="/profile" class="back-btn">Return to Profile</a>
                    </div>
                </body>
                </html>
            `);
        }
        
        // Clear the session cookie
        res.clearCookie('connect.sid');
        
        // Redirect to login with logout confirmation
        res.send(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Successfully Logged Out</title>
                <style>
                    body {
                        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        min-height: 100vh;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        padding: 20px;
                    }
                    .logout-container {
                        background: white;
                        border-radius: 20px;
                        padding: 40px;
                        text-align: center;
                        max-width: 500px;
                        box-shadow: 0 20px 40px rgba(0,0,0,0.1);
                    }
                    .success-icon { font-size: 4em; margin-bottom: 20px; }
                    .success-title { color: #28a745; font-size: 2em; margin-bottom: 10px; }
                    .success-message { color: #6c757d; margin-bottom: 20px; line-height: 1.6; }
                    .session-info {
                        background: #f8f9fa;
                        padding: 20px;
                        border-radius: 10px;
                        margin: 20px 0;
                        border: 1px solid #dee2e6;
                    }
                    .login-btn {
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        color: white;
                        padding: 15px 30px;
                        border: none;
                        border-radius: 10px;
                        text-decoration: none;
                        display: inline-block;
                        transition: all 0.3s ease;
                        font-weight: 600;
                    }
                    .login-btn:hover { transform: translateY(-2px); }
                </style>
            </head>
            <body>
                <div class="logout-container">
                    <div class="success-icon">✅</div>
                    <h1 class="success-title">Successfully Logged Out</h1>
                    <p class="success-message">
                        Thank you for using the Library Portal, <strong>${userName}</strong>!
                        Your session has been securely terminated.
                    </p>
                    <div class="session-info">
                        <strong>📊 Session Summary:</strong><br>
                        Session Duration: ${sessionDuration}<br>
                        Logout Time: ${new Date().toLocaleString()}
                    </div>
                    <a href="/" class="login-btn">🔐 Login Again</a>
                </div>
                <script>
                    // Auto-redirect to login after 10 seconds
                    setTimeout(() => {
                        window.location.href = '/';
                    }, 10000);
                </script>
            </body>
            </html>
        `);
    });
});

// Route to get session information (API endpoint)
app.get('/api/session', requireAuth, (req, res) => {
    const user = req.session.user;
    const sessionDuration = calculateSessionDuration(user.loginTime);
    
    res.json({
        user: {
            name: user.name,
            email: user.email,
            loginTime: user.loginTime,
            sessionStarted: user.sessionStarted
        },
        session: {
            id: req.session.id,
            duration: sessionDuration,
            maxAge: req.session.cookie.maxAge
        },
        server: {
            timestamp: new Date().toISOString(),
            uptime: process.uptime()
        }
    });
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        service: 'Library Portal Session Management',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        sessions: {
            store: 'memory', // In production, use Redis or database
            secure: req.session.cookie.secure,
            httpOnly: req.session.cookie.httpOnly,
            maxAge: '24 hours'
        }
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    
    res.status(500).send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Server Error</title>
            <style>
                body {
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    min-height: 100vh;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    padding: 20px;
                }
                .error-container {
                    background: white;
                    border-radius: 20px;
                    padding: 40px;
                    text-align: center;
                    max-width: 500px;
                    box-shadow: 0 20px 40px rgba(0,0,0,0.1);
                }
                .error-icon { font-size: 3em; margin-bottom: 20px; }
                .error-title { color: #e74c3c; font-size: 2em; margin-bottom: 10px; }
                .error-message { color: #7f8c8d; margin-bottom: 20px; }
                .home-btn {
                    background: #667eea;
                    color: white;
                    padding: 15px 30px;
                    border: none;
                    border-radius: 10px;
                    text-decoration: none;
                    display: inline-block;
                    transition: all 0.3s ease;
                }
                .home-btn:hover { transform: translateY(-2px); }
            </style>
        </head>
        <body>
            <div class="error-container">
                <div class="error-icon">💥</div>
                <h1 class="error-title">Server Error</h1>
                <p class="error-message">An unexpected error occurred. Please try again later.</p>
                <a href="/" class="home-btn">🏠 Go Home</a>
            </div>
        </body>
        </html>
    `);
});

// 404 handler
app.use((req, res) => {
    res.status(404).send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Page Not Found</title>
            <style>
                body {
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    min-height: 100vh;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    padding: 20px;
                }
                .error-container {
                    background: white;
                    border-radius: 20px;
                    padding: 40px;
                    text-align: center;
                    max-width: 500px;
                    box-shadow: 0 20px 40px rgba(0,0,0,0.1);
                }
                .error-icon { font-size: 3em; margin-bottom: 20px; }
                .error-title { color: #f39c12; font-size: 2em; margin-bottom: 10px; }
                .error-message { color: #7f8c8d; margin-bottom: 20px; }
                .home-btn {
                    background: #667eea;
                    color: white;
                    padding: 15px 30px;
                    border: none;
                    border-radius: 10px;
                    text-decoration: none;
                    display: inline-block;
                    transition: all 0.3s ease;
                }
                .home-btn:hover { transform: translateY(-2px); }
            </style>
        </head>
        <body>
            <div class="error-container">
                <div class="error-icon">🔍</div>
                <h1 class="error-title">Page Not Found</h1>
                <p class="error-message">The page you're looking for doesn't exist in our library portal.</p>
                <a href="/" class="home-btn">🏠 Go Home</a>
            </div>
        </body>
        </html>
    `);
});

// Start server
app.listen(PORT, () => {
    console.log(`📚 Library Portal with Session Management is running on http://localhost:${PORT}`);
    console.log(`
🔧 Session Configuration:
- Secret: ${session.secret ? 'Configured' : 'Not configured'}
- Max Age: 24 hours
- HTTP Only: true
- Secure: false (development mode)

🎯 Features:
- User login/logout with session management
- Session duration tracking
- Profile page with session information
- Secure session destruction
- Input validation and error handling

🚀 Ready to manage user sessions!
    `);
});

module.exports = app;