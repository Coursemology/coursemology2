const fs = require('fs');
const globSync = require('glob').sync;
const mkdirpSync = require('mkdirp').sync;

const FILE_PATTERN = './build/messages/**/*.json';
const OUTPUT_DIR = './build/locales/';

// Aggregates the default messages that were extracted from the example app's
// React components via the React Intl Babel plugin. An error will be thrown if
// there are messages in different components that use the same `id`. The result
// is a flat collection of `id: message` pairs for the app's default locale.
const defaultMessages = globSync(FILE_PATTERN)
  .map((filename) => fs.readFileSync(filename, 'utf8'))
  .map((file) => JSON.parse(file))
  .reduce((collection, descriptors) => {
    const messages = {};
    descriptors.forEach(({ id, defaultMessage }) => {
      if ({}.hasOwnProperty.call(collection, id)) {
        throw new Error(`Duplicate message id: ${id}`);
      }
      messages[id] = defaultMessage;
    });

    return { ...collection, ...messages };
  }, {});

// Create a new directory that we want to write the aggregate messages to
mkdirpSync(OUTPUT_DIR);

// Write the messages to this directory
const outputFile = `${OUTPUT_DIR}en.json`;
fs.writeFileSync(outputFile, JSON.stringify(defaultMessages, null, 2));
