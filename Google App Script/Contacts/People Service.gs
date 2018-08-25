// MARK: OAuth2
// https://github.com/googlesamples/apps-script-oauth2

// Please don't include this credential in public domain.
var peopleServiceClientSecret = ""

// https://console.developers.google.com/apis/credentials?project=composite-watch-183709
function getPeopleService() {
  // Create a new service with the given name. The name will be used when
  // persisting the authorized token, so ensure it is unique within the
  // scope of the property store.
  return OAuth2.createService("people")

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
var kPersonFieldAddress = "addresses"
var kPersonFieldAgeRange = "ageRanges"
var kPersonFieldBiographies = "biographies"
var kPersonFieldBirthdays = "birthdays"
var kPersonFieldBraggingRights = "braggingRights"
var kPersonFieldCoverPhotos = "coverPhotos"
var kPersonFieldEmailAddresses = "emailAddresses"
var kPersonFieldEvents = "events"
var kPersonFieldGenders = "genders"
var kPersonFieldIMClients = "imClients"
var kPersonFieldInterests = "interests"
var kPersonFieldLocales = "locales"
var kPersonFieldMemberships = "memberships"
var kPersonFieldMetadata = "metadata"
var kPersonFieldNames = "names"
var kPersonFieldNicknames = "nicknames"
var kPersonFieldOccupations = "occupations"
var kPersonFieldOrganizations = "organizations"
var kPersonFieldPhoneNumbers = "phoneNumbers"
var kPersonFieldPhotos = "photos"
var kPersonFieldRelations = "relations"
var kPersonFieldRelationshipInterests = "relationshipInterests"
var kPersonFieldRelationshipStatuses = "relationshipStatuses"
var kPersonFieldResidences = "residences"
var kPersonFieldSkills = "skills"
var kPersonFieldTaglines = "taglines"
var kPersonFieldURLs = "urls"

var kPersonFieldAll = [
  kPersonFieldAddress,
  kPersonFieldAgeRange,
  kPersonFieldBiographies,
  kPersonFieldBirthdays,
  kPersonFieldBraggingRights,
  kPersonFieldCoverPhotos,
  kPersonFieldEmailAddresses,
  kPersonFieldEvents,
  kPersonFieldGenders,
  kPersonFieldIMClients,
  kPersonFieldInterests,
  kPersonFieldLocales,
  kPersonFieldMemberships,
  kPersonFieldMetadata,
  kPersonFieldNames,
  kPersonFieldNicknames,
  kPersonFieldOccupations,
  kPersonFieldOrganizations,
  kPersonFieldPhoneNumbers,
  kPersonFieldPhotos,
  kPersonFieldRelations,
  kPersonFieldRelationshipInterests,
  kPersonFieldRelationshipStatuses,
  kPersonFieldResidences,
  kPersonFieldSkills,
  kPersonFieldTaglines,
  kPersonFieldURLs
].join(",")

// MARK: Page Size
var kPeopleListPageSizeMax = 2000
var kPeopleListPageSizeDefault = 100
var kPeopleListPageSizeMin = 1

function validPageSize(pageSize) {
  if (!pageSize) pageSize = kPeopleListPageSizeDefault
  return Math.max(kPeopleListPageSizeMin,
    Math.min(kPeopleListPageSizeMax, pageSize))
}

var PEOPLE_LIST_BASE_URL = "https://people.googleapis.com/v1/people/me/connections?"

function getPeopleListJSON(personFields, pageSize, pageToken) {
  // Construct Path Parameter
  var pathParameters = Foundation.joinPathParameters({
    pageSize: pageSize,
    pageToken: pageToken,
    personFields: personFields
  })
  // Make Request
  var url = PEOPLE_LIST_BASE_URL + pathParameters
  var response = UrlFetchApp.fetch(url, {
    headers: {
      Authorization: "Bearer " + getPeopleServiceAccessToken()
    }
  })
  return JSON.parse(response.getContentText())
}