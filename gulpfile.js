const gulp = require('gulp');
const rename = require('gulp-rename');
const hb = require('gulp-hb');
const frontMatter = require('gulp-front-matter');
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const sourcemaps = require('gulp-sourcemaps');
const del = require('del');
const plumber = require('gulp-plumber');
const newer = require('gulp-newer');
const runSequence = require('run-sequence');
const browserSync = require('browser-sync').create();
const watch = require('gulp-watch');
const sassGlob = require('gulp-sass-glob');

gulp.task('html', function() {
  return (
    gulp
      .src('./src/hbs/pages/**/*.hbs')
      .pipe(plumber())
      .pipe(newer('public'))
      // ページ単位でfrontMatterを実行
      .pipe(frontMatter({ property: 'data.frontMatter' }))
      .pipe(
        hb({
          data: {
            //テンプレート内で利用できるデータ
            sitename: 'My website'
          },
          helpers: [
            //継承を可能にするヘルパーを指定する
            './node_modules/handlebars-layouts/dist/handlebars-layouts.js'
          ],
          //インクルードや継承するための雛形の設置場所を指定する
          partials: './src/hbs/partials/**/*.hbs',
          bustCache: true
        })
      )
      //拡張子をhbsからhtmlに変更する
      .pipe(rename({ extname: '.html' }))
      //出力先を選択する
      .pipe(gulp.dest('./public'))
      .pipe(browserSync.stream())
  );
});

gulp.task('css', () => {
  return gulp
    .src('src/scss/app.scss')
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(sassGlob())
    .pipe(
      sass({
        outputStyle: 'expanded'
      })
    )
    .on('error', sass.logError)
    .pipe(autoprefixer())
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('public/css'))
    .pipe(browserSync.stream());
});

gulp.task('js', function() {
  gulp
    .src('src/js/**/*')
    .pipe(gulp.dest('public/js'))
    .pipe(browserSync.stream());
});

gulp.task('img', function() {
  gulp
    .src('src/img/**/*')
    .pipe(gulp.dest('public/img'))
    .pipe(browserSync.stream());
});

gulp.task('clean', function() {
  return del(['public']);
});

gulp.task('default', ['clean'], function(cb) {
  runSequence(['html', 'css', 'js', 'img'], cb);
});

gulp.task('start', ['default'], function() {
  browserSync.init({
    server: './public'
  });
  watch('src/hbs/**/*', function() {
    gulp.start(['html']);
  });
  watch('src/css/**/*', function() {
    gulp.start(['css']);
  });
  watch('src/js/**/*', function() {
    gulp.start(['js']);
  });
  watch('src/img/**/*', function() {
    gulp.start(['img']);
  });
});
