var http = require('http')

var apiKey = '47a66ed4fe02423fafc212559172208'

var options = {
  host: 'api.apixu.com',
  port: 80,
  path: '/v1/current.json?key=' + apiKey + '&q=',
  method: 'GET'
}

exports.currentWeather = function currentWeather (query, callback, errorcallback) {
  options.path = '/v1/current.json?key=' + apiKey + '&q=' + query
  http.request(options, function (res) {
    res.setEncoding('utf8')
    var body = ''
    res.on('data', function (chunk) {
      body += chunk
    })
    res.on('end', function (chunk) {
      var obj = JSON.parse(body)
      callback(obj)
    })
  }).on('error', function (err) {
        // handle errors with the request itself
    console.error('Error with the request:', err.message)
    errorcallback(err)
  }).end()
}

// forecast weather takes pin code or location as first parameter,
// errorHandler callback for 2nd parameter, CONSTANT number of days
// requested as the third parameter, and parseObject callback as 4th parameter
exports.forecastWeather = function forecastWeather (query, errorcallback, noOfDays, callback) {
  options.path = '/v1/forecast.json?key=' + apiKey + '&q=' + query + '&days=' + noOfDays
  http.request(options, function (res) {
    res.setEncoding('utf8')
    var body = ''
    res.on('data', function (chunk) {
      body += chunk
    })
    res.on('end', function (chunk) {
      var obj = JSON.parse(body)
      callback(obj)
    })
  }).on('error', function (err) {
        // handle errors with the request itself
    console.error('Error with the request:', err.message)
    errorcallback(err)
  }).end()
}
