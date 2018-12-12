//引入gulp所需要的各种插件模块
var gulp   = require('gulp');
const jshint = require('gulp-jshint'); //js语法检查
const babel = require('gulp-babel'); //js语法解析
const browserify = require('gulp-browserify');//将babel解析成可以识别的语言
const uglify = require('gulp-uglify'); //压缩js文件
const rename = require("gulp-rename");//更改流中文件名字
const less = require('gulp-less'); //less文件解析成css
const LessPluginAutoPrefix  = require('less-plugin-autoprefix');
const autoprefix = new LessPluginAutoPrefix({browsers: ["last 2 versions", 'not ie <= 8']}); //配置css的前缀完成浏览器兼容
const concat = require('gulp-concat'); //合并css文件
const  cssmin = require('gulp-cssmin') //压缩css文件
const htmlmin = require('gulp-htmlmin'); //压缩html文件
const livereload = require('gulp-livereload'); // 自动编译文件
const connect = require('gulp-connect'); //开启热更新功能
const opn = require('opn');//配置服务器
const image = require('gulp-image'); //图片优化处理
const imagemin = require('gulp-imagemin'); //压缩image图片

//1.检测js语法错误
gulp.task('jshint', () => {
  return gulp.src('./src/js/*.js') //将指定目录文件导入到gulp流中
    .pipe(jshint({esversion:6})) //对流中的文件做语法检查
    .pipe(jshint.reporter('default')) //将语法错误提示出来
    .pipe(livereload());
});

//2.转换js语法版本
gulp.task('babel', ['jshint'], () => {
  return gulp.src('./src/js/*.js')
    .pipe(babel({    //语法转化  es6/7/8等高级语法转化成es5及以下的语法
      presets: ['@babel/env']
    }))
    .pipe(gulp.dest('./build/js'))  //将流中的文件导出到指定目录下
    .pipe(livereload())
})

//3.将转换完的js语法版本解析为浏览器可以识别的语言
gulp.task('browserify', ['babel'], () => {
  return gulp.src('./build/js/*.js')  //导入主模块文件
    .pipe(browserify())  //将commonjs模块化语法转化成浏览器能识别的语法
    .pipe(rename('built.js'))  //对流中的文件重命名
    .pipe(gulp.dest('./build/js'))  //将流中的文件导出到指定目录下
    .pipe(livereload())
})

//4.压缩js代码
gulp.task('uglify', ['browserify'],() => {
  return gulp.src('./src/js/*.js')
    .pipe(uglify())
    .pipe(rename('jquery-1.10.1.js'))
    .pipe(gulp.dest('./dist/js'))
    .pipe(livereload());
});

//5.将less解析成为css文件
gulp.task('less',  () => {
  return gulp.src('./src/less/*.less')
    .pipe(less({ //将less文件编译成css文件
      paths: [autoprefix]
    }))
    .pipe(gulp.dest('./src/css'))
    .pipe(livereload());
});

//6.合并css文件
/*gulp.task('concat', ['less'], function ()  {
  return gulp.src('./src/css/!*.css')
    .pipe(concat('built.css')) //合并css文件
    .pipe(gulp.dest('./build/css'))
    .pipe(livereload());
});*/
//7.压缩css文件
gulp.task('cssmin', ['less'],function ()  {
  gulp.src('./src/css/*.css')
    .pipe(cssmin())
   /* .pipe(rename('dist.min.css'))*/
    .pipe(gulp.dest('./dist/css'))
    .pipe(livereload());
});

//8.压缩html文件
gulp.task('htmlmin', () => {
  return gulp.src('src/*.html')
    .pipe(htmlmin({ //压缩html
      collapseWhitespace: true, //去除空格
      removeComments:true //除去注释
    }))
    .pipe(gulp.dest('dist'))
    .pipe(livereload());
});

//图片优化处理
gulp.task('image', function () {
  gulp.src('./src/images/*')
    .pipe(image())
    .pipe(gulp.dest('./build/images'))
    .pipe(livereload());
});
//图片压缩处理
gulp.task('imagemin',['image'], () =>
  gulp.src('./src/images/*')
    .pipe(imagemin())
    .pipe(gulp.dest('dist/images'))
);

//9.开启自动编译任务
gulp.task('watch',['default'],function () {
  livereload.listen();
  connect.server({ //启动服务器
    root: 'dist',
    livereload: true,
    port: 4000
  });

  opn('http://localhost:4000/merchant.html');
  gulp.watch('./src/less/*.less', ['cssmin']);
  gulp.watch('./src/js/*.js', ['uglify']);
  gulp.watch('./src/*.html', ['htmlmin']);
});
//10.配置默认任务
gulp.task('default', ['cssmin', 'htmlmin', 'uglify','imagemin']);