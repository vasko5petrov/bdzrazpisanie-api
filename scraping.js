const express = require('express');
const cors = require('cors');

// Init App
const app = express();

const trains = require('./routes/trains');

app.use(cors());

app.get('/', (req, res) => {
	res.send('Invalid Endpoint');
});

app.use('/api', trains);

let port = process.env.PORT || 8080;

// Start server
app.listen(port, () => {
	console.log(`Server started on port ${port}`);
});