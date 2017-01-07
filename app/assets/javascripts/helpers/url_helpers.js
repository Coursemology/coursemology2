var URL_HELPERS = (function (){
  'use strict';

  /* Get the given parameter from the URL.
   * e.g. With this URL -> http://dummy.com/?technology=jquery&blog=jquerybyexample
   *
   * var tech = getUrlParameter('technology');
   * var blog = getUrlParameter('blog');
   *
   * Taken from http://stackoverflow.com/questions/19491336/get-url-parameter-jquery-or-how-to-get-query-string-values-in-js
   */
  function getUrlParameter(sParam) {
    var sPageURL = decodeURIComponent(window.location.search.substring(1)),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;

    for (i = 0; i < sURLVariables.length; i++) {
      sParameterName = sURLVariables[i].split('=');

      if (sParameterName[0] === sParam) {
        return sParameterName[1] === undefined ? true : sParameterName[1];
      }
    }
  }

  return {
    getUrlParameter: getUrlParameter
  };
}(jQuery));
