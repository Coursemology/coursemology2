import { render } from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import ProviderWrapper from 'lib/components/ProviderWrapper';
import LessonPlanLayout from 'course/lesson-plan/containers/LessonPlanLayout';
import storeCreator from './store';

$(() => {
  const mountNode = document.getElementById('lesson-plan-items');

  if (mountNode) {
    const store = storeCreator();

    render(
      <ProviderWrapper {...{ store }}>
        <BrowserRouter>
          <LessonPlanLayout />
        </BrowserRouter>
      </ProviderWrapper>,
      mountNode,
    );
  }
});
