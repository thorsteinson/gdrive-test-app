var gulp = require('gulp');

var server = require('gulp-server-livereload');

gulp.task('webserver', function() {
  gulp.src('./app/')
    .pipe(server({
      host: '0.0.0.0',
      livereload: true,
      directoryListing: true,
      open: true
    }));
});
