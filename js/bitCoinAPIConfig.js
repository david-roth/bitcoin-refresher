/* jQuery Ajax Call, transformed to RxJS observable*/
function getBitCoinPrice () {
    var promise = $.ajax({
        url: 'https://api.coindesk.com/v1/bpi/currentprice.json',
        dataType: 'json'
    }).promise();
    return Rx.Observable.fromPromise(promise);
}

var bitCoinsRetrieved = new Rx.Subject();
var averageArray = [];

/* Scheduler to consume the API */
var disposable = Rx.Scheduler.default.schedulePeriodic(
    0,
    5000, /* 5 second */
    function(){
        getBitCoinPrice().subscribe(function (data) {
            bitCoinsRetrieved.onNext(data.bpi.USD.rate_float);
            averageArray.push(data.bpi.USD.rate_float)
        },function(e){
            console.log(e)
        });
    }
);

/* Display the current bitCoin price and the last 5 average price*/
bitCoinsRetrieved.subscribe(function(price){
    $('#price').text(price);
    var source = Rx.Observable.from(averageArray).takeLast(5).average(function (x) {
        return x;
    });
    source.subscribe(
        function (avg) {
            $("#average").text(Math.round(avg))
        },
        function (err) {
            console.log('Error: ' + err);
        });
});
