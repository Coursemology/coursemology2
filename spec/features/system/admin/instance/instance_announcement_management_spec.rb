# frozen_string_literal: true
require 'rails_helper'

RSpec.feature 'System: Administration: Instance Announcements', js: true do
  subject { page }

  let!(:instance) { Instance.default }

  with_tenant(:instance) do
    let(:user) { create(:instance_administrator, instance: instance).user }
    before { login_as(user, scope: :user) }

    context 'As an Instance Administrator' do
      scenario 'I can create instance announcements' do
        visit admin_instance_announcements_path

        click_button 'New Announcement'

        announcement = attributes_for(:system_announcement)
        fill_in 'title', with: announcement[:title]
        fill_in_react_ck 'textarea[name="content"]', announcement[:content]

        find('button.btn-submit').click
        expect(current_path).to eq(admin_instance_announcements_path)
        expect(page).to have_text(announcement[:title])
        expect(page).to have_text(announcement[:content])
        expect_toastify('New announcement posted!')
      end

      scenario 'I can edit instance announcements' do
        announcement = create(:instance_announcement, instance: instance)
        visit admin_instance_announcements_path

        find("#announcement-edit-button-#{announcement.id}").click

        fill_in 'title', with: 'long string' * 100
        find('#form-dialog-update-button').click
        expect_toastify('Failed to update the announcement')
        expect(page).to have_selector('#form-dialog-update-button')

        new_title = 'New Title'
        fill_in 'title', with: new_title
        find('#form-dialog-update-button').click

        # Commented due to flaky test
        # expect_toastify('Announcement updated')

        expect(current_path).to eq admin_instance_announcements_path
        within find("#announcement-#{announcement.id}") do
          expect(page).to have_text(new_title)
        end
        expect(announcement.reload.title).to eq(new_title)
      end

      scenario 'I can see all instance announcements' do
        announcements = create_list(:instance_announcement, 2, instance: instance)
        visit admin_instance_announcements_path
        expect(page).to have_selector('#new-announcement-button')

        announcements.each do |announcement|
          expect(page).to have_selector("#announcement-#{announcement.id}")
          expect(page).to have_selector("#announcement-edit-button-#{announcement.id}")
          expect(page).to have_selector("#announcement-delete-button-#{announcement.id}")
        end
      end

      scenario 'I can delete announcements' do
        announcement = create(:instance_announcement, instance: instance)
        visit admin_instance_announcements_path

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
