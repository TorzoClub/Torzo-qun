const gulp = require("gulp");
const babel = require("gulp-babel");
const sourcemaps = require("gulp-sourcemaps");
const concat = require("gulp-concat");

gulp.task('es6toes5', () => {
	return gulp.src("question/src/*.js")
		.pipe(sourcemaps.init())
		.pipe(babel())
		/* .pipe(concat("all.js")) */
		.pipe(sourcemaps.write("."))
		.pipe(gulp.dest("question/script/"));;
});

gulp.task('watch', () => {
	try {
		gulp.watch('question/src/*.js', ['es6toes5']);
	} catch (e) {
		console.error(e);
	}
});

gulp.task('default', ['es6toes5', 'minify', 'watch']);
