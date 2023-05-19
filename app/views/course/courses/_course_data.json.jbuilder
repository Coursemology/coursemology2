# frozen_string_literal: true

json.partial! 'course_list_data', course: current_course

# Course Registration
json.registrationInfo do
  json.partial! 'course/user_registrations/registration'
end

# Instructors
instructors = current_course.managers.without_phantom_users.includes(:user).map(&:user)
json.instructors instructors do |instructor|
  json.id instructor.id
  json.name instructor.name
  json.imageUrl instructor.profile_photo.url
end

if can?(:manage, current_course) || current_course.user?(current_user)
  # Announcements
  if @currently_active_announcements && !@currently_active_announcements.empty?
    json.currentlyActiveAnnouncements @currently_active_announcements do |announcement|
      json.partial! 'announcements/announcement_data', announcement: announcement
    end
  else
    json.currentlyActiveAnnouncements nil
  end

  if @assessment_todos && !@assessment_todos.empty?
    json.assessmentTodos @assessment_todos do |todo|
      json.partial! todo
    end
  else
    json.assessmentTodos nil
  end

  if @video_todos && !@video_todos.empty?
    json.videoTodos @video_todos do |todo|
      json.partial! 'course/lesson_plan/todos/todo', todo: todo
    end
  else
    json.videoTodos nil
  end

  if @survey_todos && !@survey_todos.empty?
    json.surveyTodos @survey_todos do |todo|
      json.partial! 'course/lesson_plan/todos/todo', todo: todo
    end
  else
    json.surveyTodos nil
  end

  # Notifications
  json.notifications @activity_feeds.each do |notification|
    json.partial! notification_view_path(notification),	notification: notification if notification.activity.object
  end
end
