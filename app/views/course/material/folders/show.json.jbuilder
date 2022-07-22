# frozen_string_literal: true

json.id @folder.id
json.parentId @folder.parent_id
json.name @folder.root? ? component.settings.title : @folder.name
json.description @folder.description
json.canStudentUpload @folder.can_student_upload
json.startAt @folder.start_at
json.endAt @folder.end_at

json.partial! 'folder_data',
              subfolders: @subfolders,
              materials: @folder.materials.order(:name).includes(:updater)

json.permissions do
  json.isCurrentCourseStudent current_course_user&.student?
  json.isConcrete @folder.concrete?
  json.canCreateSubfolder can?(:new_subfolder, @folder)
  json.canUpload can?(:upload, @folder)
  json.canEdit can?(:edit, @folder)
end
