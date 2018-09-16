// app.js
const express = require('express');
const bodyParser = require('body-parser');
const product = require('./routes/product.route');

// initialize our express app
const app = express();

app.use('/product', product);

let port = 1234;

app.listen(port, () => {
	console.log('Server is up and running on port number ' + port);
});