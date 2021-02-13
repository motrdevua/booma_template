const { src, dest, watch, series, parallel } = require('gulp');
const plugin = require('gulp-load-plugins')({
  rename: {
    'gulp-group-css-media-queries': 'gcmq',
    'gulp-webp-in-html': 'GulpWebpHtml2',
  },
});

const del = require('del');
const imagemin = require('gulp-imagemin');

const browserSync = require('browser-sync').create();

const webpack = require('webpack');
const stream = require('webpack-stream');

const dev = plugin.environments.development;
const prod = plugin.environments.production;

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
    img: 'src/assets/images/',
    fonts: 'src/assets/fonts/',
    styles: 'src/assets/styles/',
    data: 'src/assets/data/',
  },
  dist: {
    root: 'dist/',
    assets: 'dist/assets/',
  },
};

/* ===============   webpackConfig  =============== */

const webpackConfig = {
  mode: dev() ? 'development' : 'production',
  output: {
    filename: `[name].js`,
  },
  devtool: dev() ? 'eval-source-map' : 'none',
  optimization: {
    minimize: true,
    splitChunks: {
      chunks: 'all',
    },
  },
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
          },
        },
      },
    ],
  },
  plugins: [
    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery',
      'window.jQuery': 'jquery',
    }),
  ],
  resolve: {
    modules: ['node_modules'],
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
      .pipe(
        plugin.plumber({
          errorHandler: onError,
        })
      )
      .pipe(
        plugin.sass
          .sync({ outputStyle: 'expanded' })
          .on('error', plugin.sass.logError)
      )
      .pipe(plugin.autoprefixer())
      // .pipe(plugin.gcmq())
      .pipe(
        prod(
          plugin.csso({
            restructure: false,
            sourceMap: true,
            debug: true,
          })
        )
      )
      .pipe(dev(plugin.sourcemaps.write('.')))
      .pipe(
        plugin.rename({
          suffix: '.min',
        })
      )
      .pipe(dest(`${path.dist.assets}css`))
      .pipe(browserSync.stream())
  );
}

/* =====================  js  ===================== */
function js() {
  return src(`${path.src.js}main.js`)
    .pipe(
      plugin.plumber({
        errorHandler: onError,
      })
    )
    .pipe(stream(webpackConfig))
    .pipe(
      plugin.rename({
        suffix: '.min',
      })
    )
    .pipe(dest(`${path.dist.assets}js`))
    .pipe(
      browserSync.reload({
        stream: true,
      })
    );
}

/* ===================  images  =================== */

function img() {
  return src(`${path.src.img}**/*.*`)
    .pipe(
      plugin.webp({
        quality: 90,
      })
    )
    .pipe(dest(`${path.dist.assets}images`))
    .pipe(src(`${path.src.img}**/*.*`))
    .pipe(
      plugin.cache(
        imagemin([
          imagemin.gifsicle({ interlaced: true }),
          imagemin.mozjpeg({ quality: 90, progressive: true }),
          imagemin.optipng({ optimizationLevel: 3 }),
          imagemin.svgo({
            plugins: [
              { removeViewBox: false },
              { cleanupIDs: false },
              { removeUnknownsAndDefaults: false },
            ],
          }),
        ])
      )
    )
    .pipe(dest(`${path.dist.assets}images`));
}

/* ===================  fontgen  ================== */

function fontgen() {
  return src(`${path.src.fonts}**/*.ttf`)
    .pipe(plugin.fontmin())
    .pipe(plugin.ttf2woff2())
    .pipe(dest(path.src.fonts));
}

/* ====================  fonts  =================== */

function fonts() {
  return src(`${path.src.fonts}**/*.{svg,eot,ttf,woff,woff2}`).pipe(
    dest(`${path.dist.assets}fonts`)
  );
}

/* =====================  data  =================== */

function data() {
  return src(`${path.src.data}**/*`).pipe(dest(`${path.dist.assets}data`));
}

/* ====================  watch  =================== */

function watchFiles() {
  watch(`${path.src.root}**/*.html`, html);
  watch(path.src.root, styles);
  watch(path.src.js, js);
  watch(path.src.img, img);
  watch(path.src.data, data);
}

/* ====================  clean  =================== */

function clean() {
  plugin.cache.clearAll();
  return del([path.dist.root, `${path.src.fonts}**/*.css`]).then((dir) => {
    console.log('Deleted files and folders:\n', dir.join('\n'));
  });
}

/* ===================  favicon  ================== */

const realFavicon = require('gulp-real-favicon');
const fs = require('fs');

// File where the favicon markups are stored
const FAVICON_DATA_FILE = 'faviconData.json';

// Generate the icons. This task takes a few seconds to complete.
// You should run it at least once to create the icons. Then,
// you should run it whenever RealFaviconGenerator updates its
// package (see the check-for-favicon-update task below).
function generateFavicon(done) {
  realFavicon.generateFavicon(
    {
      masterPicture: 'src/assets/images/master_picture.png',
      dest: 'dist/assets/images/icons',
      iconsPath: '/',
      design: {
        ios: {
          pictureAspect: 'backgroundAndMargin',
          backgroundColor: '#ffffff',
          margin: '14%',
          assets: {
            ios6AndPriorIcons: false,
            ios7AndLaterIcons: false,
            precomposedIcons: false,
            declareOnlyDefaultIcon: true,
          },
        },
        desktopBrowser: {
          design: 'raw',
        },
        windows: {
          pictureAspect: 'noChange',
          backgroundColor: '#000000',
          onConflict: 'override',
          assets: {
            windows80Ie10Tile: false,
            windows10Ie11EdgeTiles: {
              small: false,
              medium: true,
              big: false,
              rectangle: false,
            },
          },
        },
        androidChrome: {
          pictureAspect: 'shadow',
          themeColor: '#ffffff',
          manifest: {
            name: 'Booma',
            display: 'standalone',
            orientation: 'notSet',
            onConflict: 'override',
            declared: true,
          },
          assets: {
            legacyIcon: false,
            lowResolutionIcons: false,
          },
        },
        safariPinnedTab: {
          pictureAspect: 'blackAndWhite',
          threshold: 50,
          themeColor: '#5e9cb8',
        },
      },
      settings: {
        scalingAlgorithm: 'Mitchell',
        errorOnImageTooSmall: false,
        readmeFile: false,
        htmlCodeFile: false,
        usePathAsIs: false,
      },
      markupFile: FAVICON_DATA_FILE,
    },
    () => {
      done();
    }
  );
}

// Inject the favicon markups in your HTML pages. You should run
// this task whenever you modify a page. You can keep this task
// as is or refactor your existing HTML pipeline.

function injectFaviconMarkups() {
  return src(['src/*.html'])
    .pipe(
      realFavicon.injectFaviconMarkups(
        JSON.parse(fs.readFileSync(FAVICON_DATA_FILE)).favicon.html_code
      )
    )
    .pipe(dest('dist'));
}

// Check for updates on RealFaviconGenerator (think: Apple has just
// released a new Touch icon along with the latest version of iOS).
// Run this task from time to time. Ideally, make it part of your
// continuous integration system.
function checkForFaviconUpdate() {
  const currentVersion = JSON.parse(fs.readFileSync(FAVICON_DATA_FILE)).version;
  realFavicon.checkForUpdates(currentVersion, (err) => {
    if (err) {
      throw err;
    }
  });
}

/* ===================  exports  ================== */

exports.html = html;
exports.styles = styles;
exports.js = js;
exports.img = img;
exports.fontgen = fontgen;
exports.fonts = fonts;
exports.data = data;
exports.clean = clean;
exports.watch = watchFiles;
exports.generateFavicon = generateFavicon;
exports.injectFaviconMarkups = injectFaviconMarkups;
exports.checkForFaviconUpdate = checkForFaviconUpdate;

/* ====================  dev  ===================== */

exports.default = series(
  clean,
  parallel(html, styles, js, img, fonts, data),
  parallel(watchFiles, serve)
);

/* ===================  build  ==================== */

exports.build = series(clean, parallel(html, styles, js, img, fonts, data));
