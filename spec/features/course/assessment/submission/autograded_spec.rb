# frozen_string_literal: true
require 'rails_helper'

RSpec.describe 'Course: Assessment: Submissions: Autograded' do
  let(:instance) { Instance.default }

  with_tenant(:instance) do
    let(:course) { create(:course) }
    let(:assessment) do
      create(:assessment, :autograded, :published_with_mrq_question, course: course)
    end
    let(:mrq_questions) { assessment.reload.questions.map(&:specific) }
    let(:extra_mrq_question) do
      create(:course_assessment_question_multiple_response, assessment: assessment)
    end
    before { login_as(user, scope: :user) }

    let(:student) { create(:course_student, course: course).user }
    let(:submission) { create(:submission, assessment: assessment, creator: student) }
    let(:programming_assessment) do
      create(:assessment, :autograded, :published_with_programming_question, course: course)
    end
    let(:programming_assessment_submission) do
      create(:submission, assessment: programming_assessment, creator: student)
    end
    let(:text_response_assessment) do
      create(:assessment, :autograded, :published_with_text_response_question, course: course)
    end
    let(:text_response_assessment_submission) do
      create(:submission, assessment: text_response_assessment, creator: student)
    end

    context 'As a Course Student' do
      let(:user) { student }

      scenario 'I can save my submission' do
        visit edit_course_assessment_submission_path(course, assessment, submission)

        option = mrq_questions.first.options.first.option
        check option
        click_button I18n.t('course.assessment.submission.submissions.buttons.save')

        expect(page).to have_selector('div.alert-success',
                                      text: 'course.assessment.submission.submissions.update.'\
                                            'success')
        expect(page).to have_checked_field(option)
      end

      scenario 'I can navigate between questions' do
        extra_mrq_question

        visit edit_course_assessment_submission_path(course, assessment, submission)

        (1..assessment.questions.length).each do |step|
          path = edit_course_assessment_submission_path(course, assessment, submission, step: step)
          expect(page).to have_link(step, href: path)
        end
        expect(page).to have_selector('h3', text: mrq_questions.first.display_title)

        click_link '2'
        # Students should not be able to go to Q2 before Q1 is done.
        expect(page).to have_selector('h3', text: mrq_questions.first.display_title)

        # Add a correct answer to the first question
        answer = mrq_questions.first.attempt(submission)
        answer.correct = true
        answer.save!

        click_link '2'
        expect(page).to have_selector('h3', text: mrq_questions.second.display_title)
      end

      scenario 'I can continue to the next question when current answer is correct', js: true do
        extra_mrq_question

        visit edit_course_assessment_submission_path(course, assessment, submission)
        correct_option = mrq_questions.first.options.correct.first.option
        check correct_option

        click_button I18n.t('common.submit')
        wait_for_ajax

        # Check that previous attempt is restored.
        expect(page).
          to have_selector('div.panel', text: 'course.assessment.answer.explanation.correct')
        expect(page).to have_checked_field(correct_option)

        click_link I18n.t('course.assessment.answer.autograded.continue')
        expect(page).to have_selector('h3', text: mrq_questions.second.display_title)
      end

      scenario 'I can directly go to next question if the assessment is skippable' do
        extra_mrq_question
        assessment.update_column(:skippable, true)

        visit edit_course_assessment_submission_path(course, assessment, submission)

        click_link '2'
        expect(page).to have_selector('h3', text: mrq_questions.second.display_title)
      end

      scenario 'I can resubmit the question when submission is not finalised', js: true do
        visit edit_course_assessment_submission_path(assessment.course, assessment, submission)

        wrong_option = mrq_questions.first.options.where(correct: false).first.option
        correct_option = mrq_questions.first.options.correct.first.option

        # Submit a wrong solution
        check wrong_option
        click_button I18n.t('common.submit')
        wait_for_ajax

        expect(page).
          to have_selector('div.panel', text: 'course.assessment.answer.explanation.wrong')
        expect(page).to have_selector('h3', text: mrq_questions.first.display_title)
        # Check that previous attempt is restored.
        expect(page).to have_checked_field(wrong_option)
        expect(page).to have_selector('.btn', text: I18n.t('common.submit'))

        # Submit a correct solution
        check correct_option
        uncheck wrong_option
        click_button I18n.t('common.submit')
        wait_for_ajax

        expect(page).
          to have_selector('div.panel', text: 'course.assessment.answer.explanation.correct')
        expect(page).to have_selector('.btn.finalise')
        expect(page).to have_selector('h3', text: mrq_questions.first.display_title)
        expect(page).to have_checked_field(correct_option)
        expect(page).to have_selector('.btn', text: I18n.t('common.submit'))
      end

      scenario 'I can resubmit the answer when job is errored', js: true do
        # Build an answer with a failing job
        errored_grading =
          build(:course_assessment_answer_auto_grading, job: create(:trackable_job, :errored))
        create(:course_assessment_answer_multiple_response,
               :with_all_correct_options, :submitted,
               auto_grading: errored_grading, question: assessment.questions.first,
               submission: submission)

        visit edit_course_assessment_submission_path(assessment.course, assessment, submission)

        expect(page).to have_selector('p', text: 'course.assessment.answer.autograded.error')

        click_button I18n.t('common.submit')
        wait_for_ajax

        expect(page).
          to have_selector('div.panel', text: 'course.assessment.answer.explanation.correct')
        expect(page).to have_selector('h3', text: mrq_questions.first.display_title)
        expect(page).to have_selector('.btn', text: I18n.t('common.submit'))
      end

      scenario 'I can finalise my submission for auto grading' do
        assessment.autograded = true
        assessment.save!
        visit edit_course_assessment_submission_path(assessment.course, assessment, submission)
        expect(page).not_to have_selector('.btn.finalise')

        # Answer all the questions correctly.
        submission.answers.each do |answer|
          answer.finalise!
          answer.publish!
          answer.correct = true
          answer.save!
        end
        visit current_path
        click_button I18n.t('course.assessment.submission.submissions.buttons.finalise')

        perform_enqueued_jobs
        wait_for_job
        # Check that student is NOT notified that his submission is graded
        emails = unread_emails_for(student.email).map(&:subject)
        expect(emails).not_to include('course.mailer.submission_graded_email.subject')

        visit current_path
        expect(page).to have_selector('td', text: 'published')
        expect(page).not_to have_selector('.btn.finalise')
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
        programming_answer.files.first.update_column(:content, 'foooo')

        # Reset answer
        visit edit_course_assessment_submission_path(course, programming_assessment,
                                                     programming_submission)
        click_link I18n.t('course.assessment.answer.reset_answer.button')

        expect(page).to have_selector('.confirm-btn')
        accept_confirm_dialog
        wait_for_ajax

        # Check that answer has been reset to template files
        expect(programming_answer.reload.files.first.content).
          to eq(programming_question.specific.template_files.first.content)
      end

      scenario 'I can add an attachment to a file upload question', js: true do
        visit edit_course_assessment_submission_path(course, text_response_assessment,
                                                     text_response_assessment_submission)

        answer = text_response_assessment_submission.answers.last
        attach_file "submission_answers_attributes_#{answer.id}_actable_attributes_files",
                    File.join(Rails.root, '/spec/fixtures/files/text.txt')
        click_button I18n.t('common.submit')
        wait_for_ajax

        # Check that attached file is displayed
        # find is used here, so that an exception will be raised when fail and rspec will retry
        # the test.
        expect(find('a', text: 'text.txt')).to be_present

        # Check that attachment is uploaded
        expect(answer.specific.attachments).not_to be_empty
      end

      scenario 'I can continue to the next question when question is non-autograded', js: true do
        text_response_assessment.questions.first.specific.solutions = []
        create(:course_assessment_question_multiple_response, assessment: text_response_assessment)

        visit edit_course_assessment_submission_path(course, text_response_assessment,
                                                     text_response_assessment_submission)
        click_button I18n.t('common.submit')
        wait_for_ajax

        click_link I18n.t('course.assessment.answer.autograded.continue')
        second_question = text_response_assessment.reload.questions.second.specific
        expect(page).to have_selector('h3', text: second_question.display_title)
      end
    end

    context 'As a Course Staff' do
      let(:user) { create(:course_teaching_assistant, course: course).user }

      scenario 'I can skip steps' do
        extra_mrq_question

        visit edit_course_assessment_submission_path(course, assessment, submission)
        expect(page).to have_selector('h3', text: mrq_questions.first.display_title)

        click_link '2'
        expect(page).to have_selector('h3', text: mrq_questions.second.display_title)
      end

      scenario "I can grade the student's work" do
        mrq_questions.each { |q| q.attempt(submission).save! }
        submission.finalise!
        submission.save!

        # Create an extra question after submission is submitted, user should still be able to
        # grade the submission in this case.
        extra_mrq_question

        visit edit_course_assessment_submission_path(course, assessment, submission, step: 2)

        no_answer_text = I18n.t('course.assessment.submission.submissions.no_answer')
        expect(page).to have_selector('div.alert', text: no_answer_text)
      end
    end
  end
end
