(function ($) {
  "use strict";
  var DOCUMENT_SELECTOR = ".course-experience-points-disbursement.new ";
  var COPY_BUTTON_SELECTOR = "#experience-points-disbursement-copy-button";

  function copyExperiencePoints(event) {
    event.preventDefault();
    var valueToCopy = $(".course_user:first")
      .find(".points_awarded:first")
      .val();
    $(".points_awarded").val(valueToCopy);
  }

  $(document).on(
    "click",
    DOCUMENT_SELECTOR + COPY_BUTTON_SELECTOR,
    copyExperiencePoints
  );
})(jQuery);
