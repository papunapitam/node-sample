// app.js

process.env.NODE_ENV = "default";
console.log(process.env.NODE_ENV);

var app,
    util            = require('util'),
    cluster         = require('cluster'),
    express         = require('express'),
    async           = require('async'),
    mongoose        = require('mongoose'),
    redis           = require('redis');


var envConfig = require('config'),
    CFG_SERVER      = envConfig.server,
    CFG_DB_MYSQL    = envConfig.dbMysql,
    CFG_DB_MONGO    = envConfig.dbMongo,
    CFG_STORE_REDIS = envConfig.storeRedis;

var port            = process.env.PORT || CFG_SERVER.port,
    forks           = process.env.FORKS || CFG_SERVER.forks;

// exception listener
process.addListener('uncaughtException', function (err, stack) {
    var message = 'Caught exception: ' + err + '\n' + err.stack;
    if (app && app.logmessage) {
        app.logmessage(message);
    } else {
        console.log(message);
    }
});

// logger wrapper
var logmessage = function(message) {
    message = '#' + (process.env.NODE_WORKER_ID ? process.env.NODE_WORKER_ID : 'M') + ': ' + message;
        console.log(message);
    };

// initialize app
var app = express();

app.envConfig = envConfig;
//app.defs =
app.logmessage = logmessage;

// we want to set up connections only on "workers, not on cluster/master
    // and we want to do this in parallel, but make sure we do it before continuing with starting server..
async.parallel({
		mongoConnection: function(cb1) {
			// if mongo configuration is there...
			if (CFG_DB_MONGO) {
				var mongoURI = 'mongodb://' + CFG_DB_MONGO.username + ':' + CFG_DB_MONGO.password + '@' + CFG_DB_MONGO.host + ':' + CFG_DB_MONGO.port + '/' + CFG_DB_MONGO.dbname;
				logmessage('MongoDB config: ' + mongoURI);
				var mongoClient = mongoose.createConnection(mongoURI);
				cb1(null, mongoClient);
			} else {
				cb1(null, null);
			}
		},
		redisConnection: function(cb2) {
			// if redis configuration is there...
			if (CFG_STORE_REDIS) {
				var redisClient = redis.createClient(CFG_STORE_REDIS.port, CFG_STORE_REDIS.host);
				redisClient.auth(CFG_STORE_REDIS.password, function() {
					redisClient.select(CFG_STORE_REDIS.dbname, function(err,res) {
						logmessage('Redis config: ' + redisClient.host + ':' + redisClient.port + ' @ ' + redisClient.selected_db + ' with ' + redisClient.auth_pass);
						cb2(null, redisClient);
					});
				});
			} else {
				cb2(null, null);
			}
		},
	},
	// here we get all of the connections and run the actual server
	function(err, results) {
		logmessage('Came back with ' + Object.keys(results).length + ' connection(s)...');
		app.mongoClient = results.mongoConnection;
		app.redisClient = results.redisConnection;

		// load routes
		var productRoute = require('./routes/product.route');
		app.use('/product', productRoute);

		app.listen(port, function() {
			app.logmessage('Listening on :' + port + ' in "' + app.settings.env + '" mode...');
			return 0;
		});
	}
	)
;

// export app everywhere
module.exports.app = app;