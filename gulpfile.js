
// ------------------------------------
// Libraries
// ------------------------------------

var fs        = require('fs');
var gulp      = require('gulp');
var sass      = require('gulp-sass');
var jade      = require('gulp-jade');
var rename    = require('gulp-rename');
var uglify    = require('gulp-uglify');

// ------------------------------------
// Paths
// ------------------------------------

var paths     = {
  styles      : './src/assets/styles/**/*.sass',
  scripts     : './src/assets/scripts/**/*.js',
  templates   : './src/**/*.jade'
};

// ------------------------------------
// Default Task
// ------------------------------------

gulp.task('default', ['scripts', 'styles', 'templates']);

// ------------------------------------
// Watch Task
// ------------------------------------

gulp.task('watch', function() {

  gulp.watch(paths.styles, ['styles']);
  gulp.watch(paths.scripts, ['scripts']);
  gulp.watch(paths.images, ['images']);
  gulp.watch(paths.templates, ['templates']);

});

// ------------------------------------
// Styles Task
// ------------------------------------

gulp.task('styles', function() {

  gulp.src('./src/assets/styles/index.sass')
    .pipe(sass())
    .pipe(rename('main.css'))
    .pipe(gulp.dest('./public/assets/styles/'))

});

// ------------------------------------
// Scripts Task
// ------------------------------------

gulp.task('scripts', function() {

  gulp.src(paths.scripts)
    .pipe(uglify())
    .pipe(gulp.dest('./public/assets/scripts/'))

});

// ------------------------------------
// Templates Task
// ------------------------------------

gulp.task('templates', function() {

  gulp.src(paths.templates)
    .pipe(jade({ pretty: true }))
    .pipe(gulp.dest('./public/'))

});