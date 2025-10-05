const express = require('express');
const app = express();
const PORT = 3000;

let counter = 0; 

app.use(express.static('public'));
app.use(express.json());

app.get('/count', (req, res) => {
    res.json({ count: counter });
});


app.post('/increase', (req, res) => {
    counter++;
    res.json({ count: counter });
});

app.post('/decrease', (req, res) => {
    counter--;
    res.json({ count: counter });
});


app.post('/reset', (req, res) => {
    counter = 0;
    res.json({ count: counter });
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
