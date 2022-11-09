import ReactDOM from 'react-dom';
import ReactTestUtils from 'react-dom/test-utils';
import { mount } from 'enzyme';

import CourseAPI from 'api/course';
import SurveyFormDialogue from 'course/survey/containers/SurveyFormDialogue';
import storeCreator from 'course/survey/store';
import DeleteConfirmation from 'lib/containers/DeleteConfirmation';

import AdminMenu from '../AdminMenu';

const mockUsedNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockUsedNavigate,
}));

describe('<AdminMenu />', () => {
  it('does not render button if user cannot edit or update', () => {
    const survey = {
      id: 2,
      title: 'Survey',
      canDelete: false,
      canUpdate: false,
    };
    const adminMenu = mount(
      <AdminMenu survey={survey} surveyId={survey.id.toString()} />,
      buildContextOptions(storeCreator({})),
    );

    expect(adminMenu).toMatchSnapshot();
  });

  // eslint-disable-next-line jest/no-disabled-tests
  it.skip('allows surveys to be deleted', () => {
    const spyDelete = jest.spyOn(CourseAPI.survey.surveys, 'delete');
    const survey = {
      id: 2,
      title: 'Survey To Delete',
      canDelete: true,
    };

    const contextOptions = buildContextOptions(storeCreator({}));
    const deleteConfirmation = mount(<DeleteConfirmation />, contextOptions);
    const adminMenu = mount(
      <AdminMenu survey={survey} surveyId={survey.id.toString()} />,
      contextOptions,
    );

    const iconButton = adminMenu.find('button').first();
    iconButton.simulate('click');

    const deleteButton = adminMenu.find('ForwardRef(ButtonBase)').last();
    deleteButton.simulate('click');

    const confirmDeleteButton = deleteConfirmation
      .find('ConfirmationDialog')
      .first()
      .instance().confirmButton;
    ReactTestUtils.Simulate.click(ReactDOM.findDOMNode(confirmDeleteButton));

    expect(spyDelete).toHaveBeenCalledWith(survey.id.toString());
  });

  // eslint-disable-next-line jest/no-disabled-tests
  it.skip('allows surveys to be edited', () => {
    const spyUpdate = jest.spyOn(CourseAPI.survey.surveys, 'update');
    const surveyFormData = {
      title: 'Survey To Edit',
      base_exp: 100,
      time_bonus_exp: 50,
      start_at: '2017-02-27T00:00:00.000+08:00',
      end_at: '2017-03-12T23:59:00.000+08:00',
      allow_response_after_end: true,
      allow_modify_after_submit: true,
      anonymous: true,
    };
    const survey = {
      ...surveyFormData,
      id: 2,
      hasStudentResponse: true,
      canUpdate: true,
    };

    const contextOptions = buildContextOptions(storeCreator({}));
    const surveyFormDialogue = mount(<SurveyFormDialogue />, contextOptions);
    const adminMenu = mount(
      <AdminMenu survey={survey} surveyId={survey.id.toString()} />,
      contextOptions,
    );

    const iconButton = adminMenu.find('button').first();
    iconButton.simulate('click');

    const updateButton = adminMenu.find('ForwardRef(ButtonBase)').last();
    updateButton.simulate('click');

    surveyFormDialogue.update();

    const sectionForm = surveyFormDialogue.find('form');
    const description = 'To update description';
    const descriptionInput = sectionForm.find('textarea[name="description"]');
    descriptionInput.simulate('change', { target: { value: description } });

    const submitButton = surveyFormDialogue
      .find('FormDialogue')
      .first()
      .instance().submitButton;
    ReactTestUtils.Simulate.click(ReactDOM.findDOMNode(submitButton));

    const expectedPayload = {
      survey: {
        ...surveyFormData,
        description,
        start_at: new Date(survey.start_at),
        end_at: new Date(survey.end_at),
        bonus_end_at: new Date(survey.end_at),
      },
    };
    expect(spyUpdate).toHaveBeenCalledWith(
      survey.id.toString(),
      expectedPayload,
    );
  });
});
