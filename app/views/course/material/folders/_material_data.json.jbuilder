# frozen_string_literal: true

json.id material.id
json.name material.name
json.description material.description
json.updatedAt material.updated_at

updater = material.updater
json.updater do
  course_user = updater.course_users.find_by(course: controller.current_course)
  if course_user
    json.id course_user.id
    json.name course_user.name
  else
    json.id updater.id
    json.name updater.name
  end
  json.isCourseUser !course_user.nil?
end

json.permissions do
  json.canEdit can?(:edit, material)
  json.canDelete can?(:destroy, material)
end
