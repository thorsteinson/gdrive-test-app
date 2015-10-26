$(window).load(function() {
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
      gapi.auth.authorize(
        {client_id: CLIENT_ID, scope: SCOPES, immediate: false},
        handleAuthResult);
      return false;
    }

    /**
      * Load Drive API client library.
      */
    function loadDriveApi() {
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

  // This is the secret sauce for filtering out folders in Google drive.
  // Makes no sense, but hey, it freaking works.
  function isFolder(file) {
    return file.mimeType === "application/vnd.google-apps.folder";
  }

  // File Model
  function FileModel() {
    var self = this;

    // Keeps track of all the files 
    this.files = ko.observableArray([]);

    // Keeps track of metadata for files
    this.fileMetaData = [];

    // Keeps track of just folders
    this.folders = ko.observableArray([]);

    // Makes a request using the gapi
    this.getFiles = function(maxFiles) {
      maxFiles = maxFiles || 100; // 100 files by default
      var request = gapi.client.drive.files.list({
        'maxResults': maxFiles
      });

      retrieveMetaData()
        .then(function() {
          createFolderObjs();
          createFileObjs();
        })
        .done(function() {
          console.log('Finished everything');
        })

      // Get the metadata for all files
      function retrieveMetaData() {
        var deferred = $.Deferred();
        request.execute(function(resp) {
          self.fileMetaData = resp.items.filter(function(file) {
            return !file.explicitlyTrashed;
          });
          deferred.resolve();
        });

        return deferred.promise();
      }

      function createFolderObjs() {
        self.fileMetaData.filter(isFolder)
          .forEach(function(folder) {
            self.folders.push(folder);
          });
      }

      // Now that we have all of the metadata, and the list of folders, what
      // we can do is enhance our standard files, and add the boolean field,
      // isFolder (for much better UX and convenience)
      function createFileObjs() {
        // Adds all of the files to the observable array
        self.fileMetaData.filter(_.negate(isFolder))
          .forEach(function(file) {
            self.files.push(file);
          });
      }
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
    }
  }

  // Applies our models to the DOM
  var fileModel = new FileModel();
  var authModel = new AuthModel(fileModel);
  ko.applyBindings(authModel, $('#auth').get(0));
  ko.applyBindings(fileModel, $('#files').get(0));
});