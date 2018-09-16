module.exports.CacheRedis = CacheRedis;

function CacheRedis(cfg, conn, log, defaultExpireSeconds) {
    if (!cfg || !conn || !log) {
        throw new Error("Initialization Error");
    }

    this.config = cfg;
    this.connection = conn;
    this.log = log;

    this.expireSeconds = defaultExpireSeconds || 60;
}

CacheRedis.prototype.putItem = function(item, callback) {
    var that = this;
    var itemId = item[item.getEntityIndex()];
    var cacheKey = item.getEntityName() + ':' + itemId;
    var cacheValue = JSON.stringify(item || {});
    this.log('cache putItem(): key = ' + cacheKey + ' value = ...');
    this.connection.multi()
        .set(cacheKey, cacheValue)
        .expire(cacheKey, item.getEntityExpiration() || that.expireSeconds)
        .exec(function (err, results) {
            if (err) {
                that.log('Error: putItem(): ' + err);
            }

            if (callback) {
                callback(err, item);
            }
            return item;
        });
};