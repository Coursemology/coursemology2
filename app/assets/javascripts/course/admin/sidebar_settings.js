(function($) {
  'use strict';
  $(document).on('turbolinks:load', function() {
    var $edit = $('.course-admin-sidebar-settings.edit');
    var $table = $('table.sidebar-items', $edit);
    $('.weight', $table).hide();
    $('.reorder', $table).show();

    $('tbody', $table).sortable({
      axis: 'y',
      stop: function() {
        $('.weight input', $table).val(function(index) { return index + 1; });
      }
    }).disableSelection();
  });
})(jQuery);
