# frozen_string_literal: true
# encoding: UTF-8
require 'rails_helper'

RSpec.feature 'Global announcements' do
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

        expect(page).to have_tag('div.global-announcement') do
          with_tag('div.panel-heading', text: format('×%s', announcement.title))
          with_tag('div.panel-body', text: announcement.content)
        end
        expect(page).to have_content_tag_for(announcement)
      end

      scenario 'I should see system announcements' do
        announcement = create(:system_announcement)
        visit announcements_path

        expect(page).to have_tag('div.global-announcement') do
          with_tag('div.panel-heading', text: format('×%s', announcement.title))
          with_tag('div.panel-body', text: announcement.content)
        end
        expect(page).to have_content_tag_for(announcement)
      end

      scenario 'I should see both types of announcements' do
        announcements = 2.downto(-1).flat_map do |i|
          now = Time.zone.now
          [
            create(:instance_announcement, end_at: now + i.minutes, instance: instance),
            create(:system_announcement, start_at: now + i.minutes)
          ]
        end

        visit announcements_path

        expect(page).to have_tag('div.global-announcement') do
          with_tag('div.panel-heading', text: format('×%s', announcements.last.title))
          with_tag('div.panel-body', text: announcements.last.content)
        end

        announcements.select(&:currently_active?).each do |s|
          expect(page).to have_content_tag_for(s)
        end
        announcements.reject(&:currently_active?).each do |s|
          expect(page).not_to have_content_tag_for(s)
        end
      end

      scenario 'I can hide announcements that I have read' do
        announcement = create(:instance_announcement, instance: instance)
        expect(announcement.unread?(user)).to be_truthy

        visit root_path
        find_link(nil, href: announcement_mark_as_read_path(announcement)).click
        expect(announcement.unread?(user)).to be_falsey

        visit root_path
        expect(page).not_to have_selector('div.global-announcement')
      end
    end
  end
end
