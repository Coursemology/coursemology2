# frozen_string_literal: true
require 'rails_helper'

RSpec.feature 'Course: Videos: Management', js: true do
  let(:instance) { create(:instance) }

  with_tenant(:instance) do
    let(:course) { create(:course) }
    before { login_as(user, scope: :user) }

    context 'As a Course Teaching Assistant' do
      let(:user) { create(:course_teaching_assistant, course: course).user }

      scenario 'I can create a video' do
        video = build_stubbed(:video)
        visit course_videos_path(course)

        click_button 'New Video'
        expect(page).to have_selector('h2', text: 'New Video')
        fill_in 'title', with: video.title
        fill_in_react_ck 'textarea[name=description]', video.description

        find_field('startAt').click.set(video.start_at.strftime('%d/%m/%Y %I:%M'))

        fill_in 'url', with: video.url

        expect do
          find('button.btn-submit').click
          expect(page).not_to have_selector('h2', text: 'New Video')
        end.to change { course.videos.count }.by(1)

        expect_toastify("#{video.title} was created.")

        video_created = course.videos.last
        expect(page).to have_selector("tr.video_#{video_created.id}")
      end

      scenario 'I can edit or delete a video from the videos page' do
        unpublished_video = create(:video, course: course)

        # Edit video Page
        visit course_videos_path(course)
        find("button.video-edit-#{unpublished_video.id}").click

        new_title = 'zzz'

        fill_in 'title', with: new_title
        find('.btn-submit').click

        expect_toastify("#{new_title} has been successfully updated.")

        expect(unpublished_video.reload.title).to eq(new_title)
        within find("tr.video_#{unpublished_video.id}") do
          expect(page).to have_text(new_title)
        end

        # Delete video
        expect do
          find("button.video-delete-#{unpublished_video.id}").click
          accept_prompt
        end.to change { course.videos.count }.by(-1)
      end
    end
  end
end
