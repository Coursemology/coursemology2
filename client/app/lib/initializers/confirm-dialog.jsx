import { render, unmountComponentAtNode } from 'react-dom';

import RailsConfirmationDialog from 'lib/components/core/dialogs/RailsConfirmationDialog';
import ProviderWrapper from 'lib/components/wrappers/ProviderWrapper';
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
        message={element.attr('data-confirm')}
        onConfirmCallback={() => successCallback(element)}
      />
    </ProviderWrapper>,
    mountNode,
  );
}

// Loads the Custom Dialog component which contains an additional customized button.
function loadCustomDialogue(element, successCallback) {
  const mountNode = getOrCreateNode(DIALOG_ID);
  // Remove existing hidden dialog, if any.
  unmountComponentAtNode(mountNode);
  render(
    <ProviderWrapper>
      <RailsConfirmationDialog
        confirmButtonText={element.attr('data-confirm_text')}
        confirmSecondaryButtonText={element.attr('data-confirm_secondary_text')}
        message={element.attr('data-confirm')}
        onConfirmCallback={() => successCallback(element)}
        onConfirmSecondaryCallback={() => successCallback(element, true)}
      />
    </ProviderWrapper>,
    mountNode,
  );
}

// Create a form based on the link and submit.
function submitLink(link) {
  const form = $('<form>', {
    method: 'POST',
    action: link.attr('href'),
  });

  const token = $('<input>', {
    type: 'hidden',
    name: 'authenticity_token',
    value: $.rails.csrfToken(),
  });

  const method = $('<input>', {
    name: '_method',
    type: 'hidden',
    value: link.data('method'),
  });

  form.append(token, method).appendTo(document.body).submit();
}

function overrideConfirmDialog() {
  // Success callback if dialog is confirmed.
  function onConfirm(element, secondary) {
    element.removeAttr('data-confirm');

    if (
      element.is('a') &&
      element.data('method') &&
      !$.rails.isRemote(element)
    ) {
      // Manually handle and submit when the element is a link ( non-remote ).
      // Because dialog is async now and the link could have already been removed, `trigger`
      // might not work.
      const httpMethod = element.data('method').toUpperCase();

      if (['PUT', 'PATCH', 'DELETE'].indexOf(httpMethod) !== -1) {
        submitLink(element);
      }
    } else {
      // Element is a remote link, button, etc.
      // Additional params appended to the href link
      if (secondary) {
        element
          .parent()
          .attr(
            'href',
            `${element.parent().attr('href')}&${element.attr(
              'data-confirm_secondary',
            )}`,
          );
      }
      element.trigger('click');
      if ($.rails.isRemote(element)) {
        $(document).ajaxComplete(() =>
          unmountComponentAtNode(getOrCreateNode(DIALOG_ID)),
        );
      }
    }
  }

  // Handler for elements with data-confirm attribute.
  // This intercepts Rail's popup implementation and renders a dialog instead.
  $.rails.allowAction = (element) => {
    if (!element.attr('data-confirm')) {
      return true;
    }
    if (element.attr('data-confirm_secondary')) {
      loadCustomDialogue(element, onConfirm);
    } else {
      loadDialogue(element, onConfirm);
    }

    // Always stops the action since code runs asynchronously
    return false;
  };
}

$(() => {
  overrideConfirmDialog();
});
