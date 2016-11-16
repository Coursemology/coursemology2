# frozen_string_literal: true
require 'rails_helper'

RSpec.describe 'Course: Assessment: Submissions: Worksheet' do
  let(:instance) { Instance.default }

  with_tenant(:instance) do
    let(:course) { create(:course) }
    let(:assessment) do
      create(:assessment, :worksheet, :published_with_mrq_question, course: course)
    end
    before { login_as(user, scope: :user) }

    let(:student) { create(:course_user, :approved, course: course).user }
    let(:submission) { create(:submission, assessment: assessment, creator: student) }
    let(:programming_assessment) do
      create(:assessment, :worksheet, :published_with_programming_question, course: course)
    end
    let(:programming_assessment_submission) do
      create(:submission, assessment: programming_assessment, creator: student)
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

      scenario 'I can submit programming questions', js: true do
        programming_assessment_submission
        visit edit_course_assessment_submission_path(course, programming_assessment,
                                                     programming_assessment_submission)
        expect(page).to have_selector('.btn.submit-answer', count: 1)
      end

      scenario 'I can reset my answer to a programming question', js: true do
        programming_question = programming_assessment.questions.first
        programming_answer = create(:course_assessment_answer_programming,
                                    assessment: programming_assessment,
                                    question: programming_question,
                                    creator: student,
                                    file_count: 1)
        programming_submission = programming_answer.acting_as.submission

        # Modify programming file content
        file = programming_answer.files.first
        file.content = 'foooo'
        file.save

        # Reset answer
        visit edit_course_assessment_submission_path(course, programming_assessment,
                                                     programming_submission)
        expect(page).to have_selector('.btn.reset-answer', count: 1)
        page.accept_alert I18n.t('course.assessment.answer.reset_answer.warning') do
          click_link I18n.t('course.assessment.answer.reset_answer.button')
        end
        wait_for_ajax

        # Check that answer has been reset to template files
        expect(programming_answer.reload.files.first.content).
          to eq(programming_question.specific.template_files.first.content)
      end

      scenario 'I can finalise my submission only once' do
        submission
        visit edit_course_assessment_submission_path(course, assessment, submission)

        click_button I18n.t('course.assessment.submission.submissions.buttons.finalise')
        expect(current_path).to eq(
          edit_course_assessment_submission_path(course, assessment, submission)
        )
        expect(submission.reload).to be_submitted
        expect(page).not_to have_button(I18n.t('common.save'))

        visit edit_course_assessment_submission_path(course, assessment, submission)
        expect(page).
          not_to have_button(I18n.t('course.assessment.submission.submissions.buttons.finalise'))
      end

      scenario 'I can comment on answers', js: true do
        assessment.questions.attempt(submission).each(&:save!)
        comment_answer = submission.answers.first
        comment_topic = comment_answer.discussion_topic
        create_list(:course_discussion_post, 2, topic: comment_topic)
        comment_parent_post = comment_topic.posts.ordered_topologically.last

        visit edit_course_assessment_submission_path(course, assessment, submission)

        comment_post_text = 'test comment'
        answer_selector = content_tag_selector(comment_answer)
        fill_in_summernote answer_selector, comment_post_text
        within find(answer_selector) do
          find('.reply-comment').click
        end

        wait_for_ajax

        comment_post = comment_topic.posts.reload.last
        expect(comment_post.text).to have_tag('*', text: comment_post_text)
        expect(comment_post.parent).to eq(comment_parent_post)
        expect(find(content_tag_selector(comment_answer))).
          to have_selector('.answer-comment-form')

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
        answer_selector = content_tag_selector(comment_answer)
        fill_in_summernote answer_selector, updated_post_text
        within find(answer_selector).find('.edit-discussion-post-form') do
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
