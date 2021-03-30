const express = require('express');
const wingedSeed = require('./index');
const app = express();
const port = 3001;

app.post('/build', (req, res) => {
    wingedSeed();
    console.log('build triggered');
    res.send('build triggered').status(200);
});

app.listen(port, () => {
    console.log(`Build server listening at http://localhost:${port}`);
});