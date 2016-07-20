# frozen_string_literal: true
require 'rails_helper'

RSpec.describe 'Course: Assessments: Attempt' do
  let(:instance) { create(:instance) }

  with_tenant(:instance) do
    let(:course) { create(:course) }
    let(:empty_assessment) { create(:assessment, course: course, draft: true) }
    let(:unopened_assessment) do
      create(:assessment, :published_with_all_question_types, :unopened, course: course)
    end
    let(:assessment) { create(:assessment, :published_with_all_question_types, course: course) }
    let(:assessment_with_condition) do
      assessment_with_condition = create(:assessment, :published_with_all_question_types,
                                         course: course)
      create(:assessment_condition,
             course: course,
             assessment: assessment,
             conditional: assessment_with_condition)
      assessment_with_condition
    end

    before { login_as(user, scope: :user) }

    let(:student) { create(:course_user, :approved, course: course).user }
    let(:submission) do
      create(:course_assessment_submission, assessment: assessment, creator: student)
    end
    let(:submitted_submission) do
      create(:course_assessment_submission, :submitted, assessment: assessment, creator: student)
    end
    let(:points_awarded) { 22 }

    context 'As a Course Student' do
      let(:user) { student }

      scenario 'I cannot see draft assessments which are empty' do
        empty_assessment
        visit course_assessments_path(course)

        expect(page).not_to have_content_tag_for(empty_assessment)
      end

      scenario 'I cannot attempt unsatisfied assessments' do
        assessment_with_condition
        visit course_assessments_path(course)

        within find(content_tag_selector(assessment_with_condition)) do
          expect(page).not_to have_button(
            I18n.t('course.assessment.assessments.assessment.attempt')
          )
        end
      end

      scenario 'I can attempt satisfied assessments' do
        submitted_submission
        assessment_with_condition
        visit course_assessments_path(course)

        within find(content_tag_selector(assessment_with_condition)) do
          find_link(I18n.t('course.assessment.assessments.assessment.attempt'),
                    href: course_assessment_submissions_path(course, assessment_with_condition)).
            click
        end

        created_submission = assessment_with_condition.submissions.last
        expect(current_path).to eq(edit_course_assessment_submission_path(
                                     course, assessment_with_condition, created_submission
        ))
      end

      scenario 'I can attempt non-empty assessments' do
        assessment
        visit course_assessments_path(course)

        within find(content_tag_selector(assessment)) do
          find_link(I18n.t('course.assessment.assessments.assessment.attempt'),
                    href: course_assessment_submissions_path(course, assessment)).click
        end

        created_submission = assessment.submissions.last
        expect(current_path).
          to eq(edit_course_assessment_submission_path(course, assessment, created_submission))
      end

      scenario 'I cannot attempt unopened assessments' do
        unopened_assessment
        visit course_assessments_path(course)

        within find(content_tag_selector(unopened_assessment)) do
          expect(page).not_to have_button(
            I18n.t('course.assessment.assessments.assessment.attempt')
          )
        end
      end

      scenario 'I can continue my attempt' do
        submission
        visit course_assessments_path(course)

        submission_path = edit_course_assessment_submission_path(course, assessment, submission)
        expect(page).to have_link(I18n.t('course.assessment.assessments.assessment.attempt'),
                                  href: submission_path)
      end

      scenario 'I can view my submission grade' do
        submission.assessment.questions.attempt(submission).each(&:save!)
        submission.finalise!
        submission.publish!
        submission.save!
        visit edit_course_assessment_submission_path(course, assessment, submission)

        submission.answers.each do |answer|
          expect(page).to have_content_tag_for(answer)
          within find(content_tag_selector(answer)) do
            expect(page).to have_selector('.submission_answers_grade')
          end
        end
      end
    end

    context 'As a Course Staff' do
      let(:user) { create(:course_teaching_assistant, :approved, course: course).user }

      scenario 'I can attempt unsatisfied submission' do
        assessment_with_condition
        visit course_assessments_path(course)

        within find(content_tag_selector(assessment_with_condition)) do
          find_link(I18n.t('course.assessment.assessments.assessment.attempt'),
                    href: course_assessment_submissions_path(course, assessment_with_condition)).
            click
        end

        created_submission = assessment_with_condition.submissions.last
        expect(current_path).to eq(edit_course_assessment_submission_path(
                                     course, assessment_with_condition, created_submission
        ))
      end

      scenario 'I can attempt unopened assessments' do
        unopened_assessment
        visit course_assessments_path(course)

        within find(content_tag_selector(unopened_assessment)) do
          find_link(I18n.t('course.assessment.assessments.assessment.attempt'),
                    href: course_assessment_submissions_path(course, unopened_assessment)).click
        end

        created_submission = unopened_assessment.submissions.last
        expect(current_path).to eq(
          edit_course_assessment_submission_path(course, unopened_assessment, created_submission)
        )
      end

      scenario "I can grade the student's work", js: true do
        assessment.questions.attempt(submission).each(&:save!)
        submission.finalise!
        submission.save!

        visit edit_course_assessment_submission_path(course, assessment, submission)

        # Auto grade where possible. There's one MRQ so it should be gradable.
        click_link I18n.t('course.assessment.submission.submissions.worksheet.auto_grade')
        wait_for_job

        expect(submission.answers.map(&:reload).all?(&:graded?)).to be(true)

        submission_maximum_grade = 0
        submission.answers.each do |answer|
          within find(content_tag_selector(answer)) do
            fill_in find('input.form-control.grade')[:name], with: answer.question.maximum_grade
            submission_maximum_grade += answer.question.maximum_grade
          end
        end

        # This field should be automatically filled
        expect(find_field('submission_points_awarded').value).
          to eq(submission.assessment.base_exp.to_s)

        click_button I18n.t('course.assessment.submission.submissions.worksheet.publish')
        expect(current_path).to eq(
          edit_course_assessment_submission_path(course, assessment, submission)
        )
        expect(submission.reload.graded?).to be(true)
        expect(submission.grade).to eq(submission_maximum_grade)
        expect(submission.points_awarded).to eq(submission.assessment.base_exp)
      end
    end
  end
end
