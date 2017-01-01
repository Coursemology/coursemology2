import initializeComponent from 'lib/helpers/initializeComponent';
import storeCreator from './programming/store';
import ProgrammingQuestion from './programming/containers/ProgrammingQuestion';

initializeComponent(ProgrammingQuestion, 'programming-question', storeCreator);
