import React from 'react';
import { render } from 'react-dom';
import ProviderWrapper from 'lib/components/ProviderWrapper';
import LessonPlanItemSettings from 'course/admin/pages/LessonPlanItemSettings';
import storeCreator from './store';

$(document).ready(() => {
  const mountNode = document.getElementById('lesson-plan-settings');

  if (mountNode) {
    const data = mountNode.getAttribute('data');
    const attributes = JSON.parse(data);
    const initialData = { admin: { lessonPlanItemSettings: attributes } };
    const store = storeCreator(initialData);

    const Page = () => (
      <ProviderWrapper store={store}>
        <LessonPlanItemSettings />
      </ProviderWrapper>
    );

    render(
      <Page />,
      mountNode
    );
  }
});
