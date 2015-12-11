require 'rails_helper'

RSpec.describe 'Course: Announcements', type: :feature do
  describe 'Pagination' do
    subject { page }

    let!(:instance) { create(:instance) }

    with_tenant(:instance) do
      let!(:user) { create(:administrator) }
      let!(:course) { create(:course) }
      let!(:announcements) do
        create_list(:course_announcement, 30, course: course)
      end

      before do
        login_as(user, scope: :user)
      end

      it 'lists each announcement' do
        visit course_announcements_path(course)

        expect(page).to have_selector('nav.pagination')
        course.announcements.sorted_by_sticky.sorted_by_date.page(1).each do |announcement|
          expect(page).to have_selector('div', text: announcement.title)
          expect(page).to have_selector('div', text: announcement.content)
        end
      end

      context 'after clicked second page' do
        before { visit course_announcements_path(course, page: '2') }

        it 'lists each announcement' do
          course.announcements.sorted_by_sticky.sorted_by_date.page(2).each do |announcement|
            expect(page).to have_selector('div', text: announcement.title)
            expect(page).to have_selector('div', text: announcement.content)
          end
        end
      end
    end
  end
end
