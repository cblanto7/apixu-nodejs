var weather = require('./weatherlib')

const NUM_DAYS_REQ = 7

//********************************* connection to postgreSQL
const { Pool } = require('pg')
const connectionString = 'postgres://***REMOVED***:***REMOVED***@aws-us-east-1-portal.9.dblayer.com:20947/***REMOVED***'

const pool = new Pool({
  connectionString: connectionString
})

const query = {
  // give the query a unique name
  name: 'testing weather client',
  text: 'SELECT * FROM weathertable'
}

pool.connect()
// callback
pool.query(query, (err, res) => {
  if (err) {
    console.log(err.stack)
  } else {
    console.log(res.rows[0])
  }
})

// promise
pool.query(query)
  .then(res => console.log(res.rows[0]))
  .catch(e => console.error(e.stack))

pool.end()
//*************************************************

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
    	/*
      console.log('\t' + days[i].hour[j].time)
      console.log('\t\t Temperature(F) :' + days[i].hour[j].temp_f)
      console.log('\t\t Night(0)-Day(1):' + days[i].hour[j].is_day)
      console.log('\t\t Wind Speed(Mph):' + days[i].hour[j].wind_mph)
      console.log('\t\t Wind Direction :' + days[i].hour[j].wind_dir)
      console.log('\t\t Conditions     :' + days[i].hour[j].condition.text)
      console.log('\t\t chance of rain :' + days[i].hour[j].chance_of_rain)
      console.log('\t\t chance of rain :' + days[i].hour[j].chance_of_snow)
      */
    }
  }

  /* same thing
  days.forEach(function (value, index, fullArray) {
    console.log(value.date + ' is index #: ' + index)
  }) */
}

// current weather takes pin code or location as first parameter, error handler callback as second
// weather.currentWeather(20500, parseObject, errorHandler);

// forecast weather takes pin code or location as first parameter,
// errorHandler callback for 2nd parameter, CONSTANT number of days
// requested as the third parameter, and parseObject callback as 4th parameter
weather.forecastWeather(37213, errorHandler, NUM_DAYS_REQ, parseObject)
