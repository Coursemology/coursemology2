# frozen_string_literal: true
require 'rails_helper'

RSpec.describe 'Course: Assessment: Submissions: Worksheet' do
  let(:instance) { create(:instance) }

  with_tenant(:instance) do
    let(:course) { create(:course) }
    let(:assessment) { create(:assessment, :worksheet, :with_mcq_question, course: course) }
    before { login_as(user, scope: :user) }

    let(:student) { create(:course_user, :approved, course: course).user }
    let(:submission) do
      create(:course_assessment_submission, assessment: assessment, user: student)
    end

    context 'As a Course Student' do
      let(:user) { student }

      scenario 'I can save my submission' do
        submission
        visit edit_course_assessment_submission_path(course, assessment, submission)

        option = assessment.questions.first.actable.options.first.option
        check option
        click_button I18n.t('common.save')

        expect(current_path).to eq(\
          edit_course_assessment_submission_path(course, assessment, submission))
        expect(page).to have_checked_field(option)
      end

      scenario 'I can finalise my submission' do
        submission
        visit edit_course_assessment_submission_path(course, assessment, submission)

        click_button I18n.t('course.assessment.submission.submissions.worksheet.finalise')
        expect(current_path).to eq(\
          edit_course_assessment_submission_path(course, assessment, submission))
        expect(submission.reload).to be_submitted
      end

      scenario 'I can comment on answers' do
        visit edit_course_assessment_submission_path(course, assessment, submission)

        comment_post_text = 'test comment'
        within find(content_tag_selector(submission.answers.first)) do
          find(:css, 'textarea.comment').set(comment_post_text)
        end

        click_button 'save'

        comment_post = submission.answers.first.discussion_topic.posts.first
        expect(comment_post.text).to eq(comment_post_text)

        submission.answers.each do |answer|
          within find(content_tag_selector(answer)) do
            expect(page).to have_content_tag_for(comment_post)
          end
        end
      end
    end
  end
end
