const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

// Set EJS as the template engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));

// Helper function to validate if input is a valid positive number
function isValidIncome(value) {
    const num = parseFloat(value);
    return !isNaN(num) && isFinite(num) && num >= 0 && value !== null && value !== '';
}

// Helper function to format numbers with commas and 2 decimal places
function formatNumber(num) {
    if (typeof num !== 'number') {
        num = parseFloat(num);
    }
    return num.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

// Make formatNumber available in templates
app.locals.formatNumber = formatNumber;

// Route to serve the main tax form page
app.get('/', (req, res) => {
    res.render('index', { error: null });
});

// Route to handle income calculation
app.post('/calculate-income', (req, res) => {
    const { income1, income2 } = req.body;
    
    console.log('Received income calculation request:', { income1, income2 });
    
    // Validate that both income fields are provided
    if (!income1 || !income2) {
        return res.render('index', {
            error: 'Both income fields are required. Please enter values for both primary and secondary income sources.'
        });
    }
    
    // Convert to numbers
    const primaryIncome = parseFloat(income1);
    const secondaryIncome = parseFloat(income2);
    
    // Validate that inputs are valid numbers
    if (!isValidIncome(income1) || !isValidIncome(income2)) {
        return res.render('index', {
            error: 'Please enter valid positive numbers for income amounts. Negative values and non-numeric inputs are not allowed.'
        });
    }
    
    // Additional validation for reasonable income ranges
    const maxIncome = 99999999.99; // 99 million max
    if (primaryIncome > maxIncome || secondaryIncome > maxIncome) {
        return res.render('index', {
            error: 'Income amounts seem unreasonably high. Please verify your entries and ensure they are in the correct currency.'
        });
    }
    
    // Check for extremely small decimal values that might be input errors
    if ((primaryIncome > 0 && primaryIncome < 0.01) || (secondaryIncome > 0 && secondaryIncome < 0.01)) {
        return res.render('index', {
            error: 'Income amounts must be at least $0.01. Please check your entries.'
        });
    }
    
    // Calculate total income - all calculations done server-side
    const totalIncome = primaryIncome + secondaryIncome;
    
    // Log the calculation for debugging
    console.log('Income calculation successful:', {
        primaryIncome,
        secondaryIncome,
        totalIncome
    });
    
    // Render results page with calculated data
    res.render('results', {
        income1: primaryIncome,
        income2: secondaryIncome,
        totalIncome: totalIncome,
        calculationDate: new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    });
});

// Route to handle form reset (optional convenience route)
app.get('/reset', (req, res) => {
    res.redirect('/');
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server error:', err.stack);
    
    // Check if it's a validation error
    if (err.name === 'ValidationError') {
        return res.render('index', {
            error: 'There was a validation error with your input. Please check your entries and try again.'
        });
    }
    
    // Generic server error response
    res.status(500).render('index', {
        error: 'An unexpected server error occurred. Please try again later.'
    });
});

// 404 handler for unknown routes
app.use((req, res) => {
    res.status(404).render('index', {
        error: 'Page not found. You have been redirected to the tax income calculator.'
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`💰 Tax Income Calculator is running on http://localhost:${PORT}`);
    console.log('Ready to calculate total income from multiple sources! 📊');
    console.log(`
Features:
- Server-side income calculations
- Input validation and error handling
- EJS templating for dynamic content
- User-friendly interface with professional styling
- Print-friendly results page
    `);
});

module.exports = app;