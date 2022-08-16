# frozen_string_literal: true

json.id subfolder.id
json.name subfolder.name
json.description subfolder.description
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
