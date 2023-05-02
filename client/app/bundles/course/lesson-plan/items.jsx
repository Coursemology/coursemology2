import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import LessonPlanLayout from 'course/lesson-plan/containers/LessonPlanLayout';
import ProviderWrapper from 'lib/components/wrappers/ProviderWrapper';

import storeCreator from './store';

$(() => {
  const mountNode = document.getElementById('app-root');

  if (mountNode) {
    const store = storeCreator();
    const root = createRoot(mountNode);

    root.render(
      <ProviderWrapper store={store}>
        <BrowserRouter>
          <LessonPlanLayout />
        </BrowserRouter>
      </ProviderWrapper>,
    );
  }
});
