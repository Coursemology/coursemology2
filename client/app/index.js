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
  const modulePath = document.head.querySelector("[name='server-context']")
                       .getAttribute('data-controller-name');

  try {
    require(`../app/bundles/${modulePath}`);
  } catch (e) {
    // Module does not exist
  }
}

if (!global.Intl) {
  require.ensure([], (require) => {
    require('intl');
    require('intl/locale-data/jsonp/en');
    require('intl/locale-data/jsonp/zh');
    loadCurrentModule();
  }, 'intl');
} else {
  loadCurrentModule();
}
