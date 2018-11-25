/*eslint-env node */
var gulp = require('gulp');
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
var eslint = require('gulp-eslint');
var concat = require('gulp-concat'); // 把多个js文件合并
var uglify = require('gulp-uglify'); // 压缩
var babel = require('gulp-babel'); // es6转换
var sourcemaps = require('gulp-sourcemaps'); // 源映射
var imagemin = require('gulp-imagemin'); // 图片压缩
/**
 * png图片量化， 基于我们的视觉和大脑任务非常相似的颜色，
 * 并重新映射为新的优化颜色， 如果没有一定的质量， 不会保存
 */
var pngquant = require('imagemin-pngquant');

gulp.task('default', ['styles', 'copy-html'], function () {
  gulp.watch('sass/**/*.scss', ['styles']);
  gulp.watch('/index.html', ['copy-html']);
});

/**
 * 设置开发生成任务
 */
gulp.task('dist', [
  'copy-html',
  'styles',
  'scripts-dist'
]);

gulp.task('scripts', function () {
  gulp.src('src/js/**/*.js')
    .pipe(babel({
      presets: ['@babel/env']
    }))
    .pipe(concat('all.js'))
    .pipe(gulp.dest('dist/js'));
})

gulp.task('scripts-dist', function () {
  gulp.src('src/js/**/*.js')
    .pipe(sourcemaps.init())
    .pipe(babel({
      presets: ['@babel/env']
    }))
    .pipe(concat('all.js'))
    .pipe(uglify())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('dist/js'));
})

/**
 * 复制图片
 */
gulp.task('copy-images', function () {
  gulp.src('images/*')
    .pipe(imagemin([
      imagemin.gifsicle({
        interlaced: true
      }),
      imagemin.jpegtran({
        progressive: true
      }),
      imagemin.optipng({
        optimizationLevel: 5
      }),
      imagemin.svgo({
        plugins: [{
            removeViewBox: true
          },
          {
            cleanupIDs: false
          }
        ]
      })
    ]))
    .pipe(gulp.dest('dist/img'));
});

/**
 * 复制html
 */
gulp.task('copy-html', function () {
  gulp.src('./index.html')
    .pipe(gulp.dest('./dist'));
});

/**
 * 新建一个styles的任务，并执行第二个参数的匿名函数
 */
gulp.task('styles', function () {
  // 获取源文件
  gulp.src('src/sass/**/*.scss')
    // 有了这些文件就可以加入管道，使用sass进行处理，并转换成css
    // 当sass源文件写法错误时，监听错误并输出，并不冲断构建，体验更好
    .pipe(sass({
      outputStyle: 'compressed'
    }).on('error', sass.logError))
    // 在css生成之前，进行添加前缀处理，并指定浏览器
    .pipe(autoprefixer({
      browsers: ['last 2 versions']
    }))
    // 再使用gulp.dest()把生成的文件放到./css目录
    .pipe(gulp.dest('dist/css/'));
});

/**
 * 添加代码检查
 */
gulp.task('lint', () => {
  return gulp.src(['js/**/*.js'])
    // eslint() attaches the lint output to the "eslint" property
    // of the file object so it can be used by other modules.
    .pipe(eslint())
    // eslint.format() outputs the lint results to the console.
    // Alternatively use eslint.formatEach() (see Docs).
    .pipe(eslint.format())
    // To have the process exit with an error code (1) on
    // lint error, return the stream and pipe to failAfterError last.
    .pipe(eslint.failAfterError());
});