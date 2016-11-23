import { render } from 'react-dom';
import lessonPlanPlugin from './startup/LessonPlanPlugin';

$.getJSON('', (data) => {
  $(document).ready(() => {
    const locale = $("meta[name='server-context']").data('i18n-locale');
    const LessonPlan = lessonPlanPlugin(data, locale);
    render(LessonPlan, $('#lesson-plan-items')[0]);
  });
});
