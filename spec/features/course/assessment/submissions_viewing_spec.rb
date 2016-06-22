require 'rails_helper'

RSpec.describe 'Course: Submissions Viewing' do
  let(:instance) { create(:instance) }

  with_tenant(:instance) do
    let(:course) { create(:course) }
    let(:assessment) { create(:course_assessment_assessment, course: course) }
    before { login_as(user, scope: :user) }

    context 'As a Course Manager' do
      let(:user) { create(:course_manager, :approved, course: course).user }
      let(:students) { create_list(:course_student, 3, :approved, course: course) }
      let(:attempting_submission) do
        create(:course_assessment_submission, :attempting, assessment: assessment,
                                                           creator: students[0].user)
      end
      let(:submitted_submission) do
        create(:course_assessment_submission, :submitted, assessment: assessment,
                                                          creator: students[1].user)
      end
      let(:graded_submission) do
        create(:course_assessment_submission, :graded, assessment: assessment,
                                                       creator: students[2].user)
      end
      let!(:submissions) { [attempting_submission, submitted_submission, graded_submission] }

      scenario 'I can view all submitted and graded submissions' do
        visit course_submissions_path(course)

        expect(page).not_to have_content_tag_for(attempting_submission)

        within find(content_tag_selector(submitted_submission)) do
          expect(page).to have_link(
            I18n.t('course.assessment.submissions.submission.grade'),
            href: edit_course_assessment_submission_path(course, assessment, submitted_submission)
          )
        end
        within find(content_tag_selector(graded_submission)) do
          expect(page).to have_link(
            I18n.t('course.assessment.submissions.submission.view'),
            href: edit_course_assessment_submission_path(course, assessment, graded_submission)
          )
        end
      end
    end

    context 'As a Course Student' do
      let(:user) { create(:course_student, :approved, course: course).user }
      let!(:attempting_submission) do
        create(:course_assessment_submission, :attempting, assessment: assessment, creator: user)
      end
      let!(:submitted_submission) do
        create(:course_assessment_submission, :submitted, assessment: assessment, creator: user)
      end
      let!(:graded_submission) do
        create(:course_assessment_submission, :graded, assessment: assessment, creator: user)
      end

      scenario 'I can view my submitted and graded submissions' do
        visit course_submissions_path(course)

        expect(page).not_to have_content_tag_for(attempting_submission)

        [submitted_submission, graded_submission].each do |submission|
          within find(content_tag_selector(submission)) do
            expect(page).to have_link(
              I18n.t('course.assessment.submissions.submission.view'),
              href: edit_course_assessment_submission_path(course, assessment, submission)
            )
          end
        end
      end
    end
  end
end
