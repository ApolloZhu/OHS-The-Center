// MARK: OAuth

// Please don't include this credential in public domain.
var peopleServiceClientSecret = ""

function getPeopleService() {
  // Create a new service with the given name. The name will be used when
  // persisting the authorized token, so ensure it is unique within the
  // scope of the property store.
  // https://github.com/googlesamples/apps-script-oauth2
  return OAuth2.createService("people")
    // https://console.developers.google.com/apis/credentials?project=composite-watch-183709

    // Set the endpoint URLs, which are the same for all Google services.
    .setAuthorizationBaseUrl("https://accounts.google.com/o/oauth2/auth")
    .setTokenUrl("https://accounts.google.com/o/oauth2/token")

    // Set the client ID and secret, from the Google Developers Console.
    .setClientId("358259826112-02rq26meqdbi278hsrb58erd5c620n8b.apps.googleusercontent.com")
    .setClientSecret(peopleServiceClientSecret)

    // Set the name of the callback function in the script referenced
    // above that should be invoked to complete the OAuth flow.
    .setCallbackFunction("peopleAuthCallback")

    // Set the property store where authorized tokens should be persisted.
    .setPropertyStore(PropertiesService.getUserProperties())

    // Set the scopes to request (space-separated for Google services).
    .setScope("https://www.googleapis.com/auth/contacts.readonly")

    // Below is/are Google-specific OAuth2 parameter(s).

    // Sets the login hint, which will prevent the account chooser screen
    // from being shown to users logged in with multiple accounts.
    .setParam("login_hint", Session.getActiveUser().getEmail())
}

function peopleAuthCallback(request) {
  var peopleService = getPeopleService()
  var isAuthorized = peopleService.handleCallback(request)
  if (isAuthorized) {
    return HtmlService.createHtmlOutput("Success! You can close this tab.")
  }
  throw new Error("Authorization Denied")
}

function getPeopleServiceAccessToken() {
  var peopleService = getPeopleService()
  if (!peopleService.hasAccess()) {
    var authorizationUrl = peopleService.getAuthorizationUrl()
    // We can not open a window to request authorization
    // So we have to throw an error to show the url.
    // Just copy that url and paste into the browser.
    // It might say that the app is not verified,
    // Just click on the "Advanced" at the bottom,
    // And click on the "Go to...", then enter "Continue".
    throw new Error(authorizationUrl)
  }
  return peopleService.getAccessToken()
}

// MARK: Person Fields
var kAddress = "addresses"
var kAgeRange = "ageRanges"
var kBiographies = "biographies"
var kBirthdays = "birthdays"
var kBraggingRights = "braggingRights"
var kCoverPhotos = "coverPhotos"
var kEmailAddresses = "emailAddresses"
var kEvents = "events"
var kGenders = "genders"
var kIMClients = "imClients"
var kInterests = "interests"
var kLocales = "locales"
var kMemberships = "memberships"
var kMetadata = "metadata"
var kNames = "names"
var kNicknames = "nicknames"
var kOccupations = "occupations"
var kOrganizations = "organizations"
var kPhoneNumbers = "phoneNumbers"
var kPhotos = "photos"
var kRelations = "relations"
var kRelationshipInterests = "relationshipInterests"
var kRelationshipStatuses = "relationshipStatuses"
var kResidences = "residences"
var kSkills = "skills"
var kTaglines = "taglines"
var kURLs = "urls"

var kAllPersonFields = [
  kAddress, kAgeRange, kBiographies, kBirthdays,
  kBraggingRights, kCoverPhotos, kEmailAddresses,
  kEvents, kGenders, kIMClients, kInterests, kLocales,
  kMemberships, kMetadata, kNames, kNicknames, kOccupations,
  kOrganizations, kPhoneNumbers, kPhotos, kRelations,
  kRelationshipInterests, kRelationshipStatuses,
  kResidences, kSkills, kTaglines, kURLs
].join(",")

// MARK: Page Size
var kPageSizeMax = 2000
var kPageSizeDefault = 100
var kPageSizeMin = 1

function validPageSize(pageSize) {
  if (!pageSize) pageSize = kPageSizeDefault
  return Math.max(kPageSizeMin, Math.min(kPageSizeMax, pageSize))
}

// MARK: Network Request
function _initializeContacts() {
  var personFields = kAllPersonFields
  var pageSize = validPageSize()
  var curItems = 0
  var totalItems = 0
  var pageToken = ""
  var results = []
  do { // At this time we only have totalItems of 653 contacts
    // But someday we'll eventually have more than kPageSizeMax
    // Just in case, we traverse through all the pages available
    var json = getPeopleResponseJSON(personFields, pageSize, pageToken)
    curItems += pageSize
    totalItems = json.totalItems
    pageToken = json.nextPageToken
    // Traverse through all the connections in this page
    for (var i = 0; i < json.connections.length; i++) {
      results.push(json.connections[i])
    }
  } while (curItems < totalItems)
  return results
}

var contacts = null

function getContacts(flatMapper) {
  if (!contacts) contacts = _initializeContacts()
  if (!flatMapper) return contacts
  var results = []
  for (var i = 0; i < contacts.length; i++) {
    var result = flatMapper(contacts[i]) // Map
    if (result) results.push(result) // Filter
  }
  return results
}

var CONTACTS_BASE_URL = "https://people.googleapis.com/v1/people/me/connections?"

function getPeopleResponseJSON(personFields, pageSize, pageToken) {
  // Construct Path Parameter
  var pathParameters = joinPathParameters({
    pageSize: pageSize,
    pageToken: pageToken,
    personFields: personFields
  })
  // Make Request
  var url = CONTACTS_BASE_URL + pathParameters
  var response = UrlFetchApp.fetch(url, {
    headers: {
      Authorization: "Bearer " + getPeopleServiceAccessToken()
    }
  })
  return JSON.parse(response.getContentText())
}

function emailOf(name, isTeacher) {
  var emails = getContacts(function (connection) {
    // Match Name
    var names = connection.names
    // Yeah, there are nameless contacts
    if (!names) return null
    var nameMatches = false
    var nameLength = names.length
    for (var i = 0; !nameMatches && i < nameLength; i++) {
      nameMatches |= // Is considered as the same person
        // If name is in `First M. Last`
        names[i].displayName.indexOf(name) != -1
        // And/or name is in `Last, First M.`
        || names[i].displayNameLastFirst.indexOf(name) != -1
    }
    // Only proceed if same person
    if (!nameMatches) return null
    // Validate Email
    var emails = connection[kEmailAddresses]
    // We are only using the primary email
    // Mainly for those teachers who
    // Got a new email this year.
    var emailAddress = emails[0].value
    // Email is considered as valid if the person is
    var isValid = !isTeacher // not a teacher, or email ending
      || emailAddress.slice(-9) == "@fcps.edu" // is @fcps.edu
    // Only return valid emails
    Logger.log(name + ": " + emailAddress + "(" + isValid ? "valid" : "invalid" + ")")
    return isValid ? emailAddress : null
  }, kNames, kEmailAddresses)
  if (!emails || emails.length > 1) {
    throw new Error("Can't pick an email for " + name + " from " + emails)
  }
  return emails[0]
}