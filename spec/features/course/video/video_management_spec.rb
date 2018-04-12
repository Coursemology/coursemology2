# frozen_string_literal: true
require 'rails_helper'

RSpec.feature 'Course: Videos: Management' do
  let(:instance) { create(:instance, :with_video_component_enabled) }

  with_tenant(:instance) do
    let(:course) { create(:course, :with_video_component_enabled) }
    before { login_as(user, scope: :user) }

    context 'As a Course Teaching Assistant' do
      let(:user) { create(:course_teaching_assistant, course: course).user }

      before do
        # Override the set_duration method to avoid an API call
        Course::Video.class_eval do
          def set_duration
            self.duration = 123
          end
        end
      end

      scenario 'I can create a video' do
        video = build_stubbed(:video)
        visit course_videos_path(course)

        click_link(nil, href: new_course_video_path(course, tab: course.default_video_tab))
        expect(page).to have_selector('h1', text: I18n.t('course.video.videos.new.header'))

        fill_in 'video_title', with: video.title
        select 'default', from: 'video_tab_id'
        fill_in 'video_description', with: video.description
        fill_in 'video_start_at', with: video.start_at
        fill_in 'video_url', with: video.url

        click_button 'submit'

        expect(current_path).to eq(course_videos_path(course))
        expect(page).to have_selector('div.alert.alert-success')

        video_created = course.videos.last
        expect(page).to have_content_tag_for(video_created)
      end

      scenario 'I can edit or delete a video from the videos page' do
        unpublished_video = create(:video, course: course)
        edit_path = edit_course_video_path(course, unpublished_video)

        # Edit video Page
        visit course_videos_path(course)
        within find(content_tag_selector(unpublished_video)) do
          find('.btn.btn-default.edit').click
        end
        expect(current_path).to eq(edit_path)
        new_title = 'zzz'

        fill_in 'video_title', with: new_title
        click_button 'submit'

        expect(unpublished_video.reload.title).to eq(new_title)
        expect(current_path).to eq(course_videos_path(course))

        # Delete video
        expect do
          within find(content_tag_selector(unpublished_video)) do
            find('.btn.btn-danger.delete').click
          end
        end.to change { course.videos.count }.by(-1)
      end
    end
  end
end
