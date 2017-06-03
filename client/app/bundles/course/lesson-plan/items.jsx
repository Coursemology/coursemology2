import React from 'react';
import { render } from 'react-dom';
import { Router } from 'react-router-dom';
import history from 'lib/history';
import ProviderWrapper from 'lib/components/ProviderWrapper';
import LessonPlanLayout from 'course/lesson-plan/containers/LessonPlanLayout';
import storeCreator from './store';

$(document).ready(() => {
  const mountNode = document.getElementById('lesson-plan-items');

  if (mountNode) {
    const store = storeCreator();

    render(
      <ProviderWrapper {...{ store }}>
        <Router history={history}>
          <LessonPlanLayout />
        </Router>
      </ProviderWrapper>
    , mountNode);
  }
});
