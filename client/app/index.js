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
  require('lib/initializers/ace-editor.js');
  require('lib/initializers/confirm-dialog');
  loadCurrentModule();
  // Require web font last so that it doesn't block the load of current module.
  require('lib/initializers/webfont');
}

if (!global.Intl) {
  Promise.all([
    import(/* webpackChunkName: "intl" */ 'intl'),
    import(/* webpackChunkName: "intl" */ 'intl/locale-data/jsonp/en'),
    import(/* webpackChunkName: "intl" */ 'intl/locale-data/jsonp/zh'),
  ]).then(() => {
    loadModules();
  }).catch((e) => {
    throw e;
  });
} else {
  loadModules();
}
