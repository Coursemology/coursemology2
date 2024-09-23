# frozen_string_literal: true
require 'rails_helper'

RSpec.feature 'System: Administration: Announcements' do
  let(:instance) { Instance.default }
  with_tenant(:instance) do
    let!(:prefix) { "testadm-#{rand(36**12).to_s(36)}-ann-" }
    before do
      login_as(user, scope: :user)
    end

    # For certain tests, use the search box to only show the announcements we created for this test.
    # This is to prevent tests failing if there are so many announcements such that
    # the ones created for this test aren't on the first page.
    def search_for_announcements(query)
      find(
        :xpath,
        # Find the announcements feed, go up to the parent, and select the input text field under it
        # (the Search text field)
        '//div[@id="course-announcements"]/parent::*/descendant::input[@type="text"]'
      ).set('').native.send_keys(query)
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

        expect_toastify('New announcement posted!')
        expect(current_path).to eq(admin_announcements_path)

        search_for_announcements(announcement[:title])
        expect(page).to have_text(announcement[:title])
        expect(page).to have_text(announcement[:content])
      end

      scenario 'I can edit announcements' do
        announcement = create(:system_announcement, prefix: prefix)
        visit admin_announcements_path

        search_for_announcements(announcement.title)
        find("#announcement-edit-button-#{announcement.id}").click

        fill_in 'title', with: 'long string' * 100
        find('#form-dialog-update-button').click
        expect_toastify('Failed to update the announcement')
        expect(page).to have_selector('#form-dialog-update-button')

        new_title = announcement.title.upcase
        fill_in 'title', with: new_title
        find('#form-dialog-update-button').click

        expect_toastify('Announcement updated')
        search_for_announcements(new_title)

        expect(current_path).to eq admin_announcements_path
        within find("#announcement-#{announcement.id}") do
          expect(page).to have_text(new_title)
        end
        expect(announcement.reload.title).to eq(new_title)
      end

      scenario 'I can see all announcements' do
        search_prefix = "testadm-search-#{rand(36**12).to_s(36)}-ann-"
        announcements = create_list(:system_announcement, 2, prefix: search_prefix)
        visit admin_announcements_path
        expect(page).to have_selector('#new-announcement-button')

        search_for_announcements(search_prefix)
        announcements.each do |announcement|
          expect(page).to have_selector("#announcement-#{announcement.id}")
          expect(page).to have_selector("#announcement-edit-button-#{announcement.id}")
          expect(page).to have_selector("#announcement-delete-button-#{announcement.id}")
        end
      end

      scenario 'I can delete announcements' do
        announcement = create(:system_announcement, prefix: prefix)
        visit admin_announcements_path
        search_for_announcements(announcement.title)

        find("#announcement-delete-button-#{announcement.id}").click
        click_button('Delete')

        expect(page).not_to have_selector("#announcement-#{announcement.id}")
        expect(page).not_to have_selector("#announcement-edit-button-#{announcement.id}")
        expect(page).not_to have_selector("#announcement-delete-button-#{announcement.id}")

        expect_toastify('Announcement was successfully deleted.')
      end
    end
  end
end
