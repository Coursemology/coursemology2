# frozen_string_literal: true
require 'rails_helper'

RSpec.describe 'Course: Videos: Viewing' do
  let!(:instance) { create(:instance, :with_video_component_enabled) }

  with_tenant(:instance) do
    let!(:course) { create(:course, :with_video_component_enabled) }
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

        expect(page).not_to have_content_tag_for(unpublished_video)
        expect(page).to have_content_tag_for(published_video)
        expect(page).to have_content_tag_for(published_not_started_video)

        within find(content_tag_selector(published_not_started_video)) do
          expect(page).to have_css('a.btn.btn-info.disabled')
        end

        within find(content_tag_selector(published_video)) do
          find('.btn.btn-info').click

          submission =
            Course::Video::Submission.where(video: published_video, creator: user).first
          expect(current_path).
            to eq(edit_course_video_submission_path(course, published_video, submission))

          expect(page).to have_tag('div', with: { 'id': 'video-component' })
        end

        # Button is updated when submission exists
        visit course_videos_path(course)
        within find(content_tag_selector(published_video)) do
          expect(page).to have_text(I18n.t('course.video.videos.video_attempt_button.rewatch'))
          find('.btn.btn-info').click
        end

        expect(page).to have_tag('div', with: { 'id': 'video-component' })
        data = JSON.parse(page.find('#video-component')['data'])

        expect(data['video']['videoUrl']).to eq(published_video.url)
      end
    end
  end
end
