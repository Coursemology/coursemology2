require 'rails_helper'

RSpec.describe 'Instance announcement pagination', type: :feature do
  subject { page }

  let!(:instance) { create(:instance) }

  with_tenant(:instance) do
    let!(:user) { create(:user, role: :administrator) }

    before do
      create_list(:instance_announcement, 50, instance: instance)

      login_as(user, scope: :user)
      visit admin_announcements_path
    end

    it { is_expected.to have_selector('nav.pagination') }

    it 'lists each announcement' do
      instance.announcements.page(1).each do |announcement|
        expect(page).to have_selector('div', text: announcement.title)
        expect(page).to have_selector('div', text: announcement.content)
      end
    end

    context 'after clicked second page' do
      before { visit admin_announcements_path(page: '2') }

      it 'lists each announcement' do
        instance.announcements.page(2).each do |announcement|
          expect(page).to have_selector('div', text: announcement.title)
          expect(page).to have_selector('div', text: announcement.content)
        end
      end
    end
  end
end
