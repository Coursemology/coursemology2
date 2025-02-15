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
    let(:past_answer_count) do
      submission.assessment.questions.count
    end

    context 'As a Course Student' do
      let(:user) { student }

      scenario 'I can view my past answers' do
        visit edit_course_assessment_submission_path(course, assessment, submission)
        # Ensure all 'Past Answers' labels are rendered before continuing
        # "//button/span" matches and returns the label, "//button[span]" matches and returns the button
        expect(page).to have_xpath('//button[span]', text: 'All Answers', count: past_answer_count)

        all(:xpath, '//button[span]', text: 'All Answers').each do |btn|
          btn.click
          expect(page).to have_button('Close')
          click_button('Close')
        end
      end
    end

    context 'As a Course Staff' do
      let(:user) { create(:course_teaching_assistant, course: course).user }

      scenario "I can view my student's past answers" do
        visit edit_course_assessment_submission_path(course, assessment, submission)
        expect(page).to have_xpath('//button[span]', text: 'All Answers', count: past_answer_count)

        all(:xpath, '//button[span]', text: 'All Answers').each do |btn|
          btn.click
          expect(page).to have_button('Close')
          click_button('Close')
        end
      end
    end
  end
end
