// @ts-check

// import fs from 'fs';
import gulp from 'gulp';
import rename from 'gulp-rename';
import zip from 'gulp-zip';

import map from 'map-stream';

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
// const timeTzFormat = 'YYYY.MM.DD HH:mm ZZ';

const now = new Date();
const buildTag = formatDate(now, timeZone, tagFormat);
// const buildTzTime = formatDate(now, timeZone, timeTzFormat);

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

function processSounds() {
  return gulp
    .src(['sounds/**/*.mp3'], { encoding: false })
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
        const { relative } = file;
        const folder = relative.replace(/[\\/].*/, '');
        const targetFolder = 'folders/' + folder + '/';
        const arcName = folder + '-' + buildTag + '.zip';
        // console.log('MAP', folder);
        gulp.series([
          (cb) =>
            gulp
              // prettier-ignore
              .src(['src/**/*', '!**/*.mp3'], { encoding: false })
              .pipe(gulp.dest(targetFolder))
              .on('end', cb),
          (cb) =>
            gulp
              .src(targetFolder + '**/*', { encoding: false })
              .pipe(zip(arcName))
              .pipe(gulp.dest('archives'))
              .on('end', cb),
        ])(() => callback(null, file));
      }),
    );
}
gulp.task('processSounds', processSounds);
