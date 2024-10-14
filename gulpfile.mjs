// @ts-check

// import fs from 'fs';
import gulp from 'gulp';
import rename from 'gulp-rename';
import zip from 'gulp-zip';

import map from 'map-stream';

import stream from 'stream';

import dayjsUtc from 'dayjs/plugin/utc.js';
import dayjsTimezone from 'dayjs-timezone-iana-plugin'; // @see https://day.js.org/docs/en/plugin/timezone
import dayjs from 'dayjs'; // @see https://day.js.org/docs/en/display/format

dayjs.extend(dayjsUtc);
dayjs.extend(dayjsTimezone);

// @ts-ignore: Normal import of json file (`resolveJsonModule` has been already switched on)
import config from './package.json' with { type: 'json' };

const timeZone = config.timeZone || '';

// NOTE: Date formats for 'dayjs', @see https://day.js.org/docs/en/display/format
const tagFormat = 'YYMMDD-HHmm';
const timeTzFormat = 'YYYY.MM.DD HH:mm ZZ';

const now = new Date();
const buildTag = formatDate(now, timeZone, tagFormat);
const buildTzTime = formatDate(now, timeZone, timeTzFormat);

// var folderStream = new stream.Writable();
// folderStream._write = function (chunk, encoding, done) {
//   console.log('EEE', chunk);
//   debugger;
//   done();
// };

const folderStream = new stream.Writable({
  write: function (chunk, encoding, next) {
    console.log(chunk.toString());
    next();
  },
});

// console.log('buildTag', buildTag);
// debugger;
// process.exit(99);

const allFolders = [];

/**
 * @param {Date} date
 * @param {string} timeZone
 * @param {string} fmt
 */
function formatDate(date, timeZone, fmt) {
  let dayjsDate = dayjs(date);
  if (timeZone) {
    // @ts-ignore: Wrong typings
    dayjsDate = dayjsDate.tz(timeZone);
  }
  const fmtDate = dayjsDate.format(fmt);
  return fmtDate;
}

/** @param {string} folder */
function finishTargetFolder(folder) {
  const targetFolder = 'build/' + folder + '/';
  return gulp
    .src(targetFolder + '*')
    .pipe(zip('archive.zip'))
    .pipe(gulp.dest('arc'));
  // .on('end', cb),
  // return gulp.series(
  //   // prettier-ignore
  //   // (cb) =>
  //   //   gulp
  //   //     .src(['src/*'])
  //   //     .pipe(gulp.dest(targetFolder))
  //   //     .on('end', cb),
  //   (cb) =>
  //     gulp
  //       .src(targetFolder + '*')
  //       .pipe(zip('archive.zip'))
  //       .pipe(gulp.dest('arc'))
  //       .on('end', cb),
  // );
}

function processSounds() {
  // console.log('YYY', _done);
  return (
    gulp
      .src(['sounds/**/*.mp3'])
      // .on(
      //   'data',
      //   [>* @param {import('vinyl')} file <]
      //   (file) => {
      //     const { basename } = file;
      //     const name = basename.replace(/\..*$/, '');
      //     console.log('ZZZ', name);
      //     return (
      //       gulp
      //         .src(['src/*'] [> , { base: './' } <])
      //         // prettier-ignore
      //         .pipe(gulp.dest('build/' + name + '/'))
      //     );
      //   },
      // )
      .pipe(
        rename((path) => {
          const { basename } = path;
          // console.log('File', basename);
          allFolders.push(basename);
          path.dirname += '/' + basename;
          path.basename = 'file';
        }),
      )
      .pipe(gulp.dest('folders/'))
      .pipe(
        // @ts-ignore: WritableStream
        map((/** @type {import('vinyl')} */ file, callback) => {
          const { relative, base, path: pathName, basename } = file;
          const folder = relative.replace(/[\\/].*/, '');
          const targetFolder = 'folders/' + folder + '/';
          const arcName = folder + '-' + buildTag + '.zip'
          // console.log('MAP', folder);
          gulp.series([
            (cb) =>
              gulp
                // prettier-ignore
                .src(['src/*'])
                .pipe(gulp.dest(targetFolder))
                .on('end', cb),
            (cb) =>
              gulp
                .src(targetFolder + '*')
                .pipe(zip(folder + '.zip'))
                .pipe(gulp.dest('archives'))
                .on('end', cb),
          ])(() => callback(null, file));
        }),
      )
  );
}
gulp.task('processSounds', processSounds);
