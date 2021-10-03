# frozen_string_literal: true
require 'rails_helper'

RSpec.describe 'Course: Assessment: Submissions: Submissions', js: true do
  let(:instance) { Instance.default }

  with_tenant(:instance) do
    let(:course) { create(:course) }
    let(:assessment) { create(:assessment, :with_all_question_types, course: course) }
    before { login_as(user, scope: :user) }

    let(:students) { create_list(:course_student, 4, course: course) }
    let(:phantom_student) { create(:course_student, :phantom, course: course) }
    let!(:submitted_submission) do
      create(:submission, :submitted,
             assessment: assessment, course: course, creator: students[0].user)
    end
    let!(:attempting_submission) do
      create(:submission, :attempting,
             assessment: assessment, course: course, creator: students[1].user)
    end
    let!(:published_submission) do
      create(:submission, :published,
             assessment: assessment, course: course, creator: students[2].user)
    end
    let!(:graded_submission) do
      create(:submission, :graded, assessment: assessment, course: course,
                                   creator: students[3].user)
    end

    context 'As a Course Staff' do
      let(:course_staff) { create(:course_teaching_assistant, course: course) }
      let(:user) { course_staff.user }
      let(:group_student) do
        # Create a group and add staff and student to group
        group = create(:course_group, course: course)
        create(:course_group_manager, course: course, group: group, course_user: course_staff)
        create(:course_group_student, course: course, group: group, course_user: students.sample)
      end

      scenario 'I can view all submissions of an assessment' do
        phantom_student
        group_student
        visit course_assessment_submissions_path(course, assessment)

        expect(page).to have_text(/My Students/i)
        expect(page).to have_text(/Students/i)
        expect(page).to have_text(/Others/i)

        find('#students-tab').click

        [submitted_submission, attempting_submission, published_submission, graded_submission].
          each do |submission|
          expect(page).to have_text(submission.course_user.name)
          if submission.current_points_awarded
            expect(page).to have_text(submission.current_points_awarded)
          end
        end

        # Phantom student did not attempt submissions
        find('#others-tab').click
        expect(page).to have_text(phantom_student.name)
        expect(page).to have_text('Not Started')
      end
    end

    context 'As a Course Manager' do
      let(:assessment) do
        create(:assessment, :with_all_question_types, :delay_grade_publication, course: course)
      end
      let(:user) { create(:course_manager, course: course).user }

      scenario 'I can publish all graded exams' do
        visit course_assessment_submissions_path(course, assessment)

        find('#students-tab').click

        expect(page).to have_text('Graded but not published')
        click_button('Publish Grades')
        accept_confirm_dialog
        expect(page).not_to have_text('Graded but not published')

        expect(graded_submission.reload).to be_published
        expect(graded_submission.publisher).to eq(user)
        expect(graded_submission.published_at).to be_present
        expect(graded_submission.awarder).to be_present
        expect(graded_submission.awarded_at).to be_present
        expect(graded_submission.draft_points_awarded).to be_nil
        expect(graded_submission.points_awarded).not_to be_nil
      end
    end
  end
end
