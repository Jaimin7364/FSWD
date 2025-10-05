const express = require('express');
const app = express();
const PORT = 3000;

const homeRoute = require('./routes/home');
app.use(express.json());

app.use('/', homeRoute);

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
