require 'rails_helper'

RSpec.feature 'Generic Announcements' do
  subject { page }
  let(:instance) { create(:instance) }

  with_tenant(:instance) do
    let!(:user) { create(:user) }
    before { login_as(user, scope: :user) }

    context 'As a User' do
      before(:each) do
        instance.announcements.clear
        SystemAnnouncement.destroy_all
      end

      scenario 'I should not see any announcements if there are none' do
        visit announcements_path
        it { is_expected.not_to have_selector('div.instance-announcement') }
        it { is_expected.not_to have_selector('div.system-announcement') }
      end

      scenario 'I should see instance announcements' do
        create(:instance_announcement, instance: instance, creator: user, updater: user)
        visit announcements_path
        it { is_expected.to have_selector('div.instance-announcement') }
        it { is_expected.to render_template('index') }
      end

      scenario 'I should see system announcements' do
        create(:system_announcement, creator: user, updater: user)
        visit announcements_path
        it { is_expected.to have_selector('div.system-announcement') }
      end

      scenario 'I should see both types of announcements in the same view' do
        system_announcements = create_list(:system_announcement, 5, creator: user, updater: user)
        instance_announcements = create_list(:instance_announcement, 5,
                                             instance: instance, creator: user, updater: user)
        visit announcements_path

        system_announcements.each do |s|
          it { is_expected.to have_selector("div#system_announcement_#{s.id}") }
        end
        instance_announcements.each do |i|
          it { is_expected.to have_selector("div#instance_announcement_#{i.id}") }
        end
      end
    end
  end
end
