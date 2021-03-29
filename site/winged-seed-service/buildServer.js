const express = require('express');
const runWingedSeed = require('./index');
const app = express();
const port = 3001;

app.get('/build', (req, res) => {
    runWingedSeed();
    res.send('build triggered').status(200);
});

app.listen(port, () => {
    console.log(`Build server listening at http://localhost:${port}`);
});