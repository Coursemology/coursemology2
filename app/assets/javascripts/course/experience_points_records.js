//= require helpers/table_row_form_helpers

(function($, TABLE_ROW_FORM_HELPERS) {
  'use strict';

  var DOCUMENT_SELECTOR = '.course-experience-points-records.index ';
  var BUTTON_SELECTOR = 'tr.experience-points-record #update';

  TABLE_ROW_FORM_HELPERS.initializeAjaxForms(DOCUMENT_SELECTOR + BUTTON_SELECTOR);
})(jQuery, TABLE_ROW_FORM_HELPERS);
