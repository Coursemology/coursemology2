# frozen_string_literal: true
require 'rails_helper'

RSpec.describe 'Course: Assessment: Submissions: Manually Graded Assessments' do
  let(:instance) { Instance.default }

  with_tenant(:instance) do
    let(:course) { create(:course) }
    let(:assessment) do
      create(:assessment, :published_with_mrq_question, course: course)
    end
    let(:mrq_questions) { assessment.reload.questions.map(&:specific) }
    before { login_as(user, scope: :user) }

    let(:student) { create(:course_student, course: course).user }
    let(:submission) { create(:submission, assessment: assessment, creator: student) }
    let(:programming_assessment) do
      create(:assessment, :published_with_programming_question, course: course)
    end
    let(:programming_assessment_submission) do
      create(:submission, assessment: programming_assessment, creator: student)
    end
    let(:multiple_programming_assessment) do
      # Creates a manually-graded assessment with 3 programming questions:
      #   1. auto_gradable programming question (with test-cases)
      #   2. auto_gradable programming question (only evaluation test-cases)
      #   3. Non auto_gradable programming question (no test-cases)
      assessment = create(:assessment, :published_with_programming_question, course: course)
      create(:course_assessment_question_programming,
             template_package: true, template_package_deferred: false, assessment: assessment,
             evaluation_test_case_count: 1)
      create(:course_assessment_question_programming,
             template_package: true, template_package_deferred: false, assessment: assessment)
      assessment.reload
    end
    let(:multiple_programming_submission) do
      create(:submission, assessment: multiple_programming_assessment, creator: student)
    end

    context 'As a Course Student' do
      let(:user) { student }

      scenario 'I can save my submission' do
        submission
        visit edit_course_assessment_submission_path(course, assessment, submission)

        option = assessment.questions.first.actable.options.first.option
        check option
        click_button I18n.t('course.assessment.submission.submissions.buttons.save')

        expect(current_path).to eq(
          edit_course_assessment_submission_path(course, assessment, submission)
        )
        expect(page).to have_checked_field(option)
      end

      scenario 'I can run code only on programming questions with private and public test cases' do
        multiple_programming_submission
        visit edit_course_assessment_submission_path(course, multiple_programming_assessment,
                                                     multiple_programming_submission)

        # The Run Code button is only shown for the first question
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
        expect(page).
          not_to have_button(I18n.t('course.assessment.submission.submissions.buttons.save'))

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

    context 'As a Course Staff' do
      let(:user) { create(:course_teaching_assistant, course: course).user }

      scenario "I can grade the student's work" do
        mrq_questions.each { |q| q.attempt(submission).save! }
        submission.finalise!
        submission.save!

        # Create an extra question after submission is submitted, user should still be able to
        # grade the submission in this case.
        create(:course_assessment_question_multiple_response, assessment: assessment)

        visit edit_course_assessment_submission_path(course, assessment, submission)

        no_answer_text = I18n.t('course.assessment.submission.submissions.no_answer')
        expect(page).to have_selector('div.alert', text: no_answer_text)
        expect(page).to have_button(I18n.t('course.assessment.submission.submissions.buttons.save'))
        click_link I18n.t('course.assessment.submission.submissions.buttons.evaluate_answers')
        wait_for_job

        # Publish the submission with empty answer grade
        click_button I18n.t('course.assessment.submission.submissions.buttons.publish')

        expect(page).to have_selector('div.alert-danger')
        expect(page).
          to have_button(I18n.t('course.assessment.submission.submissions.buttons.publish'))

        fill_in find('input.form-control.grade')[:name], with: 0
        click_button I18n.t('course.assessment.submission.submissions.buttons.publish')

        expect(current_path).
          to eq(edit_course_assessment_submission_path(course, assessment, submission))
        expect(submission.reload.published?).to be(true)
      end

      scenario 'I can run code on autograded programming questions' do
        multiple_programming_submission
        visit edit_course_assessment_submission_path(course, multiple_programming_assessment,
                                                     multiple_programming_submission)

        # The Run Code button is only shown for the auto_gradable? questions
        expect(page).to have_selector('.btn.submit-answer', count: 2)
      end
    end
  end
end
