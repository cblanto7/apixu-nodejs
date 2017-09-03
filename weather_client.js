var weather = require('./weatherlib')

const NUM_DAYS_REQ = 7
const WEEK_NUMBER = 1 // Todo: make variable not constant

var globObjsParsed = 0

// ********************************* connection to postgreSQL
const { Client } = require('pg')
const connectionString = 'postgres://***REMOVED***:***REMOVED***@aws-us-east-1-portal.9.dblayer.com:20947/***REMOVED***'

const client = new Client({
  connectionString: connectionString
})

const query = {
  // give the query a unique name
  name: 'testing weather client',
  text: 'SELECT week, zip, ampm, stringdateofgame, startofweather, starthour, timevalue FROM weathertable WHERE week = ' + WEEK_NUMBER + ' AND zip = \'02035\' order by timevalue'
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
    determineHours(res.rows)
  }
})

// ************************************************ end connection stuff

// ****************** getting data from Apixu weather (should be an export...)

var determineHours = function (rows) { // from weathertable SQL db
  /*
  for (var i = 0; i < rows.length; i++) {
    console.log('week :' + rows[i].week + ' zip: ' + rows[i].zip + ' starthour: ' + rows[i].starthour + ' timevalue: ' + rows[i].timevalue)
    console.log('' + rows[i].dateofgame + ' : ' + rows[i].kickoff)
  }
  */
  // determine if AM or PM and fix starthour accordingly.
  if (rows[0].ampm === 'PM') {
    var start = parseInt(rows[0].starthour)
    start += 12
  } else {}

  var date = rows[0].stringdateofgame

  console.log(date)

  weather.forecastWeather(rows[0].zip, start, rows, parseObject)
}

var parseObject = function (err, target, rows, obj) { // obj is one week of data for one zip from apixi API future weather info
  if (err) {
    console.log(err.stack)
  } else {
    var days = []
    // fill days array
    var fLen = obj.forecast.forecastday.length
    for (var i = 0; i < fLen; i++) {
      days[i] = obj.forecast.forecastday[i] // one day's forecast contains 24 hours
    }
    console.log('Parsed some JSON Object : ' + globObjsParsed++)
    processDays(null, days, rows, target)
  }
}

var processDays = function (err, days, rows, target, callback) { // from apixu API future weather info
  if (err) {
    console.log(err.stack)
  } else {
    var setquery = {
      // give the query a unique name
      name: 'update from weather predictor',
      text: '' // needs to be built
    }

    console.log('\tsearching for target: ' + target)
    for (var i = 0; i < days.length; i++) {
      for (var j = 0; j < 4; j++) {
        setquery.text += 'UPDATE  weathertable SET '
        console.log('\t' + days[i].hour[target + j].time + ', temp :' + days[i].hour[target].temp_f)
        setquery.text += 'temperature = \'' + days[i].hour[target + j].temp_f + '\', '
        setquery.text += 'weatherupdated = true, '
        setquery.text += 'windspeed = \'' + days[i].hour[target + j].wind_mph + '\', '
        setquery.text += 'winddirection = \'' + days[i].hour[target + j].wind_dir + '\', '
        setquery.text += 'humidity = \'' + days[i].hour[target + j].humidity + '%\' '
        setquery.text += 'WHERE timevalue = ' + (j + 1) + ' AND zip = \'' + rows[0].zip + '\''
        setquery.text += ' AND week = ' + WEEK_NUMBER + '\n'
        // callback
      }
    }
    console.log(setquery.text)
    client.query(setquery, (err, res) => {
      if (err) {
        console.log(err.stack)
      } else {
        console.log('Update was successful')
        client.end()
      }
    })
  }
}
