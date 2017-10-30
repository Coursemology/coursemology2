import React from 'react';
import { render } from 'react-dom';
import { Router } from 'react-router-dom';
import history from 'lib/history';
import ProviderWrapper from 'lib/components/ProviderWrapper';
import AnnouncementsLayout from 'course/announcement/containers/AnnouncementsLayout';
import storeCreator from './store';

$(document).ready(() => {
  const mountNode = document.getElementById('course-announcement-component');

  if (mountNode) {
    const store = storeCreator({ announcements: {} });
    render(
      <ProviderWrapper {...{ store }}>
        <Router history={history}>
          <AnnouncementsLayout />
        </Router>
      </ProviderWrapper>
    , mountNode);
  }
});
