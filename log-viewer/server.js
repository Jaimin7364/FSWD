const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

app.get('/', (req, res) => {
    const logFilePath = path.join(__dirname, 'logs', 'error1.txt');

    fs.readFile(logFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading log file:', err.message);
            return res.status(500).send(`
                <h1>Error Loading Logs</h1>
                <p>File may be missing.</p>
            `);
        }

        res.send(`
            <h1>Error Logs</h1>
            <pre style="background:#f4f4f4;padding:10px;border-radius:5px;">${data}</pre>
        `);
    });
});

app.listen(PORT, () => {
    console.log(`Log Viewer running at http://localhost:${PORT}`);
});
