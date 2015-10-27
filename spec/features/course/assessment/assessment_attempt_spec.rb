require 'rails_helper'

RSpec.describe 'Course: Assessments: Attempt' do
  let(:instance) { create(:instance) }

  with_tenant(:instance) do
    let(:course) { create(:course) }
    let(:empty_assessment) { create(:assessment, course: course) }
    let(:unopened_assessment) do
      create(:assessment, :with_all_question_types, :unopened, course: course)
    end
    let(:assessment) { create(:assessment, :with_all_question_types, course: course) }
    before { login_as(user, scope: :user) }

    let(:student) { create(:course_user, :approved, course: course).user }
    let(:submission) do
      create(:course_assessment_submission, assessment: assessment, user: student)
    end

    context 'As a Course Student' do
      let(:user) { student }

      scenario 'I cannot attempt empty assessments' do
        empty_assessment
        visit course_assessments_path(course)

        within find(content_tag_selector(empty_assessment)) do
          find_button(I18n.t('course.assessment.assessments.assessment.attempt')).click
        end

        expect(page.status_code).to eq(422)
      end

      scenario 'I can attempt non-empty assessments' do
        assessment
        visit course_assessments_path(course)

        within find(content_tag_selector(assessment)) do
          find_button(I18n.t('course.assessment.assessments.assessment.attempt')).click
        end

        created_submission = assessment.submissions.last
        expect(current_path).to eq(edit_course_assessment_submission_path(
                                     course, assessment, created_submission))
      end

      scenario 'I cannot attempt unopened assessments' do
        unopened_assessment
        visit course_assessments_path(course)

        within find(content_tag_selector(unopened_assessment)) do
          expect(page).not_to have_button(
            I18n.t('course.assessment.assessments.assessment.attempt'))
        end
      end

      scenario 'I can save submissions' do
        submission
        visit edit_course_assessment_submission_path(course, assessment, submission)

        click_button I18n.t('common.save')
        expect(current_path).to eq(\
          edit_course_assessment_submission_path(course, assessment, submission))
      end

      scenario 'I can continue my attempt' do
        submission
        visit course_assessments_path(course)

        submission_path = edit_course_assessment_submission_path(course, assessment, submission)
        expect(page).to have_link(I18n.t('course.assessment.assessments.assessment.attempt'),
                                  href: submission_path)
      end

      scenario 'I can finalise my attempt' do
        submission
        visit edit_course_assessment_submission_path(course, assessment, submission)

        click_button I18n.t('course.assessment.submissions.edit.finalise')
        expect(current_path).to eq(\
          edit_course_assessment_submission_path(course, assessment, submission))
        expect(submission.reload.submitted?).to be(true)
      end
    end

    context 'As a Course Staff' do
      let(:user) { create(:course_teaching_assistant, :approved, course: course).user }

      scenario "I can grade the student's work" do
        assessment.questions.attempt(submission).each(&:save!)
        submission.finalise!

        visit edit_course_assessment_submission_path(course, assessment, submission)
        submission_maximum_grade = 0
        submission.answers.each do |answer|
          within find(content_tag_selector(answer)) do
            fill_in find('input.form-control')[:name], with: answer.question.maximum_grade
            submission_maximum_grade += answer.question.maximum_grade
          end
        end

        click_button I18n.t('course.assessment.submissions.edit.publish')
        expect(current_path).to eq(\
          edit_course_assessment_submission_path(course, assessment, submission))
        expect(submission.reload.graded?).to be(true)
        expect(submission.grade).to eq(submission_maximum_grade)
      end
    end
  end
end
