/**
 * Key for accessing the email address filled in the form from the map
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
 * @return an object, with titles of questions as keys and
 * their corresponding responses as values.
 */
function mapOfTitlesToItemResponsesOfLastResponseFromFormURL(formURL) {
  return mapOfTitlesToItemResponsesOfResponseAtIndexFromFormURL(-1, formURL)
}

function mapOfTitlesToItemResponsesOfResponseAtIndexFromFormURL(index, formURL) {
  /** @author Michele Wang */
  var form = FormApp.openByUrl(formURL)
  var formResponses = form.getResponses() // array
  if (formResponses.length < 1) return null
  // Invalid index: redirect to last form response
  if (!index || index < 0 || index >= formResponses.length) { 
    index = formResponses.length - 1
  }
  var formResponse = formResponses[index]
  var itemResponses = formResponse.getItemResponses() //array
  /** @author Apollo Zhu */
  var map = itemResponses.reduce(function (output, response) {
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
 * Formats an arbitrary amount of arguments into.
 * @return Empty string if no argument,
 * or String of form: A, B, ..., and C
 */
function descriptionForList() {
  // Special Cases
  if (!arguments) return ""
  if (arguments.length == 1
    && Array.isArray(arguments[0]))
    arguments = arguments[0]
  if (arguments.length == 1) return arguments
  if (arguments.length == 2) {
    return arguments[0] + " and " + arguments[1]
  }
  // Construct A, B, ..., and Z
  var output = ""
  for (var i = 0; i < arguments.length - 1; i++) {
    if (arguments[i]) {
      output += arguments[i] + ", "
    }
  }
  return output + "and " + arguments[arguments.length - 1]
}

function joinPathParameters(parameters) {
  if (!parameters) return ""
  var list = []
  for (var key in parameters) {
    var value = encodeURIComponent(parameters[key])
    if (value) list.push(key + "=" + value)
  }
  return list.join("&")
}

String.prototype.includes = function(substring) {
  return this.indexOf(substring) != -1
}
