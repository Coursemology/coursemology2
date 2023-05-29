# frozen_string_literal: true
if user_signed_in?
  my_courses = Course.containing_user(current_user).ordered_by_start_at
  if my_courses.present?
    json.courses my_courses do |course|
      json.title course.title
      json.url course_path(course)
    end
  end

  json.user do
    json.name current_user.name
    json.url user_path(current_user)
    json.avatarUrl user_image(current_user)
    json.role current_user.role
    json.instanceRole controller.current_instance_user.role
  end

  json.signOutUrl destroy_user_session_path

  if user_masquerade?
    json.masqueradeUserName current_user.name
    json.stopMasqueradingUrl back_masquerade_path(current_user)
  end
end
