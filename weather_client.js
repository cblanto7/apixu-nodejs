var weather = require('./weatherlib')

const WEEK_NUMBER = 1 // Todo: make variable not constant

var globObjsParsed = 0

// ********************************* connection to postgreSQL
const { Pool } = require('pg')
// const connectionString = 'postgres://***REMOVED***:***REMOVED***@aws-us-east-1-portal.29.dblayer.com:***REMOVED***'
const connectionString = 'postgres://***REMOVED***:***REMOVED***@aws-us-east-1-portal.9.dblayer.com:20947/***REMOVED***'

const pool = new Pool({
  connectionString: connectionString
})

const query = {
  // give the query a unique name
  name: 'testing weather pool',
  text: 'SELECT week, zip, ampm, stringdateofgame, startofweather, starthour, timevalue FROM weathertable WHERE week = ' + WEEK_NUMBER + ' order by zip, timevalue'
}

pool.connect((err) => {
  if (err) {
    console.error('connection error', err.stack)
  } else {
    console.log('connected')
  }
})

// callback
pool.query(query, (err, res) => {
  if (err) {
    console.log(err.stack)
  } else {
    // console.log(JSON.stringify(res))
    determineHours(res.rows)
  }
})

// ************************************************ end connection stuff

// ****************** getting data from Apixu weather (should be an export...)
var determineHours = function (rows) { // from weathertable SQL db
  var zips = []

  var i = 0
  for (var j = 0; j < rows.length; j += 9) { // every 9 items there is a new zip code
    if (rows[j].ampm === 'PM' && rows[j].starthour < 12) {
      var start = parseInt(rows[j].starthour)
      start += 12
    } else {}

    zips[i++] = { zip: rows[j].zip, start: start }
  }

  console.log(zips) // every zip in WEEK_NUM

  var date = rows[0].stringdateofgame

  console.log(date)

  weather.forecastWeather(zips[0].zip, zips[0].start, rows, parseObject)
}

var parseObject = function (err, starthour, rows, obj) { // obj is one week of data for one zip from apixi API future weather info
  if (err) {
    console.log(err.stack)
  } else {
    console.log('Parsed some JSON Object. Total Parsed :' + ++globObjsParsed)

    // locate date of game
    for (var i = 0; i < obj.forecast.forecastday.length; i++) {
      if (obj.forecast.forecastday[i].date === rows[0].stringdateofgame) {
        break
      } else {}
    }

    var days = [obj.forecast.forecastday[i], obj.forecast.forecastday[i + 1]] // day and next day

    processDays(null, days, rows, starthour)
  }
}

var buildUpdate = function (day, timeInc, zip) {
  var setquery = {
    // give the query a unique name
    name: 'update from weather predictor',
    text: '' // needs to be built
  }
  console.log(day.time)
  setquery.text += 'UPDATE  weathertable SET '
  setquery.text += 'temperature = \'' + day.temp_f + '\', '
  setquery.text += 'weatherupdated = true, '
  setquery.text += 'windspeed = \'' + day.wind_mph + '\', '
  setquery.text += 'winddirection = \'' + day.wind_dir + '\', '
  setquery.text += 'humidity = \'' + day.humidity + '%\' '
  setquery.text += 'WHERE timevalue = ' + timeInc + ' AND zip = \'' + zip + '\''
  setquery.text += ' AND week = ' + WEEK_NUMBER
  console.log(setquery.text)

  return setquery.text
}

var processDays = function (err, days, rows, target, callback) { // from apixu API future weather info
  if (err) {
    console.log(err.stack)
  } else {
    pool.query(buildUpdate(target < 24 ? days[0].hour[target] : days[1].hour[target - 24], 1, rows[0].zip), (err, res) => {
      if (err) {
        console.log(err.stack)
      } else {
        pool.query(buildUpdate(target < 24 ? days[0].hour[target] : days[1].hour[target - 24], 2, rows[0].zip), (err, res) => {
          if (err) {
            console.log(err.stack)
          } else {
            pool.query(buildUpdate(target + 1 < 24 ? days[0].hour[target + 1] : days[1].hour[target - 23], 3, rows[0].zip), (err) => {
              if (err) {
                console.error(err.stack)
              } else {
                pool.query(buildUpdate(target + 1 < 24 ? days[0].hour[target + 1] : days[1].hour[target - 23], 4, rows[0].zip), (err) => {
                  if (err) {
                    console.error(err.stack)
                  } else {
                    pool.query(buildUpdate(target + 2 < 24 ? days[0].hour[target + 2] : days[1].hour[target - 22], 5, rows[0].zip), (err) => {
                      if (err) {
                        console.error(err.stack)
                      } else {
                        pool.query(buildUpdate(target + 2 < 24 ? days[0].hour[target + 2] : days[1].hour[target - 22], 6, rows[0].zip), (err) => {
                          if (err) {
                            console.error(err.stack)
                          } else {
                            pool.query(buildUpdate(target + 3 < 24 ? days[0].hour[target + 3] : days[1].hour[target - 21], 7, rows[0].zip), (err) => {
                              if (err) {
                                console.error(err.stack)
                              } else {
                                pool.query(buildUpdate(target + 3 < 24 ? days[0].hour[target + 3] : days[1].hour[target - 21], 8, rows[0].zip), (err) => {
                                  if (err) {
                                    console.error(err.stack)
                                  } else {
                                    pool.query(buildUpdate(target + 4 < 24 ? days[0].hour[target + 4] : days[1].hour[target - 20], 9, rows[0].zip), (err) => {
                                      if (err) {
                                        console.error(err.stack)
                                      } else {
                                        pool.query('COMMIT', (err) => {
                                          if (err) {
                                            console.error('Error committing transaction', err.stack)
                                          } else {
                                            console.log('commit is good')
                                          }
                                        })
                                      }
                                    })
                                  }
                                })
                              }
                            })
                          }
                        })
                      }
                    })
                  }
                })
              }
            })
          }
        })
      }
    })
  }// end main callback from hell
}
