# frozen_string_literal: true
require 'rails_helper'

RSpec.describe 'Course: Assessments: Submissions: Programming Answers' do
  let(:instance) { Instance.default }

  with_tenant(:instance) do
    let(:course) { create(:course) }
    let(:assessment) { create(:assessment, :published_with_programming_question, course: course) }
    let(:assessment_2) { create(:assessment, :published_with_programming_question, course: course) }
    let(:submission) do
      create(:submission, *submission_traits, assessment: assessment, creator: user)
    end
    let(:submission_2) do
      create(:submission, *submission_traits_2, assessment: assessment_2, creator: user)
    end
    let(:submission_traits) { nil }
    let(:submission_traits_2) { nil }

    before { login_as(user, scope: :user) }

    context 'As a Course Student' do
      let(:user) { create(:course_student, course: course).user }

      scenario 'I can save my submission', js: true do
        pending 'Removed add/delete file links for CS1010S'
        visit edit_course_assessment_submission_path(course, assessment, submission)

        # Fill in every single successive item
        within find(content_tag_selector(submission.answers.first)) do
          all('div.files div.nested-fields').each_with_index do |file, i|
            within file do
              fill_in 'filename', with: "test #{i}.py"
            end
          end
        end

        click_button I18n.t('course.assessment.submission.submissions.buttons.save')
        expect(current_path).to eq(
          edit_course_assessment_submission_path(course, assessment, submission)
        )

        submission.answers.first.specific.files.reload.each_with_index do |_, i|
          expect(page).to have_field('filename', with: "test #{i}.py")
        end

        # Add a new file
        click_link(I18n.t('course.assessment.answer.programming.programming.add_file'))
        new_file_name = 'new_file.py'
        expected_files = [new_file_name] + submission.answers.first.specific.files.map(&:filename)
        within find(content_tag_selector(submission.answers.first)) do
          within all('div.files div.nested-fields').first do
            fill_in 'filename', with: new_file_name
          end
        end
        click_button I18n.t('course.assessment.submission.submissions.buttons.save')

        expected_files.each do |file|
          expect(page).to have_field('filename', with: file)
        end

        # Delete files
        within find(content_tag_selector(submission.answers.first)) do
          all(:link, I18n.t('course.assessment.answer.programming.file_fields.delete')).
            each(&:click)
        end
        click_button I18n.t('course.assessment.submission.submissions.buttons.save')

        expect(page).not_to have_field('filename')
      end

      pending 'I can only see public test cases but cannot update my finalized submission ' do
        create(:course_assessment_question_programming,
               assessment: assessment, test_case_count: 1, private_test_case_count: 1,
               evaluation_test_case_count: 1)

        visit edit_course_assessment_submission_path(course, assessment, submission)

        expect(page).to have_selector('.code')
        click_button I18n.t('course.assessment.submission.submissions.buttons.finalise')

        within find(content_tag_selector(submission.answers.first)) do
          expect(page).not_to have_selector('.code')
        end

        # Check that student can only see public but not private and evalution test cases.
        expect(page).
          to have_text(I18n.t('course.assessment.answer.programming.test_cases.public'))
        expect(page).
          not_to have_text(I18n.t('course.assessment.answer.programming.test_cases.private'))
        expect(page).
          not_to have_text(I18n.t('course.assessment.answer.programming.test_cases.evaluation'))
      end
    end

    context 'As Course Staff' do
      let(:user) { create(:course_teaching_assistant, course: course).user }
      let(:submission_traits) { :submitted }
      let(:submission_traits_2) { :attempting }

      pending 'I can view the test cases' do
        # View test cases for submitted submission
        visit edit_course_assessment_submission_path(course, assessment, submission)

        within find(content_tag_selector(submission.answers.first)) do
          assessment.questions.first.actable.test_cases.each do |test_case|
            expect(page).to have_content_tag_for(test_case)
          end
        end

        # View test cases for attempting submission
        visit edit_course_assessment_submission_path(course, assessment_2, submission_2)

        within find(content_tag_selector(submission_2.answers.first)) do
          assessment_2.questions.first.actable.test_cases.each do |solution|
            expect(page).to have_content_tag_for(solution)
          end
        end
      end
    end
  end
end
