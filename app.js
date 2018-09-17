// app.js
process.env.NODE_ENV = "default";
process.env.PORT = 1234;

    util            = require('util'),
    cluster         = require('cluster'),
    express         = require('express'),
    async           = require('async'),
    mongoose        = require('mongoose'),
    redis           = require('redis');

var	envConfig 		= require('config'),
    CFG_SERVER      = envConfig.server,
    CFG_DB_MYSQL    = envConfig.dbMysql,
    CFG_DB_MONGO    = envConfig.dbMongo,
    CFG_STORE_REDIS = envConfig.storeRedis;
envConfig.dbMongo = CFG_DB_MONGO;

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
	console.log(message);
    message = '#' + (process.env.NODE_WORKER_ID ? process.env.NODE_WORKER_ID : 'M') + ': ' + message;
        console.log(message);
    };

// initialize app
const app = express();
app.set('view engine', 'ejs');
app.set('view options', {
	layout: false
});

app.envConfig = envConfig;

async.parallel({
		mongoConnection: function(cb2) {
			// if mongo configuration is there...
			if (CFG_DB_MONGO) {
				//var mongoURI = 'mongodb://' + CFG_DB_MONGO.username + ':' + CFG_DB_MONGO.password + '@' + CFG_DB_MONGO.host + ':' + CFG_DB_MONGO.port + '/' + CFG_DB_MONGO.dbname;
				var mongoURI = 'mongodb://localhost:32772/node-sample-db';
				logmessage('MongoDB config: ' + mongoURI);
				var mongoClient = mongoose.createConnection(mongoURI);
				cb2(null, mongoClient);
			} else {
				cb2(null, null);
			}
		},
		/*redisConnection: function(cb3) {
			// if redis configuration is there...
			if (CFG_STORE_REDIS) {
				console.log(CFG_STORE_REDIS.port + " : " + CFG_STORE_REDIS.host);
				var redisClient = redis.createClient(CFG_STORE_REDIS.port, CFG_STORE_REDIS.host);
				console.log("redis inited: " + CFG_STORE_REDIS.password);
				//redisClient.auth(CFG_STORE_REDIS.password, function() {
					redisClient.select(CFG_STORE_REDIS.dbname, function(err,res) {
						logmessage('Redis config: ' + redisClient.host + ':' + redisClient.port + ' @ ' + redisClient.selected_db + ' with ' + redisClient.auth_pass);
						cb3(null, redisClient);
					});
				//});
			} else {
				cb3(null, null);
			}
		},
*/	},
	// here we get all of the connections and run the actual server
	function(err, results) {
		logmessage('Came back with ' + Object.keys(results).length + ' connection(s)...');
        //app.mongoClient = results.mongoConnection;
		//app.redisClient = results.redisConnection;
		exports.mongoClient = results.mongoConnection;
		// load routes
		var productRoute = require('./routes/product.route');
		app.use('/product', productRoute);

		app.listen(port, function() {
			//app.logmessage('Listening on :' + port + ' in "' + app.settings.env + '" mode...');
			console.log('Listening on : ' + port);
			return 0;
		});
	});
// export app everywhere
exports.app = app;