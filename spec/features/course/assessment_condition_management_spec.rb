# frozen_string_literal: true
require 'rails_helper'

RSpec.feature 'Course: Assessments' do
  let(:instance) { create(:instance) }

  with_tenant(:instance) do
    let(:course) { create(:course) }
    before { login_as(user, scope: :user) }

    context 'As a Course Manager' do
      let(:user) { create(:course_manager, :approved, course: course).user }
      let!(:assessment) { create(:course_assessment_assessment, course: course) }
      let(:other_assessment) { create(:assessment, course: course) }
      let!(:assessment_condition) do
        create(:assessment_condition,
               course: course, assessment: other_assessment, conditional: assessment)
      end

      # Assessment condition

      scenario 'I can create a assessment condition' do
        valid_assessment_as_condition = create(:assessment, course: course)

        visit edit_course_assessment_path(course, assessment)
        click_link Course::Condition::Assessment.model_name.human
        expect(current_path).
          to eq(new_course_assessment_condition_assessment_path(course, assessment))

        find('#condition_assessment_assessment_id').
          find(:css, "option[value='#{valid_assessment_as_condition.id}']").
          select_option
        click_button I18n.t('helpers.submit.condition_assessment.create')
        expect(current_path).to eq edit_course_assessment_path(course, assessment)
        expect(page).to have_selector('tr.condition > td.assessment-condition-content',
                                      text: valid_assessment_as_condition.title)
      end

      scenario 'I can edit a assessment condition' do
        assessment_to_change_to  = create(:assessment, course: course)

        visit edit_course_assessment_path(course, assessment)
        expect(current_path).to eq edit_course_assessment_path(course, assessment)
        expect(page).to have_selector('tr.condition > td.assessment-condition-content',
                                      text: other_assessment.title)
        condition_edit_path =
          edit_course_assessment_condition_assessment_path(course, assessment,
                                                           assessment_condition)
        find_link(nil, href: condition_edit_path).click
        find('#condition_assessment_assessment_id').
          find(:css, "option[value='#{assessment_to_change_to.id}']").
          select_option
        click_button I18n.t('helpers.submit.condition_assessment.update')
        expect(current_path).to eq edit_course_assessment_path(course, assessment)
        expect(page).to have_selector('tr.condition > td.assessment-condition-content',
                                      text: assessment_to_change_to.title)
      end

      scenario 'I can delete a assessment condition' do
        visit edit_course_assessment_path(course, assessment)
        condition_delete_path =
          course_assessment_condition_assessment_path(course, assessment, assessment_condition)
        expect do
          find_link(nil, href: condition_delete_path).click
        end.to change { assessment.conditions.count }.by(-1)
        expect(page).not_to have_selector('tr.condition > td.assessment-condition-content',
                                          text: other_assessment.title)
      end
    end
  end
end
