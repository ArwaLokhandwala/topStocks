var restify = require('restify');
var redis = require('redis');
var async = require('async');
var client = redis.createClient();

var server = restify.createServer({
    name: 'topStocks',
    version: '1.0.0'
});


//Function to populate the rank of stocks
function findTopStocks(req, reply, next) {
    client.keys('NSE_EQ*', function(err, res) {
        if (err) throw err
        else {
            client.mget(res, function(mgetErr, mgetData) {
                if (mgetErr) {
                    console.log(getErr, "Error while getting " + key + " data")
                } else {
                    var len = res.length;
                    for (var i = 0; i < len; i++) {
                        if (mgetData[i]) {
                            var arr = mgetData[i].split(",");
                            if (arr[0] && arr[4]) {
                                // Both Last Traded Price and Close Price present
                                var LTP = parseFloat(arr[0]);
                                var C = parseFloat(arr[4]);
                                if (C != 0) {
                                    //If the Close price is not 0, then the rank calulation would be [(LastTradedPrice - ClosePrice)/ClosePrice]*100
                                    var rank = [(LTP - C) / C] * 100;
                                    client.zadd("top", rank, res[i]);
                                } else if (C == 0) {
                                    // If Close Price is 0, then the ranl calculation would be [LastTradedPrice - ClosePrice]*100 
                                    var rank = LTP * 100;
                                    client.zadd("top", rank, res[i])
                                }
                            } else {
                                continue;
                            }
                        } else {
                            continue;
                        }
                    }
                    return next();

                }
            })
        }

    })

}

//Function to get the top N stocks from redis
function getTopStocks(req, res, next) {
    var size = req.params.size;
    client.zrevrangebyscore('top', '+inf', '-inf', 'WITHSCORES', 'LIMIT', '0', size, function(getErr, getRes) {
        if (getErr) {
            return next(new restify.InternalError("Error while getting the top " + size - 1 + " stocks"));
        } else {
            var response = [];
            if (getRes.length != 0) {
                // Creating a JSON response
                for (var g = 0; g < getRes.length; g = g + 2) {
                    var json = {
                        name: getRes[g],
                        change: getRes[g + 1] + "%"
                    }
                    response.push(json)
                }
                res.send(response)
            } else {
                res.send("No results found")
            }
        }
    })
}

server.get('/top/:size', findTopStocks, getTopStocks);

server.listen(8080, function() {
    console.log('%s listening at %s', server.name, server.host);
});
