require 'rails_helper'

RSpec.describe 'Course: Video: Submissions Viewing' do
  let(:instance) { create(:instance, :with_video_component_enabled) }

  with_tenant(:instance) do
    let(:course) { create(:course, :with_video_component_enabled) }
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
        expect(page).to have_no_content_tag_for(staff_submission)

        within find(content_tag_selector(submission)) do
          expect(page).
            to have_text(I18n.t('course.video.submission.submissions.submission.watched'))
        end
        expect(page).
          to have_text(I18n.t('course.video.submission.submissions.submission.not_watched'))
      end
    end
  end
end
