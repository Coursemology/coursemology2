/* eslint-disable global-require */
/* eslint-disable import/no-dynamic-require */

/*
  This file is the entry point of the client script.

  It loads the module that matches the path of server side controller, thus different modules are
  required in different pages.

  Check the `server-context` meta tag in `<head/>` for controller path and put the javascript module
  in the path that matches the controller path if you want it to be required automatically.
 */


function loadCurrentModule() {
  const { modulePath } = require('./lib/helpers/server-context');
  try {
    require(`../app/bundles/${modulePath}`);
  } catch (e) {
    if (e.message.includes(modulePath)) {
      // Current module does not exist
    } else {
      throw e;
    }
  }
}

function loadModules() {
  // Initializers
  require('./lib/helpers/ace-editor.js');
  require('./lib/helpers/confirm-dialog');
  loadCurrentModule();
}

if (!global.Intl) {
  require.ensure([], (require) => {
    require('intl');
    require('intl/locale-data/jsonp/en');
    require('intl/locale-data/jsonp/zh');
    loadModules();
  }, 'intl');
} else {
  loadModules();
}
