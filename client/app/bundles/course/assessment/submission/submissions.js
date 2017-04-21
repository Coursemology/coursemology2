import { getUrlParameter } from 'lib/helpers/url-helpers';
import initializeDownloadLink from 'lib/helpers/initializeDownloadLink';

require('./submission');
require('./submit-answer');
require('./calculate-grade-exp');

const MULTI_QUESTION_ASSESSMENT_SELECTOR = '.multi-question';

function initializeAnswerTabs() {
  // Initialize Ace Editor when tab is shown.
  $(`${MULTI_QUESTION_ASSESSMENT_SELECTOR} .tab-header a`).on('shown.bs.tab', (e) => {
    const identifier = e.target.getAttribute('aria-controls');
    $(`#${identifier}`).find('textarea.code').ace();
  });

  const step = getUrlParameter('step') || 1;
  $(`${MULTI_QUESTION_ASSESSMENT_SELECTOR} .tab-header a[step="${step}"]`).tab('show');
}

function initializeAceEditor() {
  $('textarea.code').not('.tab-content textarea.code').ace();
}

$(document).ready(initializeAnswerTabs);
$(document).ready(initializeAceEditor);
initializeDownloadLink('.btn.download');
