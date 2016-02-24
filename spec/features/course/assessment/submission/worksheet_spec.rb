# frozen_string_literal: true
require 'rails_helper'

RSpec.describe 'Course: Assessment: Submissions: Worksheet' do
  let(:instance) { create(:instance) }

  with_tenant(:instance) do
    let(:course) { create(:course) }
    let(:assessment) { create(:assessment, :with_mcq_question, course: course) }
    before { login_as(user, scope: :user) }

    let(:student) { create(:course_user, :approved, course: course).user }
    let(:submission) do
      create(:course_assessment_submission, assessment: assessment, user: student)
    end

    context 'As a Course Student' do
      let(:user) { student }

      scenario 'I can comment on answers' do
        visit edit_course_assessment_submission_path(course, assessment, submission)

        comment_post_text = 'test comment'
        within find(content_tag_selector(submission.answers.first)) do
          find(:css, 'textarea.comment').set(comment_post_text)
        end

        click_button 'save'

        comment_post = submission.answers.first.discussion_topic.posts.first
        expect(comment_post.text).to eq(comment_post_text)
      end
    end
  end
end
