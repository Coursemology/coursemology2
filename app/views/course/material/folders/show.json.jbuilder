# frozen_string_literal: true

json.currFolderInfo do
  json.id @folder.id
  json.parentId @folder.parent_id
  json.name @folder.root? ? component.settings.title : @folder.name
  json.description @folder.description
  json.isConcrete @folder.concrete?
  json.startAt @folder.start_at
  json.endAt @folder.end_at
end

json.subfolders @subfolders do |subfolder|
  json.partial! 'subfolder_data',
                subfolder: subfolder
end

json.materials @folder.materials.order(:name).includes(:updater) do |material|
  json.partial! 'material_data',
                material: material
end

json.advanceStartAt current_course.advance_start_at_duration

json.permissions do
  json.isCurrentCourseStudent current_course_user&.student?
  json.canStudentUpload @folder.can_student_upload
  json.canCreateSubfolder can?(:new_subfolder, @folder)
  json.canUpload can?(:upload, @folder)
  json.canEdit can?(:edit, @folder)
end
