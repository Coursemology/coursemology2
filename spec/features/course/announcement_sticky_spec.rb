# frozen_string_literal: true
require 'rails_helper'

RSpec.describe 'Course: Announcements', type: :feature, js: true do
  describe 'Sticky' do
    subject { page }

    let!(:instance) { Instance.default }

    with_tenant(:instance) do
      let(:course) { create(:course) }
      let(:user) { create(:course_manager, course: course).user }

      before do
        login_as(user, scope: :user)
      end

      describe 'orders' do
        let!(:published_announcement) do
          create(:course_announcement, course: course, start_at: 1.day.ago)
        end

        let!(:sticky_announcement) do
          create(:course_announcement, course: course, sticky: true)
        end

        let!(:future_announcement) do
          create(:course_announcement, course: course, start_at: 3.days.from_now)
        end

        before { visit course_announcements_path(course) }
        subject { first('div.announcement') }

        it 'shows sticky announcement on top' do
          expect(subject).to have_text(sticky_announcement.title)
        end
      end
    end
  end
end
