# frozen_string_literal: true
require 'rails_helper'

RSpec.describe 'Course: Assessment: Submissions: Worksheet' do
  let(:instance) { create(:instance) }

  with_tenant(:instance) do
    let(:course) { create(:course) }
    let(:assessment) do
      create(:assessment, :worksheet, :published_with_mcq_question, course: course)
    end
    before { login_as(user, scope: :user) }

    let(:student) { create(:course_user, :approved, course: course).user }
    let(:submission) do
      create(:course_assessment_submission, assessment: assessment, creator: student)
    end

    context 'As a Course Student' do
      let(:user) { student }

      scenario 'I can save my submission' do
        submission
        visit edit_course_assessment_submission_path(course, assessment, submission)

        option = assessment.questions.first.actable.options.first.option
        check option
        click_button I18n.t('common.save')

        expect(current_path).to eq(
          edit_course_assessment_submission_path(course, assessment, submission)
        )
        expect(page).to have_checked_field(option)
      end

      scenario 'I can finalise my submission only once' do
        submission
        visit edit_course_assessment_submission_path(course, assessment, submission)

        click_button I18n.t('course.assessment.submission.submissions.worksheet.finalise')
        expect(current_path).to eq(
          edit_course_assessment_submission_path(course, assessment, submission)
        )
        expect(submission.reload).to be_submitted

        visit edit_course_assessment_submission_path(course, assessment, submission)
        expect(page).
          not_to have_button(I18n.t('course.assessment.submission.submissions.worksheet.finalise'))
      end

      scenario 'I can comment on answers', js: true do
        assessment.questions.attempt(submission).each(&:save!)
        comment_answer = submission.answers.first
        comment_topic = comment_answer.discussion_topic
        create_list(:course_discussion_post, 2, topic: comment_topic)
        comment_parent_post = comment_topic.posts.ordered_topologically.last

        visit edit_course_assessment_submission_path(course, assessment, submission)

        comment_post_text = 'test comment'
        within find(content_tag_selector(comment_answer)) do
          fill_in 'discussion_post[text]', with: comment_post_text
          find('.reply-comment').click
        end

        wait_for_ajax

        comment_post = comment_topic.posts.reload.last
        expect(comment_post.text).to have_tag('*', text: comment_post_text)
        expect(comment_post.parent).to eq(comment_parent_post)
        within find(content_tag_selector(comment_answer)) do
          have_selector('.answer-comment-form', visible: true)
        end

        submission.answers.each do |answer|
          within find(content_tag_selector(answer)) do
            answer.discussion_topic.posts.each do |post|
              expect(page).to have_content_tag_for(post)
            end
          end
        end
      end

      scenario 'I can edit my existing comment', js: true do
        assessment.questions.attempt(submission).each(&:save!)
        comment_answer = submission.answers.first
        comment_topic = comment_answer.discussion_topic
        comment_post = create(:course_discussion_post,
                              topic: comment_topic, creator: user, updater: user)

        visit edit_course_assessment_submission_path(course, assessment, submission)

        find(content_tag_selector(comment_post)).find('.edit').click
        updated_post_text = 'updated comment'
        within find(content_tag_selector(comment_post)).find('.edit-discussion-post-form') do
          fill_in 'discussion_post[text]', with: updated_post_text
          click_button I18n.t('javascript.course.discussion.post.submit')
        end

        wait_for_ajax

        comment_post = comment_topic.posts.reload.last
        expect(comment_post.text).to have_tag('*', text: updated_post_text)
      end

      scenario 'I can delete comments', js: true do
        assessment.questions.attempt(submission).each(&:save!)
        comment_answer = submission.answers.first
        comment_topic = comment_answer.discussion_topic
        comment_post = create(:course_discussion_post, topic: comment_topic, creator: user)

        visit edit_course_assessment_submission_path(course, assessment, submission)

        within find(content_tag_selector(comment_post)) do
          find('.delete').click
        end

        wait_for_ajax
        expect(page).not_to have_content_tag_for(comment_post)
      end
    end
  end
end
