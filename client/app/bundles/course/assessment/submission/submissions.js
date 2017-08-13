/* eslint-disable global-require */
import initializeDownloadLink from 'lib/helpers/initializeDownloadLink';

function initialize() {
  // Initializers
  require('./submission');
  initializeDownloadLink('.btn.download');
}

Promise.all([
  import(/* webpackChunkName: "react-color" */ 'react-color'),
  import(/* webpackChunkName: "fabric" */ 'fabric'),
]).then(() => {
  initialize();
});
