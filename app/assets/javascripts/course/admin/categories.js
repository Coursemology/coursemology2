// Place all the behaviors and hooks related to the matching controller here.
// All this logic will automatically be available in application.js.
(function() {
  'use strict';
  $(document).on('page:load ready', function() {
    var $table = $('table.category-items');

    // TODO re-enable when implementing drag-and-drop
    //$('.reorder-categories', $table).show();
    //$('.reorder-tabs', $table).show();
    //$ ('.weight', $table).hide();
    //$('.tab-parent', $table).hide();

    var dragState = { children: null };

    $('tbody', $table).sortable({
      axis: 'y',
      start: function(event, ui) {
        var $row = ui.item;
        if (isCategoryRow($row)) {
          dragState = { children: childrenFor($row) };
        }
      },
      stop: function(event, ui) {
        var $row = ui.item;
        if (isCategoryRow($row)) {
          var $destination = nextCategory($row);
          if ($destination) {
            $row.insertBefore($destination);
            dragState.children.insertBefore($destination)
          } else {
            $('tbody', $table).append($row).append(dragState.children);
          }
          dragState = { children: null };
        } else {
          var $parent = categoryFor($row);
          console.log($parent[0]);
          if (!$parent) {
            cancelReordering(this);
          } else {
            selectParentForRow($row, $parent);
          }
        }

        updateWeights();
      }
    }).disableSelection();

    /**
     * Returns the category row that a row is currently nested under.
     * This is the closest preceding sibling that is a category row.
     * Returns null if there is no such row.
     */
    function categoryFor($row) {
      if (isCategoryRow($row)) {
        $row = $row.prev();
      }
      var prevSiblings = $row.prevAll('tr');
      for (var i=prevSiblings.length-1; i>=0; i--) {
        if (isCategoryRow($(prevSiblings[i]))) {
          return $(prevSiblings[i]);
        }
      }
      return null;
    }

    /**
     * Returns the category row that follows a node.
     * This is the closest following sibling that is a category row.
     * Returns null if there is no such row.
     */
    function nextCategory($row) {
      if (isCategoryRow($row)) {
        $row = $row.next();
      }
      var nextSiblings = $row.nextAll('tr');
      for (var i=0; i<nextSiblings.length; i++) {
        if (isCategoryRow($(nextSiblings[i]))) {
          return $(nextSiblings[i]);
        }
      }
      return null;
    }

    /**
     * Given a category row, returns all child rows.
     * These are the rows until the next category row, or the end
     * of the list if there is no such row.
     */
    function childrenFor($categoryRow) {
      var $nextCategory = nextCategory($categoryRow);
      var filter = 'tr[tab-id]';
      if ($nextCategory) {
        return $categoryRow.nextUntil($nextCategory, filter);
      } else {
        return $categoryRow.nextAll(filter);
      }
    }

    function cancelReordering(node) {
      $(node).sortable('cancel');
    }

    function isCategoryRow($row) {
      return $row.hasClass('category-row');
    }

    function selectParentForRow($row, $parentRow) {
      $('select option[value="' + $parentRow.attr('category-id') + '"]', $row)
        .prop('selected', 'selected');
    }

    function updateWeights() {
      var categoryIndex = 1;
      var tabIndex = 1;
      $('tbody', $table).each(function(row) {
        var weight = $('.weight input', $(row));
        if (isCategoryRow($(row))) {
          weight.val(categoryIndex++);
          tabIndex = 1;
        } else {
          weight.val(tabIndex++);
        }
      });
    }
  });
})();
