var browserify = require('browserify'),
    minifyHtml = require('gulp-minify-html'),
    nodemon = require('gulp-nodemon'),
    concat = require('gulp-concat'),
    jshint = require('gulp-jshint'),
    source = require('vinyl-source-stream'),
    bower = require('gulp-bower'),
    gutil = require('gulp-util'),
    gulp = require('gulp'),
    jade = require('gulp-jade'),
    less = require('gulp-less'),
    path = require('path');

var paths = {
  public: 'public/**',
  jade: 'app/**/*.jade',
  styles: 'app/styles/*.+(less|css)',
  scripts: 'app/**/*.js',
  staticFiles: [
    '!app/**/*.+(less|css|js|jade)',
     'app/**/*.*'
  ]
};

gulp.task('jade', function() {
  gulp.src(paths.jade)
    .pipe(jade())
    .pipe(gulp.dest('./public/'));
});

gulp.task('less', function () {
  gulp.src(paths.styles)
    .pipe(less({
      paths: [ path.join(__dirname, 'styles') ]
    }))
    .pipe(gulp.dest('./public/css'));
});

gulp.task('static-files',function(){
  return gulp.src(paths.staticFiles)
    .pipe(gulp.dest('public/'));
});

gulp.task('scripts', function() {
  gulp.src(paths.scripts)
    .pipe(concat('index.js'))
    .pipe(gulp.dest('./public/js'));
});

gulp.task('nodemon', function () {
  nodemon({ script: 'server.js', ext: 'js', ignore: ['public/**','app/**','node_modules/**'] })
    .on('restart',['jade','less'], function () {
      console.log('>> node restart');
    });
});

gulp.task('browserify', function() {
  var b = browserify();
  b.add('./app/application.js');
  return b.bundle()
  .on('success', gutil.log.bind(gutil, 'Browserify Rebundled'))
  .on('error', gutil.log.bind(gutil, 'Browserify Error: in browserify gulp task'))
  .pipe(source('index.js'))
  .pipe(gulp.dest('./public/js'));
});

gulp.task('watch', function() {
  gulp.watch(paths.jade, ['jade']);
  gulp.watch(paths.styles, ['less']);
  gulp.watch(paths.scripts, ['browserify']);
});

gulp.task('bower', function() {
  return bower({ interactive: true })
    .pipe(gulp.dest('public/lib/'));
});

gulp.task('default', ['build','nodemon','watch']);
gulp.task('build', ['bower', 'jade', 'less', 'browserify','static-files']);
