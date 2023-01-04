
function addSpreadList(oldTickers, newTickets, scale = 15) {
    let buffer = newTickets?.map(item => {
        let oldTicker = oldTickers?.find(i => i.idPair === item.idPair);

        if (!oldTicker) {
            return item;
        }

        if (oldTicker.listSpread.length > scale - 1) {
            return { ...item, "listSpread": [...oldTicker.listSpread.slice(1), ...item.listSpread] };
        }
        return { ...item, "listSpread": [...oldTicker.listSpread, ...item.listSpread] };
    });


    return buffer;
}

module.exports = {
    addSpreadList,
}