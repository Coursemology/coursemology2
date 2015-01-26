require 'rails_helper'

RSpec.describe 'Announcement sticky', type: :feature do
  subject { page }

  let!(:instance) { create(:instance) }

  with_tenant(:instance) do
    let!(:user) { create(:user, role: :administrator) }
    let!(:course) { create(:course) }

    before do
      login_as(user, scope: :user)
    end

    describe 'orders' do
      let!(:published_announcement) do
        create(:course_announcement, course: course, valid_from: 1.day.ago)
      end

      let!(:sticky_announcement) do
        create(:course_announcement, course: course, sticky: true)
      end

      let!(:future_announcement) do
        create(:course_announcement, course: course, valid_from: 3.days.from_now)
      end

      before { visit course_announcements_path(course) }

      it 'shows sticky announcement on top' do
        expect(find(:xpath, '(//div[starts-with(@class,"announcement")])[1]')).
          to have_selector('h2', text: sticky_announcement.title)
      end
    end
  end
end
