
//get market Kucoin
function getTickersKuCoin(API, tickers) {
    return API.rest.Market.Symbols.getAllTickers()
        .then(response => {

            const res = tickers.map(item => {

                const el = response?.data?.ticker?.find(element => (((element.symbol === item.tickerLeft) || (element.symbol === item.tickerRight))) && (element.volValue > 100000));
                //Если криптомонета пропала с биржи
                if (!el) {
                    return;
                }

                return {
                    'instId': el.symbol,
                    'ask': +el.sell,
                    'bid': +el.buy,
                    'base_vol': +el.volValue
                }
            });
            return res;
        }, (e) => {
            throw e;
        });
}

module.exports = {
    getTickersKuCoin,
}