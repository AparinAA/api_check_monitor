require('dotenv').config();
const fs = require('fs');
const { getTickersKuCoin } = require('./KuCoinclient');
const { getMarketBNB } = require('./BNBclient');
const { getMarketHuobi } = require('./huobi');
const { getMarketGateio } = require('./gateio');
const { getMarketMexc } = require('./mexc');

function culcSpread(ex1, ex2) {
    if (!ex1?.ask || !ex2?.bid) {
        return false;
    }
    return 100 * (1 - ex1.ask / ex2.bid);
}

//let nsscrySpread = 0.2;

function promiseTickersWithSpread(exchanges, tickersAll, nsscrySpread) {

    const tickersBNB = tickersAll.tickers.filter(item => ((item.exchangeLeft === "Binance") || (item.exchangeRight === "Binance")));
    const tickersKuCoin = tickersAll.tickers.filter(item => ((item.exchangeLeft === "KuCoin") || (item.exchangeRight === "KuCoin")));
    //const tickersDigifinex = tickersAll.tickers.filter( item => ((item.exchangeLeft === "Digifinex") || (item.exchangeRight === "Digifinex")) );
    const tickersHuobi = tickersAll.tickers.filter(item => ((item.exchangeLeft === "Huobi") || (item.exchangeRight === "Huobi")))
        .map(item => (item.exchangeLeft === "Huobi" ? item.tickerLeft : item.tickerRight))
    const tickersGateio = tickersAll.tickers.filter(item => ((item.exchangeLeft === "Gateio") || (item.exchangeRight === "Gateio")))
        .map(item => (item.exchangeLeft === "Gateio" ? item.tickerLeft : item.tickerRight))
    const tickersMexc = tickersAll.tickers.filter(item => ((item.exchangeLeft === "Mexc") || (item.exchangeRight === "Mexc")))
        .map(item => (item.exchangeLeft === "Mexc" ? item.tickerLeft : item.tickerRight))

    /*
    const nameListDigifinex = tickersDigifinex.map(item => {
        if (item.exchangeLeft === 'Digifinex') {
            return item.tickerLeft
        }
        if (item.exchangeRight === 'Digifinex') {
            return item.tickerRight
        }
    })
    */
    return Promise.all([
        exchanges[0].getRequest('/api/v5/market/tickers?instType=SPOT'), //okx
        getMarketBNB(exchanges[1], tickersBNB), //Binance
        getTickersKuCoin(exchanges[2], tickersKuCoin), //KuCoin
        //exchanges[4].getMarket(new Set(nameListDigifinex)), //Digifinex
        getMarketHuobi(new Set(tickersHuobi)), //Huobi 
        getMarketGateio(Array.from(new Set(tickersGateio))), //Gateio
        getMarketMexc(new Set(tickersMexc)), //Mexc
    ])
        .then(response => {

            //info tickers of OKX
            const tickersOKX = response
                .filter(item => +item.volCcy24h > 100000)
                .map(item => {
                    return { "instId": item.instId, "ask": +item.askPx, "bid": +item.bidPx, "base_vol": +item.volCcy24h };
                });

            //info tickers of Binance
            const tickersBNB = response[1];

            //info tickers of KuCoin
            const tickersKuCoin = response[2];

            //info tickers of Digifinex
            //const tickersDigifinex = response[4];

            //info tickers of Huobi
            const tickersHuobi = response[3];
            //info tickers of Gate.io
            const tickersGateio = response[4];

            //info tickers of Mexc
            const tickersMexc = response[5];

            const allExchange = {
                "OKX": tickersOKX,
                "Binance": tickersBNB,
                "KuCoin": tickersKuCoin,
                //"Digifinex": tickersDigifinex,
                "Huobi": tickersHuobi,
                "Gateio": tickersGateio,
                "Mexc": tickersMexc,
            }

            let genVarTickets = [];
            tickersAll.tickers.forEach(item => {
                const nameRight = item.nameRight;
                const instIdLeft = item.tickerLeft;
                const instIdRight = item.tickerRight;
                const exchangeLeft = item.exchangeLeft;
                const exchangeRight = item.exchangeRight;
                const urlLeft = item.urlLeft;
                const urlRight = item.urlRight;
                const idPair = item.idPair;

                if (exchangeLeft === 'Digifinex' || exchangeRight === 'Digifinex' || exchangeLeft === 'FTX' || exchangeRight === 'FTX') {
                    return;
                }


                const leftPr = allExchange[exchangeLeft]?.find(element => element?.instId === instIdLeft);
                const rightPr = allExchange[exchangeRight]?.find(element => element?.instId === instIdRight);

                if (!leftPr || !rightPr) {
                    return;
                }

                const spread_1 = culcSpread(leftPr, rightPr);
                const spread_2 = culcSpread(rightPr, leftPr);

                if ((spread_1 > nsscrySpread) || (spread_2 > nsscrySpread)) {
                    const trade = (exchangeLeft + exchangeRight === "OKXFTX" ||
                        exchangeLeft + exchangeRight === "FTXOKX") &&
                        (nameRight === "ANC" || nameRight === "TON");

                    genVarTickets.push(
                        {
                            'name': nameRight,
                            'idPair': idPair,
                            'leftEx': {
                                'name': exchangeLeft,
                                'url': urlLeft,
                                'ask': [[leftPr.ask]],
                                'bid': [[leftPr.bid]],
                                'vol24': leftPr.base_vol,
                            },
                            'rightEx': {
                                'name': exchangeRight,
                                'url': urlRight,
                                'ask': [[rightPr.ask]],
                                'bid': [[rightPr.bid]],
                                'vol24': rightPr.base_vol,
                            },
                            'spread': [spread_1, spread_2],
                            'availTrade': trade,
                            'listSpread': [[spread_1, spread_2]]
                        }
                    )
                }


            });

            return genVarTickets;
        }, () => {
            console.info("error get tickets");
            return Promise.reject(false);
        })
        .catch(() => {
            console.info("! Error: ",);
            return Promise.reject(false);
        })
}

module.exports = {
    promiseTickersWithSpread,
}