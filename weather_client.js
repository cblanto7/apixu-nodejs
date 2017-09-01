var weather = require('./weatherlib')

const NUM_DAYS_REQ = 7
const WEEK_NUMBER = 1 //Todo: make variable not constant

//********************************* connection to postgreSQL
const { Client } = require('pg')
const connectionString = 'postgres://***REMOVED***:***REMOVED***@aws-us-east-1-portal.9.dblayer.com:20947/***REMOVED***'

const client = new Client({
  connectionString: connectionString
})

const query = {
  // give the query a unique name
  name: 'testing weather client',
  text: 'SELECT * FROM weathertable'
}

client.connect((err) => {
  if (err) {
    console.error('connection error', err.stack)
  } else {
    console.log('connected')
  }
})

// callback
client.query(query, (err, res) => {
  if (err) {
    console.log(err.stack)
  } else {
    //console.log(res.rows[0])
    determineHours(res.rows, WEEK_NUMBER)
    client.end()
  }
})

//************************************************* end connection stuff


//********************** >> getting data from Apixu weather (should be an export...)

var determineHours = function (rows, weekNum) {
  for (var i = 0; i < rows.length; i++) {
    if ((rows[i].week === weekNum) || (rows[i].week === weekNum + 1)) {
      console.log(rows[i].week + ' : ' + rows[i].zip)
      weather.forecastWeather(rows[i].zip, errorHandler, NUM_DAYS_REQ, parseObject)
    } else {}
  }
}

var processDays = function (days, callback, err) {
  var dLen = days.length
  for (var i = 0; i < dLen; i++) {
    console.log(days[i].date)
    for (var j = 0; j < days[i].hour.length; j++) {
      console.log('\t\t' + days[i].hour[j].time)
      console.log('\t\t Temperature(F) :' + days[i].hour[j].temp_f)
      console.log('\t\t Night(0)-Day(1):' + days[i].hour[j].is_day)
      console.log('\t\t Wind Speed(Mph):' + days[i].hour[j].wind_mph)
      console.log('\t\t Wind Direction :' + days[i].hour[j].wind_dir)
      console.log('\t\t Conditions     :' + days[i].hour[j].condition.text)
      console.log('\t\t chance of rain :' + days[i].hour[j].chance_of_rain)
      console.log('\t\t chance of rain :' + days[i].hour[j].chance_of_snow)
    }
  }
}

var buildUpdateStatement = function (hourStart, callback) {
  var query = {
    // give the query a unique name
    name: 'update from weather predictor',
    text: 'UPDATE weathertable'

    
  }

}

var errorHandler = function () {
  console.log('got some error')
}

var parseObject = function (obj, callback) {
  console.log('Parsed some JSON Object')
  var days = []

  // fill days array
  var fLen = obj.forecast.forecastday.length
  for (var i = 0; i < fLen; i++) {
    days[i] = obj.forecast.forecastday[i]
  }

  processDays(days)
}
