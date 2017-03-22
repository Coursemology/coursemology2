# frozen_string_literal: true
require 'rails_helper'

RSpec.describe 'Course: Assessment: Submissions: Download' do
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

        find_link(
          I18n.t('course.assessment.submission.submissions.submissions.download'), href:
          download_all_course_assessment_submissions_path(course, assessment)
        ).click

        wait_for_job

        expect(page.response_headers['Content-Type']).to eq('application/zip')
      end

      context 'when there are phantom students' do
        let(:student) { create(:course_student, :phantom, course: course).user }

        scenario 'I can download all submissions by phantom students' do
          submission
          visit course_assessment_submissions_path(course, assessment)

          find_link(
            I18n.t('course.assessment.submission.submissions.submissions.download'), href:
            download_all_course_assessment_submissions_path(course, assessment,
                                                            students: types[:phantom])
          ).click

          wait_for_job

          expect(page.response_headers['Content-Type']).to eq('application/zip')
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

          find_link(
            I18n.t('course.assessment.submission.submissions.submissions.download'), href:
            download_all_course_assessment_submissions_path(course, assessment,
                                                            students: types[:my])
          ).click

          wait_for_job

          expect(page.response_headers['Content-Type']).to eq('application/zip')
        end
      end

      context 'when there are no confirmed submissions' do
        scenario 'I should not see the download button' do
          visit course_assessment_submissions_path(course, assessment)

          expect(page).not_to have_link(
            I18n.t('course.assessment.submission.submissions.submissions.download'), href:
            download_all_course_assessment_submissions_path(course, assessment)
          )
        end

        scenario 'I should not be able to download a zip file' do
          visit download_all_course_assessment_submissions_path(course, assessment)

          expect(page).to have_text(
            I18n.t('course.assessment.submission.submissions.download_all.no_submissions')
          )
        end
      end

      context 'when the assessment has no downloadable answers' do
        let(:assessment) { create(:assessment, :published_with_mcq_question, course: course) }

        scenario 'I should not see the download button' do
          submission
          visit course_assessment_submissions_path(course, assessment)

          expect(page).not_to have_link(
            I18n.t('course.assessment.submission.submissions.submissions.download'), href:
            download_all_course_assessment_submissions_path(course, assessment)
          )
        end

        scenario 'I should not be able to download a zip file' do
          submission
          visit download_all_course_assessment_submissions_path(course, assessment)

          expect(page).to have_text(
            I18n.t('course.assessment.submission.submissions.download_all.not_downloadable')
          )
        end
      end
    end
  end
end
