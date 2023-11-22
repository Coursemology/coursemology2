# frozen_string_literal: true
require 'rails_helper'

RSpec.describe 'Course: Videos: Viewing', js: true do
  let!(:instance) { create(:instance) }

  with_tenant(:instance) do
    let!(:course) { create(:course) }
    let(:unpublished_video) { create(:video, course: course) }
    let(:published_video) { create(:video, :published, course: course) }
    let(:published_not_started_video) { create(:video, :published, :not_started, course: course) }
    let(:videos) { [unpublished_video, published_video, published_not_started_video] }
    before { login_as(user, scope: :user) }

    context 'As a Course Student' do
      let(:user) { create(:course_student, course: course).user }

      scenario 'I can view published videos and attempt these videos from the videos page' do
        videos
        visit course_videos_path(course)

        expect(page).to have_link(published_video.title, href: course_video_path(course, published_video))
        expect(page).to have_link(published_not_started_video.title,
                                  href: course_video_path(course, published_not_started_video))
        expect(page).not_to have_link(unpublished_video.title, href: course_video_path(course, unpublished_video))

        within find("tr.video_#{published_not_started_video.id}") do
          expect(page).to have_button('Watch', disabled: true)
        end

        within find("tr.video_#{published_video.id}") do
          expect(page).to have_button('Watch', disabled: false)
          find_button('Watch').click
          wait_for_page
          submission = Course::Video::Submission.where(video: published_video, creator: user).first

          expect(current_path).
            to eq(edit_course_video_submission_path(course, published_video, submission))
        end

        # Button is updated when submission exists
        visit course_videos_path(course)
        within find("tr.video_#{published_video.id}") do
          expect(page).to have_button('Rewatch', disabled: false)
          find_button('Rewatch').click
        end
        expect(page).to have_selector('#video-component')
      end
    end
  end
end
