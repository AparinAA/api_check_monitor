//get market Binance
function getMarketBNB(client, tickers) {
    return client.ticker24hr()
        .then(response => {
            const res = tickers.map(item => {
                const el = response.data.find(element => ((element.symbol === item.tickerLeft) || (element.symbol === item.tickerRight)));
                return {
                    'instId': el.symbol,
                    'ask': +el.askPrice,
                    'bid': +el.bidPrice,
                    'base_vol': +el.quoteVolume
                }
            });
            return res;
        }, (e) => {
            throw e;
        });
}

module.exports = {
    getMarketBNB
}