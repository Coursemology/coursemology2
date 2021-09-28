# frozen_string_literal: true
require 'rails_helper'

RSpec.describe 'Course: Assessment: Submissions: Download', js: true do
  let(:instance) { Instance.default }
  let(:types) { Course::Assessment::Submission::ZipDownloadService::STUDENTS }

  with_tenant(:instance) do
    let(:course) { create(:course) }
    let(:assessment) { create(:assessment, :published_with_all_question_types, course: course) }
    let(:student) { create(:course_student, course: course).user }
    let(:submission) do
      create(:submission, :submitted, assessment: assessment, course: course, creator: student)
    end

    before { login_as(user, scope: :user) }

    context 'As a Course Staff' do
      let(:course_user) { create(:course_teaching_assistant, course: course) }
      let(:user) { course_user.user }

      scenario 'I can download all submissions by non-phantom students' do
        submission
        visit course_assessment_submissions_path(course, assessment)

        find('#students-tab').click
        find('#submission-dropdown-icon').click
        expect(page).to have_css('.download-submissions-enabled')
      end

      context 'when there are staff' do
        let(:course_staff) { create(:course_teaching_assistant, course: course) }
        let!(:staff_submission) do
          create(:submission, :graded, assessment: assessment, course: course,
                                       creator: course_staff.user)
        end

        scenario 'I can download all submissions by phantom students' do
          submission
          visit course_assessment_submissions_path(course, assessment)

          find('#staff-tab').click
          find('#submission-dropdown-icon').click
          expect(page).to have_css('.download-submissions-enabled')
        end
      end

      context 'when there are students in my group' do
        let(:course_student) { create(:course_student, course: course) }
        let(:student) { course_student.user }

        let!(:group_student) do
          group = create(:course_group, course: course)
          create(:course_group_manager, course: course, group: group, course_user: course_user)
          create(:course_group_student, course: course, group: group, course_user: course_student)
        end

        scenario 'I can download all submissions by students in my group' do
          submission
          visit course_assessment_submissions_path(course, assessment)

          find('#my-students-tab').click
          find('#submission-dropdown-icon').click
          expect(page).to have_css('.download-submissions-enabled')
        end
      end

      context 'when there are no confirmed submissions' do
        scenario 'The download button should be disabled' do
          visit course_assessment_submissions_path(course, assessment)

          expect(page).not_to have_css('.download-submissions-enabled')
        end
      end

      context 'when the assessment has no downloadable answers' do
        let(:assessment) { create(:assessment, :published_with_mcq_question, course: course) }

        scenario 'The download button should be disabled' do
          submission
          visit course_assessment_submissions_path(course, assessment)

          expect(page).not_to have_css('.download-submissions-enabled')
        end
      end
    end
  end
end
