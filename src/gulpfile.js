var gulp = require('gulp');
newer = require('gulp-newer'),
imagemin = require('gulp-imagemin'),
// var headerComment = require(‘gulp-header-comment’);
gulp.task('default', function() {
  // place code for your default task here\
  const d = new Date();
  console.log(`Server Timestamp: ${d}`);
});


