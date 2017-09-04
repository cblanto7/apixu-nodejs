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
    console.log('Parsed some JSON Object : ' + ++globObjsParsed)
    processDays(null, obj.forecast.forecastday, rows, target)
  }
}

var buildUpdate = function (day, timeInc, zip) {
  var setquery = {
    // give the query a unique name
    name: 'update from weather predictor',
    text: '' // needs to be built
  }

  console.log('\t' + day.time + ', temp :' + day.temp_f)
  setquery.text += 'UPDATE  weathertable SET '
  setquery.text += 'temperature = \'' + day.temp_f + '\', '
  setquery.text += 'weatherupdated = true, '
  setquery.text += 'windspeed = \'' + day.wind_mph + '\', '
  setquery.text += 'winddirection = \'' + day.wind_dir + '\', '
  setquery.text += 'humidity = \'' + day.humidity + '%\' '
  setquery.text += 'WHERE timevalue = ' + timeInc + ' AND zip = \'' + zip + '\''
  setquery.text += ' AND week = ' + WEEK_NUMBER + '\n'
  console.log(setquery.text)

  return setquery
}

var processDays = function (err, days, rows, target, callback) { // from apixu API future weather info
  if (err) {
    console.log(err.stack)
  } else {
    console.log('\tsearching for target: ' + target)
    for (var i = 0; i < days.length; i++) {
      var timeInc = 1
      for (var j = 0; j < 4; j++) {
        client.query(buildUpdate(days[i].hour[target + j], timeInc, rows[0].zip), (err, res) => {
          if (err) {
            console.log(err.stack)
          } else {
            console.log('query did not return any errors')
          }
        })
        timeInc += 2
      }
    }
  }
}
