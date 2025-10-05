const express = require('express');
const path = require('path');

const app = express();
const PORT = 3001;

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));

// Route to serve the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Function to validate if input is a valid number
function isValidNumber(value) {
    return !isNaN(value) && isFinite(value) && value !== null && value !== '';
}

// Function to format number for display
function formatNumber(num) {
    // Round to 2 decimal places if needed
    if (num % 1 !== 0) {
        return parseFloat(num.toFixed(2));
    }
    return num;
}

// Route to handle calculator operations
app.post('/calculate', (req, res) => {
    const { number1, number2, operation } = req.body;
    
    console.log('Received calculation request:', { number1, number2, operation });
    
    // Validate inputs
    if (!number1 || !number2 || !operation) {
        return res.send(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Calculator Error</title>
                <style>
                    body {
                        font-family: 'Comic Sans MS', cursive;
                        background: linear-gradient(135deg, #74b9ff, #fd79a8);
                        min-height: 100vh;
                        margin: 0;
                        padding: 20px;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                    }
                    .error-container {
                        background: white;
                        border-radius: 20px;
                        padding: 40px;
                        box-shadow: 0 10px 30px rgba(0,0,0,0.2);
                        max-width: 500px;
                        width: 100%;
                        text-align: center;
                    }
                    .error {
                        color: #d63031;
                        font-size: 1.3em;
                        font-weight: bold;
                        margin-bottom: 20px;
                    }
                    .back-btn {
                        background: #74b9ff;
                        color: white;
                        border: none;
                        padding: 15px 30px;
                        font-size: 1.1em;
                        border-radius: 10px;
                        cursor: pointer;
                        text-decoration: none;
                        display: inline-block;
                        transition: all 0.3s ease;
                    }
                    .back-btn:hover {
                        background: #0984e3;
                        transform: scale(1.05);
                    }
                </style>
            </head>
            <body>
                <div class="error-container">
                    <h1>😞 Oops!</h1>
                    <div class="error">
                        🚫 Please fill in all fields and select an operation!
                    </div>
                    <a href="/" class="back-btn">🔙 Try Again</a>
                </div>
            </body>
            </html>
        `);
    }
    
    // Convert to numbers
    const num1 = parseFloat(number1);
    const num2 = parseFloat(number2);
    
    // Validate if inputs are valid numbers
    if (!isValidNumber(num1) || !isValidNumber(num2)) {
        return res.send(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Calculator Error</title>
                <style>
                    body {
                        font-family: 'Comic Sans MS', cursive;
                        background: linear-gradient(135deg, #74b9ff, #fd79a8);
                        min-height: 100vh;
                        margin: 0;
                        padding: 20px;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                    }
                    .error-container {
                        background: white;
                        border-radius: 20px;
                        padding: 40px;
                        box-shadow: 0 10px 30px rgba(0,0,0,0.2);
                        max-width: 500px;
                        width: 100%;
                        text-align: center;
                    }
                    .error {
                        color: #d63031;
                        font-size: 1.3em;
                        font-weight: bold;
                        margin-bottom: 20px;
                    }
                    .back-btn {
                        background: #74b9ff;
                        color: white;
                        border: none;
                        padding: 15px 30px;
                        font-size: 1.1em;
                        border-radius: 10px;
                        cursor: pointer;
                        text-decoration: none;
                        display: inline-block;
                        transition: all 0.3s ease;
                    }
                    .back-btn:hover {
                        background: #0984e3;
                        transform: scale(1.05);
                    }
                </style>
            </head>
            <body>
                <div class="error-container">
                    <h1>😵 Invalid Input!</h1>
                    <div class="error">
                        🔢 Please enter valid numbers only! No letters allowed!
                    </div>
                    <a href="/" class="back-btn">🔙 Try Again</a>
                </div>
            </body>
            </html>
        `);
    }
    
    let result;
    let operationSymbol;
    let operationName;
    
    // Perform calculation based on operation
    switch (operation) {
        case 'add':
            result = num1 + num2;
            operationSymbol = '+';
            operationName = 'Addition';
            break;
        case 'subtract':
            result = num1 - num2;
            operationSymbol = '-';
            operationName = 'Subtraction';
            break;
        case 'multiply':
            result = num1 * num2;
            operationSymbol = '×';
            operationName = 'Multiplication';
            break;
        case 'divide':
            if (num2 === 0) {
                return res.send(`
                    <!DOCTYPE html>
                    <html lang="en">
                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <title>Calculator Error</title>
                        <style>
                            body {
                                font-family: 'Comic Sans MS', cursive;
                                background: linear-gradient(135deg, #74b9ff, #fd79a8);
                                min-height: 100vh;
                                margin: 0;
                                padding: 20px;
                                display: flex;
                                justify-content: center;
                                align-items: center;
                            }
                            .error-container {
                                background: white;
                                border-radius: 20px;
                                padding: 40px;
                                box-shadow: 0 10px 30px rgba(0,0,0,0.2);
                                max-width: 500px;
                                width: 100%;
                                text-align: center;
                            }
                            .error {
                                color: #d63031;
                                font-size: 1.3em;
                                font-weight: bold;
                                margin-bottom: 20px;
                            }
                            .back-btn {
                                background: #74b9ff;
                                color: white;
                                border: none;
                                padding: 15px 30px;
                                font-size: 1.1em;
                                border-radius: 10px;
                                cursor: pointer;
                                text-decoration: none;
                                display: inline-block;
                                transition: all 0.3s ease;
                            }
                            .back-btn:hover {
                                background: #0984e3;
                                transform: scale(1.05);
                            }
                        </style>
                    </head>
                    <body>
                        <div class="error-container">
                            <h1>🚨 Math Error!</h1>
                            <div class="error">
                                ➗ Cannot divide by zero! That's impossible!
                            </div>
                            <a href="/" class="back-btn">🔙 Try Again</a>
                        </div>
                    </body>
                    </html>
                `);
            }
            result = num1 / num2;
            operationSymbol = '÷';
            operationName = 'Division';
            break;
        default:
            return res.send(`
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Calculator Error</title>
                    <style>
                        body {
                            font-family: 'Comic Sans MS', cursive;
                            background: linear-gradient(135deg, #74b9ff, #fd79a8);
                            min-height: 100vh;
                            margin: 0;
                            padding: 20px;
                            display: flex;
                            justify-content: center;
                            align-items: center;
                        }
                        .error-container {
                            background: white;
                            border-radius: 20px;
                            padding: 40px;
                            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
                            max-width: 500px;
                            width: 100%;
                            text-align: center;
                        }
                        .error {
                            color: #d63031;
                            font-size: 1.3em;
                            font-weight: bold;
                            margin-bottom: 20px;
                        }
                        .back-btn {
                            background: #74b9ff;
                            color: white;
                            border: none;
                            padding: 15px 30px;
                            font-size: 1.1em;
                            border-radius: 10px;
                            cursor: pointer;
                            text-decoration: none;
                            display: inline-block;
                            transition: all 0.3s ease;
                        }
                        .back-btn:hover {
                            background: #0984e3;
                            transform: scale(1.05);
                        }
                    </style>
                </head>
                <body>
                    <div class="error-container">
                        <h1>❓ Unknown Operation!</h1>
                        <div class="error">
                            🤔 Please select a valid operation!
                        </div>
                        <a href="/" class="back-btn">🔙 Try Again</a>
                    </div>
                </body>
                </html>
            `);
    }
    
    // Format the result
    const formattedResult = formatNumber(result);
    
    // Send result page
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Calculator Result</title>
            <style>
                body {
                    font-family: 'Comic Sans MS', cursive;
                    background: linear-gradient(135deg, #74b9ff, #fd79a8);
                    min-height: 100vh;
                    margin: 0;
                    padding: 20px;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                }
                .result-container {
                    background: white;
                    border-radius: 20px;
                    padding: 40px;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.2);
                    max-width: 600px;
                    width: 100%;
                    text-align: center;
                }
                h1 {
                    color: #2d3436;
                    font-size: 2.5em;
                    margin-bottom: 30px;
                }
                .calculation {
                    background: #dfe6e9;
                    padding: 30px;
                    border-radius: 15px;
                    margin: 30px 0;
                    font-size: 1.5em;
                    color: #2d3436;
                    border: 3px solid #74b9ff;
                }
                .result {
                    background: #00b894;
                    color: white;
                    padding: 25px;
                    border-radius: 15px;
                    font-size: 2em;
                    font-weight: bold;
                    margin: 30px 0;
                    box-shadow: 0 5px 15px rgba(0,0,0,0.2);
                }
                .back-btn {
                    background: #74b9ff;
                    color: white;
                    border: none;
                    padding: 20px 40px;
                    font-size: 1.2em;
                    border-radius: 15px;
                    cursor: pointer;
                    text-decoration: none;
                    display: inline-block;
                    transition: all 0.3s ease;
                    font-weight: bold;
                    margin: 10px;
                }
                .back-btn:hover {
                    background: #0984e3;
                    transform: scale(1.05);
                }
                .emoji {
                    font-size: 1.5em;
                    margin: 0 10px;
                }
            </style>
        </head>
        <body>
            <div class="result-container">
                <h1>🎉 ${operationName} Result! 🎉</h1>
                
                <div class="calculation">
                    <strong>${formatNumber(num1)} ${operationSymbol} ${formatNumber(num2)}</strong>
                </div>
                
                <div class="result">
                    <span class="emoji">✨</span>
                    = ${formattedResult}
                    <span class="emoji">✨</span>
                </div>
                
                <a href="/" class="back-btn">🔄 Calculate Again</a>
            </div>
        </body>
        </html>
    `);
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Server Error</title>
            <style>
                body {
                    font-family: 'Comic Sans MS', cursive;
                    background: linear-gradient(135deg, #74b9ff, #fd79a8);
                    min-height: 100vh;
                    margin: 0;
                    padding: 20px;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                }
                .error-container {
                    background: white;
                    border-radius: 20px;
                    padding: 40px;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.2);
                    max-width: 500px;
                    width: 100%;
                    text-align: center;
                }
                .error {
                    color: #d63031;
                    font-size: 1.3em;
                    font-weight: bold;
                    margin-bottom: 20px;
                }
                .back-btn {
                    background: #74b9ff;
                    color: white;
                    border: none;
                    padding: 15px 30px;
                    font-size: 1.1em;
                    border-radius: 10px;
                    cursor: pointer;
                    text-decoration: none;
                    display: inline-block;
                    transition: all 0.3s ease;
                }
                .back-btn:hover {
                    background: #0984e3;
                    transform: scale(1.05);
                }
            </style>
        </head>
        <body>
            <div class="error-container">
                <h1>💥 Server Error!</h1>
                <div class="error">
                    😵 Something went wrong on our end!
                </div>
                <a href="/" class="back-btn">🏠 Go Home</a>
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
                    font-family: 'Comic Sans MS', cursive;
                    background: linear-gradient(135deg, #74b9ff, #fd79a8);
                    min-height: 100vh;
                    margin: 0;
                    padding: 20px;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                }
                .error-container {
                    background: white;
                    border-radius: 20px;
                    padding: 40px;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.2);
                    max-width: 500px;
                    width: 100%;
                    text-align: center;
                }
                .error {
                    color: #d63031;
                    font-size: 1.3em;
                    font-weight: bold;
                    margin-bottom: 20px;
                }
                .back-btn {
                    background: #74b9ff;
                    color: white;
                    border: none;
                    padding: 15px 30px;
                    font-size: 1.1em;
                    border-radius: 10px;
                    cursor: pointer;
                    text-decoration: none;
                    display: inline-block;
                    transition: all 0.3s ease;
                }
                .back-btn:hover {
                    background: #0984e3;
                    transform: scale(1.05);
                }
            </style>
        </head>
        <body>
            <div class="error-container">
                <h1>🔍 Page Not Found!</h1>
                <div class="error">
                    😕 The page you're looking for doesn't exist!
                </div>
                <a href="/" class="back-btn">🏠 Go Home</a>
            </div>
        </body>
        </html>
    `);
});

// Start server
app.listen(PORT, () => {
    console.log(`🧮 Kids Calculator is running on http://localhost:${PORT}`);
    console.log('Ready to help kids with math! 🎉');
});

module.exports = app;