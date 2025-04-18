/* eslint-disable global-require */

function loadModules() {
  // Require web font last so that it doesn't block the load of current module.
  require('lib/initializers/webfont');
}

if (!global.Intl) {
  Promise.all([
    import(/* webpackChunkName: "intl" */ 'intl'),
    import(/* webpackChunkName: "intl" */ 'intl/locale-data/jsonp/en'),
    import(/* webpackChunkName: "intl" */ 'intl/locale-data/jsonp/zh'),
  ])
    .then(() => {
      loadModules();
    })
    .catch((e) => {
      throw e;
    });
} else {
  loadModules();
}
