// Dropdown does not work on iOS devices as only click delegation for a and input are supported
// Event delegation for iOS http://www.quirksmode.org/blog/archives/2010/09/click_event_del.html
// Proposed solution is modified from http://stackoverflow.com/a/22318440

(function ($) {
  "use strict";

  function initializeDropdownEventListener() {
    $("[data-toggle=dropdown]").each(function () {
      this.addEventListener("click", function () {}, false);
    });
  }

  $(document).ready(function () {
    initializeDropdownEventListener();
  });
})(jQuery);
