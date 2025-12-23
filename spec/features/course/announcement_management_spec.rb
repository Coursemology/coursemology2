# frozen_string_literal: true
require 'rails_helper'

RSpec.feature 'Course: Announcements', js: true do
  let!(:instance) { Instance.default }

  with_tenant(:instance) do
    let(:course) { create(:course) }
    let!(:not_started_announcement) { create(:course_announcement, :not_started, course: course) }
    let!(:valid_announcement) { create(:course_announcement, course: course) }
    let!(:ended_announcement) { create(:course_announcement, :ended, course: course) }

    before do
      login_as(user, scope: :user)
    end

    context 'As an Course Manager' do
      let(:user) { create(:course_manager, course: course).user }

      scenario 'I can create new announcements' do
        visit course_announcements_path(course)
        find('#new-announcement-button').click
        expect(page).to have_text('New Announcement')

        announcement = build_stubbed(:course_announcement, course: course)
        fill_in 'title', with: announcement.title
        find('#form-dialog-submit-button').click

        expect(page).to have_text(announcement.title)

        expect_toastify('New announcement posted!')

        expect(page).to have_current_path(course_announcements_path(course))
      end

      scenario 'I can edit announcements' do
        announcement = create(:course_announcement, course: course)
        visit course_announcements_path(course)

        find("#announcement-edit-button-#{announcement.id}").click

        fill_in 'title', with: 'long string' * 100
        find('#form-dialog-update-button').click
        expect_toastify('Failed to update the announcement')
        expect(page).to have_selector('#form-dialog-update-button')

        new_title = 'New Title'
        fill_in 'title', with: new_title
        find('#form-dialog-update-button').click

        expect(page).to have_current_path(course_announcements_path(course))
        within find("#announcement-#{announcement.id}") do
          expect(page).to have_text(new_title)
        end
      end

      scenario 'I can see all existing announcements' do
        visit course_announcements_path(course)
        expect(page).to have_selector('#new-announcement-button')

        [not_started_announcement, valid_announcement, ended_announcement].each do |announcement|
          expect(page).to have_selector("#announcement-#{announcement.id}")
          expect(page).to have_selector("#announcement-edit-button-#{announcement.id}")
          expect(page).to have_selector("#announcement-delete-button-#{announcement.id}")
        end
      end

      scenario 'I can delete an existing announcement' do
        announcement = create(:course_announcement, course: course)
        visit course_announcements_path(course)

        find("#announcement-delete-button-#{announcement.id}").click
        click_button('Delete')

        expect(page).not_to have_selector("#announcement-#{announcement.id}")
        expect(page).not_to have_selector("#announcement-edit-button-#{announcement.id}")
        expect(page).not_to have_selector("#announcement-delete-button-#{announcement.id}")

        expect_toastify('Announcement was successfully deleted.')
      end
    end

    context 'As an Course Student' do
      let(:user) { create(:course_student, course: course).user }

      scenario 'I can view the Announcement Sidebar item' do
        visit course_path(course)

        expect(find_sidebar).to have_selector('#sidebar_item_announcements')
      end

      scenario 'I can see the started announcements' do
        visit course_announcements_path(course)

        # Cannot create new announcement
        expect(page).not_to have_selector('#new-announcement-button')

        [valid_announcement, ended_announcement].each do |announcement|
          expect(page).to have_selector("#announcement-#{announcement.id}")
          # Cannot edit or delete announcements
          expect(page).not_to have_selector("#announcement-edit-button-#{announcement.id}")
          expect(page).not_to have_selector("#announcement-delete-button-#{announcement.id}")
        end

        # Cannot see announcements that have not started
        expect(page).not_to have_selector("#announcement-#{not_started_announcement.id}")
      end
    end
  end
end
