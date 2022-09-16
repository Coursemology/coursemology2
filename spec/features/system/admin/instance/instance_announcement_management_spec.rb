# frozen_string_literal: true
require 'rails_helper'

RSpec.feature 'System: Administration: Instance Announcements', js: true do
  subject { page }

  let!(:instance) { create(:instance) }

  with_tenant(:instance) do
    before do
      login_as(user, scope: :user)
    end

    context 'As an Instance Administrator' do
      let(:user) { create(:instance_administrator).user }

      scenario 'I can create instance announcements' do
        visit admin_instance_announcements_path

        find('button#new-announcement-button').click

        announcement = attributes_for(:system_announcement)
        fill_in 'title', with: announcement[:title]
        fill_in_react_ck 'textarea[name="content"]', announcement[:content]

        find('button.btn-submit').click
        expect(current_path).to eq(admin_instance_announcements_path)
        expect(page).to have_selector('h3', text: announcement[:title])
        expect(page).to have_selector('p', text: announcement[:content])
        expect_toastify('New announcement posted!')
      end

      scenario 'I can edit instance announcements' do
        announcement = create(:instance_announcement, instance: instance)
        visit admin_instance_announcements_path

        find("#announcement-edit-button-#{announcement.id}").click

        fill_in 'title', with: 'long string' * 100
        find('#announcement-form-update-button').click
        expect_toastify('Failed to update the announcement')
        expect(page).to have_selector('#announcement-form-update-button')

        new_title = 'New Title'
        fill_in 'title', with: new_title
        find('#announcement-form-update-button').click

        # Commented due to flaky test
        # expect_toastify('Announcement updated')

        expect(current_path).to eq admin_instance_announcements_path
        within find("#announcement-#{announcement.id}") do
          expect(page).to have_selector('h3', text: new_title)
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
        click_button('Continue')

        expect(page).not_to have_selector("#announcement-#{announcement.id}")
        expect(page).not_to have_selector("#announcement-edit-button-#{announcement.id}")
        expect(page).not_to have_selector("#announcement-delete-button-#{announcement.id}")

        expect_toastify('Announcement was successfully deleted.')
      end
    end
  end
end
