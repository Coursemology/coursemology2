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

      scenario 'I can view all published videos on the videos page' do
        videos
        visit course_videos_path(course)

        [published_video, published_not_started_video].each do |video|
          expect(page).to have_content_tag_for(video)
        end

        expect(page).not_to have_content_tag_for(unpublished_video)
      end
    end
  end
end
