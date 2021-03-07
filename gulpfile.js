const { src, dest, watch, series, parallel } = require('gulp');
const plugin = require('gulp-load-plugins')({
  rename: {
    'gulp-group-css-media-queries': 'gcmq',
    'gulp-webp-in-html': 'GulpWebpHtml2',
    'gulp-tinypng-extended': 'tinypng',
    'gulp-clean-css': 'cleanCSS',
  },
});

const del = require('del');

const browserSync = require('browser-sync').create();

const dev = plugin.environments.development;
const prod = plugin.environments.production;
const fs = require('fs');

const onError = (err) => {
  plugin.notify.onError({
    title: `Error in ${err.plugin}`,
    message: '<%= error.message %>',
    sound: 'Pop',
    onLast: true,
  })(err);
  this.emit('end');
};

const path = {
  src: {
    root: 'src/',
    js: 'src/assets/js/',
    img: 'src/assets/img/',
    fonts: 'src/assets/fonts/',
    styles: 'src/assets/styles/',
    data: 'src/assets/data/',
  },
  dist: {
    root: 'dist/',
    assets: 'dist/assets/',
  },
};

/* ===================   serve  =================== */

function serve() {
  browserSync.init({
    server: path.dist.root,
    // tunnel: 'project', // Demonstration page: http://project.localtunnel.me
    // online: false, // Work Offline Without Internet Connection
  });
}

/* =====================  html  ==================== */

function html() {
  return (
    src([`${path.src.root}*.html`, `!${path.src.root}_*.html`])
      .pipe(
        plugin.include({
          includePaths: [
            `${__dirname}/${path.src.root}`,
            `${__dirname}/${path.src.img}`,
            `${__dirname}/${path.src.img}*`,
          ],
        })
      )
      // .pipe(plugin.GulpWebpHtml2())
      .pipe(dest(path.dist.root))
      .pipe(
        browserSync.reload({
          stream: true,
        })
      )
  );
}

/* ===================  styles  =================== */

function styles() {
  return (
    src(`${path.src.styles}*.+(scss|sass)`)
      .pipe(dev(plugin.sourcemaps.init()))
      .pipe(plugin.plumber({ errorHandler: onError }))
      .pipe(plugin.sass.sync({ outputStyle: 'expanded' }))
      .pipe(plugin.autoprefixer())
      // .pipe(plugin.gcmq())
      .pipe(
        plugin.cleanCSS(
          {
            level: 2,
            format: {
              breaks: { afterComment: true, beforeBlockEnds: true },
              wrapAt: 120,
            },
          },
          (details) => {
            console.log(
              `originalSize of ${details.name}: ${details.stats.originalSize}`
            );
            console.log(
              `minifiedSize of ${details.name}: ${details.stats.minifiedSize}`
            );
          }
        )
      )
      .pipe(dev(plugin.sourcemaps.write('.')))
      .pipe(plugin.rename({ suffix: '.min' }))
      .pipe(dest(`${path.dist.assets}css`))
      .pipe(browserSync.stream())
  );
}

/* =====================  js  ===================== */

function js() {
  return src(`${path.src.js}*.js`)
    .pipe(dev(plugin.sourcemaps.init()))
    .pipe(plugin.plumber({ errorHandler: onError }))
    .pipe(
      plugin.include({
        includePaths: [
          `${__dirname}/node_modules/`,
          `${__dirname}/${path.src.js}`,
        ],
      })
    )
    .pipe(plugin.babel({ presets: ['@babel/env'] }))
    .pipe(plugin.terser())
    .pipe(dev(plugin.sourcemaps.write('.')))
    .pipe(plugin.rename({ suffix: '.min' }))
    .pipe(dest(`${path.dist.assets}js`))
    .pipe(browserSync.reload({ stream: true }));
}

/* ===================  img  =================== */

function img() {
  return src(`${path.src.img}**/*.{png,jpg,jpeg}`)
    .pipe(plugin.plumber({ errorHandler: onError }))
    .pipe(plugin.webp({ quality: 100 }))
    .pipe(dest(`${path.dist.assets}img`))
    .pipe(src(`${path.src.img}**/*.{png,jpg,jpeg}`))
    .pipe(
      prod(
        plugin.tinypng({
          key: 'JBK36rHvht6hyW3MM7jQYzbx53hgWF2R',
          sigFile: './src/assets/img/.tinypng-sigs',
          log: true,
        })
      )
    )
    .pipe(dest(`${path.dist.assets}img`))
    .pipe(src(`${path.src.img}**/*.+(svg|gif)`))
    .pipe(dest(`${path.dist.assets}img`));
}

/* ====================  fonts  =================== */

function fonts() {
  return src(`${path.src.fonts}**/*.ttf`)
    .pipe(plugin.ttf2woff())
    .pipe(dest(`${path.dist.assets}fonts`))
    .pipe(src(`${path.src.fonts}**/*.ttf`))
    .pipe(plugin.ttf2woff2())
    .pipe(dest(`${path.dist.assets}fonts`));
}

const cb = () => {};
const fontsStyleSheet = `${path.src.styles}utils/_fontstylesheet.scss`;
const fontsPath = `${path.dist.assets}fonts`;

const fontsStyle = (done) => {
  fs.readFileSync(fontsStyleSheet);
  fs.writeFile(fontsStyleSheet, '', cb);
  fs.readdir(fontsPath, (items) => {
    if (items) {
      let cFontname;
      for (let i = 0; i < items.length; i += 1) {
        let fontname = items[i].split('.');
        [fontname] = fontname;
        if (cFontname !== fontname) {
          fs.distendFile(
            fontsStyleSheet,
            `@include font-face("../fonts/${fontname}", "${fontname}", 400);\r\n`,
            cb
          );
        }
        cFontname = fontname;
      }
    }
  });

  done();
};

/* =====================  data  =================== */

function data() {
  return src(`${path.src.data}**/*`).pipe(dest(`${path.dist.assets}data`));
}

/* =====================  favicon  =================== */

function favicon() {
  return src(`${path.src.root}favicon.*`).pipe(dest(`${path.dist.root}`));
}

/* ====================  watch  =================== */

function watchFiles() {
  watch(`${path.src.root}**/*.html`, html);
  watch(path.src.root, styles);
  watch(path.src.js, js);
  watch(path.src.img, img);
  watch(path.src.fonts, series(fonts, fontsStyle));
  watch(path.src.root, favicon);
  watch(path.src.data, data);
}

/* ====================  clean  =================== */

function clean() {
  plugin.cache.clearAll();
  return del([path.dist.root, `${path.src.img}/.tinypng-sigs`]).then((dir) => {
    console.log('Deleted files and folders:\n', dir.join('\n'));
  });
}

/* ===================  exports  ================== */

exports.html = html;
exports.styles = styles;
exports.js = js;
exports.img = img;
exports.fonts = fonts;
exports.fontsStyle = fontsStyle;
exports.data = data;
exports.clean = clean;
exports.watch = watchFiles;
exports.favicon = favicon;

/* ====================  dev  ===================== */

exports.default = series(
  clean,
  fonts,
  fontsStyle,
  parallel(html, styles, js, img, data, favicon),
  parallel(watchFiles, serve)
);

/* ===================  build  ==================== */

exports.build = series(
  clean,
  fonts,
  fontsStyle,
  parallel(html, styles, js, img, data, favicon)
);
