# frozen_string_literal: true
require 'rails_helper'

RSpec.feature 'System: Administration: Announcements' do
  let(:instance) { Instance.default }
  with_tenant(:instance) do
    before do
      login_as(user, scope: :user)
    end

    context 'As a system administrator', js: true do
      let(:user) { create(:administrator) }

      scenario 'I can create announcements' do
        visit admin_announcements_path

        find('button#new-announcement-button').click

        announcement = attributes_for(:system_announcement)
        fill_in 'title', with: announcement[:title]
        fill_in_react_ck 'textarea[name="content"]', announcement[:content]

        find('button.btn-submit').click
        expect(current_path).to eq(admin_announcements_path)
        expect(page).to have_selector('h3', text: announcement[:title])
        expect(page).to have_selector('p', text: announcement[:content])
        expect_toastify('New announcement posted!')
      end

      scenario 'I can edit announcements' do
        announcement = create(:system_announcement)
        visit admin_announcements_path
        find("#announcement-edit-button-#{announcement.id}").click

        fill_in 'title', with: ' '
        find('#announcement-form-update-button').click
        expect_toastify('Failed to update the announcement')
        expect(page).to have_selector('#announcement-form-update-button')

        new_title = 'New Title'
        fill_in 'title', with: new_title
        find('#announcement-form-update-button').click

        # Commented due to flaky test
        # expect_toastify('Announcement updated')

        expect(current_path).to eq admin_announcements_path
        within find("#announcement-#{announcement.id}") do
          expect(page).to have_selector('h3', text: new_title)
        end
        expect(announcement.reload.title).to eq(new_title)
      end

      scenario 'I can see all announcements' do
        create_list(:system_announcement, 2)
        announcements = System::Announcement.sorted_by_date.first(2)
        visit admin_announcements_path
        expect(page).to have_selector('#new-announcement-button')

        announcements.each do |announcement|
          expect(page).to have_selector("#announcement-#{announcement.id}")
          expect(page).to have_selector("#announcement-edit-button-#{announcement.id}")
          expect(page).to have_selector("#announcement-delete-button-#{announcement.id}")
        end
      end

      scenario 'I can delete announcements' do
        create(:system_announcement)
        announcement = System::Announcement.sorted_by_date.first
        visit admin_announcements_path

        find("#announcement-delete-button-#{announcement.id}").click
        click_button('Continue')

        expect(page).not_to have_selector("#announcement-#{announcement.id}")
        expect(page).not_to have_selector("#announcement-edit-button-#{announcement.id}")
        expect(page).not_to have_selector("#announcement-delete-button-#{announcement.id}")

        expect_toastify('Announcement was successfully deleted.')
      end
    end
  end
end
