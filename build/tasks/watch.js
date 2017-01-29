const gulp 			= require('gulp'),
	paths 			= require('../paths'),
	browserSync = require('browser-sync');

// outputs changes to files to the console
function reportChange(event) {
  console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
}

gulp.task('watch', ['serve'], function(){
  gulp.watch(paths.js, ['build-js', browserSync.reload]).on('change', reportChange);
  gulp.watch(paths.sass, ['build-css', browserSync.reload]).on('change', reportChange);
  gulp.watch("**/*.html", ['build-html', browserSync.reload]).on('change', reportChange);
});