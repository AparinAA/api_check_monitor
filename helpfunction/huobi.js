const axios = require('axios');

function getMarketHuobi(setTickers = undefined) {
    return axios.get("https://api.huobi.pro/market/tickers")
        .then(response => {
            if (setTickers) {
                return response.data.data
                    .filter(item => ((setTickers.has(item.symbol.toUpperCase()) && (item.vol > 100000))))
                    .map(item => (
                        {
                            'instId': item.symbol.toUpperCase(),
                            'ask': item.ask,
                            'bid': item.bid,
                            'base_vol': item.vol
                        }
                    ))
            } else {
                return response.data.data
                    .filter(item => item.vol > 100000)
                    .map(item => (
                        {
                            'instId': item.symbol.toUpperCase(),
                            'ask': item.ask,
                            'bid': item.bid,
                            'base_vol': item.vol
                        }
                    ))
            }
        })
        .catch(e => console.info("ERROR"))
}


module.exports = {
    getMarketHuobi,
}