# frozen_string_literal: true
json.locale I18n.locale
json.timeZone ActiveSupport::TimeZone::MAPPING[user_time_zone]

if user_signed_in?
  my_courses = Course.containing_user(current_user).ordered_by_start_at
  course_last_active_times_hash = CourseUser.for_user(current_user).pluck(:course_id, :last_active_at).to_h

  if my_courses.present?
    json.courses my_courses do |course|
      json.id course.id
      json.title course.title
      json.url course_path(course)
      json.logoUrl url_to_course_logo(course)
      json.lastActiveAt course_last_active_times_hash[course.id]
    end
  end

  json.user do
    json.id current_user.id
    json.name current_user.name
    json.primaryEmail current_user.email
    json.url user_path(current_user)
    json.avatarUrl user_image(current_user)
    json.role current_user.role
    json.instanceRole controller.current_instance_user&.role
    json.canCreateNewCourse can?(:create, Course.new)
  end
end
