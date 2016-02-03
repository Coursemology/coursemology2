# frozen_string_literal: true
require 'rails_helper'

RSpec.describe 'System: Administration: Instance: Announcements', type: :feature do
  describe 'Pagination' do
    subject { page }

    let!(:instance) { create(:instance) }

    with_tenant(:instance) do
      let(:user) { create(:administrator) }

      before do
        create_list(:instance_announcement, 50, instance: instance)

        login_as(user, scope: :user)
        visit admin_instance_announcements_path
      end

      it { is_expected.to have_selector('nav.pagination') }

      it 'lists each announcement' do
        instance.announcements.page(1).each do |announcement|
          expect(page).to have_selector('div', text: announcement.title)
          expect(page).to have_selector('div', text: announcement.content)
        end
      end

      context 'after clicked second page' do
        before { visit admin_instance_announcements_path(page: '2') }

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
