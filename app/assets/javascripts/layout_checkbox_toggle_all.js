(function ($) {
  "use strict";

  /**
   * We link a checkbox with a "select all" toggle checkbox. Their states are linked. The
   * "select all" checkbox is the parent, and the checkbox under the influence of the "select
   * all" checkbox is the child.
   *
   * The child checkbox specifies its parent using the 'data-for-select-all' attribute, similar
   * to the for attribute used in labels for input elements.
   */
  function initializeComponent() {
    $(this).show();
  }

  /**
   * Finds the checkbox associated with the current checkbox.
   *
   * @param {jQuery} $checkbox The checkbox to query.
   * @returns {jQuery} If this is a parent, returns the children. If this is a child, returns the
   *   parent. Otherwise, returns an empty set.
   */
  function findAssociatedCheckboxes($checkbox) {
    var forSelectAll = $checkbox.data("forSelectAll");
    if (forSelectAll) {
      return $("#" + forSelectAll);
    } else {
      return $('input[type="checkbox"]').filter(
        '[data-for-select-all="' + $checkbox[0].id + '"]'
      );
    }
  }

  /**
   * Handles all checkbox clicks.
   *
   * @param e The event object.
   */
  function handleCheckboxClick(e) {
    var $target = $(e.target);
    if ($target.data("forSelectAll")) {
      handleChildCheckboxClick($target);
    } else {
      handleSelectAllCheckboxClick($target);
    }
  }

  /**
   * Handles the child checkbox click.
   *
   * This sets the state of the parent checkbox according to the state of the children.
   *
   * @param {jQuery} $target The child checkbox being clicked.
   */
  function handleChildCheckboxClick($target) {
    var $parentCheckbox = findAssociatedCheckboxes($target);
    if ($parentCheckbox.length === 0) {
      return;
    }

    var $otherChildren = findAssociatedCheckboxes($parentCheckbox);
    var checkStates = $otherChildren
      .map(function () {
        return this.checked;
      })
      .get();

    var checkedCount = 0;
    var uncheckedCount = 0;
    for (var i = 0; i < checkStates.length; ++i) {
      if (checkStates[i]) {
        checkedCount++;
      } else {
        uncheckedCount++;
      }
    }

    if (checkedCount === 0) {
      $parentCheckbox.prop("indeterminate", "");
      $parentCheckbox.prop("checked", "");
    } else if (uncheckedCount === 0) {
      $parentCheckbox.prop("indeterminate", "");
      $parentCheckbox.prop("checked", "checked");
    } else {
      $parentCheckbox.prop("indeterminate", "indeterminate");
      $parentCheckbox.prop("checked", "");
    }
  }

  /**
   * Handles the parent checkbox click.
   *
   * This sets the state of all children checkboxes.
   *
   * @param {jQuery} $parentCheckbox The parent checkbox being clicked.
   */
  function handleSelectAllCheckboxClick($parentCheckbox) {
    findAssociatedCheckboxes($parentCheckbox).prop(
      "checked",
      $parentCheckbox.prop("checked")
    );
  }

  $(document).on("click", 'input[type="checkbox"]', handleCheckboxClick);

  $.fn.checkboxToggleAll = function (options) {
    if (options === undefined) {
      this.each(initializeComponent);
    }

    return this;
  };
})(jQuery);
