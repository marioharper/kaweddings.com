const gulp = require('gulp'),
  sass = require('gulp-sass'),
  browserSync = require('browser-sync'),
  runSequence = require('run-sequence'),
  nunjucksRender = require('gulp-nunjucks-render'),
  paths = require('../paths'),
  browserify = require('browserify'),
  source = require('vinyl-source-stream'),
  glob = require('glob'),
  rename = require('gulp-rename'),
  es = require('event-stream'),
  autoprefixer = require('gulp-autoprefixer'),
  merge = require('merge-stream'),
  concat = require('gulp-concat');

// compiles nunjucks
gulp.task('build-html', function () {
  var galleries = {
    'sara-and-daniel': {
      name: 'Sarah & Daniel',
      images: [
        { large: { src: '/assets/images/gallery/sarah-and-daniel/1-1000x1500.jpg', width: 1000, height: 1500 }, small: { src: '/assets/images/gallery/sarah-and-daniel/1-300x450.jpg', width: 300, height: 450 } },
        { large: { src: '/assets/images/gallery/sarah-and-daniel/2-1000x1500.jpg', width: 1000, height: 1500 }, small: { src: '/assets/images/gallery/sarah-and-daniel/2-300x450.jpg', width: 300, height: 450 } },
        { large: { src: '/assets/images/gallery/sarah-and-daniel/3-1000x1500.jpg', width: 1000, height: 1500 }, small: { src: '/assets/images/gallery/sarah-and-daniel/3-300x450.jpg', width: 300, height: 450 } },
        { large: { src: '/assets/images/gallery/sarah-and-daniel/4-1000x1500.jpg', width: 1000, height: 1500 }, small: { src: '/assets/images/gallery/sarah-and-daniel/4-300x450.jpg', width: 300, height: 450 } },
        { large: { src: '/assets/images/gallery/sarah-and-daniel/5-1000x666.jpg', width: 1000, height: 666 }, small: { src: '/assets/images/gallery/sarah-and-daniel/5-300x200.jpg', width: 300, height: 200 } },
        { large: { src: '/assets/images/gallery/sarah-and-daniel/6-1000x666.jpg', width: 1000, height: 666 }, small: { src: '/assets/images/gallery/sarah-and-daniel/6-300x200.jpg', width: 300, height: 200 } },
        { large: { src: '/assets/images/gallery/sarah-and-daniel/7-1000x1500.jpg', width: 1000, height: 1500 }, small: { src: '/assets/images/gallery/sarah-and-daniel/7-300x450.jpg', width: 300, height: 450 } },
        { large: { src: '/assets/images/gallery/sarah-and-daniel/8-1000x1500.jpg', width: 1000, height: 1500 }, small: { src: '/assets/images/gallery/sarah-and-daniel/8-300x450.jpg', width: 300, height: 450 } },
        { large: { src: '/assets/images/gallery/sarah-and-daniel/9-1000x666.jpg', width: 1000, height: 666 }, small: { src: '/assets/images/gallery/sarah-and-daniel/9-300x200.jpg', width: 300, height: 200 } },
        { large: { src: '/assets/images/gallery/sarah-and-daniel/10-1000x1500.jpg', width: 1000, height: 1500 }, small: { src: '/assets/images/gallery/sarah-and-daniel/10-300x450.jpg', width: 300, height: 450 } },
        { large: { src: '/assets/images/gallery/sarah-and-daniel/11-1000x666.jpg', width: 1000, height: 666 }, small: { src: '/assets/images/gallery/sarah-and-daniel/11-300x200.jpg', width: 300, height: 200 } },
        { large: { src: '/assets/images/gallery/sarah-and-daniel/12-1000x666.jpg', width: 1000, height: 666 }, small: { src: '/assets/images/gallery/sarah-and-daniel/12-300x200.jpg', width: 300, height: 200 } },
        { large: { src: '/assets/images/gallery/sarah-and-daniel/13-1000x1500.jpg', width: 1000, height: 1500 }, small: { src: '/assets/images/gallery/sarah-and-daniel/13-300x450.jpg', width: 300, height: 450 } },
        { large: { src: '/assets/images/gallery/sarah-and-daniel/14-1000x1499.jpg', width: 1000, height: 1499 }, small: { src: '/assets/images/gallery/sarah-and-daniel/14-300x449.jpg', width: 300, height: 449 } },
        { large: { src: '/assets/images/gallery/sarah-and-daniel/15-1000x666.jpg', width: 1000, height: 666 }, small: { src: '/assets/images/gallery/sarah-and-daniel/15-300x200.jpg', width: 300, height: 200 } },
        { large: { src: '/assets/images/gallery/sarah-and-daniel/16-1000x666.jpg', width: 1000, height: 666 }, small: { src: '/assets/images/gallery/sarah-and-daniel/16-300x200.jpg', width: 300, height: 200 } },
        { large: { src: '/assets/images/gallery/sarah-and-daniel/17-1000x1500.jpg', width: 1000, height: 1500 }, small: { src: '/assets/images/gallery/sarah-and-daniel/17-300x450.jpg', width: 300, height: 450 } },
        { large: { src: '/assets/images/gallery/sarah-and-daniel/18-1000x666.jpg', width: 1000, height: 666 }, small: { src: '/assets/images/gallery/sarah-and-daniel/18-300x200.jpg', width: 300, height: 200 } },
        { large: { src: '/assets/images/gallery/sarah-and-daniel/19-1000x666.jpg', width: 1000, height: 666 }, small: { src: '/assets/images/gallery/sarah-and-daniel/19-300x200.jpg', width: 300, height: 200 } },
        { large: { src: '/assets/images/gallery/sarah-and-daniel/20-1000x1500.jpg', width: 1000, height: 1500 }, small: { src: '/assets/images/gallery/sarah-and-daniel/20-300x450.jpg', width: 300, height: 450 } }
      ]
    }};

  return gulp.src(paths.html)
    .pipe(nunjucksRender({
      path: ['src'],
      data: {
        galleries: galleries
      }
    }))
    .pipe(gulp.dest(paths.output));
});

gulp.task('build-img', function () {
  return gulp.src(paths.img)
    .pipe(gulp.dest(paths.output + "assets/images"));
});

// transpiles changed es6 files to SystemJS format
// the plumber() call prevents 'pipe breaking' caused
// by errors from other gulp plugins
gulp.task('build-js', function (done) {
  glob(paths.js, function (err, files) {
    if (err) done(err);
    console.log(files);
    var tasks = files.map(function (entry) {
      return browserify({ entries: [entry] })
        .bundle()
        .pipe(source(entry))
        .pipe(rename('main.bundle.js'))
        .pipe(gulp.dest(paths.output + "assets/js/"));
    });

    es.merge(tasks).on('end', done);
  });
});

gulp.task('build-css', function () {
  var cssStream = gulp.src(paths.css)
    .pipe(concat('css-files.css'));

  var sassStream = gulp.src(paths.sass)
    .pipe(sass({
      outputStyle: 'compressed'
    }).on('error', sass.logError))
    .pipe(autoprefixer());

  var mergedStream = merge(sassStream, cssStream)
    .pipe(concat('main.css'))
    .pipe(gulp.dest(paths.output + "assets/styles/"))
    .pipe(browserSync.stream());

  return mergedStream;
});

gulp.task('build-copy', ['build-copy-photoswipe', 'build-copy-lazyload'], function () {
  return
});

gulp.task('build-copy-lazyload', function () {
  return gulp.src(['node_modules/vanilla-lazyload/dist/lazyload.min.js'])
    .pipe(gulp.dest(paths.output + "assets/vendor/vanilla-lazyload"));
});

gulp.task('build-copy-photoswipe', function () {
  return gulp.src(['node_modules/photoswipe/dist/**/*'])
    .pipe(gulp.dest(paths.output + "assets/vendor/photoswipe"));
});

gulp.task('build', function (callback) {
  return runSequence(
    'clean',
    ['build-html', 'build-img', 'build-js', 'build-css', 'build-copy'],
    callback
  );
});