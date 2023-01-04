const fs = require('fs');
const axios = require('axios');
const { builtinModules } = require('module');

function getMarketMexc(setTickers = undefined) {
    return axios.get('https://www.mexc.com/open/api/v2/market/ticker')
        .then(r => {
            const tickers = r.data.data;
            let current;
            if (setTickers) {
                current = tickers.filter(item => ((+item.volume * +item.last > 100000) && (setTickers.has(item.symbol))));
            } else {
                current = tickers.filter(item => (+item.volume * +item.last) > 100000);
            }
            return current.map(item => ({ "instId": item.symbol, "ask": +item.ask, "bid": +item.bid, "base_vol": +item.volume * +item.last }))

        })
}

module.exports = {
    getMarketMexc,
}