# frozen_string_literal: true
require 'rails_helper'

RSpec.describe 'Course: Assessment: Submissions: Guided' do
  let(:instance) { create(:instance) }

  with_tenant(:instance) do
    let(:course) { create(:course) }
    let(:assessment) do
      create(:assessment, :guided, :published_with_mcq_question, :with_mcq_question, course: course)
    end
    let(:mcq_questions) { assessment.questions.map(&:specific) }
    before { login_as(user, scope: :user) }

    let(:student) { create(:course_user, :approved, course: course).user }
    let(:submission) do
      create(:course_assessment_submission, assessment: assessment, creator: student)
    end

    context 'As a Course Student' do
      let(:user) { student }

      scenario 'I can save my submission' do
        mcq_questions

        visit edit_course_assessment_submission_path(course, assessment, submission)

        option = assessment.questions.first.actable.options.first.option
        check option
        click_button I18n.t('common.save')

        expect(page).to have_selector('div.alert-success',
                                      text: 'course.assessment.submission.submissions.update.'\
                                            'success')
        expect(page).to have_checked_field(option)
      end

      scenario 'I can navigate between questions' do
        mcq_questions

        # Add a correct answer to the first question
        answer = assessment.questions.first.attempt(submission)
        answer.correct = true
        answer.save

        visit edit_course_assessment_submission_path(course, assessment, submission)

        (1..assessment.questions.length).each do |step|
          path = edit_course_assessment_submission_path(course, assessment, submission, step: step)
          expect(page).to have_link(step, href: path)
        end
        expect(page).to have_selector('h2', text: assessment.questions.first.title)

        click_link '2'
        expect(page).to have_selector('h2', text: assessment.questions.second.title)
      end

      scenario 'I can continue to the next question when current answer is correct' do
        mcq_questions

        visit edit_course_assessment_submission_path(course, assessment, submission)
        correct_option = mcq_questions.first.options.correct.first.option
        check correct_option

        click_button I18n.t('common.submit')
        wait_for_job
        expect(page).to have_selector('div', text: 'course.assessment.answer.grading.grading')
        expect(page).to have_selector('div', text: 'course.assessment.answer.grading.grade')

        click_link I18n.t('course.assessment.answer.guided.continue')
        expect(page).to have_selector('h2', text: mcq_questions.second.title)
      end

      scenario 'I can reattempt the question when current answer is not correct' do
        mcq_questions

        visit edit_course_assessment_submission_path(assessment.course, assessment, submission)

        wrong_option = mcq_questions.first.options.where(correct: false).first.option
        check wrong_option
        click_button I18n.t('common.submit')
        wait_for_job

        click_button I18n.t('course.assessment.answer.guided.reattempt')
        expect(page).to have_selector('h2', text: mcq_questions.first.title)
        expect(page).not_to have_checked_field(wrong_option)
      end

      scenario 'I can finalise my submission' do
        answers = mcq_questions.map { |q| q.attempt(submission) }
        answers.each do |answer|
          answer.finalise!
          answer.publish!
          answer.correct = true
          answer.save!
        end

        visit edit_course_assessment_submission_path(assessment.course, assessment, submission)
        click_button I18n.t('course.assessment.submission.submissions.guided_form.finalise')

        # It redirects to the first question after finalising.
        question = mcq_questions.first
        expect(page).to have_selector('h2', text: question.title)
        expect(page).to have_selector('div', text: question.description)
      end
    end

    context 'As a Course Staff' do
      let(:user) { create(:course_teaching_assistant, course: course).user }

      scenario "I can grade the student's work" do
        mcq_questions.each { |q| q.attempt(submission).save! }
        submission.finalise!
        submission.save!

        visit edit_course_assessment_submission_path(course, assessment, submission)

        click_link I18n.t('course.assessment.submission.submissions.guided_form.auto_grade')
        wait_for_job

        click_button I18n.t('course.assessment.submission.submissions.guided_form.publish')
        expect(current_path).
          to eq(edit_course_assessment_submission_path(course, assessment, submission))
        expect(submission.reload.graded?).to be(true)
      end
    end
  end
end
