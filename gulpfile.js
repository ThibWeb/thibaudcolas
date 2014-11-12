'use strict';

// Include Gulp & Tools We'll Use
var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var del = require('del');
var runSequence = require('run-sequence');
var browserSync = require('browser-sync');
var pagespeed = require('psi');
var reload = browserSync.reload;
var deploy = require('gulp-gh-pages');
var browserify = require('browserify');
var es6ify = require('es6ify');
var source = require('vinyl-source-stream');

var AUTOPREFIXER_BROWSERS = [
  'ie >= 10',
  'ie_mob >= 10',
  'ff >= 30',
  'chrome >= 34',
  'safari >= 7',
  'opera >= 23',
  'ios >= 7',
  'android >= 4.4',
  'bb >= 10'
];

// Lint JavaScript
gulp.task('lint', function() {
  return gulp.src('app/scripts/**/*.js')
    .pipe(reload({stream: true, once: true}))
    .pipe($.jshint())
    .pipe($.jshint.reporter('jshint-stylish'))
    .pipe($.jscs({esnext: true}))
    .pipe($.if(!browserSync.active, $.jshint.reporter('fail')));
});

// Optimize Images
gulp.task('images', function() {
  return gulp.src('app/images/**/*')
    .pipe($.cache($.imagemin({
      progressive: true,
      interlaced: true
    })))
    .pipe(gulp.dest('dist/images'))
    .pipe($.size({title: 'images'}));
});

// Copy All Files At The Root Level (app)
gulp.task('copy', function() {
  return gulp.src([
    'app/*',
    '!app/index.html',
    'node_modules/apache-server-configs/dist/.htaccess'
  ], {
    dot: true
  }).pipe(gulp.dest('dist'))
    .pipe($.size({title: 'copy'}));
});

// Copy Web Fonts To Dist
gulp.task('fonts', function() {
  return gulp.src(['app/fonts/**'])
    .pipe(gulp.dest('dist/fonts'))
    .pipe($.size({title: 'fonts'}));
});

// Compile and Automatically Prefix Stylesheets
gulp.task('styles', function() {
  // For best performance, don't add Sass partials to `gulp.src`
  return gulp.src([
    'app/styles/*.scss',
    'app/styles/**/*.css'
  ])
    .pipe($.changed('styles', {extension: '.scss'}))
    .pipe($.sass({
      errLogToConsole: true,
      precision: 10
    }))
    .on('error', console.error.bind(console))
    .pipe($.autoprefixer({browsers: AUTOPREFIXER_BROWSERS}))
    .pipe(gulp.dest('.tmp/styles'))
    .pipe(gulp.dest('dist/styles'))
    .pipe($.size({title: 'styles'}));
});

// Process JS with Browserify
gulp.task('browserify', function() {
  return browserify({debug: true})
    .transform(es6ify)
    .require(require.resolve('./app/scripts/main.js'), {entry: true})
    .bundle()
    // Pass desired output filename to vinyl-source-stream
    .pipe(source('bundle.js'))
    // Start piping stream to tasks!
    .pipe(gulp.dest('.tmp/scripts'));
});

// Scan Your HTML For Assets & Optimize Them
gulp.task('html', ['browserify'], function() {
  var assets = $.useref.assets({searchPath: '{.tmp,app}'});

  return gulp.src('app/index.html')
    .pipe(assets)
    // Concatenate And Minify JavaScript
    .pipe($.if('*.js', $.uglify()))
    // Remove Any Unused CSS
    .pipe($.if('*.css', $.uncss({
      html: [
        'app/index.html'
      ],
      // CSS Selectors for UnCSS to ignore
      ignore: [
        /.js-email-replace/
      ]
    })))
    // Concatenate And Minify Styles
    .pipe($.if('*.css', $.csso()))
    .pipe($.if('*.css', $.minifyCss({keepSpecialComments : 0})))
    .pipe(assets.restore())
    .pipe($.useref())
    // Minify Any HTML
    .pipe($.if('*.html', $.minifyHtml()))
    .pipe($.if('*.html', $.replace('<script src', '<script async defer src')))
    // Output Files
    .pipe(gulp.dest('dist'))
    .pipe($.size({title: 'html'}));
});

// Clean Output Directory
gulp.task('clean', del.bind(null, ['.tmp', 'dist']));

// Watch Files For Changes & Reload
gulp.task('serve', ['styles', 'browserify'], function() {
  browserSync({
    notify: false,
    server: ['.tmp', 'app']
  });

  gulp.watch(['app/index.html'], reload);
  gulp.watch(['app/styles/**/*.{scss,css}'], ['styles', reload]);
  gulp.watch(['app/scripts/**/*.js'], ['lint', 'browserify']);
  gulp.watch(['app/images/**/*'], reload);
});

// Build and serve the output from the dist build
gulp.task('serve:dist', ['default'], function() {
  browserSync({
    notify: false,
    server: 'dist'
  });
});

// Build Production Files, the Default Task
gulp.task('build', ['clean'], function(cb) {
  runSequence('styles', ['lint', 'html', 'images', 'fonts', 'copy'], cb);
});

// Run PageSpeed Insights
// Update `url` below to the public URL for your site
gulp.task('pagespeed', pagespeed.bind(null, {
  // By default, we use the PageSpeed Insights
  // free (no API key) tier. You can use a Google
  // Developer API key if you have one. See
  // http://goo.gl/RkN0vE for info key: 'YOUR_API_KEY'
  url: 'https://thibweb.github.io/thibaudcolas/',
  strategy: 'mobile'
}));

// Deploy to GitHub Pages.
gulp.task('deploy', function() {
  gulp.src('dist/**/*')
    .pipe(deploy('git@github.com:ThibWeb/thibaudcolas.git', 'origin'));
});

// Build Production Files, the Default Task
gulp.task('default', ['build']);

// Load custom tasks from the `tasks` directory
try { require('require-dir')('tasks'); } catch (err) {}
