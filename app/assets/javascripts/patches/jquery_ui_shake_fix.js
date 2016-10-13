// The shake effect ignores the padding of the element.
// See https://bugs.jqueryui.com/ticket/8867 for more details.
// This has been fixed in jQuery UI 1.12, this can be removed after
// https://github.com/joliss/jquery-ui-rails/pull/105 is closed.

if ($.ui) {
  (function () {
    'use strict';

    var oldEffect = $.fn.effect;
    $.fn.effect = function (effectName) {
      if (effectName === 'shake') {
        var old = $.effects.createWrapper;
        $.effects.createWrapper = function (element) {
          var result;
          var oldCSS = $.fn.css;

          $.fn.css = function (size) {
            var _element = this;
            var hasOwn = Object.prototype.hasOwnProperty;
            return _element === element && hasOwn.call(size, 'width') &&
              hasOwn.call(size, 'height') && _element || oldCSS.apply(this, arguments);
          };

          result = old.apply(this, arguments);

          $.fn.css = oldCSS;
          return result;
        };
      }
      return oldEffect.apply(this, arguments);
    };
  })();
}
