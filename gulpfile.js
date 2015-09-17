/** require **/
//プラグインの読み込み
var gulp           = require("gulp");
var compass        = require('gulp-compass');
var cssmin         = require('gulp-cssmin');
var rename         = require('gulp-rename');
var filter         = require('gulp-filter');
var mainBowerFiles = require('main-bower-files');
var concat         = require('gulp-concat');
var uglify         = require('gulp-uglify');
var plumber        = require('gulp-plumber');
var notify         = require("gulp-notify");
var watchify       = require("gulp-watchify");
var streamify      = require('gulp-streamify');
var merge          = require('merge-stream');
var please         = require('gulp-pleeease');
//browserSyncを使用する場合は、以下とこのファイル最後のwatchとdefaultタスクのコメントを外す
// var browserSync    = require('browser-sync').create();
// var reload         = browserSync.reload;
// /** browser-sync **/
// var source        = "./**/*";
// gulp.task('browser-sync', function() {
//   browserSync.init({
//     proxy: "192.168.33.12",
//     open: 'external'
//   });
// });

//経過時間を知りたい場合は、以下のコメントを外す
//require("time-require");

/** task **/
// compass
//scssファイルのコンパイル
//$ gulp compassで実行される
gulp.task('compass', function(){
  return merge(
    gulp.src('assets/sass/common.scss')
    .pipe(plumber({errorHandler: notify.onError('Error: <%= error.message %>')}))
    .pipe(compass({
      config_file: 'assets/config.rb',
      css: 'css/',
      sass: 'assets/sass/',
    })),
    gulp.src('assets/sass/modules.scss')
    .pipe(plumber({errorHandler: notify.onError('Error: <%= error.message %>')}))
    .pipe(compass({
      config_file: 'assets/config.rb',
      css: 'css/',
      sass: 'assets/sass/'
    }))
  );
});
// cssPle
//ベンダープレフィックスなど
gulp.task('cssPle', ['compass'],function() {
  return gulp.src('css/**/*.css')
  .pipe(please({
    autoprefixer: {"browsers": ["last 4 versions"]},//各ブラウザ最新4バージョンまでサポート
    minifier: false//圧縮の有無
  }))
  .pipe(gulp.dest('css/'));
});
// cssMin
//cssファイルの圧縮
gulp.task('cssMin',['cssPle'], function () {
  merge(
    gulp.src('css/common.css')
    .pipe(plumber({errorHandler: notify.onError('Error: <%= error.message %>')}))
    .pipe(cssmin())
    .pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest('cssmin/')),
    gulp.src('css/modules.css')
    .pipe(plumber({errorHandler: notify.onError('Error: <%= error.message %>')}))
    .pipe(cssmin())
    .pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest('cssmin/'))
    );
});
// compass_Lib
//scss（lib）ファイルのコンパイル
gulp.task('compass_Lib', function(){
  return gulp.src('assets/sass/lib.scss')
  .pipe(plumber({errorHandler: notify.onError('Error: <%= error.message %>')}))
  .pipe(compass({
    config_file: 'assets/config.rb',
    css: 'css/',
    sass: 'assets/sass/'
  }));
});
// cssMin_lib
//css（lib）ファイルの圧縮
gulp.task('cssMin_Lib',['compass_Lib'],function () {
  gulp.src('css/lib.css')
  .pipe(plumber({errorHandler: notify.onError('Error: <%= error.message %>')}))
  .pipe(cssmin())
  .pipe(rename({suffix: '.min'}))
  .pipe(gulp.dest('cssmin/'));
});
// bowerIcons
//fontawesomeで使用するフォントデータを移動
gulp.task('bowerIcons', function () {
  gulp.src('assets/bower_components/fontawesome/fonts/**.*')
  .pipe(plumber({errorHandler: notify.onError('Error: <%= error.message %>')}))
  .pipe(gulp.dest('fonts/'));
});
// bowerJS
//bowerで取得したjsファイルの抽出
gulp.task('bowerJS', function () {
  return gulp.src(mainBowerFiles())
  .pipe(plumber({errorHandler: notify.onError('Error: <%= error.message %>')}))
  .pipe(filter('**/*.js'))
  .pipe(gulp.dest('assets/js/lib/'));
});
// concatJS_lib
//jsファイル（lib）の結合
gulp.task('concatJS_lib',['bowerJS'], function() {
  return gulp.src('assets/js/lib/*.js')
  .pipe(plumber({errorHandler: notify.onError('Error: <%= error.message %>')}))
  .pipe(concat("lib.js"))
  .pipe(gulp.dest('js/'));
});
// uglifyJS_lib
//jsファイル（lib）の圧縮
gulp.task('uglifyJS_lib',['concatJS_lib'], function() {
  gulp.src('js/lib.js')
  .pipe(plumber({errorHandler: notify.onError('Error: <%= error.message %>')}))
  .pipe(rename({suffix: '.min'}))
  .pipe(streamify(uglify()))
  .pipe(gulp.dest('jsmin/'));
});
// concatJS
//jsファイルの結合
gulp.task('concatJS', function() {
  return merge(
    gulp.src('assets/js/modules/*.js')
    .pipe(plumber({errorHandler: notify.onError('Error: <%= error.message %>')}))
    .pipe(concat('modules.js'))
    .pipe(gulp.dest('js/')),
    gulp.src(['assets/js/init/*.js','assets/js/parts/*.js','assets/js/controls/*.js','assets/js/core/*.js'])
    .pipe(plumber({errorHandler: notify.onError('Error: <%= error.message %>')}))
    .pipe(concat('common.js'))
    .pipe(gulp.dest('js/'))
    );
});
// watchify
//watchifyを使用して差分ファイルのみ更新する
//jsのみ可能
var watching = false;
gulp.task ('enable-watch-mode', function() {
  watching = true;
});
gulp.task('browserify',['concatJS'],watchify(function(watchify) {
  //jsファイルの圧縮
  merge(
    gulp.src('js/modules.js')
    .pipe(plumber({errorHandler: notify.onError('Error: <%= error.message %>')}))
    .pipe(watchify({
      watch:watching
    }))
    .pipe(rename({suffix: '.min'}))
    .pipe(streamify(uglify()))
    .pipe(gulp.dest('jsmin/')),
    gulp.src('js/common.js')
    .pipe(plumber({errorHandler: notify.onError('Error: <%= error.message %>')}))
    .pipe(watchify({
      watch:watching
    }))
    .pipe(rename({suffix: '.min'}))
    .pipe(streamify(uglify()))
    .pipe(gulp.dest('jsmin/'))
    );
}));
gulp.task ('watchify', ['enable-watch-mode', 'browserify']);

/** watch **/
//watchを使用する場合は、ターミナルで「$ gulp watch」
gulp.task('watch', ['watchify'],function() {
  gulp.watch('assets/**/*.scss', ['cssMin']);
  gulp.watch('assets/**/*.js', ['concatJS']);
  gulp.watch(source, reload);
});
/** sublime task **/
//sublime用のタスク（sublimeでビルドシステムを追加する必要がある）
gulp.task('sublime', ['cssMin','concatJS','browserify']);
/** default task **/
//$ gulpで実行される（順番は並列なので、同時進行）
gulp.task('default',[
  'bowerIcons',
  'uglifyJS_lib',
  'cssMin_Lib',
  'cssMin',
  'browserify',
  //'browser-sync',
  'watch'
  ]
);