# frozen_string_literal: true
require 'rails_helper'

RSpec.feature 'System: Administration: Announcements' do
  let(:instance) { Instance.default }
  with_tenant(:instance) do
    before do
      login_as(user, scope: :user)
    end

    context 'As a system administrator' do
      let(:user) { create(:administrator) }

      scenario 'I can create announcements' do
        visit new_admin_announcement_path

        click_button I18n.t('helpers.submit.system_announcement.create')
        expect(page).to have_button(I18n.t('helpers.submit.system_announcement.create'))
        expect(page).to have_css('div.has-error')

        announcement = attributes_for(:system_announcement)
        fill_in 'system_announcement[title]',    with: announcement[:title]
        fill_in 'system_announcement[content]',  with: announcement[:content]
        fill_in 'system_announcement[start_at]', with: announcement[:start_at]
        fill_in 'system_announcement[end_at]',   with: announcement[:end_at]

        expect do
          click_button I18n.t('helpers.submit.system_announcement.create')
        end.to change(System::Announcement, :count).by(1)
        expect(current_path).to eq(admin_announcements_path)
        expect(page).to have_selector('div',
                                      text: I18n.t('system.admin.announcements.create.success'))
      end

      scenario 'I can edit announcements' do
        announcement = create(:system_announcement)

        visit edit_admin_announcement_path(announcement)

        fill_in 'system_announcement[title]', with: ''
        click_button I18n.t('helpers.submit.system_announcement.update')
        expect(page).to have_css('div.has-error')

        edited_announcement = attributes_for(:system_announcement)
        fill_in 'system_announcement[title]',   with: edited_announcement[:title]
        fill_in 'system_announcement[content]', with: edited_announcement[:content]
        click_button I18n.t('helpers.submit.system_announcement.update')

        expect(current_path).to eq(admin_announcements_path)
        expect(page).to have_selector('div',
                                      text: I18n.t('system.admin.announcements.update.success'))
        expect(announcement.reload.title).to eq(edited_announcement[:title])
        expect(announcement.reload.content).to eq(edited_announcement[:content])
      end

      scenario 'I can see all announcements' do
        create_list(:system_announcement, 2)
        announcements = System::Announcement.ordered_by_date.first(2)
        visit admin_announcements_path

        expect(page).to have_link(nil, href: new_admin_announcement_path)

        announcements.each do |announcement|
          expect(page).to have_content_tag_for(announcement)
          expect(page).to have_link(nil, href: edit_admin_announcement_path(announcement))
          expect(page).to have_link(nil, href: admin_announcement_path(announcement))
        end
      end

      scenario 'I can delete announcements' do
        create(:system_announcement)
        announcement = System::Announcement.ordered_by_date.first
        visit admin_announcements_path

        expect do
          click_link '', href: admin_announcement_path(announcement)
        end.to change(System::Announcement, :count).by(-1)
      end
    end
  end
end
