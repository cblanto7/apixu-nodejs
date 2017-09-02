var http = require('http')

var apiKey = '47a66ed4fe02423fafc212559172208'

var options = {
  host: 'api.apixu.com',
  port: 80,
  path: '/v1/current.json?key=' + apiKey + '&q=',
  method: 'GET'
}

exports.currentWeather = function currentWeather (query, callback) {
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
    callback(err)
  }).end()
}

// forecast weather takes pin code or location as first parameter,
//   number of days requested as 2nd param, and a callback as 3rd param
exports.forecastWeather = function forecastWeather (query, targetHour, numOfDays, callback) {
  options.path = '/v1/forecast.json?key=' + apiKey + '&q=' + query + '&days=' + numOfDays
  http.request(options, function (res) {
    res.setEncoding('utf8')
    var body = ''
    res.on('data', function (chunk) {
      body += chunk
    })
    res.on('end', function (chunk) {
      var obj = JSON.parse(body)
      callback(null, targetHour, obj)
    })
  }).on('error', function (err) {
        // handle errors with the request itself
    console.error('Error with the request:', err.message)
    callback(err)
  }).end()
}
