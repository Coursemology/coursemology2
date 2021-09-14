/**
 * Removes HTML tags from a specified string.
 *
 * @param {String} str The specified string with HTML tags.
 * @returns {String} The string with HTML tags removed.
 */
function stripHtmlTags(str) {
  if ((str === null) || (str === '')) { return ''; }

  return str.replace(/<[^>]*>/g, '');
}

export default stripHtmlTags;
