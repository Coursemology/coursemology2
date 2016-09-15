//= require helpers/table_row_form_helpers

(function($, TABLE_ROW_FORM_HELPERS) {
  'use strict';

  var DOCUMENT_SELECTOR = '.system-admin-users.index ';
  var BUTTON_SELECTOR = 'tr.user #update';

  TABLE_ROW_FORM_HELPERS.initializeAjaxForms(DOCUMENT_SELECTOR + BUTTON_SELECTOR);
})(jQuery, TABLE_ROW_FORM_HELPERS);
