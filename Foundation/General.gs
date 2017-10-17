/** 
 * Key for excessing the email address filled in the form from the map  
 * created using Foundation.mapOfTitlesToItemResponsesOfLastResponseFromFormURL.
 */
var kRespondentEmailAddress = "Email Address"

/**
 * Create a mapping relationship from question titles to their responses.
 * Example:
 * var responses = Foundation.mapOfTitlesToItemResponsesOfLastResponseFromFormURL("https://...")
 * // Get the answer to a question titled "The title of that question":
 * var answerToAQuestion = responses["The title of that question"]
 * // Get the email address of the person who filled out the form response.
 * var email = responses[kRespondentEmailAddress]
 *
 * @param formURL: url to the form.
 * @return an object, with titles of questions as keys and their corresponding reponses as values.
 */
function mapOfTitlesToItemResponsesOfLastResponseFromFormURL(formURL) {
  var form = FormApp.openByUrl(formURL)
  var formResponses = form.getResponses() // array
  if (formResponses.length < 1) return null
  var formResponse = formResponses[formResponses.length - 1] // last form response
  var itemResponses = formResponse.getItemResponses() //array
  var map = itemResponses.reduce(function(output, response) {
    output[response.getItem().getTitle()] = response.getResponse()
    return output
  }, {})
  // Known: null if response is not yet submitted.
  // Should check what happens when the form is not collecting email.
  var email = formResponse.getRespondentEmail()
  map[kRespondentEmailAddress] = email ? email : ""
  return map
}

/**
 * Formats an arbitary amount of arguments into .
 * @return Empty string if no argument, or String of form: A, B, ..., and C
 */
function descriptionForList() {
  if (!arguments) return ""
  if (arguments.length == 1 && Array.isArray(arguments[0])) {
    arguments = arguments[0]
  }
  if (arguments.length == 1) return arguments;
  if (arguments.length == 2) return arguments[0] + " and " + arguments[1];

  var output = arguments[0]
  for (var i = 1; i < arguments.length - 1; i++) {
    if (arguments[i]) {
      output += ", " + arguments[i]
    }
  }
  output += ", and " + arguments[arguments.length - 1]
  return output
}