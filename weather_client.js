var weather = require('./weatherlib')

const NUM_DAYS_REQ = 7

var errorHandler = function () {
  console.log('got some error')
}

var parseObject = function (obj) {
  console.log('Parsed some JSON Object')
  var days = []

  // fill days array
  var fLen = obj.forecast.forecastday.length
  for (var i = 0; i < fLen; i++) {
    days[i] = obj.forecast.forecastday[i]
  }

  // output date of each day
  var dLen = days.length
  for (i = 0; i < dLen; i++) {
    console.log(days[i].date)
    for (var j = 0; j < days[i].hour.length; j++) {
      console.log('\t' + days[i].hour[j].time)
      console.log('\t\t Temperature(F) :' + days[i].hour[j].temp_f)
      console.log('\t\t Night(0)-Day(1):' + days[i].hour[j].is_day)
      console.log('\t\t Wind Speed(Mph):' + days[i].hour[j].wind_mph)
      console.log('\t\t Wind Direction :' + days[i].hour[j].wind_dir)
      console.log('\t\t Conditions     :' + days[i].hour[j].condition.text)
    }
  }

  /* same thing
  days.forEach(function (value, index, fullArray) {
    console.log(value.date + ' is index #: ' + index)
  }) */
}

// current weather takes pin code or location as first parameter, error handler callback as second
// weather.currentWeather(20500, parseObject, errorHandler);

// forecast weather takes pin code or location as first parameter, number of days as second, error handler callback as second
weather.forecastWeather(20500, errorHandler, NUM_DAYS_REQ, parseObject)
