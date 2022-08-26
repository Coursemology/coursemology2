# frozen_string_literal: true
json.user do
  json.id @user.id
  json.name @user.name.strip
  json.imageUrl user_image(@user)
end

if @current_courses.any?
  json.currentCourses @current_courses.each do |course_user|
    json.partial! 'course_list_data', course_user: course_user
  end
end

if @completed_courses.any?
  json.completedCourses @completed_courses.each do |course_user|
    json.partial! 'course_list_data', course_user: course_user
  end
end

if current_user&.administrator? && @instances.any?
  json.instances @instances.each do |instance|
    json.partial! 'instance_list_data', instance: instance
  end
end
