import React from 'react';
import { render, unmountComponentAtNode } from 'react-dom';
import ProviderWrapper from 'lib/components/ProviderWrapper';
import RailsConfirmationDialog from 'lib/components/RailsConfirmationDialog';
import { getOrCreateNode } from 'lib/helpers/rails-helpers';

// Replaces Rail's UJS implementation of the Confirm Dialogue using a react component.
// Code adapted from: http://lesseverything.com/blog/customizing-confirmation-dialog-in-rails/

const DIALOG_ID = 'confirm-dialog';

// Loads the Dialog component.
function loadDialogue(element, successCallback) {
  const mountNode = getOrCreateNode(DIALOG_ID);
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

    if (element.is('a') && element.data('method') && !$.rails.isRemote(element)) {
      // Manually handle and submit when the element is a link ( non-remote ).
      // Because dialog is async now and the link could have already been removed, `trigger`
      // might not work.
      const httpMethod = element.data('method').toUpperCase();

      if (['PUT', 'PATCH', 'DELETE'].indexOf(httpMethod) !== -1) { submitLink(element); }
    } else {
      // Element is a remote link, button, etc.
      element.trigger('click');
      if ($.rails.isRemote(element)) {
        $(document).ajaxComplete(() => unmountComponentAtNode(getOrCreateNode(DIALOG_ID)));
      }
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
