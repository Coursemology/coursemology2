# frozen_string_literal: true
require 'rails_helper'

RSpec.describe 'Course: Assessment: Submissions: Guided' do
  let(:instance) { create(:instance) }

  with_tenant(:instance) do
    let(:course) { create(:course) }
    let(:assessment) { create(:assessment, :guided, course: course) }
    let(:mcq_questions) do
      create_list(:course_assessment_question_multiple_response, 2, assessment: assessment)
    end
    before { login_as(user, scope: :user) }

    let(:student) { create(:course_user, :approved, course: course).user }
    let(:submission) do
      create(:course_assessment_submission, assessment: assessment, user: student)
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
        expect(page).to have_selector('h2', assessment.questions.first.title)

        click_link '2'
        expect(page).to have_selector('h2', assessment.questions.second.title)
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
        expect(page).to have_selector('h2', mcq_questions.second.title)
      end

      scenario 'I can reattempt the question when current answer is not correct' do
        mcq_questions

        visit edit_course_assessment_submission_path(assessment.course, assessment, submission)

        wrong_option = mcq_questions.first.options.where(correct: false).first.option
        check wrong_option
        click_button I18n.t('common.submit')
        wait_for_job

        click_button I18n.t('course.assessment.answer.guided.reattempt')
        expect(page).to have_selector('h2', mcq_questions.first.title)
        expect(page).not_to have_checked_field(wrong_option)
      end
    end
  end
end
