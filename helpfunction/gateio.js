const axios = require('axios');
const fs = require('fs');


function getMarketGateio(tickers = null) {
    return axios.get('https://data.gateapi.io/api2/1/tickers')
        .then(response => {
            const tickInfo = response.data;
            let current = [];
            let currentTickers;

            if (!tickers) {
                currentTickers = Object.keys(tickInfo).map(item => item.toUpperCase());
            } else {
                currentTickers = tickers;
            }


            currentTickers.forEach(element => {
                const curTicker = tickInfo[element.toLowerCase()]

                if (curTicker) {

                    if (curTicker.baseVolume > 100000) {
                        current.push(
                            {
                                'instId': element,
                                'ask': +curTicker.lowestAsk,
                                'bid': +curTicker.highestBid,
                                'base_vol': +curTicker.baseVolume
                            }
                        )
                    }
                }
            });
            return current;
        })
}

module.exports = {
    getMarketGateio,
}
