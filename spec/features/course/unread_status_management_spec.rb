require 'rails_helper'

RSpec.describe 'Announcements read/unread status management', type: :feature do
  subject { page }

  let!(:instance) { create(:instance) }

  with_tenant(:instance) do
    let!(:first_user) { create(:user, role: :administrator) }
    let!(:second_user) { create(:user, role: :administrator) }
    let!(:course) { create(:course) }

    describe 'visit announcement' do
      describe 'index page' do
        TEST_NUMBER = 66

        let!(:announcements) do
          create_list(:course_announcement, TEST_NUMBER, course: course, creator: second_user)
        end

        context 'before visiting' do
          it 'remains unread number as TEST_NUMBER' do
            expect(course.announcements.unread_by(first_user).count).to eq(TEST_NUMBER)
          end
        end

        context 'after visiting' do
          before do
            login_as(first_user)
            visit course_announcements_path(course, page: '2')
          end

          it 'marks announcements in page 2 as read' do
            expect_number = TEST_NUMBER - course.announcements.page(2).count
            expect(course.announcements.unread_by(first_user).count).to eq(expect_number)
          end
        end
      end
    end

    describe 'sidebar' do
      let!(:announcement) { create(:course_announcement, course: course, creator: second_user) }

      before do
        login_as(first_user)
        visit course_achievements_path(course)
      end

      it 'shows the correct number of unread items' do
        expect(course.announcements.unread_by(first_user).count).to eq(1)
        expect(page).to have_link('Announcements (1)')
      end
    end
  end
end
