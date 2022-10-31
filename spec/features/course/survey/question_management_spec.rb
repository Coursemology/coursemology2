# frozen_string_literal: true
require 'rails_helper'

RSpec.feature 'Course: Surveys: Management', js: true do
  let(:instance) { Instance.default }

  with_tenant(:instance) do
    let(:course) { create(:course) }
    before { login_as(user, scope: :user) }

    context 'As a Course Manager' do
      let(:user) { create(:course_manager, course: course).user }
      let(:survey) { create(:course_survey, course: course) }
      let!(:section1) { create(:course_survey_section, :with_mcq_question, survey: survey) }
      let!(:section2) { create(:course_survey_section, :with_mcq_question, survey: survey) }
      let!(:question3) { create(:course_survey_question, :multiple_choice, section: section2) }

      scenario 'I can reorder survey questions within a section' do
        question2 = section2.questions.first

        visit course_survey_path(course.id, survey.id)
        question2_element = find_rbd_question(question2.id)
        question3_element = find_rbd_question(question3.id)
        drag_rbd(question2_element, question3_element)

        expect(page).to have_content('Question moved.')
        expect(question2.reload.weight).to be > question3.reload.weight
      end

      scenario 'I can reorder survey questions to another section' do
        question1 = section1.questions.first
        question2 = section2.questions.first

        visit course_survey_path(course.id, survey.id)
        question1_element = find_rbd_question(question1.id)
        question2_element = find_rbd_question(question2.id)
        drag_rbd(question1_element, question2_element)

        expect(page).to have_content('Question moved.')
        expect(section1.reload.questions).not_to include(question1)
        expect(section2.reload.questions).to include(question1, question2)
      end
    end
  end
end
