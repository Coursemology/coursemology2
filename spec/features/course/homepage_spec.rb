# frozen_string_literal: true
require 'rails_helper'

RSpec.feature 'Course: Homepage' do
  let(:instance) { create(:instance) }

  with_tenant(:instance) do
    let(:course) { create(:course, :opened) }
    let(:achievement_feed_notification) do
      achievement = create(:course_achievement)
      achievement_activity = create(:activity, :achievement_gained, object: achievement)
      create(:course_notification, :feed, activity: achievement_activity, course: course)
    end

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

      scenario 'I am able to see the activity feed in course homepage' do
        achievement_feed_notification

        visit course_path(course)
        expect(page).to have_content_tag_for(achievement_feed_notification)
      end
    end

    context 'As a user not registered for the course' do
      let(:user) { create(:user) }
      scenario 'I am not able to see announcements in course homepage' do
        valid_announcement = create(:course_announcement, course: course)
        visit course_path(course)
        expect(page).not_to have_content_tag_for(valid_announcement)
      end

      scenario 'I am not able to see the activity feed in course homepage' do
        achievement_feed_notification

        visit course_path(course)
        expect(page).not_to have_content_tag_for(achievement_feed_notification)
      end

      scenario 'I am only able to see approved owner and managers in instructors list' do
        manager = create(:course_manager, :approved, course: course)
        teaching_assistant = create(:course_teaching_assistant, :approved, course: course)
        visit course_path(course)
        course.course_users.owner.with_approved_state.each do |course_user|
          expect(page).to have_selector('span.name', text: course_user.user.name)
        end
        expect(page).to have_selector('span.name', text: manager.user.name)
        expect(page).not_to have_selector('span.name', text: teaching_assistant.user.name)
      end
    end
  end
end
