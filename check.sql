SELECT timeincrement, weatherupdated, temperature, windspeed, winddirection, humidity, timevalue
 FROM weathertable 
 WHERE week = 1 AND zip = '02035' order by timevalue