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

//****************** getting data from Apixu weather (should be an export...)

var determineHours = function (rows, weekNum) { //from weathertable SQL db
  for (var i = 0; i < rows.length; i++) {
    if ((rows[i].week === weekNum) || (rows[i].week === weekNum + 1)) {
      console.log(rows[i].week + ' : ' + rows[i].zip + ' : ' + rows[i].starthour)

      weather.forecastWeather(rows[i].zip, rows[i].starthour, NUM_DAYS_REQ, parseObject)
    }
  }
}

var buildUpdateStatement = function (hourStart, callback) {
  var query = {
    // give the query a unique name
    name: 'update from weather predictor',
    text: 'UPDATE  table SET ID = 111111259 WHERE ID = 2555    '
  }
}

var parseObject = function (err, targetHour, obj) { // obj is one week of data for one zip from apixi API future weather info
  if (err) {
    console.log(err.stack)
  } else {
    console.log('Parsed some JSON Object')
    var days = []

    // fill days array
    var fLen = obj.forecast.forecastday.length
    for (var i = 0; i < fLen; i++) {
      days[i] = obj.forecast.forecastday[i] //one day's forecast contains 24 hours
    }
    processDays(null, days, targetHour, buildUpdateStatement)
  }
}

var processDays = function (err, days, targetHour, callback) { //from apixu API future weather info
  if (err) {
    console.log(err.stack)
  } else {
    var dLen = days.length
    for (var i = 0; i < dLen; i++) {
      console.log(days[i].date)
      for (var j = 0; j < days[i].hour.length; j++) {
        console.log('\tsearching for target hour: ' + targetHour)
        console.log('\t' + days[i].hour[j].time)
        /*
        console.log('\t\tTemperature(F) :' + days[i].hour[j].temp_f)
        console.log('\t\tNight(0)-Day(1):' + days[i].hour[j].is_day)
        console.log('\t\tWind Speed(Mph):' + days[i].hour[j].wind_mph)
        console.log('\t\tWind Direction :' + days[i].hour[j].wind_dir)
        console.log('\t\tConditions     :' + days[i].hour[j].condition.text)
        console.log('\t\tchance of rain :' + days[i].hour[j].chance_of_rain)
        console.log('\t\tchance of rain :' + days[i].hour[j].chance_of_snow)
        */
      }
    }
  }
}
