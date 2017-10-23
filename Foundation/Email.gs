/** Email address to use when sending test emails. This one is Apollo's email. */
var DEBUG_EMAIL_ADDRESS = "public-apollonian@outlook.com"
/** Email list: center teachers. Current ones are for Ms. Lin and Ms. Brady. */
var CENTER_TEACHERS_EMAILS = stringEmailListByJoiningEmailAddresses("slin1@fcps.edu", "mpbrady1@fcps.edu")

var CENTER_EMAIL = "ohsthecenter@gmail.com"

/**
 * Send an email.
 * Use Foundation.stringEmailListByJoiningEmailAddresses(FromArray) to help you construct email lists as a single String.
 *
 * @param DEBUG false to send email to the specified email, or
 *              true  to send email to the DEBUG_EMAIL_ADDRESS specified in Foundation/Email.gs.
 * @param email   email (list) to send to.
 * @param subject subject of the email.
 * @param body    body of the email.
 * @param cc      email (list) to cc, if applicable
 */
function sendEmail(DEBUG, email, subject, body, cc) {
  MailApp.sendEmail(DEBUG ? DEBUG_EMAIL_ADDRESS : email, subject, body, {
    cc: stringEmailListByJoiningEmailAddresses(cc, DEBUG ? "" : CENTER_TEACHERS_EMAILS)
  })
}

/**
 * Joining together email address to an email list String.
 * @param as many email addresses as you wish.
 * @return String email list.
 */
function stringEmailListByJoiningEmailAddresses() {
  var emailList = ""
  for (var i = 0; i < arguments.length; i++) {
    var email = arguments[i]
    email = email ? email.toString().trim() : ""
    if (email) {
      emailList += "," + email
    }
  }
  var correct = emailList.substring(1) // Remove the extra comma at the beginning
  return correct
}

/**
 * Joining together contents of an array of email addresses to an email list String.
 * @param list an array of email addresses.
 * @return String email list.
 */
function stringEmailListByJoiningEmailAddressesFromArray(list) {
  var emailList = ""
  for (var i = 0; i < list.length; i++) {
    var email = list[i]
    email = email ? email.toString().trim() : ""
    if (email) {
      emailList += "," + email
    }
  }
  var correct = emailList.substring(1) // Remove the extra comma at the beginning
  return correct
}