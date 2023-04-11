const fs = require('fs');
const path = require('path');
const globSync = require('glob').sync;
const { sync: mkdirpSync } = require('mkdirp').mkdirp;

const OUTPUT_DIR = './build/locales/';

// Excludes en as it is the default language
const translations = globSync('./locales/[!en]*.json')
  .map((filename) => [
    path.basename(filename, '.json'),
    fs.readFileSync(filename, 'utf8'),
  ])
  .map(([locale, file]) => [locale, JSON.parse(file)])
  .reduce((collection, [locale, messages]) => {
    const extractedMessages = {};
    Object.keys(messages).forEach((key) => {
      extractedMessages[key] = messages[key].defaultMessage;
    });
    return { ...collection, [locale]: { ...extractedMessages } };
  }, {});

// Write the messages to this directory
mkdirpSync(OUTPUT_DIR);
fs.writeFileSync(
  `${OUTPUT_DIR}locales.json`,
  JSON.stringify(translations, null, 2),
);
