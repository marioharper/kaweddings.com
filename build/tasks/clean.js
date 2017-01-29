const gulp     	= require('gulp'),
		clean 		= require('gulp-clean'),
  	paths     = require('../paths');

gulp.task('clean', function(){
	return gulp.src(paths.output, {read: false}).pipe(clean());
});
