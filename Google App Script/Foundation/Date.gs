Date.prototype.isSameDayAs = function(anotherDate) {
  return this.getFullYear() == anotherDate.getFullYear()
  && this.getMonth() == anotherDate.getMonth()
  && this.getDate() == anotherDate.getDate()
}

Date.prototype.isTomorrow = function() {
  var tomorrow = new Date() // We'll make it tomorrow
  tomorrow.setDate(tomorrow.getDate() + 1) // By this
  return this.isSameDayAs(tomorrow)
}

var MONTH = [
"January","February","March","April",
"May","June","July","August","September",
"October","November","December"
]

function parseMonth(stringMonth, defaultValue) {
  stringMonth = stringMonth.replace(".","")
  for (var i = 0; i < MONTH.length; i++)
    if (MONTH[i].includes(stringMonth))
      return i
  return (defaultValue) ? defaultValue : -1
}
