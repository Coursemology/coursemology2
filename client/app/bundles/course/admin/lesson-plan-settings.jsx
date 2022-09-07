import { render } from 'react-dom';
import ProviderWrapper from 'lib/components/ProviderWrapper';
import LessonPlanSettings from 'course/admin/pages/LessonPlanSettings';
import { store } from './store';
import { update } from './reducers/lessonPlanSettings';

$(() => {
  const mountNode = document.getElementById('lesson-plan-settings');

  if (mountNode) {
    const data = mountNode.getAttribute('data');
    const attributes = JSON.parse(data);

    store.dispatch(update(attributes));

    const Page = () => (
      <ProviderWrapper store={store}>
        <LessonPlanSettings />
      </ProviderWrapper>
    );

    render(<Page />, mountNode);
  }
});
