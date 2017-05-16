# frozen_string_literal: true
require 'rails_helper'

RSpec.describe 'Course: Announcements', type: :feature do
  describe 'Pagination' do
    subject { page }

    let!(:instance) { Instance.default }

    with_tenant(:instance) do
      let(:announcement_count) { 30 }
      let(:course) { create(:course) }
      let!(:user) { create(:course_manager, course: course).user }
      let!(:announcements) do
        create_list(:course_announcement, announcement_count, course: course)
      end

      before do
        login_as(user, scope: :user)
      end

      it 'lists each announcement' do
        visit course_announcements_path(course)

        expect(page).to have_selector('nav.pagination')
        announcements = course.announcements.sorted_by_sticky.sorted_by_date.page(1)
        announcements.each do |announcement|
          expect(page).to have_selector('div.unread', text: announcement.title)
          expect(page).to have_selector('div.unread', text: announcement.content)
        end

        # In total there are two pages, the test is to ensure that only the announcements in the
        # current page get marked as unread.
        expect(course.announcements.unread_by(user).count).
          to eq(announcement_count - announcements.size)

        # Visit the page again should not reduce the unread count.
        visit course_announcements_path(course)
        expect(course.announcements.unread_by(user).count).
          to eq(announcement_count - announcements.size)
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
