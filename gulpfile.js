/*
                                                    ___
                                                   /\_ \
     ____     __    __  __              __   __  __\//\ \    _____
    /',__\  /'__`\ /\ \/\ \  _______  /'_ `\/\ \/\ \ \ \ \  /\ '__`\
   /\__, `\/\ \L\ \\ \ \_\ \/\______\/\ \L\ \ \ \_\ \ \_\ \_\ \ \L\ \
   \/\____/\ \___, \\/`____ \/______/\ \____ \ \____/ /\____\\ \ ,__/
    \/___/  \/___/\ \`/___/> \        \/___L\ \/___/  \/____/ \ \ \/
                 \ \_\  /\___/          /\____/                \ \_\
                  \/_/  \/__/           \_/__/                  \/_/


   Secuoyas 2016
   Frontend Gulp/Postcss Workflow

*/

/*

   Gulp plugins


¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨ */
// Gulp itself
var gulp         = require('gulp');
var gutil        = require('gulp-util');
// General
var notify       = require('gulp-notify');
var postcss      = require('gulp-postcss');
var browserSync  = require('browser-sync');
var rename       = require('gulp-rename');
var concat       = require('gulp-concat');
var del          = require('del');
var runSequence  = require('run-sequence');
var w3cjs        = require('gulp-w3cjs');
var cssvalidator = require('gulp-w3c-css');
// Postcss
var autoprefixer = require('autoprefixer');
var calc         = require('postcss-calc');
var lost         = require('lost');
var sourcemaps   = require('gulp-sourcemaps');
var nano         = require('gulp-cssnano');
var hexrgba      = require('postcss-hexrgba');
var short        = require('postcss-short');
// Templates
var nunjucksRender = require('gulp-nunjucks-render');

/*

   Project directories


¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨ */
var dirs = {
    /* Main directories */
    src: 'src/',
    dst: 'dist/',

    /* Css */
    src_css: 'styles/*.css',
    src_all_css: 'styles/**/*.css',
    dst_css: 'css',
    src_html: 'html-templates',

    /* Nunjucks Templates */
    src_html_templates: 'html-templates/templates',
    src_html_partials: 'html-templates/templates/partials',
    src_html_pages: 'html-templates/pages',
};




//     __             ___                  ___    __
//    /\ \          /'___\                /\_ \  /\ \__
//    \_\ \     __ /\ \__/   __     __  __\//\ \ \ \ ,_\
//    /'_` \  /'__`\ \ ,__\/'__`\  /\ \/\ \ \ \ \ \ \ \/
//   /\ \L\ \/\  __/\ \ \_/\ \L\.\_\ \ \_\ \ \_\ \_\ \ \_
//   \ \___,_\ \____\\ \_\\ \__/.\_\\ \____/ /\____\\ \__\
//    \/__,_ /\/____/ \/_/ \/__/\/_/ \/___/  \/____/ \/__/

/*

   Nofify

*/
function errorCSS(error) {
    notify.onError({
        title: "Gulp CSS",
        subtitle: "Algo esta mal en tu CSS!",
        sound: "Basso"
    })(error);
    //También podemos pintar el error en el terminal
    console.log(error.toString());
    this.emit("end");
};


/*

   Css / Postcss


¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨ */
gulp.task('css', function(){

    // Postcss plugins
    var processors = [
        require('precss')({}),
        hexrgba,
        lost(),
        //autoprefixer({browsers:['last 2 versions']})
        autoprefixer(),
        short(),
        calc(),
    ];

    // Process
    return gulp.src(dirs.src + dirs.src_css)
        // postcss
        //.pipe(sourcemaps.init())
        .pipe(postcss(processors))
        /*
         *.on('error', function(error) {
         *  gutil.log(error.message);
         *  this.emit('end');
         *})
         */
        .on("error", errorCSS)
        //.pipe(sourcemaps.write('./maps'))
        .pipe(rename("styles.css"))
        //.pipe(nano({ discardComments: {removeAll: true} }))
        .pipe(gulp.dest(dirs.src + dirs.dst_css))
        // Reloading the stream
        .pipe(browserSync.reload({
            stream: true
        }));

});


/*

   Nunjuncks Templating


¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨ */
gulp.task('nunjucks', function() {
  nunjucksRender.nunjucks.configure([dirs.src_html_templates]);
  // Get .html and .nunjucks files in pages
  return gulp.src(dirs.src + dirs.src_html_pages + '/**/*.+(html|nj|nunjucks)')
  // Renders template with nunjucks
  .pipe(nunjucksRender({
    path:[dirs.src + dirs.src_html_pages, dirs.src + dirs.src_html_templates]
  }))
  // Output files in src folder
  .pipe(gulp.dest(dirs.src))
});


/*

   Browser sync


¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨ */
gulp.task('browserSync', function() {

    browserSync({
        files: "*.php, *.html, *.js, *.css",
        server: {
            baseDir: dirs.src
        },
        // browser: 'safari'
        browser: 'google chrome',
        notify: false
    })

});


/*

   Watch


¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨ */
gulp.task('watch', ['browserSync'], function(){
    gulp.watch(dirs.src + dirs.src_css, ['css']);
    gulp.watch(dirs.src + dirs.src_all_css, ['css']);
    gulp.watch('src/**/*.html', browserSync.reload);
    gulp.watch(dirs.src + 'js/*.js', browserSync.reload);
});




//    __                   ___       __
//   /\ \              __ /\_ \     /\ \
//   \ \ \____  __  __/\_\\//\ \    \_\ \
//    \ \ '__`\/\ \/\ \/\ \ \ \ \   /'_` \
//     \ \ \L\ \ \ \_\ \ \ \ \_\ \_/\ \L\ \
//      \ \_,__/\ \____/\ \_\/\____\ \___,_\
//       \/___/  \/___/  \/_/\/____/\/__,_ /

/*

   CSS Validator


¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨ */
gulp.task('csslint', function() {
  return gulp.src(dirs.src + 'css/*.css')
  // css linter
  .pipe(cssvalidator())
  // Output files in src folder
  .pipe(gulp.dest(dirs.src + 'cssReporter'))
});
/*

   HTML Validator


¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨ */
gulp.task('htmllint', function() {
  return gulp.src(dirs.src + '*.html')
  // html linter
  .pipe(w3cjs())
  .pipe(w3cjs.reporter())
  // Output files in src folder
  .pipe(gulp.dest(dirs.src))
});


/*

   Clean dst directory


¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨ */
gulp.task('clean', function () {
  return del([ dirs.dst + '**/*'
  ]);
});


/*

   Copy files to dst directory


¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨ */
gulp.task('copy', function() {
    // CSS
    gulp.src(['css/**/*.css'], {cwd: dirs.src})
    .pipe(gulp.dest(dirs.dst + dirs.dst_css));

    // HTML
    gulp.src(['*.html'], {cwd: dirs.src})
    .pipe(gulp.dest(dirs.dst));

    // Typografía
    gulp.src(['assets/fonts/*.*'], {cwd: dirs.src})
    .pipe(gulp.dest(dirs.dst + 'assets/fonts'));

    // Imágenes
    gulp.src(['assets/images/*.*'], {cwd: dirs.src})
    .pipe(gulp.dest(dirs.dst + 'assets/images'));

    // Js
    gulp.src(['js/**/*.js'], {cwd: dirs.src})
    .pipe(gulp.dest(dirs.dst + 'js'));
});


/*

   Gulp tasks


¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨ */
gulp.task('default', ['nunjucks', 'css', 'watch']);
gulp.task('build', function(callback) {
    runSequence(
        'clean',
        ['css'],
        'copy',
        callback);
});

