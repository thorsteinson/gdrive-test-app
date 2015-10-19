$(document).ready(function() {
  'use strict';

  // Your Client ID can be retrieved from your project in the Google
  // Developer Console, https://console.developers.google.com
  var CLIENT_ID = '681676105907-omec1itmltlnknrdfo150qcn7pdt95ri.apps.googleusercontent.com';

  var SCOPES = ['https://www.googleapis.com/auth/drive'];

  // Authorization model
  function AuthModel(fileModel) {
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
      console.log(gapi.client);
      gapi.client.load('drive', 'v2', fileModel.getFiles);
    }

    /**
      * Print files.
      */
    function listFiles() {
      var request = gapi.client.drive.files.list({
        'maxResults': 30
      });

      request.execute(function(resp) {
        var files = resp.items;
      });
    }

    this.isAuthorized = ko.observable(false);
    this.handleAuth = handleAuthClick();
  }

  // File Model
  function FileModel() {
    console.log('FileModel Loaded');
    var self = this;

    // Keeps track of all the files 
    this.files = ko.observableArray([]);

    // Makes a request using the gapi
    this.getFiles = function(maxFiles) {
      console.log(gapi.client.drive);
      maxFiles = maxFiles || 100; // 100 files by default
      var request = gapi.client.drive.files.list({
        'maxResults': maxFiles
      });

      request.execute(function(resp) {
        ko.utils.arrayPushAll(self.files, resp.items);
        self.files.valueHasMutated();
      });
    }

    // Moves a file to the trash
    this.trashFile = function(file) {
      console.log('Deleting: ' + file.id);
      var request = gapi.client.drive.files.trash({
        'fileId': file.id
      });
      request.execute(function(resp) {
        console.log(resp);
        self.files.remove(function(f) {
          console.log(f);
          return file.id === f.id;
        });
      });

      // $.ajax({
      //   method: "POST",
      //   url: "https://content.googleapis.com/drive/v2/files/" + file.id + "/trash"
      // }).then(function(resp) {
      //   console.log(resonse);
      // });
    }
  }

  // Applies our models to the DOM
  var fileModel = new FileModel();
  var authModel = new AuthModel(fileModel);
  ko.applyBindings(authModel, $('#auth').get(0));
  ko.applyBindings(fileModel, $('#files').get(0));
});