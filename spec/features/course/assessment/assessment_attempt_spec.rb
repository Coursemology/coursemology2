# frozen_string_literal: true
require 'rails_helper'

RSpec.describe 'Course: Assessments: Attempt' do
  let(:instance) { Instance.default }

  with_tenant(:instance) do
    let(:course) { create(:course) }
    let(:empty_assessment) { create(:assessment, course: course, published: false) }
    let(:not_started_assessment) do
      create(:assessment, :published_with_all_question_types, :not_started, course: course)
    end
    let(:assessment) { create(:assessment, :published_with_all_question_types, course: course) }
    let(:assessment_tabbed_single_question) do
      create(:assessment, :published_with_mcq_question, course: course, tabbed_view: true)
    end
    let(:assessment_tabbed) do
      assessment =
        create(:assessment, :published_with_mcq_question, course: course, tabbed_view: true)
      create(:course_assessment_question_programming, assessment: assessment)
      assessment.reload
    end
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

    let(:student) { create(:course_student, course: course).user }
    let(:submission) { create(:submission, assessment: assessment, creator: student) }
    let(:submitted_submission) do
      create(:submission, :submitted, assessment: assessment, creator: student)
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
          find_link(I18n.t('course.assessment.assessments.assessment_management_buttons.attempt'),
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
          find_link(I18n.t('course.assessment.assessments.assessment_management_buttons.attempt'),
                    href: course_assessment_submissions_path(course, assessment)).click
        end

        created_submission = assessment.submissions.last
        expect(current_path).
          to eq(edit_course_assessment_submission_path(course, assessment, created_submission))
      end

      scenario 'I cannot attempt assessments that have not started' do
        not_started_assessment
        visit course_assessments_path(course)

        within find(content_tag_selector(not_started_assessment)) do
          expect(page).not_to have_button(
            I18n.t('course.assessment.assessments.assessment_management_buttons.attempt')
          )
        end
      end

      pending 'I can view tabbed assessments and tabs for assessments with more than 1 question,'\
               'and view tabs directly through a URL',
               js: true do
        assessment_tabbed_single_question
        visit course_assessments_path(course)

        within find(content_tag_selector(assessment_tabbed_single_question)) do
          find_link(
            I18n.t('course.assessment.assessments.assessment_management_buttons.attempt'),
            href: course_assessment_submissions_path(course, assessment_tabbed_single_question)
          ).trigger('click')
        end

        expect(page).not_to have_selector('ul.nav.nav-tabs.tab-header')

        assessment_tabbed
        visit course_assessments_path(course)

        within find(content_tag_selector(assessment_tabbed)) do
          find_link(
            I18n.t('course.assessment.assessments.assessment_management_buttons.attempt'),
            href: course_assessment_submissions_path(course, assessment_tabbed)
          ).trigger('click')
        end

        # Test that tabs are visible, and the first tab is loaded.
        expect(page).to have_selector('ul.nav.nav-tabs.tab-header')
        expect(page).to have_selector('.tab-pane.active')

        # Click on tab of second question
        question_id = assessment_tabbed.questions.second.id
        find(".tab-header a[href='##{question_id}']").click

        # Test that ACE Editor has initialised correctly and the content is shown.
        expect(page).to have_selector('div.ace_editor')
        expect(find('.tab-pane.active')['id']).to eq(question_id.to_s)

        # Test that the step parameter when editing submissions goes straight to the question
        # Visit the 2nd question directly with the URL to test this.
        submission = Course::Assessment::Submission.
                     where(assessment: assessment_tabbed, creator: user).first

        visit edit_course_assessment_submission_path(course, assessment_tabbed, submission, step: 2)
        expect(find('.tab-pane.active')['id']).to eq(question_id.to_s)
      end

      scenario 'I can continue my attempt' do
        submission
        visit course_assessments_path(course)

        submission_path = edit_course_assessment_submission_path(course, assessment, submission)
        expect(page).to have_link(
          I18n.t('course.assessment.assessments.assessment_management_buttons.resume'),
          href: submission_path
        )
      end

      pending 'I can view my submission statistics' do
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

        # Check that publisher is set
        expect(page).to have_selector('.statistics', text: submission.publisher.name)
      end
    end

    context 'As a Course Staff' do
      let(:user) { create(:course_teaching_assistant, course: course).user }

      scenario 'I can attempt unsatisfied submission' do
        assessment_with_condition
        visit course_assessments_path(course)

        within find(content_tag_selector(assessment_with_condition)) do
          find_link(I18n.t('course.assessment.assessments.assessment_management_buttons.attempt'),
                    href: course_assessment_submissions_path(course, assessment_with_condition)).
            click
        end

        created_submission = assessment_with_condition.submissions.last
        expect(current_path).to eq(edit_course_assessment_submission_path(
                                     course, assessment_with_condition, created_submission
        ))
      end

      scenario 'I can attempt assessments that have not started' do
        not_started_assessment
        visit course_assessments_path(course)

        within find(content_tag_selector(not_started_assessment)) do
          find_link(I18n.t('course.assessment.assessments.assessment_management_buttons.attempt'),
                    href: course_assessment_submissions_path(course, not_started_assessment)).click
        end

        created_submission = not_started_assessment.submissions.last
        expect(current_path).to eq(
          edit_course_assessment_submission_path(course, not_started_assessment, created_submission)
        )
      end

      pending "I can evaluate the student's work", js: true do
        assessment.questions.attempt(submission).each(&:save!)
        submission.points_awarded = nil
        submission.finalise!
        submission.save!

        visit edit_course_assessment_submission_path(course, assessment, submission)

        # Auto grade where possible. There's one MRQ so it should be gradable.
        click_link I18n.t('course.assessment.submission.submissions.buttons.evaluate_answers')
        wait_for_job

        expect(submission.answers.map(&:reload).all?(&:evaluated?)).to be(true)

        # This field should be filled when page loads
        correct_exp = (assessment.base_exp * submission.grade /
          assessment.questions.map(&:maximum_grade).sum).to_i
        expect(find_field('submission_draft_points_awarded').value).to eq(correct_exp.to_s)

        submission_maximum_grade = 0
        submission.answers.each do |answer|
          within find(content_tag_selector(answer)) do
            fill_in find('input.form-control.grade')[:name], with: answer.question.maximum_grade
            submission_maximum_grade += answer.question.maximum_grade
          end
        end

        # This field should be automatically filled
        expect(find_field('submission_draft_points_awarded').value).to eq(assessment.base_exp.to_s)

        # Test EXP multiplier
        multiplier = 0.5
        within('div.exp-multiplier') do
          find('input').set multiplier
        end
        new_exp = (assessment.base_exp * multiplier).to_i
        expect(find_field('submission_draft_points_awarded').value).to eq(new_exp.to_s)

        click_button I18n.t('course.assessment.submission.submissions.buttons.publish')
        expect(current_path).to eq(
          edit_course_assessment_submission_path(course, assessment, submission)
        )
        expect(submission.reload.published?).to be(true)
        expect(submission.grade).to eq(submission_maximum_grade)
        expect(submission.points_awarded).to eq(new_exp)
      end

      pending 'I can unsubmit a submitted or published submission' do
        # Submitted submission
        assessment.questions.attempt(submission).each(&:save!)
        submission.finalise!
        submission.save!

        visit edit_course_assessment_submission_path(course, assessment, submission)

        click_button I18n.t('course.assessment.submission.submissions.buttons.unsubmit')
        expect(submission.reload.attempting?).to be_truthy
        expect(submission.points_awarded).to be_nil
        expect(submission.reload.latest_answers.all?(&:attempting?)).to be_truthy

        # Published submission
        submission.finalise!
        submission.publish!
        submission.save!

        visit edit_course_assessment_submission_path(course, assessment, submission)

        click_button I18n.t('course.assessment.submission.submissions.buttons.unsubmit')
        expect(submission.reload.attempting?).to be_truthy
        expect(submission.points_awarded).to be_nil
        expect(submission.latest_answers.all?(&:attempting?)).to be_truthy
      end
    end
  end
end
