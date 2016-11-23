import ReactOnRails from 'react-on-rails';
import LessonPlanPlugin from './startup/LessonPlanPlugin';

$(document).ready(function() {
  ReactOnRails.register({ LessonPlanPlugin });
});
