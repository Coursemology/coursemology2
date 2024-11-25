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
    # Forum post response questions currently don't show 'Past Answers' element
    let(:past_answer_count) do
      submission.assessment.questions.reject do |q|
        q.question_type == 'ForumPostResponse'
      end.count
    end

    context 'As a Course Student' do
      let(:user) { student }

      scenario 'I can view my past answers' do
        visit edit_course_assessment_submission_path(course, assessment, submission)
        # Ensure all 'Past Answers' labels are rendered before continuing
        expect(page).to have_selector('span', text: 'Past Answers', count: past_answer_count)

        all('span', text: 'Past Answers').each(&:click)
        wait_for_animation
        # Label selector matches both the expanded 'Past Answers' section and the labels we clicked
        expect(page).to have_selector('label', text: 'Past Answers', count: past_answer_count * 2)
      end
    end

    context 'As a Course Staff' do
      let(:user) { create(:course_teaching_assistant, course: course).user }

      scenario "I can view my student's past answers" do
        visit edit_course_assessment_submission_path(course, assessment, submission)
        expect(page).to have_selector('span', text: 'Past Answers', count: past_answer_count)

        all('span', text: 'Past Answers').each(&:click)
        wait_for_animation
        expect(page).to have_selector('label', text: 'Past Answers', count: past_answer_count * 2)
      end
    end
  end
end
