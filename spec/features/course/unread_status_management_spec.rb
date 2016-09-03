# frozen_string_literal: true
require 'rails_helper'

RSpec.describe 'Course: Announcements', type: :feature do
  describe 'Read/Unread' do
    subject { page }

    let!(:instance) { Instance.default }

    with_tenant(:instance) do
      let!(:first_user) { create(:administrator) }
      let!(:second_user) { create(:administrator) }
      let!(:course) { create(:course) }

      describe 'visit announcement' do
        describe 'index page' do
          self::TEST_NUMBER = 66

          let!(:announcements) do
            create_list(:course_announcement, self.class::TEST_NUMBER, course: course)
          end

          context 'before visiting' do
            it 'remains unread number as TEST_NUMBER' do
              expect(course.announcements.unread_by(first_user).count).to \
                eq(self.class::TEST_NUMBER)
            end
          end

          context 'after visiting' do
            before do
              login_as(first_user)
              visit course_announcements_path(course, page: '2')
            end

            it 'marks announcements in page 2 as read' do
              expect_number = self.class::TEST_NUMBER - course.announcements.page(2).count
              expect(course.announcements.unread_by(first_user).count).to eq(expect_number)
            end
          end
        end
      end

      describe 'sidebar' do
        let!(:announcement) do
          create(:course_announcement, course: course, creator: second_user, updater: first_user)
        end

        before do
          login_as(first_user)
          visit course_path(course)
        end

        it 'shows the correct number of unread items' do
          expect(course.announcements.unread_by(first_user).count).to eq(1)
          expect(page).to have_link(I18n.t('course.announcements.sidebar_title'))
          within find_link(I18n.t('course.announcements.sidebar_title')) do
            find('.unread', text: '1')
          end
        end
      end
    end
  end
end
