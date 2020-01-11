//const fs = require('fs');
const http = require('http');
const WebSocket = require('ws');
const mongo = require("mongodb").MongoClient;
const mongoUrl = "mongodb://localhost:27017/";
let dbName = 'trade';
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const secret = process.env.JWT_SECRET;
const saltRounds = 10;

if (process.env.NODE_ENV === 'prod') {
    dbName = 'trade';
} else {
    dbName = 'trade_test';
}

let prices = {
    ERIC: 100,
    NOK: 100,
    MCI: 100,
    BTH: 100,
    ABB: 100,
    VOLVO: 100,
    SAAB: 100,
    OPEL: 100,
    FORD: 100
};

const server = http.createServer((req, res) => {
    let body = '';
    let postObj = {};

    // CORS headers are sent with every request
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin',   '*');
    res.setHeader('Access-Control-Request-Method', '*');
    res.setHeader('Access-Control-Allow-Methods',  'POST');
    res.setHeader('Access-Control-Allow-Headers',  '*');

    // Handle CORS pre-flight request
    if (req.method == 'OPTIONS') {
        res.end();
    }

    if (req.method != 'POST' && req.method != 'OPTIONS') {
        res.end(JSON.stringify({err: 'Method not POST or OPTIONS'}));
    }

    req.on('data', (data) => {
        body += data;
    });
    req.on('end', () => {
        try {
            postObj = JSON.parse(body);
        } catch (e) {
            res.end(JSON.stringify({err: 'Body not valid raw JSON'}));
        }

        if (!postObj.cmd) {
            res.end(JSON.stringify({err: 'Command (cmd) not specified'}));
        }

        switch (postObj.cmd) {
            case 'reg':
                if (!postObj.nam) {
                    res.end(JSON.stringify({err: 'Name (nam) not specified'}));
                }
                if (!postObj.ema) {
                    res.end(JSON.stringify({err: 'Email (ema) not specified'}));
                }
                if (!postObj.psw) {
                    res.end(JSON.stringify({err: 'Password (psw) not specified'}));
                }

                mongo.connect(mongoUrl, {
                    useUnifiedTopology: true,
                    useNewUrlParser: true
                }, function(err, client) {
                    const db = client.db(dbName);
                    const users = db.collection('users');

                    users.find({ 'ema': postObj.ema }).toArray(function(err, docs) {
                        if (!docs.length) {
                            bcrypt.hash(postObj.psw, saltRounds, function(err, hash) {
                                users.insertOne({
                                    nam: postObj.nam,
                                    ema: postObj.ema,
                                    psw: hash,
                                    bal: 0,
                                    shr: {}
                                });
                                client.close();
                                res.end(JSON.stringify({
                                    err: false
                                }));
                            });
                        } else {
                            client.close();
                            res.end(JSON.stringify({
                                err: 'Email already registered'
                            }));
                        }
                    });
                });
                break;

            case 'lin':
                if (!postObj.ema) {
                    res.end(JSON.stringify({err: 'Email (ema) not specified'}));
                }
                if (!postObj.psw) {
                    res.end(JSON.stringify({err: 'Password (psw) not specified'}));
                }

                mongo.connect(mongoUrl, {
                    useUnifiedTopology: true,
                    useNewUrlParser: true
                }, function(err, client) {
                    const db = client.db(dbName);
                    const users = db.collection('users');

                    users.find({ 'ema': postObj.ema }).toArray(function(err, docs) {
                        client.close();
                        if (docs.length === 1) {
                            bcrypt.compare(postObj.psw, docs[0].psw, function(err, valid) {
                                if (valid) {
                                    const token = jwt.sign({ ema: postObj.ema }, secret);

                                    res.end(JSON.stringify({
                                        tok: token,
                                        err: false
                                    }));
                                } else {
                                    res.end(JSON.stringify({
                                        err: 'Wrong password'
                                    }));
                                }
                            });
                        } else {
                            res.end(JSON.stringify({
                                err: 'Email not registered'
                            }));
                        }
                    });
                });
                break;

            case 'dat':
                if (!postObj.tok) {
                    res.end(JSON.stringify({err: 'Token (tok) not specified'}));
                }
                jwt.verify(postObj.tok, secret, function(err, decoded) {
                    if (!err) {
                        mongo.connect(mongoUrl, {
                            useUnifiedTopology: true,
                            useNewUrlParser: true
                        }, function(err, client) {
                            const db = client.db(dbName);
                            const users = db.collection('users');

                            users.find({ 'ema': decoded.ema }).toArray(function(err, docs) {
                                client.close();
                                res.end(JSON.stringify({
                                    err: false,
                                    bal: docs[0].bal,
                                    shr: docs[0].shr
                                }));
                            });
                        });
                    } else {
                        res.end(JSON.stringify({
                            err: 'Invalid token'
                        }));
                    }
                });
                break;

            case 'tra':
                if (!postObj.tok) {
                    res.end(JSON.stringify({err: 'Token (tok) not specified'}));
                }
                if (!postObj.typ) {
                    res.end(JSON.stringify({err: 'Type (typ) not specified'}));
                }
                if (!postObj.amt) {
                    res.end(JSON.stringify({err: 'Amount (amt) not specified'}));
                }
                jwt.verify(postObj.tok, secret, function(err, decoded) {
                    if (!err) {
                        mongo.connect(mongoUrl, {
                            useUnifiedTopology: true,
                            useNewUrlParser: true
                        }, function(err, client) {
                            const db = client.db(dbName);
                            const users = db.collection('users');

                            users.find({ 'ema': decoded.ema }).toArray(function(err, docs) {
                                if (!err && docs.length) {
                                    let balance = docs[0].bal;
                                    let type = postObj.typ;
                                    let amount = parseInt(postObj.amt);
                                    let err = false;

                                    if (type != "deposit" && type != "withdraw") {
                                        err = "Type is not 'deposit' or 'withdraw'";
                                    } else if (isNaN(amount) || amount <= 0) {
                                        err = "Invalid amount";
                                    } else if (type == "withdraw" && amount > balance) {
                                        err = "Insufficent funds in account";
                                    }
                                    if (!err) {
                                        if (type == "deposit") {
                                            balance += amount;
                                        } else {
                                            balance -= amount;
                                        }
                                        balance = Math.round(balance * 100) / 100;

                                        users.updateOne({ 'ema': decoded.ema },
                                            { $set: { bal: balance }},
                                            function(err, result) {
                                                if (!err) {
                                                    res.end(JSON.stringify({
                                                        err: false,
                                                        bal: balance
                                                    }));
                                                } else {
                                                    res.end(JSON.stringify({
                                                        err: result
                                                    }));
                                                }
                                            });
                                    } else {
                                        res.end(JSON.stringify({
                                            err: err
                                        }));
                                    }
                                } else {
                                    res.end(JSON.stringify({
                                        err: err
                                    }));
                                }
                                client.close();
                            });
                        });
                    } else {
                        res.end(JSON.stringify({
                            err: 'Invalid token'
                        }));
                    }
                });
                break;

            case 'trd':
                if (!postObj.tok) {
                    res.end(JSON.stringify({err: 'Token (tok) not specified'}));
                }
                if (!postObj.stk) {
                    res.end(JSON.stringify({err: 'Stock symbol (stk) not specified'}));
                }
                if (!postObj.num) {
                    res.end(JSON.stringify({err: 'Number of shares (num) not specified'}));
                }
                jwt.verify(postObj.tok, secret, function(err, decoded) {
                    if (!err) {
                        mongo.connect(mongoUrl,
                            {useUnifiedTopology: true, useNewUrlParser: true },
                            function(err, client) {
                                const db = client.db(dbName);
                                const users = db.collection('users');

                                users.find({ 'ema': decoded.ema }).toArray(function(err, docs) {
                                    if (!err && docs.length) {
                                        let bal = docs[0].bal;
                                        let prt = docs[0].shr;
                                        let stk = postObj.stk;
                                        let num = parseInt(postObj.num);
                                        let err = false;

                                        if (!Object.prototype.hasOwnProperty.call(prices, stk)) {
                                            err = "Stock is not listed";
                                        } else if (isNaN(num) || num === 0) {
                                            err = "Invalid number of shares";
                                        } else if (
                                            num < 0 &&
                                            !Object.prototype.hasOwnProperty.call(prt, stk)
                                        ) {
                                            err = "Stock is not in portfolio";
                                        } else if (num > 0 && ((prices[stk] * num) > bal)) {
                                            err = "Insufficent funds";
                                        } else if (num < 0 && (( prt[stk] + num ) < 0)) {
                                            err = "Insufficent shares in portfolio";
                                        }
                                        if (!err) {
                                            bal -= prices[stk] * num;

                                            bal = Math.round(bal * 100)/100;

                                            if (num > 0) {
                                                prt[stk] = prt[stk] + num || num;
                                            } else {
                                                prt[stk] = prt[stk] + num;
                                                if (!prt[stk]) {
                                                    delete prt[stk];
                                                }
                                            }
                                            users.updateOne({
                                                'ema': decoded.ema
                                            },
                                            { $set: { bal: bal, shr: prt }},
                                            function(err, result) {
                                                if (!err) {
                                                    res.end(JSON.stringify({
                                                        err: false,
                                                        bal: bal,
                                                        shr: prt
                                                    }));
                                                } else {
                                                    res.end(JSON.stringify({
                                                        err: result,
                                                    }));
                                                }
                                            });
                                        } else {
                                            res.end(JSON.stringify({
                                                err: err
                                            }));
                                        }
                                    } else {
                                        res.end(JSON.stringify({
                                            err: err
                                        }));
                                    }
                                    client.close();
                                });
                            });
                    } else {
                        res.end(JSON.stringify({
                            err: 'Invalid token'
                        }));
                    }
                });
                break;
        }
    });
});


// cert: fs.readFileSync('/path/to/cert.pem'),
// key: fs.readFileSync('/path/to/key.pem')

const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
    ws.send(JSON.stringify(prices));

    ws.on("error", (error) => {
        //console.log(`Server error: ${error}`);
    });
});

wss.broadcast = (data) => {
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(data);
        }
    });
};


/* Takes a price and add or substract a random value
/  and then return the modified price.
*/
function randPrice(price) {
    price += Math.random() * 2 - 1;
    if (price < 0) {
        price = 0;
    }
    return Math.round(price * 100) / 100;
}

setInterval( () => {
    for (let key in prices) {
        prices[key] = randPrice(prices[key]);
    }
    wss.broadcast(JSON.stringify(prices));
}, 10000);


module.exports = server.listen(8080);
