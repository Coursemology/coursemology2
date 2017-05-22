import React from 'react';
import axios from 'lib/axios';
import { render } from 'react-dom';
import { defineMessages } from 'react-intl';
import ProviderWrapper from 'lib/components/ProviderWrapper';
import renderNotificationBar from 'lib/helpers/renderNotificationBar';
import BadgeUploader from './badge-uploader';

require('jquery-ui/ui/widgets/sortable');

const ACHIEVEMENTS_SELECTOR = '#sortable ';
const BADGE_UPLOADER_SELECTOR = 'achievement-badge';
const BUTTON_SELECTOR = '#reorder ';
const REORDER_ICON_SELECTOR = '.fa-reorder ';

const translations = defineMessages({
  updateFailed: {
    id: 'course.achievement.achievementReorder.updateFailed',
    defaultMessage: 'Reorder Failed.',
  },
  updateSuccess: {
    id: 'course.achievement.achievementReorder.updateSuccess',
    defaultMessage: 'Achievements successfully reordered',
  },
});

function renderNotification(message) {
  renderNotificationBar('achievement-reordering', message);
}

// AJAX call to submit data for reordering.
function submitReordering(ordering) {
  const action = `${window.location.pathname}/reorder`;

  return axios.post(action, ordering)
    .then(() => {
      renderNotification(translations.updateSuccess.defaultMessage);
    })
    .catch(() => {
      renderNotification(translations.updateFailed.defaultMessage);
    });
}

// Serialise the ordered achievements as data for the AJAX call.
function serializedOrdering() {
  const options = { attribute: 'id', key: 'achievement_order[]' };
  const ordering = $(ACHIEVEMENTS_SELECTOR).sortable('serialize', options);

  return ordering;
}

// Enables the sortable element, toggles the button and shows the reordering icons.
function enableReordering() {
  $(ACHIEVEMENTS_SELECTOR).sortable({
    update() {
      const ordering = serializedOrdering();
      submitReordering(ordering);
    },
    disabled: false,
  });
  $(BUTTON_SELECTOR).removeClass('btn-default').addClass('btn-danger');
  $(REORDER_ICON_SELECTOR).removeClass('hidden');
}

// Disables the sortable element, toggles the button and hides the reordering icons.
function disableReordering() {
  $(ACHIEVEMENTS_SELECTOR).sortable({ disabled: true });
  $(BUTTON_SELECTOR).removeClass('btn-danger').addClass('btn-default');
  $(REORDER_ICON_SELECTOR).addClass('hidden');
}

// Declare the necessary transitions for the toggle reordering of achievements button.
function initializeReorderingButton() {
  $(BUTTON_SELECTOR).on('click', () => {
    if ($(BUTTON_SELECTOR).attr('class').indexOf('btn-default') !== -1) {
      enableReordering();
    } else {
      disableReordering();
    }
  });
}

// Function to render the drag-and-drop badge uploader.
function renderBadgeUploader() {
  const mountNode = document.getElementById(BADGE_UPLOADER_SELECTOR);
  const fileUrl = mountNode.getAttribute('data-badge-url');
  render(
    <ProviderWrapper>
      <BadgeUploader
        currentFileUrl={fileUrl}
      />
    </ProviderWrapper>
    , mountNode
  );
}


$(document).ready(() => {
  initializeReorderingButton();
  renderBadgeUploader();
});
