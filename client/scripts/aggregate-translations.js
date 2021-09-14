const fs = require('fs');
const path = require('path');
const globSync = require('glob').sync;
const mkdirpSync = require('mkdirp').sync;

const OUTPUT_DIR = './build/locales/';

const translations = globSync('./locales/*.json')
  .map((filename) => [
    path.basename(filename, '.json'),
    fs.readFileSync(filename, 'utf8'),
  ])
  .map(([locale, file]) => [locale, JSON.parse(file)])
  .reduce(
    (collection, [locale, messages]) => ({ ...collection, [locale]: messages }),
    {}
  );

// Write the messages to this directory
mkdirpSync(OUTPUT_DIR);
fs.writeFileSync(
  `${OUTPUT_DIR}locales.json`,
  JSON.stringify(translations, null, 2)
);
