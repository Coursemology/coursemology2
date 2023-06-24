# frozen_string_literal: true
require 'rails_helper'

RSpec.feature 'Global announcements', js: true do
  subject { page }
  let(:instance) { Instance.default }

  with_tenant(:instance) do
    let!(:user) { create(:user) }
    before { login_as(user, scope: :user) }

    context 'As a User' do
      before(:each) do
        instance.announcements.clear
        System::Announcement.destroy_all
      end

      scenario 'I should not see any announcements if there are none' do
        visit announcements_path
        expect(page).not_to have_selector('div.global-announcement')
        expect(page).not_to have_selector('div.instance-announcement')
        expect(page).not_to have_selector('div.system-announcement')
      end

      scenario 'I should see instance announcements' do
        announcement = create(:instance_announcement, instance: instance)
        visit announcements_path

        expect(page).to have_text(announcement.title)
        expect(page).to have_text(announcement.content)
      end

      scenario 'I should see system announcements' do
        announcement = create(:system_announcement)
        visit announcements_path

        expect(page).to have_text(announcement.title)
        expect(page).to have_text(announcement.content)
      end

      scenario 'I should see both types of announcements' do
        announcements = 2.downto(-1).flat_map do |i|
          now = Time.zone.now
          [
            create(:instance_announcement,
                   start_at: now - 1.week, end_at: now + i.minutes, instance: instance),
            create(:system_announcement, start_at: now + i.minutes, end_at: now + 1.week)
          ]
        end

        visit announcements_path

        expect(page).to have_text(announcements.last.title)
        expect(page).to have_text(announcements.last.content)

        announcements.select(&:currently_active?).each do |announcement|
          expect(page).to have_selector("div#announcement-#{announcement.id}")
        end
        announcements.reject(&:currently_active?).each do |announcement|
          expect(page).not_to have_selector("div#announcement-#{announcement.id}")
        end
      end
    end
  end
end
