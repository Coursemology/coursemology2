# frozen_string_literal: true
json.courseTitle current_course.title
json.courseUrl course_path(current_course)
json.courseLogoUrl url_to_course_logo(current_course)
json.courseUserUrl url_to_user_or_course_user(current_course, current_course_user)
json.userName current_user&.name

if current_course_user.present? && can?(:read, current_course)
  json.courseUserName current_course_user.name
  json.courseUserRole current_course_user.role
  json.userAvatarUrl user_image(current_course_user.user)

  if can?(:manage, Course::UserEmailUnsubscription.new(course_user: current_course_user))
    json.manageEmailSubscriptionUrl course_user_manage_email_subscription_path(current_course, current_course_user)
  end

  if current_course_user.student? && current_course.gamified?
    json.progress do
      json.partial! 'course_user_progress', course_user: current_course_user
    end
  end

  json.homeRedirectsToLearn @home_redirects_to_learn
end

json.isCourseEnrollable current_course.enrollable?

can_read = can?(:read, current_course)
json.sidebar do
  json.partial! 'sidebar_items', items: controller.sidebar_items(type: :normal), can_read: can_read
end

unless (admin_sidebar_items = controller.sidebar_items(type: :admin)).empty?
  json.adminSidebar do
    json.partial! 'sidebar_items', items: admin_sidebar_items, can_read: can_read
  end
end
