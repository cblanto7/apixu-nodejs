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

  for (var k = 0; k < zips.length; k++) {
    console.log('making api request :' + k)
    console.log('zip:' + zips[k].zip + ' starthour: ' + zips[k].start)
    weather.forecastWeather(zips[k].zip, zips[k].start, rows, parseObject)
  }
}

var parseObject = function (err, starthour, rows, obj, zip) { // obj is one week of data for one zip from apixi API future weather info
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

    let days = [obj.forecast.forecastday[i], obj.forecast.forecastday[i + 1]] // day and next day
    processDays(null, days, rows, starthour, zip)
  }
}

/* Turns out this isnt needed but might be useful for future
var splitarray = function (input, spacing) {
  var output = []
  for (var i = 0; i < input.length; i += spacing) {
    output[output.length] = input.slice(i, i + spacing)
  }
  return output
}
*/

var mapTempCodes = function (temp) {
  let tempCodeStatement = ''
  if (temp <= 40) {
    tempCodeStatement = 'tempcode1 = \'J\', tempcode2 = \'K\', '
  } else if (temp <= 80) {
    tempCodeStatement = 'tempcode1 = \'L\', tempcode2 = \'M\', '
  } else if (temp > 80) {
    tempCodeStatement += 'tempcode1 = \'N\', tempcode2 = \'O\', '
  } else {}
  return tempCodeStatement
}

var mapWindCodes = function (windspeed) {
  let windCodeStatement = ''
  if (windspeed <= 10) {
    windCodeStatement += 'windc1 = \'P\', windc2 = \'Q\', '
  } else if (windspeed > 10) {
    windCodeStatement += 'windc1 = \'Q\', windc2 = \'R\', '
  } else {}
  return windCodeStatement
}

var mapWeatherConditions = function (code) {
  let weatherConditionStatement = ''
  switch (code) {
    case 1000: // sunny or clear
      weatherConditionStatement += 'wcond1 = \'S\', wcond2 = \'S\', graphic = \'113.png\''
      break
    case 1003: // partly cloudy
      weatherConditionStatement += 'wcond1 = \'S\', wcond2 = \'S\', graphic = \'116.png\''
      break
    case 1006: // cloudy
      weatherConditionStatement += 'wcond1 = \'T\', wcond2 = \'T\', graphic = \'119.png\''
      break
    case 1009: // overcast
      weatherConditionStatement += 'wcond1 = \'T\', wcond2 = \'T\', graphic = \'122.png\''
      break
    case 1030: // mist
      weatherConditionStatement += 'wcond1 = \'U\', wcond2 = \'T\', graphic = \'143.png\''
      break
    case 1063: // patchy rain
      weatherConditionStatement += 'wcond1 = \'U\', wcond2 = \'T\', graphic = \'176.png\''
      break
    case 1066: // patchy snow
      weatherConditionStatement += 'wcond1 = \'Y\', wcond2 = \'T\', graphic = \'179.png\''
      break
    case 1069: // patchy sleet
      weatherConditionStatement += 'wcond1 = \'U\', wcond2 = \'T\', graphic = \'182.png\''
      break
    case 1072: // patchy freezing drizzle
      weatherConditionStatement += 'wcond1 = \'Y\', wcond2 = \'T\', graphic = \'185.png\''
      break
    case 1087: // thundery outbreaks
      weatherConditionStatement += 'wcond1 = \'T\', wcond2 = \'U\', graphic = \'200.png\''
      break
    case 1114: // blowing snow
      weatherConditionStatement += 'wcond1 = \'Y\', wcond2 = \'W\', graphic = \'227.png\''
      break
    case 1117: // blizzard
      weatherConditionStatement += 'wcond1 = \'Y\', wcond2 = \'W\', graphic = \'230.png\''
      break
    case 1135: // fog
      weatherConditionStatement += 'wcond1 = \'T\', wcond2 = \'U\', graphic = \'248.png\''
      break
    case 1147: // freezing fog
      weatherConditionStatement += 'wcond1 = \'T\', wcond2 = \'U\', graphic = \'260.png\''
      break
    case 1150: // patchy light drizze
      weatherConditionStatement += 'wcond1 = \'U\', wcond2 = \'T\', graphic = \'263.png\''
      break
    case 1153: // light drizzle
      weatherConditionStatement += 'wcond1 = \'U\', wcond2 = \'U\', graphic = \'266.png\''
      break
    case 1168: // freezing drizzle
      weatherConditionStatement += 'wcond1 = \'U\', wcond2 = \'U\', graphic = \'281.png\''
      break
    case 1171: // heavy freezing drizzle
      weatherConditionStatement += 'wcond1 = \'U\', wcond2 = \'U\', graphic = \'284.png\''
      break
    case 1180: // patchy light rain
      weatherConditionStatement += 'wcond1 = \'U\', wcond2 = \'T\', graphic = \'293.png\''
      break
    case 1183: // light rain
      weatherConditionStatement += 'wcond1 = \'U\', wcond2 = \'U\', graphic = \'296.png\''
      break
    case 1186: // moderate rain at times
      weatherConditionStatement += 'wcond1 = \'U\', wcond2 = \'U\', graphic = \'299.png\''
      break
    case 1189: // moderate rain
      weatherConditionStatement += 'wcond1 = \'V\', wcond2 = \'U\', graphic = \'302.png\''
      break
    case 1192: // heavy rain at times
      weatherConditionStatement += 'wcond1 = \'V\', wcond2 = \'U\', graphic = \'305.png\''
      break
    case 1195: // heavy rain
      weatherConditionStatement += 'wcond1 = \'V\', wcond2 = \'U\', graphic = \'308.png\''
      break
    case 1198: // light freezing rain
      weatherConditionStatement += 'wcond1 = \'V\', wcond2 = \'U\', graphic = \'311.png\''
      break
    case 1201: // moderate of heavy freezing rain
      weatherConditionStatement += 'wcond1 = \'V\', wcond2 = \'U\', graphic = \'314.png\''
      break
    case 1204: // light sleet
      weatherConditionStatement += 'wcond1 = \'Y\', wcond2 = \'U\', graphic = \'317.png\''
      break
    case 1207: // moderate or heavy sleet
      weatherConditionStatement += 'wcond1 = \'Y\', wcond2 = \'V\', graphic = \'320.png\''
      break
    case 1210: // patchy light snow
      weatherConditionStatement += 'wcond1 = \'Y\', wcond2 = \'T\', graphic = \'323.png\''
      break
    case 1213: // light snow
      weatherConditionStatement += 'wcond1 = \'Y\', wcond2 = \'Y\', graphic = \'326.png\''
      break
    case 1216: // patchy moderate snow
      weatherConditionStatement += 'wcond1 = \'Y\', wcond2 = \'V\', graphic = \'329.png\''
      break
    case 1219: // moderate snow
      weatherConditionStatement += 'wcond1 = \'Y\', wcond2 = \'V\', graphic = \'332.png\''
      break
    case 1222: // patchy heavy snow
      weatherConditionStatement += 'wcond1 = \'W\', wcond2 = \'Y\', graphic = \'335.png\''
      break
    case 1225: // heavy snow
      weatherConditionStatement += 'wcond1 = \'Y\', wcond2 = \'V\', graphic = \'338.png\''
      break
    case 1237: // ice pellets
      weatherConditionStatement += 'wcond1 = \'U\', wcond2 = \'Y\', graphic = \'350.png\''
      break
    case 1240: // light rain shower
      weatherConditionStatement += 'wcond1 = \'U\', wcond2 = \'U\', graphic = \'353.png\''
      break
    case 1243: // moderate or heavy rain shower
      weatherConditionStatement += 'wcond1 = \'U\', wcond2 = \'V\', graphic = \'356.png\''
      break
    case 1246: // Torrential rain shower
      weatherConditionStatement += 'wcond1 = \'V\', wcond2 = \'U\', graphic = \'359.png\''
      break
    case 1249: // light sleet showers
      weatherConditionStatement += 'wcond1 = \'Y\', wcond2 = \'U\', graphic = \'362.png\''
      break
    case 1252: // moderate or heavy sleet showers
      weatherConditionStatement += 'wcond1 = \'Y\', wcond2 = \'V\', graphic = \'365.png\''
      break
    case 1255: // light snow showers
      weatherConditionStatement += 'wcond1 = \'Y\', wcond2 = \'W\', graphic = \'368.png\''
      break
    case 1258: // moderate or heavy snow showers
      weatherConditionStatement += 'wcond1 = \'W\', wcond2 = \'Y\', graphic = \'371.png\''
      break
    case 1261: // light shows of ice pellets
      weatherConditionStatement += 'wcond1 = \'U\', wcond2 = \'Y\', graphic = \'374.png\''
      break
    case 1264: // moderate or heavy showers of ice pellets
      weatherConditionStatement += 'wcond1 = \'V\', wcond2 = \'Y\', graphic = \'377.png\''
      break
    case 1273: // patchy light rain with thunder
      weatherConditionStatement += 'wcond1 = \'U\', wcond2 = \'T\', graphic = \'386.png\''
      break
    case 1276: // moderate or heavy rain with thunder
      weatherConditionStatement += 'wcond1 = \'V\', wcond2 = \'U\', graphic = \'389.png\''
      break
    case 1279: // moderate or heavy snow showers
      weatherConditionStatement += 'wcond1 = \'Y\', wcond2 = \'T\', graphic = \'392.png\''
      break
    case 1282: // moderate or heavy snow showers
      weatherConditionStatement += 'wcond1 = \'W\', wcond2 = \'Y\', graphic = \'395.png\''
      break
    default: console.log('ERROR code not found')
  }
  weatherConditionStatement += ', '
  return weatherConditionStatement
}

var buildUpdate = function (days, timeInc, zip, target) {
  let thisHour = target < 24 ? days[0].hour[target] : days[1].hour[target - 24]
  let nextHour = target < 23 ? days[0].hour[target + 1] : days[1].hour[target - 23]
  console.log(thisHour.time)

  var setquery = {
    // give the query a unique name
    name: 'update from weather predictor',
    text: 'UPDATE  weathertable SET ' // needs to be built
  }
  let chanceofpercip, chanceofpercip2

  if (timeInc % 2 === 0) { // needs to be averaged
    chanceofpercip = thisHour.chance_of_rain > thisHour.chance_of_snow ? thisHour.chance_of_rain : thisHour.chance_of_snow
    chanceofpercip2 = nextHour.chance_of_rain > nextHour.chance_of_snow ? nextHour.chance_of_rain : nextHour.chance_of_snow
    let avgPercip = ((parseInt(chanceofpercip) + parseInt(chanceofpercip2)) / 2).toFixed(0)
    console.log('\t\t avgPercip: ' + avgPercip)
    setquery.text += 'chanceofpercipitation = \'' + avgPercip + '%\', '
    setquery.text += 'temperature = \'' + ((thisHour.temp_f + nextHour.temp_f) / 2).toFixed(1) + '\', '
    setquery.text += 'windspeed = \'' + ((thisHour.wind_mph + nextHour.wind_mph) / 2).toFixed(1) + '\', '
    setquery.text += 'humidity = \'' + ((thisHour.humidity + nextHour.humidity) / 2).toFixed(0) + '%\', '
  } else { // does not to be averaged
    chanceofpercip = thisHour.chance_of_rain > thisHour.chance_of_snow ? thisHour.chance_of_rain : thisHour.chance_of_snow
    console.log('\t\t precip: ' + chanceofpercip)
    setquery.text += 'chanceofpercipitation = \'' + chanceofpercip + '%\', '
    setquery.text += 'temperature = \'' + thisHour.temp_f + '\', '
    setquery.text += 'windspeed = \'' + thisHour.wind_mph + '\', '
    setquery.text += 'humidity = \'' + (thisHour.humidity).toFixed(0) + '%\', '
  }

  // used by either case
  setquery.text += mapTempCodes(thisHour.temp_f)
  setquery.text += mapWindCodes(thisHour.wind_mph)
  setquery.text += mapWeatherConditions(parseInt(thisHour.condition.code))
  setquery.text += 'wconditions = \'' + thisHour.condition.text + '\', '
  let nightorday = thisHour.is_day > 0 ? 'day' : 'night'
  setquery.text += 'nightorday = \'' + nightorday + '\', '
  setquery.text += 'weatherupdated = true, '
  setquery.text += 'winddirection = \'' + thisHour.wind_dir + '\' '
  setquery.text += 'WHERE timevalue = ' + timeInc + ' AND zip = \'' + zip + '\''
  setquery.text += ' AND week = ' + WEEK_NUMBER
  console.log(setquery.text)

  return setquery.text
}

var processDays = function (err, days, rows, target, zip, callback) { // from apixu API future weather info
  if (err) {
    console.log(err.stack)
  } else {
    pool.query(buildUpdate(days, 1, zip, target), (err, res) => {
      if (err) {
        console.log(err.stack)
      } else {
        pool.query(buildUpdate(days, 2, zip, target), (err, res) => {
          if (err) {
            console.log(err.stack)
          } else {
            pool.query(buildUpdate(days, 3, zip, target + 1), (err) => {
              if (err) {
                console.error(err.stack)
              } else {
                pool.query(buildUpdate(days, 4, zip, target + 1), (err) => {
                  if (err) {
                    console.error(err.stack)
                  } else {
                    pool.query(buildUpdate(days, 5, zip, target + 2), (err) => {
                      if (err) {
                        console.error(err.stack)
                      } else {
                        pool.query(buildUpdate(days, 6, zip, target + 2), (err) => {
                          if (err) {
                            console.error(err.stack)
                          } else {
                            pool.query(buildUpdate(days, 7, zip, target + 3), (err) => {
                              if (err) {
                                console.error(err.stack)
                              } else {
                                pool.query(buildUpdate(days, 8, zip, target + 3), (err) => {
                                  if (err) {
                                    console.error(err.stack)
                                  } else {
                                    pool.query(buildUpdate(days, 9, zip, target + 4), (err) => {
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
