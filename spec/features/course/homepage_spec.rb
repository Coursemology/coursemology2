# frozen_string_literal: true
require 'rails_helper'

RSpec.feature 'Course: Homepage' do
  let(:instance) { create(:instance) }

  with_tenant(:instance) do
    let(:course) { create(:course, :opened) }
    let(:feed_notifications) do
      notifications = []
      # Achievement gained notification
      achievement = create(:course_achievement, course: course)
      achievement_activity = create(:activity, :achievement_gained, object: achievement)
      notifications << create(:course_notification, :feed,
                              activity: achievement_activity,
                              course: course)

      # Assessment attempted notification
      assessment = create(:assessment, course: course)
      assessment_activity = create(:activity, :assessment_attempted, object: assessment)
      notifications << create(:course_notification, :feed,
                              activity: assessment_activity,
                              course: course)

      # Level reached notification
      level = create(:course_level, course: course)
      level_activity = create(:activity, :level_reached, object: level)
      notifications << create(:course_notification, :feed,
                              activity: level_activity,
                              course: course)

      notifications
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
        feed_notifications

        visit course_path(course)
        feed_notifications.each do |notification|
          expect(page).to have_content_tag_for(notification)
        end
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
        feed_notifications

        visit course_path(course)
        feed_notifications.each do |notification|
          expect(page).not_to have_content_tag_for(notification)
        end
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
