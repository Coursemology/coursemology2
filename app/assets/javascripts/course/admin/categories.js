// Place all the behaviors and hooks related to the matching controller here.
// All this logic will automatically be available in application.js.
(function() {
  'use strict';
  $(document).on('page:load ready', function() {
    var $table = $('table.category-items');
    //$('.weight', $table).hide();
    $('.reorder', $table).show();
    console.log($('.reorder', $table));
    console.log("running");

    $('tbody', $table).sortable({
      axis: 'y',
      stop: function() {
        $('.weight input', $table).val(function(index) { return index + 1; });
      }
    }).disableSelection();
  });
})();
console.log("avilable");
