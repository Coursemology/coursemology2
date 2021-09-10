# frozen_string_literal: true
require 'rails_helper'

RSpec.feature 'Course: Assessments' do
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

        visit new_course_assessment_condition_assessment_path(course, assessment)

        find('#condition_assessment_assessment_id').
          find(:css, "option[value='#{valid_assessment_as_condition.id}']").
          select_option
        click_button I18n.t('helpers.submit.condition_assessment.create')
        expect(page).to have_selector('div',
                                      text: I18n.t('course.condition.assessments.create.success'))
      end

      scenario 'I can edit a assessment condition' do
        assessment_to_change_to = create(:assessment, course: course)

        visit edit_course_assessment_condition_assessment_path(course, assessment,
                                                               assessment_condition)
        find('#condition_assessment_assessment_id').
          find(:css, "option[value='#{assessment_to_change_to.id}']").
          select_option
        click_button I18n.t('helpers.submit.condition_assessment.update')
        expect(assessment_condition.reload.assessment).to eq(assessment_to_change_to)
        expect(current_path).to eq edit_course_assessment_path(course, assessment)
        expect(page).to have_selector('div',
                                      text: I18n.t('course.condition.assessments.update.success'))
      end

      scenario 'I can delete a assessment condition', js: true do
        visit edit_course_assessment_path(course, assessment)

        condition_delete_path =
          course_assessment_condition_assessment_path(course, assessment, assessment_condition)
        expect do
          find_link(nil, href: condition_delete_path).click
          accept_confirm_dialog
          expect(page).to have_selector('div.alert-success')
        end.to change { assessment.conditions.count }.by(-1)
      end
    end
  end
end
