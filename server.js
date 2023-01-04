require('dotenv').config();
const http = require("http");
const { Spot } = require('@binance/connector'); //Binance SPOT api
const fs = require('fs');
const { promiseTickersWithSpread } = require('./helpfunction/getCurrencies');
const API = require('kucoin-node-sdk');
const { addSpreadList } = require('./helpfunction/addSpreadList');


const OKXclient = require('okx-public-api').default;

const host = 'localhost';
//const host = '195.133.1.56';
const port = 8090;

//Init secret api OKX
const secretDict_OKX = {
    'api_key': process.env.api_key,
    'passphrase': process.env.passphrase,
    'secret_key': process.env.secret_key,
};

//Init Binance api
const BNB = new Spot(process.env.binance_api_key, process.env.binance_api_secret);

//Init KuCoin api
const kucoin_secret = {
    baseUrl: 'https://api.kucoin.com',
    apiAuth: {
        key: process.env.kucoin_api_key, // KC-API-KEY
        secret: process.env.kucoin_api_secret, // API-Secret
        passphrase: process.env.kucoin_api_pass, // KC-API-PASSPHRASE
    },
    authVersion: 2, // KC-API-KEY-VERSION. Notice: for v2 API-KEY, not required for v1 version.
}
API.init(kucoin_secret);

const tickersAll = JSON.parse(fs.readFileSync('tickers1.json', { "encoding": "utf-8" }));

const okx = new OKXclient(secretDict_OKX.api_key, secretDict_OKX.secret_key, secretDict_OKX.passphrase);



const nullSpreadJson = [
    {
        'name': '',
        'idPair': 0,
        'leftEx': {
            'name': '',
            'url': '',
            'ask': [[0, 0]],
            'bid': [[0, 0]],
            'vol24': 0
        },
        'rightEx': {
            'name': '',
            'url': '',
            'ask': [[0, 0]],
            'bid': [[0, 0]],
            'vol24': 0
        },
        'spread': [0, 0],
        'availTrade': false,
        'listSpread': [[0, 0]]
    }
];

let allSpreadJson = nullSpreadJson;
const nsscrySpread = process.env.nsscrySpread;

promiseTickersWithSpread([okx, BNB, API], tickersAll, nsscrySpread)
    .then(response => {
        allSpreadJson = response;
    }, () => {
        console.info("error allspread");
    })
    .catch(() => {
        console.info("error 2 allspread");
        allSpreadJson = nullSpreadJson;
    });

setInterval(() => {
    promiseTickersWithSpread([okx, BNB, API], tickersAll, nsscrySpread)
        .then(response => {
            if (!response) {
                return Promise.reject(false);
            }
            allSpreadJson = addSpreadList(allSpreadJson, response, 15);
        }, () => {
            console.info("error allspread");
            return Promise.reject(false);
        })
        .catch(() => {
            console.info("error 2 allspread");
        });
}, 15 * 1000)

const requestListener = function (req, res) {
    res.setHeader("Content-Type", "application/json");
    res.writeHead(200, {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
    });

    if (req.url === '/allspread') {
        res.end(JSON.stringify(allSpreadJson, null, '\t'));
    } else {
        res.end(JSON.stringify([], null, '\t'));
    }
};

const server = http.createServer(requestListener);
server.listen(port, host, () => {
    console.log(`Server is running on http://${host}:${port}`);
});