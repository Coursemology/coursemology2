# frozen_string_literal: true
require 'rails_helper'

RSpec.feature 'Course: Homepage' do
  let(:instance) { create(:instance) }

  with_tenant(:instance) do
    let(:course) { create(:course, :opened) }

    before do
      login_as(user, scope: :user)
    end

    context 'As a user registered for the course' do
      let(:user) { create(:course_student, :approved, course: course).user }
      scenario 'I am able to see announcements in course homepage' do
        valid_announcement = create(:course_announcement, course: course)
        visit course_path(course)
        expect(page).to have_content_tag_for(valid_announcement)
      end
    end

    context 'As a user not registered for the course' do
      let(:user) { create(:user) }
      scenario 'I am not able to see announcements in course homepage' do
        valid_announcement = create(:course_announcement, course: course)
        visit course_path(course)
        expect(page).not_to have_content_tag_for(valid_announcement)
      end
    end
  end
end
