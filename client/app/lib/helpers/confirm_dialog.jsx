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
function loadDialogue(link, successCallback) {
  const mountNode = getOrCreateNode();
  // Remove existing hidden dialog, if any.
  unmountComponentAtNode(mountNode);
  render(
    <ProviderWrapper>
      <RailsConfirmationDialog
        onConfirmCallback={() => successCallback(link)}
        message={link.attr('data-confirm')}
      />
    </ProviderWrapper>
    , mountNode
  );
}

function overrideConfirmDialog() {
  // Handler for elements with data-confirm attribute.
  // This intercepts Rail's popup implementation and renders a dialog instead.
  $.rails.allowAction = (link) => {
    if (!link.attr('data-confirm')) { return true; }
    loadDialogue(link, $.rails.onConfirm);
    // Always stops the action since code runs asynchronously
    return false;
  };

  // Success callback if dialog is confirmed.
  $.rails.onConfirm = (link) => {
    link.removeAttr('data-confirm');
    link.trigger('click');
    if ($.rails.isRemote(link)) {
      $(document).ajaxComplete(() => unmountComponentAtNode(getOrCreateNode()));
    }
  };
}

$(document).ready(() => {
  overrideConfirmDialog();
});
