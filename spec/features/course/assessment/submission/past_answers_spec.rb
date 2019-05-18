# frozen_string_literal: true
require 'rails_helper'

RSpec.describe 'Course: Assessment: Submissions: Past Answers', js: true do
  let(:instance) { Instance.default }

  with_tenant(:instance) do
    let(:course) { create(:course) }
    let(:assessment) do
      create(:assessment, :published_with_all_question_types, course: course)
    end
    before { login_as(user, scope: :user) }

    let(:student) { create(:course_student, course: course).user }
    let(:submission) do
      create(:submission,
             :submitted_with_past_answers,
             assessment: assessment,
             creator: student)
    end

    context 'As a Course Student' do
      let(:user) { student }

      scenario 'I can view my past answers' do
        visit edit_course_assessment_submission_path(course, assessment, submission)
        (0..4).each do |step_number|
          within(%([name="step#{step_number}"])) do
            expect(page).to have_selector('div.toggle-history')
            find('div.toggle-history').click
            expect(page).to have_selector('label', text: 'Past Answers')
          end
        end
      end
    end

    context 'As a Course Staff' do
      let(:user) { create(:course_teaching_assistant, course: course).user }

      scenario "I can view my student's past answers" do
        visit edit_course_assessment_submission_path(course, assessment, submission)
        (0..4).each do |step_number|
          within(%([name="step#{step_number}"])) do
            expect(page).to have_selector('div.toggle-history')
            find('div.toggle-history').click
            expect(page).to have_selector('label', text: 'Past Answers')
          end
        end
      end
    end
  end
end
