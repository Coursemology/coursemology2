import { render } from 'react-dom';
import ProviderWrapper from 'lib/components/ProviderWrapper';
import LessonPlanSettings from 'course/admin/pages/LessonPlanSettings';
import storeCreator from './store';

$(document).ready(() => {
  const mountNode = document.getElementById('lesson-plan-settings');

  if (mountNode) {
    const data = mountNode.getAttribute('data');
    const attributes = JSON.parse(data);
    const initialData = { admin: { lessonPlanSettings: attributes } };
    const store = storeCreator(initialData);

    const Page = () => (
      <ProviderWrapper store={store}>
        <LessonPlanSettings />
      </ProviderWrapper>
    );

    render(<Page />, mountNode);
  }
});
