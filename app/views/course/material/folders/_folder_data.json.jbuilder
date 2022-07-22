# frozen_string_literal: true

json.subfolders subfolders do |subfolder|
  json.id subfolder.id
  json.name subfolder.name
  json.description subfolder.description
  json.canStudentUpload subfolder.can_student_upload
  json.itemCount subfolder.material_count + subfolder.children_count
  json.updatedAt subfolder.updated_at
  json.startAt subfolder.start_at
  json.endAt subfolder.end_at

  json.effectiveStartAt subfolder.effective_start_at

  json.permissions do
    json.showSdlWarning show_sdl_warning?(subfolder)
    json.canEdit can?(:edit, subfolder)
    json.canDelete can?(:destroy, subfolder)
  end
end

json.materials materials do |material|
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
end
