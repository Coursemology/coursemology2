# frozen_string_literal: true

json.currFolderInfo do
  json.id @folder.id
  json.parentId @folder.parent_id
  json.name @folder.root? ? component.settings.title : @folder.name
  json.description format_ckeditor_rich_text(@folder.description)
  json.isConcrete @folder.concrete?
  json.startAt @folder.start_at
  json.endAt @folder.end_at
end

json.subfolders @subfolders do |subfolder|
  json.id subfolder.id
  json.name subfolder.name
  json.description format_ckeditor_rich_text(subfolder.description)
  json.itemCount subfolder.material_count + subfolder.children_count
  json.updatedAt subfolder.updated_at
  json.startAt subfolder.start_at
  json.endAt subfolder.end_at

  json.effectiveStartAt subfolder.effective_start_at

  json.permissions do
    json.canStudentUpload subfolder.can_student_upload
    json.showSdlWarning show_sdl_warning?(subfolder)
    json.canEdit can?(:edit, subfolder)
    json.canDelete can?(:destroy, subfolder)
  end
end

json.materials @folder.materials.includes(:updater) do |material|
  json.id material.id
  json.name material.name
  json.description format_ckeditor_rich_text(material.description)
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
    json.isCourseUser course_user.present?
  end

  json.permissions do
    json.canEdit can?(:edit, material)
    json.canDelete can?(:destroy, material)
  end
end

json.breadcrumbs @folder.ancestors.reverse << @folder do |folder|
  json.id folder.id
  json.name folder.name == 'Root' ? @settings.title || t('course.material.sidebar_title') : folder.name
end

json.advanceStartAt current_course.advance_start_at_duration

json.permissions do
  json.isCurrentCourseStudent current_course_user&.student?
  json.canStudentUpload @folder.can_student_upload
  json.canCreateSubfolder can?(:new_subfolder, @folder)
  json.canUpload can?(:upload, @folder)
  json.canEdit can?(:edit, @folder)
  json.canEditSubfolders can?(:edit, @subfolders)
end
