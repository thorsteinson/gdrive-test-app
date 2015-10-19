$(document).ready(function() {
  // Your Client ID can be retrieved from your project in the Google
  // Developer Console, https://console.developers.google.com
  var CLIENT_ID = '681676105907-omec1itmltlnknrdfo150qcn7pdt95ri.apps.googleusercontent.com';

  var SCOPES = ['https://www.googleapis.com/auth/drive.metadata.readonly'];


  /**
    * Adds a new element into our files section
    *
    * @param {object} file object
    */
  function appendFile(file, fileRef) {
    var fileContainer = $('<div>').addClass('file');
    var title = $('<a>')
          .attr('href', file.selfLink)
          .append($('<h3>')
            .append(file.title)
            .addClass('title'));
    var description = $('<p>')
          .append(file.id)
          .addClass('identity');

    console.log(file);

    fileContainer
      .append(title)
      .append(description);

  }


  // Authorization model
  function AuthModel() {
    var self = this;

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
        // Tell our model that everthing is authorized
        self.isAuthorized(true);
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
    function handleAuthClick() {
      console.log('Authorizing...');
      console.log(self);
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
        var files = resp.items;

        files.forEach(function(file) {
          appendFile(file, filesSection);
        });
      });
    }

    this.isAuthorized = ko.observable(false);
    this.handleAuth = handleAuthClick();
  }

  // File Model
  function FileModel() {
    var self = this;


  }

  ko.applyBindings(new AuthModel());
  // ko.applyBindings(new FileModel());
});