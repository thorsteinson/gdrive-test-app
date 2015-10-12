
// Your Client ID can be retrieved from your project in the Google
// Developer Console, https://console.developers.google.com
var CLIENT_ID = '681676105907-omec1itmltlnknrdfo150qcn7pdt95ri.apps.googleusercontent.com';

var SCOPES = ['https://www.googleapis.com/auth/drive.metadata.readonly'];

/**
  * Check if current user has authorized this application.
  */
function checkAuth() {
  gapi.auth.authorize(
    {
      'client_id': CLIENT_ID,
      'scope': SCOPES.join(' '),
      'immediate': true
    }, handleAuthResult);
}

/**
  * Handle response from authorization server.
  *
  * @param {Object} authResult Authorization result.
  */
function handleAuthResult(authResult) {
  var authorizeDiv = document.getElementById('auth');
  if (authResult && !authResult.error) {
    // Hide auth UI, then load client library.
    authorizeDiv.style.display = 'none';
    loadDriveApi();
  } else {
    // Show auth UI, allowing the user to initiate authorization by
    // clicking authorize button.
    authorizeDiv.style.display = 'inline';
  }
}

/**
  * Initiate auth flow in response to user clicking authorize button.
  *
  * @param {Event} event Button click event.
  */
function handleAuthClick(event) {
  gapi.auth.authorize(
    {client_id: CLIENT_ID, scope: SCOPES, immediate: false},
    handleAuthResult);
  return false;
}

/**
  * Load Drive API client library.
  */
function loadDriveApi() {
  gapi.client.load('drive', 'v2', listFiles);
}

/**
  * Print files.
  */
function listFiles() {
  var request = gapi.client.drive.files.list({
      'maxResults': 30
    });

  var filesSection = $('#files');

  request.execute(function(resp) {
    appendFile('Files:', filesSection);
    var files = resp.items;

    files.forEach(function(file) {
      appendFile(file.title + ' (' + file.id + ')', filesSection);
    });
  });
}

/**
  * Adds a new element into our files section
  *
  * @param {string} message Text to be placed in pre element.
  */
function appendFile(message, fileRef) {
  var fileContainer = $('<li></li>');
  fileContainer.append(message);
  fileRef.append(fileContainer);
}
