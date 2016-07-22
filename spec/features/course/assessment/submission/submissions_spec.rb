# frozen_string_literal: true
require 'rails_helper'

RSpec.describe 'Course: Assessment: Submissions: Submissions' do
  let(:instance) { create(:instance) }

  with_tenant(:instance) do
    let(:course) { create(:course) }
    let(:assessment) { create(:assessment, :with_all_question_types, course: course) }
    before { login_as(user, scope: :user) }

    let(:students) { create_list(:course_student, 3, course: course) }
    let(:phantom_student) { create(:course_student, :phantom, course: course) }
    let!(:submitted_submission) do
      create(:course_assessment_submission, :submitted, assessment: assessment,
                                                        course: course,
                                                        creator: students[0].user)
    end
    let!(:attempting_submission) do
      create(:course_assessment_submission, :attempting, assessment: assessment,
                                                         course: course,
                                                         creator: students[1].user)
    end
    let!(:graded_submission) do
      create(:course_assessment_submission, :graded, assessment: assessment,
                                                     course: course,
                                                     creator: students[2].user)
    end

    context 'As a Course Staff' do
      let(:course_staff) { create(:course_manager, course: course).user }
      let(:user) { course_staff }

      scenario 'I can view all submissions of an assessment' do
        phantom_student
        visit course_assessment_submissions_path(course, assessment)

        expect(page).
          to have_text(I18n.t('course.assessment.submission.submissions.index.student_header'))
        expect(page).
          to have_text(I18n.t('course.assessment.submission.submissions.index.other_header'))

        [submitted_submission, attempting_submission, graded_submission].each do |submission|
          within find(content_tag_selector(submission)) do
            expect(page).to have_text(submission.workflow_state.capitalize)
            expect(page).to have_text(submission.points_awarded)
          end
        end

        # Phantom student did not attempt submissions
        expect(page).to have_tag('tr.no-submission', count: 1)
      end
    end
  end
end
