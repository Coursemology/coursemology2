import React from 'react';
import ReactDOM from 'react-dom';
import { mount, ReactWrapper } from 'enzyme';
import ReactTestUtils from 'react-dom/test-utils';
import CourseAPI from 'api/course';
import storeCreator from 'course/survey/store';
import DeleteConfirmation from 'course/survey/containers/SurveysLayout/DeleteConfirmation';
import SurveyFormDialogue from 'course/survey/containers/SurveyFormDialogue';
import AdminMenu from '../AdminMenu';

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
      buildContextOptions(storeCreator({}))
    );

    expect(adminMenu).toMatchSnapshot();
  });

  it('allows surveys to be deleted', () => {
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
      contextOptions
    );

    const iconButton = adminMenu.find('button').first();
    ReactTestUtils.Simulate.touchTap(ReactDOM.findDOMNode(iconButton.node));

    const menuCardNode = adminMenu.find('RenderToLayer').first().node.layerElement;
    const deleteButton = new ReactWrapper(menuCardNode, true).find('EnhancedButton').first();
    ReactTestUtils.Simulate.touchTap(ReactDOM.findDOMNode(deleteButton.node));

    const confirmDeleteButton =
      deleteConfirmation.find('ConfirmationDialog').first().node.confirmButton;
    ReactTestUtils.Simulate.touchTap(ReactDOM.findDOMNode(confirmDeleteButton));

    expect(spyDelete).toHaveBeenCalledWith(survey.id.toString());
  });

  it('allows surveys to be edited', () => {
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
      contextOptions
    );

    const iconButton = adminMenu.find('button').first();
    ReactTestUtils.Simulate.touchTap(ReactDOM.findDOMNode(iconButton.node));

    const menuCardNode = adminMenu.find('RenderToLayer').first().node.layerElement;
    const updateButton = new ReactWrapper(menuCardNode, true).find('EnhancedButton').first();
    ReactTestUtils.Simulate.touchTap(ReactDOM.findDOMNode(updateButton.node));

    const dialogInline = surveyFormDialogue.find('RenderToLayer').first().node.layerElement;
    const sectionForm = new ReactWrapper(dialogInline, true).find('form');
    const description = 'To update description';
    const descriptionInput = sectionForm.find('textarea[name="description"]');
    descriptionInput.simulate('change', { target: { value: description } });

    const submitButton = surveyFormDialogue.find('FormDialogue').first().node.submitButton;
    ReactTestUtils.Simulate.touchTap(ReactDOM.findDOMNode(submitButton));

    const expectedPayload = {
      survey: {
        ...surveyFormData,
        description,
        start_at: new Date(survey.start_at),
        end_at: new Date(survey.end_at),
        bonus_end_at: new Date(survey.end_at),
      },
    };
    expect(spyUpdate).toHaveBeenCalledWith(survey.id.toString(), expectedPayload);
  });
});
