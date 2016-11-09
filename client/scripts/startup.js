/* eslint-disable global-require */
function start() {
  require('../app/bundles/Course/LessonPlan/startup');
}

if (!global.Intl) {
  require('intl');
  require('intl/locale-data/jsonp/en');
  require('intl/locale-data/jsonp/zh');
  start();
} else {
  start();
}
