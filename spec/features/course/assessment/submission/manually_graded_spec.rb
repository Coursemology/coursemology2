# frozen_string_literal: true
require 'rails_helper'

RSpec.describe 'Course: Assessment: Submissions: Manually Graded Assessments', js: true do
  let(:instance) { Instance.default }

  with_tenant(:instance) do
    let(:course) { create(:course) }
    let(:assessment) do
      create(:assessment, :published_with_mrq_question, course: course)
    end
    let(:mrq_questions) { assessment.reload.questions.map(&:specific) }
    before { login_as(user, scope: :user) }

    let(:student) { create(:course_student, course: course).user }
    let(:submission) { create(:submission, :attempting, assessment: assessment, creator: student) }
    let(:programming_assessment) do
      create(:assessment, :published_with_programming_question, course: course)
    end
    let(:programming_assessment_submission) do
      create(:submission, :submitted, assessment: programming_assessment, creator: student)
    end
    let(:multiple_programming_assessment) do
      # Creates a manually-graded assessment with 3 programming questions:
      #   1. auto_gradable programming question (with test-cases)
      #   2. auto_gradable programming question (only evaluation test-cases)
      #   3. Non auto_gradable programming question (no test-cases)
      assessment = create(:assessment, :published_with_programming_question, course: course)
      create(:course_assessment_question_programming,
             template_package: true, assessment: assessment,
             evaluation_test_case_count: 1, attempt_limit: nil)
      create(:course_assessment_question_programming,
             template_package: true, assessment: assessment)
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

        option = assessment.questions.first.actable.options.first
        expect(page).to have_selector('div', text: assessment.description)

        first(:checkbox, visible: false).set(true)
        click_button('Save Draft')

        expect(page).to have_selector('span', text: 'Submission updated successfully.')
        expect(submission.current_answers.first.specific.reload.options).to include(option)
      end

      scenario 'I can reset my answer to a programming question' do
        assessment.tabbed_view = true
        assessment.save!
        programming_question = programming_assessment.questions.first
        programming_answer = create(:course_assessment_answer_programming,
                                    current_answer: true,
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
        expect(page).to have_selector('div', text: programming_question.description)

        click_button('Reset Answer')
        accept_confirm_dialog do
          wait_for_job
        end

        # Check that answer has been reset to template files
        expect(page).not_to have_selector('div.ace_line', text: file.content)
        expect(programming_answer.reload.files.first.content).
          to eq(programming_question.specific.template_files.first.content)
      end

      scenario 'I can finalise my submission only once' do
        submission
        visit edit_course_assessment_submission_path(course, assessment, submission)

        click_button('Finalise Submission')
        accept_confirm_dialog do
          wait_for_job
        end

        expect(page).to have_selector('span', text: 'Submission updated successfully.')
        expect(submission.reload).to be_submitted
        expect(page).not_to have_button('Save Draft')
        # Answer grades should not be displayed to students
        expect(page).not_to have_selector('div', text: 'Grading')
      end

      scenario 'I can create, update and delete comment on answers' do
        visit edit_course_assessment_submission_path(course, assessment, submission)
        expect(page).to have_selector('div', text: assessment.description)

        comment_answer = submission.submission_questions.first
        comment_topic = comment_answer.discussion_topic

        # Make a first comment
        comment_post_text = 'test comment'
        first('textarea').set(comment_post_text)
        click_button 'Comment'
        expect(page).to have_selector('p', text: comment_post_text)

        comment_post = comment_topic.reload.posts.last
        expect(comment_post.text).to have_tag('*', text: comment_post_text)
        expect(comment_post.parent).to eq(nil)

        # Reply to the first comment
        comment_reply_text = 'test reply'
        first('textarea').set(comment_reply_text)
        click_button 'Comment'
        expect(page).to have_selector('p', text: comment_reply_text)

        comment_reply = comment_topic.reload.posts.reject { |post| post.id == comment_post.id }.last
        expect(comment_reply.parent).to eq(comment_post)

        # Edit the first comment made
        first('button.edit-comment').click
        updated_post_text = 'updated comment'
        first('textarea').set('')
        first('textarea').set(updated_post_text)
        click_button 'Save'
        expect(page).to have_selector('p', text: updated_post_text)

        # Delete the reply
        first('button.delete-comment').click
        accept_confirm_dialog do
          wait_for_job
        end

        expect(page).not_to have_selector('p', text: updated_post_text)
        expect(comment_topic.reload.posts.count).to eq(1)
      end
    end

    context 'As a Course Staff' do
      let(:user) { create(:course_teaching_assistant, course: course).user }

      scenario "I can grade the student's work" do
        mrq_questions.each { |q| q.attempt(submission).save! }
        submission.finalise!
        submission.save!

        # Check that there is NO late submission warning.
        late_submission_text = /This submission is LATE! */
        visit edit_course_assessment_submission_path(course, assessment, submission)
        expect(page).to have_selector('span', text: /Submission by */)
        expect(page).not_to have_selector('span', text: late_submission_text)

        # Create a late submission
        assessment.end_at = Time.zone.now - 1.day
        assessment.save!

        # Refresh and check for the late submission warning.
        visit edit_course_assessment_submission_path(course, assessment, submission)
        expect(page).to have_selector('span', text: late_submission_text)

        # Create an extra question after submission is submitted, user should still be able to
        # grade the submission in this case.
        create(:course_assessment_question_multiple_response, assessment: assessment)

        visit edit_course_assessment_submission_path(course, assessment, submission)

        expect(page).to have_selector('span', text: /There is no answer submitted for this question */)

        first('input.grade').set(0)
        click_button 'Publish Grade'
        expect(page).to have_selector('span', text: 'Submission updated successfully.')

        # Send and wait for submission graded email
        perform_enqueued_jobs
        wait_for_job

        # Check that student is notified that his submission is graded
        emails = unread_emails_for(student.email).map(&:subject)
        expect(emails).to include('course.mailer.submission_graded_email.subject')
        expect(submission.reload.published?).to be(true)
        expect(submission.points_awarded).to eq(0)

        # Update grade and check if grade fields are updated
        first('input.grade').set(1)
        expect(page.all('td', text: '1 / 2').count).to eq(1)

        # Save grade and ensure that points awarded is updated correctly.
        click_button 'Save'
        exp = submission.assessment.base_exp * submission.grade / submission.assessment.maximum_grade
        expect(submission.reload.points_awarded).to eq(exp)
      end

      scenario 'I can run code on autograded programming questions' do
        multiple_programming_submission
        visit edit_course_assessment_submission_path(course, multiple_programming_assessment,
                                                     multiple_programming_submission)

        # The Run Code button is only shown for the auto_gradable? questions
        expect(page).to have_selector('span', text: 'RUN CODE', count: 2)
      end

      scenario 'I see submitted programmming answers with code tags' do
        # Modify programming answer content
        programming_answer = programming_assessment_submission.answers.first.actable
        file = programming_answer.files.first
        file.content = 'a = 123'
        file.save

        visit edit_course_assessment_submission_path(course, programming_assessment,
                                                     programming_assessment_submission)
        expect(page).to have_selector('code', text: 'a = 123')
      end
    end
  end
end
