# frozen_string_literal: true
require 'rails_helper'

RSpec.describe 'Course: Video: Submissions Viewing', js: true do
  let(:instance) { create(:instance) }

  with_tenant(:instance) do
    let(:course) { create(:course) }
    let(:video) { create(:video, :published, course: course) }
    before { login_as(user, scope: :user) }

    context 'As a Course Manager' do
      let(:course_manager) { create(:course_manager, course: course) }
      let(:user) { course_manager.user }

      scenario 'I can view all submissions' do
        students = create_list(:course_student, 2, course: course)
        submission = create(:video_submission, video: video, course_user: students.first,
                                               creator: students.first.user)
        staff_submission = create(:video_submission, video: video, course_user: course_manager,
                                                     creator: course_manager.user)

        visit course_video_submissions_path(course, video)

        # Submissions page should not have show staff submissions.
        expect(page).not_to have_selector("tr.course_user_#{course_manager.id}")
        expect(page).not_to have_link('Watched', href: course_video_submission_path(course, video, staff_submission))

        within find("tr.course_user_#{students.first.id}") do
          expect(page).to have_text('Watched')
          expect(page).to have_link('Watched', href: course_video_submission_path(course, video, submission))
        end
        within find("tr.course_user_#{students.second.id}") do
          expect(page).to have_text('Has Not Started')
        end
      end
    end
  end
end
