var EVENT_HELPERS = (function ($) {
  'use strict';

  /*
   * callback should take in an element
   */
  function onNodesInserted($elements, callback) {
    var nodesAddedObserver = new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
        var newNodes = mutation.addedNodes;
        if (newNodes !== null) {
          $(newNodes).each(function () {
            callback(this);
          });
        }
      });
    });

    var config = { childList: true, subtree: true };
    $elements.each(function () {
      nodesAddedObserver.observe(this, config);
    });
  }

  return {
    onNodesInserted: onNodesInserted,
  };
})(jQuery);
