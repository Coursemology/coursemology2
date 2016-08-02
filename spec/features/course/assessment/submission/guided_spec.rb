# frozen_string_literal: true
require 'rails_helper'

RSpec.describe 'Course: Assessment: Submissions: Guided' do
  let(:instance) { create(:instance) }

  with_tenant(:instance) do
    let(:course) { create(:course) }
    let(:assessment) do
      create(:assessment, :guided, :published_with_mrq_question, course: course)
    end
    let(:mrq_questions) { assessment.reload.questions.map(&:specific) }
    let(:extra_mrq_question) do
      create(:course_assessment_question_multiple_response, assessment: assessment)
    end
    before { login_as(user, scope: :user) }

    let(:student) { create(:course_user, :approved, course: course).user }
    let(:submission) do
      create(:course_assessment_submission, assessment: assessment, creator: student)
    end

    context 'As a Course Student' do
      let(:user) { student }

      scenario 'I can save my submission' do
        visit edit_course_assessment_submission_path(course, assessment, submission)

        option = mrq_questions.first.options.first.option
        check option
        click_button I18n.t('common.save')

        expect(page).to have_selector('div.alert-success',
                                      text: 'course.assessment.submission.submissions.update.'\
                                            'success')
        expect(page).to have_checked_field(option)
      end

      scenario 'I can navigate between questions' do
        extra_mrq_question

        # Add a correct answer to the first question
        answer = mrq_questions.first.attempt(submission)
        answer.correct = true
        answer.save

        visit edit_course_assessment_submission_path(course, assessment, submission)

        (1..assessment.questions.length).each do |step|
          path = edit_course_assessment_submission_path(course, assessment, submission, step: step)
          expect(page).to have_link(step, href: path)
        end
        expect(page).to have_selector('h2', text: mrq_questions.first.title)

        click_link '2'
        expect(page).to have_selector('h2', text: mrq_questions.second.title)
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

        click_link I18n.t('course.assessment.answer.guided.continue')
        expect(page).to have_selector('h2', text: mrq_questions.second.title)
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
        expect(page).to have_selector('h2', text: mrq_questions.first.title)
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
        expect(page).to have_selector('h2', text: mrq_questions.first.title)
        expect(page).to have_checked_field(correct_option)
        expect(page).to have_selector('.btn', text: I18n.t('common.submit'))
      end

      scenario 'I can finalise my submission for auto grading' do
        assessment.autograded = true
        assessment.save!
        visit edit_course_assessment_submission_path(assessment.course, assessment, submission)
        click_button I18n.t('course.assessment.submission.submissions.guided.finalise')
        expect(page).
          to have_selector('div', text: 'course.assessment.submission.submissions.update.finalise')

        wait_for_job
        visit current_path
        expect(page).to have_selector('td', text: 'graded')
      end
    end

    context 'As a Course Staff' do
      let(:user) { create(:course_teaching_assistant, course: course).user }

      scenario "I can grade the student's work" do
        mrq_questions.each { |q| q.attempt(submission).save! }
        submission.finalise!
        submission.save!

        visit edit_course_assessment_submission_path(course, assessment, submission)

        click_link I18n.t('course.assessment.submission.submissions.guided.auto_grade')
        wait_for_job

        click_button I18n.t('course.assessment.submission.submissions.guided.publish')
        expect(current_path).
          to eq(edit_course_assessment_submission_path(course, assessment, submission))
        expect(submission.reload.graded?).to be(true)
      end
    end
  end
end
