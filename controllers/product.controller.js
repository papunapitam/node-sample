const Product = require('../models/product.model');

exports.test = function (req, resp) {
    resp.send('Greetings from the Test Controller!');
};