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
        expect(page).to_not have_selector('.announcement')
      end

      scenario 'I should see instance announcements' do
        announcement = create(:instance_announcement, instance: instance)
        visit announcements_path

        expect(page).to have_selector("#announcement-#{announcement.id}")
      end

      scenario 'I should see system announcements' do
        announcement = create(:system_announcement)
        visit announcements_path

        expect(page).to have_selector("#announcement-#{announcement.id}")
      end

      scenario 'I should see both types of announcements' do
        system_announcement = create(:system_announcement)
        instance_announcement = create(:instance_announcement, instance: instance)

        visit announcements_path

        expect(page).to have_selector("#announcement-#{system_announcement.id}")
        expect(page).to have_selector("#announcement-#{instance_announcement.id}")
      end
    end
  end
end
