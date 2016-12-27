/**
 * Returns true if screen width is smaller than 768px
 */
function isScreenXs() {
  const width = window.innerWidth
    || document.documentElement.clientWidth
    || document.body.clientWidth;

  return width < 768;
}


export default isScreenXs;
