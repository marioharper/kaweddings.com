const gulp = require('gulp'),
  contentful = require('contentful'),
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

const cache = {
  galleries: {
    loaded: false,
    data: [],
  }, 
  testimonials: {
    loaded: false,
    data: [],
  },
}

const client = contentful.createClient({
  space: process.env.contentfulSpace,
  accessToken: process.env.contentfulAccessToken,
});

const getGalleries = function (context) {
  if (cache.galleries.loaded) {
    console.log('Galleries loaded from cache.');
    return Promise.resolve(Object.assign({}, context, {
      galleries: cache.galleries.data
    }));
  }

  console.log('Fetching galleries.');
  return client.getEntries({
    'content_type': '7leLzv8hW06amGmke86y8G',
  }).then((entries) => {
    cache.galleries.loaded = true;
    cache.galleries.data = entries.items;

    return Promise.resolve(Object.assign({}, context, {
      galleries: entries.items
    }));
  });
}

const createGalleryPages = function (context) {
  context.galleries.forEach((gallery) => {
    return gulp.src('src/templates/gallery.html')
      .pipe(nunjucksRender({
        path: ['src'],
        data: {
          gallery: gallery
        }
      }))
      .pipe(rename(gallery.fields.slug + '.html'))
      .pipe(gulp.dest(paths.output + 'gallery/'));
  });

  return Promise.resolve(context);
}

const getTestimonials = function (context) {
  if (cache.testimonials.loaded) {
    console.log('Testimonials loaded from cache.');
    return Promise.resolve(Object.assign({}, context, {
      testimonials: cache.testimonials.data
    }));
  }

  console.log('Fetching testimonials.');
  return client.getEntries({
    'content_type': 'testimonial',
  }).then((entries) => {
    cache.testimonials.loaded = true;
    cache.testimonials.data = entries.items;

    return Promise.resolve(Object.assign({}, context, {
      testimonials: entries.items
    }));
  });
}

// compiles nunjucks
gulp.task('build-html', function () {
  const context = {
    galleries: cache.galleries,
    testimonials: cache.testimonials
  };

  return getGalleries(context)
    .then(createGalleryPages)
    .then(getTestimonials)
    .then((context) => {
      return gulp.src(paths.html)
        .pipe(nunjucksRender({
          path: ['src'],
          data: {
            galleries: context.galleries,
            testimonials: context.testimonials
          }
        }))
        .pipe(gulp.dest(paths.output));
    });
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