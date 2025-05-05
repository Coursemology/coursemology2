# frozen_string_literal: true
require 'rails_helper'

RSpec.describe 'Course: Assessments: Questions: Rubric-based Response Management', js: true do
  let(:instance) { Instance.default }

  with_tenant(:instance) do
    let(:course) { create(:course) }
    let(:assessment) { create(:assessment, course: course) }
    let(:max_attachment_default_text_response) { 0 }
    let(:max_attachment_default_file_upload) { 1 }

    before { login_as(user, scope: :user) }

    context 'As a Course Manager' do
      let(:user) { create(:course_manager, course: course).user }

      scenario 'I can create a new rubric-based response question' do
        new_page = test_new_assessment_question_flow(course, assessment, 'Rubric-Based Response')

        within_window new_page do
          expect(page).to have_current_path(
            new_course_assessment_question_rubric_based_response_path(course, assessment)
          )
          # TODO: complete flow here
        end
      end
    end

    context 'As a Student' do
      let(:user) { create(:course_student, course: course).user }

      scenario 'I cannot add questions' do
        visit new_course_assessment_question_rubric_based_response_path(course, assessment)

        expect_forbidden
      end
    end
  end
end
