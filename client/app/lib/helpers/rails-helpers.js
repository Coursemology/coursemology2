/**
 * Gets or creates a hidden div element with the provided ID.
 *
 * Can be used as a mounting node to render react components in half-rails, half-react pages.
 *
 * @param {String} id The id of the element to be returned.
 * @returns {HTMLElement} The (existing or newly created) element.
 */
function getOrCreateNode(id) {
  if (!document.getElementById(id)) {
    const node = document.createElement('div');
    node.setAttribute('id', id);
    document.body.appendChild(node);
  }
  return document.getElementById(id);
}

/* eslint-disable import/prefer-default-export */
export { getOrCreateNode };
