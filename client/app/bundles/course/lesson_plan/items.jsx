import initializeComponent from 'lib/helpers/initializeComponent';
import storeCreator from './store';
import LessonPlanContainer from './containers/LessonPlanContainer';

initializeComponent(LessonPlanContainer, 'lesson-plan-items', storeCreator);
