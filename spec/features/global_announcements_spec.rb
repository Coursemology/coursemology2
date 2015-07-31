# encoding: UTF-8
require 'rails_helper'

RSpec.feature 'Global announcements' do
  subject { page }
  let(:instance) { create(:instance) }

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
        it { is_expected.not_to have_selector('div.global-announcement') }
        it { is_expected.not_to have_selector('div.instance-announcement') }
        it { is_expected.not_to have_selector('div.system-announcement') }
      end

      scenario 'I should see instance announcements' do
        announcement = create(:instance_announcement, instance: instance)
        visit announcements_path

        expect(page).to have_tag('div.global-announcement') do
          with_tag('div.panel-heading', text: format('×%s', announcement.title))
          with_tag('div.panel-body', text: announcement.content)
        end
        it { is_expected.to have_selector('div.instance-announcement') }
      end

      scenario 'I should see system announcements' do
        announcement = create(:system_announcement)
        visit announcements_path

        expect(page).to have_tag('div.global-announcement') do
          with_tag('div.panel-heading', text: format('×%s', announcement.title))
          with_tag('div.panel-body', text: announcement.content)
        end
        it { is_expected.to have_selector('div.system-announcement') }
      end

      scenario 'I should see both types of announcements' do
        announcements = (-3..0).map do |i|
          now = Time.zone.now
          [
            create(:instance_announcement, end_at: now - i.seconds, instance: instance),
            create(:system_announcement, start_at: now - i.seconds)
          ]
        end
        announcements.flatten!

        visit announcements_path

        expect(page).to have_tag('div.global-announcement') do
          with_tag('div.panel-heading', text: format('×%s', announcements.last.title))
          with_tag('div.panel-body', text: announcements.last.content)
        end

        expect(page).to have_tag('div.global-announcement') do
          with_tag('div.panel-footer',
                   text: I18n.t('layouts.global_announcements.more_announcements'))
        end

        announcements.each do |s|
          type_selector = s.is_a?(System::Announcement) ? 'system' : 'instance'
          it { is_expected.to have_selector("div##{type_selector}_announcement_#{s.id}") }
        end
      end
    end
  end
end
