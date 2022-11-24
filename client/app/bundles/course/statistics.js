import initializeDownloadLink from 'lib/helpers/initializeDownloadLink';

const MY_STUDENT_SELECTOR = 'a[href="#my-students"]';

function initializeTabs() {
  $(MY_STUDENT_SELECTOR).tab('show');
}

$(initializeTabs);
initializeDownloadLink('.btn.download');
