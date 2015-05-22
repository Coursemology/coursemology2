require 'rails_helper'

RSpec.describe 'Course: Announcements', type: :feature do
  subject { page }

  let!(:instance) { create(:instance) }

  with_tenant(:instance) do
    let!(:user) { create(:user, role: :administrator) }
    let!(:course) { create(:course) }
    let!(:announcements) do
      create_list(:course_announcement, 50, course: course, creator: user, updater: user)
    end

    before do
      login_as(user, scope: :user)
      visit course_announcements_path(course)
    end

    it { is_expected.to have_selector('nav.pagination') }

    it 'lists each announcement' do
      course.announcements.page(1).each do |announcement|
        expect(page).to have_selector('div', text: announcement.title)
        expect(page).to have_selector('div', text: announcement.content)
      end
    end

    context 'after clicked second page' do
      before { visit course_announcements_path(course, page: '2') }

      it 'lists each announcement' do
        course.announcements.page(2).each do |announcement|
          expect(page).to have_selector('div', text: announcement.title)
          expect(page).to have_selector('div', text: announcement.content)
        end
      end
    end
  end
end
