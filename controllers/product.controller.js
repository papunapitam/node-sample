const app = require('../app');
const Product = require('../models/product.model');
const DaoMongo = require('../db/dao-mongo').DaoMongo;
const CacheRedis  = require('../db/cache-redis.js').CacheRedis;

var cache = new CacheRedis(app.envConfig.storeRedis, app.redisClient, app.logmessage, app.consts.DEFAULT_CACHE_EXPIRE_SECS);
var dao = new DaoMongo(app.envConfig.dbMongo, app.mongoClient, app.logmessage, cache);

dao.registerModel(Product);

exports.test = function (req, resp) {
    dao.list(Product, null, function (err, results) {
        resp.send({ status: "OK", results: results || []})
    });
    resp.send('Greetings from the Test Controller!');
};