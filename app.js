// app.js
const express = require('express');
const bodyParser = require('body-parser');
const productRoute = require('./routes/product.route');
const PORT = 1234;

// initialize app
const server = express();

// set port
server.set('port', process.env.PORT, PORT);

// register routes
server.use('/product', productRoute);

// binding
server.listen(PORT, () => {
	console.log('Server is up and running on port number ' + PORT);
});