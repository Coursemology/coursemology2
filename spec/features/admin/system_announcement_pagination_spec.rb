require 'rails_helper'

RSpec.describe 'System announcement pagination', type: :feature do
  subject { page }

  let!(:user) { create(:user, role: :administrator) }

  before do
    SystemAnnouncement.delete_all
    create_list(:system_announcement, 50)

    login_as(user, scope: :user)
    visit admin_system_announcements_path
  end

  it { is_expected.to have_selector('nav.pagination') }

  it 'lists each announcement' do
    SystemAnnouncement.page(1).each do |announcement|
      expect(page).to have_selector('div', text: announcement.title)
      expect(page).to have_selector('div', text: announcement.content)
    end
  end

  context 'after clicked second page' do
    before { visit admin_system_announcements_path(page: '2') }

    it 'lists each announcement' do
      SystemAnnouncement.page(2).each do |announcement|
        expect(page).to have_selector('div', text: announcement.title)
        expect(page).to have_selector('div', text: announcement.content)
      end
    end
  end
end
