# frozen_string_literal: true
require 'rails_helper'

RSpec.feature 'Course: Assessments', js: true do
  let(:instance) { Instance.default }

  with_tenant(:instance) do
    let(:course) { create(:course) }
    before { login_as(user, scope: :user) }

    context 'As a Course Manager' do
      let(:user) { create(:course_manager, course: course).user }
      let!(:assessment) { create(:assessment, course: course) }
      let(:other_assessment) { create(:assessment, course: course) }
      let!(:assessment_condition) do
        create(:assessment_condition,
               course: course, assessment: other_assessment, conditional: assessment)
      end
      let(:settings) { Course::Settings::Components.new(course.reload) }

      # Assessment condition

      scenario 'I can create a assessment condition' do
        valid_assessment_as_condition = create(:assessment, course: course)
        visit edit_course_assessment_path(course, assessment)

        expect do
          click_button 'Add a condition'
          find('li', text: 'Assessment', exact_text: true).click
          find_field('Assessment').click
          find('li', text: valid_assessment_as_condition.title).click
          click_button 'Create condition'

          expect_toastify('Condition was successfully created.')
          expect(all('tr', text: 'Assessment').length).to be(2)
        end.to change { assessment.conditions.count }.by(1)
      end

      scenario 'I can edit a assessment condition' do
        assessment_to_change_to = create(:assessment, course: course)
        visit edit_course_assessment_path(course, assessment)
        condition_row = find('tr', text: assessment_condition.title)
        edit_button = condition_row.first('button', visible: false)

        hover_then_click edit_button
        find_field('Assessment').click
        find('li', text: assessment_to_change_to.title).click
        click_button 'Update condition'

        expect_toastify('Your changes have been saved.')
        hover_then_click condition_row.first('button', visible: false)
        expect(find_field('Assessment').value).to include(assessment_to_change_to.title)
      end

      scenario 'I can delete a assessment condition' do
        visit edit_course_assessment_path(course, assessment)
        condition_row = find('tr', text: assessment_condition.title)
        delete_button = condition_row.all('button', visible: false).last

        expect do
          hover_then_click delete_button
          expect_toastify('Condition was successfully deleted.')
        end.to change { assessment.conditions.count }.by(-1)
      end
    end
  end
end
