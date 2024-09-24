const gulp = require('gulp');
const jsonMinify = require('gulp-json-minify');
const htmlmin = require('gulp-htmlmin');
const clean = require('gulp-clean');
const svgo = require('gulp-svgo');

const out = './replace-assets/games'
const outImgs = './replace-assets/images'

const clear = () =>
    gulp.src('./replace-assets', { read: false, allowEmpty: true }).pipe(clean());

//const uglifyJson = () =>
//    gulp.src('./src/assets/games/**/*.json')
//        .pipe(jsonMinify())
//        .pipe(gulp.dest(out));
//
//const uglifyHtml = () =>
//    gulp.src('./src/assets/games/**/*.html')
//        .pipe(htmlmin({ collapseWhitespace: true }))
//        .pipe(gulp.dest(out));

const minifySvg = () =>
    gulp.src('./src/assets/images/**/*.svg')
        .pipe(svgo({}))
        .pipe(gulp.dest(outImgs));

//this is fucking stupid, passed object is not what svgo wants idfk
//hacky way to tell svgo to do some job at least, but not to mess up taiga-ui icons
const minifyTaigaUIIcons = () =>
    gulp.src('./node_modules/@taiga-ui/icons/src/**/*.svg')
        .pipe(svgo({
            full: true,
            plugins: [
                { sortAttrs: true }
            ]
        }))
        .pipe(gulp.dest('./replace-assets/taiga-ui/icons'));

gulp.task("minify", (done) => {
    return gulp.series(clear,
//    uglifyJson, uglifyHtml,
    minifySvg, minifyTaigaUIIcons)(done)
}
)

process.on("uncaughtException", (err) => {
    console.error(err.message, err.stack, err);
    process.exit(255)
})
