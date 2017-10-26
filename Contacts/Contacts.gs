// MARK: Initialize Contacts
function _initializeContacts(shouldUpdateCache) {
  if (shouldUpdateCache) {
    // Force Update
    __updateContacts(fetchAllContacts())
  }
  // Contacts Already Initialized
  if (contacts) return
  try {
    // Try to init from cache
    var cache = getCacheFile().getBlob().getDataAsString()
    // We don't update cache here,
    // So should not use __updateContacts
    contacts = JSON.parse(cache)
  } catch (exception) {
    Logger.log(exception)
  }
  // Invalid cache leads to an update
  if (contacts) return
  __updateContacts(fetchAllContacts())
}

var kCodeFolderName = "Code"
var kCacheFileName = "[Don't Delete] Contacts Info Cache.json"
function getCacheFile() {
  // Get Code Folder
  var iter = DriveApp.getFoldersByName(kCodeFolderName)
  var folder = iter.hasNext() ? iter.next()
    : DriveApp.createFolder(kCodeFolderName)
  // Get Cache File
  iter = folder.getFilesByName(kCacheFileName)
  return iter.hasNext() ? iter.next()
    : folder.createFile(kCacheFileName, "")
}

function fetchAllContacts() {
  var personFields = kPersonFieldAll
  var pageSize = validPageSize()
  var curItems = 0
  var totalItems = 0
  var pageToken = ""
  var results = []
  do { // At this time we only have totalItems of 653 contacts
    // But someday we'll eventually have more than kPeopleListPageSizeMax
    // Just in case, we traverse through all the pages available
    var json = getPeopleListJSON(personFields, pageSize, pageToken)
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

function __updateContacts(newContacts) {
  // Avoid false updates
  if (contacts === newContacts) return
  contacts = newContacts
  // Update cache
  getCacheFile().setContent(JSON.stringify(contacts))
}

function getContacts(flatMapper) {
  _initializeContacts()
  if (!flatMapper) return contacts
  var results = []
  for (var i = 0; i < contacts.length; i++) {
    var result = flatMapper(contacts[i]) // Map
    if (result) results.push(result) // Filter
  }
  return results
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
        names[i].displayName.includes(name)
        // And/or name is in `Last, First M.`
        || names[i].displayNameLastFirst.includes(name)
    }
    // Only proceed if same person
    if (!nameMatches) return null
    // Validate Email
    var emails = connection[kPersonFieldEmailAddresses]
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
  }, kPersonFieldNames, kPersonFieldEmailAddresses)
  if (!emails || emails.length > 1) {
    throw new Error("Can't pick an email for " + name + " from " + emails)
  }
  return emails[0]
}