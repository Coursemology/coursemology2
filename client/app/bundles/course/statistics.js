const MY_STUDENT_SELECTOR = 'a[href="#my-students"]';

function initializeTabs() {
  $(MY_STUDENT_SELECTOR).tab('show');
}

$(initializeTabs);
