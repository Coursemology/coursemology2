import initializeComponent from 'lib/helpers/initializeComponent';
import storeCreator from './store';
import LessonPlan from './containers/LessonPlan';

initializeComponent(LessonPlan, 'lesson-plan-items', storeCreator);
