import React from 'react';
import { render, unmountComponentAtNode } from 'react-dom';
import ProviderWrapper from 'lib/components/ProviderWrapper';
import RailsConfirmationDialog from 'lib/components/RailsConfirmationDialog';

// Replaces Rail's UJS implementation of the Confirm Dialogue using a react component.
// Code adapted from: http://lesseverything.com/blog/customizing-confirmation-dialog-in-rails/

// Create a placeholder element to render the dialog.
function getOrCreateNode() {
  if (!document.getElementById('confirm-dialog')) {
    const node = document.createElement('div');
    node.setAttribute('id', 'confirm-dialog');
    document.body.appendChild(node);
  }
  return document.getElementById('confirm-dialog');
}

// Loads the Dialog component.
function loadDialogue(element, successCallback) {
  const mountNode = getOrCreateNode();
  // Remove existing hidden dialog, if any.
  unmountComponentAtNode(mountNode);
  render(
    <ProviderWrapper>
      <RailsConfirmationDialog
        onConfirmCallback={() => successCallback(element)}
        message={element.attr('data-confirm')}
      />
    </ProviderWrapper>
    , mountNode
  );
}

// Create a form based on the link and submit.
function submitLink(link) {
  const form =
  $('<form>', {
    method: 'POST',
    action: link.attr('href'),
  });

  const token =
  $('<input>', {
    type: 'hidden',
    name: 'authenticity_token',
    value: $.rails.csrfToken(),
  });

  const method =
  $('<input>', {
    name: '_method',
    type: 'hidden',
    value: link.data('method'),
  });

  form.append(token, method).appendTo(document.body).submit();
}

function overrideConfirmDialog() {
  // Success callback if dialog is confirmed.
  function onConfirm(element) {
    element.removeAttr('data-confirm');

    if (element.closest('body').length > 0 || element.closest('a').length === 0) {
      // element is still visible in the page or element is not a link (button, etc).
      element.trigger('click');
      if ($.rails.isRemote(element)) {
        $(document).ajaxComplete(() => unmountComponentAtNode(getOrCreateNode()));
      }
    } else {
      // element is a link and it is removed from the page (This could happen because the operation
      // is Async now.
      const httpMethod = element.data('method') && element.data('method').toUpperCase();

      if (['PUT', 'PATCH', 'DELETE'].indexOf(httpMethod) !== -1) { submitLink(element); }
    }
  }

  // Handler for elements with data-confirm attribute.
  // This intercepts Rail's popup implementation and renders a dialog instead.
  $.rails.allowAction = (element) => {
    if (!element.attr('data-confirm')) { return true; }
    loadDialogue(element, onConfirm);
    // Always stops the action since code runs asynchronously
    return false;
  };
}

$(document).ready(() => {
  overrideConfirmDialog();
});
