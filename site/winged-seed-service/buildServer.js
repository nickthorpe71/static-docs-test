const express = require('express');
const runWingedSeed = require('./index');
const app = express();
const port = 3001;

app.get('/build', (req, res) => {
    runWingedSeed();
});

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});