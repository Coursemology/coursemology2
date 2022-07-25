# frozen_string_literal: true
require 'rails_helper'

RSpec.feature 'System: Administration: Instance Announcements' do
  subject { page }

  let!(:instance) { create(:instance) }

  with_tenant(:instance) do
    before do
      login_as(user, scope: :user)
    end

    context 'As an Instance Administrator' do
      let(:user) { create(:instance_administrator).user }

      scenario 'I can create instance announcements' do
        visit new_admin_instance_announcement_path

        click_button I18n.t('helpers.submit.instance/announcement.create')
        expect(page).to have_button(I18n.t('helpers.submit.instance/announcement.create'))
        expect(page).to have_css('div.has-error')

        announcement = build_stubbed(:instance_announcement, instance: instance)
        fill_in 'announcement[title]',    with: announcement.title
        fill_in 'announcement[content]',  with: announcement.content
        fill_in 'announcement[start_at]', with: announcement.start_at
        fill_in 'announcement[end_at]',   with: announcement.end_at
        expect do
          click_button I18n.t('helpers.submit.instance/announcement.create')
        end.to change { Instance::Announcement.count }.by(1)

        expect(page).to have_selector('div.alert.alert-success')
        expect(current_path).to eq(admin_instance_announcements_path)
      end

      scenario 'I can edit instance announcements' do
        announcement = create(:instance_announcement, instance: instance)
        time_zone = user.time_zone || Application.config.x.default_user_time_zone

        visit edit_admin_instance_announcement_path(announcement)

        expect(page).to have_field('announcement[title]', with: announcement.title)
        expect(page).to have_field('announcement[content]', with: announcement.content)
        expect(page).to have_field('announcement[start_at]',
                                   with: announcement.start_at.in_time_zone(time_zone))
        expect(page).to have_field('announcement[end_at]',
                                   with: announcement.end_at.in_time_zone(time_zone))

        fill_in 'announcement[title]', with: ''
        click_button I18n.t('helpers.submit.instance/announcement.update')
        expect(announcement.reload.title).not_to be_empty
        expect(page).to have_button(I18n.t('helpers.submit.instance/announcement.update'))
        expect(page).to have_css('div.has-error')

        new_title = 'New Title'
        new_content = 'New content'

        fill_in 'announcement[title]',        with: new_title
        fill_in 'announcement[content]',      with: new_content
        click_button I18n.t('helpers.submit.instance/announcement.update')

        expect(current_path).to eq admin_instance_announcements_path
        expect(page).to have_selector('div.alert.alert-success')
        expect(announcement.reload.title).to eq(new_title)
        expect(announcement.reload.content).to eq(new_content)
      end

      scenario 'I can see all instance announcements' do
        announcements = create_list(:instance_announcement, 2, instance: instance)
        visit admin_instance_announcements_path(page: Instance::Announcement.page.total_pages)

        expect(page).to have_link(nil, href: new_admin_instance_announcement_path)
        announcements.each do |announcement|
          expect(page).to have_content_tag_for(announcement)
          expect(page).to have_link(nil, href: edit_admin_instance_announcement_path(announcement))
          expect(page).to have_link(nil, href: admin_instance_announcement_path(announcement))
        end
      end

      scenario 'I can delete announcements' do
        announcement = create(:instance_announcement, instance: instance)
        visit admin_instance_announcements_path(page: Instance::Announcement.page.total_pages)

        find_link(nil, href: admin_instance_announcement_path(announcement)).click
        expect(instance.announcements.exists?(announcement.id)).to be(false)
        visit admin_instance_announcements_path(page: Instance::Announcement.page.total_pages)
        expect(page).not_to have_link(nil, href: admin_instance_announcement_path(announcement))
      end
    end
  end
end
