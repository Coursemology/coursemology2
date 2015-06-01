require 'rails_helper'

RSpec.describe 'Administration: Announcements', type: :feature do
  describe 'Pagination' do
    subject { page }

    before { allow(Instance::Announcement).to receive(:default_per_page).and_return(5) }
    let!(:instance) { create(:instance) }

    with_tenant(:instance) do
      let!(:user) { create(:user, role: :administrator) }

      before do
        create_list(:instance_announcement, 10, instance: instance, creator: user, updater: user)

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
end
